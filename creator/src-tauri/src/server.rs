use std::sync::Mutex;
use tauri::{AppHandle, Manager};

/// Shared state tracking the MUD server process.
#[derive(Default)]
pub struct ServerState(Mutex<Option<ServerInfo>>);

#[derive(Clone)]
struct ServerInfo {
    pid: u32,
    mud_dir: String,
}

/// Kill the server process tree.
///
/// Two strategies, both attempted:
/// 1. `taskkill /T /F /PID` — kills the tree if cmd.exe is still alive
/// 2. PowerShell — finds any java.exe whose command line contains the
///    project directory and kills it (catches orphaned grandchildren)
fn kill_server(pid: u32, mud_dir: &str) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // Strategy 1: tree-kill from the cmd.exe PID
        if pid != 0 {
            let _ = std::process::Command::new("taskkill")
                .args(["/T", "/F", "/PID", &pid.to_string()])
                .creation_flags(CREATE_NO_WINDOW)
                .stdout(std::process::Stdio::null())
                .stderr(std::process::Stdio::null())
                .status();
        }

        // Strategy 2: find orphaned java.exe by command line match.
        // Gradle's `run` task launches java with the project path in
        // its classpath/working directory, so mud_dir appears in the
        // command line.
        let escaped = mud_dir.replace('\\', "\\\\");
        let ps_script = format!(
            "Get-CimInstance Win32_Process -Filter \"Name='java.exe'\" | \
             Where-Object {{ $_.CommandLine -like '*{}*' }} | \
             ForEach-Object {{ Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }}",
            escaped
        );
        let _ = std::process::Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
            .creation_flags(CREATE_NO_WINDOW)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status();
    }

    #[cfg(not(windows))]
    {
        let _ = mud_dir;
        if pid != 0 {
            // On Unix, kill the process group
            let _ = std::process::Command::new("kill")
                .args(["-9", &format!("-{pid}")])
                .status();
        }
    }
}

/// Called from the frontend after spawning the server process.
#[tauri::command]
pub fn set_server_pid(state: tauri::State<'_, ServerState>, pid: u32, mud_dir: String) {
    *state.0.lock().unwrap() = Some(ServerInfo { pid, mud_dir });
}

/// Called from the frontend when the server process exits normally.
#[tauri::command]
pub fn clear_server_pid(state: tauri::State<'_, ServerState>) {
    *state.0.lock().unwrap() = None;
}

/// Kill the server process tree. Called from the frontend's stop button.
#[tauri::command]
pub fn kill_server_tree(state: tauri::State<'_, ServerState>) {
    if let Some(info) = state.0.lock().unwrap().take() {
        kill_server(info.pid, &info.mud_dir);
    }
}

/// Kill any running server when the app exits.
pub fn kill_on_exit(app: &AppHandle) {
    let info = app.state::<ServerState>().0.lock().unwrap().take();
    if let Some(info) = info {
        kill_server(info.pid, &info.mud_dir);
    }
}
