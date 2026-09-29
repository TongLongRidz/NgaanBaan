package repository

import (
	"backend/internal/model"
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	MongoClient *mongo.Client
	MongoCollection *mongo.Collection
	VerificationAuditCollection *mongo.Collection
)

func InitMongo() {
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "ngaanbaan_logs"
	}

	// Host for running outside docker compose pointing to localhost
	host := os.Getenv("MONGO_HOST")
	if host == "" || host == "mongodb" {
		host = "localhost"
	}
	port := os.Getenv("MONGO_PORT")
	if port == "" {
		port = "27010"
	}
	user := os.Getenv("MONGO_INITDB_ROOT_USERNAME")
	if user == "" {
		user = "ngaanbaan_mongo_user"
	}
	pass := os.Getenv("MONGO_INITDB_ROOT_PASSWORD")
	if pass == "" {
		pass = "ngaanbaan_mongo_password"
	}

	mongoURI = fmt.Sprintf("mongodb://%s:%s@%s:%s/%s?authSource=admin", user, pass, host, port, dbName)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Printf("Warning: Failed to create MongoDB client: %v", err)
		return
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Printf("Warning: MongoDB ping failed: %v", err)
	} else {
		log.Println("Successfully connected to MongoDB database")
	}

	MongoClient = client
	MongoCollection = client.Database(dbName).Collection("login_audit_logs")
	VerificationAuditCollection = client.Database(dbName).Collection("email_verification_logs")
	PasswordResetAuditCollection = client.Database(dbName).Collection("password_reset_logs")
}

var (
	PasswordResetAuditCollection *mongo.Collection
)

// Password Reset Rate Limiter (Max 3 requests per 1 hour per Account & per IP)
type ResetLimitTracker struct {
	Count     int
	FirstSeen time.Time
}

var (
	resetMutex       sync.Mutex
	accountResetMap = make(map[string]*ResetLimitTracker) // Key: email
	ipResetMap      = make(map[string]*ResetLimitTracker) // Key: IP
)

// CheckAndRecordResetRateLimit enforces 3 password reset requests per hour limit on email and IP
func CheckAndRecordResetRateLimit(email, ip string) error {
	resetMutex.Lock()
	defer resetMutex.Unlock()

	now := time.Now()

	// Check Account Limit
	accTracker, exists := accountResetMap[email]
	if !exists || now.Sub(accTracker.FirstSeen) >= 1*time.Hour {
		accountResetMap[email] = &ResetLimitTracker{Count: 1, FirstSeen: now}
	} else {
		if accTracker.Count >= 3 {
			remainingMin := int(time.Until(accTracker.FirstSeen.Add(1*time.Hour)).Minutes()) + 1
			return fmt.Errorf("ขอรีเซ็ตรหัสผ่านเกินโควต้า 3 ครั้ง/ชั่วโมง กรุณาลองใหม่ในอีก %d นาที", remainingMin)
		}
		accTracker.Count++
	}

	// Check IP Limit
	ipTracker, exists := ipResetMap[ip]
	if !exists || now.Sub(ipTracker.FirstSeen) >= 1*time.Hour {
		ipResetMap[ip] = &ResetLimitTracker{Count: 1, FirstSeen: now}
	} else {
		if ipTracker.Count >= 3 {
			remainingMin := int(time.Until(ipTracker.FirstSeen.Add(1*time.Hour)).Minutes()) + 1
			return fmt.Errorf("IP ของคุณขอรีเซ็ตรหัสผ่านเกินโควต้า 3 ครั้ง/ชั่วโมง กรุณาลองใหม่ในอีก %d นาที", remainingMin)
		}
		ipTracker.Count++
	}

	return nil
}

// RecordPasswordResetLog records reset activities to MongoDB
func RecordPasswordResetLog(userID, email, action, ipAddress, userAgent string) {
	if PasswordResetAuditCollection == nil {
		return
	}

	logEntry := model.PasswordResetAuditLog{
		UserID:    userID,
		Email:     email,
		Action:    action,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		Timestamp: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := PasswordResetAuditCollection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Printf("Failed to insert MongoDB password reset audit log: %v", err)
	}
}

