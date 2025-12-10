# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **CNMP (Conselho Nacional do Ministério Público) Proposition Tracking System** - a standalone web application for tracking judicial review proceedings (correições) and monitoring compliance with remedial propositions across Brazilian Public Ministry offices (27 MP branches).

**Technology Stack:** Pure HTML5, CSS3, and vanilla JavaScript - zero dependencies, zero build tools.

## Architecture

### Modular Design
The application has been refactored from a single-file to a modular structure:

**Main Files:**
- `index.html` - Main SPA (Single Page Application) with dashboard, correições list, and forms
- `proposicoes.html` - Dedicated standalone page for viewing and managing proposições (~840 lines)
- `publicacao.html` - Dedicated standalone page for batch publishing propositions (~1,100 lines)
- `avaliacao.html` - Dedicated standalone page for evaluating comprovações (913 lines)
- `comprovacao.html` - Dedicated standalone page for submitting comprovações (1,181 lines)
- `styles.css` - Shared CSS styles (~1,200 lines) - used by all pages
- `app.js` - Main JavaScript application logic (~2,700+ lines)

**Proposições Workflow (All Users):**
- When user clicks "Proposições" in sidebar, system redirects to `proposicoes.html`
- `proposicoes.html` loads data from `localStorage` independently
- **Mandatory Correição Selection:** User MUST select a correição before viewing propositions
- Progressive disclosure: Filters and table only appear after correição selection
- Simplified 7-column table: número, tipo, unidade, descrição, tags, status, ações
- Three action buttons per proposition:
  - **Visualizar:** Opens detail modal with complete history
  - **Avaliar:** Redirects to `avaliacao.html?id={proposicaoId}` (allows evaluation at any time)
  - **Editar:** Opens inline modal to edit proposition data (tipo, prioridade, unidade, membro, descrição, tags)
- Advanced filters: search, tipo, status (processual/valoração), tags, prioridade
- Edit changes saved to localStorage immediately
- Fully standalone - no dependencies on index.html

**Publicação Workflow (Admin Only):**
- When admin clicks "Publicar Proposições" in sidebar, system redirects to `publicacao.html`
- `publicacao.html` loads data from `localStorage` independently
- **Admin-only access:** Non-admin users are redirected to index.html
- **Mandatory Correição Selection:** Admin MUST select a correição before viewing pending propositions
- Progressive disclosure: Filters and table only appear after correição selection
- Shows ONLY propositions with status `['pendente', *]` from selected correição
- **Batch Publication System:**
  - Table with 8 columns: checkbox, número, tipo, unidade, descrição, tags, prioridade, ações
  - Checkbox in each row for individual selection
  - "Selecionar Todas" / "Desmarcar Todas" buttons for bulk selection
  - Master checkbox in table header
  - Real-time counter showing selected count
- **Publication Form (appears when propositions selected):**
  - Single `prazoComprovacao` (deadline) applies to ALL selected propositions
  - Optional `observacoes` field (up to 1,000 characters)
  - Confirmation dialog before publishing
- **On Publish:**
  - Status changes to `['aguardando_comprovacao', valoracao]`
  - Sets `prazoComprovacao` and `dataPublicacao` fields
  - Adds `publicacao` entry to `historico[]` array
  - Saves to localStorage immediately
  - Shows success message mentioning automatic email notification
  - Clears selection and resets form
  - Updates table (published propositions removed from pending list)
- Advanced filters: search, tipo, tags, prioridade
- View details action: Opens modal with complete proposition info and timeline
- Fully standalone - no dependencies on index.html

**Evaluation Workflow (Admin):**
- When admin clicks "Avaliar" button, system redirects to `avaliacao.html?id={proposicaoId}`
- `avaliacao.html` loads data from `localStorage` independently
- After submission, redirects back to `index.html` with updated data
- Fully standalone - no modal dependencies

**Comprovação Workflow (User):**
- When user clicks "Adicionar" or "Editar" button, system redirects to `comprovacao.html?id={proposicaoId}`
- `comprovacao.html` loads data from `localStorage` independently
- Page detects and auto-loads existing rascunho if present
- User can save as rascunho (draft) or submit directly
- After save/submit, redirects back to `index.html#enviar` with updated data
- Fully standalone - no modal dependencies

**Legacy Note:** The functions `abrirAvaliacaoModal()`, `abrirComprovacaoModal()`, and `editarRascunhoComprovacao()` in `app.js` now redirect to dedicated pages instead of opening modals. Old modal code is kept for compatibility but is no longer used.

### Data Model Hierarchy
```
Correição (Judicial Review)
├── id, numero, ramoMP, ramoMPNome
├── tematica, numeroElo, tipo, mp, uf[], status
├── dataInicio, dataFim, observacoes
└── Proposições (many)
    ├── id, numero, correicaoId
    ├── tipo, unidade, membro
    ├── descricao, prioridade
    ├── prazoComprovacao, dataPublicacao
    ├── status: [statusProcessual, valoracao] (bidimensional array)
    │   ├── statusProcessual: 'pendente' | 'aguardando_comprovacao' | 'em_analise' | 'encerrada'
    │   └── valoracao: 'nova' | 'adimplente' | 'parcial' | 'inadimplente' | 'prejudicada'
    ├── tags[] (array of tag IDs for categorization)
    ├── rascunhos[] (array of draft comprovacoes)
    └── historico[] (array of interactions)
        ├── tipo: 'publicacao' | 'comprovacao' | 'avaliacao'
        ├── data (ISO timestamp)
        ├── usuario (string: MP branch or 'Corregedoria Nacional')
        ├── descricao (text)
        ├── observacoes (optional text)
        ├── arquivos[] (array of filenames - comprovacao only)
        ├── prazoComprovacao (date - publicacao only)
        ├── statusAnterior (status before - avaliacao/publicacao only)
        └── statusNovo (status after - avaliacao/publicacao only)
```

**Critical Relationships:**
- Proposições are ALWAYS linked to their parent Correição via `correicaoId`
- Every interaction (publicacao/comprovacao/avaliacao) is stored in proposicao.historico array
- Publications are permanently recorded in historico with prazoComprovacao and status transitions
- Timeline preserves complete audit trail of all status changes and (re)publications

**Correição Extended Fields:**
- `tematica` (string): Textual description of the review's theme (e.g., "Correição de direitos fundamentais e meio ambiente")
- `numeroElo` (string): ELO system identifier in format NNNNNNN-DD.AAAA.J.TT.OOOO (e.g., "1234567-89.2024.1.01.0001")
- `tipo` (string): Review type - one of: 'Ordinária', 'Extraordinária', 'OCD', 'Inspeção'
- `mp` (string): MP level - 'MPE' (state-level) or 'MPU' (federal-level)
- `uf` (array): Brazilian state codes (e.g., ['BA'] for MPE, ['DF', 'SP', 'RJ'] for MPU)
  - Single selection for MPE (one state)
  - Multiple selection for MPU (multiple states)
- `status` (string): Auto-calculated - 'ativo' (has pending propositions) or 'inativo' (all propositions completed)

**Proposição Extended Fields:**
- `tipo` (string): Nature of the proposition - one of: 'Determinação' (mandatory), 'Recomendação' (advisory)
- `unidade` (string): MP unit responsible for compliance (e.g., "Promotoria de Justiça de Cachoeira", "Procuradoria-Geral de Justiça")
- `membro` (string): Name of the member assigned to the unit (e.g., "Dr. João Silva Santos", "Dra. Maria Oliveira Costa")
- `prazoComprovacao` (date | null): Deadline for submitting proof of compliance (only set when proposition is published)
- `dataPublicacao` (date | null): Date when proposition was published to correicionado
- `rascunhos` (array): Draft comprovacoes prepared by correicionado before batch submission
- `rascunhosAvaliacao` (array): Draft avaliacoes prepared by assessors for corregedor review

**Bidimensional Status Model:**
The system uses a bidimensional status array `[statusProcessual, valoracao]` to separate workflow state from compliance evaluation:

**Status Processual (index 0)** - Workflow state:
- `pendente`: Awaiting publication or republicação
- `aguardando_comprovacao`: Published, waiting for correicionado to submit proof
- `em_analise`: Comprovação submitted, awaiting evaluation by corregedoria
- `encerrada`: Process completed (final state)

**Valoração (index 1)** - Compliance evaluation:
- `nova`: No evaluation yet (initial value)
- `adimplente`: Fully compliant
- `parcial`: Partially compliant
- `inadimplente`: Non-compliant
- `prejudicada`: Superseded or no longer applicable

**Display Pattern:**
- Both badges are displayed vertically in a stacked container
- Status processual shown on top, valoração below
- Each has distinct color coding via CSS classes
- Helper functions: `getStatusProcessual()`, `getValoracao()`, `renderStatusBadges()`

**Important:** Propositions no longer have a generic "prazo" field. The only relevant deadline is `prazoComprovacao`, which is set when the proposition is published and enters the `aguardando_comprovacao` status.

### Key Architectural Patterns

**State Management:**
- Global arrays: `correicoes[]` and `proposicoes[]`
- In-memory only - no persistence (resets on refresh)
- All state mutations must update both data arrays and UI
- **Global UI state variables (app.js:1-11):**
  - `dashboardCorreicaoFilter` - Selected correição ID for dashboard filtering (null = all)
  - `correicoesSortColumn` - Current sort column ('numero', 'totalProposicoes', 'pendentes', 'emAnalise', 'prazoVencido', or null)
  - `correicoesSortDirection` - Sort direction ('asc' or 'desc')
  - `correicoesStatusFilter` - Status filter for correições table ('', 'ativo', or 'inativo')

**Page Navigation:**
- Manual SPA routing via `showPage(pageId)` function for internal pages
- Internal pages: dashboard, correicoes, enviar, avaliar (admin-only), cadastroCorreicao (admin-only), cadastro (admin-only)
- External standalone pages: proposicoes.html, publicacao.html (admin-only), avaliacao.html, comprovacao.html
- Navigation state managed through `.hidden` CSS class (internal) or redirects (standalone)
- Sidebar links for standalone pages use `window.location.href='page.html'` instead of `showPage()`

**Data Flow Pattern:**
1. User action triggers event (form submit, button click)
2. Data array updated (correicoes/proposicoes)
3. Historico entry added to proposicao (for comprovacoes/avaliacoes)
4. Data saved to localStorage immediately
5. Multiple render functions called to sync UI:
   - **In index.html (app.js):**
     - `updateDashboard()` - updates statistics cards and chart
     - `renderCorreicoesTable()` - refreshes reviews table
     - `renderAvaliacaoTable()` - refreshes evaluation queue (admin only)
     - `populateCorreicaoFilter()` - updates filter dropdowns
     - `populateCorreicaoIdSelect()` - updates form selects
     - `populateProposicaoSelect()` - updates proposition dropdowns
   - **In proposicoes.html:**
     - `renderProposicoesTable()` - refreshes propositions table (standalone page)
     - Auto-updates when correição selected or filters changed
   - **In avaliacao.html:**
     - Self-contained rendering on page load
   - **In comprovacao.html:**
     - Self-contained rendering on page load

