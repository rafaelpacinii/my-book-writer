use serde::Deserialize;
#[derive(Deserialize)]
pub struct ImportCodexImageInput {
    pub original_filename: String,
    pub data_url: String,
}
#[derive(Deserialize)]
pub struct UpdateCodexImageInput {
    pub caption: String,
    pub is_primary: bool,
}
