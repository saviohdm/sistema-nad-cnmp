# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**CNMP Proposition Tracking System** - Standalone web app tracking judicial review proceedings (correições) and monitoring compliance across 27 Brazilian Public Ministry offices.

**Stack:** Pure HTML5, CSS3, vanilla JavaScript - zero dependencies/build tools.

## Architecture

### Files

**HTML Pages:**
- `index.html` - Main SPA (dashboard, correições list, forms)
- `proposicoes.html` - Standalone propositions management (~840 lines)
- `publicacao.html` - Batch publishing (admin-only, ~1,100 lines)
- `avaliacao.html` - Evaluation page (admin-only, 913 lines)
- `comprovacao.html` - Proof submission page (1,181 lines)

**Styles:**
- `styles.css` - Shared styles (~1,200 lines)

**JavaScript Modules (Modular DDD Architecture):**
- `app.js` - Core foundation (~1,300 lines)
  - Global variables: correicoes[], proposicoes[], currentUser, etc.
  - localStorage persistence (save/load)
  - Utility functions: text processing, date formatting, modals, navigation
  - Tags & badges rendering
  - Correições CRUD operations
  - Base filters: getFilteredCorreicoes(), getFilteredProposicoes()
  - Modals: viewDetails(), viewCorreicaoDetails()
  - Sorting & populate functions

- `js/domain-proposicoes.js` - **Core Domain** (~350 lines)
  - Status management (bidimensional: statusProcessual + valoração)
  - Normalization functions (backward compatibility)
  - Workflow transitions: publicação, comprovação, avaliação
  - Business rules and invariants
  - Prazo vencido validation

- `js/ui-dashboard-tables.js` - **Read Model** (~300 lines)
  - Dashboard: cards, Canvas charts (workflow + valoração)
  - Statistics calculation (getDashboardWorkflowStats, getDashboardValoracaoStats)
  - Ramo MP filtering
  - Membro Auxiliar dashboard
  - Table rendering functions (delegated to app.js for now)

- `js/export.js` - **Generic Services** (~800 lines)
  - Export menu control
  - JSON exports: Dashboard, Correições, Proposição Details
  - PDF exports: 3 levels (formatted reports with print dialogs)
  - Helper: getCorreicoesFiltradas()

**Script Loading Order (Critical):**
1. `app.js` - Loads first (defines globals and utils)
2. `domain-proposicoes.js` - Depends on app.js globals
3. `ui-dashboard-tables.js` - Depends on domain-proposicoes.js + app.js
4. `export.js` - Depends on all previous modules

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
    │   ├── statusProcessual: pendente_publicacao | aguardando_comprovacao | pendente_avaliacao | encerrada
    │   └── valoracao: sem_avaliacao | necessita_informacoes | satisfeita | prejudicada
    ├── tags[] (11 categories: administrativo, recursos-humanos, etc.)
    ├── rascunhosComprovacao[] (draft comprovacoes - user side)
    ├── rascunhosAvaliacao[] (draft avaliacoes - admin side)
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
- Status bidimensional: workflow state + compliance evaluation

**Status Processual (4 types):**
- `pendente_publicacao` - Awaiting publication or republication
- `aguardando_comprovacao` - Published, waiting for proof submission
- `pendente_avaliacao` - Proof submitted, awaiting evaluation
- `encerrada` - Process completed (final state)

**Valoração Status (4 types):**
- `sem_avaliacao` - Initial value, no evaluation yet
- `necessita_informacoes` - Requires additional information/action (returns to pendente_publicacao for republication)
- `satisfeita` - Fully compliant, requirements met (final state)
- `prejudicada` - Superseded or no longer applicable (final state)

### Key Patterns

**State Management:**
- Global: `correicoes[]`, `proposicoes[]` persisted in `localStorage`
- All mutations must update data + UI
- UI state: `dashboardCorreicaoFilter`, `correicoesSortColumn`, `correicoesSortDirection`, `correicoesStatusFilter`

**Navigation:**
- SPA routing: `showPage(pageId)` for internal pages
- Standalone pages redirect via `window.location.href`

**Data Flow:**
1. User action → data update
2. Historico entry added (if applicable)
3. Save to localStorage
4. Call render functions

