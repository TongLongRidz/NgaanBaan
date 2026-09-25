# Database Design & Architecture Notes

## Overview
This document outlines the database schema design for the Kanban & Project Task Management application using **PostgreSQL** (Relational Data with UUID Primary Keys) and **MongoDB** (Notifications & Chat Messages History).

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
[ Users (UUID) ] 1 --- * [ Project Members ] * --- 1 [ Projects (UUID) ] 1 --- * [ Chat Rooms (UUID) ]
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

[ Chat Rooms (UUID) ] 1 --- * [ Chat Room Members ] * --- 1 [ Users (UUID) ]
```

### MongoDB (NoSQL Database for Notifications & Messages)
```
[ notifications Collection ] -> In-app alerts, project invites, role changes, task assignments
[ messages Collection ]      -> Real-time & persistent chat room messages & attachments
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
| `last_active`| TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP   | Last active timestamp      |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 2. `projects` (Formerly `boards` / `workspaces`) ✅
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

### 3. `project_members` (Junction Table for Collaboration & Settings) ✅
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

### 4. `columns` ✅
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

### 5. `tasks` ✅
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

### 6. `task_assignees` (Junction Table for Multiple Assignees) ✅
Allows assigning multiple users to a single task.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target task ID (UUID)    |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Assigned user ID (UUID)   |
| PRIMARY KEY  | `(task_id, user_id)` |                    | Composite primary key      |

---

### 7. `subtasks` ✅
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

### 8. `subtask_checklists` ✅
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

### 9. `task_attachments` ✅
Stores uploaded files attached directly to a Task with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Target Task ID (UUID)   |
| `file_name`  | VARCHAR(255) | NOT NULL                    | Original filename          |
| `file_url`   | TEXT         | NOT NULL                    | Cloud/Local storage URL    |
| `file_size`  | BIGINT       | NOT NULL DEFAULT 0          | File size in bytes         |
| `file_type`  | VARCHAR(100) | NULL                        | MIME type (e.g. image/png) |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Upload timestamp           |

---

### 10. `subtask_attachments` ✅
Stores uploaded files attached to a Subtask with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `subtask_id` | UUID         | REFERENCES subtasks(id) ON DELETE CASCADE | Target Subtask ID (UUID)|
| `file_name`  | VARCHAR(255) | NOT NULL                    | Original filename          |
| `file_url`   | TEXT         | NOT NULL                    | Cloud/Local storage URL    |
| `file_size`  | BIGINT       | NOT NULL DEFAULT 0          | File size in bytes         |
| `file_type`  | VARCHAR(100) | NULL                        | MIME type (e.g. image/png) |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Upload timestamp           |

---

### 11. `task_comments` ✅
Stores discussion comments under Task cards (Task Detail Modal).

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `task_id`    | UUID         | REFERENCES tasks(id) ON DELETE CASCADE | Parent Task ID (UUID)   |
| `author_id`  | UUID         | REFERENCES users(id) ON DELETE CASCADE | Commenter User ID (UUID)|
| `content`    | TEXT         | NOT NULL                    | Comment text content       |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last edit timestamp        |

---

### 12. `project_activities` ✅
Stores audit log history and task activity stream for **Activity** view.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Target Project ID (UUID)  |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Triggering User ID (UUID) |
| `action`     | VARCHAR(100) | NOT NULL                    | Action type ('move', 'comment', 'complete', 'create') |
| `target`     | TEXT         | NOT NULL                    | Description of target item |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Event timestamp            |

---

### 13. `user_starred_projects` (Project Starred / Favorites) ✅
Tracks user-specific starred/favorite projects for Quick Navigation.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Starred Project ID (UUID)|
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Starred timestamp          |
| PRIMARY KEY  | `(user_id, project_id)` |                 | Composite primary key      |

---

## Chat System & Auth Schema (PostgreSQL)

### 14. `chat_rooms` (Outdated / Excluded)
Represents chat rooms created for specific projects with UUID.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (UUID) |
| `project_id` | UUID         | REFERENCES projects(id) ON DELETE CASCADE | Associated Project ID (UUID) |
| `name`       | TEXT         | NOT NULL                    | Room name                  |
| `owner_id`   | UUID         | REFERENCES users(id) ON DELETE CASCADE | Room creator/owner (UUID) |
| `created_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Creation timestamp         |
| `updated_at` | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

### 15. `chat_room_members` (Outdated / Excluded)
Maps users to chat rooms they belong to.

| Column Name  | Type         | Constraints                 | Description                |
|--------------|--------------|-----------------------------|----------------------------|
| `room_id`    | UUID         | REFERENCES chat_rooms(id) ON DELETE CASCADE | Target Room ID (UUID)   |
| `user_id`    | UUID         | REFERENCES users(id) ON DELETE CASCADE | Member User ID (UUID)   |
| `joined_at`  | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Join timestamp             |
| PRIMARY KEY  | `(room_id, user_id)` |                    | Composite primary key      |

---

### 16. `user_sessions` (User Authentication Session & Refresh Tokens) ✅
Stores user authentication refresh tokens, browser session metadata, and revocation status for security & single/multi-device logout.

| Column Name          | Type         | Constraints                 | Description                |
|----------------------|--------------|-----------------------------|----------------------------|
| `id`                 | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique Session ID (UUID) |
| `user_id`            | UUID         | REFERENCES users(id) ON DELETE CASCADE | Target User ID (UUID)   |
| `refresh_token_hash` | CHAR(64)     | UNIQUE, NOT NULL            | SHA-256 Hash of Refresh Token |
| `user_agent`         | VARCHAR(255) | NULL                        | Client Browser/Device Info |
| `ip_address`         | VARCHAR(45)  | NULL                        | Client IP Address          |
| `expires_at`         | TIMESTAMPTZ  | NOT NULL                    | Token Expiration Timestamp |
| `revoked_at`         | TIMESTAMPTZ  | NULL                        | Timestamp when revoked/logged out |
| `created_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Session creation timestamp |
| `updated_at`         | TIMESTAMPTZ  | DEFAULT CURRENT_TIMESTAMP   | Last update timestamp      |

---

## NoSQL Collections Schema (MongoDB)

### 1. Collection: `notifications`
Stores real-time & persistent in-app notifications with dynamic payloads.

```json
{
  "_id": "ObjectId",
  "user_id": "UUID string",  // Recipient User ID (FK -> PostgreSQL users.id)
  "actor": {
    "id": "UUID string",    // Triggering User ID (FK -> PostgreSQL users.id)
    "name": "Somchai Jaidee",
    "avatar_url": "https://..."
  },
  "title": "You were added to a project",
  "message": "Somchai added you to 'Sprint Workspace' as Editor",
  "type": "project_member_added",  // e.g. "project_member_added", "task_assigned", "due_date"
  "is_read": false,
  "metadata": {
    "project_id": "UUID string",
    "task_id": "UUID string",
    "room_id": "UUID string"
  },
  "created_at": "ISODate"
}
```

---

### 2. Collection: `messages`
Stores chat messages and embedded file attachments per room.

```json
{
  "_id": "ObjectId",
  "room_id": "UUID string", // FK -> PostgreSQL chat_rooms.id
  "user": {
    "id": "UUID string",   // FK -> PostgreSQL users.id
    "name": "Somchai Jaidee",
    "avatar_url": "https://..."
  },
  "content": "Hello team, here is the updated design file!",
  "attachments": [
    {
      "id": "UUID string",
      "file_name": "design.png",
      "file_url": "https://...",
      "file_size": 204800,
      "file_type": "image/png"
    }
  ],
  "created_at": "ISODate"
}
```
