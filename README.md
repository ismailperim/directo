# Directo

**Your central dashboard for all service links.**

Directo organizes your services, environments, and operational links in one place. No more bookmark chaos - just a clean, YAML-configured dashboard with health checks and flexible grouping.

## Features

- 📋 **YAML Configuration** - Single source of truth in Git
- 🎯 **Environment Grouping** - Production, UAT, Dev views
- 💚 **Health Checks** - Monitor service availability
- 🔄 **Multiple Views** - Group by environment, project, team, or custom
- 🎨 **Client Preferences** - Hide/show services, favorites, dark mode
- 🐳 **Docker Ready** - One-command deployment

## Use Cases

- **Service Discovery**: All your Swagger docs, dashboards, and tools in one place
- **Incident Response**: Quick access to Grafana, Kibana, K8s dashboards
- **Onboarding**: New team members see all relevant links immediately
- **Multi-Environment**: Switch between prod/uat/dev views instantly

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ismailperim/directo.git
cd directo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
cp services.example.yml services.yml
# Edit services.yml with your services and links

# Run with Docker
docker-compose up -d

# Or run locally
npm run dev
```

## Architecture

Directo consists of:

1. **Config Parser** - Reads YAML service definitions
2. **Health Check Engine** - Monitors service availability
3. **API Server** - REST API for service data and health status
4. **Web UI** - Dashboard with multiple view modes

## Configuration

See [docs/configuration.md](docs/configuration.md) for detailed setup instructions.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run in development mode
npm run dev
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Roadmap

- [ ] YAML config parser
- [ ] Health check engine (server-side)
- [ ] Client-side health checks
- [ ] Environment/project/team view modes
- [ ] Client preferences (local storage)
- [ ] Dark mode support
- [ ] Prometheus/Grafana integration for health status
- [ ] LDAP/SSO authentication

---

**Status**: Early Development 🚧

Built with Node.js, TypeScript, and Docker.
