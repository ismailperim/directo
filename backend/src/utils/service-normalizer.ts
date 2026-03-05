import { Service, LinkItem } from '../core/config-loader';

export interface NormalizedService {
  id: string;
  name: string;
  description: string;
  tags: string[];
  environment: string;
  project: string;
  group: string;
  icon: string;
  links: Array<{
    name: string;
    url: string;
    healthy: boolean | null;
  }>;
}

/**
 * Normalize a service from YAML format to frontend-friendly format
 * Splits services by environment so each environment gets its own service entry
 */
export function normalizeServices(services: Service[]): NormalizedService[] {
  const normalized: NormalizedService[] = [];

  for (const service of services) {
    // Group links by environment
    const linksByEnv = new Map<string, typeof service.links[0]['items']>();

    for (const linkGroup of service.links) {
      const env = linkGroup.environment || 'unknown';
      if (!linksByEnv.has(env)) {
        linksByEnv.set(env, []);
      }
      linksByEnv.get(env)!.push(...linkGroup.items);
    }

    // Create a normalized service for each environment
    for (const [environment, items] of linksByEnv.entries()) {
      normalized.push({
        id: `${service.id}-${environment}`,
        name: service.name,
        description: service.description || '',
        tags: service.tags || [],
        environment,
        project: service.team || 'Unknown',
        group: getGroupFromTags(service.tags || []),
        icon: service.icon || '🔗',
        links: items.map((item: LinkItem) => ({
          name: item.name,
          url: item.url,
          healthy: null, // Will be populated by health check
        })),
      });
    }
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
