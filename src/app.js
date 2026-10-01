const state = {
  records: [],
  filtered: [],
  search: '',
  cargo: '',
  municipio: '',
  sortKey: 'nome',
  sortDirection: 'asc',
  page: 1,
  pageSize: 25,
};

const $ = (selector) => document.querySelector(selector);
const number = new Intl.NumberFormat('pt-BR');
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

function populateOptions(records) {
  const cargos = [...new Set(records.map((record) => record.cargo))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const municipios = [...new Set(records.map((record) => record.municipio))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('#cargoSelect').insertAdjacentHTML('beforeend', cargos.map((cargo) => `<option value="${escapeHtml(cargo)}">${escapeHtml(cargo)}</option>`).join(''));
  $('#municipioSelect').insertAdjacentHTML('beforeend', municipios.map((municipio) => `<option value="${escapeHtml(municipio)}">${escapeHtml(municipio)}</option>`).join(''));
}

function applyFilters() {
  const needle = normalize(state.search.trim());
  state.filtered = state.records.filter((record) => {
    const matchesSearch = !needle || [record.inscricao, record.nome, record.cargo, record.localProva].some((field) => normalize(field).includes(needle));
    return matchesSearch && (!state.cargo || record.cargo === state.cargo) && (!state.municipio || record.municipio === state.municipio);
  });
  const maxPage = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  state.page = Math.min(state.page, maxPage);
  render();
}

function aggregate(records, field) {
  const counts = new Map();
  records.forEach((record) => counts.set(record[field], (counts.get(record[field]) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
}

function renderRankings(records, field, target, countTarget) {
  const values = aggregate(records, field);
  const top = values.slice(0, 5);
  $(countTarget).textContent = `${number.format(values.length)} ${field === 'cargo' ? 'cargos' : 'municípios'}`;
  if (!top.length) {
    $(target).innerHTML = '<div class="empty-ranking">Nenhum registro neste recorte.</div>';
    return;
  }
  const max = top[0][1];
  $(target).innerHTML = top.map(([name, count]) => `<div class="rank-row"><div class="rank-name-line"><span class="rank-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span><span class="rank-value">${number.format(count)}</span></div><div class="rank-track"><div class="rank-fill" style="width:${Math.max(5, (count / max) * 100)}%"></div></div></div>`).join('');
}

function sortedRecords(records) {
  return [...records].sort((a, b) => {
    const first = String(a[state.sortKey]).toLocaleLowerCase('pt-BR');
    const second = String(b[state.sortKey]).toLocaleLowerCase('pt-BR');
    const result = first.localeCompare(second, 'pt-BR', { numeric: state.sortKey === 'inscricao' });
    return state.sortDirection === 'asc' ? result : -result;
  });
}

function renderTable() {
  const records = sortedRecords(state.filtered);
  const start = (state.page - 1) * state.pageSize;
  const visible = records.slice(start, start + state.pageSize);
  if (!visible.length) {
    $('#recordsBody').innerHTML = '<tr><td colspan="4" class="empty-cell"><strong>Nenhum registro encontrado</strong>Tente remover um filtro ou usar outro termo de busca.</td></tr>';
  } else {
    $('#recordsBody').innerHTML = visible.map((record) => `<tr><td>${escapeHtml(record.inscricao)}</td><td>${escapeHtml(record.nome)}</td><td>${escapeHtml(record.cargo)}</td><td>${escapeHtml(record.localProva)}</td></tr>`).join('');
  }
  const totalPages = Math.max(1, Math.ceil(records.length / state.pageSize));
  const from = records.length ? start + 1 : 0;
  const to = Math.min(start + state.pageSize, records.length);
  $('#resultSummary').textContent = records.length ? `Mostrando ${number.format(from)}–${number.format(to)} de ${number.format(records.length)} registros` : '0 registros no recorte';
  $('#pageInfo').textContent = `Página ${number.format(state.page)} de ${number.format(totalPages)}`;
  $('#previousPage').disabled = state.page <= 1;
  $('#nextPage').disabled = state.page >= totalPages;
  document.querySelectorAll('.sort-button').forEach((button) => {
    button.querySelector('span').textContent = button.dataset.sort === state.sortKey ? (state.sortDirection === 'asc' ? '↑' : '↓') : '↕';
  });
}

function render() {
  const cargoCount = new Set(state.filtered.map((record) => record.cargo)).size;
  const municipioCount = new Set(state.filtered.map((record) => record.municipio)).size;
  $('#filteredTotal').textContent = number.format(state.filtered.length);
  $('#filteredCaption').textContent = `de ${number.format(state.records.length)} na base completa`;
  $('#cargoTotal').textContent = number.format(cargoCount);
  $('#municipioTotal').textContent = number.format(municipioCount);
  $('#heroTotal').textContent = number.format(state.records.length);
  $('#filterStatus').textContent = state.filtered.length === state.records.length ? 'Exibindo a base completa.' : `${number.format(state.filtered.length)} registros correspondem ao seu recorte.`;
  const chips = [state.cargo, state.municipio].filter(Boolean);
  $('#scopeChip').textContent = chips.length ? chips.join(' · ') : (state.search ? `Busca: “${state.search}”` : 'Todos os registros');
  renderRankings(state.filtered, 'cargo', '#cargoRanking', '#cargoRankingCount');
  renderRankings(state.filtered, 'municipio', '#municipioRanking', '#municipioRankingCount');
  renderTable();
}

function csvCell(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function exportCsv() {
  const rows = sortedRecords(state.filtered);
  const header = ['Inscrição', 'Nome', 'Cargo', 'Local de prova', 'Município', 'Cota'];
  const body = rows.map((record) => [record.inscricao, record.nome, record.cargo, record.localProva, record.municipio, record.cota ?? 'Indisponível na fonte']);
  const csv = [header, ...body].map((row) => row.map(csvCell).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'radar-sesto-resultados.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  $('#searchInput').addEventListener('input', (event) => { state.search = event.target.value; state.page = 1; applyFilters(); });
  $('#cargoSelect').addEventListener('change', (event) => { state.cargo = event.target.value; state.page = 1; applyFilters(); });
  $('#municipioSelect').addEventListener('change', (event) => { state.municipio = event.target.value; state.page = 1; applyFilters(); });
  $('#pageSize').addEventListener('change', (event) => { state.pageSize = Number(event.target.value); state.page = 1; renderTable(); });
  $('#clearFilters').addEventListener('click', () => { state.search = ''; state.cargo = ''; state.municipio = ''; state.page = 1; $('#searchInput').value = ''; $('#cargoSelect').value = ''; $('#municipioSelect').value = ''; applyFilters(); });
  $('#previousPage').addEventListener('click', () => { if (state.page > 1) { state.page -= 1; renderTable(); } });
  $('#nextPage').addEventListener('click', () => { const totalPages = Math.ceil(state.filtered.length / state.pageSize); if (state.page < totalPages) { state.page += 1; renderTable(); } });
  $('#exportCsv').addEventListener('click', exportCsv);
  document.querySelectorAll('.sort-button').forEach((button) => button.addEventListener('click', () => {
    if (state.sortKey === button.dataset.sort) state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    else { state.sortKey = button.dataset.sort; state.sortDirection = 'asc'; }
    renderTable();
  }));
  document.addEventListener('keydown', (event) => { if (event.key === '/' && document.activeElement.tagName !== 'INPUT') { event.preventDefault(); $('#searchInput').focus(); } });
}

async function init() {
  try {
    const [recordsResponse, metadataResponse] = await Promise.all([fetch('./data/inscricoes.json'), fetch('./data/metadata.json')]);
    if (!recordsResponse.ok || !metadataResponse.ok) throw new Error('Não foi possível carregar a base.');
    state.records = await recordsResponse.json();
    const metadata = await metadataResponse.json();
    populateOptions(state.records);
    $('#updatedAt').textContent = `Atualizada em ${new Date(`${metadata.dataAtualizacao}T12:00:00`).toLocaleDateString('pt-BR')}`;
    $('#sourceName').textContent = metadata.arquivoFonte;
    $('#documentDate').textContent = metadata.dataDocumento;
    bindEvents();
    applyFilters();
  } catch (error) {
    $('#filterStatus').textContent = 'Não foi possível carregar os dados.';
    $('#recordsBody').innerHTML = `<tr><td colspan="4" class="empty-cell"><strong>Erro ao carregar a base</strong>${escapeHtml(error.message)}</td></tr>`;
  }
}

init();
