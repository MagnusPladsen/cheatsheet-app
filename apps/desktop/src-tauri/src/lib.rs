use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

const MAX_INCLUDE_DEPTH: u32 = 3;

#[derive(Debug, Serialize, Deserialize)]
struct StoredConfig {
    folders: Vec<String>,
}

fn config_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("com.magnuspladsen.cheatsheet");
    fs::create_dir_all(&data_dir).ok();
    data_dir.join("config.json")
}

/// Expand ~ and $HOME in a path string.
fn expand_home(path_str: &str) -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let home_str = home.to_string_lossy();
    let expanded = path_str
        .replace("$HOME", &home_str)
        .replace("${HOME}", &home_str);
    if expanded.starts_with("~/") {
        home.join(&expanded[2..])
    } else {
        PathBuf::from(expanded)
    }
}

/// Detect include/source directives in a config file and return resolved paths.
fn detect_includes(content: &str, file_path: &Path, file_ext: &str) -> Vec<PathBuf> {
    let parent = file_path.parent().unwrap_or(Path::new("/"));
    let mut includes = Vec::new();

    match file_ext {
        // tmux: source-file <path> or source <path>
        "conf" if file_path.to_string_lossy().contains("tmux") => {
            let re = Regex::new(r#"(?m)^\s*source(?:-file)?\s+["']?([^"'\s#]+)["']?"#).unwrap();
            for cap in re.captures_iter(content) {
                let p = expand_home(&cap[1]);
                let resolved = if p.is_absolute() { p } else { parent.join(p) };
                includes.push(resolved);
            }
        }
        // bash: source <path> or . <path>
        "bashrc" | "bash_aliases" | "bash_profile"
            if file_path.to_string_lossy().contains("bash") =>
        {
            let re = Regex::new(r#"(?m)^\s*(?:source|\.) +["']?([^"'\s#;]+)["']?"#).unwrap();
            for cap in re.captures_iter(content) {
                let raw = &cap[1];
                if raw.contains('$') && !raw.contains("$HOME") && !raw.contains("${HOME}") {
                    continue;
                }
                let p = expand_home(raw);
                let resolved = if p.is_absolute() { p } else { parent.join(p) };
                includes.push(resolved);
            }
        }
        // zsh: source <path> or . <path>
        "zshrc" | "" if file_path.to_string_lossy().contains("zsh") => {
            let re = Regex::new(r#"(?m)^\s*(?:source|\.) +["']?([^"'\s#;]+)["']?"#).unwrap();
            for cap in re.captures_iter(content) {
                let raw = &cap[1];
                // Skip variable expansions we can't resolve (except $HOME/~)
                if raw.contains('$') && !raw.contains("$HOME") && !raw.contains("${HOME}") {
                    continue;
                }
                let p = expand_home(raw);
                let resolved = if p.is_absolute() { p } else { parent.join(p) };
                includes.push(resolved);
            }
        }
        // vim: source <path> or runtime <path>
        "vimrc" | "vim" => {
            let re = Regex::new(r#"(?m)^\s*(?:source|runtime)\s+["']?([^"'\s#]+)["']?"#).unwrap();
            for cap in re.captures_iter(content) {
                let raw = &cap[1];
                if raw.contains('$') && !raw.contains("$HOME") && !raw.contains("${HOME}") {
                    continue;
                }
                let p = expand_home(raw);
                let resolved = if p.is_absolute() { p } else { parent.join(p) };
                includes.push(resolved);
            }
        }
        // lua (neovim): require("module") or dofile("path")
        "lua" => {
            // require("foo.bar") → look for foo/bar.lua relative to nvim config
            let re_require = Regex::new(r#"require\s*\(\s*["']([^"']+)["']\s*\)"#).unwrap();
            // Find the nvim config root (parent of lua/)
            let nvim_root = {
                let mut p = parent;
                loop {
                    if p.join("init.lua").exists() || p.file_name().map_or(false, |n| n == "nvim") {
                        break p.to_path_buf();
                    }
                    match p.parent() {
                        Some(pp) => p = pp,
                        None => { break parent.to_path_buf(); }
                    }
                }
            };
            let lua_dir = nvim_root.join("lua");

            for cap in re_require.captures_iter(content) {
                let module = cap[1].replace('.', "/");
                // Try module.lua then module/init.lua
                let path1 = lua_dir.join(format!("{}.lua", module));
                let path2 = lua_dir.join(&module).join("init.lua");
                if path1.exists() {
                    includes.push(path1);
                } else if path2.exists() {
                    includes.push(path2);
                }
            }

            // dofile("path")
            let re_dofile = Regex::new(r#"dofile\s*\(\s*["']([^"']+)["']\s*\)"#).unwrap();
            for cap in re_dofile.captures_iter(content) {
                let p = expand_home(&cap[1]);
                let resolved = if p.is_absolute() { p } else { parent.join(p) };
                includes.push(resolved);
            }
        }
        _ => {}
    }

    includes
}

/// Determine file "type" for include detection based on path.
fn file_ext_hint(path: &Path) -> &str {
    let name = path.file_name().unwrap_or_default().to_string_lossy();
    if name.ends_with(".lua") {
        "lua"
    } else if name.ends_with(".vim") || name == ".vimrc" {
        "vimrc"
    } else if name.contains("tmux") && name.ends_with(".conf") {
        "conf"
    } else if name.contains("zsh") || name == ".zshrc" {
        "zshrc"
    } else if name == ".bashrc" || name == ".bash_aliases" || name == ".bash_profile" {
        "bashrc"
    } else {
        ""
    }
}

/// Read a file and recursively follow includes, appending all content.
fn read_with_includes(
    path: &Path,
    visited: &mut HashSet<PathBuf>,
    depth: u32,
) -> Option<String> {
    if depth > MAX_INCLUDE_DEPTH {
        return None;
    }

    let canonical = path.canonicalize().ok()?;
    if visited.contains(&canonical) {
        return None; // cycle prevention
    }
    visited.insert(canonical.clone());

    let content = fs::read_to_string(path).ok()?;
    let ext = file_ext_hint(path);
    let includes = detect_includes(&content, path, ext);

    let mut full_content = content;

    for inc_path in includes {
        if let Some(inc_content) = read_with_includes(&inc_path, visited, depth + 1) {
            full_content.push('\n');
            full_content.push_str(&inc_content);
        }
    }

    Some(full_content)
}

#[tauri::command]
async fn read_config_files(
    base_path: String,
    file_patterns: Vec<String>,
) -> Result<HashMap<String, String>, String> {
    let base = Path::new(&base_path);
    let mut results = HashMap::new();

    for pattern in &file_patterns {
        let full_path = base.join(pattern);
        if full_path.exists() && full_path.is_file() {
            let mut visited = HashSet::new();
            match read_with_includes(&full_path, &mut visited, 0) {
                Some(content) => {
                    results.insert(pattern.clone(), content);
                }
                None => {
                    eprintln!("Failed to read {}", full_path.display());
                }
            }
        }
    }

    Ok(results)
}

#[tauri::command]
async fn get_stored_folders() -> Result<Vec<String>, String> {
    let path = config_path();
    if !path.exists() {
        return Ok(vec![]);
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: StoredConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config.folders)
}

#[tauri::command]
async fn save_folders(folders: Vec<String>) -> Result<(), String> {
    let path = config_path();
    let config = StoredConfig { folders };
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn detect_apps(base_path: String, all_file_paths: Vec<Vec<String>>) -> Result<Vec<bool>, String> {
    let base = Path::new(&base_path);
    let results: Vec<bool> = all_file_paths
        .iter()
        .map(|paths| paths.iter().any(|p| base.join(p).exists()))
        .collect();
    Ok(results)
}

#[tauri::command]
async fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            read_config_files,
            get_stored_folders,
            save_folders,
            detect_apps,
            get_home_dir,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.hide().ok();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
