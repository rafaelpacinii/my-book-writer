import { createContext } from "react";
import type { CodexHub } from "@/hooks/useCodexHub";

export const CodexWorkspaceContext = createContext<CodexHub | null>(null);
