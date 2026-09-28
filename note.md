# Database Design & Architecture Notes

## Overview
This document outlines the database schema design for the Kanban & Project Task Management application using **PostgreSQL** (Relational Data with UUID Primary Keys) and **MongoDB** (Audit Logs, Activity Feeds & Security Tracking).

---

## Project Architecture Concept

A **Project** is a collaborative project hub containing multiple views and settings:
- **Summary**: High-level project progress, task completion metrics, and activity feeds.
- **Board**: Interactive Kanban board view (Columns & Task Cards).
- **Calendar**: Interactive calendar view based on task `start_date` and `due_date`.
- **Gantt Chart**: Interactive timeline & Gantt chart schedule view.
- **Settings**: Member management (add/remove users, change roles 'owner', 'editor', 'viewer') & project details editing.

---

## Entity Relationship Diagram (ERD Concept)

### PostgreSQL (Relational Database with UUID PKs)
```
[ Users (UUID) ] 1 --- * [ Project Members ] * --- 1 [ Projects (UUID) ]
       |                                                    |
       |                                                    1
       |                                                    |
       |                                                    *
       + --- * [ Task Assignees ] * --- 1 -------------- [ Columns (UUID) ] 1 --- * [ Tasks (UUID) ]
                                                                                       |
                                                                                       + --- * [ Subtasks (UUID) ] 1 --- * [ Subtask Checklists (UUID) ]
                                                                                       |
                                                                                       + --- * [ Task Attachments (UUID) ]
                                                                                       |
                                                                                       + --- * [ Subtask Attachments (UUID) ]
```

### MongoDB (NoSQL Database for Security Audit Logs & System Events)
```
[ kanban_logs Database ]
   └── [ login_audit_logs Collection ] -> Security tracking (ip_address, user_agent, success, reason)
```

---

## Database Tables Schema (PostgreSQL) ✅

### 1. `users` ✅
Stores user authentication and profile details with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `email`      | VARCHAR(255) | UNIQUE, NOT NULL            | User email address         |
| `password_hash` | VARCHAR(255) | NULL                     | Hashed password (NULL if OAuth) |
| `firstname`  | VARCHAR(100) | NOT NULL                    | First name                 |
| `lastname`   | VARCHAR(100) | NULL                        | Last name                  |
| `google_id`  | VARCHAR(255) | UNIQUE, NULL                | Google OAuth Subject/User ID |
| `auth_provider` | VARCHAR(50)| NOT NULL DEFAULT 'local'   | Auth provider ('local', 'google') |
| `avatar_url` | TEXT         | NULL                        | Profile image URL          |
| `status`     | VARCHAR(20)  | NOT NULL DEFAULT 'offline'  | Online presence status ('online', 'offline', 'away') |
| `is_email_verified` | BOOLEAN | NOT NULL DEFAULT FALSE     | Email verification status flag |
| `last_active`| TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP   | Last active timestamp      |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 2. `email_verifications` ✅
Stores 6-digit OTP codes and unique URL verification tokens for user onboarding.

| Column Name   | Type         | Constraints                 | Description                |
|---------------|--------------|-----------------------------|----------------------------|
| `id`          | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `user_id`     | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target user ID (UUID)   |
| `otp_code`    | VARCHAR(6)   | NOT NULL                    | 6-digit numeric OTP code   |
| `token`       | VARCHAR(255) | UNIQUE, NOT NULL            | Unique URL verification token |
| `expires_at`  | TIMESTAMPTZ  | NOT NULL                    | Code/token expiration timestamp |
| `created_at`  | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |

---

### 3. `projects` (Formerly `boards` / `workspaces`) ✅
Represents individual collaborative Projects owned by users or team members with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `owner_id`   | UUID         | REFERENCES users(id) ON DELETE CASCADE | Project owner (UUID)   |
| `title`      | VARCHAR(150) | NOT NULL                    | Title of the project       |
| `description`| TEXT         | NULL                        | Project description        |
| `icon_emoji` | VARCHAR(20)  | DEFAULT '📋'                | Project icon/emoji         |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 4. `project_members` (Junction Table for Collaboration & Settings) ✅
Maps users to projects with specific role permissions for Member Management in Settings.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Target Project ID (UUID)  |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE  | Member User ID (UUID)     |
| `role`       | VARCHAR(20)  | NOT NULL DEFAULT 'editor'   | Member role ('owner', 'editor', 'viewer') |
| `invited_by` | UUID         | REFERENCES users(id) ON DELETE SET NULL | User who invited member    |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Join timestamp             |
| PRIMARY KEY  | `(project_id, user_id)` |                 | Composite primary key      |

