import { Router } from 'express';
import { ConfigLoader } from '../core/config-loader';
import { HealthChecker } from '../core/health-checker';
import { logger } from '../utils/logger';

export function createHealthCheckRouter(
  configLoader: ConfigLoader,
  healthChecker: HealthChecker
): Router {
  const router = Router();

  /**
   * POST /api/health-check/batch
   * Check health for multiple links
   * Body: { checks: [{ serviceId, linkGroupIndex, linkIndex }] }
   */
  router.post('/batch', async (req, res) => {
    try {
      const { checks } = req.body;

      if (!Array.isArray(checks)) {
        res.status(400).json({ error: 'checks must be an array' });
        return;
      }

      const results = await Promise.all(
        checks.map(async (check) => {
          const { serviceId, linkGroupIndex, linkIndex } = check;

          try {
            const service = configLoader.getService(serviceId);
            if (!service) {
              return {
                serviceId,
                linkGroupIndex,
                linkIndex,
                result: {
                  status: 'error',
                  error: 'Service not found',
                  timestamp: Date.now(),
                },
              };
            }

            const linkGroup = service.links[linkGroupIndex];
            if (!linkGroup) {
              return {
                serviceId,
                linkGroupIndex,
                linkIndex,
                result: {
                  status: 'error',
                  error: 'Link group not found',
                  timestamp: Date.now(),
                },
              };
            }

            const link = linkGroup.items[linkIndex];
            if (!link) {
              return {
                serviceId,
                linkGroupIndex,
                linkIndex,
                result: {
                  status: 'error',
                  error: 'Link not found',
                  timestamp: Date.now(),
                },
              };
            }

            // Skip if health check is disabled
            if (!link.health_check) {
              return {
                serviceId,
                linkGroupIndex,
                linkIndex,
                result: {
                  status: 'unknown',
                  timestamp: Date.now(),
                },
              };
            }

            // Perform health check
            const result = await healthChecker.check(link.url, link.health_check);

            return {
              serviceId,
              linkGroupIndex,
              linkIndex,
              result,
            };
          } catch (error) {
            logger.error('Error checking health:', error);
            return {
              serviceId,
              linkGroupIndex,
              linkIndex,
              result: {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
              },
            };
          }
        })
      );

      res.json({ results });
    } catch (error) {
      logger.error('Error processing batch health checks:', error);
      res.status(500).json({ error: 'Failed to process health checks' });
    }
  });

  /**
   * GET /api/health-check/:serviceId/:linkGroupIndex/:linkIndex
   * Check health for a single link
   */
  router.get('/:serviceId/:linkGroupIndex/:linkIndex', async (req, res) => {
    try {
      const { serviceId, linkGroupIndex, linkIndex } = req.params;
      const groupIdx = parseInt(linkGroupIndex, 10);
      const linkIdx = parseInt(linkIndex, 10);

      const service = configLoader.getService(serviceId);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      const linkGroup = service.links[groupIdx];
      if (!linkGroup) {
        res.status(404).json({ error: 'Link group not found' });
        return;
      }

      const link = linkGroup.items[linkIdx];
      if (!link) {
        res.status(404).json({ error: 'Link not found' });
        return;
      }

      if (!link.health_check) {
        res.json({
          status: 'unknown',
          timestamp: Date.now(),
        });
        return;
      }

      const result = await healthChecker.check(link.url, link.health_check);
      res.json(result);
    } catch (error) {
      logger.error('Error checking health:', error);
      res.status(500).json({ error: 'Failed to check health' });
    }
  });

  /**
   * POST /api/health-check/clear-cache
   * Clear health check cache
   */
  router.post('/clear-cache', (_req, res) => {
    try {
      healthChecker.clearCache();
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      logger.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  return router;
}
