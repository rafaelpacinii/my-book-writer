# Contribuir com My Book Writer

Comece pelo [mapa de documentação](docs/README.md) e pelo
[estado atual](docs/SYSTEM_STATE.md). Não é necessário conhecer todo o código:
localize a regra de negócio, a camada afetada e os testes do comportamento.
Para trabalhar com assistentes, leia [governança de IA](docs/ai-governance.md).

## Ambiente

- Node.js 24 e npm; instale dependências com `npm ci`.
- Python 3.11+ para scripts de governança (biblioteca padrão, sem pip).
- Rust stable e dependências nativas Tauri para desenvolvimento desktop.
- Playwright/Chromium para build desktop e exportação: `npm run pdf:install`.
- GitHub CLI autenticado somente para operações de issues/PRs; não é necessário
  para editar, testar ou usar o aplicativo offline.

Veja [README](README.md) para execução local e
[pré-requisitos oficiais Tauri](https://v2.tauri.app/start/prerequisites/) para o OS.
`npm run dev` inicia prévia web; `npm run tauri dev` inicia o aplicativo nativo.
Testes nunca devem usar o banco ou manuscritos reais do usuário.

## Primeira alteração

1. Consulte issue/critério e [regras de negócio](docs/BUSINESS_RULES.md).
2. Siga [Gitflow e versionamento](docs/development/workflow.md), sem misturar
   alterações locais de outra tarefa. Não há commit/push automático por agentes.
3. Leia o AGENTS do escopo e use a skill relevante. Atualize TASK.md em mudanças
   substanciais; mantenha `page.tsx` compositivo e TSX com até 70 linhas.
4. Execute `python3 scripts/ai_checks.py verify --scope governance`, `frontend`
   ou `native` conforme o impacto; `--dry-run` lista os comandos. UI pede também
   regressões de navegador. Contratos entre camadas pedem ambos os escopos.
5. Atualize docs afetados e abra PR com evidências, limitações e issue real.

Confira a [matriz de CI](docs/development/ci-cd.md). Falha ou dependência ausente
deve aparecer no relato; não marque verificação não executada como aprovada.
