import { Router } from 'express';
import { ConfigLoader } from '../core/config-loader';
import { logger } from '../utils/logger';
import { normalizeServices } from '../utils/service-normalizer';

export function createServicesRouter(configLoader: ConfigLoader): Router {
  const router = Router();

  /**
   * GET /api/services
   * Get all services with optional filtering
   */
  router.get('/', (req, res) => {
    try {
      const { environment, team, tag } = req.query;

      // Get raw services and normalize them
      let rawServices = configLoader.getServices();
      let normalized = normalizeServices(rawServices);

      // Filter by environment
      if (environment && typeof environment === 'string') {
        normalized = normalized.filter((s) => s.environment === environment);
      }

      // Filter by team/project
      if (team && typeof team === 'string') {
        normalized = normalized.filter((s) => s.project === team);
      }

      // Filter by tag
      if (tag && typeof tag === 'string') {
        normalized = normalized.filter((s) => s.tags?.includes(tag));
      }

      res.json({
        services: normalized,
        count: normalized.length,
      });
    } catch (error) {
      logger.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  /**
   * GET /api/services/:id
   * Get a specific service by ID
   */
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const service = configLoader.getService(id);

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      res.json(service);
    } catch (error) {
      logger.error('Error fetching service:', error);
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  });

  /**
   * GET /api/environments
   * Get all unique environments
   */
  router.get('/meta/environments', (_req, res) => {
    try {
      const environments = configLoader.getEnvironments();
      res.json({ environments });
    } catch (error) {
      logger.error('Error fetching environments:', error);
      res.status(500).json({ error: 'Failed to fetch environments' });
    }
  });

  /**
   * GET /api/groups
   * Get custom groups
   */
  router.get('/meta/groups', (_req, res) => {
    try {
      const groups = configLoader.getGroups();
      res.json({ groups });
    } catch (error) {
      logger.error('Error fetching groups:', error);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });

  /**
   * GET /api/settings
   * Get global settings
   */
  router.get('/meta/settings', (_req, res) => {
    try {
      const settings = configLoader.getSettings();
      res.json(settings);
    } catch (error) {
      logger.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  /**
   * POST /api/reload
   * Reload configuration from disk
   */
  router.post('/reload', (_req, res) => {
    try {
      const config = configLoader.reload();
      res.json({
        message: 'Configuration reloaded successfully',
        servicesCount: config.services.length,
      });
    } catch (error) {
      logger.error('Error reloading configuration:', error);
      res.status(500).json({ error: 'Failed to reload configuration' });
    }
  });

  return router;
}
