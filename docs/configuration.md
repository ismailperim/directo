# Configuration Guide

Directo uses a YAML configuration file to define services, links, and health checks.

## Quick Start

1. **Review the included services.yml** - It contains generic examples to get you started

2. **Customize services.yml** with your own services and links

3. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```
   
4. **Edit .env** if needed (optional - defaults work fine)

## Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |
| `SERVICES_CONFIG` | No | `./services.yml` | Path to services configuration file |
| `HEALTH_CACHE_TTL` | No | `300` | Health check cache TTL in seconds |

## Services Configuration (services.yml)

The YAML file defines all your services, links, and grouping options.

### Configuration Structure

```yaml
version: "1.0"

settings:
  default_view: environment
  theme: auto
  health_check:
    enabled: true
    interval: 300
    timeout: 5

services:
  - id: service-name
    name: Display Name
    # ... service definition

groups:
  - name: Group Name
    type: project
    services: [...]
```

### Global Settings

```yaml
settings:
  default_view: environment  # environment | project | team | category | custom
  theme: auto                # light | dark | auto
  health_check:
    enabled: true            # Enable health checks globally
    interval: 300            # Check interval in seconds
    timeout: 5               # Request timeout in seconds
```

**Settings:**
- `default_view`: Default view mode for the dashboard
- `theme`: Color theme (client can override)
- `health_check.enabled`: Enable/disable health checks globally
- `health_check.interval`: How often to perform health checks
- `health_check.timeout`: HTTP request timeout for health checks

### Service Definition

Each service has the following structure:

```yaml
- id: payment-api                    # Unique identifier (required)
  name: Payment API                  # Display name (required)
  description: Core payment processing service  # Description (optional)
  icon: 💳                           # Emoji or icon name (optional)
  tags:                              # Tags for filtering (optional)
    - microservice
    - critical
    - backend
  team: payments                     # Team owner (optional)
  owner: john.doe@company.com        # Owner email (optional)
  repository: https://github.com/company/payment-api  # Git repo (optional)
  
  links:                             # Link groups (required)
    - label: Production              # Environment/group label
      environment: production        # Environment identifier
      items:                         # Links
        - name: API Endpoint
          url: https://api.company.com/payments
          icon: 🌐
          health_check: true
```

### Link Definition

Links are organized by environment or group:

```yaml
links:
  - label: Production           # Display label
    environment: production     # Environment tag (for grouping)
    items:                      # List of links
      - name: API Endpoint      # Link name (required)
        url: https://api.company.com/payments  # URL (required)
        icon: 🌐                # Icon (optional)
        health_check: true      # Enable health check (optional)
```

**Link fields:**
- `name`: Display name for the link
- `url`: Target URL
- `icon`: Emoji or icon name
- `health_check`: Health check configuration (see below)

### Health Check Configuration

Health checks can be configured at multiple levels:

#### 1. Simple Health Check (Default)

```yaml
- name: API Endpoint
  url: https://api.company.com/payments
  health_check: true  # Simple: GET request to URL
```

Directo will perform a GET request to the URL and check for HTTP 2xx response.

#### 2. Custom Health Endpoint

```yaml
- name: API Endpoint
  url: https://api.company.com/payments
  health_check:
    enabled: true
    url: https://api.company.com/payments/health
    method: GET
    expected_status: 200
```

**Fields:**
- `enabled`: Enable health check
- `url`: Health check endpoint (overrides link URL)
- `method`: HTTP method (GET, POST, HEAD)
- `expected_status`: Expected HTTP status code

#### 3. Client-Side Health Check

For internal services behind VPN:

```yaml
- name: Internal API
  url: http://internal.company.local/api
  health_check:
    enabled: true
    mode: client-side  # Browser makes request (CORS required)
```

The browser will make the health check request instead of the server. Requires CORS configuration on the target service.

#### 4. Prometheus Integration

Use existing Prometheus metrics:

```yaml
- name: API Endpoint
  url: https://api.company.com/payments
  health_check:
    enabled: true
    provider: prometheus
    query: up{job="payment-api"}
    endpoint: https://prometheus.company.com
```

**Fields:**
- `provider`: `prometheus`
- `query`: PromQL query (should return 1 for healthy, 0 for unhealthy)
- `endpoint`: Prometheus server URL

#### 5. Disabled Health Check

```yaml
- name: Admin Panel
  url: https://admin.company.com
  health_check: false  # or omit entirely
```

### Custom Groups

Define custom groupings beyond environments:

```yaml
groups:
  - name: Payment System        # Group display name
    type: project               # Group type: project | category | team
    services:                   # List of service IDs
      - payment-api
      - payment-worker
      - fraud-detection
  
  - name: Core Infrastructure
    type: category
    services:
      - redis-cache
      - postgres
      - kafka
```

**Group types:**
- `project`: Business/product grouping
- `category`: Technical category (infrastructure, frontend, backend)
- `team`: Organizational team

## View Modes

Directo supports multiple view modes:

### 1. Environment View

Groups services by environment (production, uat, dev):

```
🔴 Production
  ├─ Payment API
  ├─ User Service
  └─ Redis Cache

