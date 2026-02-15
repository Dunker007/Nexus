#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_shell::ShellExt;
use std::path::PathBuf;

// Hold the Bridge and Tunnel processes
struct AppProcesses {
    bridge: Option<Child>,
    tunnel: Option<Child>,
}

// Thread-safe wrapper
struct ProcessState(Arc<Mutex<AppProcesses>>);

fn ensure_dependencies(bridge_path: &std::path::Path) -> bool {
    let node_modules = bridge_path.join("node_modules");
    
    if node_modules.exists() {
        return true;
    }
    
    println!("Installing Bridge dependencies (first run)...");
    
    let install = Command::new("cmd")
        .args(["/C", "npm", "install", "--production"])
        .current_dir(bridge_path)
        .output();
    
    match install {
        Ok(output) => output.status.success(),
        Err(e) => {
            eprintln!("Failed to run npm install: {}", e);
            false
        }
    }
}

use std::fs;
use std::io;

fn unzip_resource(zip_path: &std::path::Path, dest_dir: &std::path::Path) -> bool {
    if !zip_path.exists() {
        eprintln!("Zip file not found: {:?}", zip_path);
        return false;
    }
    
    println!("Extracting {:?} to {:?}", zip_path, dest_dir);
    
    let file = match fs::File::open(zip_path) {
        Ok(f) => f,
        Err(e) => {
            eprintln!("Failed to open zip: {}", e);
            return false;
        }
    };

    let mut archive = match zip::ZipArchive::new(file) {
        Ok(a) => a,
        Err(e) => {
            eprintln!("Failed to read zip archive: {}", e);
            return false;
        }
    };

    for i in 0..archive.len() {
        let mut file = match archive.by_index(i) {
            Ok(f) => f,
            Err(_) => continue,
        };
        
        // Sanitize path (avoid ZipSlip)
        let outpath = match file.enclosed_name() {
            Some(path) => dest_dir.join(path),
            None => continue,
        };

        if (*file.name()).ends_with('/') {
            let _ = fs::create_dir_all(&outpath);
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    let _ = fs::create_dir_all(&p);
                }
            }
            let mut outfile = match fs::File::create(&outpath) {
                Ok(f) => f,
                Err(_) => continue,
            };
            let _ = io::copy(&mut file, &mut outfile);
        }
    }
    
    true
}

fn start_bridge(app_handle: &tauri::AppHandle) -> Option<Child> {
    // 1. Determine paths
    let resource_dir = app_handle.path().resource_dir().ok()?;
    
    // We will extract to AppData so it is writable and persistent
    let app_data_dir = app_handle.path().app_data_dir().ok()?;
    if !app_data_dir.exists() {
        let _ = fs::create_dir_all(&app_data_dir);
    }

    let bridge_dest = app_data_dir.join("bridge");
    let server_js = bridge_dest.join("server.js");

    // 2. Check if we need to unzip (first run, missing, or upgrade)
    let zip_path = resource_dir.join("bridge.zip");
    let mut should_unzip = !server_js.exists();
    
    if !should_unzip && zip_path.exists() {
        // Check timestamps: if zip is newer than server.js, update
        if let (Ok(zip_meta), Ok(js_meta)) = (fs::metadata(&zip_path), fs::metadata(&server_js)) {
             if let (Ok(zip_time), Ok(js_time)) = (zip_meta.modified(), js_meta.modified()) {
                  if zip_time > js_time {
                      println!("Bridge update detected. Re-extracting...");
                      should_unzip = true;
                  }
             }
        }
    }

    if should_unzip {
        if zip_path.exists() {
            // Clean old directory before unzipping to remove stale files
            if bridge_dest.exists() {
                let _ = fs::remove_dir_all(&bridge_dest);
                let _ = fs::create_dir_all(&bridge_dest);
            }
            
            if !unzip_resource(&zip_path, &bridge_dest) {
                eprintln!("Failed to unzip bridge");
                return None;
            }
        } else {
            // Fallback for dev (not zipped)
        }
    }

    // Fallback to dev path if absolutely nothing found in AppData
    let final_bridge_path = if server_js.exists() {
        bridge_dest
    } else {
         // Dev fallback
         std::path::PathBuf::from(r"C:\Repos GIT\Nexus\bridge")
    };
    
    if !final_bridge_path.join("server.js").exists() {
        eprintln!("Bridge server.js not found at {:?}", final_bridge_path);
        return None;
    }

    if !ensure_dependencies(&final_bridge_path) {
        return None;
    }

    let log_path = std::path::PathBuf::from(r"C:\Users\Public\nexus_bridge.log");
    let stdout_file = std::fs::File::create(&log_path).ok()?;
    let stderr_file = stdout_file.try_clone().ok()?;

    #[cfg(target_os = "windows")]
    let child = Command::new("cmd")
        .args(["/C", "node", "server.js"])
        .current_dir(&final_bridge_path)
        .stdout(stdout_file)
        .stderr(stderr_file)
        .spawn();

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("node")
        .arg("server.js")
        .current_dir(&final_bridge_path)
        .stdout(stdout_file)
        .stderr(stderr_file)
        .spawn();

    child.ok()
}

