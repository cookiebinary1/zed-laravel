//! Laravel Toolkit extension for Zed.
//!
//! This crate wires up the high-level shape of the extension. The actual
//! navigation logic and workspace indexing will live in dedicated modules that
//! populate rich metadata for Laravel projects.

use std::sync::Arc;

use once_cell::sync::Lazy;
use zed_extension_api as zed;

mod slash;

static LOGGER: Lazy<()> = Lazy::new(|| {
    // Enable tracing logs when Zed is started via `zed --foreground`.
    let _ = tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .try_init();
});

struct LaravelExtension {
    _init: Arc<()>,
}

impl zed::Extension for LaravelExtension {
    fn new() -> Self {
        Lazy::force(&LOGGER);
        Self { _init: Arc::new(()) }
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        Err("Laravel Navigator language server not wired up yet".into())
    }

    fn run_slash_command(
        &self,
        command: zed::SlashCommand,
        args: Vec<String>,
        worktree: Option<&zed::Worktree>,
    ) -> zed::Result<zed::SlashCommandOutput> {
        slash::run(command, args, worktree)
    }

    fn complete_slash_command_argument(
        &self,
        command: zed::SlashCommand,
        args: Vec<String>,
    ) -> zed::Result<Vec<zed::SlashCommandArgumentCompletion>> {
        slash::complete(command, args)
    }
}

zed::register_extension!(LaravelExtension);
