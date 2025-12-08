# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **CNMP (Conselho Nacional do Ministério Público) Proposition Tracking System** - a standalone web application for tracking judicial review proceedings (correições) and monitoring compliance with remedial propositions across Brazilian Public Ministry offices (27 MP branches).

**Technology Stack:** Pure HTML5, CSS3, and vanilla JavaScript - zero dependencies, zero build tools.

## Architecture

### Single-File Design
The entire application resides in `index.html` (~1,900 lines, ~75KB):
- **Lines 1-657:** HTML structure and embedded CSS (includes timeline styles)
- **Lines 658-1000:** HTML page layouts and components
- **Lines 1001-1891:** JavaScript application logic

### Data Model Hierarchy
```
Correição (Judicial Review)
├── id, numero, ramoMP, ramoMPNome
├── tematica, numeroElo, tipo, mp, uf[], status
├── dataInicio, dataFim, observacoes
└── Proposições (many)
    ├── id, numero, correicaoId
    ├── descricao, prazo, prioridade
    ├── status: 'pendente' | 'em_analise' | 'adimplente' | 'parcial' | 'inadimplente' | 'prejudicada'
    ├── tags[] (array of tag IDs for categorization)
    └── historico[] (array of interactions)
        ├── tipo: 'comprovacao' | 'avaliacao'
        ├── data (ISO timestamp)
        ├── usuario (string: MP branch or 'Corregedoria Nacional')
        ├── descricao (text)
        ├── observacoes (optional text)
        ├── arquivos[] (array of filenames - comprovacao only)
        ├── statusAnterior (status before - avaliacao only)
        └── statusNovo (status after - avaliacao only)
```

**Critical Relationships:**
- Proposições are ALWAYS linked to their parent Correição via `correicaoId`
- Every interaction (comprovacao/avaliacao) is stored in proposicao.historico array
- Timeline preserves complete audit trail of all status changes

**Correição Extended Fields:**
- `tematica` (string): Textual description of the review's theme (e.g., "Correição de direitos fundamentais e meio ambiente")
- `numeroElo` (string): ELO system identifier in format NNNNNNN-DD.AAAA.J.TT.OOOO (e.g., "1234567-89.2024.1.01.0001")
- `tipo` (string): Review type - one of: 'Ordinária', 'Extraordinária', 'OCD', 'Inspeção'
- `mp` (string): MP level - 'MPE' (state-level) or 'MPU' (federal-level)
- `uf` (array): Brazilian state codes (e.g., ['BA'] for MPE, ['DF', 'SP', 'RJ'] for MPU)
  - Single selection for MPE (one state)
  - Multiple selection for MPU (multiple states)
- `status` (string): Auto-calculated - 'ativo' (has pending propositions) or 'inativo' (all propositions completed)

### Key Architectural Patterns

**State Management:**
- Global arrays: `correicoes[]` and `proposicoes[]`
- In-memory only - no persistence (resets on refresh)
- All state mutations must update both data arrays and UI

**Page Navigation:**
- Manual SPA routing via `showPage(pageId)` function
- Pages: dashboard, correicoes, proposicoes, enviar, avaliar (admin-only), cadastroCorreicao (admin-only), cadastro (admin-only)
- Navigation state managed through `.hidden` CSS class

**Data Flow Pattern:**
1. User action triggers event (form submit, button click)
2. Data array updated (correicoes/proposicoes)
3. Historico entry added to proposicao (for comprovacoes/avaliacoes)
4. Multiple render functions called to sync UI:
   - `updateDashboard()` - updates statistics cards and chart
   - `renderProposicoesTable()` - refreshes propositions table
   - `renderCorreicoesTable()` - refreshes reviews table
   - `renderAvaliacaoTable()` - refreshes evaluation queue (admin only)
   - `populateCorreicaoFilter()` - updates filter dropdowns
   - `populateCorreicaoIdSelect()` - updates form selects
   - `populateProposicaoSelect()` - updates proposition dropdowns