**Correição Status:**
- Auto-calculated based on linked propositions
- `ativo` - has any proposition not satisfeita/prejudicada
- `inativo` - all propositions are satisfeita/prejudicada

**Draft System:**
Two independent draft types, each with ONE draft per proposition:

| Type | Array | Created By | Auto-loads In | Use Case |
|------|-------|------------|---------------|----------|
| **Comprovação** | `rascunhosComprovacao[]` | Correicionado | comprovacao.html | User prepares proof before submission |
| **Avaliação** | `rascunhosAvaliacao[]` | Admin/Assessor | avaliacao.html | Assessor drafts, corregedor reviews/submits |

**Draft Behavior:**
- Save: No status change, stored in array (replaces existing)
- Submit: Draft cleared, content moves to `historico[]`, status updated
- **Critical:** Drafts NEVER change proposition status

## Main Pages

### Dashboard (index.html)
- Correição filter dropdown (all/specific)
- 5 cards: Correições Realizadas, Ativas, Total Proposições, Ativas, Prazo Vencido
- Dual charts: Fluxo de Trabalho (4 bars), Valoração (4 bars)

### Correições Table
- 13 columns, 5 sortable (Número, Total, Pendente Publicação, Pendente Avaliação, Prazo Vencido)
- Status filter: all/ativo/inativo
- Details modal: 3 sections (info, status processual, valoração)

### Proposições Page (proposicoes.html)
- Mandatory correição selection → progressive disclosure
- 7-column table with filters: search, tipo, status, tags, prioridade
- Actions: Visualizar (modal), Avaliar (redirect), Editar (modal)

### Publicação Page (publicacao.html) - Admin Only
- Batch publication workflow with checkboxes
- Single `prazoComprovacao` for all selected
- On publish: status → aguardando_comprovacao, adds historico

### Avaliação Page (avaliacao.html) - Admin Only
- Shows: Proposição info, historico, current comprovacao
- Decision: necessita_informacoes | satisfeita | prejudicada
- Two actions: save draft or submit (see Draft System)

### Comprovação Page (comprovacao.html)
- Shows ONLY aguardando_comprovacao propositions
- Drag-drop file upload
- Two actions: save draft or submit (see Draft System)

### Data Export System
**5 locations with JSON/PDF exports:**
1. Dashboard - system-wide reporting
2. Correições Table - 3 levels (table, JSON, detailed)
3. Proposições Page - filtered view + timelines
4. Modal Details - individual proposition
5. Publicação Page - pendentes, selecionadas, ofício legal document

## NAD Workflow - Publication-Gated Comprovação

**Core Principle:** Every comprovação MUST be preceded by publication.

### Status Lifecycle
```
pendente_publicacao → [PUBLICAÇÃO] → aguardando_comprovacao → [COMPROVAÇÃO] → pendente_avaliacao
                                                                                      ↓
                                                                                 [AVALIAÇÃO]
                                                                                      ↓
                                                                  satisfeita/prejudicada (FIM)
                                                          necessita_informacoes (volta: pendente_publicacao)
```

### Workflow Steps

**1. Publication (publicacao.html):**
- Admin selects pendente_publicacao propositions (never-published + failed evaluations)
- Defines `prazoComprovacao`, creates `publicacao` historico entry
- Status: pendente_publicacao → aguardando_comprovacao

**2. Comprovação (comprovacao.html):**
- User saves draft or submits
- On submit: creates `comprovacao` historico entry, clears draft
- Status: aguardando_comprovacao → pendente_avaliacao

**3. Avaliação (avaliacao.html):**
- Admin saves draft or submits decision
- On submit: creates `avaliacao` historico entry, clears draft
- Decision: satisfeita/prejudicada (ends) OR necessita_informacoes (→ pendente_publicacao)

**4. Republicação:**
- Evaluations with necessita_informacoes return to pendente_publicacao
- New publication with new prazoComprovacao
- Cycle repeats until satisfeita/prejudicada

### Key Functions
- `carregarProposicoesParaPublicar()` - filters pendente_publicacao
- `publicarProposicoesSelecionadas()` - publishes, records historico
- `salvarRascunhoComprovacao()` - saves to `rascunhosComprovacao[]`
- `submitComprovacao()` - submits, clears draft, updates status
- `salvarRascunhoAvaliacao()` - saves to `rascunhosAvaliacao[]`
- `submitAvaliacao()` - submits, clears draft, updates status
- `viewDetails()` - renders timeline (color-coded)

