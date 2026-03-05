import { logger } from '../utils/logger';
import type { HealthCheckConfig } from './config-loader';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'error' | 'unknown';
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  timestamp: number;
  mode?: 'server-side' | 'client-side';
}

export class HealthChecker {
  private cache: Map<string, HealthCheckResult> = new Map();
  private cacheTimeout: number;

  constructor(cacheTimeoutSeconds: number = 300) {
    this.cacheTimeout = cacheTimeoutSeconds * 1000;
  }

  /**
   * Check health of a URL
   */
  async check(
    url: string,
    config: boolean | HealthCheckConfig = true
  ): Promise<HealthCheckResult> {
    // Generate cache key
    const cacheKey = this.getCacheKey(url, config);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    // Determine check mode
    const checkConfig = this.normalizeConfig(config);

    // Client-side check - return pending status
    if (checkConfig.mode === 'client-side') {
      const result: HealthCheckResult = {
        status: 'unknown',
        timestamp: Date.now(),
        mode: 'client-side',
      };
      return result;
    }

    // Prometheus provider - not implemented yet
    if (checkConfig.provider === 'prometheus') {
      logger.warn('Prometheus health checks not implemented yet');
      const result: HealthCheckResult = {
        status: 'unknown',
        timestamp: Date.now(),
        error: 'Prometheus checks not implemented',
      };
      return result;
    }

    // Server-side HTTP check
    const targetUrl = checkConfig.url || url;
    const result = await this.performHttpCheck(
      targetUrl,
      checkConfig.method || 'GET',
      checkConfig.expected_status || 200,
      checkConfig.timeout || 5000
    );

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Perform HTTP health check
   */
  private async performHttpCheck(
    url: string,
    method: string,
    _expectedStatus: number,
    timeoutMs: number
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // For HTTPS URLs, use HTTP instead to avoid cert validation issues
      const checkUrl = url.replace(/^https:\/\//i, 'http://');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(checkUrl, {
        method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Directo/1.0 HealthChecker',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      // Consider 2xx and 3xx as healthy (redirects are OK)
      const isHealthy = response.status >= 200 && response.status < 400;

      logger.debug(`Health check: ${url} → ${response.status} → ${isHealthy ? 'healthy' : 'unhealthy'}`);

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        latencyMs,
        timestamp: Date.now(),
        mode: 'server-side',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      if (error instanceof Error) {
        // Timeout error
        if (error.name === 'AbortError') {
          return {
            status: 'error',
            latencyMs,
            error: `Timeout after ${timeoutMs}ms`,
            timestamp: Date.now(),
            mode: 'server-side',
          };
        }

        // Network error
        return {
          status: 'error',
          latencyMs,
          error: error.message,
          timestamp: Date.now(),
          mode: 'server-side',
        };
      }

      return {
        status: 'error',
        latencyMs,
        error: 'Unknown error',
        timestamp: Date.now(),
        mode: 'server-side',
      };
    }
  }

  /**
   * Normalize health check config
   */
  private normalizeConfig(config: boolean | HealthCheckConfig): {
    enabled: boolean;
    url?: string;
    method?: string;
    expected_status?: number;
    mode?: 'server-side' | 'client-side';
    provider?: string;
    timeout?: number;
  } {
    if (typeof config === 'boolean') {
      return { enabled: config };
    }

    return {
      enabled: config.enabled !== false,
      url: config.url,
      method: config.method,
      expected_status: config.expected_status,
      mode: config.mode,
      provider: config.provider,
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, config: boolean | HealthCheckConfig): string {
    const configStr = typeof config === 'boolean' ? 'default' : JSON.stringify(config);
    return `${url}:${configStr}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