**Critical:**
- When adding/modifying propositions or correições in app.js, you MUST save to localStorage and call ALL relevant render functions to maintain UI consistency
- Standalone pages (proposicoes.html, avaliacao.html, comprovacao.html) automatically reload data from localStorage on initialization
- When adding comprovacoes or avaliacoes, you MUST append to proposicao.historico array
- Changes made in standalone pages are immediately persisted to localStorage

**Correição Status Automation:**
- `calcularStatusCorreicao(correicaoId)` - calculates status based on linked propositions
  - Returns 'ativo' if any proposition is not 'adimplente' or 'prejudicada'
  - Returns 'inativo' if all propositions are 'adimplente' or 'prejudicada'
- `atualizarStatusCorreicoes()` - recalculates status for all correições
  - Called during initialization to ensure data consistency
- `toggleUFMultiple()` - manages UF selection behavior in cadastro form
  - When MP='MPU': enables multiple selection (size=5, multiple attribute)
  - When MP='MPE': disables multiple selection (size=1, no multiple attribute)

## Running the Application

```bash
# Simply open in browser - no build process
open index.html

# Or start a local server for testing
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

## Code Organization by Section

### CSS Theme System (lines 14-24)
Custom properties define the color scheme:
- `--primary-color: #003366` (CNMP blue)
- `--secondary-color: #0066cc` (em_analise status, links)
- `--success-color: #28a745` (adimplente status)
- `--warning-color: #ffc107` (pendente status)
- `--danger-color: #dc3545` (inadimplente status)
- `--text-muted: #6c757d` (prejudicada status)

### Timeline Styles (lines 565-656)
Custom CSS for historical interaction timeline:
- Vertical timeline with left border
- Color-coded markers: publicacao (orange), comprovacao (blue), avaliacao (green)
- Bordered content boxes matching interaction type
- File attachments and status badges within timeline items
- Publications display prazoComprovacao deadline

