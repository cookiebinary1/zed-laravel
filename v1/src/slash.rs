use zed_extension_api as zed;

pub fn run(
    command: zed::SlashCommand,
    args: Vec<String>,
    worktree: Option<&zed::Worktree>,
) -> zed::Result<zed::SlashCommandOutput> {
    match command.name.as_str() {
        "laravel_view" => find_view(args, worktree),
        "laravel_route" => find_route(args, worktree),
        "laravel_artisan" => run_artisan(args, worktree),
        other => Err(format!("Unsupported slash command: {other}")),
    }
}

pub fn complete(
    command: zed::SlashCommand,
    args: Vec<String>,
) -> zed::Result<Vec<zed::SlashCommandArgumentCompletion>> {
    match command.name.as_str() {
        "laravel_view" => complete_views(args),
        "laravel_route" => complete_routes(args),
        "laravel_artisan" => complete_artisan(args),
        other => Err(format!("Unsupported slash command: {other}")),
    }
}

fn find_view(
    _args: Vec<String>,
    _worktree: Option<&zed::Worktree>,
) -> zed::Result<zed::SlashCommandOutput> {
    Err("View search is not implemented yet".into())
}

fn find_route(
    _args: Vec<String>,
    _worktree: Option<&zed::Worktree>,
) -> zed::Result<zed::SlashCommandOutput> {
    Err("Route search is not implemented yet".into())
}

fn run_artisan(
    _args: Vec<String>,
    _worktree: Option<&zed::Worktree>,
) -> zed::Result<zed::SlashCommandOutput> {
    Err("Artisan helpers are not implemented yet".into())
}

fn complete_views(_args: Vec<String>) -> zed::Result<Vec<zed::SlashCommandArgumentCompletion>> {
    Ok(Vec::new())
}

fn complete_routes(_args: Vec<String>) -> zed::Result<Vec<zed::SlashCommandArgumentCompletion>> {
    Ok(Vec::new())
}

fn complete_artisan(_args: Vec<String>) -> zed::Result<Vec<zed::SlashCommandArgumentCompletion>> {
    Ok(Vec::new())
}
