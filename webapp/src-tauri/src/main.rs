#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

// Hold the Bridge process so we can kill it on exit
struct BridgeProcess(Mutex<Option<Child>>);

fn ensure_dependencies(bridge_path: &std::path::Path) -> bool {
    let node_modules = bridge_path.join("node_modules");
    
    if node_modules.exists() {
        println!("Bridge dependencies already installed");
        return true;
    }
    
    println!("Installing Bridge dependencies (first run)...");
    
    let install = Command::new("cmd")
        .args(["/C", "npm", "install", "--production"])
        .current_dir(bridge_path)
        .output();
    
    match install {
        Ok(output) => {
            if output.status.success() {
                println!("Dependencies installed successfully");
                true
            } else {
                eprintln!("npm install failed: {}", String::from_utf8_lossy(&output.stderr));
                false
            }
        }
        Err(e) => {
            eprintln!("Failed to run npm install: {}", e);
            false
        }
    }
}

fn start_bridge(app_handle: &tauri::AppHandle) -> Option<Child> {
    // Try bundled resource path first (production)
    let resource_path = app_handle
        .path()
        .resource_dir()
        .ok()
        .map(|p| p.join("bridge-bundle"))
        .filter(|p| p.join("server.js").exists());

    // Fall back to dev path (sibling to webapp)
    // Structure: Nexus/Nexus/bridge (sibling of Nexus/Nexus/webapp)
    let dev_path = std::env::current_dir()
        .ok()
        .and_then(|cwd| {
            // Try multiple possible locations
            let candidates = vec![
                cwd.join("..").join("bridge"),           // From webapp dir
                cwd.join("bridge"),                       // From root
                std::path::PathBuf::from(r"C:\Repos GIT\Nexus\Nexus\bridge"), // Absolute fallback
            ];
            
            candidates.into_iter().find(|p| p.join("server.js").exists())
        });

    let bridge_path = resource_path.or(dev_path);

    if let Some(ref path) = bridge_path {
        println!("Starting Bridge from: {:?}", path);
    } else {
        eprintln!("Bridge server.js not found in any expected location");
        return None;
    }

    let bridge_path = bridge_path.unwrap();

    // Ensure node_modules exists (install on first run)
    if !ensure_dependencies(&bridge_path) {
        eprintln!("Failed to ensure Bridge dependencies");
        return None;
    }

    // Set up logging
    let log_path = std::path::PathBuf::from(r"C:\Users\Public\nexus_bridge.log");
    let stdout_file = std::fs::File::create(&log_path).expect("Failed to create log file");
    let stderr_file = stdout_file.try_clone().expect("Failed to clone log file");

    println!("Logging Bridge output to: {:?}", log_path);

    // Start the bridge process
    #[cfg(target_os = "windows")]
    let child = Command::new("cmd")
        .args(["/C", "node", "server.js"])
        .current_dir(&bridge_path)
        .stdout(stdout_file)
        .stderr(stderr_file)
        .spawn();

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("node")
        .arg("server.js")
        .current_dir(&bridge_path)
        .stdout(stdout_file)
        .stderr(stderr_file)
        .spawn();

    match child {
        Ok(process) => {
            println!("Bridge started with PID: {}", process.id());
            Some(process)
        }
        Err(e) => {
            eprintln!("Failed to start Bridge: {}", e);
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

        .manage(BridgeProcess(Mutex::new(None)))
        .setup(|app| {
            // Start the Bridge process
            let bridge = start_bridge(app.handle());
            let bridge_state = app.state::<BridgeProcess>();
            *bridge_state.0.lock().unwrap() = bridge;

            // Create tray menu
            let show = MenuItem::with_id(app, "show", "Show Nexus", true, None::<&str>)?;
            let reload = MenuItem::with_id(app, "reload", "Reload", true, Some("F5"))?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show, &reload, &quit])?;

            // Build tray icon
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
                    "reload" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval("window.location.reload()");
                        }
                    }
                    "quit" => {
                        // Kill bridge before exiting
                        if let Some(state) = app.try_state::<BridgeProcess>() {
                            if let Ok(mut guard) = state.0.lock() {
                                if let Some(ref mut child) = *guard {
                                    let _ = child.kill();
                                    println!("Bridge process terminated");
                                }
                            }
                        }
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    // Left click shows the window
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
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
            // Minimize to tray instead of closing
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
