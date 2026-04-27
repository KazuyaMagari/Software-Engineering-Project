import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TaskController } from '../controllers/TaskController';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

// ============================================================================
// Auth Routes
// ============================================================================
router.post('/auth/register', AuthController.register);

// ============================================================================
// Task Routes
// ============================================================================
router.get('/tasks', TaskController.getTasksByEmail);
router.post('/tasks', TaskController.createTask);
router.put('/tasks', TaskController.updateTask);
router.put('/tasks/status', TaskController.updateTaskStatus);
router.delete('/tasks', TaskController.deleteTask);

// ============================================================================
// Analytics Routes
// ============================================================================
router.get('/analytics/stats', AnalyticsController.getTaskStats);
router.get('/analytics/status-breakdown', AnalyticsController.getStatusBreakdown);
router.get('/analytics/priority-breakdown', AnalyticsController.getPriorityBreakdown);
router.get('/analytics/completion-trends', AnalyticsController.getCompletionTrends);
router.get('/analytics/performance-metrics', AnalyticsController.getPerformanceMetrics);
router.get('/analytics/team-performance', AnalyticsController.getTeamPerformance);

export default router;
