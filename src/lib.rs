
use std::fs;
use std::path::Path;
use zed_extension_api as zed;
use zed_extension_api::{LanguageServerId, Result};

struct LaravelExtension {}

impl zed::Extension for LaravelExtension {
    fn new() -> Self {
        Self {}
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        match language_server_id.as_ref() {
            "intelephense" => self.intelephense_command(worktree),
            _ => Err(format!("unknown language server: {language_server_id}")),
        }
    }
}

impl LaravelExtension {
    fn intelephense_command(&mut self, worktree: &zed::Worktree) -> Result<zed::Command> {
        // Použijeme náš proxy s Intelephense
        let mut exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
        exe_path.pop();
        let proxy_path = exe_path.join("lsp-proxy/proxy.js");
        
        // Skúsime nájsť intelephense v PATH
        if let Some(path) = worktree.which("intelephense") {
            return Ok(zed::Command {
                command: zed::node_binary_path()?,
                args: vec![
                    proxy_path.to_string_lossy().to_string(),
                    path,
                ],
                env: Default::default(),
            });
        }

        // Ak intelephense nie je v PATH, skúsime ho nájsť v node_modules
        let node_modules_path = Path::new(&worktree.root_path()).join("node_modules/.bin/intelephense");
        if fs::metadata(&node_modules_path).map_or(false, |stat| stat.is_file()) {
            return Ok(zed::Command {
                command: zed::node_binary_path()?,
                args: vec![
                    proxy_path.to_string_lossy().to_string(),
                    node_modules_path.to_string_lossy().to_string(),
                ],
                env: Default::default(),
            });
        }

        Err("intelephense not found. Please install it via npm: npm install -g intelephense".to_string())
    }
}

zed::register_extension!(LaravelExtension);
