# Protótipo editorial — revisão visual

Este estudo concretiza o [guia de implementação](../guia-implementacao-ui.md) com formas geométricas, linhas, gradientes e nenhuma imagem externa. Não modifica a aplicação Next/Tauri existente.

![Visão geral: entrada, início, biblioteca, formulário, capítulos e editores](./visao-geral.png)

## Abrir a versão navegável

Na raiz do repositório:

```bash
python3 -m http.server 4178 --bind 127.0.0.1
```

Abra [o protótipo local](http://127.0.0.1:4178/src/prototype/index.html). Não basta abrir o HTML por `file://`, porque os módulos JavaScript são carregados pelo servidor HTTP. Os arquivos de fonte são locais em `public/fonts/`; não é necessário acesso à internet.

- Clique nas ações da tela para percorrer os fluxos.
- A barra externa permite escolher qualquer estado, tema e largura da biblioteca.
- Temas Claro/Escuro/Sistema; a preferência do estudo é guardada no navegador, independente das futuras preferências do app.
- Role a biblioteca, os capítulos e o texto; PageUp/PageDown também movem os containers do estudo quando o foco está dentro da tela.
- A seleção de capa demonstra uma segunda composição vetorial, sem enviar arquivo.
- As demais telas usam o enquadramento desktop de 1440 × 960; os layouts de biblioteca também foram desenhados em 1024, 768 e 520 px. Reduzir a janela nas demais telas apenas escala o estudo, não demonstra seu reflow final.

Trilhas sugeridas:

1. Boas-vindas → Continuar offline → Novo livro → Criar livro → Novo capítulo → Criar e escrever.
2. Boas-vindas → Entrar/criar conta → Entrar → Abrir meu livro → capítulo → Paginado → voltar ao livro → Ver livro completo → Exportar.
3. Biblioteca → formato/ordenação/busca; selecionar larguras diferentes na barra externa.
4. Selecionar estados de erro de formulário, falha de salvamento, conflito, falha de catálogo, biblioteca vazia e login sem conexão na barra externa.

Os links de autenticação e exportação **simulam transições**. Não há criação de conta, editor de texto real, processamento de arquivos, acesso SQLite ou geração de PDF. A barra de formatação é uma especificação visual; botões sem efeito de navegação não implementam edição. As telas de diálogo são estudos visuais, não componentes de diálogo HTML prontos para produção. O app futuro deve cumprir acessibilidade, foco e persistência descritos no guia.

## Figma e limite encontrado

[Arquivo criado no Figma](https://www.figma.com/design/JE8tjUMwzyH8V1zaRIvMcm).

O Figma confirmou que o plano Starter atingiu o limite de chamadas da integração durante a construção. Foram criados:

- Fundamentos com paleta, tipografia e orientação de uso.
- 107 variáveis em quatro coleções: primitivos, claro, escuro e escala.
- Dez estilos de texto e um estilo de elevação.
- Componentes de botão (25 variantes), campo (4), badge (3), navegação (2), capa geométrica (4), card de livro e card de capítulo (3).
- 21 frames reservados para telas, ainda vazios. **Não apresentar esses frames como protótipo concluído.**

As cores claras/escuras usam coleções separadas porque o Starter restringiu cada coleção a um modo. A execução foi interrompida antes da montagem e da ligação das telas. O estudo local é a referência visual completa disponível nesta entrega; a montagem nativa navegável no Figma continua pendente de liberação de cota.

## Importar as telas sem depender da integração

Os arquivos em [telas/](./telas/) são SVGs nativos, com texto e vetores, sem `foreignObject` ou imagens base64. O [manifesto](./telas/manifest.json) identifica cada tela, tema e largura.

1. Abra o arquivo Figma e a página **02 · Protótipo & Estados**.
2. Arraste os SVGs desejados para uma área livre, sem sobrepor os frames vazios.
3. Confira as fontes Inter/Merriweather; mantenha o texto editável quando suportado na importação.
4. Organize os frames por fluxo e tema. Use os fundamentos e componentes da página 01 para converter a importação em instâncias reutilizáveis.
5. Na aba Prototype, conecte os botões conforme as trilhas acima e o guia. A importação de SVG não preserva links interativos, auto-layout ou vínculos com os componentes/variáveis criados.

Essa importação é uma alternativa visual, **não equivale** à entrega de componentes conectados e protótipo interativo nativo. Quando a cota estiver disponível, preencher os frames existentes com instâncias, aplicar os tokens, conectar as reações e revisar as capturas.

Para regenerar os SVGs e as imagens PNG após ajustar o estudo:

```bash
# Exportar vetores SVG:
node src/prototype/export-svg.mjs

# Exportar imagens PNG em alta resolução (via Chromium / Playwright):
node src/prototype/export-png.mjs
```

As imagens PNG geradas em alta resolução (94 telas nos temas claro e escuro) ficam disponíveis em [png/](./png/) e também sincronizadas em [telas/](./telas/).

O código do estudo está em `src/prototype/`, separado das rotas da aplicação. Não copiar o renderizador SVG para implementar as telas React: usar o guia, os tokens e os componentes de domínio propostos.

## Validação

Os resultados efetivamente executados estão registrados no guia ao final da entrega. A inspeção do Figma alcançou somente fundamentos e cards de capítulo antes do limite de chamadas; a auditoria completa de componentes e interações nativas ainda está pendente. O estudo não foi executado dentro do Tauri.
