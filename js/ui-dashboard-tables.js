/**
 * ui-dashboard-tables.js
 *
 * READ MODEL - Dashboard, Tabelas e Visualizações
 *
 * Responsabilidades:
 * - Dashboard: cards, charts (Canvas API), filtros de ramo MP
 * - Tables: Renderização de tabelas (correições, proposições, avaliação, comprovação)
 * - Stats calculation: Workflow + valoração statistics
 * - Membro Auxiliar dashboard
 *
 * Dependências Externas (app.js):
 * - Globals: correicoes[], proposicoes[], currentUser, membrosAuxiliares[]
 * - Globals: dashboardRamoMPFilter, correicoesSortColumn, correicoesSortDirection
 * - Filters: getFilteredCorreicoes(), getFilteredProposicoes(), getCorreicaoTableStats()
 * - Utils: formatDate(), renderStatusBadges(), renderTagBadges(), smartTruncate(), getTextLengthBadge()
 * - Status (domain-proposicoes.js): getCanonicalStatusProcessual(), getCanonicalValoracao(), hasStatusProcessual(), getStatusLabel()
 * - Domain (domain-proposicoes.js): isPrazoComprovacaoVencido()
 * - UI (app.js): viewDetails() - opens modal
 *
 * Bounded Context: Consulta e Relatórios (Read Model)
 */

// ===== DASHBOARD FUNCTIONS =====

/**
 * Update all dashboard cards and charts
 * Calculates statistics based on filtered data and refreshes UI
 */
function updateDashboard() {
    const filteredCorreicoes = getFilteredCorreicoes();
    const filteredProposicoes = getFilteredProposicoes();
    const workflowStats = getDashboardWorkflowStats(filteredProposicoes);

    // Card 1: Total de Correições
    const totalCorreicoes = filteredCorreicoes.length;

    // Card 2: Correições Ativas (com status 'ativo')
    const correicoesAtivas = filteredCorreicoes.filter(c => c.status === 'ativo').length;

    // Card 3: Total de Proposições
    const totalProposicoes = filteredProposicoes.length;

    // Card 4: Proposições Ativas (status processual diferente de 'encerrada')
    const proposicoesAtivas = totalProposicoes - workflowStats.encerrada;

    // Card 5: Prazo Vencido
    const prazoVencido = filteredProposicoes.filter(p => isPrazoComprovacaoVencido(p)).length;

    // Update card values
    document.getElementById('totalCorreicoes').textContent = totalCorreicoes;
    document.getElementById('correicoesAtivas').textContent = correicoesAtivas;
    document.getElementById('totalProposicoes').textContent = totalProposicoes;
    document.getElementById('proposicoesAtivas').textContent = proposicoesAtivas;
    document.getElementById('prazoVencido').textContent = prazoVencido;

    // Draw charts
    drawChart();
    drawValoracaoChart();
}

/**
 * Draw Fluxo de Trabalho Chart (Canvas bar chart)
 * 4 bars: pendente_publicacao, aguardando_comprovacao, pendente_avaliacao, encerrada
 */
function drawChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const filteredProposicoes = getFilteredProposicoes();
    const data = getDashboardWorkflowStats(filteredProposicoes);

    const colors = {
        pendente_publicacao: '#ffc107',
        aguardando_comprovacao: '#e65100',
        pendente_avaliacao: '#0066cc',
        encerrada: '#28a745'
    };

    const labels = {
        pendente_publicacao: 'Pendente Public.',
        aguardando_comprovacao: 'Aguard. Comprov.',
        pendente_avaliacao: 'Pendente Aval.',
        encerrada: 'Encerrada'
    };

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Calculate bar width and spacing (4 bars)
    const barWidth = (canvas.width - 100) / 4;
    const maxValue = Math.max(...Object.values(data));
    const heightRatio = (canvas.height - 80) / (maxValue || 1);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 50;
    Object.keys(data).forEach(key => {
        const value = data[key];
        const barHeight = value * heightRatio;
        const y = canvas.height - barHeight - 50;

        // Draw bar
        ctx.fillStyle = colors[key];
        ctx.fillRect(x, y, barWidth - 20, barHeight);

        // Draw value
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + (barWidth - 20) / 2, y - 10);

        // Draw label
        ctx.font = '10px Arial';
        ctx.fillText(labels[key], x + (barWidth - 20) / 2, canvas.height - 30);

        x += barWidth;
    });
}

