import { Request, Response } from 'express';
import { User } from '../models/User';

export class AuthController {
  /**
   * Get current user info (requires authentication)
   */
  static async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  }

  /**
   * Register or get user by Firebase UID (called after Firebase authentication on frontend)
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - please authenticate first' });
      }

      // Get or create user in database
      const user = await User.getOrCreateByFirebaseUid(req.user.uid, req.user.email);

      return res.json({
        success: true,
        message: 'User registered/authenticated',
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Register or get user by email (deprecated - use register with authenticated user)
   */
}
