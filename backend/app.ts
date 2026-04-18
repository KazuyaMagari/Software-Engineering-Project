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

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ============================================================================
// API: Get tasks by email
// ============================================================================
app.get('/api/tasks', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

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

// ============================================================================
// API: Create task
// ============================================================================
app.post('/api/tasks', async (req, res) => {
  try {
    const { email, title, description, priority, status, due_date } = req.body;

    if (!email || !title) {
      return res.status(400).json({ error: 'Email and title are required' });
    }

    // Validate and format due_date
    let formattedDueDate = null;
    if (due_date && due_date.trim()) {
      // Try to parse various date formats
      let dateObj: Date | null = null;
      
      // Try YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
        dateObj = new Date(due_date + 'T00:00:00Z');
      } else if (due_date) {
        // Try other formats (this is a fallback)
        dateObj = new Date(due_date);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        // Convert to YYYY-MM-DD format
        formattedDueDate = dateObj.toISOString().split('T')[0];
      }
    }

    // Get user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const creator_id = userResult.rows[0].id;

    // Create task
    const taskResult = await pool.query(
      `INSERT INTO tasks (creator_id, title, description, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [creator_id, title, description || null, priority || 'Medium', status || 'Open', formattedDueDate]
    );

    res.json({
      success: true,
      message: 'Task created',
      task: taskResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ============================================================================
// API: Register user if not exists
// ============================================================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

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