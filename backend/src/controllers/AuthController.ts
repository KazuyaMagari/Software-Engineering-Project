import { Request, Response } from 'express';
import { User } from '../models/User';

export class AuthController {
  /**
   * Register or get user
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.getOrCreate(email);

      return res.json({
        success: true,
        message: user ? 'User authenticated' : 'User created',
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }
}
