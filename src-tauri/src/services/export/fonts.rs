use crate::error::AppError;
use base64::{engine::general_purpose::STANDARD, Engine};

type FontFace = (&'static [u8], u16, &'static str);

macro_rules! faces {
    ($directory:literal, $name:literal) => {
        &[
            (
                include_bytes!(concat!(
                    "../../../../public/fonts/",
                    $directory,
                    "/",
                    $name,
                    "-Regular.ttf"
                ))
                .as_slice(),
                400,
                "normal",
            ),
            (
                include_bytes!(concat!(
                    "../../../../public/fonts/",
                    $directory,
                    "/",
                    $name,
                    "-Bold.ttf"
                ))
                .as_slice(),
                700,
                "normal",
            ),
            (
                include_bytes!(concat!(
                    "../../../../public/fonts/",
                    $directory,
                    "/",
                    $name,
                    "-Italic.ttf"
                ))
                .as_slice(),
                400,
                "italic",
            ),
            (
                include_bytes!(concat!(
                    "../../../../public/fonts/",
                    $directory,
                    "/",
                    $name,
                    "-BoldItalic.ttf"
                ))
                .as_slice(),
                700,
                "italic",
            ),
        ]
    };
}

pub fn font_css(family: &str) -> Result<String, AppError> {
    let faces: &[FontFace] = match family {
        "Merriweather" => faces!("merriweather", "Merriweather"),
        "Inter" => faces!("inter", "Inter"),
        "EB Garamond" => faces!("eb-garamond", "EBGaramond"),
        "Libre Baskerville" => faces!("libre-baskerville", "LibreBaskerville"),
        "Crimson Pro" => faces!("crimson-pro", "CrimsonPro"),
        "Libre Caslon Text" => &[
            (
                include_bytes!("../../../../public/fonts/libre-caslon/LibreCaslonText-Regular.ttf"),
                400,
                "normal",
            ),
            (
                include_bytes!("../../../../public/fonts/libre-caslon/LibreCaslonText-Bold.ttf"),
                700,
                "normal",
            ),
            (
                include_bytes!("../../../../public/fonts/libre-caslon/LibreCaslonText-Italic.ttf"),
                400,
                "italic",
            ),
        ],
        _ => {
            return Err(AppError::Export(
                "A fonte selecionada não está disponível para exportação.".into(),
            ))
        }
    };
    Ok(faces.iter().map(|(bytes, weight, style)| format!(
        "@font-face{{font-family:'{family}';font-weight:{weight};font-style:{style};src:url(data:font/ttf;base64,{}) format('truetype');}}", STANDARD.encode(bytes),
    )).collect())
}
