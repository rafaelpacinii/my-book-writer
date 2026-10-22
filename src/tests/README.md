# Testes do frontend

Os testes são escritos em TypeScript. Vitest executa os testes unitários de geometria,
unidades e conteúdo antigo (`src/**/*.test.ts`). Playwright Test executa as regressões
do editor e das configurações em navegadores reais (`src/tests/e2e/*.spec.ts`).

## Preparação

Ambiente validado: Node.js 24.

```fish
npm ci
npx playwright install chromium firefox
```

## Testes unitários

```fish
npm run test
npm run test:watch
```

## Testes no navegador

```fish
npm run test:e2e -- --project=chromium --project=firefox
npm run test:e2e:ui -- --project=chromium
npm run test:e2e:report
```

O Playwright compila a exportação estática e inicia a prévia na porta 3100.
Localmente, reutiliza uma prévia já disponível nessa porta; ela deve estar atualizada. Cada teste recebe um
contexto isolado e livros/capítulos fictícios no localStorage; o SQLite do aplicativo
desktop não é acessado. Falhas geram relatório HTML, captura de tela e trace nas
pastas ignoradas `src/tests/playwright-report` e `src/tests/test-results`.

O comando `npm run test:e2e` executa os projetos Chromium e Firefox. Em Linux, se
faltarem bibliotecas do sistema, instale-as junto com esses navegadores:

```fish
npx playwright install --with-deps chromium firefox
npm run test:e2e
```

Para usar um servidor já iniciado, inclusive servindo a exportação de produção,
informe a URL. Nesse caso, o Playwright não inicia outro servidor:

```fish
env MBW_EDITOR_TEST_URL=http://localhost:3100 npm run test:e2e -- --project=chromium
```

O servidor de exportação precisa resolver rotas como `/books/editor` para os arquivos
HTML correspondentes em `out/`. O Vitest e o Playwright transformam TypeScript;
execute também `npx tsc --noEmit` para verificar os tipos dos testes e do aplicativo.

## Estabilidade visual e acessibilidade

`npm run test:ui` executa as regressões das quatro telas principais, auditorias axe
nos dois temas e capturas de referência em Chromium/Linux. Os testes de aparência
cobrem 800×600, 1280×720 e 1440×1000; o layout editorial também é verificado
em nove larguras entre 360 e 1920 px, incluindo grade/lista, títulos longos e menu compacto. Para revisar mudanças visuais intencionais,
use `npm run test:ui -- --update-snapshots=all` e confira cada imagem alterada.

`npm run check:ui` confere tamanho dos TSX, ausência de any explícito e composição
das rotas. `npm run lint` usa ESLint diretamente; o comando removido next lint
não é mais utilizado.

Para validar os arquivos de produção:

```bash
npm run build -- --webpack
npm run preview:static
# Em outro terminal:
MBW_EDITOR_TEST_URL=http://127.0.0.1:3100 npm run test:e2e
```

No Windows, `npm run test:native` usa tauri-driver/WebView2 e uma aplicação
compilada com identificador e banco isolados. A suíte recusa escrever no banco
normal do usuário. Preparação, matriz de DPI e critérios de aceite estão em
[Qualidade de interface](../../docs/ui-quality.md). A suíte nativa não substitui
a verificação do instalador nem a inspeção manual em 100%, 125% e 150% de escala.
