import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import authRoutes from './routes/auth';
import serviceProviderRoutes from './routes/serviceProvider';
import serviceCategoryRoutes from './routes/serviceCategory';
import servicesRoutes from './routes/services';
import bookingsRoutes from './routes/bookings';
import providerRoutes from './routes/provider';
import conversationRoutes from './routes/conversations';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true
  }
});

// Make socket instance available to controllers
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Add specific rate limiter for login attempts
// Block IP after X failed attempts

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/souk-al-khadamat')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/service-providers', serviceProviderRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// --- Socket.IO Chat Events ---
interface UserSocketMap {
  [userId: string]: string; // userId -> socketId
}
const userSocketMap: UserSocketMap = {};

io.on('connection', (socket: Socket) => {
  // Authenticate user (for demo, userId is sent as query param)
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // Join room for private messages
  }

  // Join conversation room
  socket.on('joinConversation', (conversationId: string) => {
    socket.join(conversationId);
  });

  // Leave conversation room
  socket.on('leaveConversation', (conversationId: string) => {
    socket.leave(conversationId);
  });

  // Handle sending a message
  socket.on('sendMessage', (data: any) => {
    // data: { conversationId, message }
    // Broadcast to all in the conversation room
    io.to(data.conversationId).emit('newMessage', data.message);
  });

  // Handle marking as read
  socket.on('markAsRead', (data: any) => {
    // data: { conversationId, userId }
    io.to(data.conversationId).emit('messagesRead', { conversationId: data.conversationId, userId: data.userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 