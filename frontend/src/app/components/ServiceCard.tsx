import { ExternalLink, Github, Server, FlaskConical, Laptop, Cloud, Zap, Globe, Shield, Code } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { cn } from "./ui/utils";

interface Link {
  name: string;
  url: string;
  healthy: boolean | null;
}

interface ServiceEnvironment {
  name: string;
  links: Link[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  tags: string[];
  environments: ServiceEnvironment[];
  icon: string;
  repository?: string;
}

interface EnvironmentStyle {
  color: 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'gray' | 'indigo' | 'pink' | 'cyan';
  icon: 'server' | 'flask' | 'laptop' | 'cloud' | 'zap' | 'globe' | 'shield' | 'code';
}

interface ServiceCardProps {
  service: Service;
  selectedEnvironments?: string[];
  environmentStyles?: Record<string, EnvironmentStyle>;
}

// Icon mapping
const iconMap = {
  server: Server,
  flask: FlaskConical,
  laptop: Laptop,
  cloud: Cloud,
  zap: Zap,
  globe: Globe,
  shield: Shield,
  code: Code,
};

// Color class mapping
const colorMap = {
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-700 dark:text-red-400',
    icon: 'text-red-500 dark:text-red-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900/50',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-900/50',
    text: 'text-green-700 dark:text-green-400',
    icon: 'text-green-500 dark:text-green-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900/50',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-500 dark:text-blue-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-900/50',
    text: 'text-purple-700 dark:text-purple-400',
    icon: 'text-purple-500 dark:text-purple-400',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-900/50',
    text: 'text-gray-700 dark:text-gray-400',
    icon: 'text-gray-500 dark:text-gray-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-900/50',
    text: 'text-indigo-700 dark:text-indigo-400',
    icon: 'text-indigo-500 dark:text-indigo-400',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    border: 'border-pink-200 dark:border-pink-900/50',
    text: 'text-pink-700 dark:text-pink-400',
    icon: 'text-pink-500 dark:text-pink-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-900/50',
    text: 'text-cyan-700 dark:text-cyan-400',
    icon: 'text-cyan-500 dark:text-cyan-400',
  },
};

// Default environment styles (fallback if no custom styles provided)
const defaultEnvironmentStyles: Record<string, EnvironmentStyle> = {
  production: { color: 'red', icon: 'server' },
  prod: { color: 'red', icon: 'server' },
  live: { color: 'red', icon: 'server' },
  staging: { color: 'amber', icon: 'flask' },
  uat: { color: 'amber', icon: 'flask' },
  'pre-prod': { color: 'amber', icon: 'flask' },
  preprod: { color: 'amber', icon: 'flask' },
  development: { color: 'green', icon: 'laptop' },
  dev: { color: 'green', icon: 'laptop' },
  local: { color: 'green', icon: 'laptop' },
};

// Helper function to get environment styling
function getEnvironmentStyle(
  envName: string,
  customStyles?: Record<string, EnvironmentStyle>
): { icon: typeof Server; colors: typeof colorMap.gray } {
  const name = envName.toLowerCase();
  
  // First check custom styles from YAML
  const customStyle = customStyles?.[name] || customStyles?.[envName];
  if (customStyle) {
    const IconComponent = iconMap[customStyle.icon];
    const colors = colorMap[customStyle.color];
    return { icon: IconComponent, colors };
  }
  
  // Then check defaults
  const defaultStyle = defaultEnvironmentStyles[name];
  if (defaultStyle) {
    const IconComponent = iconMap[defaultStyle.icon];
    const colors = colorMap[defaultStyle.color];
    return { icon: IconComponent, colors };
  }
  
  // Fallback to gray server
  return {
    icon: Server,
    colors: colorMap.gray,
  };
}

export function ServiceCard({ service, selectedEnvironments = [], environmentStyles }: ServiceCardProps) {
  // Filter environments if filter is active
  const visibleEnvironments = selectedEnvironments.length > 0
    ? service.environments.filter((env) => selectedEnvironments.includes(env.name))
    : service.environments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full relative">
        {/* GitHub Repository Link */}
        {service.repository && (
          <a
            href={service.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent transition-colors group/repo"
            title="View Repository"
          >
            <Github className="w-4 h-4 text-muted-foreground group-hover/repo:text-primary transition-colors" />
          </a>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors text-lg">
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {service.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {service.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {visibleEnvironments.map((env, envIndex) => {
              const envStyle = getEnvironmentStyle(env.name, environmentStyles);
              const EnvIcon = envStyle.icon;
              const colors = envStyle.colors;
              
              return (
                <div key={env.name} className={cn(envIndex > 0 && "pt-3 border-t border-border")}>
                  {/* Environment Label */}
                  <div className={cn(
                    "flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-md border",
                    colors.bg,
                    colors.border
                  )}>
                    <EnvIcon className={cn("w-3.5 h-3.5", colors.icon)} />
                    <span className={cn("text-sm font-semibold", colors.text)}>
                      {env.name}
                    </span>
                  </div>
                
                  {/* Links for this environment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {env.links.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border",
                          "transition-all duration-200",
                          "hover:bg-accent hover:border-primary/50",
                          "group/link"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full shadow-sm",
                              link.healthy === null && "bg-gray-400 shadow-gray-400/50",
                              link.healthy === true && "bg-green-500 shadow-green-500/50",
                              link.healthy === false && "bg-red-500 shadow-red-500/50"
                            )}
                          />
                          <span className="font-medium text-sm">{link.name}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
