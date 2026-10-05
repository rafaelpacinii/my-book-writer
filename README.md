# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Exportação PDF offline

A tela `/books/export?bookId=...` exporta os capítulos salvos no SQLite usando
HTML/CSS e Chromium local. O botão **Exportar** do editor salva as alterações antes
de abrir essa tela. O Rust apresenta o diálogo de destino, controla o navegador e
grava o PDF; a aplicação instalada não precisa de Node.js nem de internet.

Prepare o navegador durante o desenvolvimento, usando Node.js 24:

```fish
npm ci
npm run pdf:install
npm run pdf:prepare
npm run tauri dev
```

Os comandos Tauri de desenvolvimento e build executam `pdf:prepare` automaticamente.
Para distribuir, execute `npm run tauri build` em uma máquina com o mesmo sistema e
arquitetura do destino. O runtime completo é incluído nos recursos do instalador,
incluindo arquivos auxiliares; não versione os binários gerados. O Chromium aumenta
o tamanho do pacote. Em Linux, prepare também as bibliotecas exigidas pelo navegador
na máquina de build (`npx playwright install --with-deps chromium`).

O PDF usa o formato físico, as quatro margens, fonte, tamanho e entrelinha do livro.
Cada capítulo começa em uma página; a numeração é contínua. Parágrafos vazios
redundantes e marcadores antigos de paginação são normalizados apenas na cópia
exportada, sem alterar os capítulos salvos. Fontes locais são incorporadas ao PDF.
Imagens dentro dos capítulos ainda geram um erro explícito; a imagem do cartão da
biblioteca não é tratada como capa editorial. A equivalência integral das quebras
com o editor paginado e a distribuição em Windows/macOS ainda precisam de validação.

## Verificação da exportação

```fish
npx tsc --noEmit
npm test
npm run test:e2e
cd src-tauri
cargo fmt --check
cargo check
cargo test --lib
cargo test chromium_exports_real_pdf_offline --lib -- --ignored --nocapture
cargo test chromium_respects_formats_and_fonts_and_keeps_long_paragraphs --lib -- --ignored --nocapture
```

Os testes de interface simulam os comandos nativos com dados fictícios e não
acessam o banco do usuário. O teste Rust com Chromium gera e inspeciona um PDF real;
é executado separadamente porque requer `pdf:prepare`. Um caminho alternativo pode
ser configurado com `MBW_PDF_CHROMIUM` apenas em builds de desenvolvimento.
