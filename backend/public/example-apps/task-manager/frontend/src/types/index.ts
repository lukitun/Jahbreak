export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'viewer';
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  position: number;
  tags: string[];
  assignedTo?: string;
  createdBy: string;
  taskListId: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  assignee?: User;
  creator?: User;
  taskList?: TaskList;
  parentTask?: Task;
  subtasks?: Task[];
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  creator?: User;
  tasks?: Task[];
  members?: TaskListMember[];
}

export interface TaskListMember {
  id: string;
  userId: string;
  taskListId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
  taskList?: TaskList;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  taskListId: string;
  parentTaskId?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  position?: number;
}

export interface CreateTaskListRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTaskListRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TaskFilters {
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  taskListId?: string;
  includeSubtasks?: boolean;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface SocketEvents {
  // Task events
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (data: { id: string }) => void;
  'tasks:reordered': (tasks: { id: string; position: number }[]) => void;
  
  // Task list events
  'taskList:updated': (taskList: TaskList) => void;
  'taskList:deleted': (data: { id: string }) => void;
  
  // Member events
  'member:added': (data: { taskListId: string; member: User; role: string }) => void;
  'member:removed': (data: { taskListId: string; memberId: string }) => void;
  'member:roleUpdated': (data: { taskListId: string; memberId: string; role: string }) => void;
  
  // User presence events
  'user:online': (data: { userId: string; user: User; timestamp: string }) => void;
  'user:offline': (data: { userId: string; timestamp: string }) => void;
  'presence:updated': (data: { userId: string; status: string; timestamp: string }) => void;
  
  // Collaboration events
  'typing:start': (data: { userId: string; user: User; taskId: string; timestamp: string }) => void;
  'typing:stop': (data: { userId: string; taskId: string; timestamp: string }) => void;
  'task:focused': (data: { userId: string; user: User; taskId: string; timestamp: string }) => void;
  'task:blurred': (data: { userId: string; taskId: string; timestamp: string }) => void;
  
  // Room events
  'joined:taskList': (data: { taskListId: string }) => void;
  'left:taskList': (data: { taskListId: string }) => void;
  
  // Error events
  'error': (data: { message: string }) => void;
}

export interface ThemeMode {
  mode: 'light' | 'dark';
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}

export interface TypingUser {
  userId: string;
  user: User;
  taskId: string;
  timestamp: string;
}

export interface FocusedTask {
  userId: string;
  user: User;
  taskId: string;
  timestamp: string;
}

export interface OnlineUser {
  userId: string;
  user: User;
  lastSeen: string;
}