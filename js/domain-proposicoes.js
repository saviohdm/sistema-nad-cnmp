/**
 * domain-proposicoes.js
 *
 * CORE DOMAIN - Acompanhamento de Proposições
 *
 * Responsabilidades:
 * - Ciclo de vida da proposição (publicação → comprovação → avaliação → encerramento/republicação)
 * - Status management (bidimensional: statusProcessual + valoração)
 * - Workflow transitions e invariantes de negócio
 * - Normalização de dados históricos
 *
 * Dependências Externas (app.js):
 * - Globals: correicoes[], proposicoes[], currentUser
 * - Storage: saveToLocalStorage()
 * - Utils: formatDate(), formatDateTime(), renderStatusBadges()
 * - UI Callbacks: updateDashboard(), renderProposicoesTable(), renderAvaliacaoTable(), populateProposicaoSelect()
 *
 * Bounded Context: Acompanhamento de Proposições (Core)
 */

// ===== STATUS MANAGEMENT =====
// Bidimensional status model: [statusProcessual, valoracao]

/**
 * Normalize status processual to canonical values
 * @param {string} statusProcessual - Raw status processual value
 * @returns {string} Canonical status processual
 */
function normalizeStatusProcessualForDashboard(statusProcessual) {
    const allowedStatuses = [
        'pendente_publicacao',
        'aguardando_comprovacao',
        'pendente_avaliacao',
        'encerrada'
    ];

    return allowedStatuses.includes(statusProcessual) ? statusProcessual : 'pendente_publicacao';
}

/**
 * Normalize valoração to canonical values
 * @param {string} valoracao - Raw valoração value
 * @returns {string} Canonical valoração
 */
function normalizeValoracaoForDashboard(valoracao) {
    const allowedValoracoes = [
        'sem_avaliacao',
        'necessita_informacoes',
        'satisfeita',
        'prejudicada'
    ];

    return allowedValoracoes.includes(valoracao) ? valoracao : 'sem_avaliacao';
}

/**
 * Normalize status value to bidimensional array [statusProcessual, valoracao]
 * Handles backward compatibility with old single-value status
 * @param {string|Array} statusValue - Raw status (string or array)
 * @returns {Array} [statusProcessual, valoracao]
 */
function normalizeStatusValue(statusValue) {
    if (Array.isArray(statusValue)) {
        return [
            normalizeStatusProcessualForDashboard(statusValue[0]),
            normalizeValoracaoForDashboard(statusValue[1])
        ];
    }

    return [
        normalizeStatusProcessualForDashboard(statusValue),
        'sem_avaliacao'
    ];
}

/**
 * Normalize status values in historico entries
 * @param {string|Array} statusValue - Raw status from historico
 * @returns {Array|null} Normalized status or null
 */
function normalizeHistoricoStatusValue(statusValue) {
    if (!statusValue) return statusValue;
    return normalizeStatusValue(statusValue);
}

/**
 * Normalize entire proposição record (migration function)
 * Called on localStorage load to ensure data consistency
 * @param {Object} proposicao - Raw proposição record
 * @returns {Object} Normalized proposição
 */
function normalizeProposicaoRecord(proposicao) {
    const proposicaoNormalizada = { ...proposicao };

    proposicaoNormalizada.status = normalizeStatusValue(proposicaoNormalizada.status);
    proposicaoNormalizada.rascunhosComprovacao = Array.isArray(proposicaoNormalizada.rascunhosComprovacao)
        ? proposicaoNormalizada.rascunhosComprovacao
        : [];

    if (!Array.isArray(proposicaoNormalizada.rascunhosAvaliacao)) {
        proposicaoNormalizada.rascunhosAvaliacao = [];
    }

    if (!Array.isArray(proposicaoNormalizada.historico)) {
        proposicaoNormalizada.historico = [];
    }

    proposicaoNormalizada.historico = proposicaoNormalizada.historico.map(entrada => ({
        ...entrada,
        statusAnterior: normalizeHistoricoStatusValue(entrada.statusAnterior),
        statusNovo: normalizeHistoricoStatusValue(entrada.statusNovo)
    }));

    return proposicaoNormalizada;
}

