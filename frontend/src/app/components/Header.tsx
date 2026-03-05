import { Search, LayoutGrid, List, Layers } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Badge } from "./ui/badge";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: string;
  onViewModeChange: (value: string) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Directo</h1>
                <p className="text-sm text-muted-foreground">
                  Navigate your services
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services, projects, or tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    By Environment
                  </div>
                </SelectItem>
                <SelectItem value="project">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    By Project
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    By Group
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
