# Regras de negócio

Contratos editoriais atuais, inventariados em 08/11/2026. IDs permanecem estáveis
para referência em issues e testes. Uma solicitação explícita pode alterar uma
regra: atualize implementação, documento e evidência juntos. Lacunas de garantia
estão em [SYSTEM_STATE](SYSTEM_STATE.md); esta tabela não certifica ausência de bugs.

| ID | Regra | Evidência e ponto de entrada |
| --- | --- | --- |
| BR-001 | O núcleo editorial funciona offline, sem login ou serviço remoto obrigatório. SQLite local é a fonte desktop. | [Conexão WAL](../src-tauri/src/database/connection.rs), [clientes IPC](../src/lib/api/) |
| BR-002 | Livros, séries, universos e fichas pertencem a um perfil local; vínculos não podem atravessar perfis. Perfil local não equivale a autenticação remota. | [Repositórios](../src-tauri/src/repositories/), [Códice](codex-data.md) |
| BR-003 | Livros podem ser independentes ou fazer parte de série/universo. Ordenar volumes recalcula a sequência da série; remover um vínculo não deve apagar o manuscrito. | [Serviço e testes de séries](../src-tauri/src/services/series_service.rs), [repositório](../src-tauri/src/repositories/series_repository.rs) |
| BR-004 | Salvamentos de capítulos respeitam a revisão esperada; uma escrita desatualizada não deve sobrescrever silenciosamente conteúdo novo. | [Capítulos](../src-tauri/src/repositories/chapter_repository.rs), [teste de concorrência](../src/tests/e2e/versionHistoryConcurrency.spec.ts) |
| BR-005 | Restaurar versão salva uma cópia de segurança do estado substituído na mesma transação. Snapshots automáticos exigem conteúdo alterado e intervalo de 180 segundos ou alteração de pelo menos 30 palavras, segundo a política atual. | [Serviço](../src-tauri/src/services/chapter_version_service.rs), [política](../src-tauri/src/services/chapter_version_policy.rs) |
| BR-006 | Revisões e sugestões devem preservar ancoragem e detectar conteúdo concorrente; aceitar/rejeitar não pode editar outro capítulo. | [Revisão](../src-tauri/src/services/review_service.rs), [testes](../src-tauri/src/services/review_tests.rs) |
| BR-007 | O Códice pertence a um livro ou universo; associação a universo promove fichas locais atomicamente. Desassociar não copia fichas compartilhadas. | [Contrato de escopo](codex-data.md), [testes](../src-tauri/src/services/codex/tests/scopes.rs) |
| BR-008 | Contextos arquivados preservam consulta; alterações são bloqueadas. Modelos copiam estrutura, sem conteúdo pessoal ou imagens; presets originais são protegidos. | [Códice](codex-data.md), [modelos](../src-tauri/src/services/codex/templates.rs) |
| BR-009 | Galeria usa ativos locais gerenciados; imagem principal, ordem e exclusão respeitam a ficha e seu perfil. | [Galeria](codex-sheet.md), [serviço](../src-tauri/src/services/codex/gallery.rs) |
| BR-010 | PDF, EPUB e DOCX são gerados no desktop. PDF depende de Chromium local; EPUB/DOCX não dependem de disponibilidade do PDF. Falhas de conteúdo devem identificar o que corrigir. | [Exportação](../src-tauri/src/services/export/), [auditoria histórica](export-audit.md) |
| BR-011 | Configurações físicas, fontes e front matter orientam exportação. Igualdade visual entre leitores externos não é garantida por validação estrutural. | [Validação](../src-tauri/src/services/export/validation.rs), [auditoria](export-audit.md) |
| BR-012 | Backup/restauração deve preservar o trabalho e validar o banco antes da substituição. O backup atual é SQLite; não prometer portabilidade completa dos arquivos de imagens externos. | [Serviço de backup](../src-tauri/src/services/backup_service.rs), [limitações](SYSTEM_STATE.md) |

Não há regra de pagamento, tenancy, autenticação OIDC ou sincronização remota
implementada a importar do e-commerce. Adições nesses domínios exigem desenho de
produto e contratos próprios, sem tornar o fluxo offline dependente da nuvem.
