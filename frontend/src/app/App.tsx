import { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { EnvironmentSection } from "./components/EnvironmentSection";
import { fetchServices, type Service } from "./api/services";

// Removed mock data - using API instead

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("environment");
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Get unique values for filters
  const availableEnvironments = useMemo(
    () => Array.from(new Set(services.map((s) => s.environment))),
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

      // Tag filter
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => service.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [services, searchQuery, selectedEnvironments, selectedTags]);

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

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedEnvironments([]);
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
      <div className="min-h-screen bg-background">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          viewMode="environment"
          onViewModeChange={() => {}}
        />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading services...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          viewMode="environment"
          onViewModeChange={() => {}}
        />
        <main className="container mx-auto px-6 py-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FilterBar
        selectedEnvironments={selectedEnvironments}
        selectedTags={selectedTags}
        availableEnvironments={availableEnvironments}
        availableTags={availableTags}
        onEnvironmentToggle={handleEnvironmentToggle}
        onTagToggle={handleTagToggle}
        onClearFilters={handleClearFilters}
      />

      <main className="container mx-auto px-6 py-8">
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
    </div>
  );
}
