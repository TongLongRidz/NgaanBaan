# Database Design & Architecture Notes 📝

## Overview
This document outlines the database schema design for the NgaanBaan (Kanban & Project Task Management) application using **PostgreSQL** (Relational Data with UUID Primary Keys) and **MongoDB** (Audit Logs, Activity Feeds & Security Tracking).

---

## Project Architecture Concept

A **Project** is a collaborative project hub containing multiple views and settings:
- **Summary**: High-level project progress, task completion metrics, and activity feeds.
- **Board**: Interactive Kanban board view (Columns & Task Cards).
- **Calendar**: Single-container interactive calendar view based on task `start_date` and `due_date`.
- **Gantt Chart**: Interactive timeline & Gantt chart schedule view.
- **SubNavbar & Navigation**: Sticky sub-navigation bar below `TopNavbar`. Navigation away from `/projects/[uuid]` always resets to the Summary/Overview tab upon return, while page reload (F5 / Cmd+R) preserves the currently selected tab using `sessionStorage`.
- **Project Info & Description**: Description popup modal triggered from the Info (`Info`) button right next to the project title in `TopNavbar`.
- **Members & Permissions**: Member role management ('owner', 'editor', 'viewer') and privacy/visibility controls ('private', 'specific_people', 'anyone_with_link'). **Only the project Owner** can modify visibility, kick/remove members, or update member roles (enforced at both frontend UI and backend REST API levels).

---

## Database Connection Setup 🔌 (DBeaver & MongoDB Compass) ✅

### 1. PostgreSQL Connection (DBeaver / TablePlus / DataGrip) ✅
- **Host**: `localhost` (หรือ `127.0.0.1`)
- **Port**: `5435` *(แมปมาจาก 5432 ภายใน Container)*
- **Database**: `ngaanbaan_db`
- **Username**: `ngaanbaan_user`
- **Password**: `ngaanbaan_password`
- **JDBC Connection String**: `jdbc:postgresql://localhost:5435/ngaanbaan_db`

---

### 2. MongoDB Connection (MongoDB Compass / Studio 3T) ✅
- **Host**: `localhost` (หรือ `127.0.0.1`)
- **Port**: `27010` *(แมปมาจาก 27017 ภายใน Container)*
- **Database**: `ngaanbaan_logs`
- **Username**: `ngaanbaan_mongo_user`
- **Password**: `ngaanbaan_mongo_password`
- **Authentication Database**: `admin`
- **Connection String (URI)**: 
  ```text
  mongodb://ngaanbaan_mongo_user:ngaanbaan_mongo_password@localhost:27010/ngaanbaan_logs?authSource=admin
  ```

---

## Entity Relationship Diagram (ERD Concept)

### PostgreSQL (Relational Database with UUID PKs)
```text
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
                                                                                        |
                                                                                        + --- * [ Task Comments (UUID) ]
```

