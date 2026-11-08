---
name: mbw-native
description: "Implementar comandos Tauri, serviços Rust e repositórios SQLx do My Book Writer, preservando persistência offline e contratos IPC."
---

# mbw-native

Leia [regras Rust](../../../src-tauri/AGENTS.md) e as
[regras BR afetadas](../../../docs/BUSINESS_RULES.md).

- Confira registro do comando em `src-tauri/src/lib.rs`, DTO Serde, wrapper em
  `src/lib/api/` e tipos do frontend. Não mude nome/casing/unidades por conveniência.
- Mantenha comando fino, serviço com validação e SQL nos repositórios. Preserve
  transações de revisão/restauração e vínculos de perfil/livro/série/universo.
- Teste falhas e concorrência que possam perder conteúdo com SQLite temporário
  ou em memória e migrations reais. Não abra o banco pessoal do usuário.
- Use AppError e mapeamento IPC seguro. Exceções legadas em backup/erros são dívida
  conhecida, não padrão a copiar.
- Execute `python3 scripts/ai_checks.py verify --scope native`; contratos IPC
  exigem frontend também. Esquema demanda o procedimento de
  [migração](../mbw-migration/SKILL.md). Testes de UI mock não substituem Rust.
