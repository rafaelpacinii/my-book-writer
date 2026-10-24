import { LinkButton } from "@/components/ui/LinkButton";

export function LibraryFolderEmpty({ kind }: { kind: "series" | "universe" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <h2 className="font-display text-2xl">{kind === "series" ? "Esta série ainda não tem livros." : "Este universo ainda não tem livros ou séries."}</h2>
      <p className="mt-2 text-sm text-muted">Arraste um livro para o card desta coleção na Biblioteca ou use a opção “Mover livro”.</p>
      <LinkButton href="/library" variant="outline" className="mt-5">Voltar à Biblioteca</LinkButton>
    </div>
  );
}
