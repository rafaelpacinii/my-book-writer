---
name: mbw-frontend
description: "Implementar ou corrigir React, hooks e clientes IPC do My Book Writer respeitando exportação estática, estados de UI e testes de navegador."
---

# mbw-frontend

Leia [regras frontend](../../../src/AGENTS.md),
[design](../../../docs/frontend-design.md) e [qualidade](../../../docs/ui-quality.md).
Reutilize direção visual já aprovada; siga o processo de referências somente
quando uma nova tela/direção depender de escolha ainda não feita.

- Preserve TSX ≤70 linhas e páginas compositivas. Extraia hooks para estado/efeitos
  e utilitários para cálculo puro; não compacte JSX para passar no verificador.
- Leia o guia pertinente em `node_modules/next/dist/docs/`; não introduza servidor
  Node, Server Actions ou API routes no runtime desktop estático.
- Use clientes em `src/lib/api/` e invalidação em `src/lib/data/`. Preserve revisão
  esperada, escopo de caches e descarte de respostas tardias. Não acesse disco/SQL.
- Verifique loading, vazio, erro/retry, sucesso, teclado, temas e janela estreita.
- Execute `python3 scripts/ai_checks.py verify --scope frontend` e regressões
  Playwright pertinentes. Não aceite baselines automaticamente. Browser mocks
  não comprovam persistência desktop; alterações IPC também exigem checks nativos.
