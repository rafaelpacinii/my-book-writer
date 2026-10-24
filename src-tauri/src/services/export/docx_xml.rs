use quick_xml::{events::Event, Reader, Writer};
use std::io::{Error, ErrorKind};

type XmlResult<T> = Result<T, Box<dyn std::error::Error>>;

// docx-rs 0.4.22 emits properties outside their ECMA-376 sequence. Word may
// repair or ignore them. Normalize only property groups; preserve text/fields.
// https://learn.microsoft.com/office/open-xml/word/how-to-validate-a-word-processing-document
pub fn normalize(bytes: &[u8]) -> XmlResult<Vec<u8>> {
    let mut reader = Reader::from_reader(bytes);
    let mut writer = Writer::new(Vec::with_capacity(bytes.len()));
    loop {
        let event = reader.read_event()?;
        if matches!(event, Event::Eof) {
            return Ok(writer.into_inner());
        }
        write_event(&mut reader, event, "", &mut writer)?;
    }
}

fn write_event(
    reader: &mut Reader<&[u8]>,
    event: Event<'_>,
    parent: &str,
    writer: &mut Writer<Vec<u8>>,
) -> XmlResult<()> {
    let Event::Start(start) = event else {
        writer.write_event(event)?;
        return Ok(());
    };
    let name = start.name().as_ref().to_string();
    let order = property_order(&name);
    writer.write_event(Event::Start(start))?;
    let mut children: Vec<(usize, Vec<u8>)> = Vec::new();
    loop {
        let event = reader.read_event()?;
        match event {
            Event::End(end) => {
                children.sort_by_key(|(rank, _)| *rank);
                for (_, bytes) in children {
                    writer.get_mut().extend_from_slice(&bytes);
                }
                writer.write_event(Event::End(end))?;
                return Ok(());
            }
            Event::Eof => return Err(invalid("Unclosed DOCX property group")),
            event => {
                let Some(order) = order else {
                    write_event(reader, event, &name, writer)?;
                    continue;
                };
                let child_name = match &event {
                    Event::Start(child) | Event::Empty(child) => child.name().as_ref().to_string(),
                    Event::Text(text) if text.as_ref().trim().is_empty() => continue,
                    _ => return Err(invalid("Unexpected content in DOCX properties")),
                };
                // Style/default paragraph properties cannot contain run properties.
                // The generator inserts an empty rPr even when none was configured.
                if name == "w:pPr"
                    && matches!(parent, "w:style" | "w:pPrDefault")
                    && child_name == "w:rPr"
                {
                    if matches!(&event, Event::Empty(child) if child.attributes().next().is_none())
                    {
                        continue;
                    }
                    return Err(invalid(
                        "Unexpected run formatting in DOCX paragraph defaults",
                    ));
                }
                let rank = order
                    .split_whitespace()
                    .position(|candidate| candidate == child_name)
                    .ok_or_else(|| invalid("Unsupported DOCX property"))?;
                let mut child_writer = Writer::new(Vec::new());
                write_event(reader, event, &name, &mut child_writer)?;
                children.push((rank, child_writer.into_inner()));
            }
        }
    }
}

fn invalid(message: &str) -> Box<dyn std::error::Error> {
    Box::new(Error::new(ErrorKind::InvalidData, message))
}

// Sequences for the properties used by this exporter, in schema order.
fn property_order(name: &str) -> Option<&'static str> {
    match name {
        "w:rPr" => Some(
            "w:rStyle w:rFonts w:b w:bCs w:i w:iCs w:caps w:smallCaps w:strike w:dstrike w:outline \
             w:shadow w:emboss w:imprint w:noProof w:snapToGrid w:vanish w:webHidden w:color \
             w:spacing w:w w:kern w:position w:sz w:szCs w:highlight w:u w:effect w:bdr w:shd \
             w:fitText w:vertAlign w:rtl w:cs w:em w:lang w:eastAsianLayout w:specVanish w:oMath \
             w:rPrChange",
        ),
        "w:pPr" => Some(
            "w:pStyle w:keepNext w:keepLines w:pageBreakBefore w:framePr w:widowControl w:numPr \
             w:suppressLineNumbers w:pBdr w:shd w:tabs w:suppressAutoHyphens w:kinsoku w:wordWrap \
             w:overflowPunct w:topLinePunct w:autoSpaceDE w:autoSpaceDN w:bidi w:adjustRightInd \
             w:snapToGrid w:spacing w:ind w:contextualSpacing w:mirrorIndents w:suppressOverlap w:jc \
             w:textDirection w:textAlignment w:textboxTightWrap w:outlineLvl w:divId w:cnfStyle w:rPr \
             w:sectPr w:pPrChange",
        ),
        "w:sectPr" => Some(
            "w:headerReference w:footerReference w:footnotePr w:endnotePr w:type w:pgSz w:pgMar \
             w:paperSrc w:pgBorders w:lnNumType w:pgNumType w:cols w:formProt w:vAlign w:noEndnote \
             w:titlePg w:textDirection w:bidi w:rtlGutter w:docGrid w:printerSettings w:sectPrChange",
        ),
        "w:style" => Some(
            "w:name w:aliases w:basedOn w:next w:link w:autoRedefine w:hidden w:uiPriority \
             w:semiHidden w:unhideWhenUsed w:qFormat w:locked w:personal w:personalCompose \
             w:personalReply w:rsid w:pPr w:rPr w:tblPr w:trPr w:tcPr w:tblStylePr",
        ),
        "w:settings" => Some(
            "w:zoom w:embedTrueTypeFonts w:defaultTabStop w:updateFields w:compat",
        ),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::normalize;

    #[test]
    fn repairs_schema_sequence_without_reordering_text_or_field_results() {
        let input = br#"<w:document><w:body><w:p><w:pPr><w:rPr/><w:jc w:val="center"/><w:pStyle w:val="Heading"/><w:keepNext/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="292D28"/><w:rFonts w:ascii="Inter 18pt"/></w:rPr><w:t xml:space="preserve"> A &amp; B </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/><w:instrText xml:space="preserve"> PAGEREF MBWChapter0 </w:instrText><w:t>1</w:t><w:fldChar w:fldCharType="end"/></w:r></w:p></w:body></w:document>"#;
        let output = String::from_utf8(normalize(input).unwrap()).unwrap();
        assert!(output.contains(r#"<w:pPr><w:pStyle w:val="Heading"/><w:keepNext/><w:jc w:val="center"/><w:rPr/></w:pPr>"#));
        assert!(output.contains(r#"<w:rPr><w:rFonts w:ascii="Inter 18pt"/><w:color w:val="292D28"/><w:sz w:val="22"/></w:rPr>"#));
        let text_and_fields = r#"<w:t xml:space="preserve"> A &amp; B </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/><w:instrText xml:space="preserve"> PAGEREF MBWChapter0 </w:instrText><w:t>1</w:t><w:fldChar w:fldCharType="end"/></w:r>"#;
        assert!(output.contains(text_and_fields));
        assert_eq!(normalize(output.as_bytes()).unwrap(), output.as_bytes());
    }

    #[test]
    fn rejects_malformed_or_unsupported_properties_without_discarding_formatting() {
        for input in [
            "<w:p><w:pPr>",
            "<w:p><w:pPr></w:rPr></w:p>",
            "<w:rPr><w:unsupported/></w:rPr>",
            "<w:style><w:pPr><w:rPr><w:b/></w:rPr></w:pPr></w:style>",
        ] {
            assert!(normalize(input.as_bytes()).is_err(), "{input}");
        }
    }
}
