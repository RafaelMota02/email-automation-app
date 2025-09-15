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
  "https://email-automation-app-t8ar.onrender.com", // Render deployment
  "https://email-automation-app.vercel.app", // Additional Vercel deployment
  "https://email-automation-app.onrender.com", // Render frontend (alt)
  "https://email-automation-3uv584nfh-dwayceprdc-7227s-projects.vercel.app" // New Vercel preview
];

const app = express();
const server = http.createServer(app);

// Socket.IO with shared CORS logic
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, curl
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for REST API
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl, Postman, etc.
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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
    credentials: true,
    optionsSuccessStatus: 200
  })
);

// Explicitly handle preflight requests
app.options("*", (req, res) => {
  res.sendStatus(200);
});

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

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Run migrations in production and start server
(async () => {
if (process.env.NODE_ENV === 'production') {
  try {
    const knexConfig = require('./knexfile');
    const knex = require('knex')(knexConfig.production);
    await knex.migrate.latest();
    console.log('Migrations run successfully in production');
  } catch (error) {
    console.error('Failed to run migrations in production:', error);
    process.exit(1);
  }
}

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// Export app for testing
module.exports = app;
