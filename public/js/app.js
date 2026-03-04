// State
let services = [];
let environments = [];
let groups = [];
let settings = {};
let currentView = 'environment';

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
    // Load preferences
    const prefs = loadPreferences();
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
    const envServices = services.filter(service =>
      service.links.some(group => group.environment === env)
    );

    if (envServices.length === 0) return;

    const section = document.createElement('div');
    section.className = 'environment-section';

    const header = document.createElement('div');
    header.className = 'environment-header';

    const badge = document.createElement('span');
    badge.className = `environment-badge ${env}`;
    badge.textContent = env;
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
    const groupServices = services.filter(s => group.services.includes(s.id));

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

  // Group services by team
  const teams = {};
  services.forEach(service => {
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

  linkGroups.forEach(group => {
    group.items.forEach(item => {
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

      // Health indicator (placeholder for now)
      if (item.health_check) {
        const health = document.createElement('span');
        health.className = 'health-indicator unknown';
        health.title = 'Health status unknown';
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

// Initialize on page load
init();
