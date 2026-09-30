package model

import "time"

type User struct {
	ID              string    `json:"id"`
	Email           string    `json:"email"`
	Firstname       string    `json:"firstname"`
	Lastname        string    `json:"lastname"`
	AvatarURL       string    `json:"avatar_url"`
	Status          string    `json:"status"`
	IsEmailVerified bool      `json:"is_email_verified"`
	LastActive      time.Time `json:"last_active"`
	CreatedAt       time.Time `json:"created_at"`
}

type Project struct {
	ID           string     `json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Role         string     `json:"role,omitempty"`
	MembersCount int        `json:"members_count"`
	IsStarred    bool       `json:"is_starred"`
	LastViewedAt *time.Time `json:"last_viewed_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type UserProjectView struct {
	UserID    string    `json:"user_id"`
	ProjectID string    `json:"project_id"`
	ViewedAt  time.Time `json:"viewed_at"`
}

type ProjectMember struct {
	ProjectID string    `json:"project_id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	AvatarURL string    `json:"avatar_url"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type ProjectInvitation struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	CreatedBy string    `json:"created_by"`
	Token     string    `json:"token"`
	Role      string    `json:"role"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type Column struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Name      string    `json:"name"`
	Position  int       `json:"position"`
	Tasks     []Task    `json:"tasks"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Task struct {
	ID          string               `json:"id"`
	ColumnID    string               `json:"column_id"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	Priority    string               `json:"priority"`
	Position    int                  `json:"position"`
	StartDate   *time.Time           `json:"start_date,omitempty"`
	DueDate     *time.Time           `json:"due_date,omitempty"`
	Progress    int                  `json:"progress"`
	Tags        []string             `json:"tags"`
	Assignees   []string             `json:"assignees"`
	Subtasks    []Subtask            `json:"subtasks"`
	Attachments []TaskAttachment     `json:"attachments"`
	Comments    []TaskComment        `json:"comments"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
}

type Subtask struct {
	ID          string             `json:"id"`
	TaskID      string             `json:"task_id"`
	Title       string             `json:"title"`
	IsCompleted bool               `json:"is_completed"`
	Position    int                `json:"position"`
	Tags        []string           `json:"tags"`
	Checklists  []SubtaskChecklist `json:"checklists,omitempty"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

type SubtaskChecklist struct {
	ID          string    `json:"id"`
	SubtaskID   string    `json:"subtask_id"`
	Title       string    `json:"title"`
	IsCompleted bool      `json:"is_completed"`
	Position    int       `json:"position"`
	CreatedAt   time.Time `json:"created_at"`
}

type TaskAttachment struct {
	ID        string    `json:"id"`
	TaskID    string    `json:"task_id"`
	FileName  string    `json:"file_name"`
	FileURL   string    `json:"file_url"`
	FileSize  int64     `json:"file_size"`
	FileType  string    `json:"file_type"`
	CreatedAt time.Time `json:"created_at"`
}

type TaskComment struct {
	ID        string    `json:"id"`
	TaskID    string    `json:"task_id"`
	AuthorID  string    `json:"author_id"`
	Author    string    `json:"author"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProjectActivity struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	UserID    string    `json:"user_id"`
	UserName  string    `json:"user"`
	Action    string    `json:"action"`
	Target    string    `json:"target"`
	CreatedAt time.Time `json:"created_at"`
}

type LoginAuditLog struct {
	ID                string    `bson:"_id,omitempty" json:"id"`
	Timestamp         time.Time `bson:"timestamp" json:"timestamp"`
	AttemptedEmail    string    `bson:"attempted_email" json:"attempted_email"`
	AttemptedPassword string    `bson:"attempted_password" json:"attempted_password"`
	AttemptedRound    int       `bson:"attempted_round" json:"attempted_round"`
	AttemptedTime     int       `bson:"attempted_time" json:"attempted_time"`
	Status            string    `bson:"status" json:"status"` // "success" or "failed"
	Reason            string    `bson:"reason,omitempty" json:"reason,omitempty"`
	IPAddress         string    `bson:"ip_address" json:"ip_address"`
	UserAgent         string    `bson:"user_agent" json:"user_agent"`
}

type EmailVerificationAuditLog struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	UserID    string    `bson:"user_id" json:"user_id"`
	Email     string    `bson:"email" json:"email"`
	Method    string    `bson:"method" json:"method"` // "otp" or "link"
	IPAddress string    `bson:"ip_address" json:"ip_address"`
	UserAgent string    `bson:"user_agent" json:"user_agent"`
	VerifiedAt time.Time `bson:"verified_at" json:"verified_at"`
}

type PasswordResetAuditLog struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	UserID    string    `bson:"user_id" json:"user_id"`
	Email     string    `bson:"email" json:"email"`
	Action    string    `bson:"action" json:"action"` // "request" or "reset_success"
	IPAddress string    `bson:"ip_address" json:"ip_address"`
	UserAgent string    `bson:"user_agent" json:"user_agent"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}
