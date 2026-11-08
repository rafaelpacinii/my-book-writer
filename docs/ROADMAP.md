# Roadmap de engenharia e produto

Atualização inicial: 08/11/2026. Propostas locais, **sem issues remotas criadas** e
sem promessa de versão/data. O [plano de funcionalidades](roadmap-funcionalidades.md)
preserva o detalhamento de universos, Códice e dossiê narrativo.

| Prioridade | Trabalho | Critério de conclusão | Escopo |
| --- | --- | --- | --- |
| P1 | Backup/restauração confiável e completo | Testar checkpoint/falha de cópia/concorrência/upgrade; restaurar SQLite e ativos em instalação isolada sem perder o original | native, data |
| P1 | Segurança do runtime desktop | Inventariar capabilities, CSP, acesso a arquivos e erros; validar política com editor, galeria e exportação | native, frontend |
| P2 | Homologação do instalador Windows | Instalar/atualizar/desinstalar em ambiente isolado, verificar dados preservados e exportação offline | CI, native |
| P2 | Contratos IPC e erros consistentes | Mapear DTOs/códigos e cobrir mudanças incompatíveis; eliminar exceções demonstradas sem refatoração ampla | native, frontend |
| P2 | Dossiê narrativo e histórico | Critérios detalhados no plano de funcionalidades; confirmar dependências antes de iniciar | native, frontend, data |
| P3 | Métricas de responsividade | Benchmark reproduzível de salvamento, biblioteca e exportação com fixtures sintéticas | native, frontend |

As duas primeiras prioridades foram confirmadas pelo usuário. Defina milestone
quando o escopo de release for escolhido. A seção abaixo é um espelho de issues;
estado fechado não prova, por si só, que uma funcionalidade está implementada.

<!-- BEGIN:github-issues -->
Ainda não sincronizado. Execute `python3 scripts/sync_roadmap.py --write` com
GitHub CLI autenticado para atualizar esta seção manualmente.
<!-- END:github-issues -->
