import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { firebaseInitialized } from '../config/firebase';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies Firebase ID token
 * Extracts user information and adds to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        details: 'Please include Authorization header with Bearer token'
      });
      return;
    }

    // Check if Firebase is initialized
    if (!firebaseInitialized) {
      console.error('Firebase Admin SDK is not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
      res.status(500).json({ 
        error: 'Authentication service not configured',
        details: 'Firebase Admin SDK is not properly initialized on the server'
      });
      return;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };

      next();
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      res.status(401).json({ 
        error: 'Invalid or expired token',
        details: error instanceof Error ? error.message : 'Token verification failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}
