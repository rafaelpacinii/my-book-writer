import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useHistoryAction } from "@/hooks/useHistoryAction";

interface Props {
  bookId: string;
  chapterId: string;
  onCreate: () => Promise<void>;
}

export function VersionsEmpty({ bookId, chapterId, onCreate }: Props) {
  const action = useHistoryAction();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">Este capítulo ainda não tem versões</h1>
      <p className="max-w-md text-sm text-muted">Salve a primeira versão ou ative o rastreamento de alterações no editor.</p>
      {action.error && <p role="alert" className="text-sm text-danger">{action.error}</p>}
      <Button isLoading={action.isPending} onClick={() => void action.run(onCreate)}>Salvar versão atual</Button>
      <Link className="text-sm text-primary underline" href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`}>Abrir editor</Link>
    </div>
  );
}
