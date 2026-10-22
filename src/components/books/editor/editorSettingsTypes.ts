import type { Book, UpdateBookInput } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";

export interface EditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  formats: BookFormat[];
  fonts: FontPreset[];
  onSave: (input: UpdateBookInput) => Promise<boolean>;
}
