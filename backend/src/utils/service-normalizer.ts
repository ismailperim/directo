import { Service, LinkItem } from '../core/config-loader';

export interface ServiceLink {
  name: string;
  url: string;
  healthy: boolean | null;
}

export interface ServiceEnvironment {
  name: string;
  links: ServiceLink[];
}

export interface NormalizedService {
  id: string;
  name: string;
  description: string;
  tags: string[];
  project: string;
  group: string;
  icon: string;
  repository?: string;
  environments: ServiceEnvironment[];
}

/**
 * Normalize a service from YAML format to frontend-friendly format
 * Groups all environments under a single service entry
 */
export function normalizeServices(services: Service[]): NormalizedService[] {
  const normalized: NormalizedService[] = [];

  for (const service of services) {
    // Group links by environment
    const environments: ServiceEnvironment[] = [];

    for (const linkGroup of service.links) {
      const envName = linkGroup.environment || 'unknown';
      
      environments.push({
        name: envName,
        links: linkGroup.items.map((item: LinkItem) => ({
          name: item.name,
          url: item.url,
          healthy: null, // Will be populated by health checker
        })),
      });
    }

    // Create a single normalized service with all environments
    normalized.push({
      id: service.id,
      name: service.name,
      description: service.description || '',
      tags: service.tags || [],
      project: service.team || 'Unknown',
      group: getGroupFromTags(service.tags || []),
      icon: service.icon || '🔗',
      repository: service.repository,
      environments,
    });
  }

  return normalized;
}

/**
 * Determine group based on tags
 */
function getGroupFromTags(tags: string[]): string {
  if (tags.includes('frontend') || tags.includes('webapp')) {
    return 'Frontend';
  }
  if (tags.includes('backend') || tags.includes('microservice') || tags.includes('api')) {
    return 'Backend';
  }
  if (tags.includes('infrastructure') || tags.includes('database') || tags.includes('cache')) {
    return 'Infrastructure';
  }
  if (tags.includes('monitoring')) {
    return 'Monitoring';
  }
  return 'Other';
}
