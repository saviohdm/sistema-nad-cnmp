# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**CNMP Proposition Tracking System** - Standalone web app tracking judicial review proceedings (correições) and monitoring compliance across 27 Brazilian Public Ministry offices.

**Stack:** Pure HTML5, CSS3, vanilla JavaScript - zero dependencies/build tools.

## Architecture

### Files
- `index.html` - Main SPA (dashboard, correições list, forms)
- `proposicoes.html` - Standalone propositions management (~840 lines)
- `publicacao.html` - Batch publishing (admin-only, ~1,100 lines)
- `avaliacao.html` - Evaluation page (913 lines)
- `comprovacao.html` - Proof submission page (1,181 lines)
- `styles.css` - Shared styles (~1,200 lines)
- `app.js` - Main logic (~2,700+ lines)

### Data Model
```
Correição
├── id, numero, ramoMP, ramoMPNome, tematica, numeroElo
├── tipo (Ordinária/Extraordinária/OCD/Inspeção)
├── mp (MPE/MPU), uf[] (state codes)
├── status (ativo/inativo - auto-calculated)
└── Proposições[]
    ├── id, numero, correicaoId, tipo, unidade, membro
    ├── descricao, prioridade, prazoComprovacao, dataPublicacao
    ├── status: [statusProcessual, valoracao] (bidimensional)
    │   ├── statusProcessual: pendente | aguardando_comprovacao | em_analise | encerrada
    │   └── valoracao: nova | finalizada | parcial | em_andamento | prejudicada
    ├── tags[] (11 categories: administrativo, recursos-humanos, etc.)
    ├── rascunhos[] (draft comprovacoes)
    └── historico[] (audit trail)
        ├── tipo: publicacao | comprovacao | avaliacao
        ├── data, usuario, descricao, observacoes
        ├── arquivos[] (comprovacao only)
        ├── prazoComprovacao (publicacao only)
        └── statusAnterior, statusNovo
```

**Critical Relationships:**
- Proposições linked via `correicaoId`
- All interactions recorded in `historico[]`
- Publications permanently stored with prazoComprovacao
- Status bidimensional: workflow state + compliance evaluation

### Key Patterns

**State Management:**
- Global: `correicoes[]`, `proposicoes[]`
- Persisted in `localStorage` only
- All mutations must update data + UI
- Global UI state: `dashboardCorreicaoFilter`, `correicoesSortColumn`, `correicoesSortDirection`, `correicoesStatusFilter`

**Navigation:**
- SPA routing: `showPage(pageId)` for internal pages
- Standalone pages redirect via `window.location.href`
- Internal: dashboard, correicoes, enviar, avaliar, cadastroCorreicao, cadastro
- External: proposicoes.html, publicacao.html, avaliacao.html, comprovacao.html

**Data Flow:**
1. User action → data array update
2. Historico entry added (if applicable)
3. Save to localStorage
4. Call render functions: `updateDashboard()`, `renderCorreicoesTable()`, `renderAvaliacaoTable()`, etc.

**Correição Status:**
- `calcularStatusCorreicao(correicaoId)` - 'ativo' if any proposition not finalizada/prejudicada
- `atualizarStatusCorreicoes()` - recalculates all on init

## Main Pages

### Dashboard (index.html)
- Correição filter dropdown (all/specific)
- 5 cards: Correições Realizadas, Ativas, Total Proposições, Ativas, Prazo Vencido
- Dual charts: Fluxo de Trabalho (4 bars), Valoração (5 bars)
- Responsive: 2-column desktop, 1-column mobile

### Correições Table
- 13 columns including Pendente, Em Análise, Prazo Vencido
- 5 sortable columns (Número, Total, Pendente, Em Análise, Prazo Vencido)
- Status filter: all/ativo/inativo
- Details modal: 3 sections (info, status processual, valoração)

### Proposições Page (proposicoes.html)
**Mandatory correição selection → progressive disclosure**
- 7-column table: Número, Tipo, Unidade, Descrição, Tags, Status, Ações
- Filters: search, tipo, status, tags, prioridade
- Actions: Visualizar (modal), Avaliar (redirect), Editar (modal)
- Edit saves to localStorage immediately

### Publicação Page (publicacao.html) - Admin Only
**Batch publication workflow:**
- Select correição → view pendente propositions only
- 8-column table with checkboxes
- Batch selection: individual, master checkbox, select/deselect all
- Publication form: single `prazoComprovacao` for all, optional observações
- On publish: status → aguardando_comprovacao, adds historico entry

