# Directo

**Navigate your organization's knowledge graph.**

Directo helps you find the right person to talk to. It indexes your organization's communication channels, documents, and expertise to answer one simple question: *"Who should I ask about X?"*

## Features

- 🔍 **Semantic Search** - Find experts by topic, not just keywords
- 🗺️ **Knowledge Graph** - Visualize expertise connections across your organization
- 🤖 **AI-Powered** - Natural language queries: "Who knows about Kubernetes deployments?"
- 🔐 **Privacy-First** - Self-hosted, zero external data sharing
- 🐳 **Docker Ready** - One-command deployment

## Use Cases

- **Onboarding**: New hires find the right people instantly
- **Cross-Team Collaboration**: Break down knowledge silos
- **Incident Response**: Find the expert when seconds count
- **Process Discovery**: "Who handles visa applications?"

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ismailperim/directo.git
cd directo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run with Docker
docker-compose up -d

# Or run locally
npm run dev
```

## Architecture

Directo consists of:

1. **Indexer** - Crawls configured data sources (Slack, wikis, git commits)
2. **AI Engine** - Embeds content and queries for semantic search
3. **API Server** - REST API for queries and data management
4. **Web UI** - Simple query interface

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

- [ ] Slack integration
- [ ] Microsoft Teams support
- [ ] Confluence/Notion indexing
- [ ] Graph visualization UI
- [ ] Multi-language support
- [ ] LDAP/Active Directory integration

---

**Status**: Early Development 🚧

Built with Node.js, TypeScript, and Docker.
