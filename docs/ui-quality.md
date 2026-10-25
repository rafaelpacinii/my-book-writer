# Qualidade de interface

## Objetivo e limites desta entrega

Estabilizar Início, Biblioteca, Novo livro e Configurações no Windows, preservando a identidade editorial e a arquitetura local-first. As URLs públicas não mudam. Os demais espaços do livro mantêm seus layouts; recebem as primitivas compartilhadas de tema, carregamento, botões e foco, mas a revisão completa do editor/paginação/prévia/exportação fica para uma entrega própria.

## Diagnóstico registrado

| Problema / reprodução | Causa encontrada no código anterior | Correção e regressão |
| --- | --- | --- |
| Tema incorreto ao abrir/recarregar ou mudar de tela | Hooks independentes iniciavam em claro e aplicavam a preferência em efeito após a pintura | Script síncrono no head; store compartilhado; teste com JavaScript de hidratação bloqueado |
| Perfil/livros/capas voltam ao carregamento ao retornar pelo menu | AppShell por página e hooks com estado descartado a cada montagem | Layout persistente e recursos compartilhados; testes contam consultas e observam inserção de placeholders na navegação |
| Capas reaparecem antes de estarem prontas | Caches separados em Início/Biblioteca e URL tratada como imagem carregada | Cache comum por livro/asset, decodificação e geometria reservada; testes de reutilização e imagem inválida |
| Skeleton permanente em imagem com erro | Estado final dependia exclusivamente de onLoad | Fallback acessível e botão para recarregar |
| Telas principais com hierarquias diferentes | Cabeçalhos, espaçamentos, ações e cópias implementados por rota | PageContent/PageHeader, primitivas compartilhadas e 16 referências visuais |
| Texto branco em botão de perigo no tema escuro | Fundo de perigo claro compartilhava o foreground branco do tema claro | Token danger-foreground específico por tema; auditoria de contraste |
| Estatísticas sem recuperação após erro | Exceção descartada silenciosamente | Mensagem e retry; atualização preserva os dados anteriores |

As causas acima foram identificadas por inspeção e cobertas por regressões no navegador. O sintoma original no WebView2 ainda depende de confirmação no Windows: não confundir testes com mocks nativos com uma execução real do aplicativo.

## Adaptação da referência editorial

O HTML fornecido em My-Book-Writer-aprimorado orienta a composição e os tokens: menu de 248 px com perfil no topo e cores que acompanham o tema, barra superior de 66 px, títulos EB Garamond, capas verticais 14:21 com lombada e arte geométrica, estágios de 184 px e grade com três colunas no desktop. As fontes são locais; nenhuma dependência de CDN é necessária.

O menu mantém a navegação e as preferências em grupos, com livros recentes no modo expandido e perfil no rodapé. A moldura atual integra menu lateral e barra de título com o mesmo fundo, sem divisórias ou linhas de conexão internas. O modo compacto padrão mede 48 px, igual à altura da barra superior; a expansão opcional mede 216 px e respeita a preferência salva. O conteúdo tem o canto superior esquerdo arredondado para indicar continuidade. Dicas em portal identificam ícones no hover e no foco. Preferências permanece visível em janelas baixas; a lista recente recebe rolagem própria. Controles de logout e ajuda sem função equivalente não foram adicionados.

**Início:** saudação pessoal, um livro recente para retomar e dois atalhos discretos. **Biblioteca:** todo o acervo, busca, formatos, ordenação e grade/lista. O destaque de retomada fica apenas no Início. Em janelas pequenas, o menu vira uma gaveta com foco contido e fechamento por Escape ou seleção.

Na Biblioteca Explorer, Séries usam pilha sequencial de capas e Universos usam um leque aberto. As três posições de capa ficam dentro da área de imagem em grade e lista, inclusive nas larguras 360, 800 e 1440 px. Posições vazias têm preenchimento sólido semitransparente, sem contorno pontilhado. Livros podem manter Série e Universo simultaneamente; Séries podem ser vinculadas a Universos por arrastar ou pelo diálogo acessível, preservando os volumes. Ao remover ou trocar o Universo de uma Série, os livros acompanham essa alteração sem reaparecer no Universo anterior.

