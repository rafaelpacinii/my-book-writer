# Motor de dados do Códice

O Dia 4 prepara a persistência e os contratos usados pelo hub do Dia 5. Ainda não acrescenta telas ou entrada na navegação. As operações desktop seguem `API TypeScript → comando Tauri → serviço → repositório SQLx → SQLite`; nenhuma consulta SQL acontece no frontend.

## Esquema e identidade

A migration `20261025010000_create_codex.sql` acrescenta cinco tabelas, sem modificar o conteúdo dos livros e capítulos existentes:

| Tabela | Responsabilidade |
| --- | --- |
| `codex_entities` | Fichas `character`, `location` e `lore`, nome, resumo, papel, status, arquétipo, tags e escopo. |
| `codex_categories` | Categorias ordenadas pertencentes a uma ficha. |
| `codex_fields` | Campos ordenados com tipo, valor JSON e configuração JSON. |
| `codex_entity_images` | Vínculos com `image_assets`, legenda, ordem e imagem principal única por ficha. |
| `codex_templates` | Modelos de estrutura por perfil, incluindo presets protegidos. |

Novos registros usam UUIDv7. As tabelas possuem timestamps e exclusão lógica. Fichas excluídas deixam de aparecer nas consultas, mas suas categorias, campos e imagens são preservados. As chaves estrangeiras impedem apagar fisicamente pais ainda referenciados.

## Escopo e compartilhamento

Toda chamada informa `profile_id` e exatamente um `book_id` ou `universe_id`. O serviço resolve o escopo efetivo: Universo direto ativo do livro, Universo ativo da Série ou o próprio Livro. Nenhuma ficha pode pertencer simultaneamente a Livro e Universo. O banco também rejeita escopos de outro perfil.

Ao vincular um livro a um Universo, suas fichas locais passam a pertencer ao Universo. O mesmo ocorre quando a Série desse livro é vinculada a um Universo. O trigger participa da transação existente de Livro/Série; uma falha reverte tanto o vínculo quanto a promoção das fichas. IDs, conteúdo, categorias e imagens permanecem iguais. Outros livros desse Universo passam a consultar as mesmas fichas.

Fichas já compartilhadas pertencem ao Universo: retirar um livro ou uma Série não copia nem transfere o Códice do Universo para eles. Ao excluir Livro/Universo, suas fichas continuam consultáveis em um contexto arquivado. Contextos arquivados com conteúdo aparecem na listagem; editar, criar ou excluir fichas nesses contextos é bloqueado. É permitido extrair um modelo de estrutura de uma ficha arquivada.

## Presets, campos e modelos

`src-tauri/resources/codex-presets.json` é a fonte comum do Rust e da prévia web. A primeira criação ou consulta de modelos instala, por perfil e sem duplicação, os presets de Personagem, Lugar e Conceito. Personagem inclui dados gerais, características físicas, psicologia e relações; Lugar inclui dados gerais, geografia e sociedade.

Tipos de campo: `short_text`, `long_text`, `tags`, `scale` (0–100), `reference` (IDs ativos do mesmo Códice) e `document` (JSON com `type: "doc"` e `content` em array). Referências existentes não são apagadas automaticamente ao excluir a ficha de destino; o consumidor deve representar destinos indisponíveis. O editor e o histórico de documentos serão implementados nos Dias 8 e 9.

Salvar uma estrutura substitui atomicamente todas as categorias e campos da ficha. IDs existentes devem pertencer à mesma ficha; novos itens omitem o ID. A ordem dos arrays determina a posição. Itens omitidos são excluídos logicamente. Campos podem mudar de categoria sem perder o ID. Limites: 64 categorias, 256 campos, nomes de até 160 caracteres, texto curto de até 1.000 caracteres, escala de 0 a 100 e até 100 tags/vínculos por campo.

Salvar um modelo copia categorias, tipos, rótulos e configurações. Valores recebem o vazio correspondente ao tipo; IDs, metadados pessoais e imagens não são copiados. Criar uma ficha com um modelo gera novos IDs. Presets originais são protegidos; modelos personalizados podem ser excluídos.

## API e integração React

`src/lib/api/codex.ts` oferece:

| API | Comando Tauri |
| --- | --- |
| `resolveCodexScope` | `resolve_codex_scope` |
| `listCodexContexts` | `list_codex_contexts` |
| `listCodexEntities` / `getCodexSheet` | `list_codex_entities` / `get_codex_sheet` |
| `createCodexEntity` / `updateCodexEntity` / `deleteCodexEntity` | `create_codex_entity` / `update_codex_entity` / `delete_codex_entity` |
| `saveCodexStructure` | `save_codex_structure` |
| `listCodexTemplates` / `saveCodexTemplate` / `deleteCodexTemplate` | `list_codex_templates` / `save_codex_template` / `delete_codex_template` |

Tipos e DTOs estão em `src/types/codex.ts`. `useCodex`, `useCodexSheet`, `useCodexTemplates` e `useCodexContexts` disponibilizam carregamento, erros, atualização e operações. Os caches separam perfil/escopo/tipo/ID e invalidam após mudanças no Códice, livros, séries, universos, perfil e restauração. Mudanças de hierarquia ou restauração descartam dados antigos enquanto recarregam.

Erros expõem `{ code, message }`, com códigos `validation`, `not_found` ou `storage`. Falhas internas do banco são convertidas em mensagens seguras. Eventos de alteração só são publicados após o sucesso da persistência.

## Prévia web e próximas etapas

Sem Tauri, a API usa uma única chave localStorage (`my_book_writer_codex_v1`) para gravar o agregado atomicamente. Escritas sem espaço e dados inválidos geram erro sem sobrescrever o conteúdo anterior. Na prévia, a promoção de escopo é normalizada no próximo acesso ao Códice; no desktop ela ocorre imediatamente na transação SQLite. A prévia mantém nomes de contextos para consultar fichas mesmo após a remoção dos agrupadores locais.

A galeria possui tabela, restrições e leitura no agregado, mas importação, associação e gerenciamento de imagens ficam para o Dia 6. A interface de categorias/modelos fica para o Dia 7. Os backups nativos já copiam o SQLite completo e incluem estas tabelas; a restauração executa as migrations antes de reabrir o banco.

Os testes cobrem upgrade do banco anterior, CRUD, presets, modelos sem conteúdo pessoal, escopos compartilhados/isolados, arquivamento, IDs e ordenação, valores inválidos, falhas transacionais, persistência web e contrato IPC.
