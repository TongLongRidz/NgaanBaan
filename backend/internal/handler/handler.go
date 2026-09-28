package handler

import (
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/service"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenStr string

		// 1. Check HttpOnly Cookie named user_session_id first
		if cookieToken, err := c.Cookie("user_session_id"); err == nil && cookieToken != "" {
			tokenStr = cookieToken
		} else {
			// 2. Fallback to Authorization Header if cookie not present
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization session token required"})
			c.Abort()
			return
		}

		user, err := repository.ValidateUserSession(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}

func Register(c *gin.Context) {
	var req struct {
		Email     string `json:"email" binding:"required"`
		Password  string `json:"password" binding:"required"`
		Firstname string `json:"firstname" binding:"required"`
		Lastname  string `json:"lastname"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := repository.RegisterUser(req.Email, req.Password, req.Firstname, req.Lastname)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	// Create verification OTP and token upon registration
	otp, token, _ := repository.CreateVerificationCode(user.ID)

	// Send verification email via Resend API
	go service.SendVerificationEmail(user.Email, otp, token)

	// Auto login on register
	_, sessionID, err := repository.LoginUser(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"user": user})
		return
	}

	// Set HttpOnly cookie for session_id
	c.SetCookie("user_session_id", sessionID, 60*60*24*7, "/", "", false, true)

	c.JSON(http.StatusCreated, gin.H{
		"user":               user,
		"token":              sessionID,
		"otp_code":           otp,   // For demonstration / dev testing
		"verification_token": token, // For demonstration / dev testing
	})
}

func Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// Check if email account is currently locked out
	if remainingSec, err := repository.CheckLoginRateLimit(req.Email); err != nil {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":        err.Error(),
			"locked_until": remainingSec,
		})
		return
	}

	user, sessionID, err := repository.LoginUser(req.Email, req.Password)
	if err != nil {
		round, count, _ := repository.RecordLoginAttempt(req.Email, req.Password, ipAddress, userAgent, false, err.Error())
		msg := err.Error()
		if count >= 5 {
			msg = "Tried 5 times incorrectly. Account locked for 30 seconds."
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":  msg,
			"round":  round,
			"count":  count,
		})
		return
	}

	repository.RecordLoginAttempt(req.Email, req.Password, ipAddress, userAgent, true, "Login successful")

	// Ensure OTP code is generated if user is not yet verified
	var otp, token string
	if !user.IsEmailVerified {
		otp, token, _ = repository.CreateVerificationCode(user.ID)
		go service.SendVerificationEmail(user.Email, otp, token)
	}

	// Set HttpOnly cookie for session_id
	c.SetCookie("user_session_id", sessionID, 60*60*24*7, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"user":               user,
		"token":              sessionID,
		"otp_code":           otp,
		"verification_token": token,
	})
}

func Logout(c *gin.Context) {
	c.SetCookie("user_session_id", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func VerifyOTP(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	var req struct {
		OTPCode string `json:"otp_code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP code is required"})
		return
	}

	if err := repository.VerifyOTPCode(user.ID, req.OTPCode); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.IsEmailVerified = true
	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified successfully",
		"user":    user,
	})
}

func VerifyTokenLink(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token required"})
		return
	}

	user, err := repository.VerifyToken(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified successfully via link",
		"user":    user,
	})
}

func ResendOTP(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	otp, token, err := repository.ResendVerificationCode(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resend verification code"})
		return
	}

	// Dispatch email via Resend API
	go service.SendVerificationEmail(user.Email, otp, token)

	c.JSON(http.StatusOK, gin.H{
		"message":            "Verification code resent successfully",
		"otp_code":           otp,
		"verification_token": token,
	})
}

func GetMe(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := userVal.(*model.User)
	c.JSON(http.StatusOK, user)
}

func GetProjects(c *gin.Context) {
	projects, err := repository.GetAllProjects()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func CreateProject(c *gin.Context) {
	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	project, err := repository.CreateProject(req.Title, req.Description, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func GetProjectByID(c *gin.Context) {
	id := c.Param("id")
	project, err := repository.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	columns, _ := repository.GetProjectColumns(id)
	activities, _ := repository.GetProjectActivities(id)
	members, _ := repository.GetProjectMembers(id)

	c.JSON(http.StatusOK, gin.H{
		"project":    project,
		"columns":    columns,
		"activities": activities,
		"members":    members,
	})
}

func ToggleSubtask(c *gin.Context) {
	subtaskID := c.Param("id")
	err := repository.ToggleSubtask(subtaskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func GetStarredProjects(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	projects, err := repository.GetStarredProjects(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func ToggleStarProject(c *gin.Context) {
	projectID := c.Param("id")
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	isStarred, err := repository.ToggleStarProject(user.ID, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_starred": isStarred})
}

func SendTestEmail(c *gin.Context) {
	var req struct {
		Recipient   string `json:"recipient" binding:"required"`
		Subject     string `json:"subject"`
		Title       string `json:"title"`
		Content     string `json:"content"`
		OTPCode     string `json:"otp_code"`
		VerifyLink  string `json:"verify_link"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := service.SendCustomEmail(
		req.Recipient,
		req.Subject,
		req.Title,
		req.Content,
		req.OTPCode,
		req.VerifyLink,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email sent successfully",
		"preview_html": service.BuildCustomEmailHTML(req.Title, req.Content, req.OTPCode, req.VerifyLink),
	})
}

