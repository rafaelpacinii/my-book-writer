---
name: mbw-pr
description: "Inspecionar diff e worktree, estruturar commits convencionais e gerar comandos prontos de Git e PR via gh CLI conforme o Gitflow e o template do repositório."
---

# mbw-pr

Leia [workflow](../../../docs/development/workflow.md),
[AGENTS](../../../AGENTS.md) e o [template de PR](../../../.github/pull_request_template.md).

1. Inspecione a branch atual e a árvore de trabalho com `git status --short --branch`
   e `git diff`. Nunca execute nem prescreva `git add .`, commits sem staging
   seletivo ou pulls cegos sobre alterações locais existentes.
2. Identifique o fluxo Gitflow e a branch de destino correta:
   - `feature/*` e `fix/*` ramificam de e miram em `develop`.
   - `release/*` ramifica de `develop`, faz merge em `main` e volta para `develop`.
   - `hotfix/*` ramifica de `main`, faz merge em `main` e volta para `develop`.
3. Separe os arquivos relevantes modificados/criados por escopo (`governance`,
   `frontend`, `native`, `export`, etc.), excluindo artefatos temporários,
   logs, dumps e caches locais.
4. Estruture a mensagem de Conventional Commit:
   - Formato `<tipo>(<escopo>): <descrição no imperativo e minúsculas>`.
   - Use `feat`, `fix`, `chore`, `docs`, `refactor` ou `test`.
   - Referencie issue real quando existir (ex.: `(#123)`); não invente números.
5. Monte o comando de publicação de branch: `git push -u origin HEAD` (ou a branch
   específica).
6. Construa o comando `gh pr create` preenchendo as seções obrigatórias do
   template oficial:
   - `--base <branch_destino>`
   - `--title "<tipo>(<escopo>): <resumo>"`
   - `--body` contendo `## Summary`, `## Traceability and compatibility` (issue,
     escopo, regras BR/ADR e impacto SemVer) e `## Validation` (evidências reais
     de testes executados, separando mock/browser, SQLite e WebView2). Se houver
     telas alteradas, adicione a seção `## UI changes`.
7. Entregue os comandos em bloco pronto para cópia e execução pelo usuário,
   preservando o princípio de que o agente nunca executa commits, push ou abertura
   de PR sem solicitação explícita.
