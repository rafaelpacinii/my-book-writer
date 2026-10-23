# My Book Writer — guia rápido de identidade

B com esquerda, topo e base retos, curvas à direita e marcador de livro. A capa acompanha o MY com alinhamento em cima e embaixo e um pequeno espaço horizontal. Book tem prioridade e o i de Writer funciona como lápis.

## Qual arquivo usar

| Uso | Arquivo |
|---|---|
| Cabeçalho claro | `logo/my-book-writer-horizontal-color.svg` |
| Cabeçalho escuro | `logo/my-book-writer-horizontal-dark.svg` |
| Composição em duas linhas | `logo/my-book-writer-stacked-color.svg` |
| Símbolo sem texto, a partir de 32 px | `icon/my-book-writer-symbol-green.svg` |
| Símbolo sem texto, 16–24 px | `icon/my-book-writer-micro-green.svg` |
| Símbolo sobre fundo escuro | versões white ou sage |
| Ícone desktop | `app/my-book-writer.ico`, `.icns` ou PNG |
| Navegador | `web/favicon.svg` ou `web/favicon.ico` |
| Tela inicial / PWA | arquivos em `web/` |

PNGs horizontais: 905, 1810 e 2715 px de largura. PNGs em duas linhas: 484, 968 e 1452 px. Símbolo: 32, 48, 64, 128, 256 e 512 px. Micro: 16, 24 e 32 px. App: 16, 32, 64, 128, 256, 512 e 1024 px. Os nomes terminados em número indicam a largura em pixels; a altura segue a proporção.

## Tamanho e proteção

| Composição | Mínimo sugerido em tela | Impressão sugerida |
|---|---|---|
| Horizontal completa | 320 px | 85 mm |
| Duas linhas | 220 px | 55 mm |
| Símbolo | 32 px | 8 mm |
| Micro | 16–24 px | preferir símbolo normal na impressão |

Reserve ao redor da marca pelo menos uma haste do B: 22 unidades no mestre horizontal de 905 unidades, aproximadamente 2,4% da largura. No símbolo de 256 unidades, reserve 26,4 unidades. Preserve as margens internas do canvas dos ícones. Em tamanhos inferiores aos sugeridos, use o símbolo para evitar a perda do MY e do lápis.

## Tipografia e construção

- Book: EB Garamond SemiBold 600 no ook, B desenhado para a marca.
- Writer: EB Garamond Medium 500, i com ponta de lápis e ponto original preservado.
- MY: Plus Jakarta Sans SemiBold 600, 20 unidades de altura e entreletras de 1,2 unidade.
- Capa: 20 unidades de espessura na horizontal e vertical; gap horizontal de 3 unidades até o MY, medido no mestre SVG.

A espessura da faixa e a altura das letras MY permanecem iguais. As medidas escalam proporcionalmente: o gap equivale a cerca de 1,06 px em uma marca horizontal de 320 px de largura. Não recrie a marca digitando o nome: use os contornos prontos. Fontes originais e licenças SIL OFL 1.1 estão em `fonts/`; os SVGs não dependem delas.

## Paleta

| Cor | HEX | RGB | CMYK aproximado (%) |
|---|---|---|---|
| Verde editorial | #4B5E47 | 75, 94, 71 | 20 / 0 / 24 / 63 |
| Tinta | #222621 | 34, 38, 33 | 11 / 0 / 13 / 85 |
| Papel | #FAF9F6 | 250, 249, 246 | 0 / 0 / 2 / 2 |
| Verde claro | #ADC2A5 | 173, 194, 165 | 11 / 0 / 15 / 24 |
| Noite | #171816 | 23, 24, 22 | 4 / 0 / 8 / 91 |

Pares de contraste: verde/papel 6.67:1; tinta/papel 14.59:1; verde claro/noite 9.36:1; papel/noite 16.92:1.

Use color sobre fundos claros, dark sobre Noite e black/white para uma tinta. Green é inteiramente verde. Use o símbolo sage sobre Noite. Preserve as cores e proporções; evite sombras, contornos e gradientes. CMYK é aproximação matemática sem perfil de impressão. Os PDFs em `print/` são vetores RGB; a gráfica deve fazer a conversão de acordo com o processo e perfil usados.

## Ícones

O símbolo normal deriva do B final e da capa de 20 unidades, omite MY e mantém o marcador. O micro usa uma grade de 16 px, remove o marcador e abre os vazados. Favicon e quadro de 16 px do ICO têm uma margem própria para caber nos cantos do tile.

`app/my-book-writer-app-icon.svg` é a versão desktop com fundo arredondado. `app/my-book-writer-native-square-1024.png` tem fundo quadrado para plataformas que aplicam a própria máscara. `web/apple-touch-icon.png` e os PNGs de PWA usam fundo quadrado. `web/maskable-512.png` mantém o símbolo dentro da área circular segura de 80% do diâmetro.

## Integração e fontes

Copie o conteúdo de `web/` para a raiz pública e use `head-snippet.html` como exemplo. Mescle o manifest com o projeto existente; os caminhos, scope e start_url assumem publicação na raiz. Ajuste-os se a aplicação for publicada em um subdiretório.

`source/EB-Garamond-approved-final.svg` é o mestre desta entrega. `source/brand-construction.json` registra medidas, pesos e hashes das fontes. `source/checksums.sha256` registra todos os arquivos do kit.

`preview/apresentacao.html` é uma apresentação offline com seis aplicações. `preview/icon-check.png` mostra a leitura e a redução; `docs/validation.json` contém os resultados de verificação. O aviso de complexidade do auditor decorre dos contornos tipográficos preservados.
