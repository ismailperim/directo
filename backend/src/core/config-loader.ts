import fs from 'fs';
import yaml from 'js-yaml';
import { logger } from '../utils/logger';

export interface HealthCheckConfig {
  enabled: boolean;
  url?: string;
  method?: string;
  expected_status?: number;
  mode?: 'server-side' | 'client-side';
  provider?: 'prometheus';
  query?: string;
  endpoint?: string;
}

export interface LinkItem {
  name: string;
  url: string;
  icon?: string;
  health_check?: boolean | HealthCheckConfig;
}

export interface LinkGroup {
  label: string;
  environment: string;
  items: LinkItem[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  tags?: string[];
  team?: string;
  owner?: string;
  repository?: string;
  links: LinkGroup[];
}

export interface CustomGroup {
  name: string;
  type: 'project' | 'category' | 'team';
  services: string[];
}

export interface GlobalSettings {
  default_view?: 'environment' | 'project' | 'team' | 'category' | 'custom';
  theme?: 'light' | 'dark' | 'auto';
  health_check?: {
    enabled?: boolean;
    interval?: number;
    timeout?: number;
  };
}

export interface ServicesConfig {
  version: string;
  settings?: GlobalSettings;
  services: Service[];
  groups?: CustomGroup[];
}

export class ConfigLoader {
  private configPath: string;
  private config: ServicesConfig | null = null;
  private lastModified: number = 0;

  constructor(configPath: string = './services.yml') {
    this.configPath = configPath;
  }

  /**
   * Load configuration from YAML file
   */
  load(): ServicesConfig {
    try {
      const stats = fs.statSync(this.configPath);
      const mtime = stats.mtimeMs;

      // Check if config needs reload
      if (this.config && this.lastModified === mtime) {
        return this.config;
      }

      logger.info(`Loading configuration from ${this.configPath}`);
      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.load(fileContents) as ServicesConfig;

      // Validate basic structure
      if (!config.version) {
        throw new Error('Configuration version is required');
      }

      if (!config.services || !Array.isArray(config.services)) {
        throw new Error('Services array is required');
      }

      // Validate services
      config.services.forEach((service, index) => {
        if (!service.id) {
          throw new Error(`Service at index ${index} is missing 'id'`);
        }
        if (!service.name) {
          throw new Error(`Service '${service.id}' is missing 'name'`);
        }
        if (!service.links || !Array.isArray(service.links)) {
          throw new Error(`Service '${service.id}' is missing 'links' array`);
        }
      });

      this.config = config;
      this.lastModified = mtime;

      logger.info(`Loaded ${config.services.length} services`);
      return config;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to load configuration: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get configuration (load if needed)
   */
  getConfig(): ServicesConfig {
    if (!this.config) {
      return this.load();
    }
    return this.config;
  }

  /**
   * Reload configuration from disk
   */
  reload(): ServicesConfig {
    this.config = null;
    this.lastModified = 0;
    return this.load();
  }

  /**
   * Get service by ID
   */
  getService(id: string): Service | undefined {
    const config = this.getConfig();
    return config.services.find((s) => s.id === id);
  }

  /**
   * Get all services
   */
  getServices(): Service[] {
    const config = this.getConfig();
    return config.services;
  }

  /**
   * Get services by environment
   */
  getServicesByEnvironment(environment: string): Service[] {
    const config = this.getConfig();
    return config.services.filter((service) =>
      service.links.some((group) => group.environment === environment)
    );
  }

  /**
   * Get all unique environments
   */
  getEnvironments(): string[] {
    const config = this.getConfig();
    const environments = new Set<string>();

    config.services.forEach((service) => {
      service.links.forEach((group) => {
        if (group.environment) {
          environments.add(group.environment);
        }
      });
    });

    return Array.from(environments).sort();
  }

  /**
   * Get custom groups
   */
  getGroups(): CustomGroup[] {
    const config = this.getConfig();
    return config.groups || [];
  }

  /**
   * Get global settings
   */
  getSettings(): GlobalSettings {
    const config = this.getConfig();
    return config.settings || {};
  }
}
