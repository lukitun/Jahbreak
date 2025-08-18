import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      autoConnect: true,
    });

    this.setupEventListeners();
    this.setupReconnectionLogic();

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private setupReconnectionLogic(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server disconnected - don't reconnect automatically
        return;
      }

      // Client disconnected - attempt to reconnect
      this.attemptReconnection();
    });
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  // Event subscription methods
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    this.socket?.on(event, callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  // Room management
  joinTaskList(taskListId: string): void {
    this.emit('join:taskList', taskListId);
  }

  leaveTaskList(taskListId: string): void {
    this.emit('leave:taskList', taskListId);
  }

  // Collaboration events
  startTyping(taskListId: string, taskId: string): void {
    this.emit('typing:start', { taskListId, taskId });
  }

  stopTyping(taskListId: string, taskId: string): void {
    this.emit('typing:stop', { taskListId, taskId });
  }

  focusTask(taskListId: string, taskId: string): void {
    this.emit('task:focus', { taskListId, taskId });
  }

  blurTask(taskListId: string, taskId: string): void {
    this.emit('task:blur', { taskListId, taskId });
  }

  updatePresence(status: string = 'active'): void {
    this.emit('presence:update', { status });
  }

  // Connection status
  get connected(): boolean {
    return this.socket?.connected || false;
  }

  get id(): string | undefined {
    return this.socket?.id;
  }
}

export default new SocketService();