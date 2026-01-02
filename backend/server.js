require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const setupSocket = require('./socket');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');

const app = express();
app.use(helmet());
app.use(express.json());

const defaultOrigins = ['http://localhost:3000', 'http://localhost:8080', 'file://'];
const corsEnv = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...corsEnv]));

app.use(cors({ origin: allowedOrigins, credentials: true }));

const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = http.createServer(app);
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
      },
      pingInterval: 25000,
      pingTimeout: 60000
    });
    setupSocket(io);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();