use super::devtools::DevTools;
use crate::error::AppError;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

#[derive(serde::Deserialize)]
struct ChromiumManifest {
    executable: String,
    platform: String,
    arch: String,
}

pub fn executable(resource_dir: &Path) -> Result<PathBuf, AppError> {
    #[cfg(debug_assertions)]
    if let Some(path) = std::env::var_os("MBW_PDF_CHROMIUM") {
        let path = PathBuf::from(path);
        if path.is_file() {
            return Ok(path);
        }
        return Err(AppError::Export(
            "O caminho de desenvolvimento do Chromium é inválido.".into(),
        ));
    }
    let root = resource_dir.join("chromium");
    let manifest = fs::read(root.join("manifest.json"))
        .map_err(|e| super::export_error("O Chromium local não está disponível. Prepare os recursos de PDF e reinstale o aplicativo.", e))?;
    let manifest: ChromiumManifest = serde_json::from_slice(&manifest).map_err(|e| {
        super::export_error(
            "Os recursos do Chromium estão inválidos. Reinstale o aplicativo.",
            e,
        )
    })?;
    let relative = Path::new(&manifest.executable);
    let platform = match std::env::consts::OS {
        "windows" => "win32",
        "macos" => "darwin",
        platform => platform,
    };
    let arch = match std::env::consts::ARCH {
        "x86_64" => "x64",
        "aarch64" => "arm64",
        arch => arch,
    };
    if manifest.platform != platform || manifest.arch != arch {
        return Err(AppError::Export(
            "O Chromium empacotado não corresponde a este sistema. Reinstale o aplicativo.".into(),
        ));
    }
    if relative.is_absolute()
        || relative
            .components()
            .any(|part| !matches!(part, std::path::Component::Normal(_)))
    {
        return Err(AppError::Export(
            "O caminho do Chromium empacotado é inválido.".into(),
        ));
    }
    let binary = root.join("runtime").join(relative);
    if !binary.is_file() {
        return Err(AppError::Export(
            "O executável do Chromium não foi encontrado.".into(),
        ));
    }
    Ok(binary)
}

pub fn render_pdf(binary: &Path, html: &str) -> Result<Vec<u8>, AppError> {
    let profile = tempfile::tempdir().map_err(|e| {
        super::export_error(
            "Não foi possível preparar os arquivos temporários do PDF.",
            e,
        )
    })?;
    let log = tempfile::tempfile()
        .map_err(|e| super::export_error("Não foi possível preparar o gerador de PDF.", e))?;
    let mut command = Command::new(binary);
    command
        .args([
            "--headless",
            "--remote-debugging-port=0",
            "--remote-debugging-address=127.0.0.1",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking",
            "--disable-component-update",
            "--disable-sync",
            "--disable-extensions",
            "--disable-default-apps",
            "--metrics-recording-only",
            "--disable-dev-shm-usage",
        ])
        .arg(format!("--user-data-dir={}", profile.path().display()))
        .arg("about:blank")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(log);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    // Only integration tests in restricted containers may disable the sandbox.
    #[cfg(test)]
    if std::env::var_os("MBW_PDF_TEST_NO_SANDBOX").is_some() {
        command.arg("--no-sandbox");
    }
    let mut process = BrowserProcess(
        command
            .spawn()
            .map_err(|e| super::export_error("Não foi possível executar o Chromium local.", e))?,
    );
    let (port, browser_path) = wait_for_endpoint(&mut process.0, profile.path())?;
    let mut devtools = DevTools::connect(port, &browser_path)?;
    devtools.render(html)
}

fn wait_for_endpoint(process: &mut Child, profile: &Path) -> Result<(u16, String), AppError> {
    let deadline = Instant::now() + Duration::from_secs(20);
    while Instant::now() < deadline {
        if let Ok(endpoint) = fs::read_to_string(profile.join("DevToolsActivePort")) {
            let mut lines = endpoint.lines();
            if let (Some(port), Some(path)) = (lines.next(), lines.next()) {
                if let Ok(port) = port.parse::<u16>() {
                    if path.starts_with("/devtools/browser/") {
                        return Ok((port, path.into()));
                    }
                }
            }
        }
        if process
            .try_wait()
            .map_err(|e| super::export_error("Falha ao acompanhar o Chromium.", e))?
            .is_some()
        {
            return Err(AppError::Export(
                "O Chromium encerrou antes de gerar o PDF. Verifique os requisitos do sistema."
                    .into(),
            ));
        }
        std::thread::sleep(Duration::from_millis(50));
    }
    Err(AppError::Export(
        "O Chromium demorou demais para iniciar.".into(),
    ))
}

struct BrowserProcess(Child);

impl Drop for BrowserProcess {
    fn drop(&mut self) {
        if let Err(error) = self.0.kill() {
            if error.kind() != std::io::ErrorKind::InvalidInput {
                eprintln!("PDF export: browser cleanup: {error}");
            }
        }
        if let Err(error) = self.0.wait() {
            eprintln!("PDF export: browser wait: {error}");
        }
    }
}
