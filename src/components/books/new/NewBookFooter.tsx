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
          className="w-full sm:w-auto !h-11 px-6 !text-[13px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full sm:w-auto !h-11 px-8 !text-[13px] !font-bold"
        >
          Criar livro
        </Button>
      </div>
    </div>
  );
}
