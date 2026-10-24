use docx_rs::*;

#[derive(Default)]
pub struct Lists {
    definitions: Vec<(usize, bool, usize)>,
}

impl Lists {
    pub fn create(&mut self, ordered: bool, start: usize) -> usize {
        // docx-rs reserves ID 1 for its default numbering definition.
        let id = self.definitions.len() + 100;
        self.definitions.push((id, ordered, start));
        id
    }

    pub fn apply(self, mut document: Docx) -> Docx {
        for (id, ordered, start) in self.definitions {
            let mut definition = AbstractNumbering::new(id);
            definition.multi_level_type = Some("multilevel".into());
            for level in 0..9 {
                definition = definition.add_level(
                    Level::new(
                        level,
                        Start::new(start),
                        NumberFormat::new(if ordered { "decimal" } else { "bullet" }),
                        LevelText::new(if ordered {
                            format!("%{}.", level + 1)
                        } else {
                            "•".into()
                        }),
                        LevelJc::new("left"),
                    )
                    .indent(
                        Some((level as i32 + 1) * 600),
                        Some(SpecialIndentType::Hanging(300)),
                        None,
                        None,
                    ),
                );
            }
            document = document
                .add_abstract_numbering(definition)
                .add_numbering(Numbering::new(id, id));
        }
        document
    }
}
