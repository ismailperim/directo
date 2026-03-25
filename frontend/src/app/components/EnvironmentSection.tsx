import { ServiceCard } from "./ServiceCard";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

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
}

interface EnvironmentSectionProps {
  environment: string;
  services: Service[];
  color: string;
  selectedEnvironments?: string[];
}

const colorMap: Record<string, string> = {
  dev: "bg-green-500/10 text-green-500 border-green-500/20",
  staging: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  production: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function EnvironmentSection({
  environment,
  services,
  color,
  selectedEnvironments = [],
}: EnvironmentSectionProps) {
  const colorClass = colorMap[environment.toLowerCase()] || colorMap.dev;

  // For "all" view, don't show section header
  const showHeader = environment !== "all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {showHeader && (
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`${colorClass} px-3 py-1 tracking-wider font-semibold`}
          >
            {environment}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {services.length} {services.length === 1 ? "service" : "services"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} selectedEnvironments={selectedEnvironments} />
        ))}
      </div>
    </motion.div>
  );
}
