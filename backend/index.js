const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaigns");
const databaseRoutes = require("./routes/databases");
const smtpRoutes = require("./routes/smtp");

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
  "https://email-automation-app-rho.vercel.app", // production frontend
  "https://email-automation-app-t8ar.onrender.com" // Render deployment
];

const app = express();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Content-Disposition",
    "Accept",
    "Origin",
    "X-Requested-With"
  ],
  exposedHeaders: ["Content-Disposition"],
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/databases", databaseRoutes);
app.use("/api/smtp", smtpRoutes);

// Store Socket.IO instance in app for route use
app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Root route to avoid Render fallback CSP errors
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