### Avaliação Page (avaliacao.html)
- Receives `id` via URL query
- Shows: Proposição info, historico, current comprovacao
- Decision: finalizada/parcial/em_andamento/prejudicada
- Parecer field (7,500 chars)
- Redirects to index.html after submit

### Comprovação Page (comprovacao.html)
- Receives `id` via URL query
- Auto-loads existing rascunho if present
- Drag-drop file upload
- Two actions: save rascunho OR submit comprovação
- Redirects to index.html#enviar after save/submit

### Data Export System
**5 locations with JSON/PDF exports:**
1. **Dashboard:** system-wide reporting
2. **Correições Table:** 3 levels (table, JSON, detailed report)
3. **Proposições Page:** filtered view + complete timelines
4. **Modal Details:** individual proposition export
5. **Publicação Page:** pendentes, selecionadas, ofício legal document

**Pattern:**
- Shared CSS: `.export-dropdown`, `.export-btn`, `.export-menu`
- JSON: structured data with metadata
- PDF: print-optimized HTML via `window.open()`
- Ofício: Times New Roman, formal Brazilian institutional format

## NAD Workflow - Publication-Gated Comprovação

**Core Principle:** Every comprovação MUST be preceded by publication.

### Status Lifecycle
```
pendente → [PUBLICAÇÃO] → aguardando_comprovacao → [COMPROVAÇÃO] → em_analise
                                                                        ↓
                                                                   [AVALIAÇÃO]
                                                                        ↓
                                                    finalizada/prejudicada (FIM)
                                                    parcial/em_andamento (volta: pendente)
```

### Workflow Steps

**Publication (publicacao.html):**
- Admin selects correição, views pendente propositions
- Includes: never-published + failed evaluations (parcial/em_andamento)
- Defines `prazoComprovacao` (applies to all selected)
- Creates `publicacao` historico entry
- Status: pendente → aguardando_comprovacao

**Comprovação (comprovacao.html):**
- Shows ONLY aguardando_comprovacao propositions
- User submits proof with files
- Creates `comprovacao` historico entry
- Status: aguardando_comprovacao → em_analise

**Avaliação (avaliacao.html):**
- Shows em_analise propositions
- Decision: finalizada/prejudicada (cycle ends) OR parcial/em_andamento (status → pendente)
- Creates `avaliacao` historico entry
- **Special logic:** parcial/em_andamento sets status to pendente (requires republicação)

**Republicação:**
- Failed evaluations appear in publicacao.html as pendente
- New publication with new prazoComprovacao
- New `publicacao` historico entry (preserves audit trail)

### Key Functions
- `carregarProposicoesParaPublicar()` - filters pendente
- `publicarProposicoesSelecionadas()` - publishes, records historico
- `populateProposicaoSelect()` - filters aguardando_comprovacao
- `renderAvaliacaoTable()` - shows em_analise queue
- `submitAvaliacao()` - records decision, sets pendente if parcial/em_andamento
- `viewDetails()` - renders timeline (orange/blue/green color-coding)

## Important Constraints

1. **MP Branches:** 27 hardcoded - do not modify without request
2. **Status Types:** Adding requires updates to CSS, filters, functions, charts
3. **Correição-Proposição Link:** Every proposição needs valid correicaoId
4. **Date Format:** ISO (YYYY-MM-DD) in data, DD/MM/YYYY display
5. **Historico:** Never mutate, always append with `.push()`
6. **Tags:** 11 predefined, optional, stored as ID arrays
7. **UF Selection:** MPE=single, MPU=multiple states

## Form Validation Pattern
1. HTML5 required attributes
2. `e.preventDefault()`
3. Manual data construction
4. Array push
5. Alert confirmation
6. Multi-function UI refresh
7. Form reset

## UI Components

**Modals:**
- `viewDetails(id)` - proposition with timeline
- `viewCorreicaoDetails(id)` - correição with statistics
- Toggle `.hidden`, close with `closeModal()`

**Badges:**
- Status: `badge badge-${status}` (6 colors)
- Tags: `tag-badge tag-${tagId}` (11 colors)
- Bidimensional: stacked vertically (processual + valoração)

**Tables:**
- Standard render: `data.filter().map(item => html).join('')`
- Sorting: toggle direction, update indicators
- Selection: `.row-selected` class for highlighting

