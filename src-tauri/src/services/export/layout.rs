use crate::{error::AppError, repositories::export_repository::BookExportSnapshot};

pub fn running_space_um(snapshot: &BookExportSnapshot) -> f64 {
    snapshot.book.font_size_pt * 2.0 * 25400.0 / 72.0
}

pub fn validate(snapshot: &BookExportSnapshot) -> Result<(), AppError> {
    let book = &snapshot.book;
    let size = book.font_size_pt;
    let line = book.line_height_ratio;
    let margins = [
        book.margin_top_um,
        book.margin_bottom_um,
        book.margin_left_um,
        book.margin_right_um,
    ];
    let width =
        snapshot.format.width_um as f64 - book.margin_left_um as f64 - book.margin_right_um as f64;
    let height = snapshot.format.height_um as f64
        - book.margin_top_um as f64
        - book.margin_bottom_um as f64
        - 2.0 * running_space_um(snapshot);
    if !size.is_finite()
        || !(6.0..=72.0).contains(&size)
        || !line.is_finite()
        || !(1.0..=3.0).contains(&line)
        || margins.iter().any(|margin| *margin < 0)
        || width < 10000.0
        || height < size * line * 25400.0 / 72.0
    {
        return Err(AppError::Export("As configurações de página não deixam espaço suficiente para o texto. Ajuste as margens, o formato ou a tipografia do livro.".into()));
    }
    Ok(())
}