/**
 * Draw Valoração Chart (Canvas bar chart)
 * 4 bars: sem_avaliacao, necessita_informacoes, satisfeita, prejudicada
 */
function drawValoracaoChart() {
    const canvas = document.getElementById('valoracaoChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const filteredProposicoes = getFilteredProposicoes();
    const data = getDashboardValoracaoStats(filteredProposicoes);

    const colors = {
        sem_avaliacao: '#9e9e9e',
        necessita_informacoes: '#ff9800',
        satisfeita: '#28a745',
        prejudicada: '#6c757d'
    };

    const labels = {
        sem_avaliacao: 'Sem Avaliação',
        necessita_informacoes: 'Nec. Inform.',
        satisfeita: 'Satisfeita',
        prejudicada: 'Prejudicada'
    };

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Calculate bar width and spacing (4 bars)
    const barWidth = (canvas.width - 100) / 4;
    const maxValue = Math.max(...Object.values(data));
    const heightRatio = (canvas.height - 80) / (maxValue || 1);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 50;
    Object.keys(data).forEach(key => {
        const value = data[key];
        const barHeight = value * heightRatio;
        const y = canvas.height - barHeight - 50;

        // Draw bar
        ctx.fillStyle = colors[key];
        ctx.fillRect(x, y, barWidth - 10, barHeight);

        // Draw value
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + (barWidth - 10) / 2, y - 10);

        // Draw label
        ctx.font = '10px Arial';
        ctx.fillText(labels[key], x + (barWidth - 10) / 2, canvas.height - 30);

        x += barWidth;
    });
}

/**
 * Populate Dashboard Ramo do MP Filter dropdown
 * Shows only ramos MP available to current user
 */
function populateDashboardRamoMPFilter() {
    const select = document.getElementById('dashboardRamoMPFilter');
    if (!select) return;

    // Obter correições disponíveis com base no perfil do usuário
    let availableCorreicoes = correicoes;
    if (currentUser && currentUser.type !== 'admin') {
        availableCorreicoes = correicoes.filter(c => c.ramoMP === currentUser.ramoMP);
    }

    // Extrair ramos do MP únicos
    const uniqueRamosMPs = [...new Set(availableCorreicoes.map(c => c.ramoMP))];

    // Ordenar alfabeticamente
    uniqueRamosMPs.sort();

    // Limpar opções existentes (exceto "Todos")
    select.innerHTML = '<option value="">Todos os Ramos do MP</option>';

    // Adicionar ramos do MP disponíveis
    uniqueRamosMPs.forEach(ramoMP => {
        // Encontrar uma correição deste ramo para obter o nome completo
        const correicao = availableCorreicoes.find(c => c.ramoMP === ramoMP);
        const option = document.createElement('option');
        option.value = ramoMP;
        option.textContent = `${ramoMP} - ${correicao.ramoMPNome}`;
        select.appendChild(option);
    });

    // Restaurar seleção atual se existir
    if (dashboardRamoMPFilter) {
        select.value = dashboardRamoMPFilter;
    }
}

/**
 * Apply Ramo MP filter to dashboard
 * Updates global filter and recalculates all statistics
 */
function filtrarDashboardPorRamoMP() {
    const select = document.getElementById('dashboardRamoMPFilter');
    if (!select) return;

    // Atualizar filtro global
    dashboardRamoMPFilter = select.value || null;

    // Recalcular dashboard
    updateDashboard();
}

// ===== STATISTICS CALCULATION =====

/**
 * Calculate workflow statistics (status processual) for filtered proposições
 * @param {Array} proposicoesFiltradas - Filtered proposições array
 * @returns {Object} Counts per status processual
 */
function getDashboardWorkflowStats(proposicoesFiltradas) {
    return {
        pendente_publicacao: proposicoesFiltradas.filter(p => getCanonicalStatusProcessual(p) === 'pendente_publicacao').length,
        aguardando_comprovacao: proposicoesFiltradas.filter(p => getCanonicalStatusProcessual(p) === 'aguardando_comprovacao').length,
        pendente_avaliacao: proposicoesFiltradas.filter(p => getCanonicalStatusProcessual(p) === 'pendente_avaliacao').length,
        encerrada: proposicoesFiltradas.filter(p => getCanonicalStatusProcessual(p) === 'encerrada').length
    };
}

