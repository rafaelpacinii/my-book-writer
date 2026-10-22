import { book } from "@/tests/fixtures/book";

export const editorialBooks = [
  { title: "O silêncio das marés", author_name: "Helena Duarte" },
  { title: "Atlas de pequenas ausências", author_name: "Helena Duarte" },
  { title: "Depois da última chuva", author_name: "Ana Martins" },
  { title: "A casa do outro lado", author_name: "Helena Duarte" },
  { title: "Entre o vento e a palavra", author_name: "Luís Azevedo" },
  { title: "Caderno de ideias", author_name: "Helena Duarte" },
].map((item, index) => ({
  ...book, ...item, id: `editorial-${index}`, card_image_asset_id: null,
  updated_at: `2026-10-${String(20 - index).padStart(2, "0")}T12:00:00.000Z`,
}));
