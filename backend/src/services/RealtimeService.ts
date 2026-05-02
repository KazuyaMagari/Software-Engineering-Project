import { Server } from 'socket.io';

export class RealtimeService {
  private static io: Server;

  /**
   * Initialize the Socket.io server instance
   */
  static setIOInstance(ioInstance: Server) {
    this.io = ioInstance;
  }

  /**
   * Emit task created event to a user's room
   */
  static emitTaskCreated(userId: string, task: any) {
    this.io.to(`user_${userId}`).emit('task_created', task);
  }

  /**
   * Emit task updated event to a user's room
   */
  static emitTaskUpdated(userId: string, task: any) {
    this.io.to(`user_${userId}`).emit('task_updated', task);
  }

  /**
   * Emit task deleted event to a user's room
   */
  static emitTaskDeleted(userId: string, taskId: string) {
    this.io.to(`user_${userId}`).emit('task_deleted', { taskId });
  }

  /**
   * Emit task status changed event
   */
  static emitTaskStatusChanged(userId: string, taskId: string, status: string) {
    this.io.to(`user_${userId}`).emit('task_status_changed', { taskId, status });
  }

  /**
   * Emit task shared event to the user who receives sharing
   */
  static emitTaskShared(userId: string, task: any, sharedBy: string) {
    this.io.to(`user_${userId}`).emit('task_shared', { task, sharedBy });
  }

  /**
   * Emit task unshared event
   */
  static emitTaskUnshared(userId: string, taskId: string, unsharedBy: string) {
    this.io.to(`user_${userId}`).emit('task_unshared', { taskId, unsharedBy });
  }

  /**
   * Broadcast to all users (for analytics or global events)
   */
  static broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}