## Important Constraints

1. **MP Branches:** 27 hardcoded - do not modify without request
2. **Status Types:** Adding requires updates to CSS, filters, functions, charts
3. **Correição-Proposição Link:** Every proposição needs valid correicaoId
4. **Date Format:** ISO (YYYY-MM-DD) in data, DD/MM/YYYY display
5. **Historico:** Never mutate, always append with `.push()`
6. **Tags:** 11 predefined, optional, stored as ID arrays
7. **UF Selection:** MPE=single, MPU=multiple states
8. **Drafts:**
   - Two separate arrays (`rascunhosComprovacao[]`, `rascunhosAvaliacao[]`)
   - Only ONE draft of each type per proposition (replace, not append)
   - Never cross-store between arrays
   - Cleared on submit, content moves to historico

## UI Components

**Modals:**
- `viewDetails(id)` - proposition with timeline
- `viewCorreicaoDetails(id)` - correição with statistics
- Toggle `.hidden`, close with `closeModal()`

**Badges:**
- Status: `badge badge-${status}` - bidimensional display (processual + valoração)
- Tags: `tag-badge tag-${tagId}` - 11 color schemes

**Tables:**
- Render: `data.filter().map(item => html).join('')`
- Sorting: toggle direction, update indicators
- Selection: `.row-selected` class

## Authentication
- Two types: admin (Corregedoria), user (Órgão Correicionado)
- No real auth - prototype only
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
2. Filter dropdown
3. `getStatusLabel()` function
4. Dashboard counters
5. Chart data + barWidth

### Adding Page
**Internal:** Nav item + page div + `showPage()` case
**Standalone:** .html file + nav redirect + session management

### Modifying Data Model
1. Update `initializeSampleData()`
2. Form HTML + handler
3. Table rendering
4. Detail modal
5. Filters/search

### Adding Tag
1. `availableTags` array
2. CSS class `.tag-{id}`
3. Auto-appears everywhere

## Testing Guidelines

**Core Workflows:**
1. Login (admin/user), verify menu visibility
2. Create correição with all fields, MP/UF selection
3. Create proposição with correição link
4. Test all filters and modals

**Draft System:**
5. Save comprovação draft → verify `rascunhosComprovacao[]` array
6. Edit draft → verify auto-load on page load
7. Submit → verify draft cleared, historico created, status changed
8. Save avaliação draft → verify `rascunhosAvaliacao[]` array
9. Edit draft → verify auto-load
10. Submit → verify draft cleared, historico created

**Publication/Workflow:**
11. Batch publication with prazo → verify status change
12. Submit comprovação → verify pendente_avaliacao
13. Evaluate as necessita_informacoes → verify returns to pendente_publicacao
14. Republish → verify new historico entry

**Complete Cycle:**
15. pendente_publicacao → publish → aguardando_comprovacao
16. Save draft → edit → submit → pendente_avaliacao
17. Save avaliação draft → edit → submit necessita_informacoes → pendente_publicacao
18. Republish → full timeline with multiple cycles

**UI/Export:**
19. Dashboard filter, dual charts, responsive layout
20. Correições table sorting, status filter
21. Export from 5 locations (JSON/PDF)
22. Mobile: horizontal scroll, touch sorting

## Browser Compatibility
- ES6+ JavaScript, CSS Grid/Flexbox, HTML5 validation, Canvas API
- Modern browsers only (no IE11)

## Sample Data
**5 Correições:** COR-2024-01 to COR-2024-05 (various tipos, MP levels)
**13 Proposições:** Mix of statuses, tags, priorities
- PROP-2024-0009 (pendente_avaliacao) - ideal for testing evaluation
- PROP-2024-0004 (pendente_publicacao) - has historico with necessita_informacoes evaluation

**Testing Tip:**
1. Evaluate PROP-2024-0009 as necessita_informacoes → returns to pendente_publicacao
2. Republish with new prazo → aguardando_comprovacao
3. Save comprovação draft → edit → submit → pendente_avaliacao
4. Save avaliação draft → edit → evaluate as satisfeita → complete
5. View historico → see full timeline with drafts and submissions
