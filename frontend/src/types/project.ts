export interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  user_avatar?: string;
  action: string;
  target: string;
  time: string;
  icon_type: "move" | "comment" | "create" | "complete";
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignees?: string[];
  start_date?: string;
  due_date?: string;
  labels?: string[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer";
  avatar_url?: string;
  status: "Active" | "Pending";
}
