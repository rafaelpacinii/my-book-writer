import { Button } from "@/components/ui/Button";

interface Props {
  onCancel: () => void;
  isSubmitting: boolean;
}

export function NewBookFooter({ onCancel, isSubmitting }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-4">
      <p className="text-xs text-muted">
        Seus livros ficam neste dispositivo, mesmo sem internet.
      </p>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingLabel="Criando livro…"
          className="w-full sm:w-auto px-8"
        >
          Criar livro
        </Button>
      </div>
    </div>
  );
}