🟡 UAT
  ├─ Payment API
  └─ User Service

🟢 Development
  └─ Payment API
```

### 2. Project View

Groups services by custom project groups:

```
💳 Payment System
  ├─ Payment API
  ├─ Payment Worker
  └─ Fraud Detection

🏗️ Core Infrastructure
  ├─ Redis Cache
  ├─ PostgreSQL
  └─ Kafka
```

### 3. Team View

Groups services by team owner:

```
👥 Payments Team
  ├─ Payment API
  └─ Payment Worker

👥 Platform Team
  ├─ Redis Cache
  └─ User Service
```

### 4. Category View

Groups services by tags:

```
🏗️ Infrastructure
  ├─ Redis Cache
  └─ PostgreSQL

🔧 Microservices
  ├─ Payment API
  └─ User Service
```

## Client Preferences

Users can customize their view locally (stored in browser):

- **Theme**: Light/dark mode
- **Default View**: Preferred grouping mode
- **Hidden Environments**: Hide test/dev environments
- **Hidden Services**: Hide unused services
- **Favorites**: Star important services
- **Compact Mode**: Smaller cards

Preferences are stored in browser localStorage and don't require server changes.

## Best Practices

### 1. Version Control

Commit `services.yml` to Git for:
- Change tracking
- Code review for new services
- Rollback capability
- Team collaboration

```bash
git add services.yml
git commit -m "feat: add payment worker service"
git push
```

### 2. Health Check Strategy

- **Production**: Use server-side health checks
- **Internal/VPN**: Use client-side health checks
- **Monitoring Integration**: Use Prometheus provider if available
- **Rate Limiting**: Set appropriate `interval` to avoid overwhelming services

### 3. Naming Conventions

```yaml
# Clear, consistent naming
id: payment-api           # kebab-case
name: Payment API         # Title Case
environment: production   # lowercase

# Consistent tags
tags:
  - microservice          # not "micro-service" or "MicroService"
  - critical              # not "Critical" or "CRITICAL"
```

### 4. Icons

Use emoji for simplicity:

```yaml
# Common icons
icon: 🌐  # API/Web
icon: 📊  # Dashboard/Metrics
icon: 📜  # Logs
icon: 🐳  # Docker/K8s
icon: 💾  # Database
icon: 🔴  # Redis/Cache
icon: 📖  # Documentation
icon: ⚙️  # Admin/Settings
```

### 5. Environment Tags

Use consistent environment naming:

```yaml
environment: production   # not "prod" or "PRODUCTION"
environment: uat          # not "staging" or "test"
environment: dev          # not "development" or "local"
```

## Examples

### Minimal Configuration

```yaml
version: "1.0"

services:
  - id: my-api
    name: My API
    links:
      - label: Production
        environment: production
        items:
          - name: API
            url: https://api.company.com
            health_check: true
```

### Full Configuration

```yaml
version: "1.0"

settings:
  default_view: environment
  theme: auto
  health_check:
    enabled: true
    interval: 300
    timeout: 5

services:
  - id: payment-api
    name: Payment API
    description: Core payment processing service
    icon: 💳
    tags: [microservice, critical, backend]
    team: payments
    owner: payments@company.com
    repository: https://github.com/company/payment-api
    
    links:
      - label: Production
        environment: production
        items:
          - name: API Endpoint
            url: https://api.company.com/payments
            icon: 🌐
            health_check:
              enabled: true
              url: https://api.company.com/payments/health
          
          - name: Swagger Docs
            url: https://api.company.com/payments/swagger
            icon: 📖
          
          - name: Grafana Dashboard
            url: https://grafana.company.com/d/payment-api-prod
            icon: 📊
          
          - name: Kibana Logs
            url: https://kibana.company.com/app/logs?service=payment-api
            icon: 📜
          
          - name: K8s Dashboard
            url: https://k8s.company.com/workloads/payment-api
            icon: 🐳

groups:
  - name: Payment System
    type: project
    services:
      - payment-api
      - payment-worker
```

## Troubleshooting

### Health Check Failing

1. **Check URL accessibility**: Can the server reach the health endpoint?
2. **CORS issues**: For client-side checks, ensure CORS headers are set
3. **Timeout**: Increase `timeout` in global settings
4. **Rate limiting**: Reduce check `interval`

### Services Not Appearing

1. **YAML syntax**: Validate YAML with `yamllint services.yml`
2. **Required fields**: Ensure `id`, `name`, and `links` are present
3. **Check logs**: `docker logs directo` or `npm run dev`

### Configuration Not Updating

1. **Restart required**: Configuration is loaded on startup
2. **File path**: Verify `SERVICES_CONFIG` in `.env`
3. **File permissions**: Ensure readable by the application

## Next Steps

- See [API.md](./api.md) for REST API documentation
- Check [ARCHITECTURE.md](./architecture.md) for system design
- Review [EXAMPLES.md](./examples.md) for real-world configurations
