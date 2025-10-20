# Contributing to Zed Laravel Extension

Thank you for your interest in contributing to the Zed Laravel Extension! This document provides guidelines for contributing to the project.

## Important Notice

**This extension was largely generated using AI assistance.** While it has been tested and optimized, please be aware that:
- The code may contain AI-generated patterns and structures
- Some functionality may need refinement based on real-world usage
- Community contributions are especially valuable for improving AI-generated code
- Please test thoroughly before using in production environments

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (OS, Zed version, etc.)

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Create a pull request

## Development Setup

### Prerequisites

- Rust (latest stable version)
- Node.js (version 14 or higher)
- Git
- Zed editor

### Setup

1. Clone your fork:
```bash
git clone https://github.com/cookiebinary1/zed-laravel.git
cd zed-laravel
```

2. Build the project:
```bash
cargo build
```

3. Test the extension:
```bash
# Build release version
cargo build --release

# Copy to extensions directory
cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
```

## Code Style

### Rust Code

- Follow Rust standard formatting: `cargo fmt`
- Use meaningful variable and function names
- Add comments for complex logic
- Handle errors properly

### JavaScript Code

- Use modern ES6+ syntax
- Follow consistent indentation (2 spaces)
- Add JSDoc comments for functions
- Handle errors with try-catch blocks

## Testing

### Manual Testing

1. Test with different Laravel project structures
2. Verify all helper functions work correctly
3. Check performance with large projects
4. Test error handling scenarios

### Test Cases

- Basic helper functions (`config`, `view`, `route`)
- Blade components
- Laravel facades
- Database migrations
- Validation rules
- Service providers
- Events and listeners
- Queues and jobs

## Adding New Features

### Laravel Helper Functions

1. Add regex pattern in `lsp-proxy/proxy.js`
2. Implement resolver function
3. Add hover support
4. Update documentation

Example:
```javascript
// Add pattern
{ regex: /new_helper\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveNewHelper' },

// Implement resolver
resolveNewHelper(param) {
  try {
    // Implementation
    return {
      uri: `file://${path}`,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
    };
  } catch (error) {
    console.error("Error resolving new helper:", error);
    return null;
  }
}
```

### New Laravel Features

1. Research the feature thoroughly
2. Understand the Laravel conventions
3. Implement navigation logic
4. Add comprehensive tests
5. Update documentation

## Documentation

### Updating Documentation

When adding new features:

1. Update `README.md` with new functionality
2. Add examples to `FEATURES.md`
3. Update installation guide if needed
4. Add performance notes if relevant

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include troubleshooting information
- Keep documentation up to date

## Performance Considerations

### Optimization Guidelines

- Cache file contents when possible
- Use efficient regex patterns
- Implement proper memory management
- Avoid blocking operations

### Performance Testing

- Test with large Laravel projects
- Monitor memory usage
- Measure response times
- Check cache effectiveness

## Release Process

### Versioning

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `Cargo.toml`
- Create release notes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Version bumped
- [ ] Release notes created
- [ ] GitHub release created

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow professional standards

### Communication

- Use clear, professional language
- Provide detailed explanations
- Be patient with newcomers
- Ask questions when needed

## Getting Help

### Resources

- GitHub Issues for bug reports
- GitHub Discussions for questions
- Documentation for usage guides
- Code comments for implementation details

### Contact

- Create an issue for questions
- Use GitHub Discussions for general topics
- Follow the project on GitHub for updates

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors list
- Release notes for significant contributions

Thank you for contributing to the Zed Laravel Extension!
