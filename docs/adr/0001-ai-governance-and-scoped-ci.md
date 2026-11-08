# ADR 0001 — Governança canônica e verificação por impacto

Data: 08/11/2026. Status: aceito para implementação nesta tarefa.

## Contexto

Regras duplicadas entre AGENTS, Codex, Copilot e rules divergiam. Documentos úteis
estavam parcialmente ignorados pelo Git e o workflow de UI estava desativado.
O usuário pediu adaptar a fórmula do ecommerce-mouses ao estúdio desktop.

## Decisão

AGENTS de raiz/escopo são canônicos. Skills de projeto vivem em `.agents/skills/`;
adapters apontam para as fontes, sem copiar políticas inteiras. Docs distinguem
regras, convenções, inventário atual, tarefa corrente e decisões duráveis.

CI usa um classificador de caminhos testado, jobs condicionais e um gate final
estável. Frontend e Rust são verificados separadamente; contratos IPC, fontes e
presets compartilhados acionam ambos. Documentação aciona governança. Alterações
desconhecidas ou impossibilidade de determinar o diff acionam verificação completa.

Issues/milestones ligam trabalho a versões; roadmap é atualizado manualmente.
A entrega produz artefato Windows por disparo manual, sem publicar uma release.
Estas escolhas foram confirmadas pelo usuário durante a tarefa.

## Consequências

Contribuidores conseguem localizar regras sem carregar todos os fontes. O custo
de CI acompanha o impacto, mas o classificador precisa acompanhar novas pastas e
dependências. Não se copiam containers, SSH, OIDC ou permissões do outro projeto.
Checks locais não comprovam a execução no GitHub nem a homologação do instalador.
Alterações futuras relevantes recebem novo ADR; não reescrever esta decisão como
se ela sempre tivesse existido.
