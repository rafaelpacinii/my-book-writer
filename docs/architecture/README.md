# Modelagem inicial do aplicativo de escrita

Versao 0.1 — proposta para estudo e revisao, nao implementacao do aplicativo.

## Como usar os arquivos

- `banco-de-dados.dbml`: cole o conteudo em um diagrama no https://dbdiagram.io. O arquivo descreve tabelas, campos, referencias, indices e restricoes.
- `diagrama-de-classes.puml`: abra em um renderizador PlantUML. O desenho inclui dominio e contratos dos servicos. Nao exige criar uma classe de codigo para cada retangulo.

Sintaxes consultadas: https://dbml.dbdiagram.io/docs/ e https://plantuml.com/class-diagram.

## Escopo definido

Aplicativo desktop offline com perfil local, livros, capitulos ordenaveis, texto rico, ilustracoes, notas de rodape, comentarios, controle de alteracoes, marcacao manual de revisao e exportacao PDF. Imagens ficam dentro das margens, entre paragrafos ou em pagina exclusiva, sem distorcao ou corte. A pagina exclusiva pode ter espaco livre; a legenda, se usada, tambem consome a area util. Nao ha cadastro de formatos pelo usuario.

Login, sincronizacao, EPUB e historico de versoes/caminhos alternativos ficam fora desta versao. UUIDs locais e exclusao logica ajudam a evolucao, mas NAO implementam sincronizacao. Fila de operacoes, conflitos, exclusoes remotas, transferencia de arquivos e identidade online exigirao um projeto posterior.

## Por que oito tabelas

| Tabela | Papel |
|---|---|
| local_profiles | Nome de quem usa esta instalacao; sem senha ou conta |
| book_formats | Catalogo de nomes, mercados e dimensoes |
| font_presets | Catalogo de fontes disponiveis offline |
| books | Obra, ordem na biblioteca e configuracoes de pagina |
| image_assets | Metadados de imagens copiadas para o armazenamento do app |
| chapters | Titulo, ordem e documento estruturado |
| review_comments | Comentarios que sobrevivem a exclusao de trechos |
| review_progress | Um ponto de revisao manual por capitulo |

Um livro tem zero ou mais capitulos; um capitulo pertence a exatamente um livro. Cada livro usa um formato e uma fonte. Uma imagem pertence a um livro e pode aparecer varias vezes no documento. Um capitulo possui zero ou mais comentarios e, no MVP, zero ou uma marcacao de revisao.

O sumario e calculado pelos titulos e pela ordem dos capitulos, sem tabela propria. Subtitulos internos ficam no documento; inclui-los no sumario nao faz parte da regra inicial. Numeros de pagina e posicionamento de notas dependem da paginacao no exportador, nao sao campos permanentes do banco.

## Dados relacionais e documento JSON

`chapters.content_json` e a fonte unica do conteudo: paragrafos, listas, titulos internos, marcas de formatacao, ilustracoes, notas e alteracoes controladas. Esses elementos aparecem no diagrama de classes porque possuem significado e comportamento, mesmo sem tabelas individuais.

O esquema definitivo do JSON depende da escolha e da prova do editor. O contrato minimo exige:

- IDs estaveis para blocos, notas, chamadas e alteracoes; ordem representada pela sequencia do documento.
- Texto inline com marcas de formatacao e estruturas compostas para listas/citacoes.
- Ilustracoes com asset_id, apresentacao, texto alternativo e legenda opcional. Largura parcial pode receber uma fracao da area util quando esse controle for implementado.
- Notas com ID e conteudo rico limitado, e chamadas apontando para o ID. No modelo inicial, uma chamada por nota; sem notas dentro de notas. Excluir uma chamada definitivamente remove sua nota correspondente; uma exclusao pendente preserva ambas.
- Alteracoes com ID, autoria local, data, tipo, estado e operacao reversivel. Exclusoes pendentes preservam o conteudo; formatacao guarda o antes e o depois. IDs de imagens/notas referenciados nessas operacoes permanecem validos.
- Aceitar/rejeitar altera documento e estado em conjunto. Operacoes ja decididas nao sao reaplicadas. O registro de decisoes nao equivale a um historico completo recuperavel.
- Validacao de tipos, IDs unicos, referencias existentes e versao do esquema antes da persistencia.

