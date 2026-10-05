interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EditorPagedNavigation(props: Props) {
  const button = "px-2 py-1 hover:text-foreground disabled:opacity-30 cursor-pointer";

  return (
    <div className="flex items-center gap-1 bg-surface border border-border px-2 py-1 rounded-lg">
      <button
        type="button"
        disabled={props.currentPage === 1}
        onClick={() => props.onPageChange(props.currentPage - 1)}
        className={button}
        aria-label="Página anterior"
      >
        ◀
      </button>
      <label htmlFor="editor-page">Página</label>
      <select
        id="editor-page"
        value={props.currentPage}
        onChange={(event) => props.onPageChange(Number(event.target.value))}
        className="bg-background border border-border rounded px-1 py-0.5"
      >
        {Array.from({ length: props.totalPages }, (_, index) => (
          <option key={index} value={index + 1}>{index + 1}</option>
        ))}
      </select>
      <span>de {props.totalPages}</span>
      <button
        type="button"
        disabled={props.currentPage === props.totalPages}
        onClick={() => props.onPageChange(props.currentPage + 1)}
        className={button}
        aria-label="Próxima página"
      >
        ▶
      </button>
    </div>
  );
}
