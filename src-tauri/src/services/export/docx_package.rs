use super::{content::escape_html, docx_xml, fonts};
use crate::error::AppError;
use std::io::{Cursor, Read, Write};
use zip::{write::SimpleFileOptions, ZipArchive, ZipWriter};

const REL: &str = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

// ECMA-376 font embedding: XOR the first 32 bytes with the reversed GUID bytes.
fn obfuscate(bytes: &[u8], key: &uuid::Uuid) -> Vec<u8> {
    let mut output = bytes.to_vec();
    for (index, byte) in output.iter_mut().take(32).enumerate() {
        *byte ^= key.as_bytes()[15 - index % 16];
    }
    output
}

pub fn finish(
    bytes: &[u8],
    family: &str,
    alignments: &[&str],
    image_alts: &[String],
) -> Result<Vec<u8>, AppError> {
    finish_inner(bytes, family, alignments, image_alts).map_err(|error| {
        super::export_error(
            "Não foi possível incorporar a diagramação e as fontes ao DOCX.",
            error,
        )
    })
}

fn finish_inner(
    bytes: &[u8],
    family: &str,
    alignments: &[&str],
    image_alts: &[String],
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut archive = ZipArchive::new(Cursor::new(bytes))?;
    let mut output = ZipWriter::new(Cursor::new(Vec::new()));
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index)?;
        let name = entry.name().to_owned();
        if name == "word/fontTable.xml" || name == "word/_rels/fontTable.xml.rels" {
            continue;
        }
        let mut contents = Vec::new();
        entry.read_to_end(&mut contents)?;
        if matches!(
            name.as_str(),
            "[Content_Types].xml"
                | "word/_rels/document.xml.rels"
                | "word/settings.xml"
                | "word/document.xml"
        ) {
            let mut xml = String::from_utf8(contents)?;
            match name.as_str() {
                "[Content_Types].xml" => {
                    let mut additions = "<Default Extension=\"odttf\" ContentType=\"application/vnd.openxmlformats-officedocument.obfuscatedFont\"/>".to_string();
                    if !xml.contains("/word/fontTable.xml") {
                        additions.push_str("<Override PartName=\"/word/fontTable.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml\"/>");
                    }
                    xml = xml.replace("</Types>", &format!("{additions}</Types>"));
                }
                "word/_rels/document.xml.rels" if !xml.contains("fontTable.xml") => {
                    xml = xml.replace("</Relationships>", &format!("<Relationship Id=\"mbwFontTable\" Type=\"{REL}/fontTable\" Target=\"fontTable.xml\"/></Relationships>"));
                }
                "word/settings.xml" => {
                    xml = xml.replace(
                        "</w:settings>",
                        "<w:embedTrueTypeFonts/><w:updateFields w:val=\"true\"/></w:settings>",
                    );
                }
                "word/document.xml" => {
                    for alignment in alignments {
                        xml = replace_section_alignment(&xml, alignment);
                    }
                }
                _ => {}
            }
            contents = xml.into_bytes();
        }
        if name == "word/document.xml" {
            contents = docx_xml::image_descriptions(&contents, image_alts)?;
        }
        if name.starts_with("word/") && name.ends_with(".xml") {
            contents = docx_xml::normalize(&contents)?;
        }
        output.start_file(name, options)?;
        output.write_all(&contents)?;
    }
    let mut font_xml = format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:fonts xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:r=\"{REL}\"><w:font w:name=\"{}\">", escape_html(fonts::docx_family(family)));
    let mut relationships = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">");
    for (index, (bytes, weight, style)) in fonts::font_faces(family)?.iter().enumerate() {
        let key = uuid::Uuid::now_v7();
        let font_key = key.to_string().to_uppercase();
        let variant = match (*weight, *style) {
            (700, "italic") => "embedBoldItalic",
            (700, _) => "embedBold",
            (_, "italic") => "embedItalic",
            _ => "embedRegular",
        };
        font_xml.push_str(&format!(
            "<w:{variant} r:id=\"font{index}\" w:fontKey=\"{{{font_key}}}\" w:subsetted=\"false\"/>"
        ));
        relationships.push_str(&format!("<Relationship Id=\"font{index}\" Type=\"{REL}/font\" Target=\"fonts/font{index}.odttf\"/>"));
        output.start_file(format!("word/fonts/font{index}.odttf"), options)?;
        output.write_all(&obfuscate(bytes, &key))?;
    }
    font_xml.push_str("</w:font></w:fonts>");
    relationships.push_str("</Relationships>");
    for (name, xml) in [
        ("word/fontTable.xml", font_xml),
        ("word/_rels/fontTable.xml.rels", relationships),
    ] {
        output.start_file(name, options)?;
        output.write_all(xml.as_bytes())?;
    }
    Ok(output.finish()?.into_inner())
}

fn replace_section_alignment(xml: &str, alignment: &str) -> String {
    let Some(start) = xml.match_indices("<w:sectPr>").find_map(|(index, _)| {
        let end = xml[index..].find("</w:sectPr>")? + index;
        (!xml[index..end].contains("<w:vAlign")).then_some(index)
    }) else {
        return xml.into();
    };
    let mut output = xml.to_string();
    let end = output[start..]
        .find("</w:sectPr>")
        .expect("matched section")
        + start;
    output.insert_str(end, &format!("<w:vAlign w:val=\"{alignment}\"/>"));
    output
}
