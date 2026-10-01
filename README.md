# Radar SES/TO

Portal público para leitura da demanda observável do **Edital nº 001/2026 – SECAD/SES/TO**, a partir das relações preliminares publicadas pela FGV.

## O que o site calcula

A consulta conta inscrições homologadas por cargo e local de prova/município, com filtros combináveis, busca textual, rankings, tabela paginada e exportação CSV. A métrica é chamada de **inscrições homologadas** porque os documentos não informam o número de vagas. Portanto, este projeto não apresenta concorrência por vaga, classificação, nota ou probabilidade de aprovação.

A lista complementar de pessoas pretas ou pardas é cruzada pelo número de inscrição. O painel pode filtrar e mostrar a quantidade desse recorte por cargo e município dentro dos filtros ativos, além de exportá-lo em CSV, sem inferir raça/cor a partir de nomes ou outras características. “Não identificado na lista complementar” não significa automaticamente ampla concorrência.

## Cotas

A fonte complementar contém a relação preliminar de candidatos inscritos para concorrer às vagas destinadas à pessoa preta ou parda. Foram cruzadas **9.939 inscrições** com a base principal. Essa fonte não contém outras modalidades de cota, número de vagas, resultado de heteroidentificação ou classificação; esses campos continuam indisponíveis.

## Fontes

- Edital: nº 001/2026 – SECAD/SES/TO, de 12 de agosto de 2026.
- Relação principal: `sesto-preliminar-homologacoes(1).pdf` — inscrições, nomes, cargos e locais de prova.
- Relação complementar: `sesto-preliminar-pretos-ou-pardos.pdf` — inscrições de pessoas pretas ou pardas.
- Publicação: 30 de setembro de 2026.
- Página oficial: https://conhecimento.fgv.br/concursos/sesto26
- Registros normalizados: 69.970; marcados como pessoa preta ou parda: 9.939.

## Atualizar os dados

Com Python 3 e `pdftotext` instalados:

```bash
python3 scripts/extract_data.py /caminho/inscricoes.pdf data/inscricoes.json
python3 scripts/apply_cotas.py data/inscricoes.json /caminho/pretos-ou-pardos.pdf
```

Depois, ajuste `data/metadata.json` com a data, arquivos, total e URL das novas fontes. A aplicação é estática e pode ser servida por qualquer servidor HTTP simples:

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Abra `http://localhost:3000`.

## Estrutura

- `index.html` — interface semântica.
- `src/app.js` — filtros, agregações, tabela, cota e exportação.
- `src/styles.css` — identidade visual responsiva.
- `data/` — base e metadados.
- `scripts/extract_data.py` — parser do PDF principal com tratamento de quebras de linha.
- `scripts/apply_cotas.py` — cruzamento da lista complementar pelo número de inscrição.
