# Roadmap de Funcionalidades & Arquitetura de Expansão — My Book Writer

> **Visão de Produto**: Evoluir o *My Book Writer* de um editor e exportador de livros para um **Estúdio Editorial e de Worldbuilding Local-First**, integrando organização de obras (**Universos** e **Séries**), construção de mundo (**Códice**: Personagens, Lugares e Lore) e escrita do manuscrito de forma coesa e sem inflar a aplicação.

---

## 1. Decisões Alinhadas de Produto e Arquitetura

1. **Nomenclatura Oficial na Interface**:
   * **Universo**: Agrupador de mundo compartilhado entre livros e séries (ex: *Legendarium / Terra-média*, *Cosmere*).
   * **Série**: Agrupador sequencial de livros com numeração automática de volumes (`Vol. 1`, `Vol. 2`, `Vol. 3`...) e reordenação livre pelo autor.
   * **Códice**: Hub unificado onde vivem as fichas de **Personagens**, **Lugares** (cidades, países, reinos, locais) e **Conceitos/Itens**.
2. **Regra de Escopo e Compartilhamento do Códice**:
   * Quando um livro pertence a um **Universo** (diretamente ou por meio de uma **Série** vinculada àquele Universo), as fichas de Personagens e Lugares pertencem ao **Universo**, sendo compartilhadas automaticamente entre todos os livros daquele mundo.
   * Quando um livro é uma obra avulsa (sem Universo), suas fichas pertencem diretamente ao **Livro**. Caso o livro seja posteriormente vinculado a um Universo, suas fichas passam a integrar o Códice daquele Universo sem perda de dados.
3. **Arquitetura de Rotas do Códice**:
   * Motor único no SQLite/Rust (`codex_entities`, `codex_categories`, `codex_fields`, `codex_documents`, `codex_relations`) discriminado por tipo (`character`, `location`, `lore`).
   * Hub unificado em `/codex` com abas por categoria, página de ficha em `/codex/sheet` e editor narrativo focado com histórico de versões em `/codex/editor`.

---

## 2. Hierarquia de Domínio

```mermaid
flowchart TD
    U["🌌 Universo (Opcional)<br/>Ex: Legendarium / Terra-média"]
    S1["📚 Série (Opcional)<br/>Ex: O Senhor dos Anéis (Vol. 1, 2, 3)"]
    B1["📖 Livro 1: A Sociedade do Anel (Vol. 1)"]
    B2["📖 Livro 2: As Duas Torres (Vol. 2)"]
    B3["📖 Livro Standalone: O Silmarillion"]
    C["🗂️ Códice (Personagens, Lugares, Lore)<br/>Compartilhado no Universo ou vinculado ao Livro"]

    U --> S1
    U --> B3
    S1 --> B1
    S1 --> B2
    U -.->|"Compartilha fichas"| C
    B1 -.->|"Consulta Rápida no Editor"| C
    B2 -.->|"Consulta Rápida no Editor"| C
```

---

## 3. Especificação das Fichas do Códice (Inspiração *Arc Raiders RPG Sheet*)

As fichas de **Personagens** e **Lugares** combinam estética de dossiê tático/editorial com flexibilidade total:

### 3.1. Estrutura Visual em Duas Colunas
* **Coluna Esquerda (Identidade & Galeria)**:
  * **Galeria Múltipla de Imagens**: Retrato principal + miniaturas navegáveis vinculadas à infraestrutura local `image_assets` (SHA-256).
  * **Classificação Rápida**: Papel na trama (*Protagonista*, *Antagonista*, *Secundário*, etc.), Status (*Vivo*, *Falecido*, *Desaparecido* ou customizado) e Título/Arquétipo.
  * **Tags Rápidas & Aparições**: Emblemas de traços marcantes e contagem automática de capítulos/livros onde a entidade aparece.
* **Coluna Direita (Abas de Categorias & Campos Customizáveis)**:
  * **Abas Gerenciáveis pelo Usuário**: O autor pode criar, renomear, reordenar e excluir categorias (ex: *Dados Gerais*, *Características Físicas*, *Psicologia*, *Relações*, *Sistema de Magia*).
  * **Campos Pré-estabelecidos Removíveis + Campos Livres**:
    1. **Texto Curto**: Nome de nascimento, idade, ocupação, clima, população, governo.
    2. **Texto Longo**: Resumo rápido, peculiaridades, atmosfera sensorial.
    3. **Tags / Lista**: Virtudes, defeitos, idiomas, recursos.
    4. **Barra de Atributo / Escala (0–100)**: Inspirado em fichas de RPG (ex: *Liderança*, *Diplomacia*, *Periculosidade*, *Influência*).
    5. **Vínculo com Outra Ficha**: Conecta personagens a outros personagens (*Aliado*, *Rival*, *Mentor*) ou a lugares (*Cidade Natal*, *Sede*).
    6. **Documento Narrativo Focado (`/codex/editor`)**: Abre um editor de texto rico idêntico ao editor de capítulos, **sem** barra lateral de capítulos, **sem** exportação/visualização/revisão e **sem** modo paginado, mas **com Histórico de Versões (Snapshots e Diff)**.
  * **Modelos de Ficha (Templates)**: Botão *"Salvar como Modelo"* para que o autor reutilize sua estrutura favorita de abas e campos em novos personagens ou lugares.

