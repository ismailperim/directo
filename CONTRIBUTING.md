# Contributing to Directo

Thank you for your interest in contributing to Directo! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're here to build something useful together.

## How to Contribute

### Reporting Issues

- Check if the issue already exists
- Provide clear reproduction steps
- Include environment details (Node version, OS, etc.)
- Use issue templates when available

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests if applicable
5. Run linting: `npm run lint`
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add Slack integration
fix: resolve memory leak in indexer
docs: update configuration guide
refactor: simplify query parser
```

Prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Code Style

- Follow existing code style
- Use TypeScript strict mode
- Run `npm run lint:fix` before committing
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Write tests for new features
- Ensure existing tests pass: `npm test`
- Aim for good coverage on critical paths

### Documentation

- Update README.md if adding features
- Document configuration options
- Add JSDoc comments for public APIs
- Update examples when needed

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/directo.git
cd directo

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run in development mode
npm run dev
```

## Project Structure

```
src/
├── api/         # REST API endpoints
├── core/        # Core business logic
├── indexers/    # Data source indexers
└── utils/       # Utility functions
```

## Questions?

Open an issue for questions or discussion. We're happy to help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
