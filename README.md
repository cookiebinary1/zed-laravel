# Zed Laravel Extension

A comprehensive Laravel extension for Zed editor that provides intelligent navigation and enhanced development experience for Laravel projects.

## Features

### Go to Definition for Laravel Helper Functions

The extension provides intelligent navigation for the most commonly used Laravel helper functions:

#### Laravel Helper Functions
- **`config('key')`** - Navigate to configuration files in `config/` directory
- **`view('name')`** - Navigate to Blade/PHP view files in `resources/views/`
- **`route('name')`** - Navigate to route definitions in `routes/` files
- **`asset('path')`** - Navigate to static files in `public/` directory
- **`url('path')`** - Navigate to routes or static files
- **`trans('key')`** / **`__('key')`** - Navigate to translation files in `lang/` directory
- **`env('key')`** - Navigate to environment variables in `.env` file
- **`old('field')`** - Navigate to session flash data
- **`session('key')`** - Navigate to session files
- **`cache('key')`** - Navigate to cache files
- **`storage_path('path')`** - Navigate to storage files
- **`public_path('path')`** - Navigate to public files
- **`base_path('path')`** - Navigate to root project files
- **`app_path('path')`** - Navigate to app files
- **`database_path('path')`** - Navigate to database files
- **`resource_path('path')`** - Navigate to resources files

#### Blade Components
- **`<x-component>`** - Navigate to Blade components in `resources/views/components/` or `app/View/Components/`

#### Laravel Facades
- **`Auth::method()`** - Navigate to Auth facade definitions
- **`Cache::method()`** - Navigate to Cache facade definitions
- **`DB::method()`** - Navigate to DB facade definitions
- **`Storage::method()`** - Navigate to Storage facade definitions
- **`Mail::method()`** - Navigate to Mail facade definitions
- **`Log::method()`** - Navigate to Log facade definitions
- **`Validator::method()`** - Navigate to Validator facade definitions
- **`Hash::method()`** - Navigate to Hash facade definitions
- **`Password::method()`** - Navigate to Password facade definitions

#### Database & Migrations
- **`Schema::method()`** - Navigate to Schema facade definitions
- **`Blueprint::method()`** - Navigate to Blueprint definitions

#### Validation Rules
- **Validation rules** - Navigate to custom validation rules in `app/Rules/` or `app/Http/Requests/`

#### Service Providers & Bindings
- **`$this->app->bind()`** - Navigate to service binding definitions
- **`$this->app->singleton()`** - Navigate to singleton service definitions
- **`$this->app->bindIf()`** - Navigate to conditional service bindings

#### Events & Listeners
- **`event(new EventName())`** - Navigate to event definitions
- **`Event::listen()`** - Navigate to event listener definitions
- **`Event::dispatch()`** - Navigate to event dispatching

#### Queues & Jobs
- **`dispatch(new JobName())`** - Navigate to job definitions
- **`Queue::push()`** - Navigate to queue job definitions

### Integration with PHP Language Server

- Uses **Intelephense** language server for basic PHP support
- Extended functionality specifically for Laravel projects via custom LSP proxy

## Installation

### Prerequisites

- Zed editor
- Node.js (for Intelephense language server)
- Intelephense language server

### Install Intelephense

```bash
# Install Intelephense globally
npm install -g intelephense

# Or install locally in your Laravel project
npm install --save-dev intelephense
```

### Install the Extension

1. Clone this repository:
```bash
git clone https://github.com/cookiebinary1/zed-laravel.git
cd zed-laravel
```

2. Build the extension:
```bash
cargo build --release
```

3. Copy the extension to Zed's extensions directory:
```bash
mkdir -p ~/.config/zed/extensions/
cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
```

4. Restart Zed editor

## Usage

### Basic Usage

1. Open a Laravel project in Zed editor
2. The extension will automatically detect Laravel files and provide enhanced navigation
3. Use **Ctrl+Click** on any Laravel helper function to navigate to its definition
4. Hover over functions for tooltip information

### Example

```php
<?php

// Navigate to config/app.php
$appName = config('app.name');

// Navigate to resources/views/welcome.blade.php
return view('welcome');

// Navigate to routes/web.php
return redirect()->route('home');

// Navigate to Blade component
<x-button>Click me</x-button>

// Navigate to Auth facade
Auth::user();

// Navigate to event definition
event(new UserRegistered($user));

// Navigate to job definition
dispatch(new SendWelcomeEmail($user));
```

## Supported Laravel Functionality

### Laravel Helper Functions
| Helper Function | Description | Example |
|----------------|-------------|---------|
| `config()` | Navigate to configuration files | `config('app.name')` |
| `view()` | Navigate to Blade/PHP views | `view('welcome')` |
| `route()` | Navigate to route definitions | `route('home')` |
| `asset()` | Navigate to static files | `asset('css/app.css')` |
| `url()` | Navigate to routes or files | `url('api/users')` |
| `trans()` / `__()` | Navigate to translation files | `trans('messages.welcome')` |
| `env()` | Navigate to environment variables | `env('DB_HOST')` |
| `old()` | Navigate to session flash data | `old('email')` |
| `session()` | Navigate to session files | `session('user_id')` |
| `cache()` | Navigate to cache files | `cache('key')` |
| `storage_path()` | Navigate to storage files | `storage_path('app/uploads')` |
| `public_path()` | Navigate to public files | `public_path('css/style.css')` |
| `base_path()` | Navigate to root project files | `base_path('composer.json')` |
| `app_path()` | Navigate to app files | `app_path('Models/User.php')` |
| `database_path()` | Navigate to database files | `database_path('migrations')` |
| `resource_path()` | Navigate to resources files | `resource_path('views/welcome.blade.php')` |

