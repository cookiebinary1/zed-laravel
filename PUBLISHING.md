# Publishing Guide for Zed Extension Gallery

This guide explains how to publish the Zed Laravel Extension to the official Zed Extension Gallery.

## Overview

The Zed Extension Gallery is the official marketplace for Zed editor extensions. To make your extension available there, you need to submit it to the central extensions repository.

## Prerequisites

1. **Public GitHub Repository** - Your extension must be in a public GitHub repository
2. **Complete Documentation** - All documentation files must be present
3. **Proper Metadata** - `extension.toml` must be correctly configured
4. **Tested Extension** - Extension must be fully functional and tested

## Publishing Steps

### Step 1: Prepare Your Repository

Ensure your repository contains all necessary files:

```
zed-laravel-extension/
├── src/lib.rs                 # Extension source code
├── lsp-proxy/proxy.js         # LSP proxy
├── extension.toml             # Extension metadata
├── README.md                  # Documentation
├── LICENSE                    # MIT license
└── target/wasm32-wasip2/release/zed_laravel.wasm  # Built extension
```

### Step 2: Verify Extension Metadata

Check that your `extension.toml` contains proper metadata:

```toml
[package]
name = "zed_laravel"
version = "0.1.0"
description = "Laravel extension for Zed editor with intelligent navigation and enhanced development experience"
authors = ["Your Name <your.email@example.com>"]
repository = "https://github.com/your-username/zed-laravel-extension"

[language_servers.intelephense]
name = "Intelephense"
languages = ["PHP"]
```

### Step 3: Submit to Central Repository

1. **Fork the central repository**: [zed-industries/extensions](https://github.com/zed-industries/extensions)

2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/extensions.git
   cd extensions
   git submodule init
   git submodule update
   ```

3. **Add your extension as a submodule**:
   ```bash
   git submodule add https://github.com/your-username/zed-laravel-extension.git extensions/laravel
   git add extensions/laravel
   ```

4. **Add entry to extensions.toml**:
   ```toml
   [laravel]
   submodule = "extensions/laravel"
   version = "0.0.1"
   ```

5. **Sort extensions**:
   ```bash
   pnpm sort-extensions
   ```

6. **Submit a pull request** with:
   - Your extension submodule
   - Updated extensions.toml
   - Brief description of your extension

### Step 4: Review Process

After submitting your pull request:

1. **Zed team will review** your extension
2. **Quality checks** will be performed
3. **Approval process** may take several days
4. **Feedback** will be provided if needed

### Step 5: Publication

Once approved:

1. **Extension appears** in Zed Extension Gallery
2. **Users can install** directly from Zed editor
3. **Automatic updates** are handled by Zed
4. **Community feedback** is collected

## Extension Gallery Features

### Automatic Installation
Users can install your extension directly from Zed editor:
1. Open Zed editor
2. Go to Extensions
3. Search for "Laravel"
4. Click Install

### Automatic Updates
- Extensions are automatically updated
- Users receive notifications about updates
- Version history is maintained

### Community Features
- User ratings and reviews
- Issue reporting
- Feature requests
- Community discussions

## Requirements for Publication

### Technical Requirements
- [x] Extension builds successfully
- [x] Proper `extension.toml` configuration
- [x] WASM file included
- [x] No critical bugs or issues

### Documentation Requirements
- [x] Complete README.md
- [x] Installation instructions
- [x] Usage examples
- [x] Troubleshooting guide
- [x] Contributing guidelines

### Legal Requirements
- [x] MIT license included
- [x] Clear disclaimer about AI generation
- [x] Proper attribution
- [x] Open source compliance

## Best Practices

### Repository Setup
1. **Use semantic versioning** for releases
2. **Tag releases** properly
3. **Keep documentation updated**
4. **Respond to issues** promptly

### Extension Quality
1. **Test thoroughly** before submission
2. **Handle errors gracefully**
3. **Provide clear error messages**
4. **Optimize performance**

### Community Engagement
1. **Respond to user feedback**
2. **Address issues quickly**
3. **Consider feature requests**
4. **Maintain active development**

## Troubleshooting

### Common Issues

1. **Extension not building**
   - Check Rust toolchain
   - Verify dependencies
   - Test build process

2. **Metadata errors**
   - Validate `extension.toml`
   - Check required fields
   - Verify format

3. **Repository issues**
   - Ensure public repository
   - Check file structure
   - Verify permissions

### Getting Help

If you encounter issues:

1. **Check Zed documentation**: [zed.dev/docs/extensions](https://zed.dev/docs/extensions)
2. **Review existing extensions**: [github.com/zed-industries/extensions](https://github.com/zed-industries/extensions)
3. **Ask in Zed community**: Discord or GitHub discussions
4. **Submit issue**: In the central extensions repository

## Post-Publication

### Monitoring
- Track user feedback
- Monitor issue reports
- Analyze usage statistics
- Plan future updates

### Maintenance
- Regular updates
- Bug fixes
- Feature additions
- Documentation updates

### Community Building
- Engage with users
- Share updates
- Gather feedback
- Build community

## Conclusion

Publishing to the Zed Extension Gallery provides:
- **Wide distribution** to Zed users
- **Automatic updates** and management
- **Community feedback** and engagement
- **Professional credibility** and recognition

Follow this guide to successfully publish your Laravel extension and contribute to the Zed ecosystem!
