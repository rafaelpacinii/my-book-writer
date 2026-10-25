# Hub do Códice — Dia 5

O hub está disponível em `/codex`, pela entrada **Códice** da navegação lateral. Usa os contratos do [motor de dados](codex-data.md), sem consultar SQLite ou arquivos diretamente no frontend.

## Navegação e escopo

O seletor **Universo ou livro** agrupa Universos e Livros avulsos. O primeiro contexto ativo disponível é selecionado na entrada; contextos arquivados ficam identificados e disponíveis para consulta. Se não houver Livro/Universo, a tela orienta criar um na Biblioteca.

As abas **Personagens**, **Lugares** e **Conceitos** exibem a quantidade de fichas do contexto. A busca encontra nome, resumo, papel, status, arquétipo e tags, sem diferenciar maiúsculas ou acentos. A lista de fichas é ordenada por nome.

O contexto e a aba são representados na URL pelos parâmetros `bookId` ou `universeId`, mais `kind=character|location|lore`. A navegação mantém histórico e funciona após recarregar. Um link com `bookId` de um livro pertencente a Universo resolve o Códice compartilhado desse Universo. IDs inexistentes, dois escopos simultâneos e falhas de persistência são apresentados como erro com nova tentativa, preservando dados.

As abas suportam setas esquerda/direita, Home e End, com foco móvel e painel associado. Os controles usam o Select compartilhado e as mesmas cores, ícones e estilos de filtragem da Biblioteca.

## Criação e consulta

**Nova ficha** abre um modal para o tipo da aba atual, com nome e modelo. Os presets iniciais são instalados pelo motor de dados; modelos personalizados do mesmo tipo também aparecem no seletor. Cada criação recebe novos IDs e a estrutura do modelo escolhido.

O modal mantém valores quando uma operação falha, impede envios simultâneos e permanece aberto durante a gravação. Escape, cancelamento, foco inicial, contenção de Tab e restauração de foco seguem o componente Modal existente.

Após criar, a listagem é atualizada e abre a [ficha visual](codex-sheet.md) em `/codex/sheet`, com identidade, galeria e categorias/campos do modelo. A mesma ficha pode ser aberta pela lista compacta, que exibe sua imagem principal quando disponível. Um layout compartilhado preserva a lista, a busca e a rolagem ao alternar fichas; a ficha ocupa o painel principal. Contextos arquivados não permitem criar fichas, mas continuam permitindo consultar as existentes.

Links, abas e o seletor de contexto pedem confirmação quando há alterações pendentes na identidade ou nos campos. Em janelas estreitas, “Ver fichas” alterna entre o navegador e o conteúdo sem desmontar o rascunho. O corpo da ficha se adapta à largura do painel.

A ficha visual e a galeria estão disponíveis desde o Dia 6. A edição de categorias/campos e modelos é descrita em [Abas customizáveis e campos dinâmicos](codex-tabs.md).

## Implementação e validação

- Rota estática: `src/app/(workspace)/codex/page.tsx`, composta com Suspense.
- Componentes: `src/components/codex/`, todos abaixo de 70 linhas.
- Comportamento: `useCodexHub`, `useCodexCreate`, `useCodexTabs` e os hooks de dados do Dia 4.
- Cache de resolução de escopo com invalidação para mudanças em livros, séries, universos, perfil e restauração.
- Testes de navegador: `src/tests/e2e/codex.spec.ts`, incluindo fluxos reais de persistência web e falhas simuladas de IPC, nos temas claro/escuro e em largura reduzida.

Os imports CSS locais restantes de `globals.css` foram movidos para imports diretos no layout, evitando a resolução incorreta de caminhos pelo Tailwind/Turbopack. O build estático final foi validado com Turbopack.
