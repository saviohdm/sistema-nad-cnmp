# Sistema de Acompanhamento de Proposições - CNMP

Aplicação web (prototípica) para acompanhar proposições oriundas de correições da Corregedoria Nacional do Ministério Público (CNMP) e do Núcleo de Acompanhamento de Decisões (NAD).

## 📋 Sobre o Projeto
- Cadastre correições e suas proposições, vinculando-as aos 27 MPs.
- Publique proposições, colete comprovações dos órgãos correicionados e avalie o cumprimento.
- Visualize histórico completo em timeline e monitore indicadores em dashboard.
- Perfil **admin**: corrigeções, proposições, publicação em lote, avaliação. Perfil **user**: envio/edição de comprovações e consulta.

## 🚀 Tecnologias
- **HTML5 + CSS3 + JavaScript (ES6+)** sem dependências, build ou npm.
- Estado em memória com persistência via `localStorage`.
- Layout e tema centralizados em `styles.css`; lógica compartilhada em `app.js`.

## 📦 Como Executar
```bash
# abrir diretamente
open index.html

# ou subir servidor local (recomendado)
python3 -m http.server 8000
# acessar http://localhost:8000
```

## 🗂️ Estrutura de Arquivos
- `index.html` – SPA principal (login, dashboard, correições, avaliação/ envio internos).
- `proposicoes.html` – listagem/gestão de proposições (seleção obrigatória de correição).
- `publicacao.html` – publicação em lote de proposições (apenas admin).
- `avaliacao.html` – avaliação de comprovações individuais.
- `comprovacao.html` – envio/rascunho de comprovações pelos órgãos.
- `styles.css` – tema, componentes, badges, tabelas, responsividade.
- `app.js` – dados iniciais, mutações com `localStorage`, renderizações, navegação.
- `CLAUDE.md` e `AGENTS.md` – guias para agentes e contribuidores.

## 🔄 Fluxos Principais
1. **Login**: qualquer usuário/senha; escolha perfil (`admin` ou `user`). Se user, selecionar ramo do MP.
2. **Dashboard**: cartões e dois gráficos (status processual e valoração) filtráveis por correição.
3. **Correições**: tabela com ordenação e filtros; modal detalhado com contadores.
4. **Proposições**: seleção de correição → filtros → visualizar/avaliar/editar.
5. **Publicação (admin)**: seleção de correição → seleção em lote → define prazo de comprovação → publica.
6. **Comprovação (user)**: abrir proposição → preencher, salvar rascunho ou enviar → volta para index.
7. **Avaliação (admin)**: abrir proposição → definir valoração/observações → histórico atualizado.

## 🏷️ Modelo de Dados (resumo)
- `correicoes[]`: id, numero, ramoMP/Nome, tematica, numeroElo, tipo, mp, uf[], status, datas.
- `proposicoes[]`: id, numero, correicaoId, tipo (determinacao/recomendacao), unidade, membro, prioridade, tags[], status `[statusProcessual, valoracao]`, prazoComprovacao, dataPublicacao, rascunhos, historico[].
- `historico[]`: itens de `publicacao`, `comprovacao` ou `avaliacao` (sempre anexar, nunca sobrescrever).

## 🎨 Customização
- Paleta no topo de `styles.css` (`--primary-color`, `--secondary-color`, `--success-color`, etc.). Reutilize badges e classes existentes ao ajustar estilos.

## 🔒 Aviso de Segurança
- Protótipo educacional: sem autenticação real, backend, upload ou validações server-side. Não usar em produção sem implementar segurança, persistência e controle de acesso.

## 🤝 Contribuindo
- Leia `AGENTS.md` (guia rápido) e `CLAUDE.md` (arquitetura detalhada).
- Siga o fluxo manual de testes dos perfis admin e user após mudanças.
- Use commits claros e descreva evidências de teste em PRs (páginas exercitadas). 
