import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
};

export const formatDueDate = (dueDate: string | Date): string => {
  if (!dueDate) return '';
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  } else if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'HH:mm')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  } else if (dateObj < now) {
    return `Overdue - ${format(dateObj, 'MMM dd, yyyy')}`;
  } else {
    return format(dateObj, 'MMM dd, yyyy');
  }
};

// Priority utilities
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return '#f44336'; // Red
    case 'medium':
      return '#ff9800'; // Orange
    case 'low':
      return '#4caf50'; // Green
    default:
      return '#9e9e9e'; // Grey
  }
};

export const getPriorityIcon = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '⚪';
  }
};

// Status utilities
export const getStatusColor = (status: 'todo' | 'in_progress' | 'done'): string => {
  switch (status) {
    case 'todo':
      return '#9e9e9e'; // Grey
    case 'in_progress':
      return '#2196f3'; // Blue
    case 'done':
      return '#4caf50'; // Green
    default:
      return '#9e9e9e';
  }
};

export const getStatusLabel = (status: 'todo' | 'in_progress' | 'done'): string => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return 'Unknown';
  }
};

// User utilities
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// Task utilities
export const isTaskOverdue = (dueDate: string | Date | null): boolean => {
  if (!dueDate) return false;
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return dateObj < new Date();
};

export const getTaskProgress = (tasks: any[]): { completed: number; total: number; percentage: number } => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
};

// Color utilities
export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// URL utilities
export const createTaskUrl = (taskId: string): string => {
  return `/tasks/${taskId}`;
};

export const createTaskListUrl = (taskListId: string): string => {
  return `/lists/${taskListId}`;
};

export const createUserUrl = (userId: string): string => {
  return `/users/${userId}`;
};

// Storage utilities
export const setStorageItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Array utilities
export const reorderArray = <T>(array: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const groupBy = <T>(array: T[], key: keyof T): { [key: string]: T[] } => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Theme utilities
export const getThemeMode = (): 'light' | 'dark' => {
  return getStorageItem('theme', 'light');
};

export const setThemeMode = (mode: 'light' | 'dark'): void => {
  setStorageItem('theme', mode);
};

// Task sorting utilities
export const sortTasks = (tasks: any[], sortBy: 'dueDate' | 'priority' | 'created' | 'updated' = 'created'): any[] => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};