### Table Row Selection Styles (lines 338-345)
CSS for visual feedback on selected table rows (used in publicacao.html):
- `.row-selected` class: Light blue background (#e7f3ff) with left border (4px solid --secondary-color)
- `.row-selected:hover`: Darker blue background (#d0e9ff) for hover state
- Provides clear visual distinction for batch selection operations
- Maintains accessibility with sufficient color contrast

### Dashboard with Advanced Features (index.html:131-192, app.js:8-11, 862-1087)

**Enhanced Dashboard Interface** with filterable statistics and dual-chart visualization:

**Correição Filter (index.html:131-139):**
- Dropdown selector to filter dashboard by specific correição
- Default: "Todas as Correições" (shows aggregated data)
- When correição selected: all cards and charts recalculate for that correição only
- Progressive filter: respects user permissions (admin sees all, user sees only their ramoMP)
- Auto-populated on login, after cadastro, and when navigating to dashboard

**Five Dashboard Cards:**
1. **Correições Realizadas** (🏛️) - Total correições cadastradas
2. **Correições Ativas** (🔄) - Correições with pending propositions
3. **Total de Proposições** (📄) - All registered propositions
4. **Proposições Ativas** (🔥) - Propositions in progress (not encerrada)
5. **Prazo Vencido** (⚠️) - Comprovações overdue

**Dual-Chart System (index.html:178-192, app.js:920-1046):**

**Chart 1: "Fluxo de Trabalho"** (Workflow Status - 4 bars)
- Shows propositions by **status processual**:
  - Pendente (yellow)
  - Aguardando Comprovação (dark orange)
  - Em Análise (blue)
  - Encerrada (dark blue)
- Dynamically calculates bar width based on 4 categories
- Auto-scales height based on max value

**Chart 2: "Valoração"** (Evaluation Status - 5 bars)
- Shows propositions by **valoração**:
  - Nova (gray) - no evaluation yet
  - Adimplente (green) - fully compliant
  - Parcial (orange) - partially compliant
  - Inadimplente (red) - non-compliant
  - Prejudicada (dark gray) - superseded
- Dynamically calculates bar width based on 5 categories
- Auto-scales height based on max value

**Responsive Grid Layout (styles.css:281-307, 753-761):**
- Desktop: Two charts side-by-side (2-column grid)
- Mobile (≤768px): Stacked vertically (1-column grid)
- Chart wrappers with consistent sizing and backgrounds
- Both charts use same visual design for coherence

**Key Functions:**
- `populateDashboardCorreicaoFilter()` - populates correição dropdown (app.js:1048-1074)
- `filtrarDashboardPorCorreicao()` - handles filter change and recalculates (app.js:1076-1086)
- `getFilteredCorreicoes()` / `getFilteredProposicoes()` - apply dashboard filter (app.js:851-877)
- `drawChart()` - renders Fluxo de Trabalho chart (app.js:920-978)
- `drawValoracaoChart()` - renders Valoração chart (app.js:980-1046)
- `updateDashboard()` - recalculates all metrics and redraws charts (app.js:879-919)

**Workflow:**
1. User loads dashboard → filter populates with available correições
2. User selects "Todas as Correições" (default) → shows aggregated statistics
3. User selects specific correição → all cards and both charts update dynamically
4. System respects user permissions (admin sees all, user sees only their MP)
5. Filter state maintained when navigating away and back to dashboard

### Authentication (lines 1074-1096)
- Two user types: "admin" (Corregedoria Nacional) and "user" (Órgão Correicionado)
- Admin sees all menu items; users have cadastro pages hidden
- No real authentication - accepts any credentials (prototype)

### Correições Table with Advanced Features (index.html:263-308, app.js:8-11, 1560-1707, styles.css:356-388)

**Enhanced Correições Interface** with sorting, filtering, and detailed statistics:

**Table Structure (13 columns):**
1. Número (sortable) - Correição identifier
2. Temática - Review theme
3. Número ELO - ELO system identifier
4. Tipo - Review type (Ordinária, Extraordinária, OCD, Inspeção)
5. MP - MP level (MPE/MPU)
6. UF - Brazilian state codes
7. Ramo do MP - MP branch
8. Total de Proposições (sortable) - Count of linked propositions
9. **Pendente (sortable)** - Count with status processual 'pendente' (yellow when > 0)
10. **Em Análise (sortable)** - Count with status processual 'em_analise' (blue when > 0)
11. **Prazo Vencido (sortable)** - Count with overdue prazoComprovacao (red when > 0)
12. Status - Ativo/Inativo badge
13. Ações - "Ver" button

**Column Sorting System (5 sortable columns):**
- **Sortable columns:** Número, Total de Proposições, Pendente, Em Análise, Prazo Vencido
- Click header to sort ascending (▲), click again for descending (▼)
- Visual indicators: Sort icon (⇅) when not sorted, triangle (▲/▼) when sorted
- CSS classes: `.sortable`, `.sorted-asc`, `.sorted-desc`
- Hover effect on sortable headers for discoverability

**Status Filter:**
- Dropdown with 3 options:
  - "Todas (ativas e inativas)" - default, shows all
  - "Apenas Ativas" - shows only correições with status 'ativo'
  - "Apenas Inativas" - shows only correições with status 'inativo'
- Works in conjunction with text search filter

**Key Functions:**
- `sortCorreicoesBy(column)` - toggles sort direction and re-renders (app.js:1561-1570)
- `filtrarCorreicoesPorStatus()` - applies status filter (app.js:1572-1579)
- `updateCorreicoesSortIndicators()` - updates visual sort indicators (app.js:1692-1707)
- `renderCorreicoesTable()` - applies filters, sorting, calculates stats, renders table (app.js:1581-1690)

**Enhanced Details Modal (app.js:1388-1520):**
- Organized in three sections with visual separators:
  1. **Correição Info** - All correição metadata
  2. **Status Processual** - Breakdown by workflow state:
     - Pendente, Aguardando Comprovação, Em Análise, Encerrada
  3. **Valoração** - Breakdown by compliance evaluation:
     - Nova, Adimplente, Parcial, Inadimplente, Prejudicada
- Color-coded counters matching badge system
- Complete visibility of all 9 possible proposition states

**Visual Features:**
- **Color highlighting:** Pendente (yellow), Em Análise (blue), Prazo Vencido (red)
- **Font weight:** Bold when count > 0 for immediate attention
- **Sortable headers:** Cursor pointer + hover effect
- **Sort indicators:** Clear visual feedback with Unicode arrows

### Search & Filter (lines 1207-1244)
Multi-criteria filtering system:
- Text search across numero, ramoMP, descricao
- Status dropdown filter
- Correição dropdown filter (propositions only)
- Tag dropdown filter (propositions only)
- All filters work together (AND logic)

### Tag System (lines 383-507, 1233-1490)
Complete categorization system with 11 predefined tags:
- Color-coded badges with distinct visual styles
- Multi-select checkbox interface in cadastro form
- Tag filtering in propositions table
- Tags displayed in table column and detail modal
- Available tags: administrativo, recursos-humanos, infraestrutura, tecnologia, processual, financeiro, capacitacao, gestao-documental, compliance, transparencia, outros

### Form Validation Pattern
All forms use:
1. HTML5 required attributes
2. Event listener with `e.preventDefault()`
3. Manual data construction from form fields
4. Array push operation
5. Alert confirmation
6. Multi-function UI refresh
7. Form reset

## Important Data Constraints

1. **MP Branches:** Hardcoded list of 27 Brazilian MPs - do not modify without user request
2. **Status Types:** 6 valid statuses - adding new status requires updates to:
   - CSS badge styles (`.badge-newstatus`)
   - Filter dropdown in proposicoes page
   - `getStatusLabel()` function (line ~1704)
   - Dashboard counter logic (line ~1189)
   - Chart rendering data object (line ~1214)
   - Chart barWidth calculation (adjust divisor from 6 to new count)
3. **Correição-Proposição Link:** Every proposição MUST have a valid correicaoId
4. **Date Format:** Uses ISO format (YYYY-MM-DD) in data, displays with `formatDate()` as DD/MM/YYYY
5. **Historico Array:** Every proposição should have a `historico` array (can be empty `[]`)
   - Never mutate existing history entries
   - Always append new entries with `.push()`
   - Preserve chronological order
6. **Tags Array:** Every proposição should have a `tags` array (can be empty `[]`)
   - Tags are stored as array of tag IDs (strings)
   - Valid tag IDs match the `availableTags` constant
   - Tags are optional - propositions without tags display "-" in UI

## UI Component Patterns

### Modal Detail Views
- `viewDetails(id)` - shows proposição details modal with:
  - Linked correição info
  - Complete historical timeline of comprovacoes and avaliacoes
  - Color-coded timeline markers and content boxes
- `viewCorreicaoDetails(id)` - shows correição modal with aggregated proposition statistics
- Modals populate innerHTML and toggle `.hidden` class
- Close with `closeModal()`

### Proposições Page (proposicoes.html)
**Dedicated standalone page for viewing and managing proposições** - extracted from index.html:

**Features:**
- Fully self-contained HTML page with embedded styles and scripts (~840 lines)
- Loads data from `localStorage` on initialization
- Professional UI with sidebar navigation and breadcrumb back to index.html
- **Mandatory Correição Selection Workflow:**
  - Step 1: User must select a correição from dropdown
  - Step 2: System displays correição info (temática, período, total de proposições)
  - Step 3: Filters and table appear (progressive disclosure)
- Simplified 7-column table design:
  - Columns: Número, Tipo, Unidade, Descrição, Tags, Status, Ações
  - Focused on essential information only
  - Shows only propositions from selected correição
- Advanced filtering system:
  - Search: número, unidade, membro, descrição
  - Tipo: Determinação/Recomendação
  - Status: Both processual (pendente/aguardando/em_analise/encerrada) and valoração (adimplente/parcial/inadimplente/prejudicada)
  - Tags: 11 predefined categories
  - Prioridade: urgente/alta/normal
  - "Limpar Filtros" button to reset all filters
- Three action buttons per proposition:
  1. **👁️ Visualizar** - Opens detail modal showing complete timeline and all fields
  2. **⚖️ Avaliar** - Redirects to `avaliacao.html?id={proposicaoId}` (allows evaluation at any time, not restricted by status)
  3. **✏️ Editar** - Opens inline modal to edit proposition metadata
- Edit modal features:
  - Edit fields: tipo, prioridade, unidade, membro, descrição, tags
  - Character counter for descrição (max 5,000 characters)
  - Tag checkboxes with visual badges
  - Changes saved immediately to localStorage
- Results counter showing filtered propositions count

**Key Functions (in proposicoes.html):**
- `init()` - loads user session, data, populates correição selector, shows placeholder
- `loadDataFromLocalStorage()` - retrieves correicoes and proposicoes from localStorage
- `populateCorreicaoSelect()` - populates correição dropdown with all available correições
- `onCorreicaoChange()` - handles correição selection, shows/hides sections, displays info, triggers table render
- `renderProposicoesTable()` - filters by selected correição (mandatory), applies all filters, renders 7 columns with 3 action buttons
- `limparFiltros()` - resets all filter dropdowns and re-renders table
- `viewDetails(id)` - opens detail modal with complete proposition info and timeline
- `abrirAvaliacao(id)` - redirects to `avaliacao.html?id={proposicaoId}`
- `abrirModalEdicao(id)` - opens edit modal and populates with current proposition data
- `populateTagCheckboxes(selectedTags)` - renders tag checkboxes with current selection
- `salvarEdicao(event)` - saves edited proposition to localStorage and refreshes table
- `updateCharCounter()` - manages textarea character counter with color feedback
- `closeModal(modalId)` - closes specified modal by ID

**Access Pattern:**
- User clicks "Proposições" in sidebar → navigates to `proposicoes.html`
- Must select correição before viewing propositions
- Click "Visualizar" → opens detail modal within proposicoes.html
- Click "Avaliar" → redirects to `avaliacao.html?id={proposicaoId}`
- Click "Editar" → opens edit modal within proposicoes.html, saves to localStorage
- Breadcrumb link returns to `index.html`

**Workflow:**
1. **Initial State:** Placeholder message shown, filters/table hidden
2. **Correição Selected:** Info panel appears, filters/table become visible, propositions loaded
3. **Filter/Search:** Table updates dynamically showing filtered results with count
4. **View Details:** Modal shows complete proposition info with timeline
5. **Evaluate:** Redirects to evaluation page (any status allowed)
6. **Edit:** Modal opens with form, changes saved to localStorage on submit

### Publicação Page (publicacao.html)
**Dedicated standalone page for batch publishing propositions** - admin-only access:

**Features:**
- Fully self-contained HTML page with embedded styles and scripts (~1,100 lines)
- Loads data from `localStorage` on initialization
- Professional UI with sidebar navigation and breadcrumb back to index.html
- **Admin-only access control:** Non-admin users automatically redirected to index.html
- **Mandatory Correição Selection Workflow:**
  - Step 1: Admin must select a correição from dropdown
  - Step 2: System displays correição info (temática, órgão correicionado, proposições pendentes)
  - Step 3: Filters and table appear (progressive disclosure)
- **Filtered table design (8 columns):**
  - Checkbox for batch selection
  - Columns: Número, Tipo, Unidade, Descrição, Tags, Prioridade, Ações
  - Shows ONLY propositions with status `['pendente', *]` from selected correição
  - Visual feedback: Selected rows highlighted with blue background and left border
- **Batch Selection System:**
  - Individual checkboxes per row
  - Master checkbox in table header (select/deselect all visible)
  - "☑️ Selecionar Todas" button (selects all filtered propositions)
  - "☐ Desmarcar Todas" button (clears all selections)
  - Real-time counter: "X selecionada(s)"
- **Advanced filtering system:**
  - Search: número, unidade, membro, descrição
  - Tipo: Determinação/Recomendação
  - Tags: 11 predefined categories
  - Prioridade: urgente/alta/normal (with color coding)
  - "Limpar Filtros" button to reset all filters
- **Publication Form (progressive disclosure):**
  - Only appears when at least one proposition is selected
  - Auto-scrolls into view for user convenience
  - **Prazo de Comprovação** (required): Single deadline applies to ALL selected propositions
  - **Observações** (optional): Up to 1,000 characters with real-time counter
  - Character counter with color feedback (green → yellow → red)
  - Summary: "Publicar X Proposição(ões)" button
  - Cancel button: Clears selection and resets form with confirmation
- **View Details Action:**
  - 👁️ "Ver" button in each row
  - Opens modal with complete proposition information and timeline
- Results counter showing count of pending propositions

**Key Functions (in publicacao.html):**
- `init()` - loads user session, validates admin access, loads data, populates correição selector
- `loadDataFromLocalStorage()` - retrieves correicoes and proposicoes from localStorage
- `populateCorreicaoSelect()` - populates correição dropdown with all available correições
- `onCorreicaoChange()` - handles correição selection, shows/hides sections, displays info and pending count
- `renderProposicoesTable()` - filters by selected correição AND status='pendente', applies all filters, renders table with checkboxes
- `limparFiltros()` - resets all filter dropdowns and re-renders table
- `toggleProposicao(id)` - handles individual checkbox selection, updates counter, shows/hides form
- `toggleSelectAll()` - master checkbox handler
- `selecionarTodas()` - selects all filtered propositions, shows form
- `desselecionarTodas()` - clears all selections, hides form
- `updateSelectedCount()` - updates real-time counter display
- `showPublicacaoForm()` / `hidePublicacaoForm()` - progressive disclosure control
- `cancelarPublicacao()` - confirmation dialog, clears selection and form
- `publicarProposicoes(event)` - main publication handler:
  - Validates selection
  - Confirms with user
  - Updates each selected proposition:
    - Status: `['aguardando_comprovacao', valoracao]`
    - Sets `prazoComprovacao` and `dataPublicacao`
    - Adds `publicacao` entry to `historico[]` array
  - Saves to localStorage
  - Shows success message (mentions automatic email)
  - Clears selection and form
  - Refreshes table
- `viewDetails(id)` - opens detail modal with complete proposition info and timeline
- `setupObsCharCounter()` - character counter for observações field with color feedback
- `closeModal(modalId)` - closes specified modal

**Access Pattern:**
- Admin clicks "Publicar Proposições" in sidebar → navigates to `publicacao.html`
- System validates admin access (redirects non-admin users)
- Must select correição before viewing pending propositions
- Apply filters (optional) → table updates showing only pendentes
- Select propositions (individual/bulk/all) → form appears
- Fill form (prazo + observações) → click "Publicar"
- Confirmation dialog → propositions published → status updated → historico recorded
- Success message shown → selection cleared → table updated

**Workflow:**
1. **Initial State:** Admin access validated, placeholder message shown, filters/table hidden
2. **Correição Selected:** Info panel appears (including pending count), filters/table visible, propositions loaded
3. **Filter/Search:** Table updates dynamically showing filtered pendentes with count
4. **Select Propositions:** Check individual boxes or use bulk selection buttons
5. **Form Appears:** Auto-scrolls into view, shows count of selected propositions
6. **Fill Form:** Define single prazo for all, add optional observações
7. **Publish:** Confirmation dialog → batch update → localStorage save → success message
8. **Post-Publish:** Selection cleared, form hidden, table refreshed (published items removed)

**Publication Entry in Historico:**
```javascript
{
  tipo: 'publicacao',
  data: '2025-12-09', // ISO date string
  usuario: 'Corregedoria Nacional',
  descricao: 'Proposição publicada para [ramoMP] - [ramoMPNome]',
  observacoes: 'Optional text or null',
  prazoComprovacao: '2025-12-30', // Deadline date
  statusAnterior: ['pendente', 'nova'],
  statusNovo: ['aguardando_comprovacao', 'nova']
}
```

**Important Notes:**
- Only propositions with status `['pendente', *]` can be published
- Single prazo applies to ALL selected propositions (batch operation)
- Email notification is mentioned in success message (integration pending)
- Published propositions immediately removed from pending list
- Changes persisted to localStorage immediately
- Complete audit trail via historico entries

### Avaliação Page (avaliacao.html)
**Dedicated standalone page for evaluating comprovações** - replaces old modal approach:

**Features:**
- Fully self-contained HTML page with embedded styles and scripts
- Loads data from `localStorage` on initialization
- Receives `id` parameter via URL query string (`?id=123`)
- Professional UI with breadcrumb navigation back to index.html
- Organized sections: Proposição Info, Complete Histórico, Current Comprovação
- Advanced evaluation form with:
  - Visual radio button cards for decision (adimplente/parcial/inadimplente/prejudicada)
  - Large textarea for parecer (up to 7,500 characters)
  - Real-time character counter with warning/danger states
  - Form validation before submission
- On submit: saves to localStorage and redirects to index.html

**Key Functions (in avaliacao.html):**
- `init()` - loads proposição by ID from URL, validates status, renders all sections
- `loadDataFromLocalStorage()` - retrieves correicoes and proposicoes from localStorage
- `renderProposicaoInfo()` - displays proposição metadata in info grid
- `renderHistorico()` - builds complete timeline of all interactions
- `renderComprovacaoAtual()` - shows last comprovacao details with files
- `submitAvaliacao()` - creates avaliacao entry, updates status, saves to localStorage
- `setupCharCounter()` - manages textarea character counter with visual feedback

**Access Pattern:**
- Admin clicks "Avaliar" button in renderAvaliacaoTable() → navigates to `avaliacao.html?id={proposicaoId}`
- After successful submission → redirects back to `index.html`

### Comprovação Page (comprovacao.html)
**Dedicated standalone page for submitting comprovações** - replaces old modal approach:

**Features:**
- Fully self-contained HTML page with embedded styles and scripts (1,181 lines)
- Loads data from `localStorage` on initialization
- Receives `id` parameter via URL query string (`?id=123`)
- Professional UI with breadcrumb navigation back to index.html
- Organized sections: Proposição Info, Prazo Alert, Comprovação Form
- Advanced comprovação form with:
  - Large textarea for descrição do adimplemento (up to 7,500 characters)
  - Real-time character counter with warning/danger states
  - Observações adicionais field (up to 1,000 characters)
  - Drag-and-drop file upload area with visual feedback
  - Multiple file attachment support with file size display
  - Visual list of uploaded files with remove buttons
  - Two submission options: "Salvar como Rascunho" and "Enviar Comprovação"
- Prazo alert with countdown and visual warning for overdue deadlines
- Automatic rascunho detection and loading on page load
- Visual indicator when editing existing rascunho

**Key Functions (in comprovacao.html):**
- `init()` - loads proposição by ID from URL, validates status, renders all sections
- `loadDataFromLocalStorage()` - retrieves correicoes and proposicoes from localStorage
- `renderProposicaoInfo()` - displays proposição metadata in info grid
- `renderPrazoAlert()` - shows deadline with countdown and visual warnings
- `loadRascunhoIfExists()` - automatically detects and loads existing rascunho
- `setupFileUpload()` - manages drag-and-drop file upload with visual feedback
- `renderFilesList()` - displays uploaded files with size and remove buttons
- `salvarRascunho()` - saves draft to localStorage (replaces existing rascunho)
- `submitComprovacao()` - creates comprovacao entry in historico, updates status to em_analise
- `setupCharCounter()` - manages textarea character counter with visual feedback

**Access Pattern:**
- User clicks "Adicionar" button in renderProposicoesComprovacaoTable() → navigates to `comprovacao.html?id={proposicaoId}`
- User clicks "Editar" button for existing rascunho → navigates to `comprovacao.html?id={proposicaoId}` (auto-loads rascunho)
- After saving rascunho or submitting comprovação → redirects back to `index.html#enviar`

**Workflow:**
1. **Add New:** Click "Adicionar" → opens comprovacao.html → fill form → save as rascunho OR submit directly
2. **Edit Rascunho:** Click "Editar" → opens comprovacao.html → form pre-filled with rascunho data → edit → save/submit
3. **Status Changes:**
   - Rascunho saved: stays as `aguardando_comprovacao`, rascunho stored in `proposicao.rascunhos`
   - Comprovação submitted: changes to `em_analise`, rascunho cleared, entry added to `proposicao.historico`

### Data Export System

**Comprehensive JSON and PDF export functionality** integrated across all major views in the system.

#### Overview
The export system provides data extraction capabilities in two formats:
- **JSON exports:** Machine-readable structured data with complete metadata
- **PDF exports:** Human-readable formatted reports optimized for printing

Export functionality is available in **5 strategic locations**, covering all major data views and workflows.

#### Shared CSS Styles (styles.css:1216-1301)
Centralized export button styling (85 lines) used consistently across all pages:
- `.export-dropdown` - Container for export button and menu
- `.export-btn` - Blue CNMP-styled button with dropdown arrow
- `.export-menu` - Dropdown menu with white background and shadow
- `.export-menu-item` - Individual export option with icon and hover effect

**Design Pattern:**
- Secondary color (#0066cc) for consistency with CNMP branding
- Dropdown positioned absolute, top-right alignment
- Click-outside-to-close behavior via document-level event listener
- Smooth transitions and professional shadows

#### UI Pattern - Export Button Component
Standard implementation across all pages:

```html
<div class="export-dropdown">
    <button class="export-btn" onclick="toggleExportMenu('uniqueMenuId')">
        📥 Exportar
        <span class="dropdown-arrow">▼</span>
    </button>
    <div id="uniqueMenuId" class="export-menu hidden">
        <button onclick="exportFunction1()" class="export-menu-item">
            📄 Export Option 1
        </button>
        <button onclick="exportFunction2()" class="export-menu-item">
            💾 Export Option 2
        </button>
    </div>
</div>
```

**Key JavaScript Pattern:**
```javascript
// Toggle menu visibility
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

// Close menus when clicking outside (document-level listener)
document.addEventListener('click', function(event) {
    if (!event.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-menu').forEach(menu => {
            menu.classList.add('hidden');
            menu.closest('.export-dropdown')?.classList.remove('active');
        });
    }
});
```

#### Export Locations and Functions

**1. Dashboard Export (index.html:129-148, app.js:1121-1497)**

Located in dashboard header, provides system-wide reporting:

**Functions:**
- `toggleExportMenu(menuId)` - Menu controller (shared pattern)
- `exportarDashboardJSON()` - Exports filtered data with complete statistics
- `exportarDashboardPDF()` - Generates executive dashboard report

**JSON Structure:**
```javascript
{
    titulo: 'Dashboard CNMP - Sistema de Acompanhamento de Proposições',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    filtroAplicado: 'COR-2024-01' | null,  // null = todas as correições
    usuario: 'MPBA - Ministério Público do Estado da Bahia',
    estatisticas: {
        correicoesRealizadas: 5,
        correicoesAtivas: 3,
        totalProposicoes: 13,
        proposicoesAtivas: 9,
        prazoVencido: 2
    },
    distribuicao: {
        statusProcessual: {
            pendente: 4,
            aguardando_comprovacao: 5,
            em_analise: 1,
            encerrada: 3
        },
        valoracao: {
            nova: 8,
            adimplente: 2,
            parcial: 1,
            inadimplente: 0,
            prejudicada: 2
        }
    },
    correicoes: [ /* array of correição objects */ ],
    proposicoes: [ /* array of proposição objects */ ]
}
```

**PDF Features:**
- CNMP institutional header with logo placeholder
- Filtro applied indicator
- 5 statistics cards in grid layout
- Two charts (Fluxo de Trabalho + Valoração) with color-coded bars
- Print-optimized styling with @media print rules

---

**2. Correições Table Export (index.html:280-302, app.js:1499-1976)**

Located in correições page header, provides three export levels:

**Functions:**
- `getCorreicoesFiltradas()` - Helper function to get filtered correições (respects search + status filter)
- `exportarCorreicoesPDF()` - Simple table export (13 columns)
- `exportarCorreicoesJSON()` - Structured data with aggregated statistics
- `exportarCorreicoesRelatorioDetalhado()` - Comprehensive PDF report with breakdown

**JSON Structure:**
```javascript
{
    titulo: 'Correições CNMP - Dados Exportados',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    totalCorreicoes: 5,
    filtrosAplicados: {
        busca: 'MPBA',
        statusFilter: 'ativo'
    },
    usuario: 'Admin',
    correicoes: [
        {
            id: 1,
            numero: 'COR-2024-01',
            tematica: 'Direitos fundamentais e meio ambiente',
            numeroElo: '1234567-89.2024.1.01.0001',
            tipo: 'Ordinária',
            mp: 'MPE',
            uf: ['BA'],
            ramoMP: 'MPBA',
            ramoMPNome: 'Ministério Público do Estado da Bahia',
            dataInicio: '2024-01-15',
            dataFim: '2024-03-20',
            status: 'ativo',
            estatisticas: {
                totalProposicoes: 3,
                pendente: 1,
                aguardando_comprovacao: 1,
                em_analise: 0,
                encerrada: 1,
                prazoVencido: 0
            }
        }
        /* ... more correições */
    ]
}
```

**PDF Reports:**
- **Simple table:** 13-column tabular layout with all correições
- **Detailed report:** Full breakdown per correição with:
  - Complete metadata
  - Status processual distribution (4 categories)
  - Valoração distribution (5 categories)
  - Visual separators between correições

---

**3. Proposições Page Export (proposicoes.html:61-87, 806-1265)**

Located in proposicoes page header (standalone page), provides proposition-level exports:

**Functions:**
- `toggleExportMenu(menuId)` - Menu controller
- `getProposicoesFiltradas()` - Helper function applying all filters (correição, search, tipo, status, tag, prioridade)
- `exportarProposicoesPDF()` - Current filtered view as table
- `exportarProposicoesJSON()` - Structured data with filter metadata
- `exportarProposicoesRelatorioCompleto()` - Comprehensive report with complete timelines

**JSON Structure:**
```javascript
{
    titulo: 'Proposições CNMP - Dados Exportados',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    totalProposicoes: 3,
    correicaoSelecionada: {
        id: 1,
        numero: 'COR-2024-01',
        tematica: 'Direitos fundamentais e meio ambiente',
        ramoMP: 'MPBA',
        ramoMPNome: 'Ministério Público do Estado da Bahia'
    },
    filtrosAplicados: {
        busca: '',
        tipo: '',
        status: '',
        tag: 'tecnologia',
        prioridade: ''
    },
    usuario: 'MPBA - Ministério Público do Estado da Bahia',
    proposicoes: [
        {
            id: 1,
            numero: 'PROP-2024-0001',
            correicaoId: 1,
            tipo: 'Determinação',
            unidade: 'Procuradoria-Geral de Justiça',
            membro: 'Dr. João Silva Santos',
            descricao: '...',
            prioridade: 'normal',
            prazoComprovacao: '2024-12-31',
            dataPublicacao: '2024-11-01',
            status: ['encerrada', 'adimplente'],
            tags: ['tecnologia', 'gestao-documental'],
            historico: [ /* complete timeline */ ]
        }
        /* ... more proposições */
    ]
}
```

**PDF Relatório Completo Features:**
- Complete proposition details per item
- **Full timeline rendering** with color-coded entries:
  - 📤 Publicação (orange background)
  - 📎 Comprovação (blue background)
  - ⚖️ Avaliação (green background)
- Each timeline entry shows: date, user, description, observações, prazoComprovacao, arquivos
- Print-optimized with page breaks between propositions

---

**4. Modal Details Export (index.html:713-740, app.js:12, 1979-2248)**

Located in detail modal header (compact button), provides individual proposition export:

**State Management:**
```javascript
// Global variable in app.js (line 12)
let currentDetailProposicaoId = null;

// Set in viewDetails function (app.js:2130-2131)
function viewDetails(id) {
    const proposicao = proposicoes.find(p => p.id === id);
    if (!proposicao) return;

    // Store ID for export functions
    currentDetailProposicaoId = id;

    // ... rest of modal rendering
}
```

**Functions:**
- `exportarDetalhePDF()` - Timeline-focused PDF with complete history
- `exportarDetalheJSON()` - Complete proposition data with linked correição info

**JSON Structure:**
```javascript
{
    titulo: 'Proposição CNMP - Dados Completos',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    proposicao: {
        // All proposition fields
        id: 1,
        numero: 'PROP-2024-0001',
        tipo: 'Determinação',
        unidade: 'Procuradoria-Geral de Justiça',
        membro: 'Dr. João Silva Santos',
        descricao: '...',
        prioridade: 'normal',
        status: ['encerrada', 'adimplente'],
        tags: ['tecnologia', 'gestao-documental'],
        historico: [ /* complete timeline */ ],
        correicao: {
            numero: 'COR-2024-01',
            tematica: 'Direitos fundamentais e meio ambiente',
            ramoMP: 'MPBA',
            ramoMPNome: 'Ministério Público do Estado da Bahia',
            dataInicio: '2024-01-15',
            dataFim: '2024-03-20'
        }
    },
    usuario: 'MPBA - Ministério Público do Estado da Bahia'
}
```

**PDF Timeline Features:**
- Focused on historical audit trail
- Color-coded timeline items matching UI (orange/blue/green)
- Each entry displays: tipo icon, date, user, description, observações, prazoComprovacao, arquivos
- Chronological order from oldest to newest

---

**5. Publicação Page Export (publicacao.html:61-83, 823-1124)**

Located in publicação page header (admin-only), provides publication-specific exports:

**Functions:**
- `toggleExportMenu(menuId)` - Menu controller
- `exportarPendentesJSON()` - All pending propositions for selected correição
- `exportarSelecionadasJSON()` - Currently selected propositions (checkbox-based)
- `exportarOficioPublicacao()` - **Official legal document generator** (PDF)

**JSON Structure (Pendentes):**
```javascript
{
    titulo: 'Proposições Pendentes - Publicação',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    correicaoSelecionada: {
        id: 1,
        numero: 'COR-2024-01',
        tematica: 'Direitos fundamentais e meio ambiente',
        ramoMP: 'MPBA',
        ramoMPNome: 'Ministério Público do Estado da Bahia'
    },
    totalPendentes: 2,
    usuario: 'Corregedoria Nacional (Admin)',
    proposicoes: [ /* array of propositions with status ['pendente', *] */ ]
}
```

**JSON Structure (Selecionadas):**
```javascript
{
    titulo: 'Proposições Selecionadas para Publicação',
    dataExportacao: '2025-12-10T15:30:00.000Z',
    totalSelecionadas: 3,
    correicaoSelecionada: { /* ... */ },
    usuario: 'Corregedoria Nacional (Admin)',
    proposicoes: [ /* array of selected propositions */ ]
}
```

**Ofício de Publicação (PDF) - Special Feature:**

Professional legal document in **Times New Roman** font, following Brazilian institutional formatting standards:

**Structure:**
1. **Institutional Header:**
   - CONSELHO NACIONAL DO MINISTÉRIO PÚBLICO
   - Corregedoria Nacional
   - Bottom border separator

2. **Document Identification:**
   - Ofício number placeholder: "OFÍCIO Nº _____ /CNMP-CN"
   - Location and date: "Brasília-DF, [current date]"

3. **Recipient:**
   - Formal salutation: "Ao(À) Excelentíssimo(a) Senhor(a)"
   - Destinatário name (ramoMPNome)
   - Reference: "Ref.: Correição [numero]"

4. **Body:**
   - Formal opening: "Senhor(a) Procurador(a)-Geral,"
   - Legal references: Lei Complementar nº 75/1993, Regimento Interno CNMP
   - Publication declaration with correição details (número, temática, período)
   - Prazo de comprovação deadline (from form or "[A DEFINIR]")

5. **Propositions List:**
   - Numbered list header: "PROPOSIÇÕES PUBLICADAS (N)"
   - Each proposition in styled box:
     - Number and tipo (uppercase)
     - Unidade
     - Descrição

6. **Signature:**
   - Signature line
   - Name placeholder: "[NOME DO CORREGEDOR NACIONAL]"
   - Title: "Corregedor Nacional do Ministério Público"

**Styling:**
- Font: Times New Roman, 12pt
- Line height: 1.8 (formal document spacing)
- Text indentation: 2cm for paragraphs
- Professional borders and spacing
- Print-optimized layout

---

#### JSON Export Pattern

All JSON exports follow this standard pattern:

```javascript
function exportarSomethingJSON() {
    // 1. Validate data availability
    if (!dataSource || dataSource.length === 0) {
        alert('Nenhum dado disponível para exportação.');
        return;
    }

    // 2. Build structured export object
    const exportData = {
        titulo: 'Descriptive Title',
        dataExportacao: new Date().toISOString(),
        // ... metadata fields
        // ... main data arrays
        usuario: currentUser ? `${currentUser.ramoMP} - ${currentUser.ramoMPNome}` : 'Admin'
    };

    // 3. Create Blob and download
    const dataStr = JSON.stringify(exportData, null, 2);  // Pretty-print with 2-space indent
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `descriptive-filename-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);  // Clean up memory

    // 4. Close export menu
    document.getElementById('menuId').classList.add('hidden');
}
```

---

#### PDF Export Pattern

All PDF exports follow this standard pattern:

```javascript
function exportarSomethingPDF() {
    // 1. Validate data
    if (!dataSource || dataSource.length === 0) {
        alert('Nenhum dado disponível para exportação.');
        return;
    }

    // 2. Build HTML content
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Report Title</title>
            <style>
                /* Base styles */
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                }

                /* Print optimization */
                @media print {
                    body { padding: 10px; }
                    .page-break { page-break-after: always; }
                }

                /* Header styles */
                .header {
                    text-align: center;
                    border-bottom: 2px solid #003366;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }

                /* Content styles */
                /* ... specific to report type */
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Report Title</h1>
                <p>Report Subtitle</p>
            </div>

            <!-- Dynamic content here -->
            ${dataSource.map(item => `
                <!-- Item template -->
            `).join('')}

            <div class="footer">
                <p>Generated on: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();

    // 3. Trigger print dialog
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };

    // 4. Close export menu
    document.getElementById('menuId').classList.add('hidden');
}
```

---

#### Complete Function Reference

**File: app.js**
| Function | Lines | Description |
|----------|-------|-------------|
| `toggleExportMenu(menuId)` | 1121-1145 | Dropdown menu controller (shared) |
| `exportarDashboardJSON()` | 1147-1250 | Dashboard JSON export |
| `exportarDashboardPDF()` | 1252-1497 | Dashboard PDF report |
| `getCorreicoesFiltradas()` | 1499-1521 | Helper: filtered correições |
| `exportarCorreicoesJSON()` | 1523-1649 | Correições JSON export |
| `exportarCorreicoesPDF()` | 1651-1796 | Correições simple table PDF |
| `exportarCorreicoesRelatorioDetalhado()` | 1798-1976 | Correições detailed PDF report |
| `exportarDetalheJSON()` | 1979-2063 | Modal detail JSON export |
| `exportarDetalhePDF()` | 2065-2248 | Modal detail timeline PDF |

**File: proposicoes.html**
| Function | Lines | Description |
|----------|-------|-------------|
| `toggleExportMenu(menuId)` | 806-830 | Dropdown menu controller |
| `getProposicoesFiltradas()` | 832-879 | Helper: filtered propositions |
| `exportarProposicoesJSON()` | 881-985 | Proposições JSON export |
| `exportarProposicoesPDF()` | 987-1098 | Proposições current view PDF |
| `exportarProposicoesRelatorioCompleto()` | 1100-1265 | Proposições complete report with timelines |

**File: publicacao.html**
| Function | Lines | Description |
|----------|-------|-------------|
| `toggleExportMenu(menuId)` | 823-847 | Dropdown menu controller |
| `exportarPendentesJSON()` | 849-927 | Pending propositions JSON |
| `exportarSelecionadasJSON()` | 929-1002 | Selected propositions JSON |
| `exportarOficioPublicacao()` | 1004-1124 | Official legal document PDF (ofício) |

**Total:** 17 functions across 3 files

---

#### Testing Guidelines

**Basic Functionality:**
1. Verify export button appears in all 5 locations
2. Test dropdown menu open/close behavior
3. Verify click-outside-to-close functionality
4. Test that only one menu opens at a time

**JSON Exports:**
1. Verify file downloads with correct naming pattern
2. Open JSON in text editor - verify pretty-print formatting (2-space indent)
3. Validate JSON structure matches documented schema
4. Verify metadata fields (titulo, dataExportacao, usuario)
5. Verify filter state is captured in exported data
6. Verify all array data is complete and accurate

**PDF Exports:**
1. Verify print dialog opens automatically
2. Review PDF preview before printing
3. Verify CNMP branding (colors, fonts, headers)
4. Verify data accuracy matches UI display
5. Test print-specific styles (@media print rules apply)
6. Verify page breaks work correctly for long reports
7. For timeline exports: verify color coding (orange/blue/green)
8. For ofício: verify Times New Roman font and formal formatting

**Filter Integration:**
1. Apply filters → export → verify exported data reflects filters
2. Test with no filters → verify all data exported
3. Test with multiple filters combined → verify AND logic preserved
4. Dashboard: test with correição filter active
5. Proposições: test with correição selection requirement

**Edge Cases:**
1. Export with empty dataset → verify user-friendly alert message
2. Export with single item → verify formatting correct
3. Export with maximum data (all correições/proposições) → verify performance
4. Test on different browsers (Chrome, Firefox, Safari, Edge)
5. Test on mobile devices (responsive export menu)

**Permission-Based:**
1. Admin user: verify access to publicacao.html exports (ofício generator)
2. Regular user: verify no access to admin-only export pages
3. Verify usuario field reflects correct user context in exports

---

#### Common Modification Scenarios

**Adding Export to New Page:**
1. Copy shared CSS from styles.css:1216-1301 (already global)
2. Add export button HTML with unique menuId to page header
3. Implement `toggleExportMenu(menuId)` function (copy pattern)
4. Add document-level click listener for close-on-outside-click
5. Create export functions following JSON/PDF patterns
6. Test dropdown behavior and data accuracy

**Adding New Export Option to Existing Location:**
1. Add new `<button>` in existing `.export-menu` div
2. Create new export function (JSON or PDF)
3. Follow naming convention: `exportar[Location][Type][Format]()`
4. Update testing checklist with new option
5. Document in CLAUDE.md function reference table

**Modifying Export Data Structure:**
1. Update JSON export function to include new fields
2. Update PDF template HTML to display new fields
3. Test backward compatibility if data is consumed externally
4. Update documentation with new structure schema

---

#### Performance Considerations

- **Large Datasets:** JSON exports are efficient for datasets up to ~10,000 records
- **PDF Generation:** Browser-based rendering; performance varies by complexity
- **Memory Management:** `URL.revokeObjectURL()` called after download to free memory
- **Print Dialog:** Automatic window close after print completion
- **Filter First:** Encourage users to filter before exporting large datasets

---

#### Future Enhancement Opportunities

1. **Server-Side Generation:** For very large datasets, implement backend PDF generation
2. **Email Integration:** Direct email sending of exports (mentioned in success messages)
3. **Scheduled Exports:** Automated daily/weekly report generation
4. **Export Templates:** User-customizable export formats
5. **Batch Export:** Multi-correição exports in single operation
6. **Excel/CSV:** Additional formats beyond JSON/PDF
7. **Digital Signature:** For legal documents (ofício)

---

### Table Rendering Pattern
```javascript
// Standard pattern for table updates:
const filtered = data.filter(/* criteria */);
tbody.innerHTML = filtered.map(item => `
  <tr>
    <td>${item.field}</td>
    ...
  </tr>
`).join('');
```

### Badge System
**Status Badges:** Use class pattern `badge badge-${status}`
- Maps to CSS classes: `.badge-pendente`, `.badge-adimplente`, etc.
- Colors must be distinct and accessible

**Tag Badges:** Use class pattern `tag-badge tag-${tagId}`
- 11 predefined color schemes for different categories
- Smaller, pill-shaped design with borders
- Rendered via `renderTagBadges(tags)` helper function

## Role-Based UI Control

Admin-only elements (hidden for regular users):
- `#navAvaliar` - Evaluate Comprovacoes page (⚖️)
- `#navCadastroCorreicao` - New Review page
- `#navCadastroProposicao` - New Proposition page

