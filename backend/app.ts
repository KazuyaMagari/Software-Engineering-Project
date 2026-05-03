import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import './src/config/firebase'; // Initialize Firebase Admin SDK
import apiRoutes from './src/routes/api';
import { RealtimeService } from './src/services/RealtimeService';

const app = express();
const port = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

let server: http.Server | undefined;
let io: Server | undefined;

if (!isVercel) {
  // Create HTTP server for Socket.io in local development
  server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize RealtimeService with io instance
  RealtimeService.setIOInstance(io);
}

// ============================================================================
// Middleware
// ============================================================================
app.use(cors());
app.use(express.json());

// Make io accessible to routes/controllers when available
app.locals.io = io;

// ============================================================================
// Routes
// ============================================================================
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

// API routes
app.use('/api', apiRoutes);

// ============================================================================
// Socket.io Event Handlers
// ============================================================================
if (io) {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join a room based on user ID (sent from frontend after auth)
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });

    // Leave room
    socket.on('leave_user_room', (userId: string) => {
      socket.leave(`user_${userId}`);
      console.log(`User ${userId} left room: user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}

// ============================================================================
// Error Handling
// ============================================================================
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


if (!isVercel && server) {
  server.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
    console.log(`✅ Socket.io server ready for real-time updates`);
  });
}

export default app;