### MongoDB (NoSQL Database for Security Audit Logs & System Events)
```text
[ ngaanbaan_logs Database ]
   └── [ login_audit_logs Collection ] -> Security tracking (attempted_email, ip_address, user_agent, attempted_round, attempted_time, status, reason, timestamp) [IP-based Rate Limiting: Password field omitted for security]
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
| `status`     | VARCHAR(20)  | NOT NULL DEFAULT 'offline'  | Online presence status ('active', 'away', 'offline') |
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

### 2.1 `password_reset_tokens` (Password Reset Token Queue) ✅
Stores secure 1-hour expiration tokens for user password recovery flows.

| Column Name   | Type         | Constraints                 | Description                |
|---------------|--------------|-----------------------------|----------------------------|
| `id`          | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `user_id`     | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target user ID (UUID)   |
| `token`       | VARCHAR(255) | UNIQUE, NOT NULL            | Password reset URL token   |
| `expires_at`  | TIMESTAMPTZ  | NOT NULL                    | Token 1-hour expiry time   |
| `created_at`  | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |

---

### 3. `user_sessions` (User Authentication Session, Refresh Tokens & Rotation) ✅
Stores user authentication refresh tokens (SHA-256 Hashed), metadata, and revocation status for Token Rotation and Reuse Detection. *(View alias: `user_tokens`)*

| Column Name          | Type         | Constraints                 | Description                |
|----------------------|--------------|-----------------------------|----------------------------|
| `id`                 | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Session ID (UUID) |
| `user_id`            | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `refresh_token_hash` | VARCHAR(64)  | UNIQUE, NOT NULL            | SHA-256 Hash of Refresh Token |
| `user_agent`         | VARCHAR(255) | NULL                        | Client Browser/Device Info |
| `ip_address`         | VARCHAR(45)  | NULL                        | Client IP Address          |
| `expires_at`         | TIMESTAMPTZ  | NOT NULL                    | Token Expiration Timestamp |
| `revoked_at`         | TIMESTAMPTZ  | NULL                        | Timestamp when revoked     |
| `created_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Session creation timestamp |
| `updated_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 4. `projects` (Formerly `boards` / `workspaces`) ✅
Represents individual collaborative Projects created and managed by users with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `title`      | VARCHAR(150) | NOT NULL                    | Title of the project       |
| `description`| TEXT         | NULL                        | Project description        |
| `visibility` | VARCHAR(30)  | NOT NULL DEFAULT 'private'  | Project visibility ('private', 'specific_people', 'anyone_with_link') |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 5. `project_members` (Junction Table for Collaboration & Roles) ✅
Maps users to projects with specific role permissions (`'owner'`, `'editor'`, `'viewer'`) for Member Management in Settings.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Target Project ID (UUID)  |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE  | Member User ID (UUID)     |
| `role`       | VARCHAR(20)  | NOT NULL DEFAULT 'editor'   | Member role ('owner', 'editor', 'viewer') |
| `invited_by` | UUID         | REFERENCES users(id) ON DELETE SET NULL | User who invited member    |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Join timestamp             |
| PRIMARY KEY  | `(project_id, user_id)` |                 | Composite primary key      |

---

### 5.1 `project_invitations` (Dynamic Invite Tokens with 3-Day Expiry) ✅
Stores dynamic join link tokens with configurable roles (`'editor'` or `'viewer'`) and a 3-day expiration time.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Token ID (UUID) |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Target Project ID (UUID)  |
| `created_by` | UUID         | REFERENCES users(id) ON DELETE CASCADE  | User who generated link   |
| `token`      | VARCHAR(255) | UNIQUE, NOT NULL            | Secure random URL token    |
| `role`       | VARCHAR(20)  | NOT NULL DEFAULT 'editor'   | Granted role ('editor', 'viewer') |
| `expires_at` | TIMESTAMPTZ  | NOT NULL                    | Expiration time (3 days)   |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |

---

### 6. `columns` ✅
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

### 7. `tasks` ✅
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

### 8. `task_assignees` (Junction Table for Multiple Assignees) ✅
Allows assigning multiple users to a single task.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target task ID (UUID)    |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Assigned user ID (UUID)   |
| PRIMARY KEY  | `(task_id, user_id)` |                    | Composite primary key      |

---

### 9. `subtasks` ✅
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

### 10. `subtask_checklists` ✅
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

### 11. `task_attachments` ✅
Stores file attachments linked to tasks with file metadata.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique attachment ID (UUID)|
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target task ID (UUID)   |
| `file_name`  | VARCHAR(255) | NOT NULL                    | Original file name         |
| `file_url`   | TEXT         | NOT NULL                    | Attachment storage URL     |
| `file_size`  | BIGINT       | NOT NULL DEFAULT 0          | File size in bytes         |
| `file_type`  | VARCHAR(100) | NULL                        | File MIME type             |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Upload timestamp           |

---

### 12. `subtask_attachments` ✅
Stores file attachments linked to subtasks with file metadata.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique attachment ID (UUID)|
| `subtask_id` | UUID         | REFERENCES subtasks(id) ON DELETE CASCADE | Target subtask ID (UUID)|
| `file_name`  | VARCHAR(255) | NOT NULL                    | Original file name         |
| `file_url`   | TEXT         | NOT NULL                    | Attachment storage URL     |
| `file_size`  | BIGINT       | NOT NULL DEFAULT 0          | File size in bytes         |
| `file_type`  | VARCHAR(100) | NULL                        | File MIME type             |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Upload timestamp           |

---

### 13. `task_comments` ✅
Stores discussions, team comments, and updates under specific tasks.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique comment ID (UUID)   |
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target task ID (UUID)   |
| `author_id`  | UUID         | REFERENCES users(id) ON DELETE CASCADE | Comment author ID (UUID) |
| `content`    | TEXT         | NOT NULL                    | Comment text content       |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Comment creation timestamp |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 14. `project_activities` ✅
Stores project activity audit logs (e.g. task movements, role changes) displayed in **Summary** view.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique activity ID (UUID)  |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Target Project ID (UUID)  |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Actor User ID (UUID)       |
| `action`     | VARCHAR(100) | NOT NULL                    | Action type (e.g. 'move_task') |
| `target`     | TEXT         | NOT NULL                    | Action detail/description  |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Activity timestamp         |

---

### 15. `user_pinned_projects` (Project Pinned & Custom Ordering) ✅
Tracks user-specific pinned projects and custom display ordering for each user.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Pinned Project ID (UUID) |
| `position`   | INT          | NOT NULL DEFAULT 0          | Display order sequence     |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Pinned timestamp           |
| PRIMARY KEY  | `(user_id, project_id)` |                 | Composite primary key      |

---

### 15.1 `user_project_views` (Recent Projects View Tracking & History) ✅
Tracks user-specific recent project access history. Automatically recorded/upserted when opening or creating a project. Used by SideNavbar (limit 10) and `/projects/recent` page with pagination.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Viewed Project ID (UUID)|
| `viewed_at`  | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last viewed timestamp      |
| PRIMARY KEY  | `(user_id, project_id)` |                 | Composite primary key      |

---

### 16. `chat_rooms` (Project & Direct Chat Rooms) 📌 (Planned / Future Scope)
Stores real-time chat room channels for Project Discussions or Direct Messages (1-on-1).

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Chat Room ID (UUID) |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE, NULL | Linked Project ID (NULL for Direct Chat) |
| `name`       | VARCHAR(100) | NULL                        | Channel/Room Name (e.g., 'General', 'Dev Team') |
| `type`       | VARCHAR(20)  | NOT NULL DEFAULT 'project'  | Room type ('project', 'direct', 'group') |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |

---

### 17. `chat_room_members` (Chat Room Participants) 📌 (Planned / Future Scope)
Maps users to chat rooms for permission & unread tracking.

| Column Name   | Type        | Constraints                 | Description                |
|---------------|-------------|-----------------------------|----------------------------|
| `room_id`     | UUID        | REFERENCES chat_rooms(id) ON DELETE CASCADE | Target Chat Room ID (UUID) |
| `user_id`     | UUID        | REFERENCES users(id) ON DELETE CASCADE     | Member User ID (UUID)      |
| `joined_at`   | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP   | Room join timestamp        |
| `last_read_at`| TIMESTAMPTZ | NULL                        | Timestamp of last read message |
| PRIMARY KEY   | `(room_id, user_id)` |                    | Composite primary key      |

---

### 18. `chat_messages` (Relational Chat Messages Backup) 📌 (Planned / Future Scope)
Stores chat messages for relational querying & history persistence in PostgreSQL.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Message ID (UUID)   |
| `room_id`    | UUID         | REFERENCES chat_rooms(id) ON DELETE CASCADE | Target Chat Room ID (UUID) |
| `sender_id`  | UUID         | REFERENCES users(id) ON DELETE CASCADE | Message Sender User ID (UUID) |
| `message`    | TEXT         | NOT NULL                    | Message text content       |
| `attachments`| TEXT[]       | NOT NULL DEFAULT '{}'       | Array of attachment URLs   |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Sent timestamp             |

---

## NoSQL Collections Schema (MongoDB) ✅

### 1. Collection: `login_audit_logs` (Database: `ngaanbaan_logs`) ✅
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

---

### 1.1 Collection: `password_reset_logs` (Database: `ngaanbaan_logs`) ✅
Stores security audit tracking for password reset requests & completed password reset events including IP addresses and Rate Limits.

```json
{
  "_id": "ObjectId",
  "user_id": "u1a2b3c4-...",
  "email": "user@example.com",
  "action": "request",
  "ip_address": "::1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "ISODate"
}
```

---

### 2. Collection: `project_activity_logs` (Database: `ngaanbaan_logs`) ✅
Stores detailed project activity event logs, task changes, column movements, member role modifications, and system audit events for historical tracking and activity stream visualization.

```json
{
  "_id": "ObjectId",
  "project_id": "b8a1e2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "user_id": "u1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
  "actor_email": "user@example.com",
  "action": "task_moved",
  "target_type": "task",
  "target_id": "t9f8e7d6-5c4b-3a21-0fe9-8d7c6b5a4f3e",
  "details": {
    "task_title": "Implement JWT Refresh Rotation",
    "from_column": "In Progress",
    "to_column": "Done"
  },
  "ip_address": "127.0.0.1",
  "created_at": "ISODate"
}
```

---

### 3. Collection: `chat_history_logs` (Database: `ngaanbaan_logs`) 📌 (Planned / Future Scope)
Stores high-throughput real-time chat messages, attachment metadata, and WebSocket status logs for fast retrieval.

```json
{
  "_id": "ObjectId",
  "room_id": "c1f2e3d4-...",
  "sender_id": "u9f8e7d6-...",
  "sender_name": "Antigravity Dev",
  "message": "Hello team, task is updated!",
  "attachments": [],
  "sent_at": "ISODate"
}
```


