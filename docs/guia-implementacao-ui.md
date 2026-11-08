# Guia de implementação da interface — My Book Writer

> Referência histórica de 27/09/2026, incorporada à documentação versionada em
> 08/11/2026. Para decisões atuais use [frontend-design](frontend-design.md),
> [ui-quality](ui-quality.md) e [SYSTEM_STATE](SYSTEM_STATE.md). Etapas, caminhos
> antigos e estado de ferramentas abaixo retratam a época; não são tarefas novas
> nem evidência de funcionalidades atualmente entregues.

Direção de produto e contrato visual para o Antigravity. Versão de 27/09/2026.

## 1. Como executar este guia

Leia este arquivo, o `AGENTS.md` da raiz e o `AGENTS.md` mais próximo dos arquivos que serão alterados. Inspecione o código atual antes de cada etapa: a fotografia técnica abaixo não substitui essa inspeção.

Implemente um fluxo por vez. Preserve a composição, os textos, as proporções, os tokens e a hierarquia do protótipo. Não transforme a aplicação em um dashboard de métricas. Ao encontrar uma dependência ausente, registre-a e implemente o contrato necessário antes de apresentar a ação como funcional.

- [Arquivo Figma: fundamentos e componentes; montagem das telas pendente](https://www.figma.com/design/JE8tjUMwzyH8V1zaRIvMcm).
- [Fundamentos visuais](https://www.figma.com/design/JE8tjUMwzyH8V1zaRIvMcm?node-id=4-24).
- [Componentes](https://www.figma.com/design/JE8tjUMwzyH8V1zaRIvMcm?node-id=6-55).

**Estado da entrega:** a integração Figma atingiu a cota do plano Starter durante a montagem. O arquivo contém fundamentos, componentes e frames reservados; esses frames ainda estão vazios e não constituem um protótipo navegável. A alternativa local e os SVGs para importação são descritos em `docs/prototipo-ui/README.md`. Não usar os frames vazios como referência de implementação.

O protótipo local demonstra navegação e estados com dados fictícios. Não executa autenticação, digitação de documentos, importação de arquivos, salvamento ou geração de PDF. Os números de páginas, nomes, datas e estados exibidos são exemplos, não resultados do backend. Os critérios deste guia se aplicam à aplicação real.

Ordem de precedência: requisitos explícitos do usuário → regras do projeto → comportamento especificado neste guia → composição do Figma → referências de inspiração. Divergências devem ser resolvidas explicitamente; não modificar regras de domínio para imitar dados de exemplo.

## 2. Direção visual

**Um estúdio editorial calmo, construído com geometria.** Neutros quentes, sálvia, tipografia legível, linhas finas, arcos, círculos e gradientes suaves. A composição deve funcionar integralmente sem fotografias, ilustrações rasterizadas ou imagens remotas.

Decisões do usuário incorporadas:

1. Temas claro e escuro com cores neutras/pastéis.
2. Uso expressivo de formas geométricas, linhas e gradientes.
3. Entrada com duas escolhas visíveis: entrar/criar conta e continuar offline. O primeiro botão tem destaque moderado; ambos têm a mesma dimensão e acesso direto.
4. Início com continuar o último livro, biblioteca e novo livro.
5. Biblioteca em grade uniforme, com busca, filtros, ordenação e criação.
6. Criação de livro em página de formulário, não em modal ou wizard.
7. Menu do livro com cabeçalho fixo e capítulos em área rolável; primeiro card sempre cria capítulo.
8. Editor com modo contínuo e modo paginado sobre o mesmo documento.

### Geometria como linguagem

- Entrada: composição ampla com arcos, círculos concêntricos, linhas paralelas e planos translúcidos; gradiente sálvia → areia.
- Início: um painel geométrico associado ao livro recente e pequenos sinais gráficos nos dois outros caminhos.
- Biblioteca: capas geométricas padrão, com variação determinística a partir do ID do livro; manter a mesma capa entre sessões. Usar SVG/CSS locais, sem requisição externa.
- Cards: borda fina, raio de 12 px, espaçamento consistente e hierarquia por tamanho/peso do texto. Não variar a altura das células como em um mosaico bento.
- Capítulos: destaque tipográfico do número e pequenos divisores; sem imagem e sem arte ocupando a área do título.
- Editor: superfícies uniformes atrás do texto; reservar geometria para ícones, divisores e estados vazios. Não aplicar gradiente atrás dos parágrafos.
- Efeitos decorativos não recebem foco nem anunciam conteúdo a leitores de tela. Preferir `aria-hidden="true"`.
- Gradientes decorativos não comunicam status, seleção ou validação. Essas funções usam tokens semânticos sólidos.

A área de drag and drop da capa continua prevista, mas é **opcional**. A experiência inicial usa a capa geométrica, inclusive quando o usuário não envia arquivo. Não adicionar geração de imagem por IA, banco de imagens ou dependência de CDN.

## 3. Tokens e tipografia

| Token semântico | Claro | Escuro | Aplicação |
| --- | --- | --- | --- |
| `background` | `#F3F2EE` | `#1C1D1B` | Janela e áreas de trabalho |
| `surface` | `#FAF9F6` | `#252723` | Cards, campos, painéis |
| `foreground` | `#292D28` | `#E6E7E1` | Texto principal |
| `muted` | `#64695F` | `#A7ACA1` | Texto secundário legível |
| `primary` | `#52664E` | `#ACBFA4` | Ação principal, seleção e foco |
| `primary-foreground` | `#FFFFFF` | `#1C2519` | Texto sobre ação primária |
| `primary-hover` | `#435840` | `#BED0B7` | Hover da primária |
| `primary-soft` | `#E6EBDD` | `#333E2F` | Seleção e apoio visual |
| `border` | `#D6D9D0` | `#42463E` | Divisores decorativos e cards |
| `control-border` | `#818779` | `#79816F` | Limites de inputs e controles |
| `success` | `#426A51` | `#A5C6AC` | Confirmação persistida |
| `success-soft` | `#E9F0E9` | `#2F3C31` | Fundo de confirmação |
| `warning` | `#866021` | `#D9BD83` | Revisão e atenção |
| `warning-soft` | `#F3ECDE` | `#403A2A` | Fundo de atenção |
| `danger` | `#A04444` | `#DFA3A0` | Erro e exclusão |
| `danger-soft` | `#F7E8E5` | `#422F2E` | Fundo de erro |
| `paper` | `#FAF9F6` | `#FAF9F6` | Simulação da impressão |
| `ink` | `#292D28` | `#292D28` | Texto sobre papel de impressão |

Pastéis decorativos compartilhados: `cover-sage = #CBD4BF`, `cover-clay = #D8B8A6`, `cover-blue = #BBCBD1`, `cover-sand = #E4D8BC`. Gradientes usam pares desses tokens; a tipografia sobre eles usa `ink`. São arte decorativa, não estados de negócio.

Mapear os tokens em `src/app/globals.css` com Tailwind v4 e variáveis semânticas. Usar `@theme inline` quando os utilitários referenciarem variáveis alteradas por `[data-theme]`. Componentes consomem tokens; não espalhar hexadecimais pelo JSX.

No Figma Starter há coleções separadas `MBW · Claro` e `MBW · Escuro`, pois a conta limita cada coleção a um modo. Na aplicação, usar uma única API de tokens e substituir seus valores por tema.

### Fonte e escala

- Interface: **Inter**, Regular e Bold, já disponível em `public/fonts/inter/`.
- Títulos editoriais e documento demonstrativo: **Merriweather**, Regular e Bold, disponível em `public/fonts/merriweather/`.
- Usar arquivos locais e pesos realmente empacotados. Não buscar Google Fonts em runtime. A família do documento deve vir do preset escolhido no catálogo.
- Legendas: 12/18 px. Rótulos: 13/20 px em negrito. Corpo da UI: 14/22 px. Descrições: 16/26 px.
- Títulos da tela: 32/44 px. Chamada da entrada: 44/60 px. Título do capítulo: 28/40 px.
- Modo contínuo: tamanho inicial de leitura de 18 px e entrelinha de 32 px; largura aproximada de 62–72 caracteres. Esse tamanho de conforto é uma preferência visual, não altera `font_size_pt` do livro.
- Modo paginado: aplicar fonte, tamanho em pontos, entrelinha e margens do livro; o zoom muda a escala visual, não a diagramação.
- Espaçamento: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 e 96 px.
- Controles: botão 44 px, input 48 px, raio 8 px. Cards 12 px. Painéis maiores 16 px.
- Ícones vetoriais com traço de aproximadamente 1,6 px, normalmente 20 px. Um único repertório visual em todo o produto.

### Temas e contraste

Opções de preferência: Claro, Escuro e Sistema. Persistir localmente; com Sistema, reagir à mudança do sistema operacional. Aplicar antes de pintar a interface para evitar flash de tema incorreto, sem depender de SSR. `useTheme` expõe a preferência e o tema efetivo.

O tema da interface não altera o PDF. No editor contínuo, a área de leitura acompanha o tema. No paginado, a folha de impressão usa `paper/ink` nos dois temas, com a interface ao redor escura quando selecionada. O usuário escolhe o modo contínuo se preferir uma área de leitura inteiramente escura.

Validar contraste dos pares efetivamente renderizados: texto normal ≥ 4,5:1; texto grande e limites essenciais de controles ≥ 3:1. Não usar o token de divisor decorativo para substituir a borda de um campo. Estados usam texto/ícone junto da cor; foco tem anel visível e não depende de hover.

## 4. Navegação e layout da janela

Fluxo principal: entrada → autenticação **ou** perfil local → início → biblioteca/novo livro/menu do último livro → menu do livro → capítulo/editor. Configurações, leitura integral e exportação partem do menu do livro.

O botão “Continuar escrevendo” leva ao **menu do livro mais recentemente editado**, conforme o fluxo solicitado. O usuário escolhe o capítulo ali. Não pular diretamente para um capítulo neste primeiro desenho.

Depois da primeira escolha, reabrir no início; não repetir a entrada em toda inicialização. A existência do perfil local criado automaticamente não prova que o onboarding foi concluído: registrar essa preferência separadamente.

Base desktop: 1440 × 960 px. Cabeçalho global de 72 px; navegação lateral de 208 px; conteúdo com margem de 48 px. Em janelas menores, reduzir margem para 24/16 px e recolher a lateral em navegação compacta com rótulos acessíveis.

### Rotas compatíveis com export estático

| Rota proposta | Componentes | Responsabilidade |
| --- | --- | --- |
| `/` | `src/components/entry/` | Resolver estado inicial e navegar |
| `/welcome` | `src/components/welcome/` | Duas opções de entrada |
| `/auth` | `src/components/auth/` | Entrar/criar conta |
| `/home` | `src/components/home/` | Três caminhos principais |
| `/library` | `src/components/library/` | Busca, filtro, ordenação e grade |
| `/books/new` | `src/components/books/new/` | Criar livro |
| `/books/view?bookId=…` | `src/components/books/view/` | Menu do livro |
| `/books/settings?bookId=…` | `src/components/books/settings/` | Editar metadados e diagramação |
| `/editor?bookId=…&chapterId=…` | `src/components/editor/` | Editar um capítulo |
| `/books/preview?bookId=…` | `src/components/books/preview/` | Ler o livro integral |

São caminhos de contrato, não arquivos já criados. Usar query parameters para IDs criados em runtime evita depender de rotas dinâmicas que precisariam ser enumeradas no build. Ler parâmetros em um componente cliente, com `Suspense` quando exigido pelo build do App Router. Tratar IDs ausentes, inválidos, excluídos ou de outro livro. Não usar Server Actions, API Routes, SSR ou servidor Next permanente.

Cada `page.tsx` apenas compõe o `Main` da rota, idealmente em menos de 15 linhas. Todo `.tsx` tem no máximo 70 linhas reais e legíveis; extrair responsabilidades, não compactar JSX.

## 5. Especificação das telas

### 5.1 Entrada, conta e uso offline

Layout de duas áreas: manifestação geométrica à esquerda, escolhas à direita. Marca no topo; tema disponível. Texto: “Toda história começa com espaço.” Apoio: “Escreva no seu ritmo. Seus livros ficam neste dispositivo.”

Botões empilhados, ambos com 44–48 px e largura igual:

- Primário: **Entrar ou criar conta** → tela com alternância Entrar/Criar conta.
- Outline: **Continuar offline** → carrega o perfil local e vai ao início. Sem e-mail obrigatório, modal de insistência ou bloqueio.

Autenticação proposta: e-mail e senha; criação inclui nome de exibição e confirmação de senha. Não inventar provedores sociais. Prever carregamento, credenciais inválidas e ausência de conexão, preservando o acesso offline na própria tela. Senha usa `autocomplete` adequado e controle acessível de visibilidade.

Login/sincronização são nova demanda em relação ao escopo inicial registrado em `docs/architecture/README.md`. Não há backend de conta no código inspecionado. Projetar o fluxo agora; implementar o serviço real em etapa explícita. Até lá, não apresentar sucesso de login falso, nem guardar senha em SQLite/localStorage. Uma integração ainda indisponível deve ser identificada como tal, mantendo o caminho local utilizável.

Perfil local e conta online são conceitos diferentes. Entrar não cria uma segunda biblioteca nem apaga livros locais. A associação dos dados e a resolução de conflitos exigem contrato de sincronização próprio. Expiração da sessão não bloqueia a escrita local.

### 5.2 Início

Saudação com o nome real de `useProfile`; no exemplo, “Bom dia, Helena.” Três caminhos:

1. **Continuar escrevendo**: card amplo com capa geométrica, título, autor e última alteração. Abrir menu do livro.
2. **Todos os livros**: card secundário para biblioteca, com contagem real quando disponível.
3. **Novo livro**: card secundário para o formulário de criação.

Sem livros: omitir o card de continuação e destacar a criação. Não exibir um livro fictício nem uma ação desabilitada ocupando metade da tela. Um livro sem capítulos ainda pode ser o último livro e abrir seu menu vazio.

Definir “último alterado” considerando alterações dos capítulos, não só `books.updated_at`. O backend atual não propaga a edição do capítulo ao timestamp do livro. Criar consulta/serviço agregado ou atualizar esse timestamp na mesma transação, com desempate estável. Não confundir “último aberto” com “último editado”.

### 5.3 Biblioteca

Título, quantidade de livros e botão **Novo livro** acima da barra de ferramentas. Busca por título/autor, filtro por formato e ordenação. Opções de ordenação: última alteração (padrão), título A–Z, título Z–A e criação mais recente. Não oferecer gênero, favoritos ou status editorial do livro sem dados de domínio que os sustentem.

Filtrar e ordenar localmente sem conexão; comparação textual amigável ao português e sem sensibilidade a acentos. Mostrar número de resultados e ação **Limpar filtros**. Diferenciar biblioteca vazia de nenhum resultado.

Grade com largura mínima de card de aproximadamente 240 px, gap de 24 px e no máximo quatro colunas no enquadramento base. Calcular pela largura **disponível no conteúdo**, descontando a lateral. Exemplo: `repeat(auto-fill, minmax(min(100%, 15rem), 1fr))`, limitado pelo container. Usar `auto-fill` para um único livro não se esticar até ocupar toda a linha. Em telas largas, limitar a largura do conteúdo.

Referência de adaptação: quatro colunas em 1440 px; três ou duas perto de 1024 px, conforme a lateral recolhida; duas perto de 768 px; uma abaixo de aproximadamente 560 px. Filtros quebram de linha e não causam rolagem horizontal.

Card: capa vetorial de altura uniforme; título até duas linhas com acesso ao título completo; autor; formato e fonte; atualização. Área de abertura usa um link/ação semântica. Se houver menu de ações, ele fica separado, sem botão dentro de botão. A imagem enviada, quando implementada, deve preservar proporção; a capa geométrica permanece como fallback.

### 5.4 Novo livro e configurações

Página comum, com título, descrição curta e formulário em uma coluna principal; painel da capa à direita em janela ampla. Em janela estreita, capa vai abaixo dos campos. Não criar etapas de wizard.

Campos de criação:

- Título obrigatório, com `trim` e erro junto ao campo.
- Autor obrigatório, inicialmente preenchido com o perfil; editável para pseudônimo.
- Formato obrigatório: opções ativas de `useCatalog`.
- Fonte obrigatória: presets ativos de `useCatalog`, com amostra local.
- Capa opcional: padrão geométrico já visível; área “Arraste uma capa ou escolha um arquivo”. Botão acessível funciona sem arrastar.
- Seção expansível de diagramação: tamanho da fonte, entrelinha e quatro margens com unidades explícitas.

Manter os defaults existentes do serviço: 11 pt, entrelinha 1,4 e margens de 20 mm; não alterar o contrato silenciosamente para copiar a escala visual do editor contínuo. Formato/fonte devem vir de entradas válidas do catálogo, não de IDs inventados.

Não incluir sinopse nesta primeira tela: `CreateBookInput` declara o campo, mas o modelo `Book`, a leitura e a atualização ainda não formam um contrato completo de edição de sinopse. Não adicionar gênero, ISBN, tags ou subtítulo sem escopo explícito.

Rodapé do formulário: **Cancelar** e **Criar livro**; em edição: **Cancelar** e **Salvar alterações**. Confirmar descarte apenas quando houver alterações não persistidas. Após criar, ir ao menu vazio do novo livro; ao voltar à biblioteca, o registro já aparece sem recarregar a aplicação.

Validação: título/autor não vazios, formato/fonte válidos, tamanho/entrelinha positivos, margens não negativas e soma das margens menor que a dimensão da página. Converter mm → µm com inteiros (`20 mm = 20000 µm`). Revalidar no Rust.

Importação da capa: validar PNG/JPEG/WebP e limite de 25 MiB, coerente com o teto do serviço. Validar conteúdo real do arquivo no serviço, não só extensão/MIME informado. O livro precisa existir antes de importar a imagem, pois `ImportImageInput` requer `book_id`. Fluxo: criar livro → importar arquivo → associar com `setBookCardImage` → atualizar estado local. Se a capa falhar, manter o livro criado e oferecer tentar novamente sem duplicá-lo. Reverter preview temporário ao cancelar e revogar Object URLs.

Nas configurações, reutilizar `BookForm` e mudar intenção/valores iniciais. Formatos/fontes inativos usados por livros antigos continuam visíveis como valor atual. Remover capa usa `setBookCardImage(bookId, null)`, não pressupor que `UpdateBookInput` distingue campo ausente de `null`.

### 5.5 Menu do livro

Topo persistente: voltar à biblioteca, título e autor; ações **Configurações**, **Ver livro completo** e **Exportar**. Metadados discretos: formato, fonte, capítulos e páginas estimadas quando calculadas.

Somente o container de capítulos rola; usar `min-height: 0`, espaço flexível e `overflow-y: auto`. Cabeçalho e ações ficam fora desse container. Em janelas estreitas, ações quebram de linha sem ocultar exportação.

O primeiro card é sempre **Novo capítulo**, antes dos capítulos em qualquer tamanho de janela. Demais cards mostram número em destaque, nome e páginas. Número é a posição de exibição + 1, formatada como 01, 02 etc.; `position` começa em zero e não é o ID.

Card de capítulo abre o editor. Criar capítulo pode usar um diálogo curto de título, com foco inicial, Escape, contenção de foco e retorno ao acionador. Persistir primeiro e abrir o editor com o novo ID. O diálogo não se aplica à criação de livro.

Sem capítulos: mostrar o card de criação e orientação breve. Não chamar página ainda não calculada de “0 páginas”. Usar “Calculando…” ou “Páginas indisponíveis”, e “N páginas estimadas” quando a aproximação estiver disponível. O título de capítulo longo não pode encobrir o número ou a contagem.

Badges de revisão são opcionais e dependem de `ReviewProgress`. `needs_recheck` aparece como **Rever trecho**. Não inferir “100% revisado” apenas por existir uma marcação de progresso.

### 5.6 Editor — prioridade máxima

Estrutura: cabeçalho compacto com voltar ao livro, identificação de capítulo e salvamento; barra de formatação abaixo; sumário recolhível à esquerda; área de escrita central; barra inferior com contagem e escala. Não manter a navegação global inteira ocupando espaço dentro do editor.

Barra inicial: estilo de parágrafo/título, fonte do livro, negrito, itálico, alinhamento, lista, desfazer/refazer. Controles adicionais de imagens, notas e revisão entram apenas com suporte real do documento. As referências de editor com IA inspiram a organização da barra, não autorizam implementar IA.

Alternador sempre visível: **Contínuo** | **Paginado**. Troca preserva conteúdo, histórico de desfazer, seleção/posição quando possível e revisão persistida. Não criar dois documentos nem converter texto em imagem. Preferência é por usuário/dispositivo; não deve marcar o livro como editado.

**Contínuo:** uma coluna, superfície que acompanha o tema, largura confortável, altura crescente e rolagem vertical. Sem cortes artificiais de página. “Rolagem infinita” significa documento que cresce naturalmente, não feed remoto ou carregamento infinito de cards.

**Paginado:** páginas com proporção do formato físico escolhido, margens visíveis pela área em branco, espaço entre folhas e número da página. Para 14 × 21 cm, manter proporção 2:3. Ajustar à largura ou usar zoom; não deformar a folha. Texto respeita pontos tipográficos e margens do livro. Oferecer uma página por linha por padrão e duas lado a lado apenas quando couberem.

Escolher/provar o motor de texto rico antes de consolidar o schema JSON. Fazer uma prova pequena com salvar/reabrir, seleção, desfazer, colar conteúdo, título, lista e troca de modo. Não usar uma coleção de `contenteditable` independentes para cada página. Paginação é uma projeção do documento canônico, não uma divisão destrutiva do conteúdo.

`chapters.content_json` continua a fonte única. O JSON inicial do serviço é `{"version":1,"type":"doc","blocks":[]}`; não presumir compatibilidade direta com um editor de terceiros. Implementar adaptador e migração/versionamento quando necessário.

Autosave: agrupar alterações com debounce curto (proposta: 500–800 ms), serializar as gravações por capítulo e usar `expectedRevision`. Digitação não espera a chamada nativa; o texto em memória pode estar pendente, mas a mensagem de sucesso só aparece após confirmação do SQLite. Atualizar a revisão a cada retorno. Mudança durante uma gravação agenda a próxima, sem perder caracteres.

Estados: **Alterações pendentes**, **Salvando…**, **Salvo neste dispositivo**, **Falha ao salvar — tentar novamente** e **Conflito de edição**. Um ícone de nuvem não substitui o estado de persistência local. Erro mantém o texto em memória e oferece recuperação; conflito não sobrescreve a revisão nova. Antes de trocar capítulo/rota ou fechar a janela, concluir gravações pendentes ou apresentar a falha e uma escolha de recuperação.

Contagem de páginas é derivada de conteúdo + formato + fonte + tamanho + entrelinha + margens. Invalidar o cálculo quando qualquer entrada mudar. Cache deve incluir revisão e configuração de layout. Não usar divisão fixa de caracteres para prometer paginação final.

A aproximação do modo paginado deve ser explicitada até existir equivalência com o exportador. Provar quebras de parágrafo, notas extensas, listas, fontes e ilustrações; só então afirmar fidelidade ao PDF.

### 5.7 Livro completo e exportação

**Ver livro completo** abre uma visualização somente leitura, capítulos na ordem, sumário e navegação entre páginas. Consome a mesma interpretação do documento do editor; não concatena HTML não validado. Não alterar revisões ao ler.

**Exportar** abre diálogo com PDF como formato inicial, formato físico, nome de arquivo e destino. Estados: preparar, gerar, concluído e falha. A ação concluída pode abrir a pasta/arquivo real pelo serviço nativo. No protótipo isso é somente uma simulação visual.

Não expor EPUB/DOCX como ações habilitadas sem exportador. Exportar exige serviço Rust/nativo ainda ausente e deve funcionar offline. Fonte e métricas precisam ser empacotadas e coerentes com a paginação. Tema escuro não altera papel/tinta do PDF. Não impor bloqueio por alterações de revisão pendentes sem decisão de produto: essa regra consta como proposta não confirmada no documento de arquitetura.

## 6. Componentes e responsabilidades

| Camada | Construir/reutilizar | Responsabilidade |
| --- | --- | --- |
| `components/ui` | Button, Input, Select, Dialog, Card, Badge, Tabs, Spinner | Acessibilidade e aparência genérica |
| `components/shared` | AppHeader, Sidebar, ThemeControl, GeometricCover, BookForm | Elementos de aplicação com reúso real |
| `components/welcome` | Main, WelcomeArtwork, EntryChoices | Entrada |
| `components/home` | Main, Greeting, ContinueBookCard, ActionCards | Menu principal |
| `components/library` | Main, Header, Toolbar, BookGrid, BookCard, EmptyState | Biblioteca |
| `components/books/new` | Main | Orquestrar criação com BookForm |
| `components/books/settings` | Main | Orquestrar edição com BookForm |
| `components/books/view` | Main, BookHeader, ChapterGrid, ChapterCard, NewChapterCard, CreateChapterDialog | Menu do livro |
| `components/editor` | Main, Header, Toolbar, Outline, ModeControl, ContinuousView, PaginatedView, SaveStatus | Composição do editor |
| `hooks` | Dados, formulários, seleção, autosave, tema e paginação | Estado e efeitos React |
| `lib/api` | Wrappers Tauri existentes | Integração nativa |
| `lib/editor` | Adaptador do motor, serialização e paginação | Infraestrutura de edição |
| `utils` | Comparação, filtro, formatação de unidades/datas | Funções puras |
| `types` | Contratos compartilhados | Tipos sem duplicação |

Não extrair componente para `shared` apenas porque pode ser reutilizado no futuro. Não colocar lógica de SQL, sistema de arquivos, sincronização, importação nativa ou chamadas `invoke` em componentes visuais.

Primitivos: Button tem primary, secondary, outline, ghost, danger, foco, hover, disabled e loading. Input/Select têm label, ajuda, erro e associação ARIA. Dialog precisa de foco contido, nome acessível, Escape, restauração de foco e ação de fechar. Dropzone também funciona com teclado. Não usar placeholder como rótulo.

## 7. Estado real do projeto e lacunas

Inspeção local desta entrega; arquivos em desenvolvimento não foram alterados.

| Recurso | Evidência atual | Próximo passo |
| --- | --- | --- |
| Livros | `src/hooks/useBooks.ts` implementado; wrappers em `src/lib/api/books.ts` | Reutilizar e garantir estado compartilhado/atualização entre rotas |
| Perfil, catálogo, tema | `useProfile.ts`, `useCatalog.ts`, `useTheme.ts` existem com zero linhas | Implementar antes das telas dependentes |
| Perfil/catálogo nativos | Wrappers `profile.ts`, `catalog.ts`; serviços Rust correspondentes | Conectar hooks, loading, erro e retry |
| Capítulos | Wrappers e CRUD Rust presentes; gravação usa revisão esperada | Criar hooks e adaptar o editor ao JSON |
| Imagens | Importação, listagem, caminho e associação de capa presentes | Hook de capa, preview, validação e recuperação de falhas |
| Revisão | Wrappers e serviços presentes | Integrar transações/âncoras ao editor; presença de API não prova remapeamento correto |
| Último livro editado | Gravação do capítulo atualiza o capítulo, não `books.updated_at` | Consulta agregada ou atualização transacional |
| Paginação | Sem contador em `ChapterSummary` e sem motor identificado | Serviço derivado e cache invalidável |
| Exportação PDF | Nenhum comando/exportador identificado | Implementar serviço nativo e validação física |
| Login/sync | Fora do escopo inicial; sem implementação identificada | Contratos de identidade, sessão e sincronização separados |
| Preferências | Sem hook de tema ou contrato de onboarding implementado | Persistência local de tema, entrada e modo de leitura |
| Fontes | Inter, Merriweather e outras famílias em `public/fonts/` | Carregar localmente; conferir manifestos e licença para distribuição |

Cada instância de `useBooks` mantém seu próprio estado. Montar o hook em duas telas não sincroniza seus arrays automaticamente. Definir provider/estado compartilhado ou revalidação explícita; após mutação, outras visualizações não podem permanecer obsoletas. Tratar troca de perfil e respostas atrasadas.

Fluxo de domínio: componente → hook → wrapper Tauri → comando → serviço Rust → SQLite → confirmação/estado local → sincronização futura. O frontend nunca acessa MySQL. Falhas remotas não bloqueiam criação, edição ou leitura local.

O serviço atual de imagem escreve diretamente no disco antes do registro; a estratégia de temporário/limpeza descrita na arquitetura ainda precisa ser conferida/implementada. A gravação de capítulos valida JSON sintático; isso não comprova schema, referências e atomicidade com comentários/revisão. Testar esses contratos antes de anunciar funcionalidades avançadas de revisão.

## 8. Etapas de implementação e aceite

### Etapa A — fundação e navegação local

Implementar tokens, fontes locais, tema, primitives e shell. Completar hooks de perfil/catálogo. Entrada offline e rotas estáticas funcionando.

Aceite: abrir sem internet; escolher offline sem cadastrar conta; preferência de tema sobreviver ao reinício; navegar por teclado; nenhuma rota exigir servidor Next.

### Etapa B — biblioteca e livros

Implementar início, biblioteca, busca, filtro, ordenação, criação, configurações e capa geométrica padrão. Depois integrar importação opcional.

Aceite: criar e reabrir livro real; valores persistidos; erros sem perda do formulário; sem duplicidade após falha da capa; grid em 1440, 1024, 768 e 520 px; título longo; nenhum resultado distinto de biblioteca vazia.

### Etapa C — capítulos e editor contínuo

Implementar menu do livro, criação de capítulo, prova do editor e autosave com revisão. Editor contínuo utilizável antes de paginação sofisticada.

Aceite: cabeçalho não rolar com cards; primeiro card criar capítulo; escrever offline, aguardar confirmação, fechar/reabrir e recuperar texto/formatos; simular falha e conflito sem sobrescrita silenciosa.

### Etapa D — paginação, leitura e PDF

Mesmo documento nos dois modos; contagem derivada; prévia integral; exportador real.

Aceite: alternar modo sem perder seleção/conteúdo; comparar a paginação com arquivo exportado; validar dimensões, margens, acentos, fontes, notas/imagens quando suportadas; tema não modificar PDF.

### Etapa E — conta e sincronização

Integrar o desenho de autenticação a um backend real. Projetar sessão, fila persistente, reenvio, conflitos e transferência de arquivos. As telas de conta podem ser prototipadas antes, mas não equivalem à implementação dessa etapa.

Aceite: sessão expirada/sem rede não bloquear trabalho; associação de conta preservar biblioteca local; não mostrar “sincronizado” antes da confirmação remota.

## 9. Verificação da implementação futura

Executar checks relevantes em cada etapa e registrar resultados reais:

- `npx tsc --noEmit` e `npm run build` para alterações frontend.
- Configurar/corrigir lint antes de contar com ele: o script atual é `next lint`, não há dependência ESLint declarada no `package.json` inspecionado. Não registrar lint como aprovado sem execução válida.
- Conferir todo `.tsx` com limite de 70 linhas, arquivos de rota mínimos, ausência de `any` injustificado e de lógica nativa nos componentes.
- Se alterar Rust: seguir `src-tauri/AGENTS.md` e executar os checks exigidos para a mudança.
- Testar em `npm run tauri dev`; uma prévia web sem bridge Tauri não prova SQLite, arquivos ou funcionamento nativo.
- Testar teclado, Tab/Shift+Tab, Escape, foco após navegação, contraste nos dois temas, estado loading, erro/retry, nomes longos e catálogo vazio.
- Comparar capturas com os frames do Figma nas larguras propostas. Verificar reflow a 200% e evitar texto sob botões, barras sobre conteúdo e rolagem horizontal da janela.
- Testes de comportamento: filtro + ordenação combinados; autosave durante digitação rápida e troca de capítulo; conflito de revisão; criação com falha de capa; contagem invalidada após alterar margens/fonte.

Não criar testes que apenas repitam classes CSS. Não apresentar dados mockados como persistidos. Não afirmar build, teste, lint ou teste manual que não foi executado.

## 10. Referências fornecidas e uso pretendido

As referências orientam composição, não autorizam copiar branding, imagens ou conteúdo. Algumas páginas forneceram somente texto/metadados; quatro links Dribbble e a imagem do TechTudo falharam na leitura web. A composição deste estudo é própria, baseada também nas descrições explícitas do usuário; não é uma reprodução visual verificada dessas imagens.

| Área | Referência | O que orientar |
| --- | --- | --- |
| Entrada | [Finnger](https://dribbble.com/shots/24282453-Finnger-Login-Page-Illustration) | Distribuição entre identidade visual e ações |
| Entrada | [Welcome page](https://dribbble.com/shots/25641219-Login-page-UX-UI-design-Welcome-page) | Acolhimento; página não recuperada pela leitura web |
| Entrada | [Readventure](https://dribbble.com/shots/26276211-Readventure-Whimsical-Login-Page-for-Kids-Story-App) | Separação entre área expressiva e formulário; adaptar para público adulto e arte geométrica |
| Início | [Choose campaign type](https://dribbble.com/shots/26168856-Choose-campaign-type) | Escolhas claras em cards; página não recuperada |
| Biblioteca | [Article Cards](https://dribbble.com/shots/4704119-Article-Cards) | Hierarquia de capa, título e metadados |
| Biblioteca | [Article card design](https://dribbble.com/shots/27133209-Article-card-design) | Referência fornecida; página não recuperada |
| Biblioteca | [Property Card](https://dribbble.com/shots/26981633-Property-Card-Component-for-Rentischeap-Platform) | Agrupamento de informações |
| Biblioteca | [Bento portfolio](https://dribbble.com/shots/22551818-Bento-portfolio-page-design) | Relação entre superfícies claras/escuras; conservar grade uniforme de livros |
| Formulário | [Rebate Experience](https://dribbble.com/shots/18510038-Rebate-Experience) | Campos claros em uma tela e ações consistentes |
| Formulário | [Vehicle Inspection](https://dribbble.com/shots/26613566-Vehicle-Inspection-Form) | Organização de campos; página não recuperada |
| Capa | [File Uploader / Tetrisly](https://dribbble.com/shots/20483900-File-Uploader-Modals-Tetrisly-Design-System) | Estado de arraste e seleção de arquivo |
| Menu do livro | [Task Management](https://dribbble.com/shots/25241984-Task-Management-Dashboard) | Cabeçalho, ações e área organizada |
| Menu do livro | [EasyProperty](https://dribbble.com/shots/27113838-EasyProperty-Agentic-Dashboard) | Separação de navegação e conteúdo |
| Editor | [AI Rich Text Editor](https://dribbble.com/shots/24870136-AI-Rich-Text-Editor-WYSIWYG-Editor) | Organização da barra; IA fora do escopo |
| Editor | [Rich text editor component 01](https://dribbble.com/shots/26038053-Rich-text-editor-component-01) | Agrupamento dos controles de edição |
| Paginação | [Imagem Google Livros / TechTudo](https://s2-techtudo.glbimg.com/4UOdC_ZMUESfr85nWuRBYmPor6U=/0x0:1758x861/1000x0/smart/filters:strip_icc%28%29/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2025/u/p/56aJxhTfiRtGlIxV0nWg/google-livros-como-encontrar-livros-5-.jpg) | Metáfora da página física; imagem não recuperada |

## 11. Instrução pronta para o Antigravity

> Leia `docs/guia-implementacao-ui.md`, os `AGENTS.md` aplicáveis e o protótipo Figma vinculado. Comece pela Etapa A, respeitando tokens, fontes locais, composição e linguagem de formas geométricas, linhas e gradientes. Não use imagens externas. Implemente telas pequenas, com máximo de 70 linhas por `.tsx`, rotas apenas composicionais e lógica em hooks/serviços. Preserve o funcionamento offline. Confira as lacunas técnicas antes de conectar ações; não simule sucesso de login, persistência ou exportação no produto. Ao concluir cada etapa, execute as verificações pertinentes, compare visualmente com o Figma e relate o que funciona e o que ainda falta. Não avance para um redesign ou acrescente campos/funcionalidades fora deste guia.

## 12. Validação desta entrega de design/documentação

Esta entrega acrescenta documentação, um protótipo isolado em `src/prototype/` e assets SVG para importação, além do arquivo Figma criado para o estudo. Não altera as rotas, os hooks ou o backend da aplicação. TypeScript, build, lint e execução Tauri não validam o protótipo estático; a revisão final registra os checks documentais, de sintaxe, dos assets e de Figma efetivamente executados.

Verificações executadas:

- `npx tsc --noEmit`: passou.
- `node --check` nos oito módulos JavaScript/MJS do estudo: passou.
- `node src/prototype/export-svg.mjs`: gerou 42 SVGs, incluindo temas e quatro larguras de biblioteca.
- Validação XML dos 42 SVGs, dimensões, IDs únicos, referências de gradiente/clip e ausência de `image`/`foreignObject`: passou.
- Chromium: 44 telas/estados renderizados; nenhum erro JavaScript/recurso ou destino de navegação inexistente no passe final; nenhum texto fora da janela fora das áreas de rolagem intencionais.
- Navegação offline para início vazio, rolagem dos containers e carregamento local de Inter/Merriweather: conferidos no navegador.
- Capturas revisadas: entrada, cadastro, início, biblioteca clara/escura, formulário, capítulos, editor contínuo claro/escuro, editor paginado, livro completo e biblioteca de 520 px. A [visão geral](./prototipo-ui/visao-geral.png) reúne oito dessas capturas.
- Contraste calculado em 14 pares: texto principal, secundário, ação primária, borda de controle, aviso e erro nos dois temas. Todos atingiram os mínimos definidos; menor contraste de texto testado: 4,82:1; menor borda essencial testada: 3,51:1. Isso não substitui uma auditoria de acessibilidade do app implementado.
- Links locais da documentação e `git diff --check`: passaram.
- Nenhum `.tsx` foi criado/alterado; os cinco existentes foram contados e estão abaixo de 70 linhas.
- `npm run lint`: **falhou** porque `next lint` foi interpretado como diretório `.../my-book-writer/lint`, inexistente. A configuração preexistente não foi alterada.
- Build de produção e execução Tauri: **não executados**. O estudo é isolado, sem integração aos dados ou rotas reais.

Limite remanescente: a composição e a ligação das telas dentro do Figma não foram concluídas devido à cota do plano Starter. SVGs importáveis e protótipo local não substituem essa etapa nativa.
