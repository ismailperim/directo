import { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { FilterBarSimple as FilterBar } from "./components/FilterBarSimple";
import { EnvironmentSection } from "./components/EnvironmentSection";
import { Footer } from "./components/Footer";
import { fetchServices, type Service } from "./api/services";

// Removed mock data - using API instead

// Load saved filters from localStorage
function loadFilters() {
  try {
    const saved = localStorage.getItem('directo-filters');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
  }
  return { environments: [], projects: [], tags: [], viewMode: 'environment' };
}

// Save filters to localStorage
function saveFilters(environments: string[], projects: string[], tags: string[], viewMode: string) {
  try {
    localStorage.setItem('directo-filters', JSON.stringify({ environments, projects, tags, viewMode }));
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load saved filters on mount
  const savedFilters = loadFilters();
  const [viewMode, setViewMode] = useState(savedFilters.viewMode || "environment");
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(savedFilters.environments || []);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(savedFilters.projects || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(savedFilters.tags || []);

  // Fetch services from API
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const data = await fetchServices();
        setServices(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFilters(selectedEnvironments, selectedProjects, selectedTags, viewMode);
  }, [selectedEnvironments, selectedProjects, selectedTags, viewMode]);

  // Get unique values for filters
  const availableEnvironments = useMemo(
    () => Array.from(new Set(services.map((s) => s.environment))),
    [services]
  );

  const availableProjects = useMemo(
    () => Array.from(new Set(services.map((s) => s.project))),
    [services]
  );

  const availableTags = useMemo(
    () => Array.from(new Set(services.flatMap((s) => s.tags))).sort(),
    [services]
  );

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.environment.toLowerCase().includes(query) ||
          service.project.toLowerCase().includes(query) ||
          service.group.toLowerCase().includes(query) ||
          service.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Environment filter
      if (
        selectedEnvironments.length > 0 &&
        !selectedEnvironments.includes(service.environment)
      ) {
        return false;
      }

      // Project filter
      if (
        selectedProjects.length > 0 &&
        !selectedProjects.includes(service.project)
      ) {
        return false;
      }

      // Tag filter
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => service.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [services, searchQuery, selectedEnvironments, selectedProjects, selectedTags]);

  // Group services by view mode
  const groupedServices = useMemo(() => {
    const groups: Record<string, Service[]> = {};

    filteredServices.forEach((service) => {
      const key =
        viewMode === "environment"
          ? service.environment
          : viewMode === "project"
          ? service.project
          : service.group;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(service);
    });

    return groups;
  }, [filteredServices, viewMode]);

  const handleEnvironmentToggle = (env: string) => {
    setSelectedEnvironments((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]
    );
  };

  const handleProjectToggle = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project) ? prev.filter((p) => p !== project) : [...prev, project]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedEnvironments([]);
    setSelectedProjects([]);
    setSelectedTags([]);
  };

  // Sort environment keys
  const sortedGroupKeys = Object.keys(groupedServices).sort((a, b) => {
    if (viewMode === "environment") {
      const order = ["dev", "staging", "production"];
      return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
    }
    return a.localeCompare(b);
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          viewMode="environment"
          onViewModeChange={() => {}}
        />
        <main className="container mx-auto px-6 py-8 flex-1">
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading services...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          viewMode="environment"
          onViewModeChange={() => {}}
        />
        <main className="container mx-auto px-6 py-8 flex-1">
          <div className="text-center py-16">
            <p className="text-destructive text-lg">Failed to load services</p>
            <p className="text-muted-foreground text-sm mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FilterBar
        selectedEnvironments={selectedEnvironments}
        selectedProjects={selectedProjects}
        selectedTags={selectedTags}
        availableEnvironments={availableEnvironments}
        availableProjects={availableProjects}
        availableTags={availableTags}
        onEnvironmentToggle={handleEnvironmentToggle}
        onProjectToggle={handleProjectToggle}
        onTagToggle={handleTagToggle}
        onClearFilters={handleClearFilters}
      />

      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="space-y-10">
          {sortedGroupKeys.length > 0 ? (
            sortedGroupKeys.map((groupKey) => (
              <EnvironmentSection
                key={groupKey}
                environment={groupKey}
                services={groupedServices[groupKey]}
                color="primary"
              />
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No services found matching your filters
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
