# Convenções de engenharia

As regras obrigatórias estão em [AGENTS.md](../AGENTS.md),
[src/AGENTS.md](../src/AGENTS.md) e [src-tauri/AGENTS.md](../src-tauri/AGENTS.md).
Este documento explica como navegar e alterar os contratos existentes.

## Organização e contratos

- Componentes de rota em `src/components/<rota>/`; estado e efeitos em `src/hooks/`;
  utilitários puros em `src/utils/`; DTOs compartilhados em `src/types/`.
- `src/lib/api/` é a fronteira IPC. Ao alterar um comando, conferir nome registrado
  em `src-tauri/src/lib.rs`, argumentos Serde, cliente TypeScript e testes.
- `src/lib/data/` coordena recursos/cache e invalidação. Atualizações só publicam
  eventos de sucesso depois da persistência; respostas tardias não devem trocar o
  conteúdo de outro livro/perfil/escopo.
- Rust usa comandos finos, serviços de aplicação, repositórios SQLx e modelos de
  domínio. Operações que preservam invariantes em múltiplas tabelas são atômicas.
- Não renomeie DTOs, unidades ou colunas por preferência de estilo. Dimensões
  persistidas usam micrômetros; tamanho de fonte usa pontos. Conversões precisam
  de testes de fronteira, não só de aparência no navegador.
- Tipos TypeScript não validam JSON recebido. Valide no serviço e preserve
  conflitos de revisão e códigos de erro compreensíveis para a UI.

## Persistência, exportação e erros

Use UUIDv7 para novas entidades offline e migrations SQL incrementais. Não edite
uma migration já distribuída. Teste upgrade e banco novo com dados sintéticos.
Nenhum teste pode restaurar ou sobrescrever o banco de trabalho do autor.

A prévia web usa localStorage/mocks e não comprova persistência nativa. Chromium
é preparado no build para PDF; não introduza download obrigatório na exportação.
Fontes em `public/fonts/` e o CSS `src/lib/editor/bookTypography.css` também são
incorporados por Rust: alterações ali afetam as duas camadas.
Os presets do Códice em `src-tauri/resources/codex-presets.json`
também são compartilhados com TypeScript.

Não exponha SQL, caminhos pessoais ou conteúdo do manuscrito nos diagnósticos.
Registre operação e erro seguro. O mapeamento uniforme de erros ainda possui
dívidas documentadas em [SYSTEM_STATE](SYSTEM_STATE.md).

## Interface e documentação

Leia [frontend-design](frontend-design.md) e [ui-quality](ui-quality.md) antes de
alterar UI. Preserve decisões visuais já aprovadas, temas, teclado, movimento
reduzido e estados vazio/carregando/erro/sucesso. O limite de 70 linhas TSX não pode
ser contornado removendo legibilidade.

Documentação nova de contribuição fica em português; identificadores de código
seguem o módulo existente. Commits e títulos de PR usam Conventional Commits em
inglês. Mantenha links relativos portáveis, sem caminhos da máquina do autor.
Documentos de contrato usam fatos verificáveis; planos e validações históricas
recebem status/data. Não apresente metas de desempenho como medições.

## Entrega

Use o [fluxo de contribuição](development/workflow.md), declare impacto de versão
e execute os checks dos escopos afetados. Uma alteração só em docs não exige
compilar Rust. Mudanças IPC, fontes e presets compartilhados exigem ambos os lados.
Relate falhas existentes separadamente de regressões introduzidas.
