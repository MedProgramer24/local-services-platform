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
import paymentRoutes from './routes/payments';
import path from 'path';

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Make socket instance available to controllers
app.set('io', io);

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use('/api/payments', paymentRoutes);

// Specific route for serving images with CORS headers
app.get('/uploads/chat/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/chat/images', filename);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Set appropriate content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  if (mimeTypes[ext]) {
    res.header('Content-Type', mimeTypes[ext]);
  }
  
  // Serve the file
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Specific route for serving audio files with CORS headers
app.get('/uploads/chat/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const audioPath = path.join(__dirname, '../uploads/chat/audio', filename);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Accept-Ranges', 'bytes');
  
  // Set appropriate content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.m4a': 'audio/mp4'
  };
  
  if (mimeTypes[ext]) {
    res.header('Content-Type', mimeTypes[ext]);
  }
  
  // Serve the file
  res.sendFile(audioPath, (err) => {
    if (err) {
      console.error('Error serving audio:', err);
      res.status(404).json({ error: 'Audio file not found' });
    }
  });
});

// Serve uploaded files with comprehensive CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all origins
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Add cache control headers for images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000');
    res.header('Content-Type', 'image/' + req.path.split('.').pop());
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Additional headers for static files
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
}));

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
  console.log('=== SOCKET CONNECTION ===');
  console.log('Socket ID:', socket.id);
  
  // Authenticate user (for demo, userId is sent as query param)
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // Join room for private messages
    console.log('User joined personal room:', userId);
    console.log('Total connected users:', Object.keys(userSocketMap).length);
  }

  // Join conversation room
  socket.on('joinConversation', (conversationId: string) => {
    console.log('=== JOINING CONVERSATION ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', userId);
    console.log('Conversation ID:', conversationId);
    
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation room: ${conversationId}`);
    
    // Get all sockets in this room
    io.in(conversationId).fetchSockets().then(sockets => {
      console.log(`Room ${conversationId} now has ${sockets.length} participants`);
    });
  });

  // Leave conversation room
  socket.on('leaveConversation', (conversationId: string) => {
    console.log('=== LEAVING CONVERSATION ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', userId);
    console.log('Conversation ID:', conversationId);
    
    socket.leave(conversationId);
    console.log(`User ${userId} left conversation room: ${conversationId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', (data: any) => {
    console.log('=== SOCKET SEND MESSAGE ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', userId);
    console.log('Data:', data);
    
    // data: { conversationId, message }
    // Broadcast to all in the conversation room
    io.to(data.conversationId).emit('newMessage', data.message);
    console.log(`Message broadcasted to conversation room: ${data.conversationId}`);
  });

  // Handle marking as read
  socket.on('markAsRead', (data: any) => {
    console.log('=== MARK AS READ ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', userId);
    console.log('Data:', data);
    
    // data: { conversationId, userId }
    io.to(data.conversationId).emit('messageRead', { conversationId: data.conversationId, userId: data.userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('=== SOCKET DISCONNECT ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', userId);
    
    if (userId) {
      delete userSocketMap[userId];
      console.log('User removed from socket map');
      console.log('Remaining connected users:', Object.keys(userSocketMap).length);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 