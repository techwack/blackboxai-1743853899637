const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db-cjs');
const routes = require('./routes/index-cjs');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Attach io instance to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Socket.io for real-time bidding
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('placeBid', (bidData) => {
    io.emit('newBid', bidData);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});