---

### 5. `columns` ✅
Represents columns (e.g., "To Do", "In Progress", "Done") inside a project with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Parent project ID (UUID)  |
| `name`       | VARCHAR(100) | NOT NULL                    | Column name                |
| `position`   | INT          | NOT NULL                    | Order of the column        |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 6. `tasks` ✅
Represents tasks inside columns with UUID. Used by **Board**, **Calendar** (`start_date`, `due_date`), **Gantt Chart** timeline, and **Summary** metrics calculations.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `column_id`  | UUID         | REFERENCES columns(id) ON DELETE CASCADE | Parent column ID (UUID) |
| `title`      | VARCHAR(255) | NOT NULL                    | Task title                 |
| `description`| TEXT         | NULL                        | Extended details/markdown  |
| `priority`   | VARCHAR(20)  | NOT NULL DEFAULT 'medium'   | Priority ('low', 'medium', 'high', 'urgent') |
| `position`   | INT          | NOT NULL                    | Order within the column    |
| `start_date` | TIMESTAMPTZ  | NULL                        | Task start date (Gantt & Calendar) |
| `due_date`   | TIMESTAMPTZ  | NULL                        | Task deadline (Gantt & Calendar)   |
| `progress`   | INT          | NOT NULL DEFAULT 0          | Task progress percentage (0 - 100%) |
| `tags`       | TEXT[]       | NOT NULL DEFAULT '{}'       | Custom tags array (e.g. `['Frontend', 'Bug', 'UI/UX']`) |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 7. `task_assignees` (Junction Table for Multiple Assignees) ✅
Allows assigning multiple users to a single task.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target task ID (UUID)    |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Assigned user ID (UUID)   |
| PRIMARY KEY  | `(task_id, user_id)` |                    | Composite primary key      |

---

### 8. `subtasks` ✅
Represents sub-components or checklists under a task with UUID. Supports custom tags for finer task breakdown.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Parent task ID (UUID)   |
| `title`      | VARCHAR(255) | NOT NULL                    | Subtask title              |
| `is_completed`| BOOLEAN     | NOT NULL DEFAULT FALSE      | Subtask status             |
| `position`   | INT          | NOT NULL                    | Order of the subtask       |
| `tags`       | TEXT[]       | NOT NULL DEFAULT '{}'       | Custom tags array for subtasks (e.g. `['API', 'Test']`) |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 9. `subtask_checklists` ✅
Stores nested checklist items under a subtask with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `subtask_id` | UUID         | REFERENCES subtasks(id) ON DELETE CASCADE | Parent subtask ID (UUID)|
| `title`      | VARCHAR(255) | NOT NULL                    | Checklist item title       |
| `is_completed`| BOOLEAN     | NOT NULL DEFAULT FALSE      | Checklist item status      |
| `position`   | INT          | NOT NULL                    | Item display order         |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |

---

### 10. `user_starred_projects` (Project Starred / Favorites) ✅
Tracks user-specific starred/favorite projects for Quick Navigation.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Starred Project ID (UUID)|
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Starred timestamp          |
| PRIMARY KEY  | `(user_id, project_id)` |                 | Composite primary key      |

---

### 11. `user_sessions` (User Authentication Session & Tokens) ✅
Stores user authentication session metadata and revocation status.

| Column Name          | Type         | Constraints                 | Description                |
|----------------------|--------------|-----------------------------|----------------------------|
| `id`                 | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Session ID (UUID) |
| `user_id`            | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `refresh_token_hash` | CHAR(64)     | UNIQUE, NOT NULL            | SHA-256 Hash of Token      |
| `user_agent`         | VARCHAR(255) | NULL                        | Client Browser/Device Info |
| `ip_address`         | VARCHAR(45)  | NULL                        | Client IP Address          |
| `expires_at`         | TIMESTAMPTZ  | NOT NULL                    | Token Expiration Timestamp |
| `revoked_at`         | TIMESTAMPTZ  | NULL                        | Timestamp when revoked     |
| `created_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Session creation timestamp |
| `updated_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

## NoSQL Collections Schema (MongoDB)

### Collection: `login_audit_logs` (Database: `kanban_logs`)
Stores authentication security logs including IP addresses, user agents, attempt statuses, and failure/success reasons.

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "ip_address": "::1",
  "user_agent": "Mozilla/5.0...",
  "success": false,
  "reason": "Invalid credentials",
  "created_at": "ISODate"
}
```
