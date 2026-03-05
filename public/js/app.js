// State
let services = [];
let environments = [];
let groups = [];
let settings = {};
let currentView = 'environment';
let healthResults = new Map();
let activeFilters = {
  environments: [],
  teams: [],
  tags: [],
  services: []
};
let searchQuery = '';

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

// Save preferences to localStorage
function savePreferences(prefs) {
  localStorage.setItem('directo_preferences', JSON.stringify(prefs));
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

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Initialize app
async function init() {
  try {
    const prefs = loadPreferences();
    activeFilters = loadFilters();
    currentView = prefs.defaultView || 'environment';
    document.getElementById('viewMode').value = currentView;

    applyTheme(prefs.theme || 'auto');

    await Promise.all([
      fetchServices(),
      fetchEnvironments(),
      fetchGroups(),
      fetchSettings()
    ]);

    render();
    fetchHealthChecks();

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
    
    data.results.forEach((result) => {
      const key = `${result.serviceId}:${result.linkGroupIndex}:${result.linkIndex}`;
      healthResults.set(key, result.result);
    });

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
      indicator.className = 'health-indicator w-2 h-2 rounded-full shadow-md ' + 
        (result.status === 'healthy' ? 'bg-green-500 shadow-green-500/50' :
         result.status === 'unhealthy' ? 'bg-red-500 shadow-red-500/50' :
         result.status === 'error' ? 'bg-red-500 shadow-red-500/50' :
         'bg-gray-400');
      
      let title = `Status: ${result.status}`;
      if (result.latencyMs) title += ` (${result.latencyMs}ms)`;
      if (result.statusCode) title += ` - HTTP ${result.statusCode}`;
      if (result.error) title += ` - ${result.error}`;
      indicator.title = title;
    }
  });
}

// Filter services based on active filters and search
function filterServices(servicesToFilter) {
  let filtered = servicesToFilter;

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Apply filters
  if (
    activeFilters.environments.length === 0 &&
    activeFilters.teams.length === 0 &&
    activeFilters.tags.length === 0 &&
    activeFilters.services.length === 0
  ) {
    return filtered;
  }

  return filtered.filter((service) => {
    if (activeFilters.services.length > 0) {
      if (!activeFilters.services.includes(service.id)) {
        return false;
      }
    }

    if (activeFilters.teams.length > 0) {
      if (!service.team || !activeFilters.teams.includes(service.team)) {
        return false;
      }
    }

    if (activeFilters.tags.length > 0) {
      if (!service.tags || !service.tags.some(tag => activeFilters.tags.includes(tag))) {
        return false;
      }
    }

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

// Render content based on current view
function render() {
  const content = document.getElementById('content');
  content.innerHTML = '';

  updateFilterBar();

  if (currentView === 'environment') {
    renderEnvironmentView();
  } else if (currentView === 'project') {
    renderProjectView();
  } else if (currentView === 'team') {
    renderTeamView();
  }
}

// Update filter bar
function updateFilterBar() {
  const hasFilters = activeFilters.environments.length > 0 ||
    activeFilters.teams.length > 0 ||
    activeFilters.tags.length > 0 ||
    activeFilters.services.length > 0;

  const filterBar = document.getElementById('filterBar');
  filterBar.style.display = hasFilters ? 'block' : 'none';

  if (hasFilters) {
    const activeFiltersContainer = document.getElementById('activeFilters');
    activeFiltersContainer.innerHTML = '';

    const createBadge = (text, onRemove) => {
      const badge = document.createElement('span');
      badge.className = 'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm';
      badge.innerHTML = `
        ${text}
        <button class="hover:bg-background/50 rounded p-0.5" onclick='${onRemove}'>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      `;
      return badge;
    };

    activeFilters.environments.forEach(env => {
      activeFiltersContainer.appendChild(createBadge(env, `removeFilter('environment', '${env}')`));
    });

    activeFilters.teams.forEach(team => {
      activeFiltersContainer.appendChild(createBadge(team, `removeFilter('team', '${team}')`));
    });

    activeFilters.tags.forEach(tag => {
      activeFiltersContainer.appendChild(createBadge(tag, `removeFilter('tag', '${tag}')`));
    });

    activeFilters.services.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        activeFiltersContainer.appendChild(createBadge(service.name, `removeFilter('service', '${serviceId}')`));
      }
    });
  }
}

