const API_BASE = '/api/destinos';

const qs = sel => document.querySelector(sel);
const tbody = qs('#tabelaDestinos tbody');
const mensagem = qs('#mensagem');
const backendStatus = qs('#backendStatus');

document.addEventListener('DOMContentLoaded', () => {
    qs('#formCadastro').addEventListener('submit', handleCadastro);
    qs('#btnListar').addEventListener('click', listarDestinos);
    qs('#btnBuscar').addEventListener('click', buscarPorTermo);
    verificarBackend();
    listarDestinos();
});

async function verificarBackend() {
    try {
        const res = await fetch(API_BASE);
        backendStatus.textContent = res.ok ? 'OK' : 'Resposta: ' + res.status;
    } catch (e) {
        backendStatus.textContent = 'Indisponível';
        backendStatus.classList.add('error');
    }
}

function exibirMensagem(text, isError = false) {
    mensagem.textContent = text;
    mensagem.className = isError ? 'error' : '';
    setTimeout(() => { mensagem.textContent = '' }, 4000);
}

async function handleCadastro(e) {
    e.preventDefault();
    const nome = qs('#nome').value.trim();
    const localizacao = qs('#localizacao').value.trim();
    const descricao = qs('#descricao').value.trim();
    const preco = parseFloat(qs('#preco').value || 0);

    if (!nome || !localizacao) {
        exibirMensagem('Nome e localização são obrigatórios.', true);
        return;
    }

    const payload = {
        nome,
        localizacao,
        descricao,
        precoPacote: preco
    };

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text();
            exibirMensagem('Erro ao cadastrar: ' + (txt || res.status), true);
            return;
        }
        const criado = await res.json();
        exibirMensagem('Destino cadastrado com sucesso (id: ' + criado.id + ')');
        qs('#formCadastro').reset();
        listarDestinos();
    } catch (err) {
        exibirMensagem('Erro de rede ao cadastrar.', true);
    }
}

async function listarDestinos() {
    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) { tbody.innerHTML = '<tr><td colspan="5">Erro ao obter destinos</td></tr>'; return; }
        const dados = await res.json();
        renderizarTabela(dados);
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5">Erro de conexão</td></tr>';
    }
}

