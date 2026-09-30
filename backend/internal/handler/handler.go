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

		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}

		if tokenStr == "" {
			if cookieToken, err := c.Cookie("refresh_token"); err == nil && cookieToken != "" {
				tokenStr = cookieToken
			} else if cookieToken, err := c.Cookie("user_session_id"); err == nil && cookieToken != "" {
				tokenStr = cookieToken
			}
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		// 1. Try validating Access Token (JWT 15m)
		claims, err := service.ValidateAccessToken(tokenStr)
		if err == nil && claims != nil {
			user, userErr := repository.GetUserByID(claims.UserID)
			if userErr == nil {
				c.Set("user", user)
				c.Next()
				return
			}
		}

		// 2. Fallback to DB session token validation
		user, err := repository.ValidateUserSession(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized or expired session"})
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
		Lastname  string `json:"lastname" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Firstname) == "" || strings.TrimSpace(req.Lastname) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	user, err := repository.RegisterUser(req.Email, req.Password, req.Firstname, req.Lastname)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	otp, token, _ := repository.CreateVerificationCode(user.ID)

	accessToken, expiresIn, _ := service.GenerateAccessToken(user.ID, user.Email)
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID)

	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/api/auth", "", false, true)
	c.SetCookie("user_session_id", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	c.JSON(http.StatusCreated, gin.H{
		"access_token":       accessToken,
		"token_type":         "Bearer",
		"expires_in":         expiresIn,
		"user":               user,
		"otp_code":           otp,
		"verification_token": token,
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

	if remainingSec, err := repository.CheckLoginRateLimit(req.Email); err != nil {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":        err.Error(),
			"locked_until": remainingSec,
		})
		return
	}

	user, _, err := repository.LoginUser(req.Email, req.Password)
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

	accessToken, expiresIn, err := service.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	var otp, token string

	// Always set session cookies so user can call protected endpoints like resend-otp
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID)
	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/api/auth", "", false, true)
	c.SetCookie("user_session_id", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	if !user.IsEmailVerified {
		otp, token, _ = repository.CreateVerificationCode(user.ID)
	}


	c.JSON(http.StatusOK, gin.H{
		"access_token":       accessToken,
		"token_type":         "Bearer",
		"expires_in":         expiresIn,
		"user":               user,
		"otp_code":           otp,
		"verification_token": token,
	})
}

func RefreshToken(c *gin.Context) {
	plainRefreshToken, err := c.Cookie("refresh_token")
	if err != nil || plainRefreshToken == "" {
		plainRefreshToken, err = c.Cookie("user_session_id")
	}

	if err != nil || plainRefreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token cookie required"})
		return
	}

	newPlainToken, userID, rotateErr := repository.RotateRefreshToken(plainRefreshToken)
	if rotateErr != nil {
		if rotateErr.Error() == "REUSE_DETECTED" {
			c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
			c.SetCookie("user_session_id", "", -1, "/", "", false, true)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Security alert: Refresh token reuse detected. All active sessions have been revoked.",
			})
			return
		}

		c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
		c.SetCookie("user_session_id", "", -1, "/", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	user, err := repository.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	newAccessToken, expiresIn, err := service.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to issue access token"})
		return
	}

	c.SetCookie("refresh_token", newPlainToken, 60*60*24*7, "/api/auth", "", false, true)
	c.SetCookie("user_session_id", newPlainToken, 60*60*24*7, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"token_type":   "Bearer",
		"expires_in":   expiresIn,
		"user":         user,
	})
}

func Logout(c *gin.Context) {
	if plainToken, err := c.Cookie("refresh_token"); err == nil && plainToken != "" {
		_ = repository.RevokeRefreshToken(plainToken)
	}
	if plainToken, err := c.Cookie("user_session_id"); err == nil && plainToken != "" {
		_ = repository.RevokeRefreshToken(plainToken)
	}

	c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
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

	// Issue user_session cookies ONLY now when user is fully verified
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID)
	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/api/auth", "", false, true)
	c.SetCookie("user_session_id", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	newAccessToken, expiresIn, _ := service.GenerateAccessToken(user.ID, user.Email)

	// MongoDB Audit Log for Email Verification
	go repository.RecordEmailVerificationLog(user.ID, user.Email, "otp", c.ClientIP(), c.GetHeader("User-Agent"))

	c.JSON(http.StatusOK, gin.H{
		"message":      "Email verified successfully",
		"access_token": newAccessToken,
		"token_type":   "Bearer",
		"expires_in":   expiresIn,
		"user":         user,
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

	// Issue user_session cookies ONLY now when user is fully verified via link
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID)
	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/api/auth", "", false, true)
	c.SetCookie("user_session_id", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	newAccessToken, expiresIn, _ := service.GenerateAccessToken(user.ID, user.Email)

	// MongoDB Audit Log for Email Verification via Link
	go repository.RecordEmailVerificationLog(user.ID, user.Email, "link", c.ClientIP(), c.GetHeader("User-Agent"))

	c.JSON(http.StatusOK, gin.H{
		"message":      "Email verified successfully via link",
		"access_token": newAccessToken,
		"token_type":   "Bearer",
		"expires_in":   expiresIn,
		"user":         user,
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

func RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุอีเมล"})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// Rate Limit Check (Max 3 requests / 1 hour per account & per IP)
	if err := repository.CheckAndRecordResetRateLimit(req.Email, ipAddress); err != nil {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": err.Error()})
		return
	}

	user, err := repository.GetUserByEmail(req.Email)
	if err != nil {
		// Return generic success for privacy (prevent user enumeration)
		c.JSON(http.StatusOK, gin.H{
			"message": "หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว",
		})
		return
	}

	token, err := repository.CreatePasswordResetToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการสร้างลิงก์รีเซ็ต"})
		return
	}

	// Dispatch reset email asynchronously
	go service.SendPasswordResetEmail(user.Email, token)
	go repository.RecordPasswordResetLog(user.ID, user.Email, "request", ipAddress, userAgent)

	c.JSON(http.StatusOK, gin.H{
		"message":     "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว",
		"reset_token": token, // Included for local dev convenience
	})
}

func ConfirmPasswordReset(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบถ้วน"})
		return
	}

	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"})
		return
	}

	user, err := repository.ResetUserPassword(req.Token, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	go repository.RecordPasswordResetLog(user.ID, user.Email, "reset_success", ipAddress, userAgent)

	c.JSON(http.StatusOK, gin.H{
		"message": "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
	})
}

func ValidatePasswordResetToken(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"error": "ไม่พบโทเค็นรีเซ็ตรหัสผ่าน",
		})
		return
	}

	isValid := repository.ValidatePasswordResetToken(token)
	if !isValid {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"error": "ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุแล้ว หรือถูกใช้งานไปแล้ว",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"message": "โทเค็นถูกต้อง",
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

