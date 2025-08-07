/**
 * This is a API server for BiuBiuStar social platform
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import usersRoutes from './routes/users.js';
import postsRoutes from './routes/posts.js';
import eventsRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

const app: express.Application = express();

// CORS配置
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 请求解析中间件
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// 请求日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// 安全头部
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
// TODO: 添加更多路由
// app.use('/api/comments', commentsRoutes);
// app.use('/api/upload', uploadRoutes);

/**
 * Root welcome route
 */
app.get('/', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BiuBiuStar API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      events: '/api/events',
      admin: '/api/admin',
      contact: '/api/contact',
      health: '/api/health'
    },
    documentation: 'https://github.com/your-repo/biubiustar-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'BiuBiuStar API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;