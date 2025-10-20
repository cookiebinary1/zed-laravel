# Laravel Extension Feature Plan

## Navigation Targets
- **Views**: Resolve `view('foo.bar')`, `View::make('foo.bar')`, Blade `@include('foo.bar')`, and Inertia render calls to `resources/views/foo/bar.blade.php` or `resources/js/Pages/foo/bar.{vue,tsx}`.
- **Routes**: Map `route('users.index')`, `to_route`, `redirect()->route('...')`, and `Route::has()` usages to route definitions in `routes/*.php` or cached `bootstrap/cache/routes-*.php`.
- **Configs**: Resolve `config('app.name')`, `Config::get()`, `env('APP_ENV')` to `config/app.php` entries (with key path highlighting) and `.env` values.
- **Translations**: Handle `__('messages.welcome')`, `@lang()`, `Lang::get()` to `resources/lang/{locale}/messages.php` structured keys.
- **Mails & Notifications**: Link `Mail::to()->send(new WelcomeMail)` and notification classes to view templates under `resources/views/mail` and `resources/views/vendor`.
- **Jobs & Events**: Jump between `dispatch(new SomeJob)` and class definitions in `app/Jobs`, `event(new FooEvent)` to `app/Events`.
- **Policies & Gates**: Connect `Gate::allows('ability')` / `->can('ability')` to policy methods.
- **Blade Components**: Map `<x-alert />`, `Blade::component('package::alert')` to component classes or view files under `resources/views/components`.
- **Livewire / Inertia**: Detect `Livewire::component()` registration and `@livewire('component')` usage to component classes and templates. For Inertia, index `resources/js/Pages` for `Inertia::render` targets.
- **Migrations/Models**: Provide quick jumps from `Schema::create('users')` to the corresponding migration or model, and from `User::factory()` to factory definitions.

## Indexing Strategy
- Build project graph from workspace root, respecting `config('app.providers')`, `config/view.php` overrides, `view_path`, and `Lang::setLocale()`.
- Use incremental file watchers to re-index on changes; maintain caches for view names, route names, config keys, translation keys, component tags.
- Parse PHP via a lightweight parser (e.g. tree-sitter-php) to spot string literals tied to Laravel helpers without heavy AST building.
- Honour `modules`/`packages` inside `vendor/*` when development packages provide resources (via `loadViewsFrom`, `loadMigrationsFrom`).

## Zed Integration Hooks
- Ship a custom Rust-based LSP (`laravel-nav-lsp`) launched via `language_server_command` to provide `textDocument/definition`, `textDocument/references`, and code lenses for Laravel-specific helpers.
- Contribute Blade grammar + language metadata if not already available; reuse existing PHP LSP for general PHP features and augment via `language_server_additional_*` hooks.
- Register slash commands:
  - `laravel: find view` – fuzzy search indexed views.
  - `laravel: find route` – fuzzy search route names, open definition or copy URL path.
  - `laravel: artisan` – surface curated `php artisan` tasks with workspace detection.
- Provide docs indexer for official Laravel docs via `index_docs`, enabling `/docs laravel <topic>`.

## Nice-to-Have Enhancements
- Blade snippets for common directives and components.
- Configurable Intelephense bridge: ensure PHP LSP sees `vendor/laravel/framework` stubs and `bootstrap/cache` metadata.
- Route model binding helper: detect controller action parameters and link to model definitions.
- Context server to expose `artisan tinker` or `phpunit` command results inside Zed.
- Status indicator showing detected Laravel version and environment from `composer.json` & `.env`.

## Risks / Open Questions
- Ensure bundled LSP binary remains lightweight; consider Rust implementation using `tower-lsp` or bridging to Node via `npm install` if acceptable.
- Determine how to surface navigation results in Blade HTML vs PHP contexts without fighting existing language servers.
- Confirm file watcher APIs in `zed_extension_api` support recursive indexing; otherwise fall back to periodic refresh or artisan dumps.
- Decide on packaging of large dependency (tree-sitter-php) inside WASM size budget.
