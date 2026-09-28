export type FormatAction =
  | "bold"
  | "italic"
  | "underline"
  | "quote"
  | "dialogue-dash"
  | "scene-break"
  | "align-left"
  | "align-center"
  | "justify";

export function executeFormatAction(action: FormatAction): void {
  if (typeof document === "undefined") return;

  switch (action) {
    case "bold":
      document.execCommand("bold");
      break;
    case "italic":
      document.execCommand("italic");
      break;
    case "underline":
      document.execCommand("underline");
      break;
    case "quote": {
      const isQuote = document.queryCommandValue("formatBlock") === "blockquote";
      document.execCommand("formatBlock", false, isQuote ? "<p>" : "<blockquote>");
      break;
    }
    case "dialogue-dash":
      document.execCommand("insertText", false, "— ");
      break;
    case "scene-break":
      document.execCommand(
        "insertHTML",
        false,
        '<div class="scene-break">* * *</div><p><br></p>'
      );
      break;
    case "align-left":
      document.execCommand("justifyLeft");
      break;
    case "align-center":
      document.execCommand("justifyCenter");
      break;
    case "justify":
      document.execCommand("justifyFull");
      break;
  }
}
