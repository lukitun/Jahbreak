import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task, TaskList, User, TypingUser, FocusedTask, OnlineUser } from '@/types';
import socketService from '@/utils/socket';
import { useAuth } from './AuthContext';

interface SocketContextType {
  connected: boolean;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  focusedTasks: FocusedTask[];
  joinTaskList: (taskListId: string) => void;
  leaveTaskList: (taskListId: string) => void;
  startTyping: (taskListId: string, taskId: string) => void;
  stopTyping: (taskListId: string, taskId: string) => void;
  focusTask: (taskListId: string, taskId: string) => void;
  blurTask: (taskListId: string, taskId: string) => void;
  updatePresence: (status?: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onTasksReordered?: (tasks: { id: string; position: number }[]) => void;
  onTaskListUpdated?: (taskList: TaskList) => void;
  onTaskListDeleted?: (taskListId: string) => void;
  onMemberAdded?: (data: { taskListId: string; member: User; role: string }) => void;
  onMemberRemoved?: (data: { taskListId: string; memberId: string }) => void;
  onMemberRoleUpdated?: (data: { taskListId: string; memberId: string; role: string }) => void;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTasksReordered,
  onTaskListUpdated,
  onTaskListDeleted,
  onMemberAdded,
  onMemberRemoved,
  onMemberRoleUpdated,
}) => {
  const { isAuthenticated, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [focusedTasks, setFocusedTasks] = useState<FocusedTask[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = socketService.connect(token);

      // Connection events
      socketService.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socketService.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Task events
      socketService.on('task:created', (task: Task) => {
        console.log('Task created:', task);
        onTaskCreated?.(task);
      });

      socketService.on('task:updated', (task: Task) => {
        console.log('Task updated:', task);
        onTaskUpdated?.(task);
      });

      socketService.on('task:deleted', (data: { id: string }) => {
        console.log('Task deleted:', data.id);
        onTaskDeleted?.(data.id);
      });

      socketService.on('tasks:reordered', (tasks: { id: string; position: number }[]) => {
        console.log('Tasks reordered:', tasks);
        onTasksReordered?.(tasks);
      });

      // Task list events
      socketService.on('taskList:updated', (taskList: TaskList) => {
        console.log('Task list updated:', taskList);
        onTaskListUpdated?.(taskList);
      });

      socketService.on('taskList:deleted', (data: { id: string }) => {
        console.log('Task list deleted:', data.id);
        onTaskListDeleted?.(data.id);
      });

      // Member events
      socketService.on('member:added', (data: { taskListId: string; member: User; role: string }) => {
        console.log('Member added:', data);
        onMemberAdded?.(data);
      });

      socketService.on('member:removed', (data: { taskListId: string; memberId: string }) => {
        console.log('Member removed:', data);
        onMemberRemoved?.(data);
      });

      socketService.on('member:roleUpdated', (data: { taskListId: string; memberId: string; role: string }) => {
        console.log('Member role updated:', data);
        onMemberRoleUpdated?.(data);
      });

      // Presence events
      socketService.on('user:online', (data: { userId: string; user: User; timestamp: string }) => {
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { userId: data.userId, user: data.user, lastSeen: data.timestamp }];
        });
      });

      socketService.on('user:offline', (data: { userId: string; timestamp: string }) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      // Collaboration events
      socketService.on('typing:start', (data: TypingUser) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId || u.taskId !== data.taskId);
          return [...filtered, data];
        });
      });

      socketService.on('typing:stop', (data: { userId: string; taskId: string }) => {
        setTypingUsers(prev => prev.filter(u => !(u.userId === data.userId && u.taskId === data.taskId)));
      });

      socketService.on('task:focused', (data: FocusedTask) => {
        setFocusedTasks(prev => {
          const filtered = prev.filter(f => f.userId !== data.userId);
          return [...filtered, data];
        });
      });

      socketService.on('task:blurred', (data: { userId: string; taskId: string }) => {
        setFocusedTasks(prev => prev.filter(f => !(f.userId === data.userId && f.taskId === data.taskId)));
      });

      // Error handling
      socketService.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        socketService.disconnect();
        setConnected(false);
        setOnlineUsers([]);
        setTypingUsers([]);
        setFocusedTasks([]);
      };
    }
  }, [isAuthenticated, token]);

  // Clean up typing indicators that are too old
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setTypingUsers(prev => 
        prev.filter(user => {
          const timeDiff = now.getTime() - new Date(user.timestamp).getTime();
          return timeDiff < 10000; // Remove typing indicators older than 10 seconds
        })
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  const joinTaskList = (taskListId: string) => {
    socketService.joinTaskList(taskListId);
  };

  const leaveTaskList = (taskListId: string) => {
    socketService.leaveTaskList(taskListId);
  };

  const startTyping = (taskListId: string, taskId: string) => {
    socketService.startTyping(taskListId, taskId);
  };

  const stopTyping = (taskListId: string, taskId: string) => {
    socketService.stopTyping(taskListId, taskId);
  };

  const focusTask = (taskListId: string, taskId: string) => {
    socketService.focusTask(taskListId, taskId);
  };

  const blurTask = (taskListId: string, taskId: string) => {
    socketService.blurTask(taskListId, taskId);
  };

  const updatePresence = (status: string = 'active') => {
    socketService.updatePresence(status);
  };

  const value: SocketContextType = {
    connected,
    onlineUsers,
    typingUsers,
    focusedTasks,
    joinTaskList,
    leaveTaskList,
    startTyping,
    stopTyping,
    focusTask,
    blurTask,
    updatePresence,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};