import 'dotenv/config';
import express from 'express';
import { logger } from './utils/logger';
import { healthRouter } from './api/health';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRouter);

app.get('/', (req, res) => {
  res.json({
    name: 'Directo',
    version: '0.1.0',
    status: 'running',
    description: 'Navigate your organization\'s knowledge graph',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Directo server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
