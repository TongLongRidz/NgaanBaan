package repository

import (
	"backend/internal/model"
	"github.com/lib/pq"
)

func GetAllProjects() ([]model.Project, error) {
	query := `
		SELECT p.id, p.owner_id, p.title, COALESCE(p.description, ''), p.icon_emoji, p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) + 1 AS members_count
		FROM projects p
		ORDER BY p.updated_at DESC
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []model.Project{}
	for rows.Next() {
		var p model.Project
		if err := rows.Scan(&p.ID, &p.OwnerID, &p.Title, &p.Description, &p.IconEmoji, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, nil
}

func CreateProject(title, description, ownerID string) (*model.Project, error) {
	var p model.Project
	query := `
		INSERT INTO projects (owner_id, title, description, icon_emoji)
		VALUES ($1, $2, $3, '📋')
		RETURNING id, owner_id, title, COALESCE(description, ''), icon_emoji, created_at, updated_at
	`
	err := DB.QueryRow(query, ownerID, title, description).Scan(
		&p.ID, &p.OwnerID, &p.Title, &p.Description, &p.IconEmoji, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.MembersCount = 1
	return &p, nil
}

func GetProjectByID(id string) (*model.Project, error) {
	var p model.Project
	query := `
		SELECT p.id, p.owner_id, p.title, COALESCE(p.description, ''), p.icon_emoji, p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) + 1 AS members_count
		FROM projects p
		WHERE p.id = $1
	`
	err := DB.QueryRow(query, id).Scan(&p.ID, &p.OwnerID, &p.Title, &p.Description, &p.IconEmoji, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func GetProjectColumns(projectID string) ([]model.Column, error) {
	query := `
		SELECT id, project_id, name, position, created_at, updated_at
		FROM columns
		WHERE project_id = $1
		ORDER BY position ASC
	`
	rows, err := DB.Query(query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := []model.Column{}
	for rows.Next() {
		var col model.Column
		if err := rows.Scan(&col.ID, &col.ProjectID, &col.Name, &col.Position, &col.CreatedAt, &col.UpdatedAt); err != nil {
			return nil, err
		}
		tasks, err := GetTasksByColumnID(col.ID)
		if err == nil {
			col.Tasks = tasks
		} else {
			col.Tasks = []model.Task{}
		}
		columns = append(columns, col)
	}
	return columns, nil
}

func GetTasksByColumnID(columnID string) ([]model.Task, error) {
	query := `
		SELECT id, column_id, title, COALESCE(description, ''), priority, position, start_date, due_date, progress, tags, created_at, updated_at
		FROM tasks
		WHERE column_id = $1
		ORDER BY position ASC
	`
	rows, err := DB.Query(query, columnID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []model.Task{}
	for rows.Next() {
		var t model.Task
		var tags pq.StringArray
		if err := rows.Scan(&t.ID, &t.ColumnID, &t.Title, &t.Description, &t.Priority, &t.Position, &t.StartDate, &t.DueDate, &t.Progress, &tags, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		t.Tags = tags

		// Fetch assignees
		t.Assignees = GetTaskAssignees(t.ID)
		// Fetch subtasks
		t.Subtasks, _ = GetSubtasksByTaskID(t.ID)
		// Fetch attachments
		t.Attachments, _ = GetTaskAttachments(t.ID)
		// Fetch comments
		t.Comments, _ = GetTaskComments(t.ID)

		tasks = append(tasks, t)
	}
	return tasks, nil
}

func GetTaskAssignees(taskID string) []string {
	query := `
		SELECT u.firstname || ' ' || COALESCE(u.lastname, '')
		FROM task_assignees ta
		JOIN users u ON ta.user_id = u.id
		WHERE ta.task_id = $1
	`
	rows, err := DB.Query(query, taskID)
	if err != nil {
		return []string{}
	}
	defer rows.Close()

	assignees := []string{}
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			assignees = append(assignees, name)
		}
	}
	return assignees
}

func GetSubtasksByTaskID(taskID string) ([]model.Subtask, error) {
	query := `
		SELECT id, task_id, title, is_completed, position, tags, created_at, updated_at
		FROM subtasks
		WHERE task_id = $1
		ORDER BY position ASC
	`
	rows, err := DB.Query(query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	subtasks := []model.Subtask{}
	for rows.Next() {
		var st model.Subtask
		var tags pq.StringArray
		if err := rows.Scan(&st.ID, &st.TaskID, &st.Title, &st.IsCompleted, &st.Position, &tags, &st.CreatedAt, &st.UpdatedAt); err != nil {
			return nil, err
		}
		st.Tags = tags
		subtasks = append(subtasks, st)
	}
	return subtasks, nil
}

func GetTaskAttachments(taskID string) ([]model.TaskAttachment, error) {
	query := `
		SELECT id, task_id, file_name, file_url, file_size, COALESCE(file_type, ''), created_at
		from task_attachments
		WHERE task_id = $1
	`
	rows, err := DB.Query(query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	attachments := []model.TaskAttachment{}
	for rows.Next() {
		var a model.TaskAttachment
		if err := rows.Scan(&a.ID, &a.TaskID, &a.FileName, &a.FileURL, &a.FileSize, &a.FileType, &a.CreatedAt); err != nil {
			return nil, err
		}
		attachments = append(attachments, a)
	}
	return attachments, nil
}

func GetTaskComments(taskID string) ([]model.TaskComment, error) {
	query := `
		SELECT c.id, c.task_id, c.author_id, u.firstname || ' ' || COALESCE(u.lastname, ''), c.content, c.created_at, c.updated_at
		FROM task_comments c
		JOIN users u ON c.author_id = u.id
		WHERE c.task_id = $1
		ORDER BY c.created_at ASC
	`
	rows, err := DB.Query(query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []model.TaskComment{}
	for rows.Next() {
		var c model.TaskComment
		if err := rows.Scan(&c.ID, &c.TaskID, &c.AuthorID, &c.Author, &c.Content, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}

func GetProjectActivities(projectID string) ([]model.ProjectActivity, error) {
	query := `
		SELECT a.id, a.project_id, a.user_id, u.firstname || ' ' || COALESCE(u.lastname, ''), a.action, a.target, a.created_at
		FROM project_activities a
		JOIN users u ON a.user_id = u.id
		WHERE a.project_id = $1
		ORDER BY a.created_at DESC
	`
	rows, err := DB.Query(query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	activities := []model.ProjectActivity{}
	for rows.Next() {
		var act model.ProjectActivity
		if err := rows.Scan(&act.ID, &act.ProjectID, &act.UserID, &act.UserName, &act.Action, &act.Target, &act.CreatedAt); err != nil {
			return nil, err
		}
		activities = append(activities, act)
	}
	return activities, nil
}

func GetProjectMembers(projectID string) ([]model.ProjectMember, error) {
	query := `
		SELECT p.id, u.id, u.firstname || ' ' || COALESCE(u.lastname, ''), u.email, 'Owner', COALESCE(u.avatar_url, ''), 'Active', u.created_at
		FROM projects p
		JOIN users u ON p.owner_id = u.id
		WHERE p.id = $1
		UNION
		SELECT pm.project_id, u.id, u.firstname || ' ' || COALESCE(u.lastname, ''), u.email, pm.role, COALESCE(u.avatar_url, ''), 'Active', pm.created_at
		FROM project_members pm
		JOIN users u ON pm.user_id = u.id
		WHERE pm.project_id = $1
	`
	rows, err := DB.Query(query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := []model.ProjectMember{}
	for rows.Next() {
		var m model.ProjectMember
		if err := rows.Scan(&m.ProjectID, &m.UserID, &m.Name, &m.Email, &m.Role, &m.AvatarURL, &m.Status, &m.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func ToggleSubtask(subtaskID string) error {
	query := `UPDATE subtasks SET is_completed = NOT is_completed, updated_at = NOW() WHERE id = $1`
	_, err := DB.Exec(query, subtaskID)
	return err
}

func GetStarredProjects(userID string) ([]model.Project, error) {
	query := `
		SELECT p.id, p.owner_id, p.title, COALESCE(p.description, ''), p.icon_emoji, p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) + 1 AS members_count
		FROM user_starred_projects usp
		JOIN projects p ON usp.project_id = p.id
		WHERE usp.user_id = $1
		ORDER BY usp.created_at DESC
	`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []model.Project{}
	for rows.Next() {
		var p model.Project
		if err := rows.Scan(&p.ID, &p.OwnerID, &p.Title, &p.Description, &p.IconEmoji, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount); err != nil {
			return nil, err
		}
		p.IsStarred = true
		projects = append(projects, p)
	}
	return projects, nil
}

func ToggleStarProject(userID, projectID string) (bool, error) {
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM user_starred_projects WHERE user_id = $1 AND project_id = $2)`
	err := DB.QueryRow(checkQuery, userID, projectID).Scan(&exists)
	if err != nil {
		return false, err
	}

	if exists {
		deleteQuery := `DELETE FROM user_starred_projects WHERE user_id = $1 AND project_id = $2`
		_, err = DB.Exec(deleteQuery, userID, projectID)
		return false, err
	} else {
		insertQuery := `INSERT INTO user_starred_projects (user_id, project_id) VALUES ($1, $2)`
		_, err = DB.Exec(insertQuery, userID, projectID)
		return true, err
	}
}

func GetDefaultUserID() string {
	var userID string
	err := DB.QueryRow("SELECT id FROM users LIMIT 1").Scan(&userID)
	if err != nil || userID == "" {
		// Create default user if not existing
		err = DB.QueryRow(`
			INSERT INTO users (email, firstname, lastname)
			VALUES ('somchai.j@gmail.com', 'Somchai', 'Jaidee')
			ON CONFLICT (email) DO UPDATE SET firstname = 'Somchai'
			RETURNING id
		`).Scan(&userID)
	}
	return userID
}
