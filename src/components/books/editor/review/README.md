# Revisão de capítulos

A revisão é local. No desktop, os comandos Tauri passam por `ReviewService`, `ReviewRepository` e SQLite; o navegador mantém um fallback com os mesmos contratos observáveis.

## Estados e conclusão

- **Não revisado:** o capítulo ainda não tem marcação de progresso nem comentários abertos.
- **Em revisão:** existem comentários abertos ou uma sinalização explícita para rever.
- **Revisado:** a versão salva corresponde à versão revisada e não há comentários abertos.
- **Texto alterado:** existe uma revisão anterior, mas o texto mudou ou há um rascunho não salvo.

Concluir primeiro salva o capítulo, consulta a revisão efetivamente persistida e envia essa revisão ao serviço. Falhas de salvamento impedem a conclusão. O serviço confere a versão e os comentários abertos dentro de uma transação `BEGIN IMMEDIATE`; uma janela concorrente não pode concluir silenciosamente uma revisão antiga.

A migration `20261023020000_review_integrity.sql` invalida o progresso quando muda a revisão do conteúdo, quando nasce um comentário aberto ou quando um comentário é reaberto. Ela também corrige marcações antigas incompatíveis com o capítulo ou seus comentários. A restauração do histórico passa pela mesma gravação de conteúdo e invalidação.

## Comentários e seleção

Uma âncora de trecho é JSON com `version: 1`, `start`, `end`, `quote`, `prefix`, `suffix` e `document_hash`. As posições são unidades UTF-16, compatíveis com strings e seleção DOM, inclusive em textos com emoji. O contexto tem até 40 unidades de cada lado, sem cortar pares de surrogates. O hash FNV-1a identifica o documento inalterado; não é usado para segurança.

No documento inalterado, a posição exata é preservada mesmo em texto repetitivo. Após uma alteração, a localização procura uma correspondência de contexto inequívoca. Um trecho ausente ou ambíguo fica desvinculado; o corpo do comentário e a citação original são preservados. Não se escolhe automaticamente a primeira ocorrência.

Comentários antigos que só guardavam um horário podem ser vinculados se o trecho for único. Anotações gerais sobre o capítulo não recebem uma âncora fictícia. O salvamento e a restauração atualizam as associações dos trechos na mesma transação SQLite do capítulo; uma falha posterior reverte todos esses efeitos.

Localizar um trecho desenha um destaque fora do elemento editável, sem inserir `<mark>`, classes ou estilos no manuscrito. A localização paginada usa o intervalo selecionado para escolher a página. Digitar encerra o destaque sem alterar o documento ou sua seleção.

## Navegação, rascunhos e falhas

- Carregamentos têm identidade de requisição e capítulo. Respostas antigas não substituem a revisão da tela atual.
- Mutações permanecem associadas ao capítulo original. Seus retornos não acrescentam comentários ao capítulo para o qual o usuário navegou.
- Durante o carregamento de outro capítulo, o texto anterior não fica disponível para edição, salvamento ou conclusão de revisão.
- Rascunhos de novas anotações e de edições ficam separados por capítulo na memória do editor. Fechar o painel, abrir o histórico e ativar o foco não os apaga. Eles não são persistidos após encerrar ou recarregar a aplicação.
- Operações de revisão são serializadas na interface. A exclusão exige confirmação e só fecha o diálogo após sucesso.
- Carregamento, vazio e erro têm apresentações próprias. Falhas de escrita preservam os campos para nova tentativa; mensagens internas de SQL não chegam à interface.
- O fallback valida o armazenamento antes de gravar. Dados corrompidos não são interpretados como uma lista vazia. Gravações conjuntas de comentário/progresso/capítulo recuperam valores anteriores quando uma escrita posterior falha; a garantia transacional contra encerramento do processo pertence ao SQLite nativo.
- IDs novos usam UUIDv7 nos dois ambientes. Datas SQLite sem fuso são interpretadas como UTC antes da apresentação local.

## Interface e acessibilidade

Os campos possuem rótulos, remover uma citação tem nome acessível e os filtros expõem `aria-pressed`. O menu de anotação fecha com Escape e devolve o foco ao acionador. O painel ocupa a área de escrita em janelas estreitas; localizar uma citação retorna ao texto. Os indicadores dos cards de capítulo mostram falhas com uma ação de recarregar.

## Regressões

- `src/tests/e2e/review.spec.ts`: fluxo completo, conclusão e versão, âncoras repetidas, proteção do manuscrito, rascunhos, armazenamento, exclusão, fuso horário, acessibilidade e janela estreita.
- `src/tests/e2e/reviewConcurrency.spec.ts`: respostas lentas e falhas de IPC simuladas, incluindo criação durante uma troca de capítulo.
- `src/tests/e2e/reviewPaging.spec.ts`: localização na última página e em trechos que atravessam nós com formatação diferente.
- `src/lib/api/reviews.test.ts`: contratos do fallback, invalidação, âncoras removidas, dados corrompidos e reversão de gravações parciais.
- `src/utils/reviewAnchors.test.ts`: contexto, ambiguidade, offsets UTF-16, texto repetitivo e estados de revisão.
- `src-tauri/src/services/review_tests.rs`: contratos nativos com migrations reais e SQLite em memória, restauração e reversão transacional.

Os testes de navegador não substituem a execução da janela Tauri no Windows.
