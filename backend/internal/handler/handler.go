package handler

import (
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/service"
	"net/http"
	"strconv"
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

		// Block unverified users from accessing protected endpoints except for OTP verification & resend
		path := c.Request.URL.Path
		if !user.IsEmailVerified && path != "/api/auth/verify-otp" && path != "/api/auth/resend-otp" && path != "/api/auth/me" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Email verification required",
				"user":  user,
			})
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

	if remainingSec, err := repository.CheckLoginRateLimit(ipAddress); err != nil {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":        err.Error(),
			"locked_until": remainingSec,
		})
		return
	}

	user, _, err := repository.LoginUser(req.Email, req.Password)
	if err != nil {
		round, count, _ := repository.RecordLoginAttempt(req.Email, ipAddress, userAgent, false, err.Error())
		msg := err.Error()
		if count >= 5 {
			msg = "Tried 5 times incorrectly from this IP. Blocked for 30 seconds."
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":  msg,
			"round":  round,
			"count":  count,
		})
		return
	}

	repository.RecordLoginAttempt(req.Email, ipAddress, userAgent, true, "Login successful")

	accessToken, expiresIn, err := service.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	var otp, token string

	if (user.IsEmailVerified) {
		plainRefreshToken, _ := repository.CreateRefreshToken(user.ID, userAgent, ipAddress)
		c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
		c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/", "", false, true)
	} else {
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token cookie required"})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	newPlainToken, userID, rotateErr := repository.RotateRefreshToken(plainRefreshToken, userAgent, ipAddress)
	if rotateErr != nil {
		if rotateErr.Error() == "REUSE_DETECTED" {
			c.SetCookie("refresh_token", "", -1, "/", "", false, true)
			c.SetCookie("user_session_id", "", -1, "/", "", false, true) // Clear legacy cookie if present
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Security alert: Refresh token reuse detected. All active sessions have been revoked.",
			})
			return
		}

		c.SetCookie("refresh_token", "", -1, "/", "", false, true)
		c.SetCookie("user_session_id", "", -1, "/", "", false, true) // Clear legacy cookie if present
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

	c.SetCookie("refresh_token", newPlainToken, 60*60*24*7, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"token_type":   "Bearer",
		"expires_in":   expiresIn,
		"user":         user,
	})
}

