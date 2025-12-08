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
    ├── tipo, unidade, membro
    ├── descricao, prioridade
    ├── prazoComprovacao, dataPublicacao
    ├── status: 'pendente' | 'aguardando_comprovacao' | 'em_analise' | 'adimplente' | 'parcial' | 'inadimplente' | 'prejudicada'
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

**Important:** Propositions no longer have a generic "prazo" field. The only relevant deadline is `prazoComprovacao`, which is set when the proposition is published and enters the `aguardando_comprovacao` status.

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
- Color-coded markers: publicacao (orange), comprovacao (blue), avaliacao (green)
- Bordered content boxes matching interaction type
- File attachments and status badges within timeline items
- Publications display prazoComprovacao deadline

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
│ aguardando_comprovacao                                       │
│ - Disponível para comprovação pelo correicionado            │
│ - Tem prazoComprovacao definido                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    [COMPROVAÇÃO]
          (correicionado envia evidências)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ em_analise                                                   │
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

**Publication Workflow:**
12. As admin, access "Publicar Proposições" page
13. Select correição and verify propositions with status `pendente` appear:
    - Both never-published propositions
    - Propositions awaiting republicação (after parcial/inadimplente evaluation)
14. Publish selected propositions with prazoComprovacao:
    - Verify status changes to `aguardando_comprovacao`
    - Verify publicacao entry added to historico with prazoComprovacao
    - Verify propositions now appear in user's comprovacao dropdown

**Comprovacao Workflow:**
15. As user, access "Enviar Comprovação" page
16. Verify ONLY propositions with status `aguardando_comprovacao` appear in dropdown
    - Propositions with status `pendente` should NOT be available
17. Submit comprovação for aguardando_comprovacao proposition:
    - Verify status changes to `em_analise`
    - Verify comprovacao entry created with correct data in historico
    - Verify proposition appears in admin's evaluation queue
18. Test file selection and display in comprovacao form
19. Test draft (rascunho) functionality

**Avaliacao Workflow:**
20. As admin, access "Avaliar Comprovações" page
21. Verify propositions with status `em_analise` appear in table
22. Open evaluation modal and verify:
    - Latest comprovacao details displayed
    - All attached files listed
    - Complete historico (publicacoes, comprovacoes, avaliacoes) displayed
    - Decision form present
23. Submit evaluation as `parcial` or `inadimplente`:
    - **Verify status changes to `pendente`** (not parcial/inadimplente)
    - Verify avaliacao added to historico with actual decision (parcial/inadimplente)
    - Verify proposition appears in "Publicar Proposições" page (awaiting republicação)
    - Verify proposition does NOT appear in user's comprovacao dropdown
    - Verify correição status remains 'ativo' (has incomplete propositions)
24. Republish proposition with new prazoComprovacao:
    - Verify status changes to `aguardando_comprovacao`
    - Verify new publicacao entry in historico
    - Verify proposition now available for comprovação
25. Submit new comprovacao and evaluate as `adimplente`:
    - Verify full cycle completes
    - Verify historico shows complete timeline with multiple publicacoes
    - Verify correição status changes to 'inativo' if all propositions complete

**History & Timeline:**
26. View details of proposition with multiple publicacoes/comprovacoes/avaliacoes
27. Verify timeline displays chronologically
28. Verify color coding: orange (publicacao), blue (comprovacao), green (avaliacao)
29. Verify all data shown: dates, users, descriptions, files, status changes, prazoComprovacao
30. Verify publicacao entries show prazo deadline

**Dashboard & Charts:**
31. Verify dashboard cards include "Em Análise" counter
32. Verify chart displays 6 bars (adimplente, pendente, em_analise, parcial, inadimplente, prejudicada)
33. Verify all counters update after publicacao/comprovacao/avaliacao operations
34. Note: After workflow refinement, 'parcial' and 'inadimplente' bars should show 0 (these become 'pendente')

**UI/UX:**
35. Test responsive layout at mobile breakpoint (768px)
36. Verify modals scroll properly with long history
37. Test responsive timeline on narrow screens
38. Test correições table with many columns - verify horizontal scroll if needed
39. Test proposições table with new columns (tipo, unidade, membro) - verify readability

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
