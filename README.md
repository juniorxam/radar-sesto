# Radar SES/TO

Portal público para leitura da demanda observável do **Edital nº 001/2026 – SECAD/SES/TO**, a partir do resultado preliminar de homologação de inscrições publicado pela FGV.

## O que o site calcula

A consulta conta inscrições homologadas por cargo e local de prova/município, com filtros combináveis, busca textual, rankings, tabela paginada e exportação CSV. A métrica é chamada de **inscrições homologadas** porque o PDF não informa o número de vagas. Portanto, este projeto não apresenta concorrência por vaga, classificação, nota ou probabilidade de aprovação.

## Cotas

O PDF usado como fonte contém inscrição, nome, cargo e local de prova. Ele não contém modalidade de cota, categoria de reserva, número de vagas ou classificação por cota. Por isso, a seção de cotas aparece como **indisponível na fonte**. Nenhum dado de cota é inferido a partir do nome, cargo ou município.

## Fonte

- Edital: nº 001/2026 – SECAD/SES/TO, de 12 de agosto de 2026.
- Documento: `sesto-preliminar-homologacoes(1).pdf`.
- Publicação: 30 de setembro de 2026.
- Página oficial: https://conhecimento.fgv.br/concursos/sesto26
- Registros normalizados: 69.970.

## Atualizar os dados

Com Python 3 e `pdftotext` instalados:

```bash
python3 scripts/extract_data.py /caminho/novo.pdf public/data/inscricoes.json
```

Depois, ajuste `public/data/metadata.json` com a data, arquivo, total e URL da nova fonte. A aplicação é estática: qualquer servidor HTTP simples pode servi-la, por exemplo:

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Abra `http://localhost:3000`.

## Estrutura

- `index.html` — interface semântica.
- `src/app.js` — filtros, agregações, tabela e exportação.
- `src/styles.css` — identidade visual responsiva.
- `public/data/` — base e metadados.
- `scripts/extract_data.py` — parser reproduzível do PDF com tratamento de quebras de linha.