fn start_tunnel(app_handle: &tauri::AppHandle) -> Option<Child> {
    // 1. Determine paths
    let resource_dir = app_handle.path().resource_dir().ok()?;
    let app_data_dir = app_handle.path().app_data_dir().ok()?; // Writable
    
    // Config dest: AppData/Nexus/tunnel-config
    let config_dir = app_data_dir.join("tunnel-config");
    let config_path = config_dir.join("config.yml");

    // 2. Unzip if needed (first run, missing, or upgrade)
    let zip_path = resource_dir.join("tunnel-config.zip");
    let mut should_unzip = !config_path.exists();

    if !should_unzip && zip_path.exists() {
        if let (Ok(zip_meta), Ok(conf_meta)) = (fs::metadata(&zip_path), fs::metadata(&config_path)) {
             if let (Ok(zip_time), Ok(conf_time)) = (zip_meta.modified(), conf_meta.modified()) {
                  if zip_time > conf_time {
                      println!("Tunnel config update detected. Re-extracting...");
                      should_unzip = true;
                  }
             }
        }
    }

    if should_unzip {
        if zip_path.exists() {
             if config_dir.exists() {
                let _ = fs::remove_dir_all(&config_dir);
                let _ = fs::create_dir_all(&config_dir);
            }
            if !unzip_resource(&zip_path, &config_dir) {
                eprintln!("Failed to unzip tunnel config");
                return None;
            }
        }
    }

    if !config_path.exists() {
        eprintln!("Tunnel config not found at {:?}", config_path);
        return None;
    }

    // 3. Fix credentials path logic (Runtime Patching) - same as before but now in Writable AppData
    if let Ok(content) = std::fs::read_to_string(&config_path) {
        let mut new_lines = Vec::new();
        for line in content.lines() {
             if line.contains("credentials-file:") {
                let parts: Vec<&str> = line.split('\\').collect(); 
                if let Some(filename) = parts.last() {
                     let clean_filename = filename.trim();
                     let abs_cred_path = config_dir.join(clean_filename);
                     new_lines.push(format!("credentials-file: {}", abs_cred_path.to_string_lossy()));
                } else {
                     new_lines.push(line.to_string());
                }
            } else {
                new_lines.push(line.to_string());
            }
        }
        let _ = std::fs::write(&config_path, new_lines.join("\n"));
    }

    println!("Starting Tunnel with config: {:?}", config_path);

    // 4. Resolve Sidecar Path manually
    // ... (rest of function remains mostly valid, just ensure bin_path resolution is correct)
    let sidecar_name = "cloudflared-x86_64-pc-windows-msvc.exe";
    let exe_dir = std::env::current_exe().ok().and_then(|p| p.parent().map(|p| p.to_path_buf()));
    let mut sidecar_path = exe_dir.clone().map(|p| p.join(sidecar_name));
    
    // Fallback logic
    if sidecar_path.as_ref().map(|p| !p.exists()).unwrap_or(true) {
         let dev_path = std::path::PathBuf::from(r"bin").join(sidecar_name);
         if dev_path.exists() {
             sidecar_path = Some(dev_path);
         } else {
             sidecar_path = Some(std::path::PathBuf::from(r"C:\Repos GIT\Nexus\webapp\src-tauri\bin").join(sidecar_name));
         }
    }
    
    let binary_path = sidecar_path?;
    
    let log_path = std::path::PathBuf::from(r"C:\Users\Public\nexus_tunnel.log");
    let stdout_file = std::fs::File::create(&log_path).ok()?;
    let stderr_file = stdout_file.try_clone().ok()?;

    let child = Command::new(binary_path)
        .args([
            "tunnel",
            "--config",
            &config_path.to_string_lossy(),
            "run",
            "nexus-bridge"
        ])
        .stdout(stdout_file)
        .stderr(stderr_file)
        .spawn();

    match child {
        Ok(process) => {
            println!("Tunnel started with PID: {}", process.id());
            Some(process)
        },
        Err(e) => {
            eprintln!("Failed to start Tunnel: {}", e);
            None
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").expect("no main window").set_focus();
        }))
        .manage(ProcessState(Arc::new(Mutex::new(AppProcesses {
            bridge: None,
            tunnel: None,
        }))))
        .setup(|app| {
            // Check for existing instance is handled by the plugin above.
            
            // Start the Bridge
            if let Some(bridge) = start_bridge(app.handle()) {
                let state = app.state::<ProcessState>();
                state.0.lock().unwrap().bridge = Some(bridge);
            }

            // Start the Tunnel
            if let Some(tunnel) = start_tunnel(app.handle()) {
                let state = app.state::<ProcessState>();
                state.0.lock().unwrap().tunnel = Some(tunnel);
            }
            
            // Tray Setup
            let show = MenuItem::with_id(app, "show", "Show Nexus", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Nexus", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // If user closes window, hide it (Minimize to Tray)
                // UNLESS we want to actually quit. The user complained about it NOT closing.
                // "if I open it 5 times and close it 4, I actually still had all 5 still running."
                // This implies they opened NEW INSTANCES.
                // Single Instance Plugin fixes the "open 5 times" issue.
                // Hiding on close is standard for tray apps, but we must ensure "Quit" works.
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
             if let tauri::RunEvent::Exit = event {
                 println!("App exiting, killing processes...");
                 if let Some(state) = app_handle.try_state::<ProcessState>() {
                     if let Ok(mut processes) = state.0.lock() {
                         if let Some(mut child) = processes.bridge.take() {
                             let _ = child.kill();
                         }
                         if let Some(mut child) = processes.tunnel.take() {
                             let _ = child.kill();
                         }
                     }
                 }
             }
        });
}