User (correicionado) elements:
- All pages except admin-only ones
- Can submit comprovacoes via "Enviar Comprovação" page
- Can view own proposition history

Check `currentUser.type` to determine access rights.
Hide admin pages in login handler: `document.getElementById('navAvaliar').style.display = 'none'`

## Practical Use Cases for Recent Features

**Dashboard Correição Filter:**
- **Scenario 1:** Corregedor wants focused view of specific correição during active review
  - Select correição from dropdown → dashboard shows only that review's statistics
  - Quick assessment: Are there overdue comprovações? How many propositions in analysis?
- **Scenario 2:** Manager needs aggregated view across all active reviews
  - Keep "Todas as Correições" selected → see system-wide metrics
  - Identify which reviews need attention (via filter-then-drill approach)

**Dual-Chart System:**
- **Fluxo de Trabalho chart:** Visual workflow monitoring
  - High "Pendente" bar → many propositions awaiting publication
  - High "Em Análise" bar → evaluation backlog building up
  - Growing "Aguardando Comprovação" bar → correicionados not responding
- **Valoração chart:** Compliance quality overview
  - High "Adimplente" bar → good compliance rates
  - High "Inadimplente/Parcial" bars → compliance issues, need follow-up
  - High "Nova" bar → many propositions not yet evaluated

