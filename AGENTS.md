# Repository Guidelines

## Project Structure & Module Organization
- Core UI pages: `index.html` (dashboard + correições SPA), `proposicoes.html`, `publicacao.html`, `avaliacao.html`, `comprovacao.html` (standalone flows fed by `localStorage`).
- Shared styling in `styles.css`; shared logic in `app.js` (chart rendering, data mutations, navigation helpers). Each standalone page also embeds small inline scripts for its workflow.
- Assets live at the repo root; there is no `src/` or build output. Keep new assets flat and referenced with relative paths.

## Build, Test, and Development Commands
- Run directly in a browser for quickest feedback: `open index.html`.
- Recommended local server for CORS-safe testing and navigation between pages: `python3 -m http.server 8000` then visit `http://localhost:8000`.
- No package install, bundler, or transpiler is used—avoid adding dependencies unless agreed with maintainers.

## Coding Style & Naming Conventions
- Keep to plain HTML5, CSS3, and vanilla ES6+. Indentation is 4 spaces; prefer double quotes in HTML attributes and JS strings for consistency with existing files.
- Reuse the existing CSS variable palette (`styles.css`: `--primary-color`, `--secondary-color`, etc.) and badge classes instead of introducing new colors.
- Data lives in in-memory arrays persisted to `localStorage`; mutations must update both the data arrays and the related render functions.
- Functions and IDs are in lowerCamelCase; keep Portuguese UI copy and labels consistent with current wording.

## Testing Guidelines
- Manual regression is required (there are no automated tests). Validate both profiles: admin (full menu) and user (restricted menu).
- Core flows to verify after changes: login, dashboard stats/cards, correições table sorting/filtering, proposições listing and detail modal, publication batch flow, comprovacao submission (save/submit), avaliação submission, and redirects back to `index.html`.
- Clear `localStorage` between scenarios when testing data migrations or structure changes to avoid stale state.
- When altering status logic, confirm charts and badges render the expected counts and colors.

## Commit & Pull Request Guidelines
- Use concise, imperative commits in English or Portuguese (e.g., `Add timeline badges for publicacao`).
- PRs should describe scope, rationale, and test evidence (which pages were exercised and under which profile). Include screenshots or short notes for UI-visible changes.
- Link issues when available and call out any data shape changes (localStorage keys/fields) so reviewers can reset data if needed.
- Avoid mixing refactors with behavior changes in the same PR; keep diffs page-scoped when possible.

## Security & Data Notes
- This is an educational prototype: there is no real auth, backend, or file upload. Do not add sensitive data to the repo.
- Preserve the bidimensional status model `[statusProcessual, valoracao]` and always append to `historico` rather than mutating past entries.
