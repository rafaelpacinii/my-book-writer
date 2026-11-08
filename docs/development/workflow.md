# Contribuir com issues, branches e versões

Leia [CONTRIBUTING](../../CONTRIBUTING.md), [regras](../../AGENTS.md) e o
[estado atual](../SYSTEM_STATE.md). Use templates de bug, funcionalidade ou dívida
técnica em `.github/ISSUE_TEMPLATE/`.

## Da necessidade ao PR

1. Descreva problema, comportamento esperado, critérios observáveis, escopo
   frontend/native/dados/docs/CI, regras BR afetadas e impacto de versão.
2. Associe uma issue existente ou prepare seu texto. Abrir issue remotamente
   precisa estar no escopo solicitado; não invente números. Pequenas correções
   documentais podem explicar o motivo diretamente no PR.
3. Crie feature/fix a partir de `develop`; mantenha branches e PRs pequenos.
   Exemplo de nome quando a issue realmente existir: `fix/123-backup-integrity`.
4. Registre a tarefa relevante em TASK.md. Implemente, atualize contratos e rode
   checks por impacto. Novo desenho arquitetural recebe ADR.
5. No PR, explique gatilho e resultado, vínculo com issue, testes realmente
   executados, limitações e impacto de versão. Use `Refs #123` para acompanhar.
   `Closes #123` só fecha automaticamente nas condições do GitHub para a branch
   padrão; merge em `develop` pode exigir fechamento manual após confirmação.
6. Revisão confirma critérios e evidência; só depois marque entrega concluída.
   Issues fechadas sem implementação não significam capacidade entregue.

## Organização no GitHub

Milestones representam a versão de entrega escolhida pelo mantenedor. Labels
recomendadas: `scope:frontend`, `scope:native`, `scope:data`, `scope:docs`,
`scope:ci`, `type:bug`, `type:feature`, `type:debt`. Templates não dependem de
labels que ainda não existem. GitHub Projects é opcional; não há board obrigatório.

O repositório traz templates e leitura manual de issues; não cria labels,
milestones, issues, PRs ou projetos automaticamente. Quando houver issues reais:

```bash
python3 scripts/sync_roadmap.py --repo rafaelpacinii/my-book-writer
python3 scripts/sync_roadmap.py --repo rafaelpacinii/my-book-writer --write
git diff -- docs/ROADMAP.md
```

Sem `--write`, o primeiro comando apenas mostra a seção gerada no terminal;
o diff só aparecerá depois de gravá-la. O script usa `gh api` em leitura com
paginação, exclui PRs e preserva o planejamento fora dos marcadores. Falha de rede
ou de parsing não substitui o roadmap. Não há sincronização automática em CI.

## Versionamento

Uma versão de aplicação para `package.json`, raiz de `package-lock.json` e seu
pacote raiz, `src-tauri/Cargo.toml`, pacote local de `src-tauri/Cargo.lock` e
`src-tauri/tauri.conf.json`. `python3 scripts/check_versions.py` verifica alinhamento.
Não alterar versões de dependências para acompanhar a versão do produto.

| Impacto | Política |
| --- | --- |
| Correção compatível | PATCH |
| Capacidade nova compatível | MINOR |
| Contrato público/persistido incompatível | MAJOR após 1.0; antes de 1.0, MINOR com migração e aviso explícito |
| Docs/refactor/CI sem mudança de produto | Não cria release por si só |

Use o maior impacto do conjunto entregue; número de commits não define versão.
Conventional Commits ajudam a descrever impacto, mas não publicam releases.
O estado atual é 0.1.0 nos manifests; não presumimos tags publicadas.

Preparação de release usa `release/0.2.0`, por exemplo, a partir de `develop`;
PR revisado para `main`, tag anotada compatível e merge de volta para `develop`.
Hotfix sai de `main` e retorna às duas branches. Versões publicadas são imutáveis.
Criar tag, enviar ou publicar depende de solicitação explícita. O workflow
Windows gera candidato para revisão, não executa esses passos.

Referências: [SemVer](https://semver.org/),
[vincular PR a issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).
