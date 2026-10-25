use super::{image_data, validation::*, CodexService};
use crate::domain::codex::*;
use crate::error::AppError;
use crate::repositories::codex::CodexRepository as Repo;
use std::{fs, io::Write, path::Path};
use uuid::Uuid;

impl CodexService<'_> {
    pub async fn import_image(
        &self,
        storage: &Path,
        input: CodexScopeInput,
        entity: &str,
        image: ImportCodexImageInput,
    ) -> Result<CodexSheet, AppError> {
        let filename = label(&image.original_filename)?;
        let prepared =
            tauri::async_runtime::spawn_blocking(move || image_data::prepare(&image.data_url))
                .await
                .map_err(|_| invalid("Não foi possível processar a imagem"))??;
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        writable(&scope)?;
        Repo::entity(&mut tx, &scope, entity).await?;
        if Repo::image_count(&mut tx, entity).await? >= 64 {
            return Err(invalid("Use no máximo 64 imagens por ficha"));
        }
        let id = Uuid::now_v7().to_string();
        let asset = Uuid::now_v7().to_string();
        let key = format!("images/codex/{asset}.{}", prepared.extension);
        let path = storage.join(&key);
        let target = path.clone();
        let bytes = prepared.bytes;
        let size = bytes.len();
        tauri::async_runtime::spawn_blocking(move || -> Result<(), AppError> {
            fs::create_dir_all(target.parent().unwrap())
                .map_err(|_| invalid("Não foi possível preparar a pasta de imagens"))?;
            let mut file = fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&target)
                .map_err(|_| {
                    invalid("Não foi possível salvar a imagem. Verifique o espaço disponível")
                })?;
            if file
                .write_all(&bytes)
                .and_then(|_| file.sync_all())
                .is_err()
            {
                drop(file);
                if let Err(error) = fs::remove_file(&target) {
                    eprintln!("Falha ao limpar imagem incompleta: {error}");
                }
                return Err(invalid(
                    "Não foi possível salvar a imagem. Verifique o espaço disponível",
                ));
            }
            Ok(())
        })
        .await
        .map_err(|_| invalid("Não foi possível salvar a imagem"))??;
        let result = async {
            Repo::attach_image(
                &mut tx,
                entity,
                &id,
                &asset,
                &filename,
                &key,
                prepared.mime,
                prepared.width,
                prepared.height,
                size,
                &prepared.hash,
            )
            .await?;
            let sheet = Repo::sheet(&mut tx, &scope, entity).await?;
            tx.commit().await?;
            Ok(sheet)
        }
        .await;
        if result.is_err() {
            if let Err(error) = fs::remove_file(path) {
                eprintln!("Falha ao remover imagem sem vínculo após rollback: {error}");
            }
        }
        result
    }
    pub async fn read_image(
        &self,
        storage: &Path,
        input: CodexScopeInput,
        entity: &str,
        image: &str,
    ) -> Result<String, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        Repo::entity(&mut tx, &scope, entity).await?;
        let (_, key) = Repo::gallery_image(&mut tx, entity, image).await?;
        tx.commit().await?;
        let root = storage.to_owned();
        tauri::async_runtime::spawn_blocking(move || {
            let root = root
                .canonicalize()
                .map_err(|_| invalid("A pasta de imagens está indisponível"))?;
            let path = root
                .join(key)
                .canonicalize()
                .map_err(|_| invalid("A imagem não está disponível neste dispositivo"))?;
            if !path.starts_with(&root) {
                return Err(invalid("Caminho de imagem inválido"));
            }
            if fs::metadata(&path)
                .map_err(|_| invalid("Não foi possível ler a imagem"))?
                .len()
                > 10 * 1024 * 1024
            {
                return Err(invalid("A imagem salva ultrapassa 10 MB"));
            }
            let bytes = fs::read(path).map_err(|_| invalid("Não foi possível ler a imagem"))?;
            image_data::data_url(&bytes)
        })
        .await
        .map_err(|_| invalid("Não foi possível ler a imagem"))?
    }
    pub async fn update_image(
        &self,
        input: CodexScopeInput,
        entity: &str,
        image: &str,
        changes: UpdateCodexImageInput,
    ) -> Result<CodexSheet, AppError> {
        if changes.caption.chars().count() > 1000 {
            return Err(invalid("A legenda deve conter até 1.000 caracteres"));
        }
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        writable(&scope)?;
        Repo::entity(&mut tx, &scope, entity).await?;
        Repo::gallery_image(&mut tx, entity, image).await?;
        Repo::update_gallery_image(
            &mut tx,
            entity,
            image,
            changes.caption.trim(),
            changes.is_primary,
        )
        .await?;
        let sheet = Repo::sheet(&mut tx, &scope, entity).await?;
        tx.commit().await?;
        Ok(sheet)
    }
    pub async fn delete_image(
        &self,
        input: CodexScopeInput,
        entity: &str,
        image: &str,
    ) -> Result<CodexSheet, AppError> {
        let mut tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        let scope = Repo::scope(&mut tx, &input).await?;
        writable(&scope)?;
        Repo::entity(&mut tx, &scope, entity).await?;
        let (image, _) = Repo::gallery_image(&mut tx, entity, image).await?;
        Repo::remove_gallery_image(&mut tx, entity, &image).await?;
        let sheet = Repo::sheet(&mut tx, &scope, entity).await?;
        tx.commit().await?;
        Ok(sheet)
    }
}