function renderizarTabela(lista) {
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Nenhum destino encontrado.</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    lista.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${escapeHtml(d.nome)}</td>
      <td>${escapeHtml(d.localizacao)}</td>
      <td>R$ ${Number(d.precoPacote ?? d.precoPorPessoa ?? 0).toFixed(2)}</td>
      <td>${(d.avaliacaoMedia ?? d.ratingAverage ?? 0).toFixed(2)} (${(d.totalAvaliacoes ?? d.ratingCount ?? 0)})</td>
      <td class="actions">
        <button onclick="verDetalhes(${d.id})">Detalhes</button>
        <button onclick="mostrarFormReserva(${d.id})" class="secondary">Reservar</button>
        <button onclick="mostrarFormAvaliacao(${d.id})" class="secondary">Avaliar</button>
        <button onclick="excluirDestino(${d.id})" style="background:#ef4444">Excluir</button>
      </td>`;
        tbody.appendChild(tr);
    });
}

async function buscarPorTermo() {
    const termo = qs('#termoBusca').value.trim();
    if (!termo) { listarDestinos(); return; }

    try {
        const resByName = await fetch(`${API_BASE}/pesquisar?nome=${encodeURIComponent(termo)}`);
        if (resByName.ok) {
            const dados = await resByName.json();
            if (dados.length > 0) return renderizarTabela(dados);
        }
        const resByLoc = await fetch(`${API_BASE}/pesquisar?localizacao=${encodeURIComponent(termo)}`);
        if (resByLoc.ok) {
            const dados = await resByLoc.json();
            return renderizarTabela(dados);
        }
        const resTerm = await fetch(`${API_BASE}/search?termo=${encodeURIComponent(termo)}`);
        if (resTerm.ok) { renderizarTabela(await resTerm.json()); return; }
        renderizarTabela([]);
    } catch (e) {
        exibirMensagem('Erro ao buscar destinos.', true);
    }
}

async function verDetalhes(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) { exibirMensagem('Destino não encontrado', true); return; }
        const d = await res.json();
        abrirModal(renderDetalhesHtml(d));
    } catch (e) {
        exibirMensagem('Erro ao buscar detalhes.', true);
    }
}

function renderDetalhesHtml(d) {
    return `
    <div class="card">
      <h3>${escapeHtml(d.nome)} <span class="muted">(#${d.id})</span></h3>
      <div><strong>Localização:</strong> ${escapeHtml(d.localizacao)}</div>
      <div><strong>Preço:</strong> R$ ${(d.precoPacote ?? d.precoPorPessoa ?? 0).toFixed(2)}</div>
      <div style="margin-top:8px;"><strong>Descrição:</strong><br/> ${escapeHtml(d.descricao ?? '')}</div>
      <div style="margin-top:8px;"><strong>Avaliação média:</strong> ${(d.avaliacaoMedia ?? d.ratingAverage ?? 0).toFixed(2)} (${d.totalAvaliacoes ?? d.ratingCount ?? 0})</div>
      <div style="margin-top:12px; display:flex; justify-content:flex-end;">
        <button onclick="fecharModal()" class="secondary">Fechar</button>
      </div>
    </div>
  `;
}

function mostrarFormAvaliacao(id) {
    abrirModal(`
    <div class="card">
      <h3>Avaliar destino #${id}</h3>
      <div style="margin-bottom:8px;">
        <label class="muted">Nota (1 a 10)</label>
        <input id="notaVal" type="number" min="1" max="10" value="9" />
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="fecharModal()" class="secondary">Cancelar</button>
        <button onclick="avaliarDestino(${id})">Enviar avaliação</button>
      </div>
    </div>
  `);
}

async function avaliarDestino(id) {
    const nota = parseInt(qs('#notaVal').value || 0);
    if (nota < 1 || nota > 10) { exibirMensagem('Nota inválida (1-10).', true); return; }
    try {
        const res = await fetch(`${API_BASE}/${id}/avaliar?nota=${nota}`, { method: 'PATCH' });
        if (!res.ok) {
            exibirMensagem('Erro ao avaliar destino.', true);
            return;
        }
        fecharModal();
        exibirMensagem('Avaliação registrada!');
        listarDestinos();
    } catch (e) {
        exibirMensagem('Erro de rede ao avaliar.', true);
    }
}

function mostrarFormReserva(id) {
    abrirModal(`
    <div class="card">
      <h3>Reservar pacote - destino #${id}</h3>
      <div style="margin-bottom:8px;">
        <label class="muted">Nome do cliente</label>
        <input id="resNome" placeholder="Nome do cliente" />
      </div>
      <div style="margin-bottom:8px;">
        <label class="muted">Data (YYYY-MM-DD)</label>
        <input id="resData" placeholder="2025-12-10" />
      </div>
      <div style="margin-bottom:8px;">
        <label class="muted">Pessoas</label>
        <input id="resPessoas" type="number" value="1" min="1" />
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="fecharModal()" class="secondary">Cancelar</button>
        <button onclick="reservar(${id})">Confirmar reserva</button>
      </div>
    </div>
  `);
}

async function reservar(id) {
    const nome = qs('#resNome').value.trim();
    const data = qs('#resData').value.trim();
    const pessoas = parseInt(qs('#resPessoas').value || 1);

    if (!nome || !data) { exibirMensagem('Preencha nome e data para reservar.', true); return; }

    const payload = { nomeCliente: nome, dataReserva: data, pessoas };

    try {
        const res = await fetch(`${API_BASE}/${id}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text();
            exibirMensagem('Erro ao reservar: ' + (txt || res.status), true);
            return;
        }
        fecharModal();
        exibirMensagem('Reserva efetuada com sucesso!');
        listarDestinos();
    } catch (e) {
        exibirMensagem('Erro de rede ao reservar.', true);
    }
}

async function excluirDestino(id) {
    if (!confirm('Confirma exclusão do destino #' + id + '?')) return;
    try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (res.status === 204 || res.ok) {
            exibirMensagem('Destino excluído');
            listarDestinos();
        } else {
            exibirMensagem('Erro ao excluir destino', true);
        }
    } catch (e) {
        exibirMensagem('Erro de rede ao excluir.', true);
    }
}

function abrirModal(html) {
    const modal = qs('#modal');
    modal.innerHTML = `<div class="modal" onclick="if(event.target===this) fecharModal()">${html}</div>`;
    modal.style.display = 'block';
}
function fecharModal() { const modal = qs('#modal'); modal.style.display = 'none'; modal.innerHTML = ''; }

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
