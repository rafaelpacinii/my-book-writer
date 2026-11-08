---
name: mbw-migration
description: "Evoluir migrations SQLite e contratos persistidos do My Book Writer com validação de upgrade, integridade e recuperação de dados."
---

# mbw-migration

Leia [regras nativas](../../../src-tauri/AGENTS.md),
[estado e limites do backup](../../../docs/SYSTEM_STATE.md) e migrations existentes.

1. Identifique tabelas, dados antigos, índices, FKs, exclusão lógica, IDs UUIDv7 e
   dependências de revisão/escopo. Explique comportamento de upgrade e recuperação.
2. Adicione migration SQL sequencial em `src-tauri/migrations/`. Não reescreva
   migrations distribuídas nem suponha que downgrade será seguro.
3. Teste banco vazio e fixture sintética da versão anterior com conteúdo e vínculos.
   Valide preservação, backfill, foreign keys e falha transacional, além do schema.
4. Restore/backup deve usar fixture isolada; a existência de arquivo `.sqlite`
   não comprova backup completo das imagens externas. Não execute restauração
   em instalação real como parte da verificação de código.
5. Execute checks nativos; alterações de DTO/contrato também exigem frontend.
   Atualize regra BR, estado/ADR e impacto de versão quando aplicável.