**Correições Table Sorting:**
- **Sort by Prazo Vencido (DESC):** Prioritize reviews with most overdue propositions
- **Sort by Pendente (DESC):** Identify reviews with most unpublished propositions
- **Sort by Em Análise (DESC):** Find reviews with largest evaluation backlog
- **Sort by Total de Proposições (DESC):** Focus on largest/most complex reviews
- **Sort by Número (ASC):** Quick alphabetical lookup for specific review

**Correições Status Filter:**
- **"Apenas Ativas":** Daily operational focus - show only reviews requiring work
- **"Apenas Inativas":** Historical reference - consult completed reviews for precedent
- **"Todas":** Management reporting - comprehensive view for dashboards and reports

**Enhanced Correição Details Modal:**
- **Complete status breakdown:** See exactly where propositions are in workflow
- **Identify bottlenecks:** If many "Pendente" → publication needed; many "Em Análise" → evaluations needed
- **Quality assessment:** Valoração section shows compliance quality distribution
- **Informed decision-making:** Plan follow-up actions based on complete status picture

## Common Modification Scenarios

### Adding a New Status
1. Add CSS badge class (`.badge-newstatus`)
2. Add option to `#statusFilter` dropdown
3. Update `getStatusLabel()` function
4. Add to dashboard counter logic
5. Add to chart data object and colors/labels
6. Adjust chart barWidth calculation for new count

