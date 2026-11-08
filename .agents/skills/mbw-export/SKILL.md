---
name: mbw-export
description: "Alterar ou auditar exportação PDF, EPUB e DOCX do My Book Writer com Chromium local, fontes incorporadas e validação editorial."
---

# mbw-export

Leia [auditoria de exportação](../../../docs/export-audit.md),
[regras nativas](../../../src-tauri/AGENTS.md) e o formato afetado em
`src-tauri/src/services/export/`.

- Preserve conteúdo canônico/legado suportado, sanitização e diagnóstico por
  capítulo. Mantenha micrômetros, pontos, margens, front matter e sumário coerentes.
- PDF usa Chromium local por DevTools. EPUB/DOCX não dependem da disponibilidade
  de PDF. Não baixe imagens/fontes nem use serviço remoto durante exportação.
- Mudanças em `public/fonts/` afetam Rust e frontend. Verifique fontes e recursos
  no artefato empacotado, não só no ambiente de desenvolvimento.
- Use conteúdo sintético e testes estruturais/semânticos existentes de exportação.
  Execute checks nativos e browser se o fluxo de exportação mudar.
- Relate separadamente validação estrutural, geração real e inspeção visual em
  Word/leitor EPUB. Não deduza paginação idêntica de um arquivo XML válido.
