# Installation Guide

This guide will help you install the Zed Laravel Extension step by step.

## Prerequisites

Before installing the extension, make sure you have the following installed:

- **Zed Editor** - Download from [zed.dev](https://zed.dev/)
- **Node.js** - Download from [nodejs.org](https://nodejs.org/) (version 14 or higher)
- **Rust** - Download from [rustup.rs](https://rustup.rs/) (for building the extension)
- **Git** - For cloning the repository

## Step 1: Install Intelephense Language Server

The extension requires Intelephense language server to work properly.

### Option A: Global Installation (Recommended)

```bash
npm install -g intelephense
```

### Option B: Local Installation

```bash
# In your Laravel project directory
npm install --save-dev intelephense
```

### Verify Installation

```bash
# Check if Intelephense is installed
intelephense --version
```

## Step 2: Build the Extension

1. Clone the repository:
```bash
git clone https://github.com/cookiebinary1/zed-laravel.git
cd zed-laravel
```

2. Build the extension:
```bash
cargo build --release
```

This will create the extension file at `target/wasm32-wasip2/release/zed_laravel.wasm`.

## Step 3: Install the Extension

1. Create the extensions directory (if it doesn't exist):
```bash
mkdir -p ~/.config/zed/extensions/
```

2. Copy the extension file:
```bash
cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
```

## Step 4: Restart Zed Editor

Close and restart Zed editor to load the extension.

## Step 5: Test the Installation

1. Open a Laravel project in Zed editor
2. Open any PHP file with Laravel helper functions
3. Try Ctrl+Click on a helper function like `config('app.name')`
4. You should be navigated to the appropriate file

## Troubleshooting

### Issue: "intelephense not found"

**Error Message:**
```
intelephense not found. Please install it via npm: npm install -g intelephense
```

**Solution:**
```bash
# Install Intelephense globally
npm install -g intelephense

# Verify installation
intelephense --version
```

### Issue: "operation not supported on this platform"

**Error Message:**
```
Language server intelephense: from extension "Laravel" version 0.0.1: operation not supported on this platform
```

**Solution:**
1. Ensure you're using the correct Intelephense version
2. Check that Node.js is properly installed
3. Try reinstalling Intelephense:
```bash
npm uninstall -g intelephense
npm install -g intelephense
```

### Issue: Extension not loading

**Symptoms:**
- No Laravel functionality available
- No hover tooltips for Laravel functions

**Solution:**
1. Restart Zed editor completely
2. Check that the extension file exists:
```bash
ls -la ~/.config/zed/extensions/zed_laravel.wasm
```
3. Rebuild and reinstall the extension:
```bash
cargo build --release
cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
```

### Issue: Slow performance

**Symptoms:**
- Slow response when clicking on Laravel functions
- Extension feels sluggish

**Solution:**
1. The extension includes performance optimizations
2. First click may be slower due to file caching
3. Subsequent clicks should be faster
4. If issues persist, check your system resources

## Configuration

### Environment Variables

You can set the following environment variables to configure the extension:

```bash
# Enable debug logging
export ZED_LARAVEL_DEBUG=1

# Set custom Intelephense path (if not in PATH)
export INTELEPHENSE_PATH=/path/to/intelephense
```

### Laravel Project Structure

The extension works best with standard Laravel project structure:

```
your-laravel-project/
├── app/
│   ├── Http/
│   ├── Models/
│   ├── Providers/
│   └── ...
├── config/
├── database/
├── resources/
│   └── views/
├── routes/
├── storage/
└── ...
```

## Uninstallation

To uninstall the extension:

1. Remove the extension file:
```bash
rm ~/.config/zed/extensions/zed_laravel.wasm
```

2. Restart Zed editor

## Support

If you encounter any issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-username/zed-laravel-extension/issues)
2. Create a new issue with detailed information about your problem
3. Include your operating system, Zed version, and error messages

## Development

If you want to contribute to the extension:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

For development setup, see the main [README.md](README.md) file.