import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TaskController } from '../controllers/TaskController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ============================================================================
// Auth Routes
// ============================================================================
// Register or get user (requires authentication)
router.post('/auth/register', authMiddleware, AuthController.register);

// Get current user info (requires authentication)
router.get('/auth/me', authMiddleware, AuthController.getCurrentUser);

// ============================================================================
// Task Routes (all protected with authentication)
// ============================================================================
// Get all accessible tasks (owned + shared) - MUST come before /tasks
router.get('/tasks/accessible', authMiddleware, TaskController.getAccessibleTasks);

// Get all tasks for authenticated user
router.get('/tasks', authMiddleware, TaskController.getTasks);

// Create a new task
router.post('/tasks', authMiddleware, TaskController.createTask);

// Share a task with another user
router.post('/tasks/share', authMiddleware, TaskController.shareTask);

// Unshare a task
router.post('/tasks/unshare', authMiddleware, TaskController.unshareTask);

// Get shares for a task
router.get('/tasks/shares', authMiddleware, TaskController.getTaskShares);

// Update task status
router.put('/tasks/status', authMiddleware, TaskController.updateTaskStatus);

// Update full task
router.put('/tasks', authMiddleware, TaskController.updateTask);

// Delete a task
router.delete('/tasks', authMiddleware, TaskController.deleteTask);

// ============================================================================
// Analytics Routes (all protected with authentication)
// ============================================================================
router.get('/analytics/stats', authMiddleware, AnalyticsController.getTaskStats);
router.get('/analytics/status-breakdown', authMiddleware, AnalyticsController.getStatusBreakdown);
router.get('/analytics/priority-breakdown', authMiddleware, AnalyticsController.getPriorityBreakdown);
router.get('/analytics/completion-trends', authMiddleware, AnalyticsController.getCompletionTrends);
router.get('/analytics/performance-metrics', authMiddleware, AnalyticsController.getPerformanceMetrics);
router.get('/analytics/team-performance', authMiddleware, AnalyticsController.getTeamPerformance);

export default router;
