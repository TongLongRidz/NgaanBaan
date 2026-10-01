package repository

import (
	"fmt"
	"strings"

	"backend/internal/model"
	"github.com/lib/pq"
)

func GetUserProjects(userID string) ([]model.Project, error) {
	query := `
		SELECT p.id, p.title, COALESCE(p.description, ''),
		       CASE WHEN LOWER(pm.role) = 'owner' THEN 'Owner' WHEN LOWER(pm.role) = 'editor' THEN 'Editor' ELSE 'Viewer' END AS role,
		       p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) AS members_count
		FROM projects p
		JOIN project_members pm ON p.id = pm.project_id
		WHERE pm.user_id = $1
		ORDER BY p.updated_at DESC
	`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []model.Project{}
	for rows.Next() {
		var p model.Project
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Role, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, nil
}

func CreateProject(title, description, ownerID string) (*model.Project, error) {
	var p model.Project
	query := `
		INSERT INTO projects (title, description)
		VALUES ($1, $2)
		RETURNING id, title, COALESCE(description, ''), created_at, updated_at
	`
	err := DB.QueryRow(query, title, description).Scan(
		&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Add creator as 'owner' in project_members table
	memberQuery := `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1, $2, 'owner')
	`
	_, _ = DB.Exec(memberQuery, p.ID, ownerID)

	// Auto-create 4 default Kanban columns (Positions 1..4 with name_th and name_en)
	defaultColumns := []struct {
		Name     string
		NameTH   string
		NameEN   string
		Position int
	}{
		{Name: "To Do", NameTH: "รอดำเนินการ", NameEN: "To Do", Position: 1},
		{Name: "In Progress", NameTH: "อยู่ระหว่างดำเนินการ", NameEN: "In Progress", Position: 2},
		{Name: "In Review", NameTH: "อยู่ระหว่างการตรวจสอบ", NameEN: "In Review", Position: 3},
		{Name: "Done", NameTH: "เสร็จสิ้น", NameEN: "Done", Position: 4},
	}

	colQuery := `
		INSERT INTO columns (project_id, name, name_th, name_en, position)
		VALUES ($1, $2, $3, $4, $5)
	`
	for _, col := range defaultColumns {
		_, _ = DB.Exec(colQuery, p.ID, col.Name, col.NameTH, col.NameEN, col.Position)
	}

	p.MembersCount = 1
	p.Role = "Owner"
	return &p, nil
}

func GetProjectByID(id string) (*model.Project, error) {
	var p model.Project
	query := `
		SELECT p.id, p.title, COALESCE(p.description, ''), p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS members_count
		FROM projects p
		WHERE p.id = $1
	`
	err := DB.QueryRow(query, id).Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func GetUserProjectByID(projectID, userID string) (*model.Project, error) {
	var p model.Project
	query := `
		SELECT p.id, p.title, COALESCE(p.description, ''), COALESCE(p.visibility, 'team'),
		       CASE WHEN LOWER(pm.role) = 'owner' THEN 'Owner' WHEN LOWER(pm.role) = 'editor' THEN 'Editor' ELSE 'Viewer' END AS role,
		       p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) AS members_count
		FROM projects p
		JOIN project_members pm ON p.id = pm.project_id
		WHERE p.id = $1 AND pm.user_id = $2
	`
	err := DB.QueryRow(query, projectID, userID).Scan(&p.ID, &p.Title, &p.Description, &p.Visibility, &p.Role, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func UpdateProjectVisibility(projectID, requestingUserID, visibility string) error {
	// Verify requesting user is owner
	var requesterRole string
	roleQuery := `SELECT LOWER(role) FROM project_members WHERE project_id = $1 AND user_id = $2`
	err := DB.QueryRow(roleQuery, projectID, requestingUserID).Scan(&requesterRole)
	if err != nil || requesterRole != "owner" {
		return fmt.Errorf("only owner can update project visibility")
	}

	updateQuery := `UPDATE projects SET visibility = $1, updated_at = NOW() WHERE id = $2`
	_, err = DB.Exec(updateQuery, visibility, projectID)
	return err
}

func GetProjectColumns(projectID string) ([]model.Column, error) {
	query := `
		SELECT id, project_id, name, COALESCE(name_th, ''), COALESCE(name_en, ''), position, created_at, updated_at
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
		if err := rows.Scan(&col.ID, &col.ProjectID, &col.Name, &col.NameTH, &col.NameEN, &col.Position, &col.CreatedAt, &col.UpdatedAt); err != nil {
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
		SELECT pm.project_id, u.id, u.firstname || ' ' || COALESCE(u.lastname, ''), u.email,
		       CASE WHEN LOWER(pm.role) = 'owner' THEN 'Owner' WHEN LOWER(pm.role) = 'editor' THEN 'Editor' ELSE 'Viewer' END AS role,
		       COALESCE(u.avatar_url, ''), 'Active', pm.created_at
		FROM project_members pm
		JOIN users u ON pm.user_id = u.id
		WHERE pm.project_id = $1
		ORDER BY CASE WHEN LOWER(pm.role) = 'owner' THEN 1 WHEN LOWER(pm.role) = 'editor' THEN 2 ELSE 3 END, pm.created_at ASC
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

func RemoveProjectMember(projectID, targetUserID, requestingUserID string) error {
	// Verify requesting user is owner
	var requesterRole string
	roleQuery := `SELECT LOWER(role) FROM project_members WHERE project_id = $1 AND user_id = $2`
	err := DB.QueryRow(roleQuery, projectID, requestingUserID).Scan(&requesterRole)
	if err != nil || requesterRole != "owner" {
		return fmt.Errorf("only owner can remove members")
	}

	// Cannot remove owner
	var targetRole string
	err = DB.QueryRow(roleQuery, projectID, targetUserID).Scan(&targetRole)
	if err == nil && targetRole == "owner" {
		return fmt.Errorf("cannot remove project owner")
	}

	deleteQuery := `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`
	_, err = DB.Exec(deleteQuery, projectID, targetUserID)
	return err
}

func UpdateProjectMemberRole(projectID, targetUserID, requestingUserID, newRole string) error {
	// Verify requesting user is owner
	var requesterRole string
	roleQuery := `SELECT LOWER(role) FROM project_members WHERE project_id = $1 AND user_id = $2`
	err := DB.QueryRow(roleQuery, projectID, requestingUserID).Scan(&requesterRole)
	if err != nil || requesterRole != "owner" {
		return fmt.Errorf("only owner can update member roles")
	}

	updateQuery := `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3`
	_, err = DB.Exec(updateQuery, strings.ToLower(newRole), projectID, targetUserID)
	return err
}

func ToggleSubtask(subtaskID string) error {
	query := `UPDATE subtasks SET is_completed = NOT is_completed, updated_at = NOW() WHERE id = $1`
	_, err := DB.Exec(query, subtaskID)
	return err
}

func GetStarredProjects(userID string) ([]model.Project, error) {
	query := `
		SELECT p.id, p.title, COALESCE(p.description, ''), p.created_at, p.updated_at,
		       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS members_count
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
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt, &p.MembersCount); err != nil {
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

func CreateProjectInvitation(projectID, createdBy, role, token string) (*model.ProjectInvitation, error) {
	var inv model.ProjectInvitation
	query := `
		INSERT INTO project_invitations (project_id, created_by, role, token, expires_at)
		VALUES ($1, $2, $3, $4, NOW() + INTERVAL '3 days')
		RETURNING id, project_id, created_by, token, role, expires_at, created_at
	`
	err := DB.QueryRow(query, projectID, createdBy, role, token).Scan(
		&inv.ID, &inv.ProjectID, &inv.CreatedBy, &inv.Token, &inv.Role, &inv.ExpiresAt, &inv.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func GetInvitationByToken(token string) (*model.ProjectInvitation, error) {
	var inv model.ProjectInvitation
	query := `
		SELECT id, project_id, created_by, token, role, expires_at, created_at
		FROM project_invitations
		WHERE token = $1 AND expires_at > NOW()
	`
	err := DB.QueryRow(query, token).Scan(
		&inv.ID, &inv.ProjectID, &inv.CreatedBy, &inv.Token, &inv.Role, &inv.ExpiresAt, &inv.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func AcceptProjectInvitation(userID, projectID, role string) error {
	query := `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
	`
	_, err := DB.Exec(query, projectID, userID, role)
	return err
}

func TrackProjectView(userID, projectID string) error {
	// Only track view if user is actually a member of the project
	var isMember bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2)`
	err := DB.QueryRow(checkQuery, projectID, userID).Scan(&isMember)
	if err != nil || !isMember {
		return nil
	}

	// Upsert user_project_views record
	viewQuery := `
		INSERT INTO user_project_views (user_id, project_id, viewed_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id, project_id) DO UPDATE SET viewed_at = NOW()
	`
	_, err = DB.Exec(viewQuery, userID, projectID)
	return err
}

func GetUserRecentProjects(userID string, page, limit int) ([]model.Project, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	countQuery := `
		SELECT COUNT(*)
		FROM user_project_views v
		JOIN projects p ON v.project_id = p.id
		JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
		WHERE v.user_id = $1
	`
	var total int
	err := DB.QueryRow(countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT p.id, p.title, COALESCE(p.description, ''), p.created_at, p.updated_at, v.viewed_at,
		       (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) AS members_count,
		       EXISTS(SELECT 1 FROM user_starred_projects usp WHERE usp.user_id = $1 AND usp.project_id = p.id) AS is_starred
		FROM user_project_views v
		JOIN projects p ON v.project_id = p.id
		JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
		WHERE v.user_id = $1
		ORDER BY v.viewed_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := DB.Query(query, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	projects := []model.Project{}
	for rows.Next() {
		var p model.Project
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt, &p.LastViewedAt, &p.MembersCount, &p.IsStarred); err != nil {
			return nil, 0, err
		}
		projects = append(projects, p)
	}

	return projects, total, nil
}

