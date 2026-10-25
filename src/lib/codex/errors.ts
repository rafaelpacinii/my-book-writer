export type CodexErrorCode = "validation" | "not_found" | "storage";
export class CodexError extends Error {
  constructor(public readonly code: CodexErrorCode, message: string) { super(message); this.name = "CodexError"; }
}
export function codexError(error: unknown): CodexError {
  if (error instanceof CodexError) return error;
  if (error && typeof error === "object" && "code" in error && "message" in error
    && (error.code === "validation" || error.code === "not_found" || error.code === "storage") && typeof error.message === "string") {
    return new CodexError(error.code, error.message);
  }
  return new CodexError("storage", "Não foi possível acessar o Códice local. Tente novamente.");
}
export function invalid(message: string): never { throw new CodexError("validation", message); }
export function missing(message: string): never { throw new CodexError("not_found", message); }