Os filtros Todos, Livros, Séries e Universos são independentes do agrupamento visual. Na raiz, uma visão por tipo revela também os itens guardados em coleções; dentro de um Universo, mantém esse escopo. Busca e formato continuam sendo combinados com o tipo, e Limpar filtros restaura Todos. Dentro de uma Série, a sequência dos volumes permanece prioritária. Os controles de busca, seleção, agrupamento e grade/lista compartilham altura, bordas, raios e cores semânticas.

O cabeçalho reúne a criação em um único botão “+”. Seu popover apresenta Livro em destaque e as opções Série e Universo, com ícones Lucide, uso por teclado, fechamento por Escape/clique externo e foco restaurado. Livro recebe a coleção de origem no cadastro; o campo Universo pode ser escolhido diretamente ou herdado da Série. Séries criadas dentro de um Universo recebem esse vínculo. Universos e séries independentes são criados na raiz da Biblioteca.

O componente Select usa o [select nativo personalizável descrito pelo Chrome](https://developer.chrome.com/blog/a-customizable-select?hl=pt-br): `appearance: base-select`, `::picker(select)` e opções com destaque e foco nas cores do projeto. A ativação fica em `@supports`; navegadores sem esse recurso conservam a seleção nativa funcional. Os valores explícitos das opções, labels, estados desabilitados, erros e dicas permanecem acessíveis. As referências visuais incluem o picker aberto e o menu de criação nos temas claro e escuro.

O cadastro atual não possui os estados editoriais fictícios do protótipo. Não mostrar contagens de rascunhos, palavras, progresso ou capítulos inventadas. Os filtros refletem os formatos persistidos; o menu de cada livro oferece abrir, configurar, pré-visualizar e exportar pelas rotas existentes. A retomada abre o detalhe do livro, onde o autor escolhe o capítulo.

Capas personalizadas mantêm a imagem importada; capas automáticas usam uma variante estável por ID. Reordenar ou buscar não muda a identidade visual de um livro, e trocar o tema não muda suas cores. Títulos longos quebram sem estourar a coluna.

## Contratos de UI

- **Barra de título:** a barra de 48 px substitui a decoração do sistema no Tauri e acompanha os temas claro, escuro e sistema desde a primeira pintura. A ordem é logotipo (16 px), nome do aplicativo, abrir/recolher menu, Voltar, Avançar e caminho contextual. A marca permanece visual, sem link, integrada à região de arraste. O controle do menu fica somente na barra, inclusive ao abrir a gaveta em telas pequenas; o nome do aplicativo é ocultado quando necessário para reservar espaço aos controles. A região livre permite arrastar e maximizar/restaurar a janela. Os botões nativos mantêm nomes acessíveis. Conteúdo, gaveta e diálogos respeitam a altura reservada. No navegador, os controles de janela ficam ocultos.
- **Histórico:** Voltar e Avançar percorrem as entradas reais da aplicação, incluindo mudanças de coleção por query string, sem criar entradas extras ao confirmar a saída. Ficam desabilitados quando não existe um destino conhecido naquela direção. O estado é preservado ao recarregar a página e uma nova navegação substitui o ramo de avanço. Os formulários continuam pedindo confirmação para descartar alterações e o editor salva antes de navegar pelos botões.
- **Estrutura:** PageContent ocupa a largura útil da janela, sem teto global de 1390 px. As margens pertencem ao AppShell; limitar leitura, campos e diálogos conforme sua tarefa. PageHeader usa EB Garamond de 40–58 px, descrição de 12 px e área opcional de ações; Home, Biblioteca e Códice compartilham essa hierarquia. WorkspaceGrid e a grade da Biblioteca adaptam a quantidade de colunas à área disponível, com base de 240 px. A tipografia do manuscrito permanece independente. A direção editorial acolhedora foi aprovada em 25/10/2026 e está registrada em [Desenvolvimento do frontend](frontend-design.md).
- **Localização:** o caminho contextual aparece somente na barra de título, inclusive em janelas estreitas. Para livros agrupados, segue `Biblioteca > Universo > Série > Livro > seção`, omitindo agrupadores ausentes; os nomes dos Universos e Séries abrem suas coleções. Os cabeçalhos das páginas mantêm títulos, descrições e ações sem repetir o caminho. Os links da barra preservam a confirmação de alterações não salvas e o salvamento antes da saída do editor; no histórico, o link Editor retorna ao mesmo capítulo. Ações específicas, como Voltar ao editor e Exportar, continuam nos controles das telas.
- **Carregamento inicial:** reservar o espaço do conteúdo e marcar a região com aria-busy. LoadingRegion mostra skeleton pulsante somente após 150 ms; não impõe uma duração mínima. Mostrar feedback somente onde há trabalho assíncrono real.
- **Atualização:** preservar dados existentes enquanto a nova consulta está pendente. Uma navegação para dados disponíveis não deve inserir novos placeholders. Não alterar o tema, o tamanho do menu ou imagens já decodificadas durante a montagem.
- **Falha:** encerrar o estado de carregamento, mostrar uma mensagem compreensível e oferecer recuperação. Uma lista vazia só aparece após uma consulta bem-sucedida. Imagens com falha usam uma capa alternativa e permitem recarregar.
- **Movimento:** tempos e curva compartilhados em `interactions.css`: 120 ms para controles, 180 ms para capas e 200 ms para entrada de diálogos/popovers. O hover pode inverter no meio do percurso e deve terminar sem deixar estilos residuais. A pulsação atua na cor de fundo do skeleton, não no conteúdo. Com prefers-reduced-motion, animações e transições são desativadas. Não adicionar animações de entrada em cada navegação nem atrasar persistência para acompanhar efeitos. O processo de escolha visual e os padrões estão em [Desenvolvimento do frontend](frontend-design.md).
- **Contraste:** texto comum >= 4,5:1; texto grande >= 3:1; limites/indicadores necessários para identificar controles >= 3:1. Avaliar estados normal, hover, foco, selecionado e erro nos dois temas. Bordas decorativas não precisam receber a cor de borda de controles.
- **Acessibilidade:** controles com nome acessível, navegação com aria-current, diálogos nomeados com foco contido/restaurado e possibilidade de usar teclado. Skeletons decorativos ficam fora da árvore acessível; a região anuncia seu estado.

## Dados, invalidação e imagens

SQLite continua sendo a fonte persistente. Os recursos em memória deduplicam consultas, preservam os dados durante atualização e descartam respostas anteriores a uma invalidação/restauração. Os livros são separados por ID de perfil. As funções de API notificam mudanças somente depois da persistência: criar/editar/excluir livro, editar perfil, mudar capa e restaurar backup.

Toda nova operação que modifique esses dados deve publicar a mudança correspondente em src/lib/data/changes.ts. Ao restaurar backup, limpar os recursos anteriores, inclusive imagens e catálogos. As estatísticas também são revalidadas ao abrir Configurações, pois capítulos e versões podem mudar fora das quatro telas.

As capas são identificadas por livro + asset imutável. Uma nova capa cria um novo recurso; salvar uma capa não deve apagar as capas dos outros livros. Reter até 32 recursos de imagens quando não estiverem observados; imagens atualmente montadas permanecem disponíveis. Não colocar dados de livros nem imagens base64 em logs.

## Next.js versus Vite

**Decisão:** manter Next.js nesta entrega. Os problemas encontrados estão ligados à montagem, estados, decodificação e estilos, sem evidência de um bloqueio do framework. Next gera os arquivos estáticos consumidos pelo Tauri; trocar o bundler não troca o WebView2 do Windows nem estabelece automaticamente padrões de UI.

Reabrir a decisão somente com: reprodução mínima usando os mesmos componentes/dados/WebView2; falha ligada ao ciclo de vida ou à saída do Next; tentativa de correção localizada; reprodução equivalente em Vite sem a falha; custo e riscos da migração registrados em um plano separado. Não migrar o motor de edição sem evidência de uma limitação estrutural própria.

Referências: [preferências antes da hidratação](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration), [exportação estática](https://nextjs.org/docs/app/guides/static-exports), [WebViews do Tauri](https://v2.tauri.app/reference/webview-versions/), [contraste WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [WebDriver no Tauri](https://v2.tauri.app/develop/tests/webdriver/manual-setup/).

## Validação e CI

A suíte de navegador usa dados fictícios, nunca o SQLite do usuário. Os cenários cobrem os dois temas em 800×600, 1280×720 e 1440×1000; Início e Biblioteca também passam pela matriz 360, 390, 430, 600, 820, 1024, 1366, 1440 e 1920 px, tema do sistema, movimento reduzido, carregamento lento, erros/retry, navegação repetida, criação de livro e restauração. axe complementa a revisão manual; não certifica todos os critérios de acessibilidade.

`titlebar.spec.ts` cobre a marca antes da hidratação, o espaço disponível, os controles e seus erros recuperáveis. A ponte de janela é simulada nesses testes: as chamadas e os eventos são verificados, mas o arraste e o comportamento do gerenciador de janelas exigem conferência no aplicativo nativo. Ao escolher Sistema, a integração envia `null` à API de tema do Tauri para continuar acompanhando o sistema operacional; escolher um tema explícito prevalece sobre essa preferência.

`workspaceChrome.spec.ts` cobre a moldura contínua, proporção 48 × 48 px, expansão persistida, ausência de divisórias, ordem dos controles e acesso em janelas de 320 a 800 px. Exercita também histórico após recarga, cancelamento/confirmação de descarte e salvamento do editor. `libraryExplorer.spec.ts` verifica Voltar/Avançar entre Universo e Série na mesma rota.

`libraryUniverses.spec.ts` cobre filtros por tipo e escopo, edição de Universo, exclusão com série/volumes/livro avulso sem perda de capítulos, criação contextual de livros, recuperação de erro IPC, seletor personalizável e popover acessível em 320 e 800 px. Os testes de persistência também verificam que livros externos ao Universo excluído permanecem intactos.

`desktopWorkspace.spec.ts` compara o aproveitamento da largura útil, a hierarquia dos cabeçalhos e as colunas de Home/Biblioteca/Códice em 800, 1440 e 2560 px, com a lateral compacta/expandida e nos dois temas. Exercita também busca e retorno dos resultados. `uiMotion.spec.ts` verifica duração curta das transições de capa, ausência de animação com movimento reduzido e uso de diálogos por teclado; `uiHover.spec.ts` verifica o retorno ao estado inicial após movimentos rápidos do ponteiro.

O acompanhamento do histórico também preserva os destinos após remontagens de efeitos e ciclos repetidos de navegação. Funções antigas retidas pelo roteador são desativadas ao desmontar; ao restaurar uma entrada, sua posição é sincronizada antes de atualizar os metadados. Índices corrompidos pela implementação anterior são ignorados na atualização, iniciando uma nova sequência conhecida na página atual. As regressões em `src/lib/navigation/history.test.ts` cobrem a atualização e essas duas ordens de execução, e `historyNavigation.spec.ts` percorre várias páginas em três ciclos de Voltar/Avançar, além dos controles do próprio navegador.

```bash
npm run typecheck
npm run lint
npm run check:ui
npm test
npm run test:e2e
npm run build -- --webpack
```

check:ui verifica todos os TSX, o limite de 70 linhas, tipos any explícitos e composição das rotas. ESLint mantém as regras centrais de Hooks; diagnósticos opcionais do React Compiler não são habilitados para o editor DOM atual. A exceção de exhaustive-deps no hook antigo do editor está documentada na configuração e deve ser revista na etapa do editor.

Para comparar a exportação final, iniciar `npm run preview:static` e executar, em outro terminal:

```bash
MBW_EDITOR_TEST_URL=http://127.0.0.1:3100 npm run test:e2e
```

A suíte padrão compila e serve a exportação estática. Isso testa o formato entregue ao Tauri. No Next 16.3.5, observou-se no modo dev um erro de HMR anterior à inicialização do router durante compilações frias, reproduzido também no código anterior. A fixture continua falhando em qualquer pageerror: nenhum erro de aplicação é filtrado. Para investigar o servidor dev, iniciar npm run dev separadamente e informar sua URL por MBW_EDITOR_TEST_URL.

O preload offline dos testes interrompe apenas a consulta de versão do Next ao registry; não substitui dados nem APIs do aplicativo. A detecção de classes Tailwind limita-se ao src de produção, conforme [a configuração oficial de fontes](https://tailwindcss.com/docs/detecting-classes-in-source-files), evitando examinar protótipos e artifacts.

As referências visuais pertencem ao Chromium/Linux com as fontes locais. As capturas fixam relógio, idioma pt-BR e fuso America/Sao_Paulo para não mudar conforme o dia ou o ambiente de CI. Atualizar somente quando a mudança for intencional, inspecionando cada diferença:

```bash
MBW_EDITOR_TEST_URL=http://127.0.0.1:3100 npm run test:e2e -- uiVisual --project=chromium --update-snapshots=all
```

O workflow .github/workflows/ui-quality.yml executa os checks, build, regressões na exportação e suíte nativa Windows. Ele envia traces, capturas e relatórios como artifacts. Exigir os jobs como checks obrigatórios depende da configuração de proteção da branch no GitHub; este trabalho não altera essa configuração.

## Windows real: execução e aceite de release

Instalar Rust/MSVC, WebView2, tauri-driver e msedgedriver compatível com a versão do Edge. O workflow instala o driver correspondente automaticamente. Em PowerShell, preparar e executar:

```powershell
npm ci
npx playwright install chromium
cargo install tauri-driver --locked
$env:CARGO_TARGET_DIR = "$PWD/src-tauri/target/ui-tests"
npm run tauri build -- --no-bundle --config src-tauri/tauri.ui-test.conf.json
npm run test:native
```

Se msedgedriver não estiver no PATH, definir MBW_EDGE_DRIVER com o caminho do executável. O build usa identificador exclusivo com sufixo ui-tests e diretório de saída separado. Antes de criar qualquer livro, a suíte consulta o caminho real do SQLite e recusa escrever se não estiver no diretório isolado.

A suíte usa arquivos de produção no WebView2 real, cria um livro pela interface, navega nos dois temas, registra capturas em três tamanhos e reabre o aplicativo para conferir persistência. O arquivo runtime.json registra user-agent e escala real; não simula uma escala que o Windows não está usando.

Antes de liberar a versão:

- [ ] Executar a suíte Windows e revisar seus artifacts.
- [ ] Repetir em escala real de 100%, 125% e 150%, reiniciando o aplicativo após mudar a configuração de tela. Registrar os resultados separadamente; alterar deviceScaleFactor no navegador não substitui DPI do Windows.
- [ ] Instalar o pacote e repetir primeira abertura, retornar às páginas, minimizar/restaurar e trocar de monitor.
- [ ] Na barra integrada, conferir arraste, duplo clique, minimizar, maximizar/restaurar e fechar; trocar entre Claro, Escuro e Sistema e reabrir o aplicativo para conferir o tema salvo.
- [ ] Desconectar a internet e verificar criação, edição, salvamento e reabertura de livros.
- [ ] Conferir contraste em hover/foco/seleção e navegação de teclado nos diálogos e campos.

A execução nativa, a instalação e a matriz de DPI não foram realizadas neste ambiente Linux. A automação está preparada; o aceite Windows depende dessas verificações.

## Atualização das regressões existentes

A prévia já inclui páginas de abertura antes do primeiro capítulo; os testes selecionam o capítulo pelo sumário quando essa é a intenção. A exportação já oferece vários formatos e usa as mensagens genéricas atuais. Os cenários do editor salvam por Ctrl+S e abrem Exportar pelo menu do livro; o cabeçalho atual não contém o antigo botão Exportar. O mock inclui a consulta de versões usada pelo editor. Os testes continuam verificando o texto salvo, concorrência durante salvamento, falha recuperável e ausência de pageerror.

## Próxima expansão

Aplicar os mesmos contratos ao detalhe/configurações do livro, histórico, editor, prévia e exportação, em mudanças separadas. Antes de alterar paginação ou o motor de edição, conservar a suíte atual de cursor, conteúdo, desfazer/refazer e PDF. Revisar papel/contraste, seleção, zoom e equivalência da exportação em casos próprios; não tratar essa revisão como concluída pela padronização das quatro telas.
