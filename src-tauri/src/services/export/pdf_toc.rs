use crate::error::AppError;
use lopdf::{Document, Object};

pub fn chapter_pages(bytes: &[u8], count: usize) -> Result<Vec<u32>, AppError> {
    read_pages(bytes, count).map_err(|error| {
        super::export_error(
            "Não foi possível identificar as páginas reais do sumário.",
            error,
        )
    })
}

fn read_pages(bytes: &[u8], count: usize) -> Result<Vec<u32>, Box<dyn std::error::Error>> {
    let document = Document::load_mem(bytes)?;
    let destinations = document
        .dereference(document.catalog()?.get(b"Dests")?)?
        .1
        .as_dict()?;
    let pages = document.get_pages();
    (0..count)
        .map(|index| {
            let destination = document
                .dereference(destinations.get(format!("chapter-{index}").as_bytes())?)?
                .1;
            let destination = match destination {
                Object::Dictionary(dictionary) => document.dereference(dictionary.get(b"D")?)?.1,
                destination => destination,
            };
            let page_id = destination
                .as_array()?
                .first()
                .ok_or("Empty chapter destination")?
                .as_reference()?;
            pages
                .iter()
                .find_map(|(number, id)| (*id == page_id).then_some(*number))
                .ok_or_else(|| "Chapter destination does not reference a page".into())
        })
        .collect()
}