### Adding a New Page

**For Internal SPA Pages (within index.html):**
1. Add nav item in sidebar with `onclick="showPage('newpage')"`
2. Create page div with `id="newpagePage"` and class `page hidden`
3. Add case handling in `showPage()` function if special logic needed
4. If admin-only, add ID and hide logic in login handler

**For Standalone Pages (like proposicoes.html):**
1. Create new .html file with complete structure (header, sidebar, content)
2. Add nav item in sidebar with `onclick="window.location.href='newpage.html'"`
3. Include session management functions: `loadUserSession()`, `loadDataFromLocalStorage()`
4. Add breadcrumb link back to index.html
5. Implement auto-login on page load
6. Ensure all data changes are saved to localStorage
7. Update CLAUDE.md with page documentation

### Modifying Data Model
When adding fields to correições or proposições:
1. Update sample data in `initializeSampleData()`
2. Update form HTML with new input field
3. Update form submit handler to capture new field
4. Update table rendering to display new field
5. Update detail modal to show new field
6. Update any filters/search logic if applicable

**Special Considerations for Correições:**
- `uf` field is an array - use `getSelectedUFs()` helper to extract values from select
- `status` field is auto-calculated - call `atualizarStatusCorreicoes()` after data changes
- When rendering UF array in tables/modals, use `.join(', ')` to display as comma-separated list
- MP field change triggers `toggleUFMultiple()` to adjust UF selection mode

### Adding a New Tag
1. Add tag definition to `availableTags` array with `id` and `label`
2. Add CSS class `.tag-{id}` with background-color, color, and border-color
3. Tag will automatically appear in:
   - Cadastro form checkboxes (via `populateTagSelect()`)
   - Filter dropdown (via `populateTagFilter()`)
   - Table and modals (via `renderTagBadges()`)

## NAD Workflow Implementation

The system implements the complete NAD (Núcleo de Acompanhamento de Decisões) iterative workflow with **publication-gated comprovação submission**.

### Core Principle: Publication Before Comprovação

**Every comprovação MUST be preceded by a publication.** This ensures proper deadline management and workflow control.

### Status Lifecycle
```
┌─────────────────────────────────────────────────────────────┐
│ pendente (nunca publicada OU aguardando republicação)       │
│ - Proposições novas começam aqui                            │
│ - Proposições com avaliação parcial/inadimplente voltam aqui│
└─────────────────────────────────────────────────────────────┘
                          ↓
                    [PUBLICAÇÃO]
            (define prazoComprovacao)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ aguardando_comprovacao                                      │
│ - Disponível para comprovação pelo correicionado            │
│ - Tem prazoComprovacao definido                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    [COMPROVAÇÃO]
          (correicionado envia evidências)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ em_analise                                                  │
│ - Aguardando avaliação da Corregedoria                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
                     [AVALIAÇÃO]
                (Corregedoria decide)
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                     ↓
  adimplente/prejudicada            parcial/inadimplente
        ↓                                     ↓
    FIM ✓                            volta para: pendente
                                     (aguarda republicação)
```

### Workflow Steps Detailed

**Step 0: Corregedoria Publishes Proposição** (lines 3227-3264)
- Admin accesses "Publicar Proposições" page
- Selects correição and views propositions with status `pendente`
  - **Includes:** Never-published propositions
  - **Includes:** Propositions with previous parcial/inadimplente evaluations
- Defines `prazoComprovacao` (deadline for proof submission)
- System creates `publicacao` entry in historico array with:
  - Date, prazoComprovacao, status transition (pendente → aguardando_comprovacao)
- Status changes to `aguardando_comprovacao`
- **Publication is permanently recorded** - creates complete audit trail

**Step 1: Correicionado Submits Comprovacao** (lines 2593-2672)
- User accesses "Enviar Comprovação" page
- System shows ONLY propositions with status `aguardando_comprovacao`
  - **Propositions with status `pendente` are NOT available** (need publication first)
- User selects proposition, provides description, attaches documents
- Can save as draft (`rascunhos`) or submit immediately
- On submission:
  - System creates `comprovacao` entry in historico
  - Status changes to `em_analise`
  - Corregedoria is notified via evaluation queue

**Step 2: Corregedoria Evaluates** (lines 3001-3046, 3128-3167)
- Admin accesses "Avaliar Comprovações" page
- Views propositions with status `em_analise`
- Opens evaluation modal showing complete history and latest comprovacao
- Selects decision:
  - `adimplente` - fully compliant → **cycle ends** ✓
  - `prejudicada` - superseded → **cycle ends** ✓
  - `parcial` - partially compliant → **status changes to `pendente`**
  - `inadimplente` - non-compliant → **status changes to `pendente`**
- Provides written justification (parecer)
- System creates `avaliacao` entry in historico with actual decision
- **Key behavior:** If decision is parcial/inadimplente:
  - `proposicao.status` = `'pendente'` (not parcial/inadimplente)
  - `historico` records the true evaluation decision (parcial or inadimplente)
  - Proposition requires **new publication** before accepting new comprovação

**Step 3: Iterative Cycle (Republicação)**
- Propositions evaluated as `parcial` or `inadimplente` return to status `pendente`
- They appear in "Publicar Proposições" alongside never-published propositions
- Corregedoria can republish with **new prazoComprovacao**
- Each republicação is recorded in historico as new `publicacao` entry
- Cycle repeats: publicação → comprovação → avaliação → ...
- **Termination:** Cycle ends when evaluation is `adimplente` or `prejudicada`

### Status Meanings

**`pendente`** - Dual meaning:
1. **Never published:** New propositions awaiting initial publication
2. **Awaiting republicação:** Propositions with parcial/inadimplente evaluation requiring new publication cycle

**Key insight:** Status `pendente` = "cannot receive comprovação until published/republished"

### Key Functions

**Publication:**
- `carregarProposicoesParaPublicar()` - filters all propositions with status `pendente`
- `publicarProposicoesSelecionadas()` - publishes selected propositions, records in historico, sets prazoComprovacao

**Comprovacao Submission:**
- `populateProposicaoSelect()` - filters ONLY propositions with status `aguardando_comprovacao`
- Comprovacao form submit handler adds to historico, sets status to `em_analise`

