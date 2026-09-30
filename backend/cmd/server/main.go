package main

import (
	"backend/internal/handler"
	"backend/internal/repository"
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from root or backend directory if exists
	if err := godotenv.Load("../.env"); err != nil {
		_ = godotenv.Load(".env")
	}

	// Initialize PostgreSQL Database connection
	repository.InitDB()
	// Initialize MongoDB connection
	repository.InitMongo()

	r := gin.Default()

	// Enable CORS for Next.js frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Cookie"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
		AllowCredentials: true,
	}))

	// Public Auth Routes
	r.POST("/api/auth/register", handler.Register)
	r.POST("/api/auth/login", handler.Login)
	r.POST("/api/auth/refresh", handler.RefreshToken)
	r.POST("/api/auth/logout", handler.Logout)
	r.GET("/api/auth/verify-link", handler.VerifyTokenLink)
	r.POST("/api/auth/email-test", handler.SendTestEmail)
	r.POST("/api/auth/forgot-password", handler.RequestPasswordReset)
	r.POST("/api/auth/reset-password", handler.ConfirmPasswordReset)
	r.GET("/api/auth/validate-reset-token", handler.ValidatePasswordResetToken)
	r.GET("/api/public/invitations/:token", handler.ValidateInviteToken)

	// Protected API Routes (Session Token required)
	api := r.Group("/api")
	api.Use(handler.AuthMiddleware())
	{
		api.GET("/auth/me", handler.GetMe)
		api.POST("/auth/verify-otp", handler.VerifyOTP)
		api.POST("/auth/resend-otp", handler.ResendOTP)

		// Projects Endpoints
		api.GET("/projects", handler.GetProjects)
		api.POST("/projects", handler.CreateProject)
		api.GET("/projects/recent", handler.GetRecentProjects)
		api.GET("/projects/starred", handler.GetStarredProjects)
		api.GET("/projects/:id", handler.GetProjectByID)
		api.POST("/projects/:id/star", handler.ToggleStarProject)
		api.POST("/projects/:id/invitations", handler.CreateProjectInviteLink)
		api.GET("/invitations/:token", handler.ValidateInviteToken)
		api.POST("/invitations/:token/accept", handler.JoinProjectByToken)

		// Subtasks Endpoints
		api.PATCH("/subtasks/:id/toggle", handler.ToggleSubtask)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Backend server running on http://localhost:%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
