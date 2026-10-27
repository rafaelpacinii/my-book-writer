# Desenvolvimento do frontend — My Book Writer

Contrato de UX/UI para o agente e para quem desenvolve o frontend. Leia junto de [src/AGENTS.md](../src/AGENTS.md) e dos [critérios de qualidade](ui-quality.md). Decisões explícitas do usuário prevalecem; protótipos antigos não substituem os contratos atuais.

## Lateral com retomada — 27/10/2026

O usuário escolheu os cards **abaixo dos filtros**, para preservar a posição dos controles. Referência fornecida: [AI Model Catalog Cards — Dark, por Dmitry Sergushkin](https://dribbble.com/shots/27230217-AI-Model-Catalog-Cards-Dark), aproveitando a composição horizontal e a hierarquia de informações, com a paleta e a tipografia editorial do aplicativo.

“Retome suas histórias” apresenta até três livros atualizados recentemente no escopo aberto: todo o perfil na raiz, livros do Universo ou volumes da Série. Usa `Book.updated_at`, que também acompanha salvamentos de capítulos; não representa frequência de edição. Busca, formato, ordenação e tipo do catálogo não alteram esses atalhos. Os cards mostram a capa real ou automática, título, autor e atualização; o link abre o detalhe do livro. O botão de recuperar capa permanece independente da abertura. A lateral mantém rolagem em janelas baixas e pode ser recolhida em janelas estreitas, sem forçar a largura do catálogo.

Todos/Livros/Séries/Universos permanece montado em uma única linha, com posições constantes. Na raiz, os quatro tipos estão habilitados; no Universo, Universos fica desabilitado; na Série, Séries e Universos ficam desabilitados. Um tipo incompatível herdado da navegação passa a Todos, sem alterar o escopo. Não restaurar a árvore lateral removida nas iterações seguintes ao primeiro explorador.

O painel de detalhes da Biblioteca foi removido a pedido do usuário: as informações já estão no card convencional. O catálogo usa o espaço restante da janela, sem uma terceira coluna ou faixa de inspeção. Clicar na capa ou no título abre o livro; ações de configuração, movimentação e demais opções continuam no menu do card. A lateral mantém apenas filtros e atalhos recentes, inclusive no modo recolhível.

## Ajuste aprovado da Biblioteca — 25/10/2026

Opção A, explorador suave, com referência na [lateral do Eagle 4](https://en.eagle.cool/blog/post/eagle4). Preservar as cores e a tipografia editorial da aplicação. A navegação usa seleção discreta, ícones leves e níveis progressivos de 18 px para Universo → Série → Livro, com espaço fixo para setas em todos os níveis. Mostrar também livros diretos do Universo, séries independentes e livros avulsos conforme os vínculos reais.

A lateral local mede 360 px, com árvore e filtros separados por uma divisória sutil e rolagem própria. O seletor de tipo fica em uma única linha no topo, no lugar do antigo link “Todo o acervo”; busca, formato, ordenação, agrupamento e limpeza continuam na lateral. O topo do catálogo contém “Seu acervo (x itens)” e grade/lista; a contagem reflete o escopo e os filtros, sem incluir o card de criação. Em janelas estreitas, “Navegação e filtros” abre esses controles acima do catálogo. Não apresentar “Coleções” como uma configuração disponível. Títulos dos grupos, Filtros e labels dos seletores usam 12 px, negrito e foreground.

Biblioteca, Universo e Série compartilham a composição de PageHeader, sem botões de criação no cabeçalho local. Universo e Série preservam edição direta de nome e descrição; a descrição inicia com uma linha e pode ser expandida pelo usuário. Conforme a revisão de 27/10, a capa abre o livro diretamente e o painel de detalhes foi removido.

A criação usa um card do mesmo tamanho dos demais, sempre na primeira posição, em grade, lista, agrupamento, busca ou estado vazio. Seu popover mantém as opções válidas no contexto. A lateral oferece atalhos de criação com ícones, conforme a referência de explorador do VS Code fornecida pelo usuário; Livro herda o escopo, Série recebe o Universo atual (ou o da Série selecionada), e Universo é criado na raiz.

A árvore também permite mover por arraste: livros e séries são origens; séries e universos são destinos válidos conforme o domínio. Soltar um livro diretamente sobre um Universo retira o vínculo da Série; sobre uma Série independente, retira o Universo anterior; sobre “Livros avulsos”, remove ambos. O grupo permanece disponível mesmo vazio. Os cards e os diálogos de mover conservam o fluxo existente de associação, e a persistência continua no backend/API local com publicação de invalidação. Erros mantêm a origem, permitem nova tentativa e não descartam capítulos.

## Processo antes de uma tela nova

1. Identificar a tarefa do escritor, a rota de entrada, os dados reais disponíveis e a ação principal. Consultar o roadmap e o código existente.
2. Inspecionar Home, Biblioteca e componentes compartilhados para reconhecer o que já pertence à identidade do aplicativo.
3. Apresentar 2–3 referências verificadas com links diretos para interfaces, imagens do produto ou estudos concretos. Explicar o padrão aproveitável, o custo de adaptação e a opção recomendada. Não usar resultados de busca como se fossem uma referência específica.
4. Colocar os links na mensagem normal, fora da caixa interativa de opções. As opções devem ter apenas nomes curtos. Esperar uma escolha real antes de implementar o visual dependente dela; investigar dados e contratos pode continuar.
5. Registrar a escolha e seu escopo aqui. Uma escolha aprovada pode orientar as telas incluídas nesse escopo; ajustes rotineiros de consistência não exigem nova aprovação. Uma tela nova recebe referências adequadas à sua tarefa, mesmo que preserve a direção geral.
6. Antes de codificar, descrever brevemente a composição: cabeçalho, ações, ferramentas, conteúdo, estados e adaptação à janela. Reutilizar componentes; implementar e validar o fluxo completo.

Formato de apresentação ao usuário:

> Referência A — link clicável e padrões que vamos aproveitar.
>
> Referência B — link clicável e diferenças relevantes.
>
> Recomendo A porque atende à tarefa e preserva a identidade existente.

Em seguida, oferecer a escolha A/B, sem repetir URLs dentro dos controles interativos. Se a referência estiver indisponível, oferecer outra verificada. Não instalar dependências, copiar identidade alheia ou adicionar serviços externos apenas para reproduzir uma imagem.

## Referências para a direção geral

**Direção aprovada em 25/10/2026: A · Editorial acolhedor, inspirado no Craft.** Escopo desta padronização: Home, Biblioteca, hub e ficha do Códice, além de estrutura e interações compartilhadas. Preservar a paleta e as serifas atuais; usar a largura útil da janela e movimento discreto. A implementação não reproduz literalmente a interface do Craft.

As alternativas abaixo formam o registro de referências apresentado para essa escolha. Para novas telas, apresentar referências específicas antes de implementar, conforme o processo acima.

| Opção | Referência | Padrões a avaliar |
| --- | --- | --- |
| A · Editorial acolhedor | [Craft — barra lateral e refinamentos de interface](https://www.craft.do/pt-BR/blog/craft-update-3-4-2) | Composição de documentos, organização lateral e painéis; evoluir as serifas, cores e superfícies atuais. |
| B · Escrita minimalista | [Bear — imagens da interface para Mac](https://bear.app/) | Redução de ruído e separação entre navegação, coleção e escrita. |
| C · Estúdio de produção | [Scrivener — organização do manuscrito e pesquisa](https://www.literatureandlatte.com/scrivener/overview) | Densidade de ferramentas, múltiplos painéis e acesso ao material de apoio. |

Observar as imagens das interfaces dos aplicativos, não a estrutura comercial de suas páginas. As referências orientam decisões; não são modelos para reprodução literal.

## Composição aprovada para Biblioteca e Códice

Em 25/10/2026, o usuário escolheu o explorador da Biblioteca inspirado no [Eagle](https://en.eagle.cool/) e a lista com ficha ao lado para o Códice inspirada no [Bear](https://bear.app/). A revisão de 27/10 removeu o painel redundante de detalhes da Biblioteca. Essas composições preservam a direção editorial acolhedora já aprovada.

- **Biblioteca:** navegação contextual por Universos e Séries, acervo em grade/lista e lateral com filtros e livros recentes. Capa e título abrem o livro diretamente. Informações e ações ficam nos cards convencionais, sem painel adicional. Mover/reordenar permanece disponível.
- **Códice:** contexto, categorias, busca e lista compacta à esquerda; a ficha selecionada ocupa a área principal. O layout compartilhado mantém a lista montada durante a seleção, preservando busca e rolagem. A URL continua identificando contexto e entidade, inclusive em recarga e histórico. Links, troca de contexto e abas passam pela mesma proteção de rascunhos.
- **Painéis:** cabeçalhos compactos, rolagem independente e superfícies locais distintas da navegação global. O corpo de uma ficha se adapta à largura do seu painel, não apenas à largura total da janela.
- **Janelas estreitas:** a lateral de filtros e retomada da Biblioteca pode ser recolhida. No Códice, “Ver fichas” alterna entre a lista e a ficha sem desmontar o rascunho.

A identidade compartilhada permanece nos tokens, fontes, controles, estados e comportamento. A composição varia com a tarefa; a Biblioteca explora o acervo e o Códice desenvolve uma entidade por vez.

## O espaço pertence à tarefa

Ser desktop depende da organização das ferramentas, continuidade da navegação, atalhos, resposta e uso da janela. A tecnologia de renderização não impõe uma composição de site.

| Área | Regra de largura | Exemplos |
| --- | --- | --- |
| Trabalho e coleções | Ocupar a largura útil, com margens do shell; crescer por colunas ou painéis, sem limite global centralizado. | Biblioteca, hub/ficha do Códice, capítulos. |
| Formulários | Manter a área externa fluida. Limitar grupos de campos quando a leitura exigir ou distribuí-los em colunas coerentes. | Identidade, preferências, metadados do livro. |
| Leitura e escrita | Limitar a coluna de texto para conforto; no manuscrito contínuo, aproximadamente 62–72 caracteres por linha. | Editor, documentos narrativos, textos de ajuda. |
| Página impressa | Respeitar formato, margens e zoom do livro. | Editor paginado e prévia. |
| Diálogo | Limitar a largura pelo conteúdo e manter altura/rolagem acessíveis. | Confirmações e criações rápidas. |

`max-width` continua útil nas três últimas situações e em campos específicos. Não deve ser a decisão automática para o aplicativo inteiro. Não esticar parágrafos de leitura só porque a janela é larga.

Usar `PageContent` para a estrutura comum e `AppShell` para moldura, margens e rolagem. Evitar padding e contêineres centrais duplicados por rota. Grades devem responder à área disponível, inclusive ao expandir a lateral; a quantidade de colunas deve crescer com a janela, sem transformar cards em banners.

Preservar a barra de título de 48 px, a lateral compacta de 48 px e a expandida de 216 px. O caminho contextual fica na barra de título. Janelas estreitas precisam continuar operáveis com o menu compacto, quebra das ferramentas e rolagem vertical, sem ocultar ações essenciais.

Barra de título e menu principal compartilham o token `--app-chrome`, com tom próprio mais escuro que a área de trabalho em ambos os temas. Essa moldura identifica a navegação global. Painéis locais, como a lista de capítulos, usam `surface` e precisam permanecer visualmente distintos da moldura, inclusive com o menu expandido. Não reutilizar `--app-chrome` nos painéis de uma funcionalidade.

## Identidade e componentes compartilhados

Os tokens efetivos estão em `src/app/globals.css` e `src/lib/branding/tokens.css`; não copiar cores antigas de protótipos para JSX. Fontes, ícones e recursos visuais devem continuar disponíveis offline.

| Responsabilidade | Ponto de reutilização |
| --- | --- |
| Moldura, navegação e rolagem | `AppShell`, barra de título, menu existente. |
| Estrutura de tela | `PageContent`; o shell fornece as margens. |
| Título, apoio e ação principal | `PageHeader`; exceções funcionais, como título editável de coleção, mantêm a mesma hierarquia. |
| Botões, campos e diálogos | `src/components/ui/`; não criar uma nova aparência para cada feature. |
| Carregamento e erro | `LoadingRegion`, `Skeleton`, `ErrorState`. |
| Comportamento e persistência | Hooks e clientes IPC tipados existentes; regras de negócio e acesso nativo permanecem no Rust. |

Na identidade atual, EB Garamond/`font-display` identifica títulos editoriais e Inter identifica controles e descrições. A tipografia configurável do manuscrito tem contrato próprio. Uma nova feature não escolhe outra fonte, família de ícones, raio ou cor de seleção por conta própria.

Usar Lucide para ícones de interface, normalmente 16–20 px. Ícones decorativos ficam fora da árvore acessível; ações só com ícone exigem nome acessível e dica no foco/hover. Botões principais têm rótulos claros; ações destrutivas ficam separadas e têm confirmação quando necessário.

Um cabeçalho deve responder “onde estou?” e “o que posso fazer aqui?”. O seletor de Universo/Livro explicita o contexto do Códice; sua hierarquia visual deve conversar com os filtros da Biblioteca. Evitar repetir o caminho da barra de título dentro da página.

Cards e estados vazios preservam superfícies, bordas, raios e tipografia da aplicação. A identidade vem desses padrões compartilhados; os campos e ferramentas variam conforme a tarefa. Não inventar estatísticas, ações sem efeito ou progresso para preencher espaço.

## Estados e facilidade de uso

Antes da implementação, definir:

- **Carregando:** reservar a geometria, usar `aria-busy` e o atraso já previsto em `LoadingRegion`. Não impor espera mínima.
- **Com dados:** mostrar contexto, quantidade real, busca/filtros e ações consistentes. Preservar o conteúdo durante revalidação.
- **Vazio:** explicar o próximo passo e oferecer uma ação útil. Distinguir ausência de dados, ausência de contexto e busca sem resultados.
- **Erro:** mensagem compreensível, nova tentativa e preservação dos dados/drafts. Não tratar erro como lista vazia.
- **Teclado:** ordem de foco previsível, foco visível, Escape, retorno ao acionador e semântica correta de abas/diálogos.
- **Janela estreita:** títulos longos quebram, ferramentas se reorganizam e conteúdo não cria rolagem horizontal acidental.

Mantenha o vocabulário do produto: Biblioteca, Universo, Série, Códice, Personagem, Lugar e Conceito. Use o mesmo rótulo para a mesma ação nas diversas rotas.

## Movimento como feedback

Centralizar tempos e curvas em `src/components/shared/interactions.css`. Preferir CSS para os padrões simples já atendidos pelo navegador. Uma biblioteca de animação exige uma necessidade concreta que os padrões existentes não resolvam.

| Movimento | Tempo de referência | Intenção |
| --- | --- | --- |
| Cor, borda e foco de controles | 120 ms | Tornar hover e seleção perceptíveis sem atrasar o clique. |
| Transformação discreta de capa | 180 ms | Explicar que o card abre um objeto; retornar suavemente ao sair. |
| Entrada de diálogo/popover | 200 ms | Mostrar a nova camada com deslocamento curto e opacidade. |

Transições devem poder inverter no meio do percurso e terminar sem deixar o elemento deslocado. Animar propriedades específicas; evitar `transition-all`, altura/largura em cada interação e atrasos acumulados em listas. Não animar cada card ao digitar na busca.

Não remontar o editor, os formulários ou o shell para produzir transições. Não atrasar salvamento, navegação, feedback de erro ou desbloqueio de controles para “esperar a animação”. Uma animação nunca deve ocultar conteúdo pendente de uma requisição.

Com `prefers-reduced-motion: reduce`, remover transições e animações decorativas, incluindo skeletons, mantendo o conteúdo e o feedback textual completos. Não adicionar animações de página em toda navegação; priorizar interações e camadas locais. Animações complexas só se explicarem uma mudança que a versão simples não comunica bem.

## Revisão e entrega

- Executar `npx tsc --noEmit`, `npm run lint`, `npm run check:ui` e `npm test`.
- Para mudanças visuais/interativas, executar os cenários Playwright pertinentes sobre uma exportação estática atualizada. Inspecionar imagens alteradas antes de aceitar referências novas.
- Conferir temas claro/escuro, teclado, movimento reduzido, janelas estreitas e desktop amplo. Para áreas fluidas, incluir 1920 px ou mais; verificar também expansão da lateral.
- Exercitar estados e ações afetados; não se limitar a uma captura com dados preenchidos.
- Informar exatamente o que foi executado. Testes no navegador com ponte Tauri simulada não comprovam comportamento real no gerenciador de janelas.
- Entregar resumo, limitações materiais e comandos Git com arquivos explícitos. Não fazer commit, push ou PR sem solicitação.

## Relação com documentos anteriores

Este contrato define o processo atual de desenvolvimento e decisão visual. [UI Quality](ui-quality.md) contém critérios de aceite e verificação; o [guia de implementação original](guia-implementacao-ui.md) e o [protótipo](prototipo-ui/README.md) preservam o histórico e as referências de composição. Em caso de divergência, aplicar a decisão explícita mais recente e atualizar o contrato afetado, sem reescrever requisitos de domínio para imitar uma referência.
