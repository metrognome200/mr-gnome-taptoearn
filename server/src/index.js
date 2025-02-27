require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const TelegramBot = require('node-telegram-bot-api');
const { Server } = require('socket.io');
const http = require('http');
const winston = require('winston');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

// Setup Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.logger = logger;
    next();
});

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
app.set('supabase', supabase);

// Telegram Bot Setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
app.set('bot', bot);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Routes Import
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const miningRoutes = require('./routes/miningRoutes');
const taskRoutes = require('./routes/taskRoutes');
const airdropRoutes = require('./routes/airdropRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/airdrops', airdropRoutes);
app.use('/api/achievements', achievementRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Start server
server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});