### Blade Components
| Component | Description | Example |
|-----------|-------------|---------|
| `<x-component>` | Navigate to Blade components | `<x-button>Click me</x-button>` |
| `<x:component>` | Navigate to Blade components | `<x:form.input name="email" />` |

### Laravel Facades
| Facade | Description | Example |
|--------|-------------|---------|
| `Auth::` | Navigate to Auth facade | `Auth::user()` |
| `Cache::` | Navigate to Cache facade | `Cache::get('key')` |
| `DB::` | Navigate to DB facade | `DB::table('users')` |
| `Storage::` | Navigate to Storage facade | `Storage::get('file.txt')` |
| `Mail::` | Navigate to Mail facade | `Mail::to('user@example.com')` |
| `Log::` | Navigate to Log facade | `Log::info('message')` |
| `Validator::` | Navigate to Validator facade | `Validator::make($data, $rules)` |
| `Hash::` | Navigate to Hash facade | `Hash::make('password')` |
| `Password::` | Navigate to Password facade | `Password::sendResetLink($request)` |

### Database & Migrations
| Function | Description | Example |
|----------|-------------|---------|
| `Schema::` | Navigate to Schema facade | `Schema::create('users', ...)` |
| `Blueprint::` | Navigate to Blueprint definitions | `$table->string('name')` |

### Validation Rules
| Function | Description | Example |
|----------|-------------|---------|
| Validation rules | Navigate to custom validation rules | `'email' => 'required|email|unique:users'` |

### Service Providers & Bindings
| Function | Description | Example |
|----------|-------------|---------|
| `$this->app->bind()` | Navigate to service binding definitions | `$this->app->bind(Interface::class, Implementation::class)` |
| `$this->app->singleton()` | Navigate to singleton service definitions | `$this->app->singleton(Service::class, function() {})` |
| `$this->app->bindIf()` | Navigate to conditional service bindings | `$this->app->bindIf(Interface::class, Implementation::class)` |

### Events & Listeners
| Function | Description | Example |
|----------|-------------|---------|
| `event()` | Navigate to event definitions | `event(new UserRegistered($user))` |
| `Event::listen()` | Navigate to event listener definitions | `Event::listen(UserRegistered::class, function($event) {})` |
| `Event::dispatch()` | Navigate to event dispatching | `Event::dispatch(new UserRegistered($user))` |

### Queues & Jobs
| Function | Description | Example |
|----------|-------------|---------|
| `dispatch()` | Navigate to job definitions | `dispatch(new SendWelcomeEmail($user))` |
| `Queue::push()` | Navigate to queue job definitions | `Queue::push(new SendWelcomeEmail($user))` |

## Architecture

The extension consists of two main parts:

1. **Rust Extension** (`src/lib.rs`) - Main extension logic that launches the language server
2. **LSP Proxy** (`lsp-proxy/proxy.js`) - Node.js proxy that intercepts and enhances language server requests

### How it Works

1. The Rust extension launches Intelephense language server via the Node.js proxy
2. The proxy intercepts LSP requests and responses
3. For Laravel-specific functions, the proxy provides custom navigation logic
4. For standard PHP functions, requests are forwarded to Intelephense

## Performance Optimizations

- **File caching** with 5-second expiration
- **Cursor-based matching** for precise search
- **Memory management** with automatic cache cleanup
- **Asynchronous processing** to avoid blocking the main thread

## Troubleshooting

### Common Issues

1. **"intelephense not found" error**
   - Install Intelephense: `npm install -g intelephense`
   - Or install locally: `npm install --save-dev intelephense`

2. **"operation not supported on this platform" error**
   - Ensure you're using the correct Intelephense version
   - Check that Node.js is properly installed

3. **Extension not loading**
   - Restart Zed editor after installation
   - Check that the `.wasm` file is in the correct location

### Debug Mode

To enable debug logging, set the environment variable:
```bash
export ZED_LARAVEL_DEBUG=1
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Install dependencies: `cargo build`
3. Make your changes
4. Test the extension
5. Submit a pull request

## Disclaimer

**Important Notice**: This extension was largely generated using AI assistance. While it has been tested and optimized, please use it at your own risk. The developers cannot guarantee complete compatibility with all Laravel projects or Zed editor versions.

**Use at your own risk**: This extension is provided as-is without warranty of any kind. Always test thoroughly in your development environment before using in production projects.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Publishing to Zed Extension Gallery

To make this extension available in the official Zed Extension Gallery:

1. **Create a public GitHub repository** with this extension
2. **Add to central extensions repository** by submitting a pull request to [zed-industries/extensions](https://github.com/zed-industries/extensions)
3. **Follow Zed's extension guidelines** for proper metadata and structure
4. **Extension will automatically appear** in Zed Extension Gallery after approval

For detailed publishing instructions, see [Zed Extension Development Guide](https://zed.dev/docs/extensions/developing-extensions).

## Acknowledgments

- [Zed Editor](https://zed.dev/) for providing the extension platform
- [Intelephense](https://intelephense.com/) for the excellent PHP language server
- [Laravel](https://laravel.com/) for the amazing PHP framework