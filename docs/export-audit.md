# Auditoria da exportação

Data: 23/10/2026. Escopo: página de exportação, clientes IPC, serviços nativos, validação do conteúdo, escrita dos arquivos e apresentação de PDF, EPUB e DOCX.

Editor de referência informado pelo usuário: **Microsoft Word**. O Word não está instalado/registrado neste ambiente Windows e não há sessão Word conectada. A validação estrutural descrita abaixo usa o SDK da Microsoft; a comparação visual no Word permanece pendente.

## Problemas corrigidos

| Problema observado | Correção |
| --- | --- |
| Capítulo recém-criado com `blocks: []` causava erro de formato sem identificar o capítulo | Reconhecimento do documento legado e diagnóstico com posição, título e orientação para escrever/salvar ou remover o capítulo |
| Capítulo com parágrafos vazios, espaços ou caracteres invisíveis podia passar pela validação | Verificação do texto efetivamente exportável após a sanitização |
| Conteúdo inválido ou imagem não suportada retornava mensagem sem contexto | Mensagem identifica o capítulo; tabelas não suportadas também são sinalizadas, evitando perda silenciosa de estrutura |
| Conteúdo legado com HTML vazio e texto preenchido, ou blocos aninhados | Mesma prioridade de leitura usada pelo editor, com preservação dos parágrafos |
| Usuário descobria um problema somente ao exportar | Lista de ajustes antes do botão, links diretos para os capítulos/configurações e ação “Verificar novamente” |
| EPUB/DOCX habilitados no navegador; dependência indevida da disponibilidade do PDF | Disponibilidade desktop comum aos formatos; Chromium exigido apenas para PDF |
| Exportações simultâneas ao alternar as abas | Uma única operação pendente controla os três formatos e mantém o andamento visível |
| Erros/resultados podiam sobreviver à troca de livro | Estado isolado por livro; respostas tardias são descartadas; dados relidos antes de exportar |
| Falha na atualização da data do livro podia reportar falha depois de salvar o arquivo | Caminho salvo continua sendo sucesso, acompanhado de aviso sobre a atualização dos metadados |
| EPUB anunciado como versão 3, mas gerado com a versão padrão do gerador | EPUB 3 configurado explicitamente |
| Sumário do EPUB apontava para `chapter_1.xhtml`, enquanto o arquivo era `chapter_001.xhtml` | Referências padronizadas, com verificação do arquivo gerado |
| Elementos vazios HTML não eram necessariamente XHTML válido | Conversão de `br` e `hr`, inclusive com atributos |
| DOCX centralizava títulos, usava recuos diferentes e achatava parágrafos/quebras | Títulos, área de texto, espaçamento, alinhamento, parágrafos e quebras aproximados das regras do PDF |
| DOCX perdia listas, hyperlinks e parte da formatação | Preservação de listas, links, negrito, itálico, sublinhado, tachado, sobrescrito e subscrito |
| DOCX não tinha a mesma separação de páginas iniciais/cabeçalhos/rodapés | Seções para as páginas iniciais, sem cabeçalhos/rodapés nelas; cabeçalho e campo de página no corpo |
| Sumário DOCX inventava páginas a partir do tamanho do JSON | Campos TOC/PAGEREF e marcadores de capítulo, atualizáveis pelo editor de texto |
| Fonte do DOCX dependia apenas do nome no documento | Inclusão das variantes da fonte e uso do nome interno correto, incluindo Merriweather 24pt e Inter 18pt |
| Gerador DOCX emitia propriedades fora da sequência OOXML e propriedades vazias inválidas em estilos | Normalização dos grupos de propriedades de fontes, parágrafos, seções, estilos e configurações; o exemplo passou de 116 erros para zero no Open XML SDK da Microsoft |
| Nomes reservados do Windows poderiam ser sugeridos | Normalização compartilhada de nome e verificação da extensão nos três formatos |
| Testes serviam um diretório `out` antigo com `MBW_NEXT_DIST_DIR` definido | Servidor estático passa a servir o diretório correspondente à compilação atual |

## Comportamento e integridade

A leitura do livro continua em uma transação SQLite que inclui metadados, configurações, páginas iniciais e capítulos ativos na ordem persistida. A verificação da exportação é somente leitura. Capítulos vazios não são excluídos ou ignorados automaticamente.

