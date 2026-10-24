interface Props {
  message: string;
  isError?: boolean;
}

/** Loading, empty and error states of the preview, always with a way back. */
export function PreviewStatus({ message, isError = false }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 bg-background px-6 py-4 text-foreground">
      <p role={isError ? "alert" : "status"}
        className={`flex flex-1 items-center justify-center text-center ${isError ? "text-danger" : "text-muted"}`}
      >
        {message}
      </p>
    </div>
  );
}

