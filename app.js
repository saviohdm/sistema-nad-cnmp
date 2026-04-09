        // Data Storage
        let correicoes = [];
        let proposicoes = [];
        let currentUser = null;
        let selectedFiles = [];
        let dashboardRamoMPFilter = null; // Filtro de ramo do MP no dashboard

        // Correições table sorting and filtering
        let correicoesSortColumn = null; // Coluna atual de ordenação
        let correicoesSortDirection = 'asc'; // 'asc' ou 'desc'
        let correicoesStatusFilter = ''; // '', 'ativo', 'inativo'
        let currentDetailProposicaoId = null; // ID da proposição atualmente exibida no modal de detalhes
        const STORAGE_SCHEMA_VERSION = '2026-04-07-status-v2';

        // Membros Auxiliares da Corregedoria Nacional
        const membrosAuxiliares = [
            { id: 1, nome: 'Dr. Carlos Eduardo Silva', iniciais: 'CES' },
            { id: 2, nome: 'Dra. Ana Paula Oliveira', iniciais: 'APO' },
            { id: 3, nome: 'Dr. Roberto Mendes Santos', iniciais: 'RMS' },
            { id: 4, nome: 'Dra. Juliana Costa Lima', iniciais: 'JCL' },
            { id: 5, nome: 'Dr. Fernando Almeida Cruz', iniciais: 'FAC' }
        ];

        // ===== LOCALSTORAGE PERSISTENCE =====
        function saveToLocalStorage() {
            try {
                localStorage.setItem('storageSchemaVersion', STORAGE_SCHEMA_VERSION);
                localStorage.setItem('correicoes', JSON.stringify(correicoes));
                localStorage.setItem('proposicoes', JSON.stringify(proposicoes));
                if (currentUser) {
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            } catch (error) {
                console.error('Erro ao salvar dados no localStorage:', error);
            }
        }

        function loadFromLocalStorage() {
            try {
                const storageSchemaVersion = localStorage.getItem('storageSchemaVersion');
                const correicoesData = localStorage.getItem('correicoes');
                const proposicoesData = localStorage.getItem('proposicoes');

                if (correicoesData && proposicoesData && storageSchemaVersion === STORAGE_SCHEMA_VERSION) {
                    correicoes = JSON.parse(correicoesData);
                    proposicoes = JSON.parse(proposicoesData).map(normalizeProposicaoRecord);
                    atualizarStatusCorreicoes();
                    return true;
                }

                if (correicoesData || proposicoesData || storageSchemaVersion) {
                    localStorage.removeItem('correicoes');
                    localStorage.removeItem('proposicoes');
                    localStorage.removeItem('storageSchemaVersion');
                }

                return false;
            } catch (error) {
                console.error('Erro ao carregar dados do localStorage:', error);
                return false;
            }
        }

        function loadUserSession() {
            try {
                const userData = localStorage.getItem('currentUser');
                if (userData) {
                    currentUser = JSON.parse(userData);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Erro ao carregar sessão do usuário:', error);
                return false;
            }
        }

        // Resetar dados - limpar localStorage e reinicializar com dados de amostra
        function resetarDadosDemonstracao() {
            if (confirm('⚠️ Isso vai apagar todos os dados atuais e restaurar os dados de demonstração. Confirma?')) {
                localStorage.clear();
                alert('✅ Dados limpos! Faça login novamente para carregar os dados de demonstração.');
                location.reload();
            }
        }

        // ===== UTILITY FUNCTIONS FOR LONG TEXTS (UP TO 7,500 CHARS) =====

        // Check if text is long (>500 chars)
        function isLongText(text) {
            return text && text.length > 500;
        }

        // Check if text is very long (>2000 chars)
        function isVeryLongText(text) {
            return text && text.length > 2000;
        }

        // Smart truncate - breaks at word boundary
        function smartTruncate(text, maxLength = 120) {
            if (!text || text.length <= maxLength) return text;

            let truncated = text.substring(0, maxLength);
            const lastSpace = truncated.lastIndexOf(' ');

            if (lastSpace > maxLength * 0.7) {
                truncated = truncated.substring(0, lastSpace);
            }

            return truncated + '...';
        }

        // Get text length badge HTML
        function getTextLengthBadge(text) {
            if (!text) return '';

            const length = text.length;
            if (length < 500) return '';

            const badgeClass = length > 2000 ? 'very-long' : 'long';
            return `<span class="text-length-badge ${badgeClass}">${length.toLocaleString('pt-BR')} caracteres</span>`;
        }

        // Create collapsible content HTML
        function createCollapsibleContent(text, title = 'Texto Completo', initiallyCollapsed = true) {
            const collapseId = 'collapse_' + Math.random().toString(36).substr(2, 9);
            const collapsedClass = initiallyCollapsed ? 'collapsed' : '';

            return `
                <div class="collapsible-content ${collapsedClass}" id="${collapseId}">
                    <div class="collapsible-text">${text}</div>
                    <button class="collapsible-toggle" onclick="toggleCollapse('${collapseId}')">
                        <span class="toggle-icon">▼</span>
                        <span class="toggle-text">Expandir ${title}</span>
                    </button>
                </div>
            `;
        }

        // Toggle collapse state
        function toggleCollapse(collapseId) {
            const element = document.getElementById(collapseId);
            if (!element) return;

            const isCollapsed = element.classList.contains('collapsed');
            element.classList.toggle('collapsed');

            const toggleText = element.querySelector('.toggle-text');
            if (toggleText) {
                toggleText.textContent = isCollapsed ? 'Recolher' : 'Expandir';
            }
        }

        // Open text reader modal (fullscreen)
        function openTextReaderModal(title, text) {
            document.getElementById('textReaderTitle').textContent = title;
            document.getElementById('textReaderContent').textContent = text;
            document.getElementById('textReaderModal').classList.remove('hidden');

            // Store current text for copy/print functionality
            window.currentReaderText = text;
        }

        // Close text reader modal
        function closeTextReaderModal() {
            document.getElementById('textReaderModal').classList.add('hidden');
            window.currentReaderText = null;
        }

        // Copy text to clipboard
        function copyTextToClipboard() {
            if (!window.currentReaderText) return;

            navigator.clipboard.writeText(window.currentReaderText).then(() => {
                alert('Texto copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar texto:', err);
                alert('Erro ao copiar texto. Tente novamente.');
            });
        }

        // Print text reader content
        function printTextReader() {
            if (!window.currentReaderText) return;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Impressão - CNMP</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 2rem;
                            line-height: 1.8;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        h1 {
                            color: #003366;
                            border-bottom: 2px solid #003366;
                            padding-bottom: 0.5rem;
                        }
                        .content {
                            white-space: pre-wrap;
                            word-wrap: break-word;
                        }
                    </style>
                </head>
                <body>
                    <h1>${document.getElementById('textReaderTitle').textContent}</h1>
                    <div class="content">${window.currentReaderText}</div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        // Setup character counter for textarea
        function setupCharCounter(textareaId, counterId, maxLength = 7500) {
            const textarea = document.getElementById(textareaId);
            const counter = document.getElementById(counterId);

            if (!textarea || !counter) return;

            const updateCounter = () => {
                const length = textarea.value.length;
                counter.textContent = `${length.toLocaleString('pt-BR')} / ${maxLength.toLocaleString('pt-BR')}`;

                // Add warning/danger classes
                counter.classList.remove('warning', 'danger');
                if (length > maxLength * 0.9) {
                    counter.classList.add('danger');
                } else if (length > maxLength * 0.75) {
                    counter.classList.add('warning');
                }
            };

            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initial count
        }

        // Expand/collapse all cards
        function expandAllCards(containerSelector) {
            const cards = document.querySelectorAll(`${containerSelector} .collapsible-card`);
            cards.forEach(card => card.classList.add('expanded'));
        }

        function collapseAllCards(containerSelector) {
            const cards = document.querySelectorAll(`${containerSelector} .collapsible-card`);
            cards.forEach(card => card.classList.remove('expanded'));
        }

        // Toggle card expand/collapse
        function toggleCard(cardId) {
            const card = document.getElementById(cardId);
            if (card) {
                card.classList.toggle('expanded');
            }
        }

        // Available Tags
        const availableTags = [
            { id: 'administrativo', label: 'Administrativo' },
            { id: 'recursos-humanos', label: 'Recursos Humanos' },
            { id: 'infraestrutura', label: 'Infraestrutura' },
            { id: 'tecnologia', label: 'Tecnologia' },
            { id: 'processual', label: 'Processual' },
            { id: 'financeiro', label: 'Financeiro' },
            { id: 'capacitacao', label: 'Capacitação' },
            { id: 'gestao-documental', label: 'Gestão Documental' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'transparencia', label: 'Transparência' },
            { id: 'outros', label: 'Outros' }
        ];

        // Initialize sample data
        function initializeSampleData() {
            correicoes = [
                {
                    id: 1,
                    numero: 'COR-2024-01',
                    ramoMP: 'MPBA',
                    ramoMPNome: 'MPBA - Ministério Público da Bahia',
                    tematica: 'Correição de direitos fundamentais e meio ambiente',
                    numeroElo: '1234567-89.2024.1.01.0001',
                    tipo: 'Ordinária',
                    mp: 'MPE',
                    uf: ['BA'],
                    status: 'ativo',
                    membroAuxiliar: 1,
                    dataInicio: '2024-01-15',
                    dataFim: '2024-01-30',
                    observacoes: 'Correição ordinária 2024'
                },
                {
                    id: 2,
                    numero: 'COR-2024-02',
                    ramoMP: 'MPRJ',
                    ramoMPNome: 'MPRJ - Ministério Público do Rio de Janeiro',
                    tematica: 'Combate à corrupção e transparência pública',
                    numeroElo: '2345678-90.2024.2.02.0002',
                    tipo: 'Extraordinária',
                    mp: 'MPE',
                    uf: ['RJ'],
                    status: 'ativo',
                    membroAuxiliar: 2,
                    dataInicio: '2024-02-10',
                    dataFim: '2024-02-28',
                    observacoes: 'Correição extraordinária 2024'
                },
                {
                    id: 3,
                    numero: 'COR-2024-03',
                    ramoMP: 'MPMG',
                    ramoMPNome: 'MPMG - Ministério Público de Minas Gerais',
                    tematica: 'Gestão administrativa e recursos humanos',
                    numeroElo: '3456789-01.2024.3.03.0003',
                    tipo: 'OCD',
                    mp: 'MPE',
                    uf: ['MG'],
                    status: 'ativo',
                    membroAuxiliar: 3,
                    dataInicio: '2024-03-05',
                    dataFim: '2024-03-20',
                    observacoes: 'Organização e Controle Documental'
                },
                {
                    id: 4,
                    numero: 'COR-2024-04',
                    ramoMP: 'MPSP',
                    ramoMPNome: 'MPSP - Ministério Público de São Paulo',
                    tematica: 'Inspeção de unidades regionais',
                    numeroElo: '4567890-12.2024.4.04.0004',
                    tipo: 'Inspeção',
                    mp: 'MPE',
                    uf: ['SP'],
                    status: 'ativo',
                    membroAuxiliar: 4,
                    dataInicio: '2024-04-01',
                    dataFim: '2024-04-15',
                    observacoes: 'Inspeção geral das unidades'
                },
                {
                    id: 5,
                    numero: 'COR-2024-05',
                    ramoMP: 'MPU',
                    ramoMPNome: 'MPU - Ministério Público da União',
                    tematica: 'Correição nacional sobre compliance e integridade',
                    numeroElo: '5678901-23.2024.5.05.0005',
                    tipo: 'Ordinária',
                    mp: 'MPU',
                    uf: ['DF', 'SP', 'RJ', 'MG', 'BA'],
                    status: 'ativo',
                    membroAuxiliar: 5,
                    dataInicio: '2024-05-01',
                    dataFim: '2024-05-30',
                    observacoes: 'Correição nacional com abrangência em múltiplos estados'
                }
            ];

            proposicoes = [
                {
                    id: 1,
                    numero: 'PROP-2024-0001',
                    correicaoId: 1,
                    tipo: 'Determinação',
                    unidade: 'Procuradoria-Geral de Justiça',
                    membro: 'Dr. João Silva Santos',
                    descricao: 'Implementar sistema digital de protocolo de documentos',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['encerrada', 'satisfeita'],
                    prioridade: 'alta',
                    tags: ['tecnologia', 'gestao-documental'],
                    rascunhosComprovacao: [],
                    historico: [
                        {
                            tipo: 'comprovacao',
                            data: '2024-11-15T10:30:00',
                            usuario: 'MPBA',
                            descricao: 'Sistema implementado e em funcionamento desde 01/11/2024',
                            arquivos: ['sistema_protocolo_manual.pdf', 'prints_sistema.pdf']
                        },
                        {
                            tipo: 'avaliacao',
                            data: '2024-11-20T14:00:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'Comprovação aceita. Sistema implementado conforme especificado.',
                            statusAnterior: ['pendente_avaliacao', 'sem_avaliacao'],
                            statusNovo: ['encerrada', 'satisfeita']
                        }
                    ]
                },
                {
                    id: 2,
                    numero: 'PROP-2024-0002',
                    correicaoId: 1,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Cachoeira',
                    membro: 'Dra. Maria Oliveira Costa',
                    descricao: 'Adequar instalações físicas conforme normas de acessibilidade',
                    prazoComprovacao: '2025-01-31',
                    dataPublicacao: '2024-12-01T10:00:00',
                    status: ['aguardando_comprovacao', 'necessita_informacoes'],
                    prioridade: 'normal',
                    tags: ['infraestrutura', 'compliance'],
                    rascunhosComprovacao: [],
                    historico: [
                        {
                            tipo: 'publicacao',
                            data: '2024-06-15T09:00:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'Proposição publicada para comprovação inicial. É necessário adequar todas as instalações físicas da Promotoria de Justiça de Cachoeira conforme normas técnicas de acessibilidade (NBR 9050/2015), incluindo instalação de rampas de acesso, banheiros adaptados, sinalização tátil e elevador acessível.',
                            prazoComprovacao: '2024-08-15',
                            statusAnterior: ['pendente_publicacao', 'sem_avaliacao'],
                            statusNovo: ['aguardando_comprovacao', 'sem_avaliacao']
                        },
                        {
                            tipo: 'comprovacao',
                            data: '2024-08-10T14:30:00',
                            usuario: 'MPBA',
                            descricao: 'Informamos que foram iniciadas as obras de adequação das instalações físicas. Até o momento foram concluídas:\n\n1. Instalação de rampa de acesso principal (concluída em 15/07/2024)\n2. Adaptação de 01 (um) banheiro no térreo com barras de apoio e vaso sanitário elevado\n3. Sinalização tátil no piso da entrada principal\n\nAs obras de instalação do elevador estão em fase de licitação, com previsão de início para setembro/2024. Os demais banheiros estão programados para adaptação no segundo semestre.\n\nSegue em anexo o relatório fotográfico das obras concluídas e cronograma atualizado.',
                            observacoes: 'Obras parcialmente executadas devido a necessidade de licitação para instalação do elevador.',
                            arquivos: [
                                'relatorio_fotografico_obras_jul2024.pdf',
                                'cronograma_obras_acessibilidade.xlsx',
                                'ata_reuniao_engenharia.pdf'
                            ]
                        },
                        {
                            tipo: 'avaliacao',
                            data: '2024-08-20T11:15:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'A comprovação apresentada demonstra execução parcial da proposição. Foram constatados avanços significativos com a conclusão da rampa de acesso e adaptação de banheiro, porém permanecem pendentes elementos essenciais:\n\n1. Instalação de elevador acessível (obra estrutural não iniciada)\n2. Adaptação dos demais banheiros do prédio\n3. Sinalização tátil completa em todos os pavimentos\n4. Vagas exclusivas de estacionamento para pessoas com deficiência\n\nDECISÃO: A proposição necessita de informações complementares sobre o cronograma definitivo de conclusão integral das adequações, especialmente quanto à instalação do elevador, item fundamental para a acessibilidade vertical do edifício.\n\nDetermino republicação da proposição com novo prazo para apresentação de comprovação da conclusão total das obras.',
                            statusAnterior: ['pendente_avaliacao', 'sem_avaliacao'],
                            statusNovo: ['pendente_publicacao', 'necessita_informacoes']
                        },
                        {
                            tipo: 'publicacao',
                            data: '2024-09-01T10:00:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'REPUBLICAÇÃO: Proposição republicada após avaliação que indicou necessidade de informações complementares. A unidade deverá comprovar a conclusão integral das adequações de acessibilidade, com ênfase especial na instalação do elevador acessível e adaptação completa de todos os sanitários. Apresentar cronograma executivo atualizado com marcos de conclusão e relatório fotográfico final.',
                            prazoComprovacao: '2024-11-30',
                            statusAnterior: ['pendente_publicacao', 'necessita_informacoes'],
                            statusNovo: ['aguardando_comprovacao', 'necessita_informacoes']
                        },
                        {
                            tipo: 'comprovacao',
                            data: '2024-11-25T16:45:00',
                            usuario: 'MPBA',
                            descricao: 'Informamos que, infelizmente, o processo licitatório para instalação do elevador foi suspenso devido a impugnação administrativa apresentada por licitante. O processo encontra-se em análise jurídica e deve ser retomado somente em janeiro/2025.\n\nNão obstante, foram concluídas outras adequações:\n\n1. Adaptação de mais 02 (dois) banheiros (1º e 2º pavimentos) - concluído em outubro/2024\n2. Sinalização tátil instalada em todos os corredores e escadas\n3. Piso tátil de alerta nas áreas de risco\n4. Demarcação de 03 vagas exclusivas no estacionamento\n\nSolicitamos prorrogação do prazo para apresentação da comprovação final, tendo em vista que a pendência da instalação do elevador decorre de motivos alheios à vontade da administração (suspensão do processo licitatório).',
                            observacoes: 'Processo licitatório suspenso. Aguardando análise jurídica para retomada.',
                            arquivos: [
                                'oficio_licitacao_suspensa.pdf',
                                'fotos_banheiros_adaptados_nov2024.pdf',
                                'planta_sinalizacao_tatil.pdf',
                                'termo_impugnacao_licitacao.pdf'
                            ]
                        },
                        {
                            tipo: 'avaliacao',
                            data: '2024-12-01T10:00:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'A segunda comprovação apresentada demonstra novamente execução incompleta da proposição, ainda que com avanços nas adequações de sanitários e sinalização tátil.\n\nEmbora a suspensão do processo licitatório configure óbice administrativo relevante, permanece a necessidade de comprovar solução concreta e cronograma definitivo para eliminação da inadequação das instalações físicas.\n\nCONSTATAÇÕES:\n✓ Banheiros adaptados: 03 de 05 concluídos (60%)\n✓ Sinalização tátil: 100% concluída\n✓ Vagas estacionamento: 100% concluída\n✗ Elevador acessível: 0% (item crítico não iniciado)\n✗ Banheiros pendentes: 02 unidades (40%)\n\nDECISÃO: A proposição continua necessitando de informações complementares. A ausência de elevador acessível em prédio de múltiplos pavimentos inviabiliza o pleno acesso de pessoas com mobilidade reduzida.\n\nDETERMINO:\n1. Republicação com novo prazo\n2. Apresentação de plano de ação emergencial\n3. Solução definitiva para a questão do elevador\n4. Conclusão dos 02 banheiros remanescentes',
                            statusAnterior: ['pendente_avaliacao', 'necessita_informacoes'],
                            statusNovo: ['pendente_publicacao', 'necessita_informacoes']
                        },
                        {
                            tipo: 'publicacao',
                            data: '2024-12-05T09:30:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'SEGUNDA REPUBLICAÇÃO: Proposição republicada após segunda avaliação que identificou necessidade de informações complementares. Exige-se a conclusão definitiva e integral de todas as adequações de acessibilidade. Especial atenção para:\n\n1. Elevador acessível, com solução definitiva\n2. Conclusão dos 02 banheiros remanescentes\n3. Plano de ação com cronograma executivo realista\n4. Comprovação fotográfica e documental completa\n\nEsta é a terceira publicação da mesma proposição. O não atendimento integral poderá ensejar outras medidas administrativas cabíveis.',
                            prazoComprovacao: '2025-01-31',
                            statusAnterior: ['pendente_publicacao', 'necessita_informacoes'],
                            statusNovo: ['aguardando_comprovacao', 'necessita_informacoes']
                        }
                    ]
                },
                {
                    id: 3,
                    numero: 'PROP-2024-0003',
                    correicaoId: 2,
                    tipo: 'Determinação',
                    unidade: 'Corregedoria-Geral de Justiça',
                    membro: 'Dr. Carlos Eduardo Mendes',
                    descricao: 'Regularizar processos de gestão de pessoas',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['pendente_publicacao', 'sem_avaliacao'],
                    prioridade: 'urgente',
                    tags: ['recursos-humanos', 'administrativo'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 4,
                    numero: 'PROP-2024-0004',
                    correicaoId: 3,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Caculé',
                    membro: 'Dra. Ana Paula Ferreira',
                    descricao: 'Atualizar inventário patrimonial',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['pendente_publicacao', 'necessita_informacoes'],
                    prioridade: 'normal',
                    tags: ['financeiro', 'administrativo'],
                    rascunhosComprovacao: [],
                    historico: [
                        {
                            tipo: 'comprovacao',
                            data: '2024-11-10T09:00:00',
                            usuario: 'MPMG',
                            descricao: 'Inventário parcialmente atualizado - 60% concluído',
                            arquivos: ['inventario_parcial.xlsx']
                        },
                        {
                            tipo: 'avaliacao',
                            data: '2024-11-12T15:30:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'Adimplemento parcial aceito. Necessário completar os 40% restantes.',
                            statusAnterior: ['pendente_avaliacao', 'sem_avaliacao'],
                            statusNovo: ['pendente_publicacao', 'necessita_informacoes']
                        }
                    ]
                },
                {
                    id: 5,
                    numero: 'PROP-2024-0005',
                    correicaoId: 3,
                    tipo: 'Determinação',
                    unidade: 'Procuradoria-Geral de Justiça',
                    membro: 'Dr. Roberto Almeida Lima',
                    descricao: 'Implementar controles internos de correição',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['pendente_publicacao', 'sem_avaliacao'],
                    prioridade: 'alta',
                    tags: ['compliance', 'administrativo'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 6,
                    numero: 'PROP-2024-0006',
                    correicaoId: 4,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Santo André',
                    membro: 'Dr. Fernando Souza Prado',
                    descricao: 'Criar programa de capacitação continuada',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['pendente_publicacao', 'sem_avaliacao'],
                    prioridade: 'normal',
                    tags: ['capacitacao', 'recursos-humanos'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 7,
                    numero: 'PROP-2024-0007',
                    correicaoId: 4,
                    tipo: 'Determinação',
                    unidade: 'Promotoria de Justiça de Osasco',
                    membro: 'Dra. Juliana Barbosa Reis',
                    descricao: 'Modernizar infraestrutura de TI',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['encerrada', 'satisfeita'],
                    prioridade: 'alta',
                    tags: ['tecnologia', 'infraestrutura'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 8,
                    numero: 'PROP-2024-0008',
                    correicaoId: 2,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Niterói',
                    membro: 'Dr. Marcelo Tavares Cruz',
                    descricao: 'Reorganizar estrutura administrativa - proposição superada por nova legislação',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['encerrada', 'prejudicada'],
                    prioridade: 'normal',
                    tags: ['administrativo', 'processual'],
                    rascunhosComprovacao: [],
                    historico: [
                        {
                            tipo: 'avaliacao',
                            data: '2024-10-05T11:00:00',
                            usuario: 'Corregedoria Nacional',
                            descricao: 'Proposição prejudicada em razão da Lei nº 14.133/2021 que torna desnecessária a reorganização proposta.',
                            statusAnterior: ['pendente_publicacao', 'sem_avaliacao'],
                            statusNovo: ['encerrada', 'prejudicada']
                        }
                    ]
                },
                {
                    id: 9,
                    numero: 'PROP-2024-0009',
                    correicaoId: 1,
                    tipo: 'Determinação',
                    unidade: 'Procuradoria-Geral de Justiça',
                    membro: 'Dra. Patricia Moreira Santos',
                    descricao: 'Implementar política de gestão documental e arquivística',
                    prazoComprovacao: null,
                    dataPublicacao: null,
                    status: ['pendente_avaliacao', 'sem_avaliacao'],
                    prioridade: 'alta',
                    tags: ['gestao-documental', 'tecnologia', 'compliance'],
                    rascunhosComprovacao: [],
                    historico: [
                        {
                            tipo: 'comprovacao',
                            data: '2024-11-25T16:45:00',
                            usuario: 'MPBA',
                            descricao: 'Política de gestão documental implementada através da Portaria nº 456/2024. Sistema de arquivamento digital em funcionamento desde novembro/2024.',
                            observacoes: 'Aguardando validação da Corregedoria Nacional',
                            arquivos: ['portaria_456_2024.pdf', 'manual_gestao_documental.pdf', 'prints_sistema_arquivo.pdf']
                        }
                    ]
                },
                {
                    id: 10,
                    numero: 'PROP-2024-0010',
                    correicaoId: 1,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Itabuna',
                    membro: 'Dr. André Luiz Cardoso',
                    descricao: 'Implementar ouvidoria digital com canal de denúncias online',
                    prazoComprovacao: '2025-01-31',
                    dataPublicacao: '2024-12-01T10:00:00',
                    status: ['aguardando_comprovacao', 'sem_avaliacao'],
                    prioridade: 'alta',
                    tags: ['tecnologia', 'transparencia', 'compliance'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 11,
                    numero: 'PROP-2024-0011',
                    correicaoId: 1,
                    tipo: 'Determinação',
                    unidade: 'Corregedoria-Geral de Justiça',
                    membro: 'Dr. Ricardo Henrique Alves',
                    descricao: 'Criar programa de compliance e integridade institucional',
                    prazoComprovacao: '2025-01-31',
                    dataPublicacao: '2024-12-01T10:00:00',
                    status: ['aguardando_comprovacao', 'sem_avaliacao'],
                    prioridade: 'alta',
                    tags: ['compliance', 'administrativo', 'capacitacao'],
                    rascunhosComprovacao: [],
                    historico: []
                },
                {
                    id: 12,
                    numero: 'PROP-2024-0012',
                    correicaoId: 1,
                    tipo: 'Recomendação',
                    unidade: 'Promotoria de Justiça de Feira de Santana',
                    membro: 'Dra. Luciana Martins Dias',
                    descricao: 'Padronizar fluxos de trabalho e procedimentos administrativos',
                    prazoComprovacao: '2025-01-31',
                    dataPublicacao: '2024-12-01T10:00:00',
                    status: ['aguardando_comprovacao', 'sem_avaliacao'],
                    prioridade: 'normal',
                    tags: ['administrativo', 'processual', 'gestao-documental'],
                    rascunhosComprovacao: [
                        {
                            descricao: 'Informamos que foi instituído Grupo de Trabalho por meio da Portaria PGJ nº 145/2024 para padronização dos fluxos de trabalho e procedimentos administrativos da Promotoria de Justiça de Feira de Santana.\n\nO Grupo de Trabalho, constituído por 05 (cinco) membros, realizou as seguintes ações:\n\n1. Mapeamento completo dos processos administrativos existentes (concluído em novembro/2024)\n2. Identificação de gargalos e pontos de melhoria nos fluxos atuais\n3. Elaboração de Manual de Procedimentos Administrativos padronizados (versão preliminar anexa)\n4. Realização de 03 (três) oficinas de capacitação com servidores da unidade\n5. Implementação de sistema de controle de prazos digitais\n\nO Manual de Procedimentos contempla:\n- Fluxo de recebimento e distribuição de expedientes\n- Procedimentos de protocolo e arquivo\n- Rotinas de atendimento ao público\n- Controle de diligências e prazos\n- Gestão documental e organização de autos\n\nA implementação integral está prevista para janeiro/2025, com acompanhamento mensal dos indicadores de eficiência operacional.',
                            observacoes: 'Manual ainda em fase de revisão final pelo Grupo de Trabalho. Previsão de aprovação definitiva: 15/01/2025.',
                            arquivos: [
                                'portaria_pgj_145_2024_grupo_trabalho.pdf',
                                'manual_procedimentos_administrativos_v1.pdf',
                                'relatorio_mapeamento_processos.xlsx',
                                'lista_presenca_oficinas_capacitacao.pdf',
                                'cronograma_implementacao_2025.pdf'
                            ]
                        }
                    ],
                    historico: []
                },
                {
                    id: 13,
                    numero: 'PROP-2024-0013',
                    correicaoId: 1,
                    tipo: 'Determinação',
                    unidade: 'Procuradoria-Geral de Justiça',
                    membro: 'Dr. Eduardo Pereira Gomes',
                    descricao: 'Estabelecer política de segurança da informação e proteção de dados',
                    prazoComprovacao: '2025-01-31',
                    dataPublicacao: '2024-12-01T10:00:00',
                    status: ['aguardando_comprovacao', 'sem_avaliacao'],
                    prioridade: 'urgente',
                    tags: ['tecnologia', 'compliance', 'administrativo'],
                    rascunhosComprovacao: [
                        {
                            descricao: 'Informamos a implementação da Política de Segurança da Informação e Proteção de Dados no âmbito da Procuradoria-Geral de Justiça, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).\n\nMEDIDAS IMPLEMENTADAS:\n\n1. NORMATIVAS E GOVERNANÇA:\n- Instituída Política de Segurança da Informação (Portaria PGJ nº 178/2024)\n- Criado Comitê Gestor de Proteção de Dados\n- Nomeado Encarregado de Dados (DPO) - Resolução PGJ nº 89/2024\n- Aprovado Regulamento de Uso de Sistemas e Recursos de TI\n\n2. MEDIDAS TÉCNICAS:\n- Implementação de sistema de autenticação multifator (MFA) em 100% dos acessos\n- Criptografia end-to-end em todas as bases de dados sensíveis\n- Firewall de nova geração com proteção DDoS\n- Sistema de backup automático com redundância geográfica\n- Antivírus corporativo centralizado (Kaspersky Enterprise)\n- Monitoramento 24/7 com sistema SIEM (Security Information and Event Management)\n\n3. CAPACITAÇÃO:\n- Realização de 08 (oito) treinamentos sobre LGPD e segurança da informação\n- Certificação de 100% dos servidores em curso EAD sobre proteção de dados\n- Workshop específico para gestores sobre gestão de incidentes de segurança\n\n4. PROCESSOS:\n- Mapeamento completo de tratamento de dados pessoais (inventário de dados)\n- Implementação de procedimentos de resposta a incidentes\n- Elaboração de Relatório de Impacto à Proteção de Dados (RIPD)\n- Revisão de contratos com fornecedores (cláusulas LGPD)\n\n5. INFRAESTRUTURA:\n- Atualização de todos os servidores para versões com suporte de segurança\n- Implementação de política de senhas fortes (12 caracteres, rotação 90 dias)\n- Segregação de redes (administrativa, judicial, visitantes)\n- Sistema de detecção e prevenção de intrusão (IDS/IPS)\n\nA Política está em pleno funcionamento desde dezembro/2024, com auditorias trimestrais programadas.',
                            observacoes: 'Aguardando relatório final da auditoria externa de segurança (previsão: 20/01/2025) para anexar como evidência adicional.',
                            arquivos: [
                                'portaria_pgj_178_2024_politica_seguranca.pdf',
                                'resolucao_pgj_89_2024_dpo.pdf',
                                'regulamento_uso_sistemas_ti.pdf',
                                'certificados_treinamento_lgpd.zip',
                                'inventario_dados_pessoais.xlsx',
                                'relatorio_impacto_protecao_dados_ripd.pdf',
                                'contratos_revisados_fornecedores.zip',
                                'relatorio_infraestrutura_ti_atualizada.pdf'
                            ]
                        }
                    ],
                    historico: []
                }
            ];

            proposicoes = proposicoes.map(normalizeProposicaoRecord);
            // Atualizar status das correições baseado nas proposições
            atualizarStatusCorreicoes();

            populateDashboardRamoMPFilter();
            updateDashboard();
            renderProposicoesTable();
            renderCorreicoesTable();
            renderAvaliacaoTable();
            renderProposicoesComprovacaoTable();
            populateProposicaoSelect();
            populateCorreicaoFilter();
            populateCorreicaoIdSelect();
            populateCorreicaoPublicar();
            populateTagSelect();
            populateTagFilter();
        }

        // Populate tag selection checkboxes
        function populateTagSelect() {
            const container = document.getElementById('tagSelectContainer');
            if (!container) return;

            container.innerHTML = availableTags.map(tag => `
                <div class="tag-checkbox-item">
                    <input type="checkbox" id="tag-${tag.id}" value="${tag.id}">
                    <label for="tag-${tag.id}">
                        <span class="tag-badge tag-${tag.id}">${tag.label}</span>
                    </label>
                </div>
            `).join('');
        }

        // Get selected tags from form
        function getSelectedTags() {
            const checkboxes = document.querySelectorAll('#tagSelectContainer input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => cb.value);
        }

        // Populate tag filter dropdown
        function populateTagFilter() {
            const select = document.getElementById('tagFilter');
            if (!select) return;

            select.innerHTML = '<option value="">Todas as tags</option>' +
                availableTags.map(tag => `<option value="${tag.id}">${tag.label}</option>`).join('');
        }

        // Render tag badges
        function renderTagBadges(tags) {
            if (!tags || tags.length === 0) return '<span style="color: var(--text-muted); font-size: 0.75rem;">-</span>';

            return tags.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                const label = tag ? tag.label : tagId;
                return `<span class="tag-badge tag-${tagId}">${label}</span>`;
            }).join('');
        }

        // Toggle ramoMP field visibility
        function toggleRamoMPField() {
            const userType = document.getElementById('userType').value;
            const ramoMPGroup = document.getElementById('ramoMPGroup');
            const ramoMPSelect = document.getElementById('ramoMPLogin');

            if (userType === 'user') {
                ramoMPGroup.classList.remove('hidden');
                ramoMPSelect.setAttribute('required', 'required');
            } else {
                ramoMPGroup.classList.add('hidden');
                ramoMPSelect.removeAttribute('required');
                ramoMPSelect.value = '';
            }
        }

        // Login (only setup if on index.html)
        function setupLoginForm() {
            const loginForm = document.getElementById('loginForm');
            if (!loginForm) return; // Not on index.html, skip

            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const userType = document.getElementById('userType').value;
                const ramoMP = document.getElementById('ramoMPLogin').value;

                // Validate ramoMP for correicionados
                if (userType === 'user' && !ramoMP) {
                    alert('Por favor, selecione seu Ramo do Ministério Público.');
                    return;
                }

                currentUser = {
                    username: username,
                    type: userType,
                    ramoMP: userType === 'user' ? ramoMP : null,
                    ramoMPNome: userType === 'user' ? ramosMPBrasil.find(r => r.sigla === ramoMP)?.nome : null
                };

                document.getElementById('userName').textContent = username;
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainApp').classList.remove('hidden');

                // Hide/Show menu items based on user type
                if (userType === 'user') {
                    // Hide admin-only pages
                    document.getElementById('navPublicar').style.display = 'none';
                    document.getElementById('navAvaliar').style.display = 'none';
                    document.getElementById('navCadastroCorreicao').style.display = 'none';
                    document.getElementById('navCadastroProposicao').style.display = 'none';
                } else {
                    // Hide correicionado-only pages
                    document.getElementById('navMinhasComprovacoes').style.display = 'none';
                }

                // Try to load from localStorage first, otherwise initialize with sample data
                if (!loadFromLocalStorage()) {
                    initializeSampleData();
                }
                saveToLocalStorage();

                // Initialize UI
                atualizarStatusCorreicoes();
                populateDashboardRamoMPFilter();
                updateDashboard();
                renderDashboardMembrosAuxiliares();
                renderCorreicoesTable();
                renderProposicoesTable();
                populateCorreicaoFilter();
                populateCorreicaoIdSelect();
                populateProposicaoSelect();
                renderAvaliacaoTable();
                renderProposicoesComprovacaoTable();
                carregarProposicoesParaPublicar();
            });
        }

        // Call setupLoginForm when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupLoginForm);
        } else {
            setupLoginForm();
        }

        // Logout
        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('loginForm').reset();
        }

        // Navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });

            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Show selected page
            document.getElementById(pageId + 'Page').classList.remove('hidden');

            // Add active class to selected nav item
            event.currentTarget.classList.add('active');

            // Atualizar filtro do dashboard quando navegar para a página
            if (pageId === 'dashboard') {
                populateDashboardRamoMPFilter();
                updateDashboard();
            }

            // Renderizar dashboard de membros auxiliares ao navegar para correições
            if (pageId === 'correicoes') {
                renderDashboardMembrosAuxiliares();
            }
        }

        // Filter functions by ramoMP
        function getFilteredCorreicoes() {
            let filtered = correicoes;

            // Filtro por usuário
            if (currentUser && currentUser.type !== 'admin') {
                filtered = filtered.filter(c => c.ramoMP === currentUser.ramoMP);
            }

            // Filtro específico do dashboard por ramo do MP
            if (dashboardRamoMPFilter) {
                filtered = filtered.filter(c => c.ramoMP === dashboardRamoMPFilter);
            }

            return filtered;
        }

        function getFilteredProposicoes() {
            let filtered = proposicoes;

            // Filtro por usuário
            if (currentUser && currentUser.type !== 'admin') {
                filtered = filtered.filter(p => {
                    const correicao = correicoes.find(c => c.id === p.correicaoId);
                    return correicao && correicao.ramoMP === currentUser.ramoMP;
                });
            }

            // Filtro específico do dashboard por ramo do MP
            if (dashboardRamoMPFilter) {
                filtered = filtered.filter(p => {
                    const correicao = correicoes.find(c => c.id === p.correicaoId);
                    return correicao && correicao.ramoMP === dashboardRamoMPFilter;
                });
            }

            return filtered;
        }

        // ========== DASHBOARD & UI FUNCTIONS ==========
        // Dashboard and UI visualization functions moved to js/ui-dashboard-tables.js
        // Includes: updateDashboard, drawChart, drawValoracaoChart, populateDashboardRamoMPFilter,
        //           filtrarDashboardPorRamoMP, getDashboardWorkflowStats, getDashboardValoracaoStats,
        //           calcularEstatisticasPorMembro, renderDashboardMembrosAuxiliares

        // ========== EXPORT FUNCTIONS ==========
        // Export functions moved to js/export.js
        // Includes: toggleExportMenu, exportarDashboardJSON, exportarDashboardPDF,
        //           exportarCorreicoesJSON, exportarCorreicoesPDF, exportarCorreicoesRelatorioDetalhado,
        //           exportarDetalheJSON, exportarDetalhePDF, getCorreicoesFiltradas

        function getCorreicaoTableStats(correicaoId) {
            const proposicoesCorreicao = proposicoes.filter(p => p.correicaoId === correicaoId);

            return {
                totalProposicoes: proposicoesCorreicao.length,
                pendentePublicacao: proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'pendente_publicacao').length,
                pendenteAvaliacao: proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'pendente_avaliacao').length,
                prazoVencido: proposicoesCorreicao.filter(p => isPrazoComprovacaoVencido(p)).length,
                proposicoes: proposicoesCorreicao
            };
        }


        // Render Proposições Table
        function renderProposicoesTable() {
            const tbody = document.getElementById('proposicoesTableBody');
            const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
            const statusFilter = document.getElementById('statusFilter')?.value || '';
            const correicaoFilter = document.getElementById('correicaoFilter')?.value || '';
            const tagFilter = document.getElementById('tagFilter')?.value || '';

            // Get proposições filtered by ramoMP first
            const baseFiltered = getFilteredProposicoes();

            let filtered = baseFiltered.filter(p => {
                const correicao = correicoes.find(c => c.id === p.correicaoId);
                const ramoMP = correicao ? correicao.ramoMP : '';

                const matchesSearch = p.numero.toLowerCase().includes(searchTerm) ||
                                    ramoMP.toLowerCase().includes(searchTerm) ||
                                    p.descricao.toLowerCase().includes(searchTerm) ||
                                    (p.tipo && p.tipo.toLowerCase().includes(searchTerm)) ||
                                    (p.unidade && p.unidade.toLowerCase().includes(searchTerm)) ||
                                    (p.membro && p.membro.toLowerCase().includes(searchTerm));

                // Status filter checks both processual and valoração
                let matchesStatus = true;
                if (statusFilter) {
                    const statusProcessual = getStatusProcessual(p);
                    const valoracao = getValoracao(p);
                    matchesStatus = statusProcessual === statusFilter || valoracao === statusFilter;
                }

                const matchesCorreicao = !correicaoFilter || p.correicaoId === parseInt(correicaoFilter);
                const matchesTag = !tagFilter || (p.tags && p.tags.includes(tagFilter));
                return matchesSearch && matchesStatus && matchesCorreicao && matchesTag;
            });

            tbody.innerHTML = filtered.map(p => {
                const correicao = correicoes.find(c => c.id === p.correicaoId);
                const correicaoInfo = correicao ? `${correicao.numero}` : 'N/A';
                const ramoMP = correicao ? correicao.ramoMP : 'N/A';
                const prazoVencido = isPrazoComprovacaoVencido(p);
                const prazoVencidoBadge = prazoVencido ? '<span class="prazo-vencido-badge">⚠️ PRAZO VENCIDO</span>' : '';
                const rowClass = prazoVencido ? 'prazo-vencido' : '';

                // Smart truncate description with length badge
                const descPreview = smartTruncate(p.descricao, 120);
                const lengthBadge = getTextLengthBadge(p.descricao);
                const readBtn = isLongText(p.descricao) ?
                    `<button class="btn-read-full" onclick="openTextReaderModal('${p.numero} - Descrição', \`${p.descricao.replace(/`/g, '\\`')}\`)">📖 Ler</button>` : '';

                return `
                    <tr class="${rowClass}">
                        <td>${p.numero}</td>
                        <td>${correicaoInfo}</td>
                        <td>${ramoMP}</td>
                        <td>${p.tipo || '-'}</td>
                        <td>${p.unidade || '-'}</td>
                        <td>${p.membro || '-'}</td>
                        <td>
                            <div class="text-preview">
                                <span class="text-preview-content">${descPreview}</span>
                                ${lengthBadge}
                                ${readBtn}
                            </div>
                        </td>
                        <td>${renderTagBadges(p.tags)}</td>
                        <td>
                            ${renderStatusBadges(p.status)}
                            ${prazoVencidoBadge}
                        </td>
                        <td>
                            <button class="btn btn-primary btn-action" onclick="viewDetails(${p.id})">Ver</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Search and filter
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-login if user session exists
            if (loadUserSession() && loadFromLocalStorage()) {
                // Restore user session
                document.getElementById('userName').textContent = currentUser.username;
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainApp').classList.remove('hidden');

                // Hide/Show menu items based on user type
                if (currentUser.type === 'user') {
                    // Hide admin-only pages
                    document.getElementById('navPublicar').style.display = 'none';
                    document.getElementById('navAvaliar').style.display = 'none';
                    document.getElementById('navCadastroCorreicao').style.display = 'none';
                    document.getElementById('navCadastroProposicao').style.display = 'none';
                } else {
                    // Hide correicionado-only pages
                    document.getElementById('navMinhasComprovacoes').style.display = 'none';
                }

                // Initialize UI
                atualizarStatusCorreicoes();
                updateDashboard();
                renderCorreicoesTable();
                renderProposicoesTable();
                populateCorreicaoFilter();
                populateCorreicaoIdSelect();
                populateProposicaoSelect();
                renderAvaliacaoTable();
                renderProposicoesComprovacaoTable();
                carregarProposicoesParaPublicar();

                // Check for hash navigation (e.g., #enviar from comprovacao.html)
                if (window.location.hash) {
                    const page = window.location.hash.substring(1);
                    showPage(page);
                }
            }

            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                const statusFilter = document.getElementById('statusFilter');
                const correicaoFilter = document.getElementById('correicaoFilter');
                const tagFilter = document.getElementById('tagFilter');
                const searchCorreicao = document.getElementById('searchCorreicao');

                if (searchInput) {
                    searchInput.addEventListener('input', renderProposicoesTable);
                }
                if (statusFilter) {
                    statusFilter.addEventListener('change', renderProposicoesTable);
                }
                if (correicaoFilter) {
                    correicaoFilter.addEventListener('change', renderProposicoesTable);
                }
                if (tagFilter) {
                    tagFilter.addEventListener('change', renderProposicoesTable);
                }
                if (searchCorreicao) {
                    searchCorreicao.addEventListener('input', renderCorreicoesTable);
                }

                // Setup character counters for textareas
                setupCharCounter('descricaoProposicao', 'descricaoProposicaoCount', 7500);
                setupCharCounter('descricaoComprovacaoRascunho', 'descricaoComprovacaoRascunhoCount', 7500);
            }, 100);
        });

        // View Details
        function viewDetails(id) {
            const proposicao = proposicoes.find(p => p.id === id);
            if (!proposicao) return;

            // Armazenar ID para funções de exportação
            currentDetailProposicaoId = id;

            const correicao = correicoes.find(c => c.id === proposicao.correicaoId);
            const correicaoInfo = correicao ? `${correicao.numero} - ${correicao.ramoMPNome}` : 'N/A';
            const periodoCorreicao = correicao ? `${formatDate(correicao.dataInicio)} a ${formatDate(correicao.dataFim)}` : 'N/A';

            // Gerar histórico
            let historicoHTML = '';
            if (proposicao.historico && proposicao.historico.length > 0) {
                historicoHTML = `
                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Histórico Completo (${proposicao.historico.length} interações)</h4>
                        ${proposicao.historico.length > 3 ? `
                        <div class="expand-all-controls">
                            <button class="btn btn-secondary" onclick="expandAllCards('.timeline')">Expandir Todos</button>
                            <button class="btn btn-secondary" onclick="collapseAllCards('.timeline')">Recolher Todos</button>
                        </div>
                        ` : ''}
                        <div class="timeline">
                            ${proposicao.historico.map((h, index) => {
                                let tipoLabel = 'Registro';
                                if (h.tipo === 'publicacao') tipoLabel = 'Proposição Publicada';
                                else if (h.tipo === 'comprovacao') tipoLabel = 'Comprovação Enviada';
                                else if (h.tipo === 'avaliacao') tipoLabel = 'Avaliação da Corregedoria';

                                const statusInfo = (h.tipo === 'avaliacao' || h.tipo === 'publicacao') ?
                                    `<div style="margin-top: 0.5rem;">
                                        <strong>Decisão:</strong>
                                        <span class="badge badge-${h.statusNovo}">${getStatusLabel(h.statusNovo)}</span>
                                    </div>` : '';

                                const prazoInfo = h.tipo === 'publicacao' && h.prazoComprovacao ?
                                    `<div style="margin-top: 0.5rem;">
                                        <strong>Prazo para Comprovação:</strong> ${formatDate(h.prazoComprovacao)}
                                    </div>` : '';

                                const arquivosHTML = h.arquivos && h.arquivos.length > 0 ?
                                    `<div class="timeline-files">
                                        <strong>Arquivos:</strong><br>
                                        ${h.arquivos.map(a => `<span class="timeline-file">📎 ${a}</span>`).join('')}
                                    </div>` : '';

                                const observacoesHTML = h.observacoes ?
                                    `<div style="margin-top: 0.5rem;">
                                        <strong>Observações:</strong> ${h.observacoes}
                                    </div>` : '';

                                // Create collapsible card for timeline items
                                const cardId = `timeline_card_${index}`;
                                const isLong = isLongText(h.descricao);
                                const lengthBadge = getTextLengthBadge(h.descricao);

                                return `
                                    <div class="collapsible-card" id="${cardId}">
                                        <div class="collapsible-card-header" onclick="toggleCard('${cardId}')">
                                            <div class="collapsible-card-title">
                                                <span class="timeline-marker ${h.tipo}" style="position: relative; left: 0; margin-right: 0.5rem;"></span>
                                                ${tipoLabel} - ${formatDateTime(h.data)} ${lengthBadge}
                                            </div>
                                            <span>▼</span>
                                        </div>
                                        <div class="collapsible-card-body">
                                            <div style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">
                                                Por: ${h.usuario}
                                            </div>
                                            ${isLong ?
                                                `<div style="margin-bottom: 0.5rem;"><strong>Descrição:</strong></div>
                                                ${createCollapsibleContent(h.descricao, 'descrição', true)}` :
                                                `<div class="timeline-body" style="white-space: pre-wrap; line-height: 1.7;">
                                                    ${h.descricao}
                                                </div>`
                                            }
                                            ${statusInfo}
                                            ${prazoInfo}
                                            ${observacoesHTML}
                                            ${arquivosHTML}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Número:</span>
                    <span class="detail-value">${proposicao.numero}</span>
                </div>
                ${proposicao.tipo ? `
                <div class="detail-row">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">${proposicao.tipo}</span>
                </div>
                ` : ''}
                ${proposicao.unidade ? `
                <div class="detail-row">
                    <span class="detail-label">Unidade:</span>
                    <span class="detail-value">${proposicao.unidade}</span>
                </div>
                ` : ''}
                ${proposicao.membro ? `
                <div class="detail-row">
                    <span class="detail-label">Membro:</span>
                    <span class="detail-value">${proposicao.membro}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Correição:</span>
                    <span class="detail-value">${correicaoInfo}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Período da Correição:</span>
                    <span class="detail-value">${periodoCorreicao}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Prioridade:</span>
                    <span class="detail-value">${proposicao.prioridade.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${renderStatusBadges(proposicao.status)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tags:</span>
                    <span class="detail-value">${renderTagBadges(proposicao.tags)}</span>
                </div>
                <div class="detail-row" style="flex-direction: column; align-items: flex-start;">
                    <span class="detail-label" style="margin-bottom: 0.5rem;">Descrição: ${getTextLengthBadge(proposicao.descricao)}</span>
                    ${isLongText(proposicao.descricao) ?
                        createCollapsibleContent(proposicao.descricao, 'descrição completa', true) :
                        `<span class="detail-value" style="white-space: pre-wrap; line-height: 1.7;">${proposicao.descricao}</span>`
                    }
                </div>
                ${historicoHTML}
            `;

            document.getElementById('detailModal').classList.remove('hidden');
        }

        // View Correição Details
        function viewCorreicaoDetails(id) {
            const correicao = correicoes.find(c => c.id === id);
            if (!correicao) return;

            const stats = getCorreicaoTableStats(id);
            const proposicoesCorreicao = stats.proposicoes;
            const totalProposicoes = stats.totalProposicoes;

            // Status Processual
            const pendentePublicacao = stats.pendentePublicacao;
            const aguardandoComprovacao = proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'aguardando_comprovacao').length;
            const pendenteAvaliacao = stats.pendenteAvaliacao;
            const encerradas = proposicoesCorreicao.filter(p => getCanonicalStatusProcessual(p) === 'encerrada').length;

            // Valoração
            const novas = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'sem_avaliacao').length;
            const necessitaInformacoes = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'necessita_informacoes').length;
            const satisfeitas = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'satisfeita').length;
            const prejudicadas = proposicoesCorreicao.filter(p => getCanonicalValoracao(p) === 'prejudicada').length;

            // Format UF array
            const ufDisplay = correicao.uf && correicao.uf.length > 0 ? correicao.uf.join(', ') : 'Não informado';

            // Status badge
            const statusBadge = correicao.status === 'ativo'
                ? '<span class="badge badge-ativo">Ativo</span>'
                : '<span class="badge badge-inativo">Inativo</span>';

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Número:</span>
                    <span class="detail-value">${correicao.numero}</span>
                </div>
                ${correicao.tematica ? `
                <div class="detail-row">
                    <span class="detail-label">Temática:</span>
                    <span class="detail-value">${correicao.tematica}</span>
                </div>
                ` : ''}
                ${correicao.numeroElo ? `
                <div class="detail-row">
                    <span class="detail-label">Número ELO:</span>
                    <span class="detail-value">${correicao.numeroElo}</span>
                </div>
                ` : ''}
                ${correicao.tipo ? `
                <div class="detail-row">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">${correicao.tipo}</span>
                </div>
                ` : ''}
                ${correicao.mp ? `
                <div class="detail-row">
                    <span class="detail-label">MP:</span>
                    <span class="detail-value">${correicao.mp}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">UF:</span>
                    <span class="detail-value">${ufDisplay}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${statusBadge}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ramo do MP:</span>
                    <span class="detail-value">${correicao.ramoMPNome}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Período:</span>
                    <span class="detail-value">${formatDate(correicao.dataInicio)} a ${formatDate(correicao.dataFim)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total de Proposições:</span>
                    <span class="detail-value" style="font-weight: 600; font-size: 1.1rem;">${totalProposicoes}</span>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Status Processual</h4>
                    <div class="detail-row">
                        <span class="detail-label">Pendente Publicação:</span>
                        <span class="detail-value" style="color: #ffc107; font-weight: 600;">${pendentePublicacao}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Aguardando Comprovação:</span>
                        <span class="detail-value" style="color: #e65100; font-weight: 600;">${aguardandoComprovacao}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pendente Avaliação:</span>
                        <span class="detail-value" style="color: #0066cc; font-weight: 600;">${pendenteAvaliacao}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Encerrada:</span>
                        <span class="detail-value" style="color: #3f51b5; font-weight: 600;">${encerradas}</span>
                    </div>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Valoração</h4>
                    <div class="detail-row">
                        <span class="detail-label">Sem Avaliação:</span>
                        <span class="detail-value" style="color: #9e9e9e; font-weight: 600;">${novas}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Necessita Informações:</span>
                        <span class="detail-value" style="color: #ff9800; font-weight: 600;">${necessitaInformacoes}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Satisfeita:</span>
                        <span class="detail-value" style="color: var(--success-color); font-weight: 600;">${satisfeitas}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Prejudicada:</span>
                        <span class="detail-value" style="color: #6c757d; font-weight: 600;">${prejudicadas}</span>
                    </div>
                </div>

                ${correicao.observacoes ? `
                <div class="detail-row" style="flex-direction: column; align-items: flex-start; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                    <span class="detail-label" style="margin-bottom: 0.5rem;">Observações:</span>
                    <span class="detail-value">${correicao.observacoes}</span>
                </div>
                ` : ''}
            `;

            document.getElementById('detailModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('detailModal').classList.add('hidden');
        }

        // File handling
        document.getElementById('fileInput')?.addEventListener('change', function(e) {
            selectedFiles = Array.from(e.target.files);
            displayFiles();
        });

        function displayFiles() {
            const fileList = document.getElementById('fileList');
            if (selectedFiles.length === 0) {
                fileList.classList.add('hidden');
                return;
            }

            fileList.classList.remove('hidden');
            fileList.innerHTML = '<strong>Arquivos selecionados:</strong>' +
                selectedFiles.map((file, index) => `
                    <div class="file-item">
                        <span>${file.name} (${(file.size / 1024).toFixed(2)} KB)</span>
                        <span class="btn-remove" onclick="removeFile(${index})">Remover</span>
                    </div>
                `).join('');
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            displayFiles();
        }

        // Render Correições Table
        // Sort Correições Table
        function sortCorreicoesBy(column) {
            // Toggle direction if same column, otherwise reset to 'asc'
            if (correicoesSortColumn === column) {
                correicoesSortDirection = correicoesSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                correicoesSortColumn = column;
                correicoesSortDirection = 'asc';
            }
            renderCorreicoesTable();
        }

        // Filter Correições by Status
        function filtrarCorreicoesPorStatus() {
            const select = document.getElementById('correicoesStatusFilter');
            if (!select) return;

            correicoesStatusFilter = select.value;
            renderCorreicoesTable();
        }

        // Helper function - Get membro auxiliar name
        function getMembrosAuxiliarNome(membroId) {
            const membro = membrosAuxiliares.find(m => m.id === membroId);
            return membro ? membro.nome : '-';
        }


        function renderCorreicoesTable() {
            const tbody = document.getElementById('correicoesTableBody');
            const searchTerm = document.getElementById('searchCorreicao')?.value.toLowerCase() || '';

            // Get correições filtered by ramoMP first
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

            // Pre-calculate statistics for sorting
            const correicoesWithStats = filtered.map(c => {
                return {
                    correicao: c,
                    ...getCorreicaoTableStats(c.id)
                };
            });

            // Apply sorting
            if (correicoesSortColumn) {
                correicoesWithStats.sort((a, b) => {
                    let valueA, valueB;

                    switch(correicoesSortColumn) {
                        case 'numero':
                            valueA = a.correicao.numero.toLowerCase();
                            valueB = b.correicao.numero.toLowerCase();
                            break;
                        case 'totalProposicoes':
                            valueA = a.totalProposicoes;
                            valueB = b.totalProposicoes;
                            break;
                        case 'pendentePublicacao':
                            valueA = a.pendentePublicacao;
                            valueB = b.pendentePublicacao;
                            break;
                        case 'pendenteAvaliacao':
                            valueA = a.pendenteAvaliacao;
                            valueB = b.pendenteAvaliacao;
                            break;
                        case 'prazoVencido':
                            valueA = a.prazoVencido;
                            valueB = b.prazoVencido;
                            break;
                        default:
                            return 0;
                    }

                    // Compare values
                    let comparison = 0;
                    if (valueA > valueB) comparison = 1;
                    if (valueA < valueB) comparison = -1;

                    return correicoesSortDirection === 'asc' ? comparison : -comparison;
                });
            }

            // Update table headers with sort indicators
            updateCorreicoesSortIndicators();

            // Render rows
            tbody.innerHTML = correicoesWithStats.map(item => {
                const c = item.correicao;
                const totalProposicoes = item.totalProposicoes;
                const pendentePublicacao = item.pendentePublicacao;
                const pendenteAvaliacao = item.pendenteAvaliacao;
                const prazoVencido = item.prazoVencido;

                // Format UF array
                const ufDisplay = c.uf && c.uf.length > 0 ? c.uf.join(', ') : '-';

                // Get membro auxiliar name
                const membroAuxiliar = c.membroAuxiliar ? getMembrosAuxiliarNome(c.membroAuxiliar) : '-';

                // Status badge
                const statusBadge = c.status === 'ativo'
                    ? '<span class="badge badge-ativo">Ativo</span>'
                    : '<span class="badge badge-inativo">Inativo</span>';

                // Estilo para células de contagem com destaque visual
                const pendentePublicacaoStyle = pendentePublicacao > 0 ? 'style="color: #ffc107; font-weight: 600;"' : '';
                const pendenteAvaliacaoStyle = pendenteAvaliacao > 0 ? 'style="color: #0066cc; font-weight: 600;"' : '';
                const prazoVencidoStyle = prazoVencido > 0 ? 'style="color: var(--danger-color); font-weight: 600;"' : '';

                return `
                    <tr>
                        <td>${c.numero}</td>
                        <td>${c.tematica || '-'}</td>
                        <td>${c.numeroElo || '-'}</td>
                        <td>${c.tipo || '-'}</td>
                        <td>${c.mp || '-'}</td>
                        <td>${ufDisplay}</td>
                        <td>${c.ramoMP}</td>
                        <td>${membroAuxiliar}</td>
                        <td>${totalProposicoes}</td>
                        <td ${pendentePublicacaoStyle}>${pendentePublicacao}</td>
                        <td ${pendenteAvaliacaoStyle}>${pendenteAvaliacao}</td>
                        <td ${prazoVencidoStyle}>${prazoVencido}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="btn btn-primary btn-action" onclick="viewCorreicaoDetails(${c.id})">Ver</button>
                            <button class="btn btn-secondary btn-action" onclick="abrirModalEdicaoCorreicao(${c.id})">Editar</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update sort indicators in table headers
        function updateCorreicoesSortIndicators() {
            const sortableColumns = ['numero', 'totalProposicoes', 'pendentePublicacao', 'pendenteAvaliacao', 'prazoVencido'];
            sortableColumns.forEach(col => {
                const th = document.getElementById(`th-correicao-${col}`);
                if (!th) return;

                // Remove existing indicators
                th.classList.remove('sorted-asc', 'sorted-desc');

                // Add indicator for current sorted column
                if (correicoesSortColumn === col) {
                    th.classList.add(correicoesSortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                }
            });
        }

        // Populate correicao filter
        function populateCorreicaoFilter() {
            const select = document.getElementById('correicaoFilter');
            if (!select) return;

            const filteredCorreicoes = getFilteredCorreicoes();
            select.innerHTML = '<option value="">Todas as correições</option>' +
                filteredCorreicoes.map(c => `<option value="${c.id}">${c.numero} - ${c.ramoMP}</option>`).join('');
        }

        // Populate correicao select in proposicao form
        function populateCorreicaoIdSelect() {
            const select = document.getElementById('correicaoId');
            if (!select) return;

            const filteredCorreicoes = getFilteredCorreicoes();
            select.innerHTML = '<option value="">Selecione a correição...</option>' +
                filteredCorreicoes.map(c => `<option value="${c.id}">${c.numero} - ${c.ramoMPNome}</option>`).join('');
        }

        // Populate proposição select
        function populateProposicaoSelect() {
            const select = document.getElementById('proposicaoSelect');
            if (!select) return;

            // Get filtered proposições and filter by status
            const filteredProposicoes = getFilteredProposicoes();
            const aguardando = filteredProposicoes.filter(p => hasStatusProcessual(p, 'aguardando_comprovacao'));
            select.innerHTML = '<option value="">Selecione...</option>' +
                aguardando.map(p => {
                    const correicao = correicoes.find(c => c.id === p.correicaoId);
                    const ramoMP = correicao ? correicao.ramoMP : 'N/A';
                    const prazoInfo = p.prazoComprovacao ? ` - Prazo: ${formatDate(p.prazoComprovacao)}` : '';
                    return `<option value="${p.id}">${p.numero} - ${ramoMP}${prazoInfo}</option>`;
                }).join('');
        }

        // Variables for rascunho
        let selectedFilesRascunho = [];
        let editingRascunhoIndex = null;

        // Render proposições for comprovação table
        function renderProposicoesComprovacaoTable() {
            const tbody = document.getElementById('proposicoesComprovacaoTableBody');
            if (!tbody) return;

            // Get filtered proposições first
            const filteredProposicoes = getFilteredProposicoes();
            const aguardando = filteredProposicoes.filter(p => hasStatusProcessual(p, 'aguardando_comprovacao'));

            if (aguardando.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhuma proposição aguardando comprovação no momento</td></tr>';
                document.getElementById('enviarBlocoContainer').classList.add('hidden');
                return;
            }

            tbody.innerHTML = aguardando.map(p => {
                const prazoVencido = isPrazoComprovacaoVencido(p);
                const prazoInfo = p.prazoComprovacao ? formatDate(p.prazoComprovacao) : 'N/A';
                const prazoClass = prazoVencido ? 'style="color: var(--danger-color); font-weight: 600;"' : '';
                const rowClass = prazoVencido ? 'prazo-vencido' : '';

                const temRascunho = p.rascunhosComprovacao && p.rascunhosComprovacao.length > 0;
                const statusRascunho = temRascunho ?
                    '<span class="badge badge-ativo">✓ Pronto</span>' :
                    '<span class="badge badge-inativo">Pendente</span>';

                const acaoBtn = temRascunho ?
                    `<button class="btn btn-primary btn-action" onclick="editarRascunhoComprovacao(${p.id})">Editar</button>
                     <button class="btn btn-secondary btn-action" style="background-color: var(--danger-color);" onclick="excluirRascunhoComprovacao(${p.id})">Excluir</button>` :
                    `<button class="btn btn-success btn-action" onclick="abrirComprovacaoModal(${p.id})">Adicionar</button>`;

                // Smart truncate description
                const descPreview = smartTruncate(p.descricao, 100);
                const lengthBadge = getTextLengthBadge(p.descricao);

                return `
                    <tr class="${rowClass}">
                        <td>${p.numero}</td>
                        <td>
                            <div class="text-preview">
                                <span class="text-preview-content">${descPreview}</span>
                                ${lengthBadge}
                            </div>
                        </td>
                        <td ${prazoClass}>${prazoInfo}${prazoVencido ? ' <span class="prazo-vencido-badge">⚠️ VENCIDO</span>' : ''}</td>
                        <td>${statusRascunho}</td>
                        <td>${acaoBtn}</td>
                    </tr>
                `;
            }).join('');

            // Update total rascunhos counter
            const totalRascunhos = aguardando.filter(p => p.rascunhosComprovacao && p.rascunhosComprovacao.length > 0).length;
            document.getElementById('totalRascunhos').textContent = totalRascunhos;

            if (totalRascunhos > 0) {
                document.getElementById('enviarBlocoContainer').classList.remove('hidden');
            } else {
                document.getElementById('enviarBlocoContainer').classList.add('hidden');
            }
        }

        // Open comprovação modal - redireciona para página dedicada
        function abrirComprovacaoModal(proposicaoId) {
            const proposicao = proposicoes.find(p => p.id === proposicaoId);
            if (!proposicao) {
                alert('Proposição não encontrada.');
                return;
            }

            // Salvar dados no localStorage antes de redirecionar
            saveToLocalStorage();

            // Redirecionar para página de comprovação com ID
            window.location.href = `comprovacao.html?id=${proposicaoId}`;
        }

        // Edit rascunho - redireciona para página dedicada (mesma página, detecta rascunho automaticamente)
        function editarRascunhoComprovacao(proposicaoId) {
            const proposicao = proposicoes.find(p => p.id === proposicaoId);
            if (!proposicao) {
                alert('Proposição não encontrada.');
                return;
            }

            // Salvar dados no localStorage antes de redirecionar
            saveToLocalStorage();

            // Redirecionar para página de comprovação (ela detectará e carregará o rascunho)
            window.location.href = `comprovacao.html?id=${proposicaoId}`;
        }

        // Delete rascunho
        function excluirRascunhoComprovacao(proposicaoId) {
            if (!confirm('Tem certeza que deseja excluir este rascunho de comprovação?')) return;

            const proposicao = proposicoes.find(p => p.id === proposicaoId);
            if (!proposicao) return;

            proposicao.rascunhosComprovacao = [];
            renderProposicoesComprovacaoTable();
            alert('Rascunho excluído com sucesso!');
        }

        // Render Avaliação Table
        function renderAvaliacaoTable() {
            const tbody = document.getElementById('avaliacaoTableBody');
            if (!tbody) return;

            const emAnalise = proposicoes.filter(p => hasStatusProcessual(p, 'pendente_avaliacao'));

            tbody.innerHTML = emAnalise.map(p => {
                const correicao = correicoes.find(c => c.id === p.correicaoId);
                const correicaoInfo = correicao ? `${correicao.numero}` : 'N/A';
                const ramoMP = correicao ? correicao.ramoMP : 'N/A';
                const numComprovacoes = p.historico ? p.historico.filter(h => h.tipo === 'comprovacao').length : 0;

                // Check if has draft evaluation
                const hasDraft = p.rascunhosAvaliacao && p.rascunhosAvaliacao.length > 0;
                const rowClass = hasDraft ? 'row-with-draft' : '';
                const draftBadge = hasDraft ? '<span class="badge-rascunho" title="Rascunho de avaliação preparado por assessor">📝 Rascunho</span>' : '';

                // Smart truncate description
                const descPreview = smartTruncate(p.descricao, 120);
                const lengthBadge = getTextLengthBadge(p.descricao);

                return `
                    <tr class="${rowClass}">
                        <td>${p.numero}${draftBadge}</td>
                        <td>${correicaoInfo}</td>
                        <td>${ramoMP}</td>
                        <td>
                            <div class="text-preview">
                                <span class="text-preview-content">${descPreview}</span>
                                ${lengthBadge}
                            </div>
                        </td>
                        <td>${numComprovacoes}</td>
                        <td>
                            <a href="avaliacao.html?id=${p.id}" class="btn btn-primary btn-action" style="text-decoration: none; display: inline-block;">
                                ${hasDraft ? '📋 Revisar' : 'Avaliar'}
                            </a>
                        </td>
                    </tr>
                `;
            }).join('');

            if (emAnalise.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhuma proposição aguardando avaliação</td></tr>';
            }
        }

        // === FUNÇÕES OBSOLETAS DO MODAL DE COMPROVAÇÃO ===
        // As funções abaixo são mantidas para compatibilidade mas não são mais usadas
        // A comprovação agora ocorre na página dedicada comprovacao.html

        function closeComprovacaoModal() {
            // Obsoleta - mantida para compatibilidade
            document.getElementById('comprovacaoModal').classList.add('hidden');
            selectedFilesRascunho = [];
            editingRascunhoIndex = null;
        }

        // File handling for rascunho (obsoleto)
        document.getElementById('fileInputRascunho')?.addEventListener('change', function(e) {
            selectedFilesRascunho = Array.from(e.target.files);
            displayFilesRascunho();
        });

        function displayFilesRascunho() {
            const fileList = document.getElementById('fileListRascunho');
            if (!selectedFilesRascunho || selectedFilesRascunho.length === 0) {
                fileList.classList.add('hidden');
                return;
            }

            fileList.classList.remove('hidden');
            fileList.innerHTML = '<strong>Arquivos selecionados:</strong>' +
                selectedFilesRascunho.map((file, index) => `
                    <div class="file-item">
                        <span>${file.name}${file.size > 0 ? ` (${(file.size / 1024).toFixed(2)} KB)` : ''}</span>
                        <span class="btn-remove" onclick="removeFileRascunho(${index})">Remover</span>
                    </div>
                `).join('');
        }

        function removeFileRascunho(index) {
            selectedFilesRascunho.splice(index, 1);
            displayFilesRascunho();
        }

        // Submit rascunho form
        document.getElementById('rascunhoComprovacaoForm')?.addEventListener('submit', function(e) {
            e.preventDefault();

            if (selectedFilesRascunho.length === 0) {
                alert('Por favor, selecione pelo menos um arquivo comprobatório.');
                return;
            }

            const proposicaoId = parseInt(document.getElementById('proposicaoIdRascunho').value);
            const proposicao = proposicoes.find(p => p.id === proposicaoId);
            const descricao = document.getElementById('descricaoComprovacaoRascunho').value;
            const observacoes = document.getElementById('observacoesRascunho').value;

            if (proposicao) {
                const rascunho = {
                    descricao: descricao,
                    observacoes: observacoes,
                    arquivos: selectedFilesRascunho.map(f => f.name)
                };

                // Always replace the rascunho (only one per proposição)
                proposicao.rascunhosComprovacao = [rascunho];

                renderProposicoesComprovacaoTable();
                closeComprovacaoModal();
                alert('Rascunho salvo com sucesso! Quando estiver pronto, revise e envie todas as comprovações.');
            }
        });

        // Open revisão modal
        function abrirRevisaoComprovacoes() {
            const aguardando = proposicoes.filter(p =>
                hasStatusProcessual(p, 'aguardando_comprovacao') &&
                p.rascunhosComprovacao && p.rascunhosComprovacao.length > 0
            );

            if (aguardando.length === 0) {
                alert('Não há comprovações prontas para envio.');
                return;
            }

            let html = '<div class="alert alert-info" style="background-color: #e7f3ff; color: #004085; border: 1px solid #b8daff; margin-bottom: 1.5rem;">';
            html += '<strong>Revisão Final:</strong> Confira todas as comprovações abaixo. Ao clicar em "Assinar e Enviar", ';
            html += 'todas as comprovações serão oficialmente enviadas para análise da Corregedoria Nacional.';
            html += '</div>';

            // Add expand/collapse all controls
            html += `
                <div class="expand-all-controls">
                    <button class="btn btn-secondary" onclick="expandAllCards('#revisaoModalBody')">Expandir Todas</button>
                    <button class="btn btn-secondary" onclick="collapseAllCards('#revisaoModalBody')">Recolher Todas</button>
                </div>
            `;

            html += '<div style="max-height: 55vh; overflow-y: auto;">';

            aguardando.forEach((p, index) => {
                const rascunho = p.rascunhosComprovacao[0];
                const correicao = correicoes.find(c => c.id === p.correicaoId);
                const ramoMP = correicao ? correicao.ramoMP : 'N/A';
                const cardId = `revisao_card_${index}`;

                const propLengthBadge = getTextLengthBadge(p.descricao);
                const compLengthBadge = getTextLengthBadge(rascunho.descricao);

                html += `
                    <div class="collapsible-card" id="${cardId}">
                        <div class="collapsible-card-header" onclick="toggleCard('${cardId}')">
                            <div class="collapsible-card-title">
                                ${p.numero} - ${ramoMP} ${propLengthBadge} ${compLengthBadge}
                            </div>
                            <span>▼</span>
                        </div>
                        <div class="collapsible-card-body">
                            <div class="detail-row" style="flex-direction: column; align-items: flex-start; margin-bottom: 1rem;">
                                <span class="detail-label" style="margin-bottom: 0.5rem;">Proposição:</span>
                                ${isLongText(p.descricao) ?
                                    createCollapsibleContent(p.descricao, 'proposição', true) :
                                    `<span class="detail-value" style="white-space: pre-wrap; line-height: 1.7;">${p.descricao}</span>`
                                }
                            </div>
                            <div class="detail-row" style="flex-direction: column; align-items: flex-start; margin-bottom: 1rem;">
                                <span class="detail-label" style="margin-bottom: 0.5rem;">Comprovação:</span>
                                ${isLongText(rascunho.descricao) ?
                                    createCollapsibleContent(rascunho.descricao, 'comprovação', true) :
                                    `<span class="detail-value" style="white-space: pre-wrap; line-height: 1.7;">${rascunho.descricao}</span>`
                                }
                            </div>
                            ${rascunho.observacoes ? `
                            <div class="detail-row" style="margin-bottom: 1rem;">
                                <span class="detail-label">Observações:</span>
                                <span class="detail-value">${rascunho.observacoes}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Arquivos (${rascunho.arquivos.length}):</span>
                                <span class="detail-value">${rascunho.arquivos.map(a => `<div>📎 ${a}</div>`).join('')}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';

            html += `
                <div class="form-actions" style="margin-top: 2rem; border-top: 2px solid var(--border-color); padding-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="closeRevisaoModal()">Cancelar</button>
                    <button type="button" class="btn btn-success" style="font-size: 1.1rem; padding: 0.75rem 2rem;" onclick="assinarEEnviarTodasComprovacoes()">
                        ✍️ Assinar e Enviar Todas as Comprovações
                    </button>
                </div>
            `;

            document.getElementById('revisaoModalBody').innerHTML = html;
            document.getElementById('revisaoModal').classList.remove('hidden');
        }

        function closeRevisaoModal() {
            document.getElementById('revisaoModal').classList.add('hidden');
        }

        // Send all comprovações in batch
        function assinarEEnviarTodasComprovacoes() {
            if (!confirm('Tem certeza que deseja assinar e enviar todas as comprovações? Esta ação não poderá ser desfeita.')) {
                return;
            }

            const aguardando = proposicoes.filter(p =>
                hasStatusProcessual(p, 'aguardando_comprovacao') &&
                p.rascunhosComprovacao && p.rascunhosComprovacao.length > 0
            );

            let enviadas = 0;

            aguardando.forEach(p => {
                const rascunho = p.rascunhosComprovacao[0];
                const correicao = correicoes.find(c => c.id === p.correicaoId);
                const ramoMP = correicao ? correicao.ramoMP : 'Correicionado';

                // Create comprovação entry in historico
                const novaComprovacao = {
                    tipo: 'comprovacao',
                    data: new Date().toISOString(),
                    usuario: ramoMP,
                    descricao: rascunho.descricao,
                    observacoes: rascunho.observacoes || '',
                    arquivos: rascunho.arquivos
                };

                if (!p.historico) {
                    p.historico = [];
                }
                p.historico.push(novaComprovacao);

                // Change status to pendente_avaliacao - preserve valoração
                const valoracaoAtual = getValoracao(p);
                p.status = ['pendente_avaliacao', valoracaoAtual];

                // Clear rascunhos
                p.rascunhosComprovacao = [];

                enviadas++;
            });

            // Save to localStorage
            saveToLocalStorage();

            // Update all views
            updateDashboard();
            renderProposicoesTable();
            renderProposicoesComprovacaoTable();
            renderAvaliacaoTable();
            populateProposicaoSelect();

            closeRevisaoModal();
            alert(`✅ Sucesso! ${enviadas} comprovação(ões) assinada(s) e enviada(s) para análise da Corregedoria Nacional.`);
        }

        // Submit cadastro correição
        // Toggle UF multiple selection based on MP type
        function toggleUFMultiple() {
            const mpCorreicao = document.getElementById('mpCorreicao').value;
            const ufSelect = document.getElementById('ufCorreicao');
            const ufNote = document.getElementById('ufMultipleNote');

            if (mpCorreicao === 'MPU') {
                ufSelect.setAttribute('multiple', 'multiple');
                ufSelect.size = 5;
                ufNote.classList.remove('hidden');
            } else {
                ufSelect.removeAttribute('multiple');
                ufSelect.size = 1;
                ufNote.classList.add('hidden');
                // Clear multiple selections
                for (let option of ufSelect.options) {
                    option.selected = false;
                }
            }
        }

        // Get selected UF values (single or multiple)
        function getSelectedUFs() {
            const ufSelect = document.getElementById('ufCorreicao');
            const selectedOptions = Array.from(ufSelect.selectedOptions);
            return selectedOptions.map(option => option.value);
        }

        // Submit cadastro correição
        document.getElementById('cadastroCorreicaoForm')?.addEventListener('submit', function(e) {
            e.preventDefault();

            const ramoMPSelect = document.getElementById('ramoMP');
            const selectedOption = ramoMPSelect.options[ramoMPSelect.selectedIndex];
            const selectedUFs = getSelectedUFs();

            if (selectedUFs.length === 0) {
                alert('Por favor, selecione pelo menos uma UF.');
                return;
            }

            const membroAuxiliarValue = document.getElementById('membroAuxiliarCorreicao')?.value;

            const newCorreicao = {
                id: correicoes.length + 1,
                numero: document.getElementById('numeroCorreicao').value,
                tematica: document.getElementById('tematicaCorreicao').value,
                numeroElo: document.getElementById('numeroEloCorreicao').value,
                tipo: document.getElementById('tipoCorreicao').value,
                mp: document.getElementById('mpCorreicao').value,
                uf: selectedUFs,
                ramoMP: document.getElementById('ramoMP').value,
                ramoMPNome: selectedOption.text,
                status: document.getElementById('statusCorreicao').value,
                membroAuxiliar: membroAuxiliarValue ? parseInt(membroAuxiliarValue) : null,
                dataInicio: document.getElementById('dataInicioCorreicao').value,
                dataFim: document.getElementById('dataFimCorreicao').value,
                observacoes: document.getElementById('observacoesCorreicao').value
            };

            correicoes.push(newCorreicao);
            saveToLocalStorage();
            populateDashboardRamoMPFilter();
            updateDashboard();
            renderDashboardMembrosAuxiliares();
            renderCorreicoesTable();
            populateCorreicaoFilter();
            populateCorreicaoIdSelect();
            populateCorreicaoPublicar();

            alert('Correição cadastrada com sucesso!');
            clearCorreicaoForm();
        });

        function clearCorreicaoForm() {
            document.getElementById('cadastroCorreicaoForm')?.reset();
            toggleUFMultiple(); // Reset UF field
        }

        // Calculate correição status automatically based on proposições
        function calcularStatusCorreicao(correicaoId) {
            const proposicoesCorreicao = proposicoes.filter(p => p.correicaoId === correicaoId);

            if (proposicoesCorreicao.length === 0) {
                return 'ativo'; // No proposições yet, keep active
            }

            const todasFinalizadas = proposicoesCorreicao.every(p =>
                hasValoracao(p, 'satisfeita') || hasValoracao(p, 'prejudicada')
            );

            return todasFinalizadas ? 'inativo' : 'ativo';
        }

        // Update correição status for all correições
        function atualizarStatusCorreicoes() {
            correicoes.forEach(c => {
                c.status = calcularStatusCorreicao(c.id);
            });
        }

        // ===== EDIÇÃO DE CORREIÇÃO =====

        // Open modal de edição de correição
        function abrirModalEdicaoCorreicao(correicaoId) {
            const correicao = correicoes.find(c => c.id === correicaoId);
            if (!correicao) {
                alert('Correição não encontrada!');
                return;
            }

            // Populate form with current data
            document.getElementById('editCorreicaoId').value = correicao.id;
            document.getElementById('editNumeroCorreicao').value = correicao.numero;
            document.getElementById('editTematicaCorreicao').value = correicao.tematica || '';
            document.getElementById('editNumeroEloCorreicao').value = correicao.numeroElo || '';
            document.getElementById('editTipoCorreicao').value = correicao.tipo || '';
            document.getElementById('editMpCorreicao').value = correicao.mp || '';
            document.getElementById('editRamoMP').value = correicao.ramoMP || '';
            document.getElementById('editStatusCorreicao').value = correicao.status || '';
            document.getElementById('editMembroAuxiliarCorreicao').value = correicao.membroAuxiliar || '';
            document.getElementById('editDataInicioCorreicao').value = correicao.dataInicio || '';
            document.getElementById('editDataFimCorreicao').value = correicao.dataFim || '';
            document.getElementById('editObservacoesCorreicao').value = correicao.observacoes || '';

            // Set UF field based on MP type
            toggleUFMultipleEdit();

            // Select UF values
            const ufSelect = document.getElementById('editUfCorreicao');
            if (correicao.uf && correicao.uf.length > 0) {
                // Clear all selections first
                for (let option of ufSelect.options) {
                    option.selected = false;
                }
                // Select the correição's UF values
                correicao.uf.forEach(uf => {
                    for (let option of ufSelect.options) {
                        if (option.value === uf) {
                            option.selected = true;
                        }
                    }
                });
            }

            // Show modal
            document.getElementById('edicaoCorreicaoModal').classList.remove('hidden');
        }

        // Close modal de edição de correição
        function closeEdicaoCorreicaoModal() {
            document.getElementById('edicaoCorreicaoModal').classList.add('hidden');
            document.getElementById('edicaoCorreicaoForm').reset();
        }

        // Toggle UF multiple selection for edit form
        function toggleUFMultipleEdit() {
            const mpSelect = document.getElementById('editMpCorreicao');
            const ufSelect = document.getElementById('editUfCorreicao');
            const ufNote = document.getElementById('editUfMultipleNote');

            if (mpSelect.value === 'MPU') {
                ufSelect.setAttribute('multiple', 'multiple');
                ufSelect.size = 5;
                ufNote.classList.remove('hidden');
            } else {
                ufSelect.removeAttribute('multiple');
                ufSelect.size = 1;
                ufNote.classList.add('hidden');
            }
        }

        // Helper function to get selected UFs from edit form
        function getSelectedUFsEdit() {
            const select = document.getElementById('editUfCorreicao');
            const selected = [];
            for (let option of select.options) {
                if (option.selected && option.value) {
                    selected.push(option.value);
                }
            }
            return selected;
        }

        // Handle edit form submission
        document.getElementById('edicaoCorreicaoForm')?.addEventListener('submit', function(e) {
            e.preventDefault();

            const correicaoId = parseInt(document.getElementById('editCorreicaoId').value);
            const correicao = correicoes.find(c => c.id === correicaoId);

            if (!correicao) {
                alert('Erro: Correição não encontrada!');
                return;
            }

            const selectedUFs = getSelectedUFsEdit();
            if (selectedUFs.length === 0) {
                alert('Por favor, selecione pelo menos uma UF.');
                return;
            }

            const ramoMPSelect = document.getElementById('editRamoMP');
            const selectedOption = ramoMPSelect.options[ramoMPSelect.selectedIndex];
            const membroAuxiliarValue = document.getElementById('editMembroAuxiliarCorreicao')?.value;

            // Update correição data (keeping ID and numero unchanged)
            correicao.tematica = document.getElementById('editTematicaCorreicao').value;
            correicao.numeroElo = document.getElementById('editNumeroEloCorreicao').value;
            correicao.tipo = document.getElementById('editTipoCorreicao').value;
            correicao.mp = document.getElementById('editMpCorreicao').value;
            correicao.uf = selectedUFs;
            correicao.ramoMP = document.getElementById('editRamoMP').value;
            correicao.ramoMPNome = selectedOption.text;
            correicao.status = document.getElementById('editStatusCorreicao').value;
            correicao.membroAuxiliar = membroAuxiliarValue ? parseInt(membroAuxiliarValue) : null;
            correicao.dataInicio = document.getElementById('editDataInicioCorreicao').value;
            correicao.dataFim = document.getElementById('editDataFimCorreicao').value;
            correicao.observacoes = document.getElementById('editObservacoesCorreicao').value;

            // Save to localStorage
            saveToLocalStorage();

            // Update all UI components
            populateDashboardRamoMPFilter();
            updateDashboard();
            renderDashboardMembrosAuxiliares();
            renderCorreicoesTable();
            populateCorreicaoFilter();
            populateCorreicaoIdSelect();

            alert('Correição atualizada com sucesso!');
            closeEdicaoCorreicaoModal();
        });

        // Submit cadastro proposição
        document.getElementById('cadastroForm')?.addEventListener('submit', function(e) {
            e.preventDefault();

            const selectedTags = getSelectedTags();

            const newProposicao = {
                id: proposicoes.length + 1,
                numero: document.getElementById('numeroProposicao').value,
                correicaoId: parseInt(document.getElementById('correicaoId').value),
                tipo: document.getElementById('tipoProposicao').value,
                unidade: document.getElementById('unidadeProposicao').value,
                membro: document.getElementById('membroProposicao').value,
                descricao: document.getElementById('descricaoProposicao').value,
                prazoComprovacao: null,
                dataPublicacao: null,
                prioridade: document.getElementById('prioridade').value,
                status: ['pendente_publicacao', 'sem_avaliacao'],
                tags: selectedTags,
                rascunhosComprovacao: [],
                rascunhosAvaliacao: [],
                historico: []
            };

            proposicoes.push(newProposicao);
            saveToLocalStorage();
            updateDashboard();
            renderDashboardMembrosAuxiliares();
            renderProposicoesTable();
            populateProposicaoSelect();
            renderCorreicoesTable();

            alert('Proposição cadastrada com sucesso!');
            clearCadastroForm();
        });

        function clearCadastroForm() {
            document.getElementById('cadastroForm')?.reset();
            // Uncheck all tag checkboxes
            const checkboxes = document.querySelectorAll('#tagSelectContainer input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        }


        // ========== DOMAIN LOGIC FUNCTIONS ==========
        // Domain logic and workflow functions moved to js/domain-proposicoes.js
        // Includes: Status normalization (normalizeStatusProcessualForDashboard, normalizeValoracaoForDashboard,
        //           normalizeStatusValue, normalizeHistoricoStatusValue, normalizeProposicaoRecord),
        //           Status getters (getCanonicalStatusProcessual, getCanonicalValoracao, getStatusProcessual,
        //           getValoracao, hasStatusProcessual, hasValoracao),
        //           Workflow transitions (publicarProposicoesSelecionadas, carregarProposicoesParaPublicar,
        //           populateCorreicaoPublicar, toggleSelectAllPublicar, limparSelecaoPublicar),
        //           Business rules (isPrazoComprovacaoVencido)
