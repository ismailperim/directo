import { Filter, X, ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState } from "react";

interface FilterBarProps {
  selectedEnvironments: string[];
  selectedProjects: string[];
  selectedTags: string[];
  availableEnvironments: string[];
  availableProjects: string[];
  availableTags: string[];
  onEnvironmentToggle: (env: string) => void;
  onProjectToggle: (project: string) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function FilterBarSimple({
  selectedEnvironments,
  selectedProjects,
  selectedTags,
  availableEnvironments,
  availableProjects,
  availableTags,
  onEnvironmentToggle,
  onProjectToggle,
  onTagToggle,
  onClearFilters,
}: FilterBarProps) {
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  
  const hasActiveFilters =
    selectedEnvironments.length > 0 || selectedProjects.length > 0 || selectedTags.length > 0;

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          {/* Environment Filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
              className="flex items-center gap-2"
            >
              Environments
              {selectedEnvironments.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5">
                  {selectedEnvironments.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {envDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[200px] z-50">
                <div className="text-sm font-semibold px-2 py-1.5 text-foreground">
                  Select Environments
                </div>
                <div className="border-t border-border my-1" />
                {availableEnvironments.map((env) => (
                  <label
                    key={env}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEnvironments.includes(env)}
                      onChange={() => onEnvironmentToggle(env)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm capitalize">{env}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Project Filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2"
            >
              Projects
              {selectedProjects.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5">
                  {selectedProjects.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {projectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[200px] z-50">
                <div className="text-sm font-semibold px-2 py-1.5 text-foreground">
                  Select Projects
                </div>
                <div className="border-t border-border my-1" />
                {availableProjects.map((project) => (
                  <label
                    key={project}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project)}
                      onChange={() => onProjectToggle(project)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm">{project}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
              className="flex items-center gap-2"
            >
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5">
                  {selectedTags.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {tagDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[200px] z-50 max-h-[300px] overflow-y-auto">
                <div className="text-sm font-semibold px-2 py-1.5 text-foreground">
                  Select Tags
                </div>
                <div className="border-t border-border my-1" />
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => onTagToggle(tag)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 flex-wrap">
                {selectedEnvironments.map((env) => (
                  <Badge
                    key={env}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {env}
                    <button
                      onClick={() => onEnvironmentToggle(env)}
                      className="hover:bg-background/50 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedProjects.map((project) => (
                  <Badge
                    key={project}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {project}
                    <button
                      onClick={() => onProjectToggle(project)}
                      className="hover:bg-background/50 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      onClick={() => onTagToggle(tag)}
                      className="hover:bg-background/50 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(envDropdownOpen || projectDropdownOpen || tagDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setEnvDropdownOpen(false);
            setProjectDropdownOpen(false);
            setTagDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
}
