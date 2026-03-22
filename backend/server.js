const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

// Middleware - FIXED: Use environment variable for CORS origin
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session and Passport middleware - FIXED: Cookie settings for production
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Import passport config
require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import database for socket.io
const db = require('./config/db');

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Register user with their ID
    socket.on('register-user', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ User ${userId} registered with socket ${socket.id}`);
        
        // Broadcast online status
        io.emit('user-online', { userId, online: true });
    });

    // Send message
    socket.on('send-message', async (data) => {
        const { senderId, receiverId, message, jobId } = data;
        
        try {
            // Save message to database
            const [result] = await db.query(
                `INSERT INTO messages (sender_id, receiver_id, job_id, message) 
                 VALUES (?, ?, ?, ?)`,
                [senderId, receiverId, jobId || null, message]
            );
            
            const messageData = {
                message_id: result.insertId,
                sender_id: senderId,
                receiver_id: receiverId,
                message,
                job_id: jobId,
                created_at: new Date(),
                is_read: false
            };
            
            // Send to receiver if online
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('new-message', messageData);
            }
            
            // Confirm to sender
            socket.emit('message-sent', messageData);
            
            // Create notification for offline user
            if (!receiverSocketId) {
                await db.query(
                    `INSERT INTO notifications (user_id, title, message, type, link)
                     VALUES (?, ?, ?, ?, ?)`,
                    [receiverId, 'New Message', `You have a new message`, 'message', '/messages']
                );
            }
            
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });

    // Mark message as read
    socket.on('mark-read', async (messageId) => {
        try {
            await db.query(
                'UPDATE messages SET is_read = TRUE WHERE message_id = ?',
                [messageId]
            );
            socket.emit('message-read', messageId);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    });

    // User typing indicator
    socket.on('typing', (data) => {
        const { receiverId, isTyping } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user-typing', {
                userId: socket.userId,
                isTyping
            });
        }
    });

    // Join conversation room
    socket.on('join-conversation', (otherUserId) => {
        const room = `chat_${Math.min(socket.userId, otherUserId)}_${Math.max(socket.userId, otherUserId)}`;
        socket.join(room);
        console.log(`User ${socket.userId} joined room ${room}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user-online', { userId: socket.userId, online: false });
            console.log(`🔌 User ${socket.userId} disconnected`);
        }
    });
});

// Make io available to routes
app.set('io', io);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);  // UNCOMMENTED
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'HireLink API is running',
        version: '2.0',
        status: 'active',
        environment: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at http://localhost:${PORT}`);
    console.log(`Socket.io ready for real-time messaging`);
});