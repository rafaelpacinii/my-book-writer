# Abas customizáveis, campos dinâmicos e modelos — Dia 7

A coluna direita da ficha em `/codex/sheet` permite ao autor organizar livremente as informações de personagens, lugares e conceitos, combinando categorias em abas, campos de múltiplos tipos e salvamento de modelos (*templates*) reutilizáveis.

## Estrutura e gerenciamento de abas (categorias)

- **Abas interativas com teclado**: navegação padrão WAI-ARIA com teclas `ArrowRight`, `ArrowLeft`, `Home` e `End`, além de clique direto.
- **Criação**: botão *Nova categoria* adiciona uma nova aba (limite de 64 categorias por ficha) com validação de nome e foco imediato.
- **Renomeação**: modal acessível para alterar o nome da categoria ativa, preservando os campos nela contidos.
- **Reordenação**: botões direcionais para mover a categoria ativa para a esquerda ou direita.
- **Exclusão**: confirmação modal que marca a categoria e seus campos para remoção, efetivada na persistência da ficha.

## Campos dinâmicos e tipos de dados

Cada categoria comporta múltiplos campos (até 256 campos por ficha) com suporte aos seguintes tipos:

1. **Texto curto (`short_text`)**: títulos, nomes alternativos, idades, clima, população (até 1.000 caracteres).
2. **Texto longo (`long_text`)**: biografias, descrições detalhadas e anotações sensoriais com quebra de linha.
3. **Escala 0–100 (`scale`)**: atributos estilo RPG (ex.: *Poder Arcano*, *Periculosidade*, *Influência*), controlados por slider de alcance ou campo numérico tabular sincronizado.
4. **Tags (`tags`)**: listas de itens separadas por vírgula (virtudes, defeitos, idiomas), renderizadas como emblemas com até 100 tags por campo.
5. **Vínculo entre fichas (`reference`)**: conexões bidirecionais entre entidades do mesmo escopo (aliados, rivais, cidades natais), exibindo link direto para a ficha vinculada e remoção acessível.
6. **Documento narrativo (`document`)**: reservado para o editor narrativo do Dia 8.

- **Reordenação e movimentação**: botões para mover campos para cima/baixo dentro da categoria ou trocar a categoria de um campo na edição.
- **Mudança de tipo**: alterar o tipo de um campo existente exibe aviso destacado e reinicializa o valor padrão seguro para evitar inconsistências.

## Modelos de ficha (*Templates*)

- O botão *Salvar como modelo* permite capturar a arquitetura de categorias e campos da ficha ativa, criando um modelo personalizado sem copiar conteúdos pessoais, vínculos ou imagens.
- O modelo fica imediatamente disponível no modal de criação de novas fichas daquele tipo no Hub do Códice (`/codex`).

## Proteção de alterações e persistência

- O hook `useSheetDirty` e o `SheetEditingProvider` integram o estado de rascunho da estrutura de campos e do formulário de identidade.
- Navegar para outra rota ou fechar o navegador com alterações pendentes aciona o diálogo de confirmação (`DiscardChangesModal`) e o evento `beforeunload`.
- O botão *Descartar alterações nos campos* restaura a ficha à última versão persistida.
- As chamadas IPC `save_codex_structure` e `save_codex_template` (e seu espelho local na web) garantem transacionalidade atômica no SQLite com atualização dos recursos reativos via `publishDataChange("codex")`.

## Validação

- Testes Rust cobrem repositórios, serviços de estrutura, restrições de escopo e serialização segura de modelos.
- Testes unitários Vitest validam manipulação de draft, movimentação de categorias/campos, serialização e isolamento de valores.
- Testes E2E Playwright em `src/tests/e2e/codexStructure.spec.ts` exercitam o ciclo de vida completo: criação/renomeação/exclusão de abas, navegação por teclado, tipos de campo (scale, reference, tags), salvamento/recarga, modelos reutilizáveis e acessibilidade (WCAG 2.1 AA) nos temas claro e escuro.