/**
 * Calculate valoração statistics for filtered proposições
 * @param {Array} proposicoesFiltradas - Filtered proposições array
 * @returns {Object} Counts per valoração
 */
function getDashboardValoracaoStats(proposicoesFiltradas) {
    return {
        sem_avaliacao: proposicoesFiltradas.filter(p => getCanonicalValoracao(p) === 'sem_avaliacao').length,
        necessita_informacoes: proposicoesFiltradas.filter(p => getCanonicalValoracao(p) === 'necessita_informacoes').length,
        satisfeita: proposicoesFiltradas.filter(p => getCanonicalValoracao(p) === 'satisfeita').length,
        prejudicada: proposicoesFiltradas.filter(p => getCanonicalValoracao(p) === 'prejudicada').length
    };
}

// ===== MEMBRO AUXILIAR FUNCTIONS =====

/**
 * Calculate statistics per membro auxiliar
 * @returns {Array} Stats object per membro with correições and proposições counts
 */
function calcularEstatisticasPorMembro() {
    const stats = membrosAuxiliares.map(membro => {
        // Get all correições assigned to this membro
        const correicoesDoMembro = correicoes.filter(c => c.membroAuxiliar === membro.id);

        // Get all proposições from these correições
        const proposicoesDoMembro = proposicoes.filter(p =>
            correicoesDoMembro.some(c => c.id === p.correicaoId)
        );

        return {
            membro,
            totalCorreicoes: correicoesDoMembro.length,
            totalProposicoes: proposicoesDoMembro.length,
            pendentePublicacao: proposicoesDoMembro.filter(p => getCanonicalStatusProcessual(p) === 'pendente_publicacao').length,
            aguardandoComprovacao: proposicoesDoMembro.filter(p => getCanonicalStatusProcessual(p) === 'aguardando_comprovacao').length,
            pendenteAvaliacao: proposicoesDoMembro.filter(p => getCanonicalStatusProcessual(p) === 'pendente_avaliacao').length
        };
    });

    return stats;
}

/**
 * Render dashboard cards for membros auxiliares
 * Shows grid of cards with statistics per membro
 */
function renderDashboardMembrosAuxiliares() {
    const container = document.getElementById('dashboardMembrosAuxiliaresCards');
    if (!container) return;

    const stats = calcularEstatisticasPorMembro();

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            ${stats.map(stat => `
                <div class="card" style="background: linear-gradient(135deg, var(--primary-color) 0%, #004080 100%); color: white;">
                    <div style="margin-bottom: 1rem;">
                        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem;">
                            ${stat.membro.nome}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">
                            ${stat.totalCorreicoes} correição(ões)
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.1); border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="font-size: 2rem; font-weight: 700; text-align: center;">
                            ${stat.totalProposicoes}
                        </div>
                        <div style="font-size: 0.875rem; text-align: center; opacity: 0.9;">
                            Total de Proposições
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
                        <div style="flex: 1; background: rgba(255,255,255,0.15); border-radius: 4px; padding: 0.5rem; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #ffc107;">
                                ${stat.pendentePublicacao}
                            </div>
                            <div style="font-size: 0.75rem; opacity: 0.9;">
                                Pendente Publicação
                            </div>
                        </div>
                        <div style="flex: 1; background: rgba(255,255,255,0.15); border-radius: 4px; padding: 0.5rem; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #e65100;">
                                ${stat.aguardandoComprovacao}
                            </div>
                            <div style="font-size: 0.75rem; opacity: 0.9;">
                                Aguardando Comprovação
                            </div>
                        </div>
                        <div style="flex: 1; background: rgba(255,255,255,0.15); border-radius: 4px; padding: 0.5rem; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #4fc3f7;">
                                ${stat.pendenteAvaliacao}
                            </div>
                            <div style="font-size: 0.75rem; opacity: 0.9;">
                                Pendente Avaliação
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== TABLE RENDERING FUNCTIONS =====

/**
 * Note: The following table rendering functions (renderCorreicoesTable, renderProposicoesTable,
 * renderProposicoesComprovacaoTable, renderAvaliacaoTable) are large and reference many
 * DOM elements and utility functions from app.js. They will be extracted in a subsequent
 * refactoring iteration to keep this initial split stable.
 *
 * For now, they remain in app.js to minimize risk of breaking the application.
 * Future evolution: Extract to separate table-renderers.js module.
 */
