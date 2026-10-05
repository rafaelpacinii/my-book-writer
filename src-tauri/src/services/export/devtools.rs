use crate::error::AppError;
use serde_json::{json, Value};
use std::net::TcpStream;
use std::time::{Duration, Instant};
use tungstenite::{Message, WebSocket};

pub struct DevTools {
    socket: WebSocket<TcpStream>,
    next_id: u64,
    session_id: Option<String>,
}

impl DevTools {
    pub fn connect(port: u16, browser_path: &str) -> Result<Self, AppError> {
        let stream = TcpStream::connect_timeout(
            &std::net::SocketAddr::from(([127, 0, 0, 1], port)),
            Duration::from_secs(5),
        )
        .map_err(|e| super::export_error("Não foi possível conectar ao gerador de PDF.", e))?;
        stream
            .set_read_timeout(Some(Duration::from_secs(60)))
            .map_err(|e| super::export_error("Não foi possível configurar o gerador de PDF.", e))?;
        stream
            .set_write_timeout(Some(Duration::from_secs(60)))
            .map_err(|e| super::export_error("Não foi possível configurar o gerador de PDF.", e))?;
        let config = tungstenite::protocol::WebSocketConfig::default()
            .max_frame_size(Some(128 * 1024 * 1024))
            .max_message_size(Some(256 * 1024 * 1024));
        let (socket, _) = tungstenite::client::client_with_config(
            format!("ws://127.0.0.1:{port}{browser_path}"),
            stream,
            Some(config),
        )
        .map_err(|e| {
            super::export_error("Não foi possível iniciar a comunicação com o Chromium.", e)
        })?;
        Ok(Self {
            socket,
            next_id: 0,
            session_id: None,
        })
    }

    pub fn call(&mut self, method: &str, params: Value) -> Result<Value, AppError> {
        self.next_id += 1;
        let mut request = json!({"id": self.next_id, "method": method, "params": params});
        if let Some(session) = &self.session_id {
            request["sessionId"] = json!(session);
        }
        self.socket
            .send(Message::Text(request.to_string().into()))
            .map_err(|e| {
                super::export_error("Falha ao enviar uma operação ao gerador de PDF.", e)
            })?;
        let deadline = Instant::now() + Duration::from_secs(60);
        loop {
            if Instant::now() > deadline {
                return Err(AppError::Export(
                    "O gerador de PDF excedeu o tempo limite.".into(),
                ));
            }
            let message = self.socket.read().map_err(|e| {
                super::export_error("O gerador de PDF não respondeu. Tente novamente.", e)
            })?;
            let Message::Text(text) = message else {
                continue;
            };
            let response: Value = serde_json::from_str(&text)
                .map_err(|e| super::export_error("Resposta inválida do gerador de PDF.", e))?;
            if response["id"].as_u64() != Some(self.next_id) {
                continue;
            }
            if let Some(error) = response.get("error") {
                return Err(super::export_error(
                    "Não foi possível concluir a diagramação do PDF.",
                    error,
                ));
            }
            return Ok(response["result"].clone());
        }
    }

    pub fn open_page(&mut self) -> Result<(), AppError> {
        let target = self.call("Target.createTarget", json!({"url": "about:blank"}))?;
        let session = self.call(
            "Target.attachToTarget",
            json!({"targetId": target["targetId"], "flatten": true}),
        )?;
        self.session_id = Some(
            session["sessionId"]
                .as_str()
                .ok_or_else(|| {
                    AppError::Export("Não foi possível preparar a página de impressão.".into())
                })?
                .into(),
        );
        Ok(())
    }

    pub fn render(&mut self, html: &str) -> Result<Vec<u8>, AppError> {
        use base64::{engine::general_purpose::STANDARD, Engine};
        self.open_page()?;
        self.call("Network.enable", json!({}))?;
        self.call(
            "Network.setBlockedURLs",
            json!({"urls": ["http://*", "https://*", "file://*", "ftp://*"]}),
        )?;
        self.call("Emulation.setEmulatedMedia", json!({"media": "print"}))?;
        let tree = self.call("Page.getFrameTree", json!({}))?;
        self.call(
            "Page.setDocumentContent",
            json!({"frameId": tree["frameTree"]["frame"]["id"], "html": html}),
        )?;
        let readiness = self.call("Runtime.evaluate", json!({
            "expression": "document.fonts.ready.then(() => { const faces = [...document.fonts]; if (!faces.length || faces.some(font => font.status === 'error')) throw new Error('Font loading failed'); return true; })",
            "awaitPromise": true, "returnByValue": true,
        }))?;
        if readiness.get("exceptionDetails").is_some() || readiness["result"]["value"] != true {
            return Err(AppError::Export(
                "Não foi possível carregar as fontes do livro.".into(),
            ));
        }
        let result = self.call(
            "Page.printToPDF",
            json!({
                "preferCSSPageSize": true, "printBackground": true, "displayHeaderFooter": false,
                "generateTaggedPDF": true, "generateDocumentOutline": true,
                "marginTop": 0, "marginBottom": 0, "marginLeft": 0, "marginRight": 0,
            }),
        )?;
        let encoded = result["data"]
            .as_str()
            .ok_or_else(|| AppError::Export("O gerador não retornou o arquivo PDF.".into()))?;
        STANDARD
            .decode(encoded)
            .map_err(|e| super::export_error("O arquivo PDF gerado é inválido.", e))
    }
}
