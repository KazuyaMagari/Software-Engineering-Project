import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// API: Get tasks by email
app.get('/api/tasks', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Query for user tasks
    const result = await pool.query(
      `SELECT tasks.* FROM tasks
       JOIN users ON tasks.creator_id = users.id
       WHERE users.email = $1
       ORDER BY tasks.due_date ASC`,
      [email]
    );

    res.json({
      success: true,
      email,
      taskCount: result.rows.length,
      tasks: result.rows,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// API: Create user if not exists
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.json({
        success: true,
        message: 'User already exists',
        userId: existingUser.rows[0].id,
      });
    }

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (email, auth0_id) VALUES ($1, $2) RETURNING id, email',
      [email, `firebase|${Date.now()}`]
    );

    res.json({
      success: true,
      message: 'User created',
      userId: newUser.rows[0].id,
      email: newUser.rows[0].email,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});