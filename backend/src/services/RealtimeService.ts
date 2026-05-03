import { Server } from 'socket.io';

export class RealtimeService {
  private static io: Server | undefined;

  /**
   * Initialize the Socket.io server instance
   */
  static setIOInstance(ioInstance: Server) {
    this.io = ioInstance;
  }

  private static emit(event: string, room: string, payload: any) {
    if (!this.io) {
      return;
    }

    this.io.to(room).emit(event, payload);
  }

  /**
   * Emit task created event to a user's room
   */
  static emitTaskCreated(userId: string, task: any) {
    this.emit('task_created', `user_${userId}`, task);
  }

  /**
   * Emit task updated event to a user's room
   */
  static emitTaskUpdated(userId: string, task: any) {
    this.emit('task_updated', `user_${userId}`, task);
  }

  /**
   * Emit task deleted event to a user's room
   */
  static emitTaskDeleted(userId: string, taskId: string) {
    this.emit('task_deleted', `user_${userId}`, { taskId });
  }

  /**
   * Emit task status changed event
   */
  static emitTaskStatusChanged(userId: string, taskId: string, status: string) {
    this.emit('task_status_changed', `user_${userId}`, { taskId, status });
  }

  /**
   * Emit task shared event to the user who receives sharing
   */
  static emitTaskShared(userId: string, task: any, sharedBy: string) {
    this.emit('task_shared', `user_${userId}`, { task, sharedBy });
  }

  /**
   * Emit task unshared event
   */
  static emitTaskUnshared(userId: string, taskId: string, unsharedBy: string) {
    this.emit('task_unshared', `user_${userId}`, { taskId, unsharedBy });
  }

  /**
   * Broadcast to all users (for analytics or global events)
   */
  static broadcast(event: string, data: any) {
    if (!this.io) {
      return;
    }

    this.io.emit(event, data);
  }
}