# Identidade visual do My Book Writer

A aplicação usa os vetores e ícones do kit aprovado em `my-book-writer-brand-kit.zip`.
SHA-256 do arquivo de origem: `721139d562216088d0b45c98079f9634b954525c07abeaafaf6c7250e41254f4`.
Os 153 arquivos listados em `source/checksums.sha256` foram verificados na integração.

## Aplicação dos arquivos

| Local | Variante | Local dos arquivos |
| --- | --- | --- |
| Entrada, a partir de 640 px de janela | Horizontal, 320 px | `public/brand/logo-horizontal-*.svg` |
| Entrada em janelas menores | Duas linhas, 220 px | `public/brand/logo-stacked-*.svg` |
| Menu lateral, expandido ou recolhido | Símbolo, 32 px | `public/brand/symbol-*.svg` |
| Marcas de 16–24 px | Micro | `public/brand/micro-*.svg` |
| Aba do navegador | Favicon SVG, ICO e PNG | `public/favicon.*`, `public/favicon-*.png` |
| Atalhos web e tela inicial | Apple touch, 192, 512 e maskable | `public/`, `public/site.webmanifest` |
| Aplicativo desktop | PNG, ICO, ICNS e tiles Windows | `src-tauri/icons/` |
| README | Horizontal com variante clara/escura | `public/brand/` |

`BrandAsset` centraliza a apresentação das variantes e usa CSS para escolher as cores
antes da hidratação. Os vetores mantêm as proporções e os espaços internos do kit.
A lateral tem 240 px: usa o símbolo, pois não comporta a largura mínima de 320 px da
marca horizontal nem os 220 px da composição em duas linhas com as margens atuais.
“Estúdio editorial” é um descritor de interface; o logotipo não é reconstruído com texto.
Ícones de ações, como leitura, edição e exportação, continuam sendo ícones funcionais.

## Cores e fontes

`src/lib/branding/tokens.css` contém as cinco cores do kit. As cores semânticas de
`globals.css` usam esses tokens e preservam os contrastes dos dois temas.
A marca é desenhada em contornos; não depende de fontes instaladas nem de downloads.
Os tipos de letra da interface e os estilos dos manuscritos são independentes da marca.
O [guia original](guia-rapido.md), as notas de fontes e as licenças SIL OFL estão em `branding/`.
Os caminhos citados no guia original referem-se à estrutura do arquivo ZIP.

## Desktop

Os PNGs principais, o ICO e o ICNS foram copiados do kit. Os tiles Windows foram
produzidos com `tauri icon` a partir de `my-book-writer-native-square-1024.png`, que já
prevê plataformas com máscara própria. O identificador da aplicação e o nome técnico
do executável permanecem os mesmos. O nome de exibição passa a ser My Book Writer.
O código de atualização MSI anterior foi fixado para preservar a identidade de atualização.

Ao atualizar a marca, copie novamente os arquivos aprovados, gere apenas os tiles
necessários e confira a entrada, a lateral, o favicon e os ícones nativos.
Ícones do sistema operacional passam a usar os novos arquivos após recompilar o Tauri.
