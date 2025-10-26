const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====

// Security
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Serve static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====

app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PDF to Excel Converter API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: 'POST /api/upload',
      batches: 'GET /api/batches',
      batchStatus: 'GET /api/batches/:batchId/status',
      downloadExcel: 'GET /api/batches/:batchId/download',
      templates: 'GET /api/templates',
      customFields: 'GET /api/custom-fields'
    }
  });
});

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Create upload directories
    const fs = require('fs').promises;
    const uploadDirs = ['uploads/pdfs', 'uploads/exports'];

    for (const dir of uploadDirs) {
      await fs.mkdir(path.join(__dirname, '../', dir), { recursive: true });
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('  PDF to Excel Converter API');
      console.log('========================================');
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Database: ${process.env.DB_NAME}`);
      console.log('========================================');
      console.log('');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
