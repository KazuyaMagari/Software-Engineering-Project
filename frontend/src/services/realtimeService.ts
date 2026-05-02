import { io, Socket } from 'socket.io-client';
import { auth } from '../auth/Auth';

// Extract base server URL from API URL (remove /api path)
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  console.log('[RealtimeClient] VITE_API_URL:', apiUrl);
  // If it ends with /api, remove it. Otherwise use as-is
  const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  console.log('[RealtimeClient] Socket URL:', socketUrl);
  return socketUrl;
};

const SOCKET_URL = getSocketUrl();

class RealtimeClient {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Connect to the real-time server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
        console.log('[RealtimeClient] Already connected');
        return; // Already connected
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      this.userId = user.uid;
        console.log('[RealtimeClient] Attempting to connect to:', SOCKET_URL);

      // Create socket connection
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Setup event handlers
      this.setupEventHandlers();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not initialized'));
          return;
        }
          const connectTimeout = setTimeout(
            () => reject(new Error('Connection timeout after 5 seconds')),
            5000
          );

        this.socket.once('connect', () => {
            clearTimeout(connectTimeout);
            console.log('✅ Real-time connection established', { socketId: this.socket?.id });
          resolve();
        });

          this.socket.once('connect_error', (error: any) => {
            clearTimeout(connectTimeout);
            console.error('[RealtimeClient] Connection error:', error);
            reject(error);
          });

          this.socket.once('error', (error: any) => {
            clearTimeout(connectTimeout);
            console.error('[RealtimeClient] Socket error:', error);
            reject(error);
          });
      });

      // Join user's room
      if (this.socket && this.userId) {
          console.log('[RealtimeClient] Joining user room:', `user_${this.userId}`);
        this.socket.emit('join_user_room', this.userId);
      }
    } catch (error) {
        console.error('[RealtimeClient] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the real-time server
   */
  disconnect(): void {
    if (this.socket?.connected && this.userId) {
      this.socket.emit('leave_user_room', this.userId);
    }
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
  }

  /**
   * Setup all event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Task events
    this.socket.on('task_created', (task) => {
        console.log('[RealtimeClient] Received task_created:', task);
      this.emit('task_created', task);
    });

    this.socket.on('task_updated', (task) => {
        console.log('[RealtimeClient] Received task_updated:', task);
      this.emit('task_updated', task);
    });

    this.socket.on('task_deleted', (data) => {
        console.log('[RealtimeClient] Received task_deleted:', data);
      this.emit('task_deleted', data);
    });

    this.socket.on('task_status_changed', (data) => {
        console.log('[RealtimeClient] Received task_status_changed:', data);
      this.emit('task_status_changed', data);
    });

    this.socket.on('task_shared', (data) => {
        console.log('[RealtimeClient] Received task_shared:', data);
      this.emit('task_shared', data);
    });

    this.socket.on('task_unshared', (data) => {
        console.log('[RealtimeClient] Received task_unshared:', data);
      this.emit('task_unshared', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
        console.log('[RealtimeClient] Received notification:', data);
      this.emit('notification', data);
    });

    // Connection events
    this.socket.on('disconnect', () => {
      console.log('❌ Real-time connection lost');
      this.emit('connection_lost');
    });

    this.socket.on('connect_error', (error) => {
        console.error('[RealtimeClient] connect_error event:', error);
      this.emit('connection_error', error);
    });
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit a local event
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const realtimeClient = new RealtimeClient();
