const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const currRoutes = require('./routes/currRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const assessRoutes = require('./routes/assessRoutes');
const resultRoutes = require('./routes/resultRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/curriculum', currRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assessments', assessRoutes);
app.use('/api', resultRoutes); // Mount /responses and /results under /api
app.use('/api/ai', aiRoutes);

// Base check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI-Powered Literacy Assistant API' });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