**Critical:** When adding/modifying propositions or correições, you MUST call ALL relevant render functions to maintain UI consistency. When adding comprovacoes or avaliacoes, you MUST append to proposicao.historico array.

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
- Color-coded markers for comprovacao (blue) and avaliacao (green)
- Bordered content boxes matching interaction type
- File attachments and status badges within timeline items

### Authentication (lines 1074-1096)
- Two user types: "admin" (Corregedoria Nacional) and "user" (Órgão Correicionado)
- Admin sees all menu items; users have cadastro pages hidden
- No real authentication - accepts any credentials (prototype)

### Chart Rendering (lines 1209-1273)
Custom canvas-based bar chart implementation:
- Renders 6 status bars: adimplente, pendente, em_analise, parcial, inadimplente, prejudicada
- Dynamically calculates bar width based on 6 categories
- Auto-scales height based on max value
- Color-coded bars matching badge system

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
- `viewDetails(id)` - shows proposição details with:
  - Linked correição info
  - Complete historical timeline of comprovacoes and avaliacoes
  - Color-coded timeline markers and content boxes
- `viewCorreicaoDetails(id)` - shows correição with aggregated proposition statistics
- `abrirAvaliacaoModal(id)` - admin-only modal for evaluating comprovacoes:
  - Shows last comprovacao details
  - Form to select decision (adimplente/parcial/inadimplente/prejudicada)
  - Parecer (justification) textarea
- Modals populate innerHTML and toggle `.hidden` class
- Close with `closeModal()` or `closeAvaliacaoModal()`

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

## Common Modification Scenarios

### Adding a New Status
1. Add CSS badge class (`.badge-newstatus`)
2. Add option to `#statusFilter` dropdown
3. Update `getStatusLabel()` function
4. Add to dashboard counter logic
5. Add to chart data object and colors/labels
6. Adjust chart barWidth calculation for new count

### Adding a New Page
1. Add nav item in sidebar with `onclick="showPage('newpage')"`
2. Create page div with `id="newpagePage"` and class `page hidden`
3. Add case handling in `showPage()` function if special logic needed
4. If admin-only, add ID and hide logic in login handler

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

The system implements the complete NAD (Núcleo de Acompanhamento de Decisões) iterative workflow:

### Status Lifecycle
```
pendente → [comprovacao] → em_analise → [avaliacao] → adimplente/parcial/inadimplente/prejudicada
                                                             ↓           ↓          ↓
                                                             END    [new cycle]  [new cycle]
```

### Workflow Steps

**Step 1: Correicionado Submits Comprovacao** (lines 1543-1586)
- User selects proposition with status: pendente, inadimplente, or parcial
- Provides description of compliance actions taken
- Attaches supporting documents (PDF, DOC, images)
- System creates comprovacao entry in historico array
- Status automatically changes to `em_analise`
- Corregedoria Nacional is notified (via UI queue)

**Step 2: Corregedoria Evaluates** (lines 1843-1881)
- Admin accesses "Avaliar Comprovações" page
- Views list of propositions with status `em_analise`
- Opens evaluation modal showing:
  - Proposition details
  - Latest comprovacao with all attachments
  - Previous history
- Selects decision:
  - `adimplente` - fully compliant (cycle ends)
  - `parcial` - partially compliant (returns to queue)
  - `inadimplente` - non-compliant (returns to queue)
  - `prejudicada` - proposition superseded (cycle ends)
- Provides written justification (parecer)
- System creates avaliacao entry in historico
- Status updates to selected decision

**Step 3: Iterative Cycle**
- If status is `inadimplente` or `parcial`:
  - Proposition returns to correicionado's queue
  - Correicionado can submit new comprovacao
  - Cycle repeats until `adimplente` or `prejudicada`
- Complete audit trail preserved in historico array

### Key Functions

**Comprovacao Submission:**
- `populateProposicaoSelect()` - filters propositions needing comprovacao
- Comprovacao form submit handler adds to historico, sets status to `em_analise`

**Avaliacao Process:**
- `renderAvaliacaoTable()` - shows queue of propositions awaiting evaluation
- `abrirAvaliacaoModal(id)` - opens evaluation interface
- `submitAvaliacao(proposicaoId)` - records decision and updates status

