import { Filter, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface FilterBarProps {
  selectedEnvironments: string[];
  selectedTags: string[];
  availableEnvironments: string[];
  availableTags: string[];
  onEnvironmentToggle: (env: string) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  selectedEnvironments,
  selectedTags,
  availableEnvironments,
  availableTags,
  onEnvironmentToggle,
  onTagToggle,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedEnvironments.length > 0 || selectedTags.length > 0;

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Environments
                {selectedEnvironments.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 min-w-5 h-5">
                    {selectedEnvironments.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Environments</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableEnvironments.map((env) => (
                <DropdownMenuCheckboxItem
                  key={env}
                  checked={selectedEnvironments.includes(env)}
                  onCheckedChange={() => onEnvironmentToggle(env)}
                >
                  {env}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 min-w-5 h-5">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => onTagToggle(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
    </div>
  );
}
