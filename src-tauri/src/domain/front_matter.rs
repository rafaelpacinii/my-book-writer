use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BookFrontMatter {
    pub book_id: String,
    pub include_half_title: bool,
    pub include_title_page: bool,
    pub subtitle: Option<String>,
    pub publisher: Option<String>,
    pub edition: String,
    pub publication_year: Option<i64>,
    pub publication_city: Option<String>,
    pub include_copyright_page: bool,
    pub copyright_text: Option<String>,
    pub isbn_print: Option<String>,
    pub isbn_digital: Option<String>,
    pub cover_designer: Option<String>,
    pub proofreader: Option<String>,
    pub layout_designer: Option<String>,
    pub cataloging_data: Option<String>,
    pub include_dedication: bool,
    pub dedication_text: Option<String>,
    pub include_epigraph: bool,
    pub epigraph_text: Option<String>,
    pub epigraph_author: Option<String>,
    pub include_table_of_contents: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SaveFrontMatterInput {
    pub book_id: String,
    pub include_half_title: bool,
    pub include_title_page: bool,
    pub subtitle: Option<String>,
    pub publisher: Option<String>,
    pub edition: String,
    pub publication_year: Option<i64>,
    pub publication_city: Option<String>,
    pub include_copyright_page: bool,
    pub copyright_text: Option<String>,
    pub isbn_print: Option<String>,
    pub isbn_digital: Option<String>,
    pub cover_designer: Option<String>,
    pub proofreader: Option<String>,
    pub layout_designer: Option<String>,
    pub cataloging_data: Option<String>,
    pub include_dedication: bool,
    pub dedication_text: Option<String>,
    pub include_epigraph: bool,
    pub epigraph_text: Option<String>,
    pub epigraph_author: Option<String>,
    pub include_table_of_contents: bool,
}

