import 'dotenv/config';
import express from 'express';
import path from 'path';
import { logger } from './utils/logger';
import { healthRouter } from './api/health';
import { createServicesRouter } from './api/services';
import { createHealthCheckRouter } from './api/health-check';
import { ConfigLoader } from './core/config-loader';
import { HealthChecker } from './core/health-checker';

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICES_CONFIG = process.env.SERVICES_CONFIG || './services.yml';
const HEALTH_CACHE_TTL = parseInt(process.env.HEALTH_CACHE_TTL || '300', 10);

// Initialize config loader and health checker
const configLoader = new ConfigLoader(SERVICES_CONFIG);
const healthChecker = new HealthChecker(HEALTH_CACHE_TTL);

// Load configuration on startup
try {
  configLoader.load();
  logger.info('Configuration loaded successfully');
} catch (error) {
  logger.error('Failed to load configuration:', error);
  logger.warn('Starting server anyway - configuration can be loaded later');
}

// Middleware
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes (must come before static files)
app.use('/health', healthRouter);
app.use('/api/services', createServicesRouter(configLoader));
app.use('/api/health-check', createHealthCheckRouter(configLoader, healthChecker));

// Serve static files (frontend) - only in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Catch-all: serve index.html for SPA routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
