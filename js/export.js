/**
 * export.js
 *
 * GENERIC SUBDOMAIN - Exportação de Dados
 *
 * Responsabilidades:
 * - Exportação JSON/PDF em múltiplos níveis:
 *   1. Dashboard (estatísticas + correições + proposições)
 *   2. Correições (tabela, JSON, relatório detalhado)
 *   3. Detalhes de Proposição (JSON + timeline PDF)
 * - Controle de menus de exportação
 *
 * Dependências Externas (app.js):
 * - Globals: correicoes[], proposicoes[], currentUser, currentDetailProposicaoId
 * - Globals: dashboardRamoMPFilter, correicoesStatusFilter, availableTags[]
 * - Filters: getFilteredCorreicoes(), getFilteredProposicoes(), getCorreicaoTableStats()
 * - Utils: formatDate(), renderStatusBadges(), smartTruncate()
 * - Status: getCanonicalStatusProcessual(), getCanonicalValoracao(), getStatusProcessual(), getValoracao(), getStatusLabel()
 * - Domain: isPrazoComprovacaoVencido()
 * - UI: getDashboardWorkflowStats(), getDashboardValoracaoStats() (ui-dashboard-tables.js)
 *
 * Bounded Context: Generic (exportação, busca, relatórios)
 */

// ===== EXPORT MENU CONTROL =====

/**
 * Toggle export dropdown menus
 * Auto-closes all other menus when one is opened
 * @param {string} menuId - ID of the menu to toggle
 */
function toggleExportMenu(menuId) {
    const menu = document.getElementById(menuId);
    const dropdown = menu.closest('.export-dropdown');

    // Close all other menus first
    document.querySelectorAll('.export-menu').forEach(m => {
        if (m.id !== menuId) {
            m.classList.add('hidden');
            m.closest('.export-dropdown')?.classList.remove('active');
        }
    });

    // Toggle current menu
    menu.classList.toggle('hidden');
    dropdown?.classList.toggle('active');
}

// Close menus when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-menu').forEach(menu => {
            menu.classList.add('hidden');
            menu.closest('.export-dropdown')?.classList.remove('active');
        });
    }
});

// ===== DASHBOARD EXPORTS =====

/**
 * Export Dashboard data as JSON
 * Includes: statistics, distribution charts data, all filtered correições and proposições
 */
function exportarDashboardJSON() {
    const filteredCorreicoes = getFilteredCorreicoes();
    const filteredProposicoes = getFilteredProposicoes();
    const statusProcessual = getDashboardWorkflowStats(filteredProposicoes);
    const valoracao = getDashboardValoracaoStats(filteredProposicoes);

    // Calcular estatísticas
    const totalCorreicoes = filteredCorreicoes.length;
    const correicoesAtivas = filteredCorreicoes.filter(c => c.status === 'ativo').length;
    const totalProposicoes = filteredProposicoes.length;
    const proposicoesAtivas = totalProposicoes - statusProcessual.encerrada;
    const prazoVencido = filteredProposicoes.filter(p => isPrazoComprovacaoVencido(p)).length;

    // Obter nome do filtro aplicado
    const filtroRamoMP = dashboardRamoMPFilter
        ? correicoes.find(c => c.ramoMP === dashboardRamoMPFilter)?.ramoMPNome || 'Desconhecido'
        : 'Todos os Ramos do MP';

    // Montar objeto de exportação
    const exportData = {
        titulo: 'Dashboard CNMP - Sistema de Acompanhamento de Proposições',
        dataExportacao: new Date().toISOString(),
        filtroAplicado: filtroRamoMP,
        usuario: currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Admin',
        estatisticas: {
            totalCorreicoes,
            correicoesAtivas,
            totalProposicoes,
            proposicoesAtivas,
            prazoVencido
        },
        distribuicao: {
            statusProcessual,
            valoracao
        },
        correicoes: filteredCorreicoes,
        proposicoes: filteredProposicoes
    };

    // Criar arquivo JSON e fazer download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-cnmp-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Fechar menu
    document.getElementById('dashboardExportMenu').classList.add('hidden');
    document.querySelector('.export-dropdown')?.classList.remove('active');

    alert('Dados do dashboard exportados com sucesso em formato JSON!');
}

