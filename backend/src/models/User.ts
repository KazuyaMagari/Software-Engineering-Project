import pool from '../config/database';

export interface IUser {
  id: string;
  email: string;
  auth0_id: string;
  firebase_uid?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export class User {
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE auth0_id = $1',
        [firebaseUid]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by Firebase UID:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create(email: string, auth0_id: string): Promise<IUser> {
    try {
      const result = await pool.query(
        'INSERT INTO users (email, auth0_id) VALUES ($1, $2) RETURNING *',
        [email, auth0_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get or create user by Firebase UID and email
   */
  static async getOrCreateByFirebaseUid(firebaseUid: string, email: string): Promise<IUser> {
    try {
      // First, try to find by Firebase UID
      let user = await this.findByFirebaseUid(firebaseUid);
      if (user) {
        return user;
      }

      // If not found by UID, try to find by email
      user = await this.findByEmail(email);
      if (user) {
        // Update user with Firebase UID
        const result = await pool.query(
          'UPDATE users SET auth0_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [firebaseUid, user.id]
        );
        return result.rows[0];
      }

      // If neither exists, create new user
      user = await this.create(email, firebaseUid);
      return user;
    } catch (error) {
      console.error('Error in getOrCreateByFirebaseUid:', error);
      throw error;
    }
  }

  /**
   * Get or create user by email (deprecated - use getOrCreateByFirebaseUid)
   */
  static async getOrCreate(email: string): Promise<IUser> {
    try {
      let user = await this.findByEmail(email);
      if (!user) {
        user = await this.create(email, `firebase|${Date.now()}`);
      }
      return user;
    } catch (error) {
      console.error('Error in getOrCreate:', error);
      throw error;
    }
  }
}
