import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TaskController } from '../controllers/TaskController';

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
router.put('/tasks/status', TaskController.updateTaskStatus);
router.delete('/tasks', TaskController.deleteTask);

export default router;
