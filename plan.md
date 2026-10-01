# Portal de concorrência observável — Concurso SES/TO 2026

## Objetivo

Publicar uma consulta pública, responsiva e transparente para as inscrições homologadas do Edital nº 001/2026 – SECAD/SES/TO. A métrica exibida será o número de inscrições homologadas por cargo e local de prova. O PDF não informa vagas, modalidade de cota ou classificação por cota; esses campos ficam explicitamente indisponíveis.

## Decisões de implementação

- Aplicação estática em HTML, CSS e JavaScript, sem servidor ou banco, porque a fonte é um PDF fechado e a consulta pode ser feita inteiramente no navegador.
- Dados processados em `public/data/inscricoes.json`, acompanhados de `public/data/metadata.json`.
- `scripts/extract_data.py` reproduz a extração usando o layout XML do `pdftotext`, tratando quebras de linha de nomes e cargos.
- Interface com busca textual, filtros combináveis por cargo e local, ordenação, paginação, exportação CSV e resumos reativos.
- A concorrência é rotulada como “inscrições homologadas” e não como concorrência por vaga, porque o número de vagas não está no PDF.
- O painel de cotas mostra “indisponível na fonte” e orienta a adicionar uma publicação oficial complementar antes de fazer qualquer cálculo.

## Estrutura do projeto

- `index.html`: casca da aplicação, metadados e regiões semânticas.
- `src/app.js`: carregamento, estado de filtros, agregações, renderização, paginação e CSV.
- `src/styles.css`: sistema visual responsivo.
- `public/data/inscricoes.json`: registros normalizados.
- `public/data/metadata.json`: fonte, escopo e limitações.
- `public/manus-routes.json`: manifesto de rota exigido pelo Preview.
- `scripts/extract_data.py`: reprocessamento do PDF oficial.
- `README.md`: documentação para uso e atualização.

## Direção visual

- **Movimento:** editorial de dados públicos, com linguagem de observatório cívico e acabamento de produto analítico.
- **Princípios:** clareza antes de ornamentação; hierarquia tipográfica forte; densidade controlada; transparência incorporada à interface.
- **Paleta:** azul-marinho quase preto para confiança e legibilidade, off-white quente para reduzir o aspecto frio de sistema, âmbar para indicar atenção e um verde-azulado próprio para o estado de dado confirmado.
- **Layout:** composição assimétrica com uma faixa de contexto lateral no desktop e painel de consulta em primeiro plano; no mobile, a lateral vira uma barra de contexto empilhada.
- **Elementos assinatura:** filete vertical âmbar no logotipo, cartões com rótulos editoriais pequenos e ranking com barras de intensidade.
- **Interação:** filtros têm resposta imediata e mostram o escopo ativo; estados vazios explicam como corrigir a consulta; exportação respeita exatamente o resultado filtrado.
- **Animação:** transições curtas de opacidade e deslocamento de 4px; sem movimento contínuo ou decorativo, para manter a consulta rápida.
- **Tipografia:** `Space Grotesk` para títulos e indicadores; `Inter` para corpo, tabela e controles; fallback de sistema para carregamento resiliente.
- **Essência:** “uma lente pública para entender onde está a demanda do concurso” — precisa, verificável, direta.
- **Voz:** informativa, sem prometer o que a fonte não permite. Exemplos: “Leia a pressão de demanda por cargo.” e “O que não está no PDF continua marcado como indisponível.”
- **Marca:** wordmark “Radar SES/TO”, com um pequeno marcador circular e filete vertical que remetem a localização e leitura de dados.
- **Cor proprietária:** azul-petróleo `#0b6e69`, usado em ações e barras de dados.