// Remove filter
function removeFilter(type, value) {
  if (type === 'environment') {
    activeFilters.environments = activeFilters.environments.filter(e => e !== value);
  } else if (type === 'team') {
    activeFilters.teams = activeFilters.teams.filter(t => t !== value);
  } else if (type === 'tag') {
    activeFilters.tags = activeFilters.tags.filter(t => t !== value);
  } else if (type === 'service') {
    activeFilters.services = activeFilters.services.filter(s => s !== value);
  }
  
  saveFilters(activeFilters);
  render();
}

// Render environment view
function renderEnvironmentView() {
  const content = document.getElementById('content');

  const envColors = {
    production: { badge: 'bg-red-500/10 text-red-500 border-red-500/20', border: 'border-red-500/20' },
    staging: { badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', border: 'border-yellow-500/20' },
    uat: { badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', border: 'border-yellow-500/20' },
    dev: { badge: 'bg-green-500/10 text-green-500 border-green-500/20', border: 'border-green-500/20' },
  };

  environments.forEach(env => {
    let envServices = services.filter(service =>
      service.links.some(group => group.environment === env)
    );
    
    envServices = filterServices(envServices);

    if (envServices.length === 0) return;

    const section = document.createElement('div');
    section.className = 'space-y-4';

    const colors = envColors[env.toLowerCase()] || envColors.dev;

    section.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center px-3 py-1 rounded-lg border ${colors.badge} uppercase tracking-wider text-sm font-semibold">
          ${env}
        </span>
        <span class="text-sm text-muted-foreground">
          ${envServices.length} ${envServices.length === 1 ? 'service' : 'services'}
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${envServices.map(service => renderServiceCard(service, env)).join('')}
      </div>
    `;

    content.appendChild(section);
  });
}

// Render project view
function renderProjectView() {
  const content = document.getElementById('content');

  if (groups.length === 0) {
    content.innerHTML = '<p class="text-center text-muted-foreground py-12">No custom groups defined</p>';
    return;
  }

  groups.forEach(group => {
    let groupServices = services.filter(s => group.services.includes(s.id));
    groupServices = filterServices(groupServices);

    if (groupServices.length === 0) return;

    const section = document.createElement('div');
    section.className = 'space-y-4';

    section.innerHTML = `
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-semibold">${group.name}</h2>
        <span class="text-sm text-muted-foreground">
          ${groupServices.length} ${groupServices.length === 1 ? 'service' : 'services'}
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${groupServices.map(service => renderServiceCard(service, null)).join('')}
      </div>
    `;

    content.appendChild(section);
  });
}

// Render team view
function renderTeamView() {
  const content = document.getElementById('content');
  const filteredServices = filterServices(services);

  const teams = {};
  filteredServices.forEach(service => {
    const team = service.team || 'Unassigned';
    if (!teams[team]) teams[team] = [];
    teams[team].push(service);
  });

  Object.entries(teams).forEach(([team, teamServices]) => {
    const section = document.createElement('div');
    section.className = 'space-y-4';

    section.innerHTML = `
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-semibold">${team}</h2>
        <span class="text-sm text-muted-foreground">
          ${teamServices.length} ${teamServices.length === 1 ? 'service' : 'services'}
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${teamServices.map(service => renderServiceCard(service, null)).join('')}
      </div>
    `;

    content.appendChild(section);
  });
}

// Render service card
function renderServiceCard(service, environment) {
  const iconMap = {
    '🌐': 'globe',
    '💻': 'laptop',
    '👤': 'user',
    '🔴': 'circle',
    '🐘': 'database',
    '📊': 'chart',
  };

  const linkGroups = environment
    ? service.links.filter(g => g.environment === environment)
    : service.links;

  const linksHtml = linkGroups.flatMap((group, groupIdx) => 
    group.items.map((item, itemIdx) => {
      const key = `${service.id}:${groupIdx}:${itemIdx}`;
      const result = healthResults.get(key);
      
      const healthClass = result ?
        (result.status === 'healthy' ? 'bg-green-500 shadow-green-500/50' :
         result.status === 'unhealthy' || result.status === 'error' ? 'bg-red-500 shadow-red-500/50' :
         'bg-gray-400') : 'bg-yellow-500';

      return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer"
           class="flex items-center justify-between p-3 rounded-lg border border-border transition-all duration-200 hover:bg-accent hover:border-primary/50 group">
          <div class="flex items-center gap-3">
            ${item.health_check ? `<div class="health-indicator w-2 h-2 rounded-full shadow-md ${healthClass}" data-service-id="${service.id}" data-group-idx="${groupIdx}" data-link-idx="${itemIdx}"></div>` : ''}
            <span class="font-medium text-sm">${item.name}</span>
          </div>
          <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </a>
      `;
    })
  ).join('');

  return `
    <div class="group hover:shadow-lg transition-all duration-300 border border-border rounded-lg bg-card hover:border-primary/50 h-full flex flex-col">
      <div class="p-6 flex-1">
        <div class="flex items-start gap-3 mb-4">
          <div class="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <span class="text-xl">${service.icon || '🌐'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold mb-1">${service.name}</h3>
            ${service.description ? `<p class="text-sm text-muted-foreground">${service.description}</p>` : ''}
          </div>
        </div>

        ${service.tags && service.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${service.tags.map(tag => `
              <span class="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">${tag}</span>
            `).join('')}
          </div>
        ` : ''}

        <div class="space-y-2">
          ${linksHtml}
        </div>
      </div>
    </div>
  `;
}

// Event handlers
document.getElementById('viewMode').addEventListener('change', (e) => {
  currentView = e.target.value;
  render();

  const prefs = loadPreferences();
  prefs.defaultView = currentView;
  savePreferences(prefs);
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

document.getElementById('filterBtn').addEventListener('click', () => {
  openFilters();
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  openSettings();
});

document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  activeFilters = { environments: [], teams: [], tags: [], services: [] };
  saveFilters(activeFilters);
  render();
});

// Filter functions
function openFilters() {
  const unique = getUniqueValues();
  
  const createCheckbox = (value, checked, label) => `
    <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer">
      <input type="checkbox" value="${value}" ${checked ? 'checked' : ''} class="w-4 h-4 rounded border-border">
      <span class="text-sm">${label || value}</span>
    </label>
  `;
  
  document.getElementById('environmentFilters').innerHTML = environments.map(env =>
    createCheckbox(env, activeFilters.environments.includes(env), env)
  ).join('');
  
  document.getElementById('teamFilters').innerHTML = unique.teams.map(team =>
    createCheckbox(team, activeFilters.teams.includes(team), team)
  ).join('');
  
  document.getElementById('tagFilters').innerHTML = unique.tags.map(tag =>
    createCheckbox(tag, activeFilters.tags.includes(tag), tag)
  ).join('');
  
  document.getElementById('serviceFilters').innerHTML = services.map(service =>
    createCheckbox(service.id, activeFilters.services.includes(service.id), service.name)
  ).join('');
  
  document.getElementById('filterModal').style.display = 'flex';
}

function closeFilters() {
  document.getElementById('filterModal').style.display = 'none';
}

function applyFilters() {
  activeFilters = {
    environments: Array.from(document.querySelectorAll('#environmentFilters input:checked')).map(cb => cb.value),
    teams: Array.from(document.querySelectorAll('#teamFilters input:checked')).map(cb => cb.value),
    tags: Array.from(document.querySelectorAll('#tagFilters input:checked')).map(cb => cb.value),
    services: Array.from(document.querySelectorAll('#serviceFilters input:checked')).map(cb => cb.value),
  };
  
  saveFilters(activeFilters);
  render();
  closeFilters();
}

function clearFilters() {
  activeFilters = { environments: [], teams: [], tags: [], services: [] };
  saveFilters(activeFilters);
  render();
  closeFilters();
}

// Settings functions
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

// Close modals on outside click
document.getElementById('filterModal').addEventListener('click', (e) => {
  if (e.target.id === 'filterModal') {
    closeFilters();
  }
});

document.getElementById('settingsModal').addEventListener('click', (e) => {
  if (e.target.id === 'settingsModal') {
    closeSettings();
  }
});

// Initialize on page load
init();
