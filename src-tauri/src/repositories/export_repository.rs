use crate::domain::{
    book::Book,
    catalog::{BookFormat, FontPreset},
    chapter::Chapter,
};
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct BookExportSnapshot {
    pub book: Book,
    pub format: BookFormat,
    pub font: FontPreset,
    pub chapters: Vec<Chapter>,
}

pub async fn read_snapshot(
    pool: &SqlitePool,
    book_id: &str,
) -> Result<BookExportSnapshot, AppError> {
    // All queries share one SQLite read transaction, including chapter content.
    let mut tx = pool.begin().await?;
    let book = sqlx::query_as::<_, Book>("SELECT * FROM books WHERE id = ? AND deleted_at IS NULL")
        .bind(book_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Livro".into()))?;
    let format = sqlx::query_as::<_, BookFormat>("SELECT * FROM book_formats WHERE id = ?")
        .bind(&book.format_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Formato do livro".into()))?;
    let font = sqlx::query_as::<_, FontPreset>("SELECT * FROM font_presets WHERE id = ?")
        .bind(&book.font_preset_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Fonte do livro".into()))?;
    let chapters = sqlx::query_as::<_, Chapter>(
        "SELECT * FROM chapters WHERE book_id = ? AND deleted_at IS NULL ORDER BY position, id",
    )
    .bind(book_id)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(BookExportSnapshot {
        book,
        format,
        font,
        chapters,
    })
}
