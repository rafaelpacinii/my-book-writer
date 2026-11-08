# Documentação — My Book Writer

Para contribuir sem conhecer todo o código, siga esta ordem:

1. [Contribuir](../CONTRIBUTING.md): ambiente e primeira alteração.
2. [Estado do sistema](SYSTEM_STATE.md): o que existe, onde está e limitações.
3. [Regras de negócio](BUSINESS_RULES.md): invariantes editoriais e evidências.
4. [Convenções](CONVENTIONS.md) e [governança de IA](ai-governance.md): como trabalhar.
5. [Workflow](development/workflow.md) e [CI/CD](development/ci-cd.md): issues,
   versões, checks por escopo e candidato Windows.

| Documento de governança | Quando consultar |
| --- | --- |
| [AGENTS](../AGENTS.md) | Política canônica e regras por camada |
| [TASK](../TASK.md) | Objetivo, decisões e evidências da tarefa corrente |
| [Roadmap](ROADMAP.md) | Prioridades propostas e espelho manual de issues |
| [ADR 0001](adr/0001-ai-governance-and-scoped-ci.md) | Decisão sobre governança e CI |

Os contratos especializados abaixo continuam nos caminhos existentes. Documentos
com cronograma por dia são histórico/especificação; não substituem o estado atual.
O guia visual original é preservado como histórico. As imagens do protótipo podem
existir apenas no ambiente do autor; para desenvolvimento atual, use
`frontend-design.md`, `ui-quality.md` e os componentes.

---

## Índice da Documentação

| Documento | Descrição | Público Principal |
| :--- | :--- | :--- |
| [**Desenvolvimento do Frontend**](frontend-design.md) | Processo de referências visuais e escolha, layout desktop, componentes compartilhados, estados, movimento e revisão de UX/UI. | Agentes, Designers, Desenvolvedores Frontend |
| [**Guia de Implementação da Interface**](guia-implementacao-ui.md) (histórico) | Direção de produto, filosofia visual de geometria editorial, tokens de cores, tipografia e detalhamento de cada tela do aplicativo. | Designers, Desenvolvedores Frontend, Avaliadores |
| [**Roadmap de Funcionalidades & Códice**](roadmap-funcionalidades.md) | Plano estratégico e cronograma diário para Universos, Séries, Códice (Personagens e Lugares) e Dossiê Narrativo. | Produto, Desenvolvedores |
| [**Motor de Dados do Códice**](codex-data.md) | Esquema SQLite, escopos compartilhados, presets, API Tauri/TypeScript e contratos para os próximos dias. | Desenvolvedores |
| [**Hub do Códice**](codex-hub.md) | Navegação, filtros por contexto, criação por modelos, consulta e critérios de validação da interface. | Produto, Desenvolvedores |
| [**Ficha Visual e Galeria**](codex-sheet.md) | Identidade, imagens locais, principal, migração de ativos e validação da ficha do Dia 6. | Produto, Desenvolvedores |
| [**Abas Customizáveis e Campos Dinâmicos**](codex-tabs.md) | Categorias, campos dinâmicos (texto, escala, tags, vínculos), modelos e validação do Dia 7. | Produto, Desenvolvedores |
| [**Protótipo Editorial & Catálogo Visual**](prototipo-ui/README.md) | Especificação das 44 telas e estados do protótipo navegável, exportação vetorial (SVG) e imagens em alta resolução (PNG). | Recrutadores, Avaliadores de UI/UX, Desenvolvedores |
| [**Critérios de Qualidade de UI & Checklist**](ui-quality.md) | Checklist de aceitação visual, acessibilidade, suporte a temas claro/escuro, escala de tela e processo de validação nativa. | Engenheiros de QA, Desenvolvedores |
| [**Regras de Desenvolvimento do Projeto**](../AGENTS.md) | Padrões de código, fluxo Gitflow, convenções de commits e diretrizes para agentes de inteligência artificial. | Contribuidores, Desenvolvedores, Avaliadores de Código |

---

## 1. Visão Geral da Arquitetura

O My Book Writer foi projetado para oferecer independência da nuvem com desempenho nativo:

```
┌──────────────────────────────────────┐
│        Frontend (Next.js 16)         │ ───► Interface limpa, acessível e sem SSR em runtime
└──────────────────┬───────────────────┘
                   │ IPC (Tauri v2 invoke)
┌──────────────────▼───────────────────┐
│         Rust Core (Tauri v2)         │ ───► Camada de regras de negócio, serviços e exportação
└──────────────────┬───────────────────┘
                   │ SQLx
┌──────────────────▼───────────────────┐
│          SQLite Local (WAL)          │ ───► Persistência atômica com UUIDv7 ordenável
└──────────────────────────────────────┘
```

### Princípios Chave:
1. **Local-First & Soberania**: Todos os livros, capítulos, versões e configurações são salvos diretamente no dispositivo do usuário em banco SQLite com modo WAL (`Write-Ahead Logging`).
2. **Separação de Responsabilidades**:
   - `src/`: código de apresentação estritamente visual em React/Next.js. **Nunca acessa o SQLite ou o sistema de arquivos diretamente**.
   - `src-tauri/`: operações nativas, serviços de aplicação, repositórios SQLx e exportação PDF via Chromium headless.
3. **Limite de 70 Linhas por Componente**: cada arquivo `.tsx` possui no máximo 70 linhas, incentivando a extração de hooks de comportamento e a componentização granular.

---

## 2. Catálogo de Telas e Protótipo Visual

O protótipo visual do projeto foi construído inteiramente em SVG puro e inspecionável, sem depender de imagens rasterizadas externas. 

* **Visualização Geral**: `docs/prototipo-ui/visao-geral.png` (local opcional)
* **Arquivos PNG Exportados**: `docs/prototipo-ui/png/` (local opcional) (94 imagens cobrindo todos os fluxos e estados nos temas claro e escuro)
* **Arquivos Vetoriais SVG**: `docs/prototipo-ui/telas/` (local opcional)

Para executar o protótipo interativo no navegador local:
```bash
python3 -m http.server 4178 --bind 127.0.0.1
```
Acesse [http://127.0.0.1:4178/src/prototype/index.html](http://127.0.0.1:4178/src/prototype/index.html).

---

## 3. Como Executar e Validar o Projeto

Para verificação completa, os comandos abaixo continuam disponíveis. No trabalho
diário e no CI de PR, execute apenas os escopos afetados conforme a
[matriz de CI](development/ci-cd.md). Documentação usa o preset governance:

```bash
# 1. Verificação de tipos e linting do frontend
npx tsc --noEmit
npm run lint

# 2. Testes unitários e de integração
npm test

# 3. Testes End-to-End com Playwright
npm run test:e2e

# 4. Verificação e testes do backend nativo em Rust
cd src-tauri
cargo fmt --check
cargo check
cargo test --lib
```
