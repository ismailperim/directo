# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-05

### Added
- Complete React + TypeScript frontend rewrite
- Real-time HTTP health checks with 5-minute cache TTL
- Multi-platform Docker support (linux/amd64, linux/arm64)
- Smart health indicators: green (2xx/3xx), red (4xx/5xx/timeout), gray (no check)
- Advanced filtering: Environment, Project, Tags
- LocalStorage filter persistence (survives page reload)
- Search across name, description, environment, project, group, tags
- Emoji service icons from YAML config
- Modern UI with Tailwind CSS
- Dark mode support
- Footer with GitHub/sponsor links
- Service normalizer: YAML nested structure → flat API format
- Multi-stage Docker build (frontend + backend)

### Changed
- Architecture: Complete rewrite from vanilla JS to React + Express monolith
- Health check logic: 2xx/3xx status codes treated as healthy (not strict 200)
- HTTP fallback for HTTPS URLs (avoids certificate validation issues)
- Bundle optimization: 391KB (gzipped: 127KB)

### Fixed
- Radix UI dropdown stability issues (replaced with native implementation)
- Docker path resolution for frontend static files
- Health check false negatives on working URLs

### Infrastructure
- GitHub Actions with buildx cache optimization
- Docker Compose configuration for production deployment
- Comprehensive documentation and development workflow

## [0.1.0] - 2026-03-04

### Added
- Initial vanilla JavaScript prototype
- Basic YAML configuration parser
- Static HTML/CSS/JS dashboard
- Environment grouping
- Manual service link management

---

## Release Types

- **MAJOR** (x.0.0): Breaking changes, major rewrites
- **MINOR** (1.x.0): New features, backward compatible
- **PATCH** (1.0.x): Bug fixes, security patches

[1.0.0]: https://github.com/ismailperim/directo/releases/tag/v1.0.0
[0.1.0]: https://github.com/ismailperim/directo/releases/tag/v0.1.0