## Authentication
- Two types: admin (Corregedoria), user (Órgão Correicionado)
- No real auth - accepts any credentials
- Admin sees all pages, user has cadastro hidden
- Check `currentUser.type` for access control

## Running
```bash
open index.html
# OR
python3 -m http.server 8000
```

## Common Modifications

### Adding Status
1. CSS badge class
2. Filter dropdown option
3. Update `getStatusLabel()`
4. Dashboard counter logic
5. Chart data + barWidth calculation

### Adding Page (Internal)
1. Nav item: `onclick="showPage('newpage')"`
2. Page div: `id="newpagePage" class="page hidden"`
3. Add case in `showPage()` if needed
4. Hide for users if admin-only

### Adding Page (Standalone)
1. Create .html with full structure
2. Nav item: `onclick="window.location.href='page.html'"`
3. Session management: `loadUserSession()`, `loadDataFromLocalStorage()`
4. Breadcrumb to index.html
5. Save changes to localStorage

### Modifying Data Model
1. Update `initializeSampleData()`
2. Form HTML + submit handler
3. Table rendering
4. Detail modal
5. Filters/search if applicable

### Adding Tag
1. Add to `availableTags` array
2. CSS class `.tag-{id}`
3. Auto-appears in: cadastro checkboxes, filter dropdown, table/modals

## Testing Guidelines

**Core Workflows:**
1. Login as admin/user - verify menu visibility
2. Create correição - test all fields, MP/UF selection
3. Create proposição - verify correição link, tipo, unidade, membro
4. Test filters - search, status, tags
5. View details modals

**Proposições Page:**
6. Mandatory correição selection workflow
7. 7-column table, 3 action buttons
8. Advanced filters, clear filters
9. Edit modal - character counter, tags, save

**Publicação Page (Admin):**
10. Access control (non-admin redirect)
11. Correição selection, pendente filter
12. Batch selection (individual, master, buttons)
13. Publication form - prazo, observações, counter
14. Publish - verify status change, historico entry, table update

**Comprovação/Avaliação:**
15. Comprovação only shows aguardando_comprovacao
16. File upload, rascunho save/submit
17. Avaliação queue shows em_analise
18. Decision updates status, creates historico
19. Parcial/em_andamento → pendente (republicação required)

**Dashboard/Charts:**
20. Correição filter updates all cards/charts
21. Dual charts: 4 bars (Fluxo) + 5 bars (Valoração)
22. Responsive layout (2-col → 1-col mobile)

**Correições Table:**
23. 13 columns, 5 sortable
24. Status filter: all/ativo/inativo
25. Details modal: 3 sections with counters

**Export System:**
26. 5 locations, dropdown menus
27. JSON: structured data, pretty-print
28. PDF: print dialog, CNMP branding
29. Ofício: Times New Roman, formal format

**UI/UX:**
30. Responsive at 768px breakpoint
31. Modals scroll with long content
32. Timeline color-coding
33. Mobile: horizontal scroll tables, touch sorting

**Complete Cycle:**
34. Publish (pendente → aguardando_comprovacao)
35. Submit comprovação (aguardando → em_analise)
36. Evaluate as parcial (em_analise → pendente)
37. Republish with new prazo
38. Full timeline with multiple publicacoes

## Browser Compatibility
- ES6+ JavaScript
- CSS Grid/Flexbox
- HTML5 validation
- Canvas API (charts)
- Modern browsers only (no IE11)

## Sample Data
**5 Correições:**
- COR-2024-01 (MPBA, 3 props) - Ordinária, MPE/BA
- COR-2024-02 (MPRJ, 2 props) - Extraordinária, MPE/RJ
- COR-2024-03 (MPMG, 2 props) - OCD, MPE/MG
- COR-2024-04 (MPSP, 2 props) - Inspeção, MPE/SP
- COR-2024-05 (MPU, 0 props) - Ordinária, MPU/DF,SP,RJ,MG,BA (multi-UF demo)

**13 Proposições:**
- Mix of Determinação/Recomendação
- All statuses represented
- Various tags, priorities
- PROP-2024-0009 (em_analise) - ideal for testing evaluation
- PROP-2024-0004 (pendente) - has historico with parcial evaluation

**Testing Tip:**
1. Evaluate PROP-2024-0009 as parcial → returns to pendente
2. Republish with new prazo → aguardando_comprovacao
3. Submit comprovação → em_analise
4. Evaluate as finalizada → cycle complete
5. View historico → see complete timeline