**Avaliacao Process:**
- `renderAvaliacaoTable()` - shows queue of propositions with status `em_analise`
- `abrirAvaliacaoModal(id)` - opens evaluation interface with complete history
- `submitAvaliacao(proposicaoId)` - records decision in historico, updates status
  - **Special logic (line 3158-3162):** If decision is parcial/inadimplente, sets status to `pendente`

**History Display:**
- `viewDetails(id)` - renders complete timeline with publicacoes, comprovacoes, and avaliacoes
- Timeline CSS provides color differentiation: orange (publicacao), blue (comprovacao), green (avaliacao)

### Benefits of This Workflow

1. **Enforces Deadline Management:** Every comprovação has an associated prazoComprovacao from publication
2. **Complete Audit Trail:** All publications are permanently recorded in historico
3. **Clear State Transitions:** Status `pendente` unambiguously means "needs (re)publication"
4. **Prevents Premature Comprovação:** System blocks comprovação submission for unpublished propositions
5. **Supports Iterative Remediation:** Failed evaluations return to pendente, requiring explicit republicação
6. **Transparent Evaluation History:** Historico preserves actual decisions (parcial/inadimplente) even when status changes
7. **Flexible Republicação:** Admin can republish even if prazo expires without response

## Testing Approach

No automated tests. Manual testing checklist:

**Authentication & Permissions:**
1. Test login as both admin and user - verify menu visibility
2. Verify user cannot see "Avaliar Comprovações" menu item
3. Verify admin sees all menu items including evaluation page

**Data Management:**
4. Create new correição - verify it appears in tables and dropdowns
   - Test all required fields: temática, numeroElo, tipo, mp, uf
   - Verify numeroElo accepts format NNNNNNN-DD.AAAA.J.TT.OOOO
   - Test MP=MPE with single UF selection
   - Test MP=MPU with multiple UF selection (Ctrl+Click)
   - Verify status is calculated automatically based on propositions
5. Create new proposição - verify correição link and table display
   - Test all required fields: tipo (Determinação/Recomendação), unidade, membro
   - Verify tipo combo has exactly 2 options
   - Verify unidade and membro accept text input
   - Verify proposição appears in table with all new columns
   - Note: No generic "prazo" field - only prazoComprovacao when published
6. Test all filters - text search (including tematica, numeroElo, tipo for correições; tipo, unidade, membro for proposições), status, correição, tags
7. View correição details modal - verify all new fields displayed correctly
8. View proposição details modal - verify tipo, unidade, membro displayed

**Tag System:**
9. Create new proposição with tags selected:
   - Verify checkboxes work in cadastro form
   - Verify tags appear in table and detail modal
   - Verify tag badges render with correct colors
10. Test tag filter:
    - Filter by different tags
    - Verify only propositions with selected tag appear
11. Verify tags persist when editing/viewing propositions

**Proposições Page (proposicoes.html):**
12. Click "Proposições" in sidebar - verify redirect to proposicoes.html
13. Test mandatory correição selection workflow:
    - **Initial state:** Verify placeholder message shown ("Selecione uma Correição")
    - **Initial state:** Verify filters and table are hidden
    - **Select correição:** Choose a correição from dropdown
    - **After selection:** Verify correição info panel appears with temática, período, total
    - **After selection:** Verify filters section appears
    - **After selection:** Verify table with propositions appears
    - **Deselect correição:** Choose empty option - verify returns to placeholder state
14. Test 7-column table display:
    - Verify columns: Número, Tipo, Unidade, Descrição, Tags, Status, Ações
    - Verify only propositions from selected correição are shown
    - Verify bidimensional status badges displayed correctly (processual + valoração)
    - Verify results counter shows correct count
15. Test advanced filters:
    - **Search:** Type in search box - verify filters by número, unidade, membro, descrição
    - **Tipo filter:** Select "Determinação" - verify only determinações shown
    - **Status filter:** Test both processual and valoração status values
    - **Tag filter:** Select a tag - verify only propositions with that tag shown
    - **Prioridade filter:** Select "urgente" - verify only urgent propositions shown
    - **Multiple filters:** Apply multiple filters simultaneously - verify AND logic
    - **Clear filters:** Click "Limpar Filtros" - verify all filters reset
16. Test three action buttons:
    - **Visualizar button:** Click - verify detail modal opens with complete info and timeline
    - **Avaliar button:** Click - verify redirects to `avaliacao.html?id={proposicaoId}`
    - **Editar button:** Click - verify edit modal opens with form populated
17. Test edit modal functionality:
    - Verify all fields populated correctly: tipo, prioridade, unidade, membro, descrição, tags
    - Verify número field is readonly
    - Edit descrição - verify character counter updates in real-time
    - Verify character counter changes color (green → yellow → red)
    - Select/deselect tags - verify checkboxes work with visual badges
    - Click "Cancelar" - verify modal closes without saving
    - Edit fields and click "Salvar" - verify:
      - Success message displayed
      - Modal closes
      - Table refreshes with new data
      - Changes persisted to localStorage
18. Test session persistence:
    - Login and navigate to proposicoes.html
    - Refresh page (F5) - verify auto-login works
    - Verify data loads correctly
    - Verify user menu reflects correct permissions

**Publicação Page (publicacao.html):**
19. Click "Publicar Proposições" in sidebar - verify redirect to publicacao.html
20. Test admin access control:
    - Login as admin - verify page loads successfully
    - Logout and login as user - verify automatic redirect to index.html with error message
21. Test mandatory correição selection workflow:
    - **Initial state:** Verify placeholder message shown ("Selecione uma Correição")
    - **Initial state:** Verify filters and table are hidden
    - **Select correição:** Choose a correição from dropdown
    - **After selection:** Verify correição info panel appears with temática, órgão correicionado, pendentes count
    - **After selection:** Verify filters section appears
    - **After selection:** Verify table with ONLY PENDENTE propositions appears
    - **Deselect correição:** Choose empty option - verify returns to placeholder state
22. Test 8-column table display:
    - Verify columns: Checkbox, Número, Tipo, Unidade, Descrição, Tags, Prioridade, Ações
    - Verify only propositions with status `['pendente', *]` from selected correição shown
    - Verify prioridade column has color coding (urgente=red, alta=orange, normal=black)
    - Verify master checkbox in table header
23. Test advanced filters:
    - **Search:** Type in search box - verify filters by número, unidade, membro, descrição
    - **Tipo filter:** Select "Determinação" - verify only determinações shown
    - **Tag filter:** Select a tag - verify only propositions with that tag shown
    - **Prioridade filter:** Select "urgente" - verify only urgent propositions shown
    - **Multiple filters:** Apply multiple filters simultaneously - verify AND logic
    - **Clear filters:** Click "Limpar Filtros" - verify all filters reset
    - **Verify:** Master checkbox state updates based on filtered results
24. Test batch selection system:
    - **Individual selection:** Click checkbox on a row - verify:
      - Row highlighted with blue background and left border
      - Counter updates: "1 selecionada(s)"
      - Publication form appears below table
      - Form auto-scrolls into view
    - **Select more:** Check additional rows - verify counter updates dynamically
    - **Deselect:** Uncheck a row - verify row highlighting removed, counter decreases
    - **Master checkbox:** Click header checkbox - verify:
      - All visible (filtered) rows selected
      - Counter shows correct total
      - Form appears
    - **"Selecionar Todas" button:** Click - verify all filtered propositions selected
    - **"Desmarcar Todas" button:** Click - verify:
      - All selections cleared
      - Counter shows "0 selecionada(s)"
      - Form disappears
      - Row highlighting removed
25. Test publication form (progressive disclosure):
    - Select at least one proposition - verify form appears
    - Verify form shows count: "Publicar X Proposição(ões)"
    - **Prazo de Comprovação field:**
      - Verify it's required (can't submit without it)
      - Enter a date - verify accepted
    - **Observações field:**
      - Type text - verify character counter updates in real-time
      - Type > 700 characters - verify counter turns yellow
      - Type > 900 characters - verify counter turns red
      - Verify max 1,000 characters enforced
    - **Cancel button:** Click - verify:
      - Confirmation dialog appears
      - If confirmed, selection cleared and form hidden
26. Test batch publication:
    - Select 3 propositions (mix of determinação and recomendação)
    - Fill prazo de comprovação: 30 days from today
    - Add observações: "Publicação de teste"
    - Click "Publicar X Proposição(ões)"
    - **Verify confirmation dialog:** Shows count and prazo date
    - Confirm publication
    - **Verify success message:** Mentions email notification
    - **Verify for EACH published proposition:**
      - Status changed to `['aguardando_comprovacao', valoracao]`
      - `prazoComprovacao` field set to defined date
      - `dataPublicacao` field set to today
      - New entry in `historico[]` array with:
        - tipo: 'publicacao'
        - data: today's date
        - usuario: 'Corregedoria Nacional'
        - descricao: mentions órgão correicionado
        - observacoes: "Publicação de teste"
        - prazoComprovacao: defined date
        - statusAnterior: `['pendente', *]`
        - statusNovo: `['aguardando_comprovacao', *]`
    - **Verify post-publication:**
      - Selection cleared (counter shows "0 selecionada(s)")
      - Form hidden
      - Table refreshed (published propositions removed from list)
      - Changes persisted to localStorage
27. Test view details action:
    - Click "👁️ Ver" button on a proposition
    - Verify detail modal opens with:
      - All proposition fields displayed
      - Bidimensional status badges
      - Prioridade with color coding
      - Complete timeline (if historico exists)
    - Close modal - verify returns to table
28. Test session persistence:
    - Login as admin and navigate to publicacao.html
    - Select correição, select some propositions
    - Refresh page (F5) - verify:
      - Auto-login works
      - Data loads correctly
      - Selection is cleared (expected behavior)
      - Can re-select and publish

**Publication Workflow Integration:**
29. Test complete publication-comprovação cycle:
    - As admin, publish propositions on publicacao.html
    - Verify propositions change to `aguardando_comprovacao`
    - Logout and login as user (correicionado)
    - Navigate to comprovacao page
    - **Verify published propositions appear in dropdown**
    - Submit comprovação for published proposition
    - Verify status changes to `em_analise`
30. Test republicação workflow:
    - Create proposition with status `['pendente', 'parcial']` (simulate failed evaluation)
    - Login as admin, go to publicacao.html
    - Select correição
    - **Verify proposition appears in pending list** (awaiting republicação)
    - Publish with NEW prazo
    - **Verify new publicacao entry in historico** (not replacing old one)
    - Verify status changes to `['aguardando_comprovacao', 'parcial']` (valoração preserved)

**Comprovacao Workflow:**
31. As user, access "Enviar Comprovação" page
32. Verify ONLY propositions with status `aguardando_comprovacao` appear in dropdown
    - Propositions with status `pendente` should NOT be available
33. Submit comprovação for aguardando_comprovacao proposition:
    - Verify status changes to `em_analise`
    - Verify comprovacao entry created with correct data in historico
    - Verify proposition appears in admin's evaluation queue