Comentarios ficam fora desse JSON para conservar seu ciclo de vida quando o alvo some. `anchor_json` e uma referencia versionada do editor, nao apenas um numero de caractere. Pode representar intervalos que atravessam blocos; IDs de blocos sozinhos nao bastam.

Nao manter uma segunda copia canonica de notas ou alteracoes em tabelas. Se forem necessarios indices auxiliares futuramente, devem ser derivados do documento.

## Comentarios e exclusoes

O trecho original do comentario e uma copia imutavel. Referencia e resolucao possuem estados independentes.

1. Comentar um trecho cria comentario aberto com referencia valida.
2. Propor uma exclusao preserva o trecho no controle de alteracoes e mantem o comentario vinculado.
3. Rejeitar a exclusao preserva texto e vinculo.
4. Aceitar a exclusao integral torna a referencia nula e o estado `removed`. O comentario continua aberto, preservando o trecho original.
5. Excluir sem controle de alteracoes tem o mesmo resultado final do passo 4.
6. Exclusao parcial remapeia a selecao sobrevivente. Resolver/reabrir so altera o estado do comentario.

Nunca remover comentarios em cascata por edicao de texto. Livros e capitulos possuem exclusao logica; a politica de eliminacao definitiva ainda nao foi definida.

## Revisao, concorrencia e transacoes

`content_schema_version` identifica a estrutura do JSON. `content_revision` e um contador que muda a cada edicao persistida. Nenhum dos dois armazena versoes antigas do livro.

Ao salvar, comparar a revisao esperada com a atual. Se forem diferentes, rejeitar a gravacao desatualizada e solicitar recarga/reconciliacao; nao sobrescrever silenciosamente.

Uma transacao grava documento, remapeamento dos comentarios e progresso de revisao. Isso tambem vale para aceitar/rejeitar alteracoes. Gravar separadamente permitiria que uma falha deixasse comentarios apontando para uma versao antiga.

O progresso registra a revisao efetivamente revisada pelo autor e a revisao da referencia atual. Alterar a regiao revisada marca `needs_recheck`; alterar apenas depois pode preservar a marca. Quando o editor nao conseguir determinar o impacto, marcar para rever. Se o ponto for removido, manter o registro com referencia nula e `needs_recheck = 1`. Reordenar capitulos nao muda seu conteudo.

## Ordenacao e integridade

`books.position` ordena a biblioteca; `chapters.position` ordena o livro. No MVP, reordenar o conjunto em uma transacao e atribuir posicoes consecutivas. Ler por posicao e ID para desempate. O banco nao exige posicao unica, evitando conflitos temporarios durante trocas; o servico valida a lista completa de IDs do mesmo conjunto.

As FKs impedem referencias a registros inexistentes. O servico tambem precisa verificar regras que atravessam tabelas ou JSON:

- Imagem do card e ilustracoes pertencem ao mesmo livro que as usa.
- Margens somadas deixam largura e altura uteis positivas.
- Formatos/fontes inativos continuam validos para livros antigos, mas nao para novas escolhas.
- Dimensoes de um formato utilizado sao imutaveis; mudar dimensoes requer nova entrada de catalogo.
- Nome de perfil, titulo de livro e titulo de capitulo nao sao vazios apos remover espacos. O app pode fornecer titulo inicial editavel.
- Somente referencias do mesmo capitulo podem ser remapeadas nele.

SQLite devera habilitar foreign_keys em cada conexao. O DBML e um desenho: migracoes SQLite precisam implementar e testar as restricoes. Flags inteiras usam 0/1; datas usam ISO 8601 em UTC. JSON e texto validado pelo aplicativo, com CHECK json_valid quando suportado pelo runtime adotado.

## Imagens e arquivos

Copiar imagens para uma pasta gerenciada pelo aplicativo e guardar uma chave relativa. Mover o arquivo original nao deve quebrar o livro. Nao incluir o binario em Base64 no JSON.

Como o sistema de arquivos nao participa da transacao SQLite, a importacao deve usar arquivo temporario, finalizar a copia e depois registrar no banco, com limpeza de arquivos orfaos em caso de falha. Nunca remover automaticamente arquivos ainda usados no documento ou em alteracoes controladas. Backup/exportacao do projeto precisa incluir banco E imagens.