/**
 * Export Dashboard as PDF (formatted report)
 * Includes: statistics cards, distribution tables, opens print dialog
 */
function exportarDashboardPDF() {
    const filteredCorreicoes = getFilteredCorreicoes();
    const filteredProposicoes = getFilteredProposicoes();
    const statusProcessual = getDashboardWorkflowStats(filteredProposicoes);
    const valoracao = getDashboardValoracaoStats(filteredProposicoes);

    // Calcular estatísticas
    const totalCorreicoes = filteredCorreicoes.length;
    const correicoesAtivas = filteredCorreicoes.filter(c => c.status === 'ativo').length;
    const totalProposicoes = filteredProposicoes.length;
    const proposicoesAtivas = totalProposicoes - statusProcessual.encerrada;
    const prazoVencido = filteredProposicoes.filter(p => isPrazoComprovacaoVencido(p)).length;

    const filtroRamoMP = dashboardRamoMPFilter
        ? correicoes.find(c => c.ramoMP === dashboardRamoMPFilter)?.ramoMPNome || 'Desconhecido'
        : 'Todos os Ramos do MP';

    // Criar janela de impressão com HTML formatado
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Dashboard CNMP - Relatório</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #333;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #003366;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #003366;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .header .subtitle {
                    color: #666;
                    font-size: 14px;
                }
                .info-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    border-left: 4px solid #0066cc;
                }
                .info-section p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .info-section strong {
                    color: #003366;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: white;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }
                .stat-card .label {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-card .value {
                    font-size: 36px;
                    font-weight: bold;
                    color: #003366;
                }
                .section-title {
                    color: #003366;
                    font-size: 18px;
                    margin: 30px 0 15px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #0066cc;
                }
                .distribution-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25px;
                }
                .distribution-table th,
                .distribution-table td {
                    padding: 12px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                .distribution-table th {
                    background: #003366;
                    color: white;
                    font-weight: 600;
                }
                .distribution-table tr:nth-child(even) {
                    background: #f8f9fa;
                }
                .distribution-table td:last-child {
                    text-align: center;
                    font-weight: bold;
                    color: #0066cc;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                @media print {
                    body { padding: 20px; }
                    .stat-card { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Dashboard CNMP</h1>
                <div class="subtitle">Sistema de Acompanhamento de Proposições</div>
            </div>

            <div class="info-section">
                <p><strong>Data de Exportação:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</p>
                <p><strong>Filtro Aplicado:</strong> ${filtroRamoMP}</p>
                <p><strong>Usuário:</strong> ${currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Corregedoria Nacional (Admin)'}</p>
            </div>

            <h2 class="section-title">Estatísticas Gerais</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">🏛️ Correições Realizadas</div>
                    <div class="value">${totalCorreicoes}</div>
                </div>
                <div class="stat-card">
                    <div class="label">🔄 Correições Ativas</div>
                    <div class="value">${correicoesAtivas}</div>
                </div>
                <div class="stat-card">
                    <div class="label">📄 Total de Proposições</div>
                    <div class="value">${totalProposicoes}</div>
                </div>
                <div class="stat-card">
                    <div class="label">🔥 Proposições Ativas</div>
                    <div class="value">${proposicoesAtivas}</div>
                </div>
                <div class="stat-card">
                    <div class="label">⚠️ Prazo Vencido</div>
                    <div class="value" style="color: #dc3545;">${prazoVencido}</div>
                </div>
            </div>

            <h2 class="section-title">Distribuição por Status Processual</h2>
            <table class="distribution-table">
                <thead>
                    <tr>
                        <th>Status Processual</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Pendente Publicação</td>
                        <td>${statusProcessual.pendente_publicacao}</td>
                    </tr>
                    <tr>
                        <td>Aguardando Comprovação</td>
                        <td>${statusProcessual.aguardando_comprovacao}</td>
                    </tr>
                    <tr>
                        <td>Pendente Avaliação</td>
                        <td>${statusProcessual.pendente_avaliacao}</td>
                    </tr>
                    <tr>
                        <td>Encerrada</td>
                        <td>${statusProcessual.encerrada}</td>
                    </tr>
                </tbody>
            </table>

            <h2 class="section-title">Distribuição por Valoração</h2>
            <table class="distribution-table">
                <thead>
                    <tr>
                        <th>Valoração</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sem Avaliação</td>
                        <td>${valoracao.sem_avaliacao}</td>
                    </tr>
                    <tr>
                        <td>Necessita Informações</td>
                        <td>${valoracao.necessita_informacoes}</td>
                    </tr>
                    <tr>
                        <td>Satisfeita</td>
                        <td>${valoracao.satisfeita}</td>
                    </tr>
                    <tr>
                        <td>Prejudicada</td>
                        <td>${valoracao.prejudicada}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Relatório gerado automaticamente pelo Sistema NAD - CNMP</p>
                <p>Conselho Nacional do Ministério Público</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();

    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };

    // Fechar menu
    document.getElementById('dashboardExportMenu').classList.add('hidden');
    document.querySelector('.export-dropdown')?.classList.remove('active');
}

// ===== CORREIÇÕES EXPORTS =====

/**
 * Get filtered correições (helper function for exports)
 * Applies search term AND status filter on top of base user filter
 * @returns {Array} Filtered correições
 */
function getCorreicoesFiltradas() {
    const searchTerm = document.getElementById('searchCorreicao')?.value.toLowerCase() || '';
    const baseFiltered = getFilteredCorreicoes();

    // Apply search filter
    let filtered = baseFiltered.filter(c => {
        const matchesSearch = c.numero.toLowerCase().includes(searchTerm) ||
                            c.ramoMP.toLowerCase().includes(searchTerm) ||
                            c.ramoMPNome.toLowerCase().includes(searchTerm) ||
                            (c.tematica && c.tematica.toLowerCase().includes(searchTerm)) ||
                            (c.numeroElo && c.numeroElo.toLowerCase().includes(searchTerm)) ||
                            (c.tipo && c.tipo.toLowerCase().includes(searchTerm));
        return matchesSearch;
    });

    // Apply status filter
    if (correicoesStatusFilter) {
        filtered = filtered.filter(c => c.status === correicoesStatusFilter);
    }

    return filtered;
}

/**
 * Export Correições as JSON
 * Includes: full correição data + proposições + statistics per correição
 */
function exportarCorreicoesJSON() {
    const correicoesFiltered = getCorreicoesFiltradas();

    // Enriquecer com estatísticas
    const correicoesComEstatisticas = correicoesFiltered.map(c => {
        const stats = getCorreicaoTableStats(c.id);
        return {
            ...c,
            estatisticas: {
                totalProposicoes: stats.totalProposicoes,
                pendentePublicacao: stats.pendentePublicacao,
                pendenteAvaliacao: stats.pendenteAvaliacao,
                prazoVencido: stats.prazoVencido
            },
            proposicoes: stats.proposicoes
        };
    });

    const exportData = {
        titulo: 'Correições CNMP - Exportação de Dados',
        dataExportacao: new Date().toISOString(),
        totalCorreicoes: correicoesComEstatisticas.length,
        filtrosAplicados: {
            busca: document.getElementById('searchCorreicao')?.value || 'Nenhum',
            status: correicoesStatusFilter || 'Todos'
        },
        usuario: currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Corregedoria Nacional (Admin)',
        correicoes: correicoesComEstatisticas
    };

    // Download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correicoes-cnmp-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Fechar menu
    document.getElementById('correicoesExportMenu').classList.add('hidden');

    alert('Dados de correições exportados com sucesso em formato JSON!');
}

/**
 * Export Correições as PDF (simple table)
 * Opens print window with formatted HTML table
 */
function exportarCorreicoesPDF() {
    const correicoesFiltered = getCorreicoesFiltradas();

    // Calcular estatísticas
    const correicoesComStats = correicoesFiltered.map(c => ({
        correicao: c,
        ...getCorreicaoTableStats(c.id)
    }));

    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Correições CNMP - Tabela</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #003366;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #003366;
                    font-size: 20px;
                    margin-bottom: 5px;
                }
                .info {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    font-size: 11px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    padding: 8px 6px;
                    text-align: left;
                    border: 1px solid #ddd;
                    font-size: 10px;
                }
                th {
                    background: #003366;
                    color: white;
                    font-weight: 600;
                }
                tr:nth-child(even) {
                    background: #f8f9fa;
                }
                .status-ativo { color: #28a745; font-weight: bold; }
                .status-inativo { color: #6c757d; }
                .highlight-yellow { color: #ffc107; font-weight: bold; }
                .highlight-blue { color: #0066cc; font-weight: bold; }
                .highlight-red { color: #dc3545; font-weight: bold; }
                .footer {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                @media print {
                    body { padding: 10px; }
                    @page { size: landscape; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Correições CNMP - Tabela</h1>
            </div>

            <div class="info">
                <strong>Data:</strong> ${formatDate(new Date().toISOString().split('T')[0])} &nbsp;|&nbsp;
                <strong>Total:</strong> ${correicoesFiltered.length} correição(ões) &nbsp;|&nbsp;
                <strong>Usuário:</strong> ${currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Corregedoria Nacional'}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Temática</th>
                        <th>Tipo</th>
                        <th>MP</th>
                        <th>UF</th>
                        <th>Ramo do MP</th>
                        <th>Total Prop.</th>
                        <th>Pendente Publicação</th>
                        <th>Pendente Avaliação</th>
                        <th>Prazo Vencido</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${correicoesComStats.map(item => {
                        const c = item.correicao;
                        const ufDisplay = Array.isArray(c.uf) ? c.uf.join(', ') : c.uf;
                        return `
                        <tr>
                            <td><strong>${c.numero}</strong></td>
                            <td>${c.tematica || '-'}</td>
                            <td>${c.tipo || '-'}</td>
                            <td>${c.mp || '-'}</td>
                            <td>${ufDisplay || '-'}</td>
                            <td>${c.ramoMPNome}</td>
                            <td style="text-align: center;">${item.totalProposicoes}</td>
                            <td style="text-align: center;" class="${item.pendentePublicacao > 0 ? 'highlight-yellow' : ''}">${item.pendentePublicacao}</td>
                            <td style="text-align: center;" class="${item.pendenteAvaliacao > 0 ? 'highlight-blue' : ''}">${item.pendenteAvaliacao}</td>
                            <td style="text-align: center;" class="${item.prazoVencido > 0 ? 'highlight-red' : ''}">${item.prazoVencido}</td>
                            <td class="status-${c.status}">${c.status === 'ativo' ? 'Ativo' : 'Inativo'}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>Relatório gerado pelo Sistema NAD - CNMP | Conselho Nacional do Ministério Público</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };

    // Fechar menu
    document.getElementById('correicoesExportMenu').classList.add('hidden');
}

/**
 * Export Correições - Detailed Report (PDF)
 * Includes: individual cards per correição with full statistics (workflow + valoração)
 */
function exportarCorreicoesRelatorioDetalhado() {
    const correicoesFiltered = getCorreicoesFiltradas();

    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Correições CNMP - Relatório Detalhado</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                    color: #333;
                    line-height: 1.5;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #003366;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }
                .header h1 {
                    color: #003366;
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                .info-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #0066cc;
                    font-size: 13px;
                }
                .correicao-block {
                    background: white;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .correicao-header {
                    border-bottom: 2px solid #0066cc;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .correicao-header h2 {
                    color: #003366;
                    font-size: 16px;
                }
                .correicao-info {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                    font-size: 12px;
                }
                .correicao-info .item {
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .correicao-info .label {
                    font-weight: bold;
                    color: #003366;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 15px;
                }
                .stat-box {
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 12px;
                    text-align: center;
                }
                .stat-box .label {
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .stat-box .value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #003366;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .status-ativo {
                    background: #d4edda;
                    color: #155724;
                }
                .status-inativo {
                    background: #e2e3e5;
                    color: #383d41;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #e0e0e0;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                }
                @media print {
                    body { padding: 15px; }
                    .correicao-block { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Relatório Detalhado de Correições</h1>
                <div style="color: #666; font-size: 14px;">Sistema de Acompanhamento de Proposições - CNMP</div>
            </div>

            <div class="info-section">
                <strong>Data de Exportação:</strong> ${formatDate(new Date().toISOString().split('T')[0])} &nbsp;|&nbsp;
                <strong>Total de Correições:</strong> ${correicoesFiltered.length} &nbsp;|&nbsp;
                <strong>Usuário:</strong> ${currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Corregedoria Nacional (Admin)'}
            </div>

            ${correicoesFiltered.map(c => {
                const stats = getCorreicaoTableStats(c.id);
                const proposicoesCorreicao = stats.proposicoes;
                const totalProposicoes = stats.totalProposicoes;
                const pendentePublicacao = stats.pendentePublicacao;
                const pendenteAvaliacao = stats.pendenteAvaliacao;
                const prazoVencido = stats.prazoVencido;
                const aguardando = proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'aguardando_comprovacao').length;
                const encerradas = proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'encerrada').length;

                const semAvaliacao = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'sem_avaliacao').length;
                const necessitaInformacoes = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'necessita_informacoes').length;
                const satisfeita = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'satisfeita').length;
                const prejudicada = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'prejudicada').length;

                const ufDisplay = Array.isArray(c.uf) ? c.uf.join(', ') : c.uf;

                return `
                    <div class="correicao-block">
                        <div class="correicao-header">
                            <h2>${c.numero} - ${c.ramoMPNome}</h2>
                            <span class="status-badge status-${c.status}">${c.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                        </div>

                        <div class="correicao-info">
                            <div class="item">
                                <span class="label">Temática:</span> ${c.tematica || '-'}
                            </div>
                            <div class="item">
                                <span class="label">Número ELO:</span> ${c.numeroElo || '-'}
                            </div>
                            <div class="item">
                                <span class="label">Tipo:</span> ${c.tipo || '-'}
                            </div>
                            <div class="item">
                                <span class="label">MP:</span> ${c.mp || '-'}
                            </div>
                            <div class="item">
                                <span class="label">UF:</span> ${ufDisplay || '-'}
                            </div>
                            <div class="item">
                                <span class="label">Período:</span> ${formatDate(c.dataInicio)} a ${formatDate(c.dataFim)}
                            </div>
                        </div>

                        <h3 style="color: #003366; font-size: 14px; margin: 15px 0 10px 0;">Estatísticas de Proposições</h3>
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="label">Total</div>
                                <div class="value">${totalProposicoes}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Pendente Publicação</div>
                                <div class="value" style="color: #ffc107;">${pendentePublicacao}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Aguardando Comprovação</div>
                                <div class="value" style="color: #fd7e14;">${aguardando}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Pendente Avaliação</div>
                                <div class="value" style="color: #0066cc;">${pendenteAvaliacao}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Encerrada</div>
                                <div class="value" style="color: #003366;">${encerradas}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Prazo Vencido</div>
                                <div class="value" style="color: #dc3545;">${prazoVencido}</div>
                            </div>
                        </div>

                        <h3 style="color: #003366; font-size: 14px; margin: 15px 0 10px 0;">Valoração</h3>
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="label">Sem Avaliação</div>
                                <div class="value" style="color: #9e9e9e;">${semAvaliacao}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Necessita Informações</div>
                                <div class="value" style="color: #ff9800;">${necessitaInformacoes}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Satisfeita</div>
                                <div class="value" style="color: #28a745;">${satisfeita}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Prejudicada</div>
                                <div class="value" style="color: #6c757d;">${prejudicada}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}

            <div class="footer">
                <p>Relatório gerado automaticamente pelo Sistema NAD - CNMP</p>
                <p>Conselho Nacional do Ministério Público</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };

    // Fechar menu
    document.getElementById('correicoesExportMenu').classList.add('hidden');
}

// ===== PROPOSIÇÃO DETAIL EXPORTS =====

/**
 * Export Proposição Details as JSON
 * Includes: full proposição data + correição context + complete timeline
 * Requires: currentDetailProposicaoId to be set
 */
function exportarDetalheJSON() {
    if (!currentDetailProposicaoId) {
        alert('Erro: Nenhuma proposição selecionada.');
        return;
    }

    const proposicao = proposicoes.find(p => p.id === currentDetailProposicaoId);
    if (!proposicao) {
        alert('Erro: Proposição não encontrada.');
        return;
    }

    const correicao = correicoes.find(c => c.id === proposicao.correicaoId);

    const exportData = {
        titulo: 'Proposição CNMP - Dados Completos',
        dataExportacao: new Date().toISOString(),
        proposicao: {
            ...proposicao,
            correicao: {
                numero: correicao?.numero || '',
                ramoMP: correicao?.ramoMPNome || '',
                tematica: correicao?.tematica || '',
                periodo: correicao ? `${formatDate(correicao.dataInicio)} a ${formatDate(correicao.dataFim)}` : ''
            }
        },
        usuario: currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Corregedoria Nacional (Admin)'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposicao-${proposicao.numero}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    document.getElementById('detailModalExportMenu').classList.add('hidden');
    alert('Dados da proposição exportados com sucesso em formato JSON!');
}

/**
 * Export Proposição Details as PDF (formatted timeline)
 * Includes: proposição info + color-coded timeline (publicação/comprovação/avaliação)
 * Requires: currentDetailProposicaoId to be set
 */
function exportarDetalhePDF() {
    if (!currentDetailProposicaoId) {
        alert('Erro: Nenhuma proposição selecionada.');
        return;
    }

    const proposicao = proposicoes.find(p => p.id === currentDetailProposicaoId);
    if (!proposicao) {
        alert('Erro: Proposição não encontrada.');
        return;
    }

    const correicao = correicoes.find(c => c.id === proposicao.correicaoId);
    const statusProcessual = getStatusProcessual(proposicao);
    const valoracao = getValoracao(proposicao);

    const tagsText = proposicao.tags && proposicao.tags.length > 0
        ? proposicao.tags.map(t => availableTags.find(at => at.id === t)?.label || t).join(', ')
        : 'Nenhuma';

    const timelineHTML = proposicao.historico && proposicao.historico.length > 0
        ? proposicao.historico.map(h => {
            let tipoLabel = 'Registro';
            let tipoIcon = '📝';
            if (h.tipo === 'publicacao') { tipoLabel = 'Publicação'; tipoIcon = '📤'; }
            else if (h.tipo === 'comprovacao') { tipoLabel = 'Comprovação'; tipoIcon = '📎'; }
            else if (h.tipo === 'avaliacao') { tipoLabel = 'Avaliação'; tipoIcon = '⚖️'; }

            return `
            <div class="timeline-item ${h.tipo}">
                <div class="timeline-header">
                    <strong>${tipoIcon} ${tipoLabel}</strong>
                    <span style="float: right; color: #666;">${formatDate(h.data)}</span>
                </div>
                <div class="timeline-content">
                    <div><strong>Por:</strong> ${h.usuario}</div>
                    <div style="margin-top: 0.5rem;">${h.descricao}</div>
                    ${h.observacoes ? `<div style="margin-top: 0.5rem;"><em><strong>Observações:</strong> ${h.observacoes}</em></div>` : ''}
                    ${h.prazoComprovacao ? `<div style="margin-top: 0.5rem;"><strong>Prazo de Comprovação:</strong> ${formatDate(h.prazoComprovacao)}</div>` : ''}
                    ${h.statusAnterior && h.statusNovo ? `<div style="margin-top: 0.5rem;"><strong>Mudança de Status:</strong> ${getStatusLabel(h.statusAnterior)} → ${getStatusLabel(h.statusNovo)}</div>` : ''}
                    ${h.arquivos && h.arquivos.length > 0 ? `<div style="margin-top: 0.5rem;"><strong>Arquivos:</strong> ${h.arquivos.join(', ')}</div>` : ''}
                </div>
            </div>
            `;
        }).join('')
        : '<p style="text-align: center; color: #999;">Nenhum histórico disponível</p>';

    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Proposição ${proposicao.numero} - Detalhes Completos</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                    color: #333;
                    line-height: 1.6;
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #003366;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }
                .header h1 {
                    color: #003366;
                    font-size: 22px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    color: #666;
                    font-size: 13px;
                }
                .info-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #0066cc;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .info-item {
                    padding: 8px;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                }
                .info-item strong {
                    color: #003366;
                    display: block;
                    margin-bottom: 3px;
                    font-size: 11px;
                }
                .info-item.full-width {
                    grid-column: 1 / -1;
                }
                .section-title {
                    color: #003366;
                    font-size: 16px;
                    margin: 25px 0 15px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #0066cc;
                }
                .timeline-item {
                    border-left: 4px solid #0066cc;
                    padding: 12px;
                    margin-bottom: 15px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    page-break-inside: avoid;
                }
                .timeline-item.publicacao {
                    border-left-color: #fd7e14;
                    background: #fff3cd;
                }
                .timeline-item.comprovacao {
                    border-left-color: #0066cc;
                    background: #e7f3ff;
                }
                .timeline-item.avaliacao {
                    border-left-color: #28a745;
                    background: #d4edda;
                }
                .timeline-header {
                    font-size: 13px;
                    margin-bottom: 8px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #ddd;
                }
                .timeline-content {
                    font-size: 11px;
                    line-height: 1.7;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #e0e0e0;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                @media print {
                    body { padding: 15px; }
                    .timeline-item { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Proposição ${proposicao.numero}</h1>
                <div class="subtitle">${proposicao.tipo} - ${correicao?.ramoMPNome || ''}</div>
            </div>

            <div class="info-section">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Correição:</strong>
                        ${correicao?.numero || '-'} - ${correicao?.ramoMPNome || '-'}
                    </div>
                    <div class="info-item">
                        <strong>Período:</strong>
                        ${correicao ? `${formatDate(correicao.dataInicio)} a ${formatDate(correicao.dataFim)}` : '-'}
                    </div>
                    <div class="info-item">
                        <strong>Unidade:</strong>
                        ${proposicao.unidade || '-'}
                    </div>
                    <div class="info-item">
                        <strong>Membro:</strong>
                        ${proposicao.membro || '-'}
                    </div>
                    <div class="info-item">
                        <strong>Prioridade:</strong>
                        ${proposicao.prioridade?.toUpperCase() || 'NORMAL'}
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong>
                        ${getStatusLabel(statusProcessual)} | ${getStatusLabel(valoracao)}
                    </div>
                    <div class="info-item full-width">
                        <strong>Tags:</strong>
                        ${tagsText}
                    </div>
                    <div class="info-item full-width">
                        <strong>Descrição:</strong>
                        ${proposicao.descricao || '-'}
                    </div>
                </div>
            </div>

            <h2 class="section-title">📜 Histórico Completo (${proposicao.historico?.length || 0} interações)</h2>
            ${timelineHTML}

            <div class="footer">
                <p>Relatório gerado automaticamente pelo Sistema NAD - CNMP</p>
                <p>Conselho Nacional do Ministério Público</p>
                <p>Data de geração: ${formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };

    document.getElementById('detailModalExportMenu').classList.add('hidden');
}
