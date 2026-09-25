use crate::domain::image_asset::{ImageAsset, ImportImageInput};
use crate::error::AppError;
use crate::repositories::image_asset_repository::ImageAssetRepository;
use sha2::{Digest, Sha256};
use sqlx::SqlitePool;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

pub struct ImageAssetService<'a> {
    pool: &'a SqlitePool,
    storage_dir: &'a Path,
}

impl<'a> ImageAssetService<'a> {
    pub fn new(pool: &'a SqlitePool, storage_dir: &'a Path) -> Self {
        Self { pool, storage_dir }
    }

    /// Importa uma nova imagem, calcula o SHA-256, salva fisicamente em disco e persiste os metadados
    pub async fn import_image(&self, input: ImportImageInput) -> Result<ImageAsset, AppError> {
        if input.width_px <= 0 || input.height_px <= 0 {
            return Err(AppError::Validation(
                "As dimensões da imagem devem ser maiores que zero".into(),
            ));
        }

        // Decodifica os bytes da imagem
        let raw_base64 = if let Some(pos) = input.data_base64.find(',') {
            &input.data_base64[pos + 1..]
        } else {
            &input.data_base64
        };

        // Decodificação Base64 manual simples e segura
        let bytes = Self::decode_base64(raw_base64)?;
        let byte_size = bytes.len() as i64;
        if byte_size == 0 {
            return Err(AppError::Validation(
                "O arquivo de imagem está vazio".into(),
            ));
        }

        // Limite máximo de segurança: 25 MB por imagem
        if byte_size > 25 * 1024 * 1024 {
            return Err(AppError::Validation(
                "A imagem excede o tamanho máximo permitido de 25 MB".into(),
            ));
        }

        // Calcula o hash SHA-256 do arquivo binário
        let mut hasher = Sha256::new();
        hasher.update(&bytes);
        let sha256 = format!("{:x}", hasher.finalize());

        // Identificador único da imagem
        let asset_id = Uuid::now_v7().to_string();

        // Extrai extensão do arquivo
        let extension = Path::new(&input.original_filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("bin");

        // Cria a chave relativa segura: "images/<book_id>/<asset_id>.<ext>"
        let storage_key = format!("images/{}/{}.{}", input.book_id, asset_id, extension);

        // Caminho físico no sistema de arquivos gerenciado
        let target_path = self.storage_dir.join(&storage_key);
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent).map_err(|e| {
                AppError::Validation(format!("Falha ao criar diretório de imagem: {}", e))
            })?;
        }

        // Escreve os bytes da imagem em disco
        fs::write(&target_path, &bytes)
            .map_err(|e| AppError::Validation(format!("Falha ao salvar imagem em disco: {}", e)))?;

        // Salva os metadados no SQLite
        let repo = ImageAssetRepository::new(self.pool);
        repo.create(
            &asset_id,
            &input.book_id,
            &input.original_filename,
            &storage_key,
            &input.mime_type,
            input.width_px,
            input.height_px,
            byte_size,
            &sha256,
        )
        .await
    }

    pub async fn list_images(&self, book_id: &str) -> Result<Vec<ImageAsset>, AppError> {
        let repo = ImageAssetRepository::new(self.pool);
        repo.list_by_book(book_id).await
    }

    pub async fn set_card_image(
        &self,
        book_id: &str,
        asset_id: Option<&str>,
    ) -> Result<(), AppError> {
        let repo = ImageAssetRepository::new(self.pool);
        repo.set_book_card_image(book_id, asset_id).await
    }

    /// Retorna o caminho absoluto do arquivo para o frontend exibir
    pub fn get_absolute_path(&self, storage_key: &str) -> PathBuf {
        self.storage_dir.join(storage_key)
    }

    fn decode_base64(data: &str) -> Result<Vec<u8>, AppError> {
        const B64_CHARS: &[u8] =
            b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let clean: Vec<u8> = data.bytes().filter(|b| !b.is_ascii_whitespace()).collect();
        let mut out = Vec::with_capacity(clean.len() * 3 / 4);
        let mut buf = 0u32;
        let mut bits = 0;

        for &b in &clean {
            if b == b'=' {
                break;
            }
            let val = B64_CHARS.iter().position(|&c| c == b).ok_or_else(|| {
                AppError::Validation("Caractere inválido no Base64 da imagem".into())
            })? as u32;
            buf = (buf << 6) | val;
            bits += 6;
            if bits >= 8 {
                bits -= 8;
                out.push((buf >> bits) as u8);
                buf &= (1 << bits) - 1;
            }
        }
        Ok(out)
    }
}