34. Test file selection and display in comprovacao form
35. Test draft (rascunho) functionality

**Avaliacao Workflow:**
36. As admin, access "Avaliar Comprovações" page
37. Verify propositions with status `em_analise` appear in table
38. Open evaluation modal and verify:
    - Latest comprovacao details displayed
    - All attached files listed
    - Complete historico (publicacoes, comprovacoes, avaliacoes) displayed
    - Decision form present
39. Submit evaluation as `parcial` or `inadimplente`:
    - **Verify status changes to `pendente`** (not parcial/inadimplente)
    - Verify avaliacao added to historico with actual decision (parcial/inadimplente)
    - Verify proposition appears in "Publicar Proposições" page (awaiting republicação)
    - Verify proposition does NOT appear in user's comprovacao dropdown
    - Verify correição status remains 'ativo' (has incomplete propositions)
40. Republish proposition with new prazoComprovacao:
    - Verify status changes to `aguardando_comprovacao`
    - Verify new publicacao entry in historico
    - Verify proposition now available for comprovação
41. Submit new comprovacao and evaluate as `adimplente`:
    - Verify full cycle completes
    - Verify historico shows complete timeline with multiple publicacoes
    - Verify correição status changes to 'inativo' if all propositions complete

**History & Timeline:**
42. View details of proposition with multiple publicacoes/comprovacoes/avaliacoes
43. Verify timeline displays chronologically
44. Verify color coding: orange (publicacao), blue (comprovacao), green (avaliacao)
45. Verify all data shown: dates, users, descriptions, files, status changes, prazoComprovação
46. Verify publicacao entries show prazo deadline

**Dashboard & Charts:**
47. Test dashboard correição filter:
    - Verify filter dropdown populates with available correições
    - Select "Todas as Correições" - verify shows aggregated statistics
    - Select specific correição - verify all 5 cards recalculate correctly
    - Verify both charts (Fluxo de Trabalho and Valoração) update dynamically
    - Test as admin - verify sees all correições in filter
    - Test as user - verify sees only correições from their ramoMP
48. Test dual-chart system:
    - **Fluxo de Trabalho chart:** Verify shows 4 bars (Pendente, Aguardando Comprovação, Em Análise, Encerrada)
    - **Valoração chart:** Verify shows 5 bars (Nova, Adimplente, Parcial, Inadimplente, Prejudicada)
    - Verify color coding matches badge system
    - Verify bars scale correctly based on data
    - Verify chart values match card counters
49. Test chart responsiveness:
    - Desktop (>768px): Verify charts display side-by-side in 2-column grid
    - Mobile (≤768px): Verify charts stack vertically in 1-column grid
    - Verify chart wrappers maintain consistent sizing
50. Verify all dashboard counters update after publicacao/comprovacao/avaliacao operations

**Correições Table - New Features:**
51. Test enhanced table structure:
    - Verify 13 columns displayed correctly
    - **Verify new columns:** Pendente, Em Análise, Prazo Vencido (replaced "Período")
    - Verify color highlighting: Pendente (yellow), Em Análise (blue), Prazo Vencido (red)
    - Verify font weight bold when count > 0
52. Test column sorting system:
    - **Número column:** Click header - verify sorts A-Z ascending, click again for Z-A descending
    - **Total de Proposições:** Click - verify sorts by count ascending/descending
    - **Pendente:** Click - verify sorts by pendente count
    - **Em Análise:** Click - verify sorts by em_analise count
    - **Prazo Vencido:** Click - verify sorts by prazo vencido count
    - Verify sort indicators: ⇅ (default) → ▲ (asc) → ▼ (desc)
    - Verify sortable headers show cursor pointer and hover effect
    - Switch between columns - verify previous sort indicator removed
53. Test status filter:
    - Select "Todas (ativas e inativas)" - verify shows all correições
    - Select "Apenas Ativas" - verify shows only correições with status 'ativo'
    - Select "Apenas Inativas" - verify shows only correições with status 'inativo'
    - Combine with text search - verify both filters work together (AND logic)
    - Combine with sorting - verify filter applies before sort
54. Test enhanced details modal:
    - Click "Ver" button on any correição
    - **Verify three organized sections:**
      1. Correição info (all metadata fields)
      2. Status Processual breakdown (4 counters with colors)
      3. Valoração breakdown (5 counters with colors)
    - Verify all 9 status types displayed with correct counts
    - Verify color coding matches badge system
    - Close modal - verify returns to table with sort/filter state preserved

**UI/UX:**
55. Test responsive layout at mobile breakpoint (768px)
56. Verify modals scroll properly with long history
57. Test responsive timeline on narrow screens
58. Test correições table with enhanced features:
    - **Desktop:** Verify 13 columns readable, sortable headers clickable, sort indicators visible
    - **Mobile:** Verify horizontal scroll works, touch interactions for sorting work properly
    - Verify status filter dropdown works on mobile
59. Test dashboard on different screen sizes:
    - **Desktop:** Verify 2-chart grid displays correctly side-by-side
    - **Tablet:** Verify charts resize appropriately
    - **Mobile:** Verify charts stack vertically, maintain readability
    - Verify correição filter dropdown works on all screen sizes
60. Test proposições page (proposicoes.html):
    - Verify 7-column table is readable on desktop
    - Test on mobile - verify action buttons wrap properly
    - Verify correição selector works on mobile
    - Test filters on narrow screens
61. Test publicação page (publicacao.html):
    - Verify 8-column table with checkboxes is readable on desktop
    - Test on mobile - verify checkboxes usable
    - Verify selection buttons work on mobile
    - Test publication form on mobile
    - Verify selected row highlighting visible on mobile
62. Test edit modal on mobile devices - verify form fields are usable

## Browser Compatibility Requirements

- ES6+ JavaScript (arrow functions, template literals, const/let)
- CSS Grid and Flexbox
- HTML5 form validation
- Canvas API (for charts)
- Modern browsers only (Chrome, Firefox, Safari, Edge - no IE11)

## Sample Data Overview

The system includes realistic sample data demonstrating all workflow states:

**Correições (5 total):**
- COR-2024-01 (MPBA) - 3 propositions - MPE/BA - Ordinária
  - Theme: Direitos fundamentais e meio ambiente
- COR-2024-02 (MPRJ) - 2 propositions - MPE/RJ - Extraordinária
  - Theme: Combate à corrupção e transparência pública
- COR-2024-03 (MPMG) - 2 propositions - MPE/MG - OCD
  - Theme: Gestão administrativa e recursos humanos
- COR-2024-04 (MPSP) - 2 propositions - MPE/SP - Inspeção
  - Theme: Inspeção de unidades regionais
- COR-2024-05 (MPU) - 0 propositions - MPU/DF,SP,RJ,MG,BA - Ordinária
  - Theme: Correição nacional sobre compliance e integridade
  - **Demonstrates multiple UF selection for MPU**

**Proposições (13 total) - Enhanced with tipo, unidade, membro fields:**

All propositions now include:
- **Tipo**: Either "Determinação" (mandatory) or "Recomendação" (advisory)
- **Unidade**: Specific MP unit responsible (e.g., Promotoria de Justiça de Cachoeira, Procuradoria-Geral)
- **Membro**: Assigned member name (e.g., Dr. João Silva Santos, Dra. Maria Oliveira Costa)

**Status Distribution:**
- **PROP-2024-0001** (adimplente) - Determinação | Procuradoria-Geral de Justiça | Dr. João Silva Santos
  - Tags: tecnologia, gestao-documental
  - Complete workflow with historico
- **PROP-2024-0002** (aguardando_comprovacao) - Recomendação | Promotoria de Justiça de Cachoeira | Dra. Maria Oliveira Costa
  - Tags: infraestrutura, compliance
  - Published and awaiting proof submission
- **PROP-2024-0003** (pendente) - Determinação | Corregedoria-Geral de Justiça | Dr. Carlos Eduardo Mendes
  - Tags: recursos-humanos, administrativo
  - Urgent priority - awaiting initial publication or republicação
- **PROP-2024-0004** (pendente) - Recomendação | Promotoria de Justiça de Caculé | Dra. Ana Paula Ferreira
  - Tags: financeiro, administrativo
  - Has historico with comprovacao and parcial evaluation - awaiting republicação
- **PROP-2024-0005** (pendente) - Determinação | Procuradoria-Geral de Justiça | Dr. Roberto Almeida Lima
  - Tags: compliance, administrativo
- **PROP-2024-0006** (pendente) - Recomendação | Promotoria de Justiça de Santo André | Dr. Fernando Souza Prado
  - Tags: capacitacao, recursos-humanos
- **PROP-2024-0007** (adimplente) - Determinação | Promotoria de Justiça de Osasco | Dra. Juliana Barbosa Reis
  - Tags: tecnologia, infraestrutura
- **PROP-2024-0008** (prejudicada) - Recomendação | Promotoria de Justiça de Niterói | Dr. Marcelo Tavares Cruz
  - Tags: administrativo, processual
- **PROP-2024-0009** (em_analise) - Determinação | Procuradoria-Geral de Justiça | Dra. Patricia Moreira Santos
  - Tags: gestao-documental, tecnologia, compliance
  - **IDEAL FOR TESTING EVALUATION WORKFLOW**
- **PROP-2024-0010** (aguardando_comprovacao) - Recomendação | Promotoria de Justiça de Itabuna
  - Tags: tecnologia, transparencia, compliance
- **PROP-2024-0011** (aguardando_comprovacao) - Determinação | Corregedoria-Geral de Justiça
  - Tags: compliance, administrativo, capacitacao
- **PROP-2024-0012** (aguardando_comprovacao) - Recomendação | Promotoria de Justiça de Feira de Santana
  - Tags: administrativo, processual, gestao-documental
- **PROP-2024-0013** (aguardando_comprovacao) - Determinação | Procuradoria-Geral de Justiça
  - Tags: tecnologia, compliance, administrativo
  - Urgent priority

**Testing Recommendation:**

**For Complete Workflow Testing:**
1. **Test Evaluation:** Use PROP-2024-0009 (em_analise) - evaluate as parcial/inadimplente to see it return to 'pendente'
2. **Test Republicação:** After step 1, republish PROP-2024-0009 from "Publicar Proposições" page with new prazoComprovacao
3. **Test Fresh Publication:** Publish PROP-2024-0003 or PROP-2024-0005 (both pendente, never published)
4. **Test Comprovação:** Submit comprovação for PROP-2024-0002 (aguardando_comprovacao)
5. **Verify Historico:** Check PROP-2024-0004 details to see historico with comprovacao + parcial evaluation before status changed to pendente

This sequence demonstrates the complete publication-gated workflow from both user and admin perspectives.
