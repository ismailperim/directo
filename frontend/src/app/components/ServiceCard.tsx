import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { cn } from "./ui/utils";

interface Link {
  name: string;
  url: string;
  healthy: boolean | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  tags: string[];
  links: Link[];
  icon: string;
}

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors text-xl">
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription className="mt-1">
                {service.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {service.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {service.links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  "transition-all duration-200",
                  "hover:bg-accent hover:border-primary/50",
                  "group/link"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shadow-md",
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
