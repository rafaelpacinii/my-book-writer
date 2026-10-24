use super::{
    docx_blocks::{self, Block},
    docx_layout::Typography,
    docx_lists::Lists,
};
use crate::error::AppError;
use docx_rs::*;
use scraper::{ElementRef, Selector};

#[derive(Clone, Copy)]
enum Slot<'a> {
    Cell(ElementRef<'a>, usize, usize),
    Continue(usize),
    Covered,
}

pub fn render(
    element: ElementRef<'_>,
    typography: &Typography<'_>,
    lists: &mut Lists,
    depth: usize,
) -> Result<Table, AppError> {
    let selector = Selector::parse("tr").expect("static selector");
    let source: Vec<_> = element
        .select(&selector)
        .filter(|row| {
            row.ancestors()
                .filter_map(ElementRef::wrap)
                .find(|parent| parent.value().name() == "table")
                .is_some_and(|table| table.id() == element.id())
        })
        .collect();
    if source.is_empty() || source.len() > 5000 {
        return Err(invalid());
    }
    let mut grid = vec![Vec::new(); source.len()];
    for (row, source_row) in source.iter().enumerate() {
        let mut column = 0;
        for cell in source_row
            .children()
            .filter_map(ElementRef::wrap)
            .filter(|cell| matches!(cell.value().name(), "th" | "td"))
        {
            while grid[row].get(column).is_some_and(Option::is_some) {
                column += 1;
            }
            let span = attribute(cell, "colspan");
            let rows = attribute(cell, "rowspan").min(source.len() - row);
            if column + span > 128 {
                return Err(invalid());
            }
            for (offset, line) in grid.iter_mut().skip(row).take(rows).enumerate() {
                line.resize(line.len().max(column + span), None);
                for slot in line.iter_mut().skip(column).take(span) {
                    if slot.is_some() {
                        return Err(invalid());
                    }
                    *slot = Some(Slot::Covered);
                }
                line[column] = Some(if offset == 0 {
                    Slot::Cell(cell, span, rows)
                } else {
                    Slot::Continue(span)
                });
            }
            column += span;
        }
    }
    let columns = grid.iter().map(Vec::len).max().unwrap_or(0);
    if columns == 0 {
        return Err(invalid());
    }
    let column_width = (typography.width * 20.0 / columns as f64).floor() as usize;
    let mut rows = Vec::new();
    for mut row in grid {
        row.resize(columns, None);
        let mut cells = Vec::new();
        for slot in row {
            let (mut cell, span) = match slot {
                Some(Slot::Covered) => continue,
                Some(Slot::Continue(span)) => (
                    TableCell::new()
                        .vertical_merge(VMergeType::Continue)
                        .add_paragraph(Paragraph::new()),
                    span,
                ),
                Some(Slot::Cell(element, span, rowspan)) => {
                    let cell_typography = Typography {
                        width: (column_width as f64 * span as f64 / 20.0 - 8.0).max(1.0),
                        ..*typography
                    };
                    let blocks = docx_blocks::children(element, &cell_typography, lists, depth)?;
                    let ends_in_paragraph = matches!(blocks.last(), Some(Block::Paragraph(_)));
                    let mut cell = TableCell::new();
                    for block in blocks {
                        cell = match block {
                            Block::Paragraph(paragraph) => cell.add_paragraph(*paragraph),
                            Block::Table(table) => cell.add_table(*table),
                        };
                    }
                    if !ends_in_paragraph {
                        cell = cell.add_paragraph(Paragraph::new());
                    }
                    if rowspan > 1 {
                        cell = cell.vertical_merge(VMergeType::Restart);
                    }
                    (cell, span)
                }
                None => (TableCell::new().add_paragraph(Paragraph::new()), 1),
            };
            cell = cell.width(column_width * span, WidthType::Dxa);
            if span > 1 {
                cell = cell.grid_span(span);
            }
            cells.push(cell);
        }
        rows.push(TableRow::new(cells));
    }
    Ok(Table::new(rows)
        .margins(TableCellMargins::new().margin(80, 80, 80, 80))
        .set_grid(vec![column_width; columns])
        .width(column_width * columns, WidthType::Dxa)
        .layout(TableLayoutType::Fixed))
}

fn attribute(element: ElementRef<'_>, name: &str) -> usize {
    element
        .value()
        .attr(name)
        .and_then(|value| value.parse().ok())
        .unwrap_or(1)
}

fn invalid() -> AppError {
    AppError::Export("Uma tabela está vazia, contém células sobrepostas ou excede 128 colunas/5.000 linhas. Simplifique a tabela antes de exportar.".into())
}