// RecordEmailVerificationLog stores MongoDB log when a user successfully verifies their email via OTP or link
func RecordEmailVerificationLog(userID, email, method, ipAddress, userAgent string) {
	if VerificationAuditCollection == nil {
		return
	}

	logEntry := model.EmailVerificationAuditLog{
		UserID:     userID,
		Email:      email,
		Method:     method,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
		VerifiedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := VerificationAuditCollection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Printf("Failed to insert MongoDB email verification audit log: %v", err)
	}
}

// In-Memory Rate Limiter & Counter (Redis-like behavior)
type LoginTracker struct {
	TotalAttempts int       // ครั้งที่เท่าไหร่ในรอบปัจจุบัน
	TotalRounds   int       // รอบที่เท่าไหร่
	LockedUntil   time.Time // เวลาล็อกถึงเมื่อไหร่ (ล็อก 30 วินาทีเมื่อผิดครบ 5 ครั้ง)
}

var (
	trackerMutex sync.Mutex
	trackers     = make(map[string]*LoginTracker)
)

// CheckLoginRateLimit checks if the email is locked out. Returns remaining lock seconds and error if locked.
func CheckLoginRateLimit(email string) (int, error) {
	trackerMutex.Lock()
	defer trackerMutex.Unlock()

	tracker, exists := trackers[email]
	if !exists {
		return 0, nil
	}

	now := time.Now()
	if now.Before(tracker.LockedUntil) {
		remainingSec := int(time.Until(tracker.LockedUntil).Seconds()) + 1
		return remainingSec, fmt.Errorf("Too many failed attempts. Account locked for %d seconds", remainingSec)
	}

	return 0, nil
}

// RecordLoginAttempt updates rate limiting, rounds, attempt count, and logs to MongoDB.
func RecordLoginAttempt(email, password, ipAddress, userAgent string, isSuccess bool, reason string) (int, int, error) {
	trackerMutex.Lock()
	
	tracker, exists := trackers[email]
	if !exists {
		tracker = &LoginTracker{
			TotalAttempts: 0,
			TotalRounds:   1,
		}
		trackers[email] = tracker
	}

	// Check if previous lock has expired, reset attempt counter for new round if needed
	now := time.Now()
	if !tracker.LockedUntil.IsZero() && now.After(tracker.LockedUntil) {
		tracker.TotalAttempts = 0
		tracker.LockedUntil = time.Time{}
	}

	if isSuccess {
		if reason == "" {
			reason = "Authentication successful"
		}
		tracker.TotalAttempts++
		attemptTime := tracker.TotalAttempts
		attemptRound := tracker.TotalRounds
		
		// Reset count on success
		tracker.TotalAttempts = 0
		trackerMutex.Unlock()

		// Async write log to Mongo (do not store password on successful login)
		go saveAuditLog(email, "", attemptRound, attemptTime, "success", reason, ipAddress, userAgent)
		return attemptRound, attemptTime, nil
	}

	// Failed Attempt
	if reason == "" {
		reason = "Invalid email or password"
	}
	tracker.TotalAttempts++
	attemptTime := tracker.TotalAttempts
	attemptRound := tracker.TotalRounds

	if tracker.TotalAttempts >= 5 {
		reason = fmt.Sprintf("%s (Attempt 5/5: Account locked for 30 seconds)", reason)
		tracker.LockedUntil = now.Add(30 * time.Second)
		tracker.TotalRounds++
	}

	trackerMutex.Unlock()

	// Async write log to Mongo
	go saveAuditLog(email, password, attemptRound, attemptTime, "failed", reason, ipAddress, userAgent)

	return attemptRound, attemptTime, nil
}

func saveAuditLog(email, password string, round, count int, status, reason, ipAddress, userAgent string) {
	if MongoCollection == nil {
		return
	}

	logEntry := model.LoginAuditLog{
		Timestamp:         time.Now(),
		AttemptedEmail:    email,
		AttemptedPassword: password,
		AttemptedRound:    round,
		AttemptedTime:     count,
		Status:            status,
		Reason:            reason,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := MongoCollection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Printf("Failed to insert MongoDB audit log: %v", err)
	}
}
