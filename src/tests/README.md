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

O Playwright inicia e encerra o servidor Next.js automaticamente na porta 3000.
Localmente, reutiliza um servidor já disponível nessa porta. Cada teste recebe um
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