## Catalogos e precisao

Dimensoes e margens usam micrometros inteiros: 140 mm = 140000 um. Isso evita arredondamento de ponto flutuante e permite representar exatamente medidas em polegadas.

Fonte dos formatos: https://capista.com.br/livros-tamanhos-e-formatos-mais-comuns/ . Nomes brasileiros sao rotulos propostos. Para EUA, abaixo priorizamos as polegadas publicadas, convertidas exatamente por 25,4 mm; isso corrige os arredondamentos da lista anterior. O artigo apresenta aparente erro `1203` na largura de 8 polegadas; a conversao correta e 203,2 mm.

| ID estavel | Nome | Mercado | Largura mm | Altura mm |
|---|---|---|---:|---:|
| br-110x180 | Bolso compacto | BR | 110 | 180 |
| br-125x180 | Bolso | BR | 125 | 180 |
| br-140x210 | Padrao 14 x 21 | BR | 140 | 210 |
| br-160x230 | Padrao 16 x 23 | BR | 160 | 230 |
| br-200x200 | Quadrado | BR | 200 | 200 |
| br-210x280 | Grande 21 x 28 | BR | 210 | 280 |
| br-245x300 | Grande 24,5 x 30 | BR | 245 | 300 |
| us-pocket | Pocket (4.25 x 7 in) | US | 107.95 | 177.8 |
| us-square | Infantil quadrado (8 x 8 in) | US | 203.2 | 203.2 |
| us-digest | Digest (5.5 x 8.5 in) | US | 139.7 | 215.9 |
| us-trade | US Trade / Octavo (6 x 9 in) | US | 152.4 | 228.6 |
| us-manual | Manuais e guias (8 x 10 in) | US | 203.2 | 254 |
| us-art | Livros de arte (8.5 x 11 in) | US | 215.9 | 279.4 |
| gb-a | A Format | GB | 111 | 178 |
| gb-b | B Format | GB | 129 | 198 |
| gb-demy | Demy | GB | 138 | 216 |
| gb-royal | Royal | GB | 156 | 234 |

O catalogo de fontes ainda precisa ser escolhido; nao foram presumidas fontes instaladas no computador. Cada preset deve acompanhar os arquivos necessarios ao editor e ao PDF, com permissao de distribuicao/incorporacao. O banco nao armazena um enum de formatos.

## Propostas ainda nao confirmadas

- Nome de autor independente por livro, inicialmente copiado do perfil, para permitir pseudonimos.
- Bloquear PDF final enquanto houver alteracoes pendentes. Incluir notas, omitir comentarios e marcacoes de revisao.
- Fonte/tamanho/entrelinha e margens iniciais: valores ainda a definir. Mudancas de formatacao locais sao representadas no documento.
- Sem colaboracao simultanea, respostas encadeadas a comentarios ou eliminacao definitiva no MVP.

EPUB futuro devera preservar ordem, referencias e semantica. A intencao de pagina exclusiva sera adaptada ao tipo de EPUB; nao se promete paginacao identica ao PDF.

## Como estudar e implementar

1. Leia `books` e `chapters`. Explique por que a FK fica no capitulo e por que o livro pode existir sem capitulos.
2. Cadastre os formatos e uma fonte validada; implemente criar/listar livros e capitulos com reordenacao.
3. Antes de consolidar o schema JSON, prove no editor: salvar/reabrir formatacao, notas, imagens, comentarios remapeados e aceitar/rejeitar alteracoes.
4. Implemente salvamento atomico e protecao contra gravacao de uma revisao antiga.
5. Teste comentario em trecho removido, exclusao parcial, selecao entre paragrafos e edicao antes do ponto revisado.
6. Construa PDF com imagem exclusiva, imagem entre paragrafos e nota longa perto do fim de uma pagina; valide tamanho fisico e paginacao do sumario.

O diagrama de classes descreve responsabilidades; o DBML descreve armazenamento. `DocumentoRico`, `NotaRodape` e `AlteracaoControlada` sao o exemplo principal dessa diferenca. Em Rust, structs, enums e traits podem realizar esse modelo sem heranca de classes.
