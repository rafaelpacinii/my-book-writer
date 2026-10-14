import { invoke } from "@tauri-apps/api/core";
import type {
  BackupExportResult,
  BackupImportResult,
  DatabaseStats,
} from "@/types/settings";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

const MOCK_STORAGE_KEY = "my_book_writer_mock_db_stats";

function getMockStats(): DatabaseStats {
  if (typeof window === "undefined") {
    return {
      db_path: "/data/my_book_writer.db",
      file_size_bytes: 524288,
      books_count: 1,
      chapters_count: 5,
      versions_count: 2,
    };
  }
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const initial: DatabaseStats = {
    db_path: "/home/user/.local/share/my-book-writer/my_book_writer.db",
    file_size_bytes: 1048576,
    books_count: 2,
    chapters_count: 12,
    versions_count: 4,
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  if (!isTauriEnvironment()) {
    return getMockStats();
  }
  return invoke<DatabaseStats>("get_database_stats");
}

export async function exportDatabaseBackup(
  customPath?: string,
): Promise<BackupExportResult | null> {
  if (!isTauriEnvironment()) {
    return {
      destination_path: customPath || "/home/user/Downloads/my_book_writer_backup.sqlite",
      file_size_bytes: 1048576,
    };
  }
  return invoke<BackupExportResult | null>("export_database_backup", {
    customPath: customPath || null,
  });
}

export async function importDatabaseBackup(
  customPath?: string,
): Promise<BackupImportResult | null> {
  if (!isTauriEnvironment()) {
    return {
      books_count: 3,
      chapters_count: 15,
    };
  }
  return invoke<BackupImportResult | null>("import_database_backup", {
    customPath: customPath || null,
  });
}

