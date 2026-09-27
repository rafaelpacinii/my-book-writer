import { invoke } from "@tauri-apps/api/core";
import type { LocalProfile } from "@/types/profile";

const DEFAULT_PROFILE: LocalProfile = {
  id: "local-default-id",
  display_name: "Helena Duarte",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export async function getProfile(): Promise<LocalProfile> {
  if (!isTauriEnvironment()) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("my_book_writer_profile");
      if (stored) {
        try {
          return JSON.parse(stored) as LocalProfile;
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_PROFILE;
  }
  return invoke<LocalProfile>("get_profile");
}

export async function updateProfile(displayName: string): Promise<LocalProfile> {
  if (!isTauriEnvironment()) {
    const updated: LocalProfile = {
      ...DEFAULT_PROFILE,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("my_book_writer_profile", JSON.stringify(updated));
    }
    return updated;
  }
  return invoke<LocalProfile>("update_profile", { displayName });
}