---

## 4. Cronograma de Implementação Diário (Vertical Slices)

Cada etapa diária entrega uma fatia funcional completa, validada por testes automatizados (`cargo test`, `vitest`, `playwright`) e respeitando o limite de 70 linhas por `.tsx`.

### Fase 1 — Organização da Biblioteca: Universos e Séries
- [x] **Dia 1 — Banco de Dados, Backend Rust e API Frontend para Universos e Séries** *(Concluído)*
  - Migration SQLite (`universes`, `book_series` e vínculo em `books` com `universe_id`, `series_id` e numeração automática `series_volume`).
  - Domínio, Repositórios SQLx, Serviços de aplicação (numeração automática `1..N`, reordenação atômica de volumes, herança de universo e limpeza segura em soft-delete) e Comandos Tauri IPC.
  - Tipos TypeScript, cliente IPC/localStorage (`src/lib/api/series.ts` e `src/lib/api/universes.ts`), recursos reativos e testes unitários/integração.
- [ ] **Dia 2 — Gestão de Séries na Biblioteca (`/library`)**
  - Criação, edição e exclusão de Séries na Biblioteca.
  - Agrupamento visual de livros por Série, badge automático de volume (`Vol. 1`, `Vol. 2`...) e reordenação *drag-and-drop* dos livros dentro da série.
  - Seleção de Série diretamente na criação/configuração do livro.
- [ ] **Dia 3 — Gestão de Universos na Biblioteca (`/library`)**
  - Criação, edição e exclusão de Universos Literários.
  - Associação de Séries e Livros a um Universo e filtros rápidos na Biblioteca (*Todos*, *Séries*, *Universos*).

### Fase 2 — O Códice: Fichas de Personagens e Lugares
- [ ] **Dia 4 — Motor de Dados do Códice (SQLite + Rust + API)**
  - Migration para `codex_entities`, `codex_entity_images`, `codex_categories`, `codex_fields` e `codex_templates`.
  - Presets iniciais automáticos para *Personagem* e *Lugar*, repositórios SQLx, serviços e comandos Tauri.
- [ ] **Dia 5 — Hub do Códice (`/codex`) & Criação com Presets**
  - Entrada **Códice** na navegação lateral, listagem em cards com abas (*Personagens*, *Lugares*, *Conceitos*), filtro por Universo/Livro e modal de criação rápida.
- [ ] **Dia 6 — Ficha Visual (`/codex/sheet` — Coluna Esquerda & Galeria Múltipla)**
  - Layout inspirado no *Arc Raiders RPG Sheet*: galeria com múltiplas imagens vinculadas à ficha, seletor de foto principal, status, papel na história e tags.
- [ ] **Dia 7 — Abas Customizáveis, Campos Dinâmicos e Modelos de Ficha**
  - Coluna direita da ficha: gerenciamento de abas (categorias), adição/remoção/edição de campos (texto, escala/barra estilo RPG, tags, vínculo entre fichas) e salvamento de Modelos (*Templates*).

### Fase 3 — Dossiê Narrativo com Histórico de Versões
- [ ] **Dia 8 — Editor de Documento Narrativo do Códice (`/codex/editor`)**
  - Tipo de campo que redireciona para o editor focado (mesma experiência de escrita de capítulos, sem barra lateral de capítulos, exportação, visualização, revisão ou modo paginado).
- [ ] **Dia 9 — Histórico de Versões para Documentos do Códice**
  - Criação automática e manual de snapshots, visualização de diff e restauração de versões nos documentos longos de personagens e lugares.

### Fase 4 — Conexão Manuscrito ↔ Mundo & Produtividade Editorial
- [ ] **Dia 10 — Vínculo Capítulo ↔ Personagens/Lugares & Quadro de Trama**
  - Marcar POV (Ponto de Vista), personagens presentes e local da cena nos capítulos, alimentando automaticamente a seção *"Aparições no Manuscrito"* nas fichas do Códice.
- [ ] **Dia 11 — Gaveta de Consulta Rápida (*Quick Peek*) no Editor de Capítulos**
  - Painel lateral deslizante dentro do editor de capítulos para consultar qualquer ficha de Personagem ou Lugar sem interromper a escrita.
- [ ] **Dia 12 — Metas de Escrita & Linha do Tempo do Universo**
  - Metas de palavras por livro e diárias + visão cronológica de eventos do Universo.
