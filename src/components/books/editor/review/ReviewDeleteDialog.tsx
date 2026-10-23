import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ReviewController } from "@/components/books/editor/review/types";

export function ReviewDeleteDialog({ review }: { review: ReviewController }) {
  return (
    <Modal isOpen={Boolean(review.deleteTarget)} onClose={review.cancelDelete} title="Excluir comentário">
      <p className="text-sm text-foreground">Excluir esta anotação permanentemente? O texto do capítulo será preservado.</p>
      {review.actionError && <p role="alert" className="mt-3 text-sm text-danger">{review.actionError}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" disabled={review.isPending} onClick={review.cancelDelete}>Cancelar</Button>
        <Button variant="danger" isLoading={review.isPending} onClick={() => void review.confirmDelete()}>Excluir comentário</Button>
      </div>
    </Modal>
  );
}
