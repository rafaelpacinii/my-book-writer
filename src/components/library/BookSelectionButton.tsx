export function BookSelectionButton({ title, selected, onInspect }: {
  title: string; selected: boolean; onInspect: (element: HTMLButtonElement) => void;
}) {
  return (
    <button type="button" aria-label={`Ver detalhes de ${title}`} aria-pressed={selected}
      className="absolute inset-0 z-10 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
      onClick={(event) => onInspect(event.currentTarget)} />
  );
}
