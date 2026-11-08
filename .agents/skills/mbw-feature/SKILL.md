---
name: mbw-feature
description: "Implementar funcionalidades relevantes no My Book Writer mantendo critérios, contratos entre camadas, memória de tarefa e evidências de verificação."
---

# mbw-feature

1. Leia [AGENTS](../../../AGENTS.md), [estado](../../../docs/SYSTEM_STATE.md),
   [regras de negócio](../../../docs/BUSINESS_RULES.md) e [TASK](../../../TASK.md).
   Inspecione o diff existente e os arquivos do comportamento solicitado.
2. Registre objetivo, critérios observáveis, regras BR e escopos afetados em TASK.
   Use issue real quando disponível; não invente referência nem exija GitHub para
   avançar localmente. Preserve decisões e autorização já fornecidas pelo usuário.
3. Trace UI → hook → cliente IPC → comando → serviço → repositório. Altere apenas
   camadas necessárias; contratos IPC exigem conferir TypeScript e Serde juntos.
4. Execute os presets de `scripts/ai_checks.py` dos escopos afetados e regressões
   relevantes. Separe resultados browser/mock, SQLite e WebView2.
5. Atualize docs/estado e ADR se houver decisão estrutural. Registre falhas e
   pendências em TASK. Entregue mudanças, evidências e comandos Git seletivos
   seguindo o [workflow](../../../docs/development/workflow.md).