/**
 * Get canonical status processual for proposição
 * @param {Object} proposicao - Proposição object
 * @returns {string} Canonical status processual
 */
function getCanonicalStatusProcessual(proposicao) {
    return normalizeStatusProcessualForDashboard(getStatusProcessual(proposicao));
}

/**
 * Get canonical valoração for proposição
 * @param {Object} proposicao - Proposição object
 * @returns {string} Canonical valoração
 */
function getCanonicalValoracao(proposicao) {
    return normalizeValoracaoForDashboard(getValoracao(proposicao));
}

/**
 * Get status processual from proposição (index 0 of bidimensional array)
 * @param {Object} proposicao - Proposição object
 * @returns {string} Status processual
 */
function getStatusProcessual(proposicao) {
    return normalizeStatusValue(proposicao.status)[0];
}

/**
 * Get valoração from proposição (index 1 of bidimensional array)
 * @param {Object} proposicao - Proposição object
 * @returns {string} Valoração
 */
function getValoracao(proposicao) {
    return normalizeStatusValue(proposicao.status)[1];
}

/**
 * Check if proposição has specific status processual
 * @param {Object} proposicao - Proposição object
 * @param {string} statusProcessual - Status to check
 * @returns {boolean} True if matches
 */
function hasStatusProcessual(proposicao, statusProcessual) {
    return getStatusProcessual(proposicao) === normalizeStatusProcessualForDashboard(statusProcessual);
}

/**
 * Check if proposição has specific valoração
 * @param {Object} proposicao - Proposição object
 * @param {string} valoracao - Valoração to check
 * @returns {boolean} True if matches
 */
function hasValoracao(proposicao, valoracao) {
    return getValoracao(proposicao) === normalizeValoracaoForDashboard(valoracao);
}

// ===== WORKFLOW TRANSITIONS =====

/**
 * Check if prazo de comprovação is expired (vencido)
 * Only applies to proposições in 'aguardando_comprovacao' status
 * @param {Object} proposicao - Proposição object
 * @returns {boolean} True if prazo is expired
 */
function isPrazoComprovacaoVencido(proposicao) {
    if (!proposicao.prazoComprovacao || !hasStatusProcessual(proposicao, 'aguardando_comprovacao')) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prazo = new Date(proposicao.prazoComprovacao);
    prazo.setHours(0, 0, 0, 0);
    return prazo < today;
}

/**
 * Populate correição dropdown for publishing page
 * Loads all available correições into select element
 */
function populateCorreicaoPublicar() {
    const select = document.getElementById('correicaoPublicar');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione...</option>' +
        correicoes.map(c => `<option value="${c.id}">${c.numero} - ${c.ramoMPNome}</option>`).join('');
}

/**
 * Load proposições pending publication for selected correição
 * Filters by status 'pendente_publicacao' and displays in table
 */
function carregarProposicoesParaPublicar() {
    const correicaoId = parseInt(document.getElementById('correicaoPublicar').value);
    const container = document.getElementById('proposicoesPublicarContainer');
    const tbody = document.getElementById('proposicoesPublicarTableBody');

    if (!correicaoId) {
        container.classList.add('hidden');
        return;
    }

    // Filter proposições with status 'pendente_publicacao' from selected correição
    const proposicoesPendentes = proposicoes.filter(p =>
        p.correicaoId === correicaoId && hasStatusProcessual(p, 'pendente_publicacao')
    );

    if (proposicoesPendentes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhuma proposição pendente de publicação disponível para esta correição</td></tr>';
        container.classList.remove('hidden');
        return;
    }

    tbody.innerHTML = proposicoesPendentes.map(p => `
        <tr>
            <td><input type="checkbox" class="checkbox-publicar" value="${p.id}"></td>
            <td>${p.numero}</td>
            <td>${p.descricao.substring(0, 60)}...</td>
            <td>${p.prazoComprovacao ? formatDate(p.prazoComprovacao) : '-'}</td>
            <td>${renderStatusBadges(p.status)}</td>
            <td>${p.prioridade.toUpperCase()}</td>
        </tr>
    `).join('');

    container.classList.remove('hidden');
}

