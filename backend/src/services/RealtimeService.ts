import { Server } from 'socket.io';

export class RealtimeService {
  private static io: Server;

  /**
   * Initialize the Socket.io server instance
   */
  static setIOInstance(ioInstance: Server) {
    this.io = ioInstance;
    console.log('[RealtimeService] Socket.io instance initialized');
  }

  /**
   * Emit task created event to a user's room
   */
  static emitTaskCreated(userId: string, task: any) {
    console.log('[RealtimeService] Emitting task_created to', `user_${userId}`, task);
    this.io.to(`user_${userId}`).emit('task_created', task);
  }

  /**
   * Emit task updated event to a user's room
   */
  static emitTaskUpdated(userId: string, task: any) {
    console.log('[RealtimeService] Emitting task_updated to', `user_${userId}`, task);
    this.io.to(`user_${userId}`).emit('task_updated', task);
  }

  /**
   * Emit task deleted event to a user's room
   */
  static emitTaskDeleted(userId: string, taskId: string) {
    console.log('[RealtimeService] Emitting task_deleted to', `user_${userId}`, taskId);
    this.io.to(`user_${userId}`).emit('task_deleted', { taskId });
  }

  /**
   * Emit task status changed event
   */
  static emitTaskStatusChanged(userId: string, taskId: string, status: string) {
    console.log('[RealtimeService] Emitting task_status_changed to', `user_${userId}`, { taskId, status });
    this.io.to(`user_${userId}`).emit('task_status_changed', { taskId, status });
  }

  /**
   * Emit task shared event to the user who receives sharing
   */
  static emitTaskShared(userId: string, task: any, sharedBy: string) {
    console.log('[RealtimeService] Emitting task_shared to', `user_${userId}`, { task: task.id, sharedBy });
    this.io.to(`user_${userId}`).emit('task_shared', { task, sharedBy });
  }

  /**
   * Emit task unshared event
   */
  static emitTaskUnshared(userId: string, taskId: string, unsharedBy: string) {
    console.log('[RealtimeService] Emitting task_unshared to', `user_${userId}`, { taskId, unsharedBy });
    this.io.to(`user_${userId}`).emit('task_unshared', { taskId, unsharedBy });
  }

  /**
   * Broadcast to all users (for analytics or global events)
   */
  static broadcast(event: string, data: any) {
    console.log('[RealtimeService] Broadcasting', event, data);
    this.io.emit(event, data);
  }

  /**
   * Send notification to a specific user
   */
  static sendNotification(userId: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
    console.log('[RealtimeService] Sending notification to', `user_${userId}`, { message, type });
    this.io.to(`user_${userId}`).emit('notification', { message, type });
  }
}