func Logout(c *gin.Context) {
	if plainToken, err := c.Cookie("refresh_token"); err == nil && plainToken != "" {
		if user, err := repository.ValidateUserSession(plainToken); err == nil {
			_ = repository.UpdateUserStatus(user.ID, "offline")
		}
		_ = repository.RevokeRefreshToken(plainToken)
	}
	if userVal, exists := c.Get("user"); exists {
		if user, ok := userVal.(*model.User); ok {
			_ = repository.UpdateUserStatus(user.ID, "offline")
		}
	}

	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
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

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	if err := repository.VerifyOTPCode(user.ID, req.OTPCode); err != nil {
		repository.RecordLoginAttempt(user.Email, ipAddress, userAgent, false, "OTP verification failed: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.IsEmailVerified = true

	// Issue refresh_token cookie ONLY now when user is fully verified
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID, userAgent, ipAddress)
	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	newAccessToken, expiresIn, _ := service.GenerateAccessToken(user.ID, user.Email)

	// MongoDB Audit Logs (Both login_audit_logs and email_verification_logs)
	repository.RecordLoginAttempt(user.Email, ipAddress, userAgent, true, "OTP verification & login successful")
	go repository.RecordEmailVerificationLog(user.ID, user.Email, "otp", ipAddress, userAgent)

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

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	user, err := repository.VerifyToken(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Issue refresh_token cookie ONLY now when user is fully verified via link
	plainRefreshToken, _ := repository.CreateRefreshToken(user.ID, userAgent, ipAddress)
	c.SetCookie("refresh_token", plainRefreshToken, 60*60*24*7, "/", "", false, true)

	newAccessToken, expiresIn, _ := service.GenerateAccessToken(user.ID, user.Email)

	// MongoDB Audit Logs (Both login_audit_logs and email_verification_logs)
	repository.RecordLoginAttempt(user.Email, ipAddress, userAgent, true, "Email link verification & login successful")
	go repository.RecordEmailVerificationLog(user.ID, user.Email, "link", ipAddress, userAgent)

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
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	projects, err := repository.GetUserProjects(user.ID)
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

	_ = repository.TrackProjectView(user.ID, project.ID)

	c.JSON(http.StatusCreated, project)
}

func GetProjectByID(c *gin.Context) {
	id := c.Param("id")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	user := userVal.(*model.User)

	// Fetch project ONLY if current user is a member in project_members
	project, err := repository.GetUserProjectByID(id, user.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	_ = repository.TrackProjectView(user.ID, id)

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

func GetRecentProjects(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page := 1
	limit := 10
	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}

	projects, total, err := repository.GetUserRecentProjects(user.ID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"projects":    projects,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
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

func GetPinnedProjects(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	projects, err := repository.GetPinnedProjects(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func TogglePinProject(c *gin.Context) {
	projectID := c.Param("id")
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	isPinned, err := repository.TogglePinProject(user.ID, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_pinned": isPinned})
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

func CreateProjectInviteLink(c *gin.Context) {
	projectID := c.Param("id")
	var req struct {
		Role string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || (req.Role != "Editor" && req.Role != "Viewer") {
		req.Role = "Editor"
	}

	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	token, _ := service.GenerateSecureToken(16)
	inv, err := repository.CreateProjectInvitation(projectID, user.ID, strings.ToLower(req.Role), token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      inv.Token,
		"role":       inv.Role,
		"expires_at": inv.ExpiresAt,
	})
}

func RemoveProjectMember(c *gin.Context) {
	projectID := c.Param("id")
	targetUserID := c.Param("userId")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := userVal.(*model.User)

	err := repository.RemoveProjectMember(projectID, targetUserID, user.ID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}

func UpdateProjectMemberRole(c *gin.Context) {
	projectID := c.Param("id")
	targetUserID := c.Param("userId")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := userVal.(*model.User)

	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := repository.UpdateProjectMemberRole(projectID, targetUserID, user.ID, req.Role)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member role updated successfully"})
}

func UpdateProjectVisibility(c *gin.Context) {
	projectID := c.Param("id")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := userVal.(*model.User)

	var req struct {
		Visibility string `json:"visibility" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Visibility != "private" && req.Visibility != "specific_people" && req.Visibility != "anyone_with_link" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid visibility option"})
		return
	}

	err := repository.UpdateProjectVisibility(projectID, user.ID, req.Visibility)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project visibility updated successfully", "visibility": req.Visibility})
}

func ValidateInviteToken(c *gin.Context) {
	token := c.Param("token")
	inv, err := repository.GetInvitationByToken(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired invitation link"})
		return
	}

	proj, err := repository.GetProjectByID(inv.ProjectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"project_id":   proj.ID,
		"project_name": proj.Title,
		"role":         inv.Role,
		"expires_at":   inv.ExpiresAt,
	})
}

func JoinProjectByToken(c *gin.Context) {
	token := c.Param("token")
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	inv, err := repository.GetInvitationByToken(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired invitation link"})
		return
	}

	err = repository.AcceptProjectInvitation(user.ID, inv.ProjectID, inv.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Successfully joined project",
		"project_id": inv.ProjectID,
		"role":       inv.Role,
	})
}

func UpdateUserStatus(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*model.User)

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if req.Status != "active" && req.Status != "away" && req.Status != "offline" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	if err := repository.UpdateUserStatus(user.ID, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "user_status": req.Status})
}

func GetMyTasks(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page := 1
	limit := 10
	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}

	tasks, total, err := repository.GetUserAssignedTasks(user.ID, page, limit)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"tasks":       []model.MyTaskItem{},
			"total":       0,
			"page":        page,
			"limit":       limit,
			"total_pages": 1,
		})
		return
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks":       tasks,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}


