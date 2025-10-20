# Laravel Toolkit for Zed

This repository contains an in-progress Zed extension focused on first-class Laravel ergonomics.

## Goals
- Index Laravel workspaces to power instant navigation between controllers, views, routes, configs, translations, Blade components, and Livewire/Inertia artifacts.
- Provide a Laravel-aware language server that augments existing PHP tooling with framework semantics.
- Offer slash commands for quickly jumping to views/routes and running targeted `artisan` commands.
- Surface Laravel documentation and context for Zed's assistant workflows.

## Current Status
- Initial extension scaffolding (`extension.toml`, `Cargo.toml`, WASM entry point).
- Placeholder slash command wiring ready for incremental implementation.
- Feature roadmap captured in `docs/feature-plan.md`.

## Next Steps
1. Implement project indexer capable of scanning canonical Laravel directories and vendor-provided resources.
2. Ship a native helper (Rust or TypeScript) that speaks LSP and handles Laravel-specific `textDocument/definition` requests.
3. Populate slash commands with fuzzy search over the indexed data and integrate with `php artisan`.
4. Package Blade grammar (or depend on the existing Blade extension) and ensure PHP language servers receive tailored initialization options.

## Developing
- Install the `wasm32-wasip2` target: `rustup target add wasm32-wasip2`.
- Build the extension: `cargo build --target wasm32-wasip2 --release`.
- In Zed, run `zed: install dev extension` and point to this directory.

The project is licensed under the Apache 2.0 License.
