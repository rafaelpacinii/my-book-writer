import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  bookId: string;
  message: string;
  isError?: boolean;
}

/** Loading, empty and error states of the preview, always with a way back. */
export function PreviewStatus({ bookId, message, isError = false }: Props) {
  const href = bookId ? `/books/view?bookId=${encodeURIComponent(bookId)}` : "/library";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p role={isError ? "alert" : "status"} className={isError ? "text-danger" : "text-muted"}>{message}</p>
      <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        {bookId ? "Voltar ao livro" : "Voltar à biblioteca"}
      </Link>
    </div>
  );
}

