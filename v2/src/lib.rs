
use std::fs;
use std::path::Path;
use zed_extension_api as zed;
use zed_extension_api::{LanguageServerId, Result};

struct LaravelExtension {
    did_find_server: bool,
}

impl zed::Extension for LaravelExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        if language_server_id.as_ref() != "intelephense" {
            return Err(format!("unknown language server: {language_server_id}"));
        }

        if let Some(path) = worktree.which("intelephense") {
            return Ok(zed::Command {
                command: path,
                args: vec!["--stdio".to_string()],
                env: Default::default(),
            });
        }

        let server_path = self.server_script_path(language_server_id, worktree)?;
                let mut exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
        exe_path.pop();
        let proxy_path = exe_path.join("lsp-proxy/proxy.js");
        let intelephense_path = exe_path.join(&server_path);
        
        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![
                proxy_path.to_string_lossy().to_string(),
                intelephense_path.to_string_lossy().to_string(),
            ],
            env: Default::default(),
        })
    }
}

impl LaravelExtension {
    const SERVER_PATH: &'static str = "node_modules/intelephense/lib/intelephense.js";
    const PACKAGE_NAME: &'static str = "intelephense";

    fn server_exists(&self, worktree: &zed::Worktree) -> bool {
        let server_path = Path::new(&worktree.root_path()).join(Self::SERVER_PATH);
        fs::metadata(server_path).map_or(false, |stat| stat.is_file())
    }

    fn server_script_path(&mut self, language_server_id: &LanguageServerId, worktree: &zed::Worktree) -> Result<String> {
        let server_exists = self.server_exists(worktree);
        if self.did_find_server && server_exists {
            return Ok(Self::SERVER_PATH.to_string());
        }

        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let version = zed::npm_package_latest_version(Self::PACKAGE_NAME)?;

        if !server_exists
            || zed::npm_package_installed_version(Self::PACKAGE_NAME)?.as_ref() != Some(&version)
        {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            let result = zed::npm_install_package(Self::PACKAGE_NAME, &version);
            match result {
                Ok(()) => {
                    if !self.server_exists(worktree) {
                        Err(format!(
                            "installed package '{}' did not contain expected path '{}'",
                            Self::PACKAGE_NAME,
                            Self::SERVER_PATH
                        ))?;
                    }
                }
                Err(error) => {
                    if !self.server_exists(worktree) {
                        Err(error)?;
                    }
                }
            }
        }

        self.did_find_server = true;
        Ok(Self::SERVER_PATH.to_string())
    }
}

zed::register_extension!(LaravelExtension);
