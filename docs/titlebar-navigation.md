# Navegação contextual na barra de título

O caminho Biblioteca > Universo > Série > Livro > seção aparece somente na barra de título, incluindo apenas os agrupadores existentes. Os nomes de Universo e Série levam às respectivas coleções da Biblioteca. As páginas de novo livro, detalhe, configurações, páginas iniciais, exportação, editor, prévia e histórico mantêm seu conteúdo e suas ações sem repetir esse caminho.

A barra continua acessível em janelas estreitas, com textos longos truncados sem cobrir os controles nativos. O histórico mantém o retorno ao mesmo capítulo no editor. A identificação do livro evita respostas antigas ao trocar de livro ou atualizar seus dados.

## Verificação executada

- `npx tsc --noEmit`: passou.
- `npm run lint`: passou.
- `npm run check:ui`: passou; todos os TSX respeitam o limite de 70 linhas.
- `npm test`: 62 testes passaram em 13 arquivos.
- Build estático de produção: passou.
- 88 cenários passaram em Chromium e Firefox, incluindo confirmação de descarte, salvamento antes da navegação, ausência de caminhos duplicados, prévia, exportação e retorno do histórico.
- 16 referências visuais foram atualizadas, inspecionadas e comparadas em quatro cenários Chromium. Os casos visuais do Firefox são ignorados por configuração existente.
- A navegação com título longo e controles nativos simulados foi conferida nas larguras 800, 540, 390 e 320 px.

Os testes de navegador simulam a ponte Tauri; não validam o gerenciador de janelas real.

## Reprodução dos testes

```bash
MBW_NEXT_DIST_DIR=.next/cache/ui-titlebar NODE_OPTIONS='--require ./src/tests/offline-next.cjs' npx next build --webpack
MBW_NEXT_DIST_DIR=.next/cache/ui-titlebar MBW_STATIC_PORT=3167 node src/tests/serve-static.mjs
```

Em outro terminal:

```bash
MBW_EDITOR_TEST_URL=http://127.0.0.1:3167 npx playwright test src/tests/e2e/uiBookNavigation.spec.ts src/tests/e2e/bookSections.spec.ts src/tests/e2e/bookPreview.spec.ts src/tests/e2e/editorChrome.spec.ts src/tests/e2e/pdfExport.spec.ts src/tests/e2e/titlebar.spec.ts --project=chromium --project=firefox
MBW_EDITOR_TEST_URL=http://127.0.0.1:3167 npx playwright test src/tests/e2e/uiVisual.spec.ts --project=chromium
```

## Git

Base atual: `develop`. Os comandos abaixo foram gerados para revisão e execução; nenhum commit, push ou PR foi executado. Este relatório local está ignorado pelo Git. A documentação versionada foi atualizada em `docs/ui-quality.md`.

```bash
git checkout -b fix/duplicate-breadcrumbs

git add \
  docs/ui-quality.md \
  src/components/books/detail/BookDetailHeader.tsx \
  src/components/books/editor/EditorHeader.tsx \
  src/components/books/editor/EditorTopBars.tsx \
  src/components/books/editor/editorChrome.module.css \
  src/components/books/export/ExportHeader.tsx \
  src/components/books/export/Main.tsx \
  src/components/books/frontMatter/Main.tsx \
  src/components/books/new/NewBookHeader.tsx \
  src/components/books/preview/Main.tsx \
  src/components/books/preview/PreviewHeader.tsx \
  src/components/books/preview/PreviewStatus.tsx \
  src/components/books/preview/PreviewWorkspace.tsx \
  src/components/books/settings/Main.tsx \
  src/components/books/settings/SettingsHeader.tsx \
  src/components/books/shared/BookSectionHeader.tsx \
  src/components/books/versions/Main.tsx \
  src/components/books/versions/VersionsHeader.tsx \
  src/components/shared/BookBreadcrumbs.tsx \
  src/components/shared/Breadcrumbs.tsx \
  src/components/shared/titlebar.css \
  src/hooks/useTitleBarCrumbs.ts \
  src/tests/e2e/bookPreview.spec.ts \
  src/tests/e2e/bookSections.spec.ts \
  src/tests/e2e/editorChrome.spec.ts \
  src/tests/e2e/pdfExport.spec.ts \
  src/tests/e2e/uiBookNavigation.spec.ts \
  src/tests/e2e/uiMock.ts \
  src/tests/e2e/uiVisual.spec.ts-snapshots/home-dark-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/home-dark-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/home-light-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/home-light-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/library-dark-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/library-dark-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/library-light-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/library-light-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/new-book-dark-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/new-book-dark-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/new-book-light-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/new-book-light-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/settings-dark-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/settings-dark-800-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/settings-light-1440-chromium-linux.png \
  src/tests/e2e/uiVisual.spec.ts-snapshots/settings-light-800-chromium-linux.png \
  src/tests/e2e/windowMock.ts

git commit -m 'refactor: centralize contextual navigation in titlebar'
git push -u origin fix/duplicate-breadcrumbs

cat > /tmp/my-book-writer-titlebar-navigation-pr.md <<'EOF'
## Summary
- Keep contextual navigation only in the titlebar and remove duplicate breadcrumbs and unused header properties across book screens.
- Keep navigation reachable in narrow windows and preserve the history-to-editor chapter link.
- Prevent stale book titles, preserve unsaved-change and save-before-navigation protections, and update visual references.

## Validation
- npx tsc --noEmit, npm run lint and npm run check:ui passed.
- npm test: 62 tests passed.
- Static Next.js webpack build passed.
- 88 scenarios passed across Chromium and Firefox, including navigation guards and narrow native-window mocks.
- 16 visual references updated, inspected and compared successfully in four Chromium cases.

## Scope of validation
- Browser tests simulate the Tauri bridge; real window-manager interactions were not exercised.
EOF

gh pr create \
  --base develop \
  --head fix/duplicate-breadcrumbs \
  --title 'refactor: centralize contextual navigation in titlebar' \
  --body-file /tmp/my-book-writer-titlebar-navigation-pr.md
```
