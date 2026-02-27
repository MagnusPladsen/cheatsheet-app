use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

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
            match fs::read_to_string(&full_path) {
                Ok(content) => {
                    results.insert(pattern.clone(), content);
                }
                Err(e) => {
                    eprintln!("Failed to read {}: {}", full_path.display(), e);
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
        .invoke_handler(tauri::generate_handler![
            read_config_files,
            get_stored_folders,
            save_folders,
            detect_apps,
            get_home_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
