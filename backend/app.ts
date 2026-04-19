import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRoutes from './src/routes/api';

const app = express();
const port = process.env.PORT || 3000;

// ============================================================================
// Middleware
// ============================================================================
app.use(cors());
app.use(express.json());

// ============================================================================
// Routes
// ============================================================================
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

// API routes
app.use('/api', apiRoutes);

// ============================================================================
// Error Handling
// ============================================================================
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});