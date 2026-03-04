// State
let services = [];
let environments = [];
let groups = [];
let settings = {};
let currentView = 'environment';
let healthResults = new Map(); // Map of "serviceId:groupIdx:linkIdx" -> health result
let activeFilters = {
  environments: [],
  teams: [],
  tags: [],
  services: []
};

// Load preferences from localStorage
function loadPreferences() {
  const prefs = localStorage.getItem('directo_preferences');
  if (prefs) {
    try {
      return JSON.parse(prefs);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Load filters from localStorage
function loadFilters() {
  const filters = localStorage.getItem('directo_filters');
  if (filters) {
    try {
      return JSON.parse(filters);
    } catch (e) {
      return { environments: [], teams: [], tags: [], services: [] };
    }
  }
  return { environments: [], teams: [], tags: [], services: [] };
}

// Save filters to localStorage
function saveFilters(filters) {
  localStorage.setItem('directo_filters', JSON.stringify(filters));
}

// Save preferences to localStorage
function savePreferences(prefs) {
  localStorage.setItem('directo_preferences', JSON.stringify(prefs));
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    // Auto: use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}

// Initialize app
async function init() {
  try {
    // Load preferences and filters
    const prefs = loadPreferences();
    activeFilters = loadFilters();
    currentView = prefs.defaultView || 'environment';
    document.getElementById('viewMode').value = currentView;

    // Apply theme
    applyTheme(prefs.theme || 'auto');

    // Fetch data
    await Promise.all([
      fetchServices(),
      fetchEnvironments(),
      fetchGroups(),
      fetchSettings()
    ]);

    // Render
    render();

    // Fetch health checks in background
    fetchHealthChecks();

    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } catch (error) {
    showError(error.message);
  }
}

// Fetch services from API
async function fetchServices() {
  const response = await fetch('/api/services');
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  const data = await response.json();
  services = data.services;
}

// Fetch environments
async function fetchEnvironments() {
  const response = await fetch('/api/services/meta/environments');
  if (!response.ok) {
    throw new Error('Failed to fetch environments');
  }
  const data = await response.json();
  environments = data.environments;
}

// Fetch groups
async function fetchGroups() {
  const response = await fetch('/api/services/meta/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }
  const data = await response.json();
  groups = data.groups;
}

// Fetch settings
async function fetchSettings() {
  const response = await fetch('/api/services/meta/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  settings = await response.json();
}

// Show error
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('errorMessage').textContent = message;
}

// Render content based on current view
function render() {
  const content = document.getElementById('content');
  content.innerHTML = '';

  if (currentView === 'environment') {
    renderEnvironmentView();
  } else if (currentView === 'project') {
    renderProjectView();
  } else if (currentView === 'team') {
    renderTeamView();
  }
}

// Render environment view
function renderEnvironmentView() {
  const content = document.getElementById('content');

  environments.forEach(env => {
    // Filter by environment first
    let envServices = services.filter(service =>
      service.links.some(group => group.environment === env)
    );
    
    // Apply active filters
    envServices = filterServices(envServices);

    if (envServices.length === 0) return;

    const section = document.createElement('div');
    section.className = 'environment-section';

    const header = document.createElement('div');
    header.className = 'environment-header';

    const badge = document.createElement('span');
    // Map environment names to badge styles
    const badgeClass = env === 'uat' ? 'staging' : env;
    badge.className = `environment-badge ${badgeClass}`;
    badge.textContent = env.toUpperCase();
    header.appendChild(badge);

    const title = document.createElement('h2');
    title.textContent = `${envServices.length} service${envServices.length > 1 ? 's' : ''}`;
    header.appendChild(title);

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'services-grid';

    envServices.forEach(service => {
      const card = renderServiceCard(service, env);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  });
}

// Render project view
function renderProjectView() {
  const content = document.getElementById('content');

  if (groups.length === 0) {
    content.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No custom groups defined</p>';
    return;
  }

  groups.forEach(group => {
    let groupServices = services.filter(s => group.services.includes(s.id));
    
    // Apply active filters
    groupServices = filterServices(groupServices);

    if (groupServices.length === 0) return;

    const section = document.createElement('div');
    section.className = 'environment-section';

    const header = document.createElement('div');
    header.className = 'environment-header';

    const title = document.createElement('h2');
    title.textContent = `${group.name} (${groupServices.length})`;
    header.appendChild(title);

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'services-grid';

    groupServices.forEach(service => {
      const card = renderServiceCard(service, null);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  });
}

// Render team view
function renderTeamView() {
  const content = document.getElementById('content');

  // Apply filters first
  const filteredServices = filterServices(services);

  // Group filtered services by team
  const teams = {};
  filteredServices.forEach(service => {
    const team = service.team || 'Unassigned';
    if (!teams[team]) teams[team] = [];
    teams[team].push(service);
  });

  Object.entries(teams).forEach(([team, teamServices]) => {
    const section = document.createElement('div');
    section.className = 'environment-section';

    const header = document.createElement('div');
    header.className = 'environment-header';

    const title = document.createElement('h2');
    title.textContent = `${team} (${teamServices.length})`;
    header.appendChild(title);

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'services-grid';

    teamServices.forEach(service => {
      const card = renderServiceCard(service, null);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  });
}

// Render service card
function renderServiceCard(service, environment) {
  const card = document.createElement('div');
  card.className = 'service-card';

  // Header
  const header = document.createElement('div');
  header.className = 'service-header';

  if (service.icon) {
    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.textContent = service.icon;
    header.appendChild(icon);
  }

  const info = document.createElement('div');
  info.className = 'service-info';

  const name = document.createElement('h3');
  name.textContent = service.name;
  info.appendChild(name);

  header.appendChild(info);
  card.appendChild(header);

  // Description
  if (service.description) {
    const desc = document.createElement('p');
    desc.className = 'service-description';
    desc.textContent = service.description;
    card.appendChild(desc);
  }

  // Tags
  if (service.tags && service.tags.length > 0) {
    const meta = document.createElement('div');
    meta.className = 'service-meta';
    service.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      meta.appendChild(tagEl);
    });
    card.appendChild(meta);
  }

  // Links
  const linksList = document.createElement('div');
  linksList.className = 'links-list';

  // Filter links by environment if specified
  const linkGroups = environment
    ? service.links.filter(g => g.environment === environment)
    : service.links;

  linkGroups.forEach((group, groupIdx) => {
    group.items.forEach((item, itemIdx) => {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'link-item';

      if (item.icon) {
        const icon = document.createElement('span');
        icon.className = 'link-icon';
        icon.textContent = item.icon;
        link.appendChild(icon);
      }

      const linkName = document.createElement('span');
      linkName.className = 'link-name';
      linkName.textContent = item.name;
      link.appendChild(linkName);

      // Health indicator
      if (item.health_check) {
        const health = document.createElement('span');
        health.dataset.serviceId = service.id;
        health.dataset.groupIdx = groupIdx;
        health.dataset.linkIdx = itemIdx;
        
        const key = `${service.id}:${groupIdx}:${itemIdx}`;
        const result = healthResults.get(key);
        
        if (result) {
          health.className = 'health-indicator ' + result.status;
          let title = `Status: ${result.status}`;
          if (result.latencyMs) title += ` (${result.latencyMs}ms)`;
          if (result.statusCode) title += ` - HTTP ${result.statusCode}`;
          if (result.error) title += ` - ${result.error}`;
          health.title = title;
        } else {
          health.className = 'health-indicator checking';
          health.title = 'Checking health...';
        }
        
        link.appendChild(health);
      }

      linksList.appendChild(link);
    });
  });

  card.appendChild(linksList);

  return card;
}

// Event handlers
document.getElementById('viewMode').addEventListener('change', (e) => {
  currentView = e.target.value;
  render();

  // Save preference
  const prefs = loadPreferences();
  prefs.defaultView = currentView;
  savePreferences(prefs);
});

document.getElementById('reloadBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/reload', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to reload');
    
    // Re-fetch and render
    await init();
  } catch (error) {
    alert('Failed to reload configuration');
  }
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  openSettings();
});

function openSettings() {
  const prefs = loadPreferences();
  
  document.getElementById('themeSelect').value = prefs.theme || 'auto';
  document.getElementById('defaultViewSelect').value = prefs.defaultView || 'environment';
  document.getElementById('compactMode').checked = prefs.compactMode || false;
  
  document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
  const prefs = {
    theme: document.getElementById('themeSelect').value,
    defaultView: document.getElementById('defaultViewSelect').value,
    compactMode: document.getElementById('compactMode').checked
  };
  
  savePreferences(prefs);
  applyTheme(prefs.theme);
  currentView = prefs.defaultView;
  document.getElementById('viewMode').value = currentView;
  
  render();
  closeSettings();
}

// Close modal on outside click
document.getElementById('settingsModal').addEventListener('click', (e) => {
  if (e.target.id === 'settingsModal') {
    closeSettings();
  }
});

// Fetch health checks for all enabled links
async function fetchHealthChecks() {
  const checks = [];
  
  services.forEach((service, serviceIdx) => {
    service.links.forEach((linkGroup, groupIdx) => {
      linkGroup.items.forEach((item, itemIdx) => {
        if (item.health_check) {
          checks.push({
            serviceId: service.id,
            linkGroupIndex: groupIdx,
            linkIndex: itemIdx,
          });
        }
      });
    });
  });

  if (checks.length === 0) return;

  try {
    const response = await fetch('/api/health-check/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checks }),
    });

    if (!response.ok) {
      console.error('Failed to fetch health checks');
      return;
    }

    const data = await response.json();
    
    // Store results
    data.results.forEach((result) => {
      const key = `${result.serviceId}:${result.linkGroupIndex}:${result.linkIndex}`;
      healthResults.set(key, result.result);
    });

    // Update UI
    updateHealthIndicators();
  } catch (error) {
    console.error('Error fetching health checks:', error);
  }
}

// Update health indicators in UI
function updateHealthIndicators() {
  document.querySelectorAll('.health-indicator').forEach((indicator) => {
    const serviceId = indicator.dataset.serviceId;
    const groupIdx = indicator.dataset.groupIdx;
    const linkIdx = indicator.dataset.linkIdx;
    const key = `${serviceId}:${groupIdx}:${linkIdx}`;
    
    const result = healthResults.get(key);
    if (result) {
      indicator.className = 'health-indicator ' + result.status;
      
      // Update title
      let title = `Status: ${result.status}`;
      if (result.latencyMs) {
        title += ` (${result.latencyMs}ms)`;
      }
      if (result.statusCode) {
        title += ` - HTTP ${result.statusCode}`;
      }
      if (result.error) {
        title += ` - ${result.error}`;
      }
      indicator.title = title;
    }
  });
}

// Filter services based on active filters
function filterServices(servicesToFilter) {
  if (
    activeFilters.environments.length === 0 &&
    activeFilters.teams.length === 0 &&
    activeFilters.tags.length === 0 &&
    activeFilters.services.length === 0
  ) {
    return servicesToFilter; // No filters active
  }

  return servicesToFilter.filter((service) => {
    // Service filter
    if (activeFilters.services.length > 0) {
      if (!activeFilters.services.includes(service.id)) {
        return false;
      }
    }

    // Team filter
    if (activeFilters.teams.length > 0) {
      if (!service.team || !activeFilters.teams.includes(service.team)) {
        return false;
      }
    }

    // Tag filter
    if (activeFilters.tags.length > 0) {
      if (!service.tags || !service.tags.some(tag => activeFilters.tags.includes(tag))) {
        return false;
      }
    }

    // Environment filter (check if service has any links in filtered environments)
    if (activeFilters.environments.length > 0) {
      const hasMatchingEnv = service.links.some(group =>
        activeFilters.environments.includes(group.environment)
      );
      if (!hasMatchingEnv) {
        return false;
      }
    }

    return true;
  });
}

// Get unique values for filters
function getUniqueValues() {
  const teams = new Set();
  const tags = new Set();
  
  services.forEach(service => {
    if (service.team) teams.add(service.team);
    if (service.tags) service.tags.forEach(tag => tags.add(tag));
  });
  
  return {
    teams: Array.from(teams).sort(),
    tags: Array.from(tags).sort(),
  };
}

// Open filter modal
function openFilters() {
  const unique = getUniqueValues();
  
  // Populate environment filters
  const envContainer = document.getElementById('environmentFilters');
  envContainer.innerHTML = '';
  environments.forEach(env => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = env;
    checkbox.checked = activeFilters.environments.includes(env);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(env));
    envContainer.appendChild(label);
  });
  
  // Populate team filters
  const teamContainer = document.getElementById('teamFilters');
  teamContainer.innerHTML = '';
  unique.teams.forEach(team => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = team;
    checkbox.checked = activeFilters.teams.includes(team);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(team));
    teamContainer.appendChild(label);
  });
  
  // Populate tag filters
  const tagContainer = document.getElementById('tagFilters');
  tagContainer.innerHTML = '';
  unique.tags.forEach(tag => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = tag;
    checkbox.checked = activeFilters.tags.includes(tag);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(tag));
    tagContainer.appendChild(label);
  });
  
  // Populate service filters
  const serviceContainer = document.getElementById('serviceFilters');
  serviceContainer.innerHTML = '';
  services.forEach(service => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = service.id;
    checkbox.checked = activeFilters.services.includes(service.id);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(service.name));
    serviceContainer.appendChild(label);
  });
  
  document.getElementById('filterModal').style.display = 'flex';
}

function closeFilters() {
  document.getElementById('filterModal').style.display = 'none';
}

function applyFilters() {
  // Collect checked values
  const newFilters = {
    environments: [],
    teams: [],
    tags: [],
    services: []
  };
  
  document.querySelectorAll('#environmentFilters input:checked').forEach(cb => {
    newFilters.environments.push(cb.value);
  });
  
  document.querySelectorAll('#teamFilters input:checked').forEach(cb => {
    newFilters.teams.push(cb.value);
  });
  
  document.querySelectorAll('#tagFilters input:checked').forEach(cb => {
    newFilters.tags.push(cb.value);
  });
  
  document.querySelectorAll('#serviceFilters input:checked').forEach(cb => {
    newFilters.services.push(cb.value);
  });
  
  activeFilters = newFilters;
  saveFilters(activeFilters);
  render();
  closeFilters();
}

function clearFilters() {
  activeFilters = {
    environments: [],
    teams: [],
    tags: [],
    services: []
  };
  saveFilters(activeFilters);
  render();
  closeFilters();
}

// Filter button handler
document.getElementById('filterBtn').addEventListener('click', () => {
  openFilters();
});

// Close filter modal on outside click
document.getElementById('filterModal').addEventListener('click', (e) => {
  if (e.target.id === 'filterModal') {
    closeFilters();
  }
});

// Initialize on page load
init();
