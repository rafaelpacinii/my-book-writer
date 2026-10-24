/**
 * Representa um Universo Literário persistido na tabela `universes` do SQLite.
 */
export interface Universe {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Parâmetros para criação de um novo Universo Literário.
 */
export interface CreateUniverseInput {
  profile_id: string;
  name: string;
  description?: string | null;
}

/**
 * Parâmetros para atualização de um Universo Literário existente.
 */
export interface UpdateUniverseInput {
  name?: string | null;
  description?: string | null;
}

