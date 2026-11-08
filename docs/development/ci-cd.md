# CI por escopo e entrega desktop

O e-commerce de referência separa API/web e entrega containers. Aqui o backend é
Rust embarcado: a entrega é um instalador, sem servidor de produção ou deploy SSH.

## Verificação

`.github/workflows/verify.yml` roda em PRs para `develop`/`main`, pushes nessas
branches, merge queue e disparo manual. Não há filtro `paths` no gatilho; um job
classifica o diff e seleciona as suítes. Governança roda sempre, sem npm/Rust.

| Alteração | Governança | Frontend | Rust | Browser |
| --- | --- | --- | --- | --- |
| Docs, AGENTS, skills/rules | Sim | Não | Não | Não |
| Componentes, hooks, CSS, assets de UI | Sim | Sim | Não | Sim |
| Serviços/repositórios Rust, migrations, Cargo | Sim | Não | Sim | Não |
| Clientes IPC, tipos TS, comandos/modelos Rust | Sim | Sim | Sim | Sim |
| Fontes, CSS editorial, presets compartilhados, configuração/capabilities Tauri | Sim | Sim | Sim | Sim |
| package.json/lock (Tauri/Chromium também dependem deles) | Sim | Sim | Sim | Sim |
| Workflows/scripts, caminho desconhecido, diff indisponível | Sim | Sim | Sim | Sim |

PR para `main`, push em `main`, merge queue e execução manual fazem verificação
completa. PRs usam merge-base entre base/head; pushes usam before/head. O diff
inclui exclusões e os dois lados de renomeações. Não há limite de 300 arquivos do
filtro remoto; histórico ausente amplia checks em vez de dispensá-los.

`scripts/ci_scope.py` contém a classificação e testes de regressão.
Para diagnosticar sem executar testes:

```bash
python3 scripts/ci_scope.py src/components/library/Main.tsx
python3 scripts/ci_scope.py src-tauri/src/services/book_service.rs
python3 scripts/ci_scope.py docs/BUSINESS_RULES.md
```

Comandos locais vêm de `.agents/project.toml`; não são opções nativas do Codex.
Frontend faz typegen, tsc, lint, Vitest, check:ui e testes do driver. Rust faz fmt,
check e testes de biblioteca com lockfile. Browser executa Playwright sobre a
exportação estática isolada existente, com Chromium e Firefox. Fixtures browser
não acessam o SQLite pessoal. Relatórios têm retenção de sete dias.

O job **CI required** sempre avalia os resultados. Job selecionado com falha,
cancelamento ou skip inesperado bloqueia o gate. Skip só é aceito para escopo
dispensado pelo classificador. No GitHub, configure esse único check como
obrigatório após sua primeira execução; não exija cada job condicional.
Essa configuração é administrativa e **não foi aplicada** por estes arquivos.
Conforme a [documentação do GitHub](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks),
filtrar um workflow inteiro pode deixar checks obrigatórios pendentes.

## Artefato Windows para revisão

`windows-artifact.yml` aceita somente `workflow_dispatch`. Primeiro chama a
verificação completa; depois usa Windows 2022, Chromium, WebView2/EdgeDriver e
tauri-driver. Compila a aplicação de teste com identificador/banco isolados e
executa `npm run test:native`, preservando a preparação do antigo workflow de UI.

Depois compila o instalador NSIS normal em diretório de target separado e anexa
instalador, SHA-256 e commit de origem. Não usa `contents: write`, não cria tag,
não publica GitHub Release e não instala sobre os dados do autor. Disparo remoto
é uma ação explícita do mantenedor. O workflow precisa estar disponível na branch
padrão para aparecer no seletor manual do GitHub.

Artifact bem gerado não certifica assinatura de código, atualização automática,
instalação/upgrade ou inspeção de DPI. Antes de uma release pública, seguir
[ui-quality](../ui-quality.md), testar instalador em máquina isolada e registrar
exportação offline, preservação dos dados e limites da assinatura. Falhas impedem
produzir candidato; não use `continue-on-error` para tornar suíte verde.

## Dependências e manutenção

Dependabot já acompanha npm, Cargo e Actions com destino `develop`; a configuração
foi preservada. Mudanças de Actions/classificador ampliam verificações. Nenhum
certificado, secret de publicação ou serviço remoto novo é necessário para CI.

O compilador continua TypeScript 7 pelo alias `@typescript/native`; `typescript`
aponta à API de compatibilidade `@typescript/typescript6`, usada por ESLint e pelo
check de AST. O arranjo segue a
[orientação da Microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
Ao atualizar dependências, valide `npm ci`, lint, check:ui e typecheck juntos.
