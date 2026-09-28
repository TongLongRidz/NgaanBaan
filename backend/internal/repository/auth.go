package repository

import (
	"backend/internal/model"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(email, password, firstname, lastname string) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var user model.User
	query := `
		INSERT INTO users (email, password_hash, firstname, lastname, auth_provider)
		VALUES ($1, $2, $3, $4, 'local')
		RETURNING id, email, firstname, COALESCE(lastname, ''), COALESCE(avatar_url, ''), status, is_email_verified, last_active, created_at
	`
	err = DB.QueryRow(query, email, string(hashedPassword), firstname, lastname).Scan(
		&user.ID, &user.Email, &user.Firstname, &user.Lastname, &user.AvatarURL, &user.Status, &user.IsEmailVerified, &user.LastActive, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func LoginUser(email, password string) (*model.User, string, error) {
	var user model.User
	var passwordHash string

	query := `
		SELECT id, email, password_hash, firstname, COALESCE(lastname, ''), COALESCE(avatar_url, ''), status, is_email_verified, last_active, created_at
		FROM users
		WHERE email = $1
	`
	err := DB.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &passwordHash, &user.Firstname, &user.Lastname, &user.AvatarURL, &user.Status, &user.IsEmailVerified, &user.LastActive, &user.CreatedAt,
	)
	if err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Create user session token
	sessionID, err := CreateUserSession(user.ID, "Web Browser")
	if err != nil {
		return nil, "", err
	}

	return &user, sessionID, nil
}

func CreateUserSession(userID, userAgent string) (string, error) {
	// Generate token hash
	tokenRaw := fmt.Sprintf("%s-%d", userID, time.Now().UnixNano())
	hash := sha256.Sum256([]byte(tokenRaw))
	tokenHash := hex.EncodeToString(hash[:])

	expiresAt := time.Now().Add(30 * 24 * time.Hour) // 30 days session

	var sessionID string
	query := `
		INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	err := DB.QueryRow(query, userID, tokenHash, userAgent, expiresAt).Scan(&sessionID)
	if err != nil {
		return "", err
	}

	return sessionID, nil
}

func ValidateUserSession(sessionID string) (*model.User, error) {
	var user model.User
	query := `
		SELECT u.id, u.email, u.firstname, COALESCE(u.lastname, ''), COALESCE(u.avatar_url, ''), u.status, u.is_email_verified, u.last_active, u.created_at
		FROM user_sessions s
		JOIN users u ON s.user_id = u.id
		WHERE s.id = $1 AND (s.expires_at > NOW()) AND (s.revoked_at IS NULL)
	`
	err := DB.QueryRow(query, sessionID).Scan(
		&user.ID, &user.Email, &user.Firstname, &user.Lastname, &user.AvatarURL, &user.Status, &user.IsEmailVerified, &user.LastActive, &user.CreatedAt,
	)
	if err != nil {
		return nil, errors.New("unauthorized or expired session")
	}

	return &user, nil
}

// CreateVerificationCode generates 6-digit OTP & UUID verification token for user
func CreateVerificationCode(userID string) (string, string, error) {
	// Delete previous verification codes for this user
	_, _ = DB.Exec("DELETE FROM email_verifications WHERE user_id = $1", userID)

	otp := fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	tokenRaw := fmt.Sprintf("verify-%s-%d", userID, time.Now().UnixNano())
	hash := sha256.Sum256([]byte(tokenRaw))
	token := hex.EncodeToString(hash[:])
	expiresAt := time.Now().Add(15 * time.Minute)

	query := `
		INSERT INTO email_verifications (user_id, otp_code, token, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := DB.Exec(query, userID, otp, token, expiresAt)
	if err != nil {
		return "", "", err
	}

	return otp, token, nil
}

// VerifyOTPCode verifies user 6-digit OTP code
func VerifyOTPCode(userID, otp string) error {
	var verifiedID string
	query := `
		SELECT id FROM email_verifications
		WHERE user_id = $1 AND otp_code = $2 AND expires_at > NOW()
	`
	err := DB.QueryRow(query, userID, otp).Scan(&verifiedID)
	if err != nil {
		return errors.New("invalid or expired OTP verification code")
	}

	// Update user is_email_verified = TRUE
	_, err = DB.Exec("UPDATE users SET is_email_verified = TRUE WHERE id = $1", userID)
	if err != nil {
		return err
	}

	// Clean up verification records
	_, _ = DB.Exec("DELETE FROM email_verifications WHERE user_id = $1", userID)
	return nil
}

// VerifyToken verifies link token directly
func VerifyToken(token string) (*model.User, error) {
	var userID string
	query := `
		SELECT user_id FROM email_verifications
		WHERE token = $1 AND expires_at > NOW()
	`
	err := DB.QueryRow(query, token).Scan(&userID)
	if err != nil {
		return nil, errors.New("invalid or expired verification link")
	}

	// Update user is_email_verified = TRUE
	var user model.User
	updateQuery := `
		UPDATE users SET is_email_verified = TRUE WHERE id = $1
		RETURNING id, email, firstname, COALESCE(lastname, ''), COALESCE(avatar_url, ''), status, is_email_verified, last_active, created_at
	`
	err = DB.QueryRow(updateQuery, userID).Scan(
		&user.ID, &user.Email, &user.Firstname, &user.Lastname, &user.AvatarURL, &user.Status, &user.IsEmailVerified, &user.LastActive, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Clean up verification records
	_, _ = DB.Exec("DELETE FROM email_verifications WHERE user_id = $1", userID)
	return &user, nil
}

// ResendVerificationCode generates new OTP and token for user
func ResendVerificationCode(userID string) (string, string, error) {
	return CreateVerificationCode(userID)
}