PDF e DOCX verificam as configurações físicas da página; EPUB permanece independente das margens e da fonte do formato impresso. Os serviços voltam a validar o snapshot antes de gerar o arquivo, mesmo quando a interface já fez a verificação.

Geração, compactação e escrita ficam em tarefa nativa bloqueante separada. O cancelamento do diálogo ocorre antes da geração pesada. Arquivos são gravados em temporário na pasta escolhida e persistidos somente depois da escrita completa, preservando destinos existentes quando há falha.

A inclusão de fontes usa os recursos locais compilados no aplicativo e os dados de incorporação OOXML. A estrutura e a recuperação dos bytes originais são verificadas nos testes. Referência do formato: [Font Part — Microsoft](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/1663dabc-5d98-463f-889e-bcd9b77c3d34).

A normalização OOXML preserva texto, links, marcadores e resultados/instruções dos campos. Propriedades desconhecidas ou formatação inesperada nos padrões de parágrafo produzem erro, evitando descarte silencioso. A validação adicional seguiu o procedimento [Validate a word processing document — Microsoft](https://learn.microsoft.com/en-us/office/open-xml/word/how-to-validate-a-word-processing-document), com Open XML SDK 3.5.1 executado localmente sobre arquivos fictícios. Esse SDK é uma ferramenta temporária da auditoria, não uma dependência do aplicativo.

## Validação da etapa inicial, integrada no PR #64

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Passou |
| `npm run lint` | Passou |
| `npm test` | 62 testes passaram |
| `npm run check:ui` | Passou; componentes TSX alterados abaixo de 70 linhas |
| `cargo fmt --check` e `cargo check --locked --offline` | Passaram |
| `cargo test --lib --locked --offline` | 45 passaram; 3 testes de Chromium ignorados na execução padrão |
| `cargo test --lib services::export --locked --offline -- --ignored --nocapture` | Os 3 testes adicionais passaram com Chromium real |
| Build estático com Webpack | Passou |
| Suítes `exportAudit.spec.ts` e `pdfExport.spec.ts` | 56 cenários passaram: 28 Chromium e 28 Firefox |
| Acessibilidade das mensagens em 800×600 | axe e navegação por teclado nos temas claro e escuro, nos dois navegadores |
| Leitura dos arquivos gerados | XML e relacionamentos do DOCX, fontes incorporadas, XHTML, metadados EPUB 3 e referências do sumário verificados |
| Open XML SDK 3.5.1 da Microsoft | Zero erros no exemplo principal e nos seis DOCX com fontes distintas, páginas iniciais, sumário, listas, links e formatação de texto |
| Comparação com LibreOffice 26.2.6.3 no Windows | DOCX convertido para PDF; exemplo com 14 páginas nos dois formatos; diferenças de fonte observadas |

Os testes de interface simulam a ponte Tauri e o diálogo de salvamento. Os testes Rust usam conteúdo fictício e bancos SQLite em memória. A geração real de PDF usa o Chromium local, com bloqueio de recursos externos.

Para repetir a suíte de navegador com build estático:

```bash
npx playwright test src/tests/e2e/exportAudit.spec.ts src/tests/e2e/pdfExport.spec.ts \
  --project=chromium --project=firefox
```

Para gerar os arquivos fictícios de comparação:

```bash
cd src-tauri
cargo test --lib export_audit_sample_files -- --ignored --nocapture
```

Os arquivos são escritos em `/tmp/my-book-writer-export-audit` no ambiente desta auditoria: `referencia.pdf`, `livro.docx` e `livro.epub`. A subpasta `word-compatibility/` contém os seis DOCX adicionais. Não são artefatos de livros do usuário.

## Limites identificados

A aproximação do DOCX cobre configurações físicas, hierarquia, formatação e organização das páginas. A paginação e o posicionamento final continuam sendo calculados pelo editor de texto. O sumário DOCX deve ter seus campos atualizados nesse editor.

Na comparação com LibreOffice 26.2.6.3 no Windows, a fonte incorporada ainda foi substituída por Liberation Serif. Isso persistiu após a correção da sequência OOXML e nas cópias de diagnóstico sem sumário, com metadados adicionais e sem ofuscação. A estrutura OOXML e os bytes das fontes passaram nas verificações, mas **não está demonstrada a igualdade visual com o PDF nesse leitor**. Microsoft Word, o editor usado pelo usuário, não pôde ser validado visualmente por não estar disponível neste ambiente. A aprovação estrutural no SDK não certifica aparência ou paginação no Word.

O sumário PDF foi corrigido na complementação: os números são extraídos dos destinos dos capítulos no PDF realmente impresso. A impressão é repetida até que esses números permaneçam estáveis, com erro explícito caso não estabilizem em seis atualizações. O exemplo com 42 capítulos possui quatro páginas de sumário; todos os números impressos coincidem com os links e as páginas dos capítulos.

Imagens incorporadas ao conteúdo em PNG, JPEG, GIF ou WebP e tabelas passam a ser exportadas nos três formatos. As imagens são normalizadas para PNG estático, preservando o primeiro quadro de arquivos animados, e limitadas à área disponível. Não há busca de imagens na rede ou leitura de caminhos arbitrários do disco: imagens externas ou ausentes recebem diagnóstico com o capítulo. São aceitos atributos de dimensão e dimensões CSS em pixels. As tabelas DOCX usam colunas de largura uniforme dentro da área de texto, com células mescladas, tabelas aninhadas, conteúdo formatado e listas; há limites de 128 colunas e 5.000 linhas por tabela. Os dois EPUB de comparação passaram no EPUBCheck 5.4.0 sem erros ou avisos. Word e leitores comerciais de EPUB continuam sem validação visual neste ambiente.

## Complementação: estilos, mídia e paginação

As correções da primeira auditoria já estão na `develop` pelo PR #64. Esta complementação corresponde à solicitação de corrigir as pendências, preservando o workflow de automação como está.

| Pendência | Resultado |
| --- | --- |
| DOCX perdia estilos herdados de blocos pais | Alinhamento, negrito, itálico e demais estilos inline são herdados; estilos explícitos dos filhos prevalecem |
| Listas DOCX eram texto com marcadores | Numeração nativa do Word, listas aninhadas, reinício, início personalizado, valores de itens e parágrafos de continuação |
| Sumário PDF estimava páginas pelo DOM | Destinos reais do PDF impresso, atualização do sumário e nova impressão até estabilizar |
| Imagens bloqueavam a exportação | Incorporação offline nos três formatos, redimensionamento proporcional, texto alternativo e linha que acomoda a imagem no DOCX |
| Tabelas bloqueavam a exportação | HTML/XHTML preservado e tabelas nativas no DOCX, incluindo mesclagem horizontal/vertical, legendas e conteúdo formatado |
| EPUBCheck identificou ID repetido entre idioma e autor | Identificadores de idioma separados dos identificadores de autor, sem alterar os refinamentos de autoria |
| Geração de tabelas emitia atributo OOXML inválido | Remoção de `w:type` em `w:gridCol` e normalização das sequências de propriedades de tabelas e listas |
| Validação de conteúdo com imagens poderia ocupar a tarefa assíncrona | Decodificação e verificação executadas na tarefa nativa bloqueante |

### Verificação desta complementação

| Comando/verificação | Resultado efetivamente observado |
| --- | --- |
| `npx tsc --noEmit` | Passou |
| `npm run lint` | Passou |
| `npm test` | 62 testes passaram |
| `cargo fmt --check` | Passou |
| `cargo check --locked --offline` | Passou |
| `cargo test --lib --locked --offline` | 49 passaram; 4 ignorados na execução padrão |
| `cargo test --lib services::export --locked --offline -- --ignored --nocapture` | Os 4 testes com Chromium real passaram, totalizando 53 testes Rust executados com sucesso |
| Open XML SDK 3.5.1 da Microsoft | Zero erros nos oito DOCX: exemplo principal, seis fontes e exemplo com imagens/tabelas/listas |
| EPUBCheck 5.4.0 | Zero erros e avisos nos dois EPUB fictícios |
| Conferência independente com PyMuPDF | Números impressos, destinos dos links e páginas reais coincidem nos 42 capítulos; sumário ocupa quatro páginas |
| Renderização DOCX pelo LibreOffice | Imagem, tabela mesclada, legenda, formatação herdada e numeração preservadas; substituição de fonte continua observada |

Não houve alteração de frontend nesta complementação; o build e os 56 cenários E2E registrados acima pertencem à etapa inicial. Os validadores da Microsoft e do W3C foram executados localmente em ferramentas temporárias. Nenhum arquivo de livro foi enviado a serviços externos.

Exemplos finais adicionais em `/tmp/my-book-writer-export-fidelity/`: `referencia.pdf`, `livro.docx`, `livro.epub` e `expected-pages.json`. O gerador pode ser repetido com:

```bash
cd /home/rafael/dev/projetos/profissionais/my-book-writer/src-tauri
cargo test --lib rich_exports_use_real_pdf_pages_and_keep_content --locked --offline -- --ignored --nocapture
```

## Git — comandos para revisão e execução

Os comandos abaixo são apenas para as alterações locais desta complementação, partindo da `develop`. Não foram executados commit, push ou criação de PR. O relatório permanece local em `docs/`, diretório ignorado pelo repositório.

```bash
cd /home/rafael/dev/projetos/profissionais/my-book-writer
git checkout -b fix/export-fidelity-media

git add \
  src-tauri/Cargo.lock \
  src-tauri/Cargo.toml \
  src-tauri/src/services/export/audit_tests.rs \
  src-tauri/src/services/export/content.rs \
  src-tauri/src/services/export/devtools.rs \
  src-tauri/src/services/export/docx.rs \
  src-tauri/src/services/export/docx_blocks.rs \
  src-tauri/src/services/export/docx_content.rs \
  src-tauri/src/services/export/docx_front_matter.rs \
  src-tauri/src/services/export/docx_image.rs \
  src-tauri/src/services/export/docx_layout.rs \
  src-tauri/src/services/export/docx_lists.rs \
  src-tauri/src/services/export/docx_package.rs \
  src-tauri/src/services/export/docx_render.rs \
  src-tauri/src/services/export/docx_table.rs \
  src-tauri/src/services/export/docx_xml.rs \
  src-tauri/src/services/export/epub.rs \
  src-tauri/src/services/export/epub_media.rs \
  src-tauri/src/services/export/epub_package.rs \
  src-tauri/src/services/export/fidelity_tests.rs \
  src-tauri/src/services/export/html.rs \
  src-tauri/src/services/export/media.rs \
  src-tauri/src/services/export/mod.rs \
  src-tauri/src/services/export/pdf.rs \
  src-tauri/src/services/export/pdf_toc.rs

git commit -m "fix: preserve export styles, media and exact PDF page numbers"
git push -u origin fix/export-fidelity-media

cat > /tmp/my-book-writer-export-fidelity-pr.md <<'EOF'
## Summary
- Preserve inherited DOCX styles and generate native Word numbering with nested lists, restarts and continuation paragraphs.
- Export embedded images and tables with merged cells across PDF, DOCX and EPUB while keeping resources offline.
- Derive printed PDF table-of-contents numbers from actual chapter destinations and reprint until pagination stabilizes.
- Fix EPUB language/author ID collisions and invalid OOXML table/list properties reported by official validators.

## Validation
- TypeScript and ESLint passed; 62 frontend unit tests passed.
- Rust formatting and compilation passed; 49 regular tests and 4 real Chromium tests passed.
- Microsoft Open XML SDK 3.5.1 reported zero errors on eight generated DOCX files.
- EPUBCheck 5.4.0 reported zero errors and warnings on both sample EPUB files.
- Independently verified all 42 printed TOC page numbers against link destinations and actual chapter pages.
- Rendered DOCX images, tables and numbering with LibreOffice.

## Known limitations
- Microsoft Word and commercial EPUB readers are unavailable for visual validation in this environment.
- LibreOffice still substitutes the embedded font; identical pagination across editors is not certified.
- Embedded GIF/WebP animations are exported as a static first frame. External images must be embedded in the chapter.
EOF

gh pr create \
  --base develop \
  --head fix/export-fidelity-media \
  --title "fix: preserve export styles, media and exact PDF page numbers" \
  --body-file /tmp/my-book-writer-export-fidelity-pr.md
```
