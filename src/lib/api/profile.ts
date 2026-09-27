import { invoke } from "@tauri-apps/api/core";
import type { LocalProfile } from "@/types/profile";

/**
 * Obtém o perfil local ativo do autor.
 */
export async function getProfile(): Promise<LocalProfile> {
  return invoke<LocalProfile>("get_profile");
}

/**
 * Atualiza o nome de exibição do autor local.
 */
export async function updateProfile(displayName: string): Promise<LocalProfile> {
  return invoke<LocalProfile>("update_profile", { displayName });
}
