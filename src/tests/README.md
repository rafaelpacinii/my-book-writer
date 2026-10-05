# Testes do editor paginado

Os testes usam Node.js 24 ou superior. Os testes de navegador abrem um perfil isolado
e usam dados fictícios no armazenamento do navegador, sem acessar o SQLite do aplicativo.

Geometria, unidades, precisão das margens e compatibilidade com conteúdo antigo:

```bash
node --test --test-isolation=none src/utils/bookPagination.test.mjs
```

Para executar as regressões de Enter, desfazer, navegação, formatação, salvamento,
linhas vazias e configurações, instale as ferramentas fora das dependências do aplicativo:

```bash
npm install --prefix /tmp/my-book-writer-tests playwright@1.57.0
/tmp/my-book-writer-tests/node_modules/.bin/playwright install chromium firefox
npm run dev
```

Com o servidor em execução, use outro terminal:

```bash
MBW_PLAYWRIGHT_MODULE=file:///tmp/my-book-writer-tests/node_modules/playwright/index.mjs \
  node src/tests/pagedEditor.browser.mjs

MBW_PLAYWRIGHT_MODULE=file:///tmp/my-book-writer-tests/node_modules/playwright/index.mjs \
  MBW_TEST_BROWSER=firefox node src/tests/pagedEditor.browser.mjs
```

O servidor padrão é `http://localhost:3000`. Para usar outra porta, configure
`MBW_EDITOR_TEST_URL`. `MBW_BROWSER_PATH` permite usar um navegador já instalado.
