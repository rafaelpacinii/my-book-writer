# Tarefa atual — governança de IA e entrega

Data: 08/11/2026. Estado: implementação concluída; checks locais aprovados, execução remota pendente.

## Objetivo

Adaptar a organização de IA/docs/CI do ecommerce-mouses ao My Book Writer,
facilitando contribuição sem conhecimento integral do código. Preservar funções
do aplicativo e a alteração preexistente em `next-env.d.ts`.

## Decisões confirmadas

- Templates e sincronização manual de issues para o roadmap local.
- Artefato Windows para revisão; nenhuma publicação automática.
- Backlog prioriza backup/restauração e segurança desktop.
- Não copiar stack de e-commerce, credenciais, sandbox pessoal ou deploy SSH.

## Critérios

- [x] Mapa de documentação, negócio, convenções, estado e ADR com fontes reais.
- [x] Skills locais e adapters sem duplicação das políticas canônicas.
- [x] Runner de checks, validação de governança/versões e classificador testável.
- [x] CI separa frontend/Rust/docs e amplia em contratos compartilhados.
- [x] Templates de issues/PR e workflow manual para instalador Windows.
- [x] Executar verificações e registrar resultados finais/limites.
- [x] Revisar diff e preparar comandos Git seletivos, sem executá-los.

## Evidências desta execução

- `python3 scripts/ai_checks.py verify --scope governance`: links, metadados,
  versão 0.1.0 alinhada e **25 testes Python aprovados**. Cobertura inclui diff,
  fallback, contratos compartilhados, gate de falha/cancelamento, runner e roadmap.
- `python3 scripts/ai_checks.py verify --scope frontend`: typegen, tsc, lint,
  **112 testes Vitest (25 arquivos)**, check:ui e **1 teste Node do driver** aprovados.
- `python3 scripts/ai_checks.py verify --scope native`: fmt, cargo check --locked
  e cargo test --locked --lib aprovados: **64 passaram, 4 ignorados**. Corrigida a
  quebra de API da crate `zip 9.1.3` em `docx_package.rs`, `epub_package.rs` e `audit_tests.rs`,
  onde `entry.name()` passou a retornar `ZipResult<Cow<'_, str>>`.
- `CI=true npm run test:e2e -- src/tests/e2e/libraryNavigation.spec.ts
  --project=chromium --project=firefox`: build estático e **14 testes aprovados**.
  A primeira tentativa ficou bloqueada por sockets do sandbox; execução autorizada
  fora dessa restrição passou. A suíte E2E completa não foi executada nesta tarefa.
- `npm ci --prefix /tmp/mbw-clean-install --offline --no-audit --no-fund
  --cache /tmp/mbw-npm-cache`: instalação limpa aprovada. Há avisos preexistentes de
  peer dependencies entre plugins ESLint e ESLint 10; lint passou após ajuste TS.
- `actionlint` 1.7.7: ambos workflows aprovados. Validador oficial de skills:
  **6 skills válidas**. Formulários YAML parseados e IDs verificados.
- `git diff --check`: aprovado. `next-env.d.ts` restaurado exatamente ao conteúdo
  preexistente após geração de tipos; não faz parte da entrega.

## Limites e próximos passos

- Workflows foram validados localmente; GitHub Actions e instalador/WebView2
  Windows não foram executados. Testes PDF ignorados não equivalem a exportação
  real aprovada nesta execução. Verificar candidato antes de publicar.
- Roadmap validado com fixtures; não houve consulta/sincronização de issues reais.
- Sem criação de issue, commit, push, PR, tag, release ou proteção de branch.
- Após envio e primeiro CI, mantenedor pode configurar `CI required` na proteção
  de branch e disparar o workflow Windows quando quiser revisar um candidato.
- Próximo trabalho recomendado: integridade de backup/restauração e ativos; em
  seguida CSP/capabilities e mapeamento de erros desktop (ver ROADMAP).