/**
 * Toggle select all checkboxes in publication table
 */
function toggleSelectAllPublicar() {
    const selectAll = document.getElementById('selectAllPublicar');
    const checkboxes = document.querySelectorAll('.checkbox-publicar');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

/**
 * Clear all checkbox selections in publication table
 */
function limparSelecaoPublicar() {
    document.getElementById('selectAllPublicar').checked = false;
    const checkboxes = document.querySelectorAll('.checkbox-publicar');
    checkboxes.forEach(cb => cb.checked = false);
}

/**
 * CORE WORKFLOW: Publish selected proposições
 *
 * Business Rules:
 * - Sets status to ['aguardando_comprovacao', current_valoracao]
 * - Preserves existing valoração when publishing/republishing
 * - Creates publicacao entry in historico (append-only)
 * - Sets prazoComprovacao and dataPublicacao
 *
 * Invariants:
 * - Only proposições with 'pendente_publicacao' can be published
 * - Prazo must be defined
 * - Historico is immutable (append-only)
 *
 * Post-conditions:
 * - Updates localStorage
 * - Refreshes all UI views (dashboard, tables)
 */
function publicarProposicoesSelecionadas() {
    const prazoComprovacao = document.getElementById('prazoComprovacaoGlobal').value;

    if (!prazoComprovacao) {
        alert('Por favor, defina o prazo para comprovação.');
        return;
    }

    const checkboxes = document.querySelectorAll('.checkbox-publicar:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (selectedIds.length === 0) {
        alert('Por favor, selecione pelo menos uma proposição para publicar.');
        return;
    }

    // Update selected proposições
    const dataPublicacao = new Date().toISOString();
    selectedIds.forEach(id => {
        const proposicao = proposicoes.find(p => p.id === id);
        if (proposicao) {
            const statusAnterior = proposicao.status;

            // Registrar publicação no histórico
            const registroPublicacao = {
                tipo: 'publicacao',
                data: dataPublicacao,
                usuario: 'Corregedoria Nacional',
                descricao: `Proposição publicada para comprovação. Prazo definido: ${formatDate(prazoComprovacao)}`,
                prazoComprovacao: prazoComprovacao,
                statusAnterior: statusAnterior,
                statusNovo: ['aguardando_comprovacao', getValoracao(proposicao)]
            };

            // Adicionar ao histórico
            if (!proposicao.historico) {
                proposicao.historico = [];
            }
            proposicao.historico.push(registroPublicacao);

            // Atualizar campos da proposição (status bidimensional)
            // Preserva valoração ao publicar
            const valoracaoAtual = getValoracao(proposicao);
            proposicao.status = ['aguardando_comprovacao', valoracaoAtual];
            proposicao.prazoComprovacao = prazoComprovacao;
            proposicao.dataPublicacao = dataPublicacao;
        }
    });

    // Save to localStorage
    saveToLocalStorage();

    // Update all views
    updateDashboard();
    renderProposicoesTable();
    populateProposicaoSelect();

    alert(`${selectedIds.length} proposição(ões) publicada(s) com sucesso! Os correicionados poderão agora enviar suas comprovações.`);

    // Clear form
    document.getElementById('correicaoPublicar').value = '';
    document.getElementById('prazoComprovacaoGlobal').value = '';
    document.getElementById('proposicoesPublicarContainer').classList.add('hidden');
}
