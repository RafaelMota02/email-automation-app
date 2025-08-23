const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");
require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaigns");
const databaseRoutes = require("./routes/databases");
const smtpRoutes = require("./routes/smtp");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://email-automation-app-rho.vercel.app/",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: 'https://email-automation-app-rho.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  preflightContinue: false
};

// Handle preflight requests first
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/databases", databaseRoutes);
app.use("/api/smtp", smtpRoutes);

// Store io instance in app for use in routes
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // When a client joins a room (user room for private messaging)
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