**History Display:**
- `viewDetails(id)` - renders complete timeline with all comprovacoes and avaliacoes
- Timeline CSS provides visual differentiation between interaction types

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
6. Test all filters - text search (including tematica, numeroElo, tipo), status, correição, tags
7. View correição details modal - verify all new fields displayed correctly

**Tag System:**
8. Create new proposição with tags selected:
   - Verify checkboxes work in cadastro form
   - Verify tags appear in table and detail modal
   - Verify tag badges render with correct colors
9. Test tag filter:
   - Filter by different tags
   - Verify only propositions with selected tag appear
10. Verify tags persist when editing/viewing propositions

**Comprovacao Workflow:**
11. As user, submit comprovação for pendente proposition:
   - Verify status changes to `em_analise`
   - Verify historico entry created with correct data
   - Verify proposition appears in admin's evaluation queue
12. Test file selection and display in comprovacao form

**Avaliacao Workflow:**
13. As admin, access "Avaliar Comprovações" page
14. Verify propositions with status `em_analise` appear in table
15. Open evaluation modal and verify:
    - Latest comprovacao details displayed
    - All attached files listed
    - Decision form present
16. Submit evaluation as `inadimplente`:
    - Verify status updates
    - Verify avaliacao added to historico
    - Verify proposition returns to user's comprovacao queue
    - Verify correição status remains 'ativo' (has incomplete propositions)
17. Submit new comprovacao and evaluate as `adimplente`:
    - Verify full cycle completes
    - Verify historico shows complete timeline
    - Verify correição status changes to 'inativo' if all propositions complete

**History & Timeline:**
18. View details of proposition with multiple comprovacoes/avaliacoes
19. Verify timeline displays chronologically
20. Verify color coding (blue for comprovacao, green for avaliacao)
21. Verify all data shown: dates, users, descriptions, files, status changes

**Dashboard & Charts:**
22. Verify dashboard cards include "Em Análise" counter
23. Verify chart displays 6 bars (including em_analise)
24. Verify all counters update after comprovacao/avaliacao operations

**UI/UX:**
25. Test responsive layout at mobile breakpoint (768px)
26. Verify modals scroll properly with long history
27. Test responsive timeline on narrow screens
28. Test correições table with many columns - verify horizontal scroll if needed

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

**Proposições (9 total) - Status Distribution:**
- **PROP-2024-0001** (adimplente) - Complete workflow example with full historico
  - Tags: tecnologia, gestao-documental
  - 1 comprovacao + 1 avaliacao showing successful completion
- **PROP-2024-0002** (pendente) - Fresh proposition awaiting initial comprovacao
  - Tags: infraestrutura, compliance
- **PROP-2024-0003** (inadimplente) - Deadline passed, needs urgent action
  - Tags: recursos-humanos, administrativo
- **PROP-2024-0004** (parcial) - Partial compliance example with historico
  - Tags: financeiro, administrativo
  - Shows comprovacao evaluated as partially compliant
- **PROP-2024-0005** (pendente) - High priority pending
  - Tags: compliance, administrativo
- **PROP-2024-0006** (pendente) - Normal priority pending
  - Tags: capacitacao, recursos-humanos
- **PROP-2024-0007** (adimplente) - Completed without historico (legacy data)
  - Tags: tecnologia, infraestrutura
- **PROP-2024-0008** (prejudicada) - Superseded by new legislation
  - Tags: administrativo, processual
  - Shows avaliacao marking proposition as prejudicada with justification
- **PROP-2024-0009** (em_analise) - **IDEAL FOR TESTING EVALUATION WORKFLOW**
  - Tags: gestao-documental, tecnologia, compliance
  - Has comprovacao awaiting Corregedoria evaluation
  - Appears in "Avaliar Comprovações" queue
  - Use this to test the complete admin evaluation process

**Testing Recommendation:**
Start with PROP-2024-0009 to test the evaluation workflow, then test creating new comprovacoes for PROP-2024-0002 or PROP-2024-0003 to experience the complete cycle from both user and admin perspectives.
