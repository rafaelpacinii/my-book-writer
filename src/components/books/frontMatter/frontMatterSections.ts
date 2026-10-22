export const FRONT_MATTER_SECTIONS = [
  { id: "half-title", label: "Falsa folha" },
  { id: "title-page", label: "Folha de rosto" },
  { id: "copyright", label: "Copyright e créditos" },
  { id: "dedication", label: "Dedicatória e epígrafe" },
  { id: "toc", label: "Sumário" },
] as const;

export type FrontMatterTab = typeof FRONT_MATTER_SECTIONS[number]["id"];
