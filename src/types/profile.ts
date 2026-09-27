/**
 * Representa o perfil do autor na máquina local.
 * Espelha o registro da tabela `local_profiles` e a struct `LocalProfile` do Rust.
 */
export interface LocalProfile {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}
