# Ficha visual e galeria — Dia 6

A rota estática `/codex/sheet` recebe `entityId` e exatamente um `bookId` ou `universeId`. Criar uma ficha no hub ou abrir seu card leva a esta rota. Livros vinculados a Universos resolvem o escopo compartilhado; a barra de título mostra **Códice > Contexto > Ficha**. O retorno ao hub preserva o contexto e o tipo de ficha.

## Interface e identidade

O layout apresenta galeria e identidade à esquerda, com os dados das categorias à direita. Em janelas estreitas, as colunas se empilham. Cores, ícones locais e controles seguem os tokens dos temas claro/escuro.

O formulário de identidade permite editar nome, papel, status, título/arquétipo, resumo e tags. Papel e status oferecem sugestões e aceitam texto personalizado. Tags são separadas por vírgulas e exibidas como emblemas. **Salvar identidade** persiste os metadados e atualiza título, breadcrumbs e cards.

Alterações não salvas são preservadas durante atualizações da galeria. Sair por links ou controles de histórico exige uma decisão de descarte; recarregar/fechar a página também usa a proteção do navegador. Falhas de gravação mantêm os valores e permitem repetir o envio.

As categorias e os campos existentes são apresentados para consulta. Gerenciamento e edição desses campos continuam previstos no Dia 7; o editor narrativo, no Dia 8, e as aparições no manuscrito, no Dia 10.

## Galeria

- Importação de múltiplas imagens PNG, JPEG e WebP, até 10 MB por arquivo, 8192 pixels por dimensão e 64 imagens ativas por ficha.
- O Rust identifica o formato real, decodifica com limites de memória/dimensões e calcula SHA-256. Nome, extensão e dimensões fornecidos pela interface não determinam o formato armazenado.
- Miniaturas navegáveis, imagem selecionada completa, legenda e seleção da imagem principal. A primeira importação se torna principal; trocar a principal preserva uma única imagem nessa posição.
- Remover pede confirmação. A exclusão é lógica, preservando o ativo e o arquivo. Se a principal for removida, a primeira imagem restante assume esse papel; ao remover a última, o card volta ao ícone do tipo.
- A imagem principal aparece no card do hub. Falhas de leitura/decodificação apresentam alternativa visual e nova tentativa na ficha.
- Contextos arquivados continuam permitindo consultar imagens e metadados, com ações de edição/importação/remoção indisponíveis.

## Persistência e API

A migration `20261025020000_codex_gallery_assets.sql` permite que `image_assets` pertença exatamente a um Livro ou a uma ficha (`codex_entity_id`). Assim, um Universo sem livros também aceita imagens. A reconstrução preserva IDs, caminhos e referências das capas e das galerias anteriores, verifica todos os FKs antes de concluir e mantém `foreign_keys` habilitado.

Os arquivos novos ficam em `images/codex/<UUIDv7>.<formato>` dentro do armazenamento gerenciado. O identificador da ficha permanece igual quando ela passa de Livro para Universo, preservando as imagens. Asset e vínculo de galeria são gravados na mesma transação SQLite; falhas de persistência removem o arquivo recém-criado. Alterações de principal, legenda e exclusão também são transacionais.

| API TypeScript | Comando Tauri | Resultado |
| --- | --- | --- |
| `importCodexImage` | `import_codex_image` | Ficha atualizada, incluindo a nova imagem. |
| `readCodexImage` | `read_codex_image` | Data URL da imagem, após validar escopo, ficha e vínculo. |
| `updateCodexImage` | `update_codex_image` | Ficha atualizada com legenda/principal. |
| `deleteCodexImage` | `delete_codex_image` | Ficha atualizada após exclusão lógica. |

As chamadas recebem escopo e IDs, sem permitir informar um caminho de leitura arbitrário. O frontend usa IPC; somente o Rust acessa os arquivos e o SQLite. O tipo `CodexEntity` também expõe `primary_image_id`, calculado nas consultas nativas.

Na prévia web, imagens e metadados são gravados atomicamente na chave local do Códice já existente. Armazenamentos do Dia 4/5 sem a coleção de ativos continuam legíveis. Falta de espaço gera erro sem sobrescrever os dados anteriores. A decodificação e o SHA-256 usam APIs locais do navegador.

O backup SQLite existente preserva os registros e referências da galeria. Ele continua sendo um backup do banco: transportar os arquivos físicos de imagens para outro dispositivo exige preservar também a pasta de armazenamento gerenciado.

## Validação

Testes Rust verificam a migração com capas/galeria preenchidas, importação em Universo sem livros, dimensões/hash, isolamento de escopo, consulta arquivada, promoção de Livro para Universo, troca de principal e reversão de falhas com limpeza do arquivo.

Os testes frontend cobrem o contrato IPC e a persistência web, incluindo falhas de quota. Playwright exercita identidade, galeria, legenda, principal, remoção, erros com nova tentativa, navegação com alterações pendentes, arquivos e acessibilidade em Chromium/Firefox. Há referências visuais nos dois temas em 440 e 1440 pixels.
