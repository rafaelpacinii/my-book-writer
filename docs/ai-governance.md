# Programar com IA no My Book Writer

Comece por [AGENTS.md](../AGENTS.md), [TASK.md](../TASK.md) e
[SYSTEM_STATE.md](SYSTEM_STATE.md). O objetivo é encontrar os contratos da tarefa
sem carregar o repositório inteiro. A organização foi adaptada do ecommerce-mouses;
Angular, Quarkus, PostgreSQL, pagamentos, R2 e deploy por SSH não se aplicam aqui.

## Fontes de orientação

| Fonte | Responsabilidade |
| --- | --- |
| `AGENTS.md` e os dois arquivos de escopo | Política canônica, arquitetura e limites |
| `docs/BUSINESS_RULES.md` | Invariantes de produto com IDs estáveis e evidências |
| `docs/CONVENTIONS.md` | Convenções que complementam os verificadores |
| `docs/SYSTEM_STATE.md` | Inventário atual, limitações e fontes de verdade |
| `docs/adr/` | Decisões arquiteturais e suas consequências |
| `TASK.md` | Memória curta da tarefa em andamento, não um backlog paralelo |
| `.agents/skills/*/SKILL.md` | Procedimentos reutilizáveis, carregados por relevância |
| `.agents/rules/` | Índice de regras por assunto; leitura explícita ou por adapter |
| `.agents/project.toml` | Comandos consumidos por `scripts/ai_checks.py` |
| `.codex/instructions.md`, `CLAUDE.md`, `.github/copilot-instructions.md` | Entradas curtas apontando às fontes canônicas |

As rules não são um sandbox nem são automaticamente aplicadas por todo editor.
O mecanismo de descoberta depende do cliente. Codex descobre skills de projeto em
`.agents/skills/`; uma conversa nova permite recarregar o catálogo. Use `$mbw-feature`
ou indique explicitamente o caminho da skill quando o cliente não a descobrir.
Não duplicamos skills em diretórios globais ou aliases. Também não copiamos o
perfil de permissões do e-commerce: ele bloqueia caminhos e ferramentas daquele
projeto. As permissões continuam sob controle do ambiente e do usuário.

## Skills e exemplos

| Skill | Quando usar |
| --- | --- |
| `mbw-feature` | Funcionalidade relevante, integração entre camadas e handoff |
| `mbw-frontend` | React, hooks, estado de interface e clientes IPC |
| `mbw-native` | Comandos Tauri, serviços Rust e repositórios SQLx |
| `mbw-migration` | Evolução de SQLite e compatibilidade de dados existentes |
| `mbw-export` | PDF/EPUB/DOCX, fontes locais e fidelidade editorial |
| `mbw-release` | Preparar versão, rastreabilidade e artefato Windows |
| `mbw-pr` | Inspecionar diff, estruturar commit convencional e gerar comando de PR via gh |

```text
Use $mbw-feature e $mbw-frontend para implementar o comportamento desta issue.
Leia as regras BR relacionadas e registre critérios e evidências em TASK.md.

Use $mbw-migration para planejar e implementar esta alteração de esquema.
Valide banco novo e upgrade de uma fixture da versão anterior.

Use $mbw-release para preparar o candidato; não publique a release.
```

Skills não autorizam publicação, criação de issues ou uso de dados reais. Não
registram subagentes nem exigem delegação. Autorização já dada pelo usuário vale
para os passos correspondentes; não introduza confirmações repetidas.

## Contexto e memória

Leia primeiro o mapa, depois o contrato e os arquivos afetados. Exclua de coleta
em massa `.git/`, `node_modules/`, `.next/`, `out/`, `src-tauri/target/`, Chromium
empacotado, imagens de referência, relatórios, `.env*`, chaves e backups SQLite.
Lockfiles podem ser lidos para diagnosticar dependências; não precisam entrar em
todo prompt. Não abra `docs/testes/` para conhecer o domínio: pode conter manuscritos.
Essas orientações não substituem controles de acesso do cliente.

Em TASK.md registre mudanças de decisão, comandos com resultados e próximos
passos concretos. Ao concluir, mantenha um resumo de handoff; a próxima tarefa
substancial substitui esse resumo. Histórico permanente vive em issues/PRs/ADRs.
Em trabalho simultâneo, cada branch/worktree mantém sua tarefa.

## Verificação e manutenção

```bash
python3 scripts/ai_checks.py verify --scope governance
python3 scripts/ai_checks.py verify --scope frontend --dry-run
python3 scripts/ai_checks.py verify --scope native
```

O runner executa arrays de argumentos sem shell, com diretório explícito e falha
no primeiro erro. Não instala dependências nem acessa GitHub implicitamente.
O verificador confere links das novas entradas, metadados das skills, orçamento
dos entrypoints e alinhamento de versões. Ele não certifica a qualidade semântica
das instruções nem todos os links históricos da documentação.

Atualize o estado quando uma capacidade mudar; registre decisão estrutural em ADR.
Não copie saídas de testes antigas como evidência da tarefa atual. Para CI e
entrega, leia [ci-cd](development/ci-cd.md); para issues, [workflow](development/workflow.md).

Referências: [skills oficiais do Codex](https://developers.openai.com/codex/skills/)
e [skills em manutenção de projetos](https://developers.openai.com/blog/skills-agents-sdk).
