# Especificação de Requisitos Funcionais
## Sistema de Acompanhamento de Proposições - CNMP

**Versão:** 1.0
**Data:** 10/12/2025
**Projeto:** Sistema NAD - Núcleo de Acompanhamento de Decisões
**Organização:** Conselho Nacional do Ministério Público (CNMP)

---

## Histórico de Revisões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 10/12/2025 | Documentação Técnica | Parte 2.1 - Introdução, Autenticação e Dashboard |
| 1.1 | 10/12/2025 | Documentação Técnica | Parte 2.2 - Gestão de Correições e Proposições |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Requisitos Funcionais](#2-requisitos-funcionais)
   - 2.1 [RF-AUTH: Autenticação e Controle de Acesso](#21-rf-auth-autenticação-e-controle-de-acesso)
   - 2.2 [RF-DASH: Dashboard Executivo](#22-rf-dash-dashboard-executivo)
   - 2.3 [RF-COR: Gestão de Correições](#23-rf-cor-gestão-de-correições) *(A elaborar)*
   - 2.4 [RF-PROP: Gestão de Proposições](#24-rf-prop-gestão-de-proposições) *(A elaborar)*
   - 2.5 [RF-PUB: Publicação de Proposições](#25-rf-pub-publicação-de-proposições) *(A elaborar)*
   - 2.6 [RF-COMP: Comprovação](#26-rf-comp-comprovação) *(A elaborar)*
   - 2.7 [RF-AVAL: Avaliação](#27-rf-aval-avaliação) *(A elaborar)*
   - 2.8 [RF-BUSCA: Busca e Filtros](#28-rf-busca-busca-e-filtros) *(A elaborar)*
   - 2.9 [RF-EXP: Exportação de Dados](#29-rf-exp-exportação-de-dados) *(A elaborar)*
   - 2.10 [RF-HIST: Histórico e Auditoria](#210-rf-hist-histórico-e-auditoria) *(A elaborar)*
   - 2.11 [RF-NOTIF: Notificações](#211-rf-notif-notificações) *(A elaborar)*
3. [Casos de Uso Detalhados](#3-casos-de-uso-detalhados) *(A elaborar)*
4. [Regras de Negócio Consolidadas](#4-regras-de-negócio-consolidadas) *(A elaborar)*
5. [Matriz de Rastreabilidade](#5-matriz-de-rastreabilidade) *(A elaborar)*

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica todos os requisitos funcionais do **Sistema de Acompanhamento de Proposições** do Conselho Nacional do Ministério Público (CNMP). O objetivo é fornecer à equipe de desenvolvimento uma descrição completa e inequívoca de todas as funcionalidades que o sistema deve implementar.

**Público-alvo:**
- Equipe de desenvolvimento da fábrica de software
- Analistas de sistemas e arquitetos
- Equipe de testes e qualidade
- Gerentes de projeto
- Stakeholders técnicos do CNMP

### 1.2 Escopo

Este documento cobre os requisitos funcionais de todos os módulos do sistema:
- Autenticação e controle de acesso
- Dashboard executivo com indicadores e gráficos
- Gestão de correições (CRUD completo)
- Gestão de proposições (CRUD completo)
- Workflow de publicação de proposições
- Workflow de comprovação de cumprimento
- Workflow de avaliação de comprovações
- Sistema de busca e filtros avançados
- Sistema de exportação de dados (JSON/PDF)
- Sistema de histórico e auditoria
- Sistema de notificações

**Não estão cobertos neste documento:**
- Requisitos não-funcionais (performance, segurança, etc.) - ver documento específico
- Especificações de interface (wireframes, design) - ver documento específico
- Arquitetura técnica do sistema - ver documento de arquitetura
- Modelo de dados - ver `modelo_de_dados.md`

### 1.3 Convenções do Documento

#### 1.3.1 Identificadores de Requisitos

Cada requisito funcional possui um identificador único no formato:

**RF-[MÓDULO]-[NÚMERO]**

Exemplos:
- `RF-AUTH-001` - Primeiro requisito do módulo de autenticação
- `RF-DASH-005` - Quinto requisito do módulo de dashboard
- `RF-COR-012` - Décimo segundo requisito do módulo de correições

#### 1.3.2 Prioridades

Cada requisito é classificado com uma das seguintes prioridades:

| Prioridade | Sigla | Descrição |
|------------|-------|-----------|
| **Essencial** | [E] | Requisito crítico para o MVP. Sistema não funciona sem ele. |
| **Importante** | [I] | Requisito necessário para operação completa. Pode ser entregue em Fase 2. |
| **Desejável** | [D] | Requisito que agrega valor mas não é essencial. Pode ser entregue em fases posteriores. |

#### 1.3.3 Estrutura de Cada Requisito

Cada requisito funcional é documentado com a seguinte estrutura:

**RF-XXX-NNN: [Nome do Requisito]**
- **Prioridade:** [E/I/D]
- **Descrição:** Descrição detalhada do requisito
- **Entrada:** Dados de entrada necessários
- **Processamento:** Lógica de processamento a ser executada
- **Saída:** Resultado esperado
- **Regras de Negócio:** Referências a regras aplicáveis (RN-XXX)
- **Critérios de Aceite:** Condições que devem ser satisfeitas para considerar o requisito implementado

#### 1.3.4 Referências a Outros Documentos

- **[VIS]** - Documento de Visão do Produto (`visao_do_produto.md`)
- **[MD]** - Modelo de Dados (`modelo_de_dados.md`)
- **[RN]** - Regra de Negócio (definida no modelo de dados ou neste documento)
- **[UC]** - Caso de Uso (definido na seção 3 deste documento)

### 1.4 Visão Geral

O Sistema de Acompanhamento de Proposições implementa um workflow completo de gestão de correições e proposições com três atores principais:

**Atores:**
1. **Administrador (Corregedoria Nacional)** - Gerencia correições, publica proposições, avalia comprovações
2. **Usuário (MP Correicionado)** - Visualiza proposições, envia comprovações
3. **Sistema** - Executa operações automáticas (cálculo de status, notificações, etc.)

**Fluxo Principal:**
```
1. Admin cadastra Correição
2. Admin cadastra e publica Proposições para MP
3. MP recebe notificação e visualiza Proposição
4. MP prepara e envia Comprovação
5. Admin recebe notificação e avalia Comprovação
6. Sistema registra decisão e atualiza status
7. Se parcial/inadimplente: retorna ao passo 2 (republicação)
8. Se adimplente/prejudicada: ciclo encerrado
```

---

## 2. Requisitos Funcionais

### 2.1 RF-AUTH: Autenticação e Controle de Acesso

#### RF-AUTH-001: Login de Usuário

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve permitir que usuários autentiquem-se através de seleção de MP e senha.
- **Entrada:**
  - MP selecionado (dropdown com 27 opções + "Corregedoria Nacional")
  - Senha (campo texto, tipo password)
- **Processamento:**
  1. Validar que MP foi selecionado
  2. Validar que senha foi preenchida
  3. Verificar credenciais no banco de dados
  4. Se válido: criar sessão de usuário
  5. Se inválido: exibir mensagem de erro
- **Saída:**
  - Sucesso: Redirecionamento para dashboard + sessão criada
  - Falha: Mensagem "Credenciais inválidas. Tente novamente."
- **Regras de Negócio:**
  - RN-AUTH-01: Senha deve ter mínimo 8 caracteres
  - RN-AUTH-02: Após 5 tentativas falhas, bloquear conta por 15 minutos
  - RN-AUTH-03: Sessão expira após 8 horas de inatividade
- **Critérios de Aceite:**
  - ✓ Admin consegue fazer login selecionando "Corregedoria Nacional"
  - ✓ Usuário consegue fazer login selecionando seu MP (ex: "MPBA")
  - ✓ Credenciais inválidas exibem mensagem de erro clara
  - ✓ Após login bem-sucedido, usuário é redirecionado para dashboard
  - ✓ Sessão persiste ao navegar entre páginas

---

#### RF-AUTH-002: Logout de Usuário

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve permitir que usuários encerrem sua sessão de forma segura.
- **Entrada:** Clique no botão "Sair" no menu de usuário
- **Processamento:**
  1. Destruir sessão atual
  2. Limpar dados de autenticação (localStorage/sessionStorage)
  3. Redirecionar para página de login
- **Saída:** Usuário redirecionado para tela de login sem sessão ativa
- **Regras de Negócio:**
  - RN-AUTH-04: Logout deve limpar todos os tokens de sessão
  - RN-AUTH-05: Após logout, botão "Voltar" do navegador não deve restaurar sessão
- **Critérios de Aceite:**
  - ✓ Botão "Sair" visível em todas as páginas autenticadas
  - ✓ Após logout, tentativa de acessar páginas protegidas redireciona para login
  - ✓ Dados sensíveis são limpos do navegador

---

#### RF-AUTH-003: Controle de Acesso por Perfil

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve controlar o acesso às funcionalidades baseado no perfil do usuário (Admin ou Usuário).
- **Entrada:** Perfil do usuário autenticado
- **Processamento:**
  1. Identificar perfil do usuário na sessão
  2. Renderizar menu lateral com itens permitidos para o perfil
  3. Bloquear acesso direto a URLs restritas
- **Saída:** Interface personalizada conforme perfil
- **Regras de Negócio:**
  - RN-AUTH-06: Perfil Admin tem acesso total
  - RN-AUTH-07: Perfil Usuário tem acesso restrito (sem páginas de cadastro, publicação e avaliação)
  - RN-AUTH-08: Tentativa de acesso não autorizado deve redirecionar para página apropriada com mensagem
- **Critérios de Aceite:**
  - ✓ **Admin vê no menu:** Dashboard, Correições, Proposições, Publicar, Avaliar, Cadastro de Correição, Cadastro de Proposição
  - ✓ **Usuário vê no menu:** Dashboard, Correições, Proposições, Enviar Comprovação
  - ✓ Usuário tentando acessar `/publicacao.html` é redirecionado para `index.html` com erro
  - ✓ Usuário tentando acessar `/avaliacao.html` é redirecionado para `index.html` com erro

---

#### RF-AUTH-004: Filtragem de Dados por Perfil

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve filtrar dados exibidos conforme o perfil do usuário.
- **Entrada:** Perfil e ramoMP do usuário autenticado
- **Processamento:**
  1. Se perfil = Admin: exibir todos os dados
  2. Se perfil = Usuário: exibir apenas dados do seu ramoMP
- **Saída:** Listas e dropdowns filtrados
- **Regras de Negócio:**
  - RN-AUTH-09: Admin visualiza todas as correições de todos os MPs
  - RN-AUTH-10: Usuário visualiza apenas correições onde `correicao.ramoMP = usuario.ramoMP`
  - RN-AUTH-11: Usuário visualiza apenas proposições vinculadas às suas correições
- **Critérios de Aceite:**
  - ✓ Admin logado vê todas as 27 correições cadastradas
  - ✓ Usuário MPBA logado vê apenas correições onde `ramoMP = 'MPBA'`
  - ✓ Filtros em dashboards e dropdowns respeitam regra de visibilidade
  - ✓ API backend valida permissões (não apenas frontend)

---

#### RF-AUTH-005: Persistência de Sessão

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve manter a sessão do usuário ativa entre navegações e recarregamentos de página.
- **Entrada:** Token de sessão armazenado localmente
- **Processamento:**
  1. Ao carregar qualquer página, verificar existência de sessão válida
  2. Se sessão válida: restaurar contexto do usuário
  3. Se sessão inválida ou expirada: redirecionar para login
- **Saída:** Usuário permanece autenticado durante navegação normal
- **Regras de Negócio:**
  - RN-AUTH-03: Sessão expira após 8 horas de inatividade
  - RN-AUTH-12: Sessão não deve expirar se usuário estiver ativo
  - RN-AUTH-13: Token deve ser renovado a cada interação
- **Critérios de Aceite:**
  - ✓ Recarregar página (F5) não desloga usuário
  - ✓ Navegar entre páginas mantém sessão ativa
  - ✓ Após 8 horas sem interação, próximo acesso requer novo login
  - ✓ Fechar e reabrir navegador mantém sessão (se dentro do prazo)

---

#### RF-AUTH-006: Identificação de Usuário na Interface

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve exibir claramente a identidade do usuário logado na interface.
- **Entrada:** Dados do usuário autenticado (ramoMP, ramoMPNome)
- **Processamento:**
  1. Renderizar área de usuário no cabeçalho
  2. Exibir nome do MP e perfil (Admin/Usuário)
  3. Incluir botão de logout
- **Saída:** Box de usuário visível no topo direito da interface
- **Regras de Negócio:** N/A
- **Critérios de Aceite:**
  - ✓ Nome completo do MP exibido (ex: "MPBA - Ministério Público do Estado da Bahia")
  - ✓ Badge de perfil visível (ex: "Administrador" ou "Usuário")
  - ✓ Botão "Sair" acessível no mesmo componente
  - ✓ Componente visível em todas as páginas autenticadas

---

### 2.2 RF-DASH: Dashboard Executivo

#### RF-DASH-001: Visualização de Indicadores Principais

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir 5 cards de indicadores principais no dashboard com dados em tempo real.
- **Entrada:** Filtro de correição selecionado (ou "Todas")
- **Processamento:**
  1. Buscar todas as correições e proposições aplicando filtro de correição
  2. Aplicar filtro de perfil do usuário (Admin vê tudo, Usuário vê apenas seu MP)
  3. Calcular 5 métricas:
     - **Correições Realizadas:** COUNT(correicoes)
     - **Correições Ativas:** COUNT(correicoes WHERE status='ativo')
     - **Total de Proposições:** COUNT(proposicoes)
     - **Proposições Ativas:** COUNT(proposicoes WHERE statusProcessual != 'encerrada')
     - **Prazo Vencido:** COUNT(proposicoes WHERE statusProcessual='aguardando_comprovacao' AND prazoComprovacao < HOJE)
  4. Renderizar cards com valores e ícones
- **Saída:** 5 cards exibidos em grid responsivo
- **Regras de Negócio:**
  - RN-DASH-01: Cálculos devem refletir estado atual do banco de dados
  - RN-DASH-02: Se filtro de correição ativo, apenas dados dessa correição são considerados
  - RN-DASH-03: Card "Prazo Vencido" deve ter destaque visual (vermelho) se valor > 0
- **Critérios de Aceite:**
  - ✓ Cards exibidos em ordem: Correições Realizadas, Ativas, Total Proposições, Ativas, Prazo Vencido
  - ✓ Ícones apropriados: 🏛️, 🔄, 📄, 🔥, ⚠️
  - ✓ Valores atualizados ao mudar filtro de correição
  - ✓ Card "Prazo Vencido" com fundo vermelho se > 0
  - ✓ Layout responsivo: 5 colunas desktop, 2 colunas tablet, 1 coluna mobile

---

#### RF-DASH-002: Filtro de Dashboard por Correição

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve permitir filtrar todos os dados do dashboard por uma correição específica.
- **Entrada:**
  - Dropdown de correições (opção padrão: "Todas as Correições")
  - Correições listadas conforme perfil do usuário
- **Processamento:**
  1. Ao carregar dashboard, popular dropdown com correições disponíveis
  2. Ao selecionar correição:
     - Armazenar filtro no estado da aplicação
     - Recalcular todos os indicadores
     - Redesenhar ambos os gráficos
  3. Ao selecionar "Todas as Correições":
     - Limpar filtro
     - Exibir dados agregados
- **Saída:** Dashboard atualizado refletindo o filtro aplicado
- **Regras de Negócio:**
  - RN-DASH-04: Dropdown deve listar apenas correições visíveis ao usuário (conforme perfil)
  - RN-DASH-05: Filtro deve persistir ao navegar entre páginas do dashboard
  - RN-DASH-06: Ao cadastrar nova correição, dropdown deve ser atualizado
- **Critérios de Aceite:**
  - ✓ Dropdown posicionado acima dos cards de indicadores
  - ✓ Primeira opção é "Todas as Correições" (padrão selecionado)
  - ✓ Admin vê todas as correições no dropdown
  - ✓ Usuário vê apenas correições do seu MP
  - ✓ Ao selecionar correição específica, cards e gráficos atualizam dinamicamente
  - ✓ Indicador visual de filtro ativo (ex: badge "Filtro: COR-2024-01")

---

#### RF-DASH-003: Gráfico de Fluxo de Trabalho

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir gráfico de barras mostrando distribuição de proposições por status processual.
- **Entrada:** Proposições filtradas (por correição e perfil)
- **Processamento:**
  1. Contar proposições por statusProcessual:
     - Pendente
     - Aguardando Comprovação
     - Em Análise
     - Encerrada
  2. Calcular largura proporcional das barras (base 100%)
  3. Renderizar gráfico com 4 barras coloridas verticalmente
- **Saída:** Gráfico de barras verticais com título "Fluxo de Trabalho"
- **Regras de Negócio:**
  - RN-DASH-07: Cores devem seguir padrão:
    - Pendente: amarelo (#ffc107)
    - Aguardando Comprovação: laranja escuro (#ff8c00)
    - Em Análise: azul (#0066cc)
    - Encerrada: azul escuro (#003366)
  - RN-DASH-08: Altura da barra proporcional ao valor (escala automática)
  - RN-DASH-09: Exibir rótulo com número absoluto acima de cada barra
- **Critérios de Aceite:**
  - ✓ Gráfico exibido no lado esquerdo do grid de gráficos
  - ✓ 4 barras verticais com cores distintas
  - ✓ Rótulos claros: "Pendente (4)", "Aguardando Comprovação (5)", etc.
  - ✓ Gráfico atualiza ao mudar filtro de correição
  - ✓ Eixo Y escala automaticamente baseado no valor máximo
  - ✓ Legenda ou tooltip ao passar mouse sobre barra

---

#### RF-DASH-004: Gráfico de Valoração

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir gráfico de barras mostrando distribuição de proposições por valoração.
- **Entrada:** Proposições filtradas (por correição e perfil)
- **Processamento:**
  1. Contar proposições por valoracao:
     - Nova
     - Adimplente
     - Parcial
     - Inadimplente
     - Prejudicada
  2. Calcular largura proporcional das barras (base 100%)
  3. Renderizar gráfico com 5 barras coloridas verticalmente
- **Saída:** Gráfico de barras verticais com título "Valoração"
- **Regras de Negócio:**
  - RN-DASH-10: Cores devem seguir padrão:
    - Nova: cinza (#6c757d)
    - Adimplente: verde (#28a745)
    - Parcial: laranja (#ffa500)
    - Inadimplente: vermelho (#dc3545)
    - Prejudicada: cinza escuro (#495057)
  - RN-DASH-11: Altura da barra proporcional ao valor (escala automática)
  - RN-DASH-12: Exibir rótulo com número absoluto acima de cada barra
- **Critérios de Aceite:**
  - ✓ Gráfico exibido no lado direito do grid de gráficos
  - ✓ 5 barras verticais com cores distintas
  - ✓ Rótulos claros: "Nova (8)", "Adimplente (2)", "Parcial (1)", etc.
  - ✓ Gráfico atualiza ao mudar filtro de correição
  - ✓ Eixo Y escala automaticamente baseado no valor máximo
  - ✓ Legenda ou tooltip ao passar mouse sobre barra

---

#### RF-DASH-005: Layout Responsivo de Gráficos

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve adaptar o layout dos gráficos conforme tamanho da tela.
- **Entrada:** Resolução da tela do usuário
- **Processamento:**
  1. Detectar largura da janela do navegador
  2. Se > 768px: renderizar gráficos lado a lado (2 colunas)
  3. Se ≤ 768px: renderizar gráficos empilhados (1 coluna)
- **Saída:** Layout de gráficos adaptado ao dispositivo
- **Regras de Negócio:**
  - RN-DASH-13: Breakpoint mobile: 768px
  - RN-DASH-14: Gráficos devem manter proporções legíveis em qualquer resolução
- **Critérios de Aceite:**
  - ✓ Desktop (1920x1080): gráficos lado a lado, cada um 50% largura
  - ✓ Tablet (768x1024): gráficos lado a lado
  - ✓ Mobile (375x667): gráficos empilhados verticalmente, 100% largura cada
  - ✓ Redimensionar janela atualiza layout dinamicamente
  - ✓ Gráficos permanecem legíveis em todas as resoluções

---

#### RF-DASH-006: Atualização Dinâmica do Dashboard

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve atualizar automaticamente o dashboard após operações que alterem dados.
- **Entrada:** Evento de alteração de dados (cadastro, edição, publicação, avaliação)
- **Processamento:**
  1. Detectar operação que alterou dados
  2. Recalcular todos os indicadores
  3. Redesenhar gráficos
  4. Atualizar contadores
- **Saída:** Dashboard refletindo estado atual sem necessidade de refresh manual
- **Regras de Negócio:**
  - RN-DASH-15: Atualização deve ocorrer ao voltar para página do dashboard
  - RN-DASH-16: Atualização não deve causar flicker perceptível na interface
- **Critérios de Aceite:**
  - ✓ Após cadastrar correição, contador "Correições Realizadas" incrementa
  - ✓ Após publicar proposição, contadores e gráficos atualizam
  - ✓ Após avaliar comprovação, gráfico de Valoração atualiza
  - ✓ Transição visual suave (sem flash)
  - ✓ Filtro de correição mantém estado após atualização

---

#### RF-DASH-007: Navegação Rápida a partir de Indicadores

- **Prioridade:** [D] Desejável
- **Descrição:** O sistema deve permitir navegação direta ao clicar em cards de indicadores.
- **Entrada:** Clique em card de indicador
- **Processamento:**
  1. Identificar card clicado
  2. Navegar para página relevante com filtro aplicado
  3. Exemplos:
     - "Prazo Vencido" → Proposições filtradas por prazo vencido
     - "Correições Ativas" → Correições filtradas por status ativo
- **Saída:** Navegação para lista filtrada
- **Regras de Negócio:**
  - RN-DASH-17: Filtro aplicado deve ser visualmente claro na página destino
  - RN-DASH-18: Usuário deve poder limpar filtro facilmente
- **Critérios de Aceite:**
  - ✓ Cards são clicáveis (cursor pointer ao hover)
  - ✓ Clicar em "Prazo Vencido" abre página de Proposições com filtro ativo
  - ✓ Badge visual indica filtro aplicado (ex: "Filtro: Prazo Vencido")
  - ✓ Botão "Limpar Filtro" disponível

---

### 2.3 RF-COR: Gestão de Correições

#### RF-COR-001: Cadastro de Nova Correição

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve permitir ao administrador cadastrar uma nova correição com todos os campos obrigatórios e opcionais.
- **Entrada:** Formulário com 12 campos:
  - Número (texto, obrigatório)
  - Ramo do MP (dropdown 27 MPs, obrigatório)
  - Temática (textarea, opcional)
  - Número ELO (texto com máscara, opcional)
  - Tipo (dropdown: Ordinária/Extraordinária/OCD/Inspeção, obrigatório)
  - MP (radio: MPE/MPU, obrigatório)
  - UF (select: single para MPE, multiple para MPU, obrigatório)
  - Data Início (date, obrigatório)
  - Data Fim (date, opcional)
  - Observações (textarea 5000 caracteres, opcional)
- **Processamento:**
  1. Validar todos os campos obrigatórios
  2. Validar formato do Número ELO (NNNNNNN-DD.AAAA.J.TT.OOOO)
  3. Validar que Data Fim ≥ Data Início (se preenchida)
  4. Validar UF: 1 para MPE, ≥1 para MPU
  5. Gerar ID único sequencial
  6. Definir status inicial como 'ativo' (default)
  7. Salvar no banco de dados
  8. Atualizar listas e dropdowns no sistema
- **Saída:**
  - Sucesso: Mensagem "Correição cadastrada com sucesso!" + redirect para tabela
  - Falha: Mensagem de erro específica do campo inválido
- **Regras de Negócio:**
  - [MD] RN-COR-01: Campo `numero` deve ser único
  - [MD] RN-COR-02: Número ELO deve seguir formato específico
  - [MD] RN-COR-03: MPE → 1 UF obrigatório
  - [MD] RN-COR-04: MPU → múltiplos UFs permitidos
  - [MD] RN-COR-06: Data Fim ≥ Data Início
  - [MD] RN-COR-07: UF deve ser código válido (27 estados)
- **Critérios de Aceite:**
  - ✓ Formulário renderizado com todos os campos
  - ✓ Validação HTML5 funciona (campos required)
  - ✓ Dropdown UF muda comportamento: MPE=single, MPU=multiple
  - ✓ Número duplicado exibe erro: "Este número já existe"
  - ✓ Número ELO inválido exibe erro com formato esperado
  - ✓ Após salvar, correição aparece na tabela imediatamente
  - ✓ Dropdown de correições em outras páginas é atualizado

---

#### RF-COR-002: Listagem de Correições em Tabela

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir todas as correições em tabela de 13 colunas com dados completos e indicadores visuais.
- **Entrada:** Filtros aplicados (busca, status) e ordem de classificação
- **Processamento:**
  1. Buscar correições do banco aplicando filtro de perfil
  2. Aplicar filtro de busca textual (se preenchido)
  3. Aplicar filtro de status (se selecionado)
  4. Aplicar ordenação conforme coluna clicada
  5. Para cada correição, calcular estatísticas de proposições:
     - Total de proposições
     - Pendente (statusProcessual='pendente')
     - Em Análise (statusProcessual='em_analise')
     - Prazo Vencido (statusProcessual='aguardando_comprovacao' AND prazoComprovacao < HOJE)
  6. Renderizar linhas da tabela
- **Saída:** Tabela HTML com 13 colunas:
  1. Número
  2. Temática
  3. Número ELO
  4. Tipo
  5. MP
  6. UF
  7. Ramo do MP
  8. Total de Proposições
  9. Pendente (amarelo se > 0)
  10. Em Análise (azul se > 0)
  11. Prazo Vencido (vermelho se > 0)
  12. Status (badge ativo/inativo)
  13. Ações (botão "Ver")
- **Regras de Negócio:**
  - RN-COR-08: Colunas Pendente, Em Análise, Prazo Vencido devem ter destaque visual se > 0
  - RN-COR-09: Status é calculado automaticamente (não editável pelo usuário)
  - RN-COR-10: Admin vê todas, Usuário vê apenas do seu MP
- **Critérios de Aceite:**
  - ✓ Tabela exibe todas as 13 colunas
  - ✓ UF array renderizado como string separada por vírgula (ex: "DF, SP, RJ")
  - ✓ Colunas Pendente/Em Análise/Prazo Vencido com cor e negrito quando > 0
  - ✓ Badge de status com cores: ativo=verde, inativo=cinza
  - ✓ Botão "Ver" abre modal de detalhes
  - ✓ Tabela responsiva (scroll horizontal em mobile)

---

#### RF-COR-003: Ordenação de Tabela por Colunas

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve permitir ordenar a tabela de correições clicando em cabeçalhos de 5 colunas específicas.
- **Entrada:** Clique em cabeçalho de coluna ordenável
- **Processamento:**
  1. Identificar coluna clicada
  2. Verificar direção atual (sem ordem / asc / desc)
  3. Se sem ordem: aplicar ordem ascendente
  4. Se asc: inverter para descendente
  5. Se desc: voltar para ascendente
  6. Re-renderizar tabela com nova ordem
  7. Atualizar indicadores visuais (▲/▼)
- **Saída:** Tabela reordenada + indicador visual de ordenação
- **Regras de Negócio:**
  - RN-COR-11: Colunas ordenáveis: Número, Total de Proposições, Pendente, Em Análise, Prazo Vencido
  - RN-COR-12: Apenas uma coluna pode estar ordenada por vez
  - RN-COR-13: Ordenação persiste ao aplicar filtros
- **Critérios de Aceite:**
  - ✓ Cabeçalhos ordenáveis mostram ícone ⇅ (hover)
  - ✓ Cabeçalho ativo mostra ▲ (asc) ou ▼ (desc)
  - ✓ Clicar em "Número" ordena alfabeticamente (COR-2024-01, COR-2024-02...)
  - ✓ Clicar em "Total de Proposições" ordena numericamente
  - ✓ Clicar em "Prazo Vencido" mostra correições com mais prazos vencidos primeiro
  - ✓ Cursor pointer em cabeçalhos ordenáveis

---

#### RF-COR-004: Filtro de Correições por Status

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve permitir filtrar a tabela de correições por status (ativo/inativo).
- **Entrada:** Dropdown com 3 opções:
  - "Todas (ativas e inativas)" - padrão
  - "Apenas Ativas"
  - "Apenas Inativas"
- **Processamento:**
  1. Ao mudar seleção do dropdown:
  2. Armazenar filtro no estado
  3. Filtrar lista de correições conforme valor
  4. Re-renderizar tabela
  5. Manter ordenação e busca textual aplicadas
- **Saída:** Tabela exibindo apenas correições do status selecionado
- **Regras de Negócio:**
  - RN-COR-14: Filtro de status trabalha em conjunto (AND) com busca textual
  - RN-COR-15: Contador de resultados deve refletir quantidade filtrada
- **Critérios de Aceite:**
  - ✓ Dropdown posicionado acima da tabela
  - ✓ Opção padrão é "Todas (ativas e inativas)"
  - ✓ Selecionar "Apenas Ativas" mostra apenas status=ativo
  - ✓ Selecionar "Apenas Inativas" mostra apenas status=inativo
  - ✓ Contador exibe: "Exibindo X de Y correições"
  - ✓ Filtro funciona em conjunto com busca textual

---

#### RF-COR-005: Busca Textual de Correições

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve permitir busca textual em múltiplos campos das correições.
- **Entrada:** Campo de texto com placeholder "Buscar por número, MP, temática..."
- **Processamento:**
  1. Capturar texto digitado (com debounce de 300ms)
  2. Normalizar texto (lowercase, remover acentos)
  3. Filtrar correições onde texto aparece em:
     - numero
     - ramoMP
     - ramoMPNome
     - tematica
     - numeroElo
     - tipo
  4. Re-renderizar tabela
  5. Manter filtro de status e ordenação
- **Saída:** Tabela exibindo apenas correições que correspondem à busca
- **Regras de Negócio:**
  - RN-COR-16: Busca é case-insensitive
  - RN-COR-17: Busca ignora acentuação
  - RN-COR-18: Busca funciona em conjunto (AND) com filtro de status
  - RN-COR-19: Busca vazia exibe todas as correições (respeitando filtros)
- **Critérios de Aceite:**
  - ✓ Campo de busca posicionado acima da tabela
  - ✓ Ícone de lupa no campo
  - ✓ Buscar "MPBA" encontra correições do MPBA
  - ✓ Buscar "meio ambiente" encontra correições com esta temática
  - ✓ Buscar "ordinária" encontra correições do tipo Ordinária
  - ✓ Contador mostra quantidade de resultados encontrados
  - ✓ Limpar campo restaura lista completa

---

#### RF-COR-006: Visualização de Detalhes da Correição

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir modal com detalhes completos da correição e estatísticas de proposições.
- **Entrada:** Clique no botão "Ver" em qualquer linha da tabela
- **Processamento:**
  1. Identificar ID da correição clicada
  2. Buscar dados completos da correição
  3. Buscar todas as proposições vinculadas
  4. Calcular estatísticas por status processual (4 categorias)
  5. Calcular estatísticas por valoração (5 categorias)
  6. Renderizar modal com 3 seções organizadas
- **Saída:** Modal com:
  - **Seção 1: Informações da Correição**
    - Todos os 12 campos exibidos
  - **Seção 2: Status Processual**
    - Pendente, Aguardando Comprovação, Em Análise, Encerrada (com contadores coloridos)
  - **Seção 3: Valoração**
    - Nova, Adimplente, Parcial, Inadimplente, Prejudicada (com contadores coloridos)
- **Regras de Negócio:**
  - RN-COR-20: Cores dos contadores devem seguir padrão de badges
  - RN-COR-21: Valores zero devem ser exibidos (não ocultar)
  - RN-COR-22: UF array deve ser formatado como lista legível
- **Critérios de Aceite:**
  - ✓ Modal ocupa ~70% da largura da tela
  - ✓ Botão "X" fecha o modal
  - ✓ Seções visualmente separadas com títulos
  - ✓ Contadores de status processual com 4 valores
  - ✓ Contadores de valoração com 5 valores
  - ✓ Cores alinhadas com badges do sistema
  - ✓ Clicar fora do modal também fecha

---

#### RF-COR-007: Cálculo Automático de Status da Correição

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve calcular automaticamente o status da correição (ativo/inativo) baseado no estado de suas proposições.
- **Entrada:** Estado atual de todas as proposições vinculadas à correição
- **Processamento:**
  1. Buscar todas as proposições da correição
  2. Verificar valoração de cada proposição
  3. Se existe pelo menos 1 proposição com valoração != (adimplente OU prejudicada):
     - Status = 'ativo'
  4. Se todas as proposições têm valoração = (adimplente OU prejudicada):
     - Status = 'inativo'
  5. Se não há proposições vinculadas:
     - Status = 'ativo' (default)
  6. Atualizar campo status no banco
- **Saída:** Campo `status` da correição atualizado
- **Regras de Negócio:**
  - [MD] RN-COR-05: Status é calculado, nunca editado manualmente
  - RN-COR-23: Recálculo deve ocorrer após qualquer alteração em proposição
  - RN-COR-24: Recálculo deve ocorrer após avaliação de comprovação
  - RN-COR-25: Correição sem proposições é considerada 'ativo'
- **Critérios de Aceite:**
  - ✓ Cadastrar correição sem proposições → status = 'ativo'
  - ✓ Avaliar última proposição como 'adimplente' → status = 'inativo'
  - ✓ Publicar nova proposição em correição inativa → status volta para 'ativo'
  - ✓ Avaliar proposição como 'parcial' → status permanece 'ativo'
  - ✓ Não existe interface para editar status manualmente

---

#### RF-COR-008: Validação de Campos no Cadastro

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve validar todos os campos do formulário de correição antes de salvar.
- **Entrada:** Dados preenchidos no formulário
- **Processamento:**
  1. **Validações obrigatórias:**
     - Número: não vazio, único no sistema
     - Ramo do MP: selecionado
     - Tipo: selecionado
     - MP: selecionado (MPE ou MPU)
     - UF: pelo menos 1 selecionado
     - Data Início: preenchida, formato válido
  2. **Validações opcionais (se preenchidas):**
     - Número ELO: formato NNNNNNN-DD.AAAA.J.TT.OOOO
     - Data Fim: ≥ Data Início
     - Observações: ≤ 5.000 caracteres
  3. **Validações de consistência:**
     - Se MP=MPE: exatamente 1 UF
     - Se MP=MPU: pelo menos 1 UF
  4. Exibir erros específicos por campo
- **Saída:**
  - Válido: Salvar dados
  - Inválido: Exibir mensagens de erro abaixo dos campos
- **Regras de Negócio:**
  - [MD] RN-COR-01 a RN-COR-07 (ver modelo de dados)
  - RN-COR-26: Validação deve ocorrer no frontend E backend
  - RN-COR-27: Mensagens de erro devem ser claras e orientativas
- **Critérios de Aceite:**
  - ✓ Tentar salvar sem número exibe: "Campo obrigatório"
  - ✓ Número duplicado exibe: "Este número já existe no sistema"
  - ✓ Número ELO inválido exibe: "Formato esperado: NNNNNNN-DD.AAAA.J.TT.OOOO"
  - ✓ Data Fim anterior a Data Início exibe: "Data fim deve ser posterior à data início"
  - ✓ MPE com 2 UFs selecionados exibe: "MPE deve ter apenas 1 estado"
  - ✓ Observações > 5.000 caracteres exibe contador vermelho + erro
  - ✓ Validações também ocorrem no backend (não apenas frontend)

---

#### RF-COR-009: Edição de Correição Existente

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve permitir ao administrador editar uma correição existente.
- **Entrada:**
  - Ação: Botão "Editar" no modal de detalhes ou na linha da tabela
  - Formulário pré-preenchido com dados atuais
- **Processamento:**
  1. Abrir formulário de edição
  2. Preencher campos com valores atuais
  3. Permitir alteração de todos os campos exceto:
     - ID (imutável)
     - Status (calculado automaticamente)
  4. Validar alterações (mesmas regras de cadastro)
  5. Salvar alterações no banco
  6. Atualizar todas as visualizações
- **Saída:**
  - Sucesso: "Correição atualizada com sucesso!"
  - Falha: Mensagem de erro específica
- **Regras de Negócio:**
  - RN-COR-28: Editar correição não altera proposições vinculadas
  - RN-COR-29: Todas as validações de cadastro se aplicam
  - RN-COR-30: Não é possível editar correição se usuário não tiver permissão (apenas admin)
- **Critérios de Aceite:**
  - ✓ Botão "Editar" visível apenas para admin
  - ✓ Formulário abre pré-preenchido
  - ✓ Alterar temática e salvar atualiza na tabela
  - ✓ Não é possível alterar status manualmente
  - ✓ Validações funcionam igual ao cadastro
  - ✓ Após salvar, modal de detalhes reflete mudanças

---

#### RF-COR-010: Exclusão de Correição

- **Prioridade:** [D] Desejável
- **Descrição:** O sistema deve permitir excluir correição que não possua proposições vinculadas.
- **Entrada:** Botão "Excluir" no modal de detalhes ou linha da tabela
- **Processamento:**
  1. Verificar se correição possui proposições vinculadas
  2. Se possui: exibir erro e bloquear exclusão
  3. Se não possui:
     - Exibir confirmação: "Tem certeza que deseja excluir a correição [numero]?"
     - Se confirmar: excluir do banco
     - Se cancelar: manter correição
  4. Atualizar listas e dropdowns
- **Saída:**
  - Sucesso: "Correição excluída com sucesso!"
  - Bloqueado: "Não é possível excluir correição com proposições vinculadas"
- **Regras de Negócio:**
  - [MD] RI-02: Não permitir excluir correição com proposições vinculadas
  - RN-COR-31: Exclusão é permanente (não há lixeira)
  - RN-COR-32: Apenas admin pode excluir
  - RN-COR-33: Exclusão requer confirmação explícita
- **Critérios de Aceite:**
  - ✓ Botão "Excluir" visível apenas para admin
  - ✓ Tentar excluir correição com proposições exibe erro claro
  - ✓ Excluir correição sem proposições funciona após confirmação
  - ✓ Dialog de confirmação com botões "Cancelar" e "Confirmar Exclusão"
  - ✓ Após exclusão, correição não aparece mais em nenhuma lista

---

### 2.4 RF-PROP: Gestão de Proposições

#### RF-PROP-001: Cadastro de Nova Proposição

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve permitir ao administrador cadastrar uma nova proposição vinculada a uma correição.
- **Entrada:** Formulário com 9 campos:
  - Número (texto, obrigatório, único)
  - Correição (dropdown, obrigatório)
  - Tipo (dropdown: Determinação/Recomendação, obrigatório)
  - Unidade (texto 200 chars, obrigatório)
  - Membro (texto 200 chars, obrigatório)
  - Descrição (textarea 5000 chars, obrigatório)
  - Prioridade (dropdown: urgente/alta/normal, obrigatório, default: normal)
  - Tags (checkboxes múltiplas, 11 opções, opcional)
- **Processamento:**
  1. Validar todos os campos obrigatórios
  2. Validar que correição existe
  3. Validar que número é único
  4. Gerar ID único sequencial
  5. Definir status inicial: ['pendente', 'nova']
  6. Inicializar arrays vazios: historico=[], rascunhos=[]
  7. Definir prazoComprovacao=null, dataPublicacao=null
  8. Salvar no banco de dados
  9. Recalcular status da correição vinculada
  10. Atualizar dropdowns e listas
- **Saída:**
  - Sucesso: "Proposição cadastrada com sucesso!" + redirect
  - Falha: Mensagem de erro específica
- **Regras de Negócio:**
  - [MD] RN-PROP-01: Número deve ser único
  - [MD] RN-PROP-02: Toda proposição deve estar vinculada a correição válida
  - [MD] RN-PROP-03: Status inicial sempre ['pendente', 'nova']
  - [MD] RN-PROP-09: Tags devem conter apenas valores predefinidos (11 tags)
  - [MD] RN-PROP-10: Descrição limitada a 5.000 caracteres
- **Critérios de Aceite:**
  - ✓ Formulário renderizado com todos os campos
  - ✓ Dropdown de correição lista apenas correições disponíveis conforme perfil
  - ✓ Dropdown de tipo mostra apenas 2 opções
  - ✓ Checkboxes de tags exibem 11 opções com cores distintas
  - ✓ Número duplicado exibe erro claro
  - ✓ Contador de caracteres para descrição (verde→amarelo→vermelho)
  - ✓ Após salvar, proposição aparece em todas as listagens
  - ✓ Status da correição vinculada é recalculado

---

#### RF-PROP-002: Página Dedicada de Proposições

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir página standalone (proposicoes.html) para visualização e gestão de proposições.
- **Entrada:** Clique em "Proposições" no menu lateral
- **Processamento:**
  1. Redirecionar para `proposicoes.html`
  2. Carregar dados de localStorage
  3. Restaurar sessão do usuário
  4. Exibir estado inicial: placeholder "Selecione uma Correição"
  5. Ocultar filtros e tabela até seleção de correição
- **Saída:** Página dedicada com:
  - Sidebar com navegação
  - Breadcrumb "← Voltar para Dashboard"
  - Dropdown de seleção de correição (obrigatório)
  - Área de filtros (oculta inicialmente)
  - Tabela de proposições (oculta inicialmente)
- **Regras de Negócio:**
  - RN-PROP-01: Seleção de correição é obrigatória para visualizar proposições
  - RN-PROP-02: Página é standalone (não modal)
  - RN-PROP-03: Dados carregados de localStorage
  - RN-PROP-04: Sessão persiste entre navegações
- **Critérios de Aceite:**
  - ✓ Clicar em "Proposições" no menu redireciona para proposicoes.html
  - ✓ Página carrega independentemente do index.html
  - ✓ Placeholder visível antes de selecionar correição
  - ✓ Breadcrumb funcional retorna para index.html
  - ✓ Sessão do usuário restaurada automaticamente
  - ✓ Recarregar página (F5) mantém sessão

---

#### RF-PROP-003: Seleção Obrigatória de Correição

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exigir seleção de correição antes de exibir proposições.
- **Entrada:** Dropdown de correições no topo da página
- **Processamento:**
  1. Popular dropdown com correições disponíveis (conforme perfil)
  2. Incluir opção vazia: "Selecione uma correição..."
  3. Ao selecionar correição:
     - Buscar dados da correição
     - Exibir painel informativo (temática, período, total proposições)
     - Mostrar área de filtros
     - Renderizar tabela com proposições vinculadas
  4. Ao desselecionar (voltar para opção vazia):
     - Ocultar painel, filtros e tabela
     - Mostrar placeholder novamente
- **Saída:**
  - Sem seleção: Placeholder visível
  - Com seleção: Painel info + filtros + tabela visíveis
- **Regras de Negócio:**
  - RN-PROP-05: Progressive disclosure (mostrar informação progressivamente)
  - RN-PROP-06: Filtros só aparecem após seleção de correição
  - RN-PROP-07: Tabela só mostra proposições da correição selecionada
- **Critérios de Aceite:**
  - ✓ Estado inicial: placeholder "Selecione uma Correição" + filtros/tabela ocultos
  - ✓ Selecionar correição: painel info aparece + filtros/tabela aparecem
  - ✓ Painel info mostra: temática, período (dataInicio-dataFim), total de proposições
  - ✓ Desselecionar correição: volta para estado inicial
  - ✓ Dropdown lista apenas correições do perfil do usuário

---

#### RF-PROP-004: Tabela Simplificada de 7 Colunas

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir proposições em tabela simplificada focada em informações essenciais.
- **Entrada:** Correição selecionada + filtros aplicados
- **Processamento:**
  1. Buscar proposições onde correicaoId = correição selecionada
  2. Aplicar filtros (busca, tipo, status, tag, prioridade)
  3. Para cada proposição, renderizar linha com 7 colunas
  4. Aplicar destaque visual conforme prioridade
- **Saída:** Tabela HTML com 7 colunas:
  1. **Número** - identificador único
  2. **Tipo** - badge Determinação/Recomendação
  3. **Unidade** - órgão responsável
  4. **Descrição** - texto truncado (100 chars) com reticências
  5. **Tags** - badges coloridos (máx 3 visíveis + contador)
  6. **Status** - badges bidimensionais empilhados (processual + valoração)
  7. **Ações** - 3 botões: 👁️ Visualizar, ⚖️ Avaliar, ✏️ Editar
- **Regras de Negócio:**
  - RN-PROP-08: Tabela mostra apenas proposições da correição selecionada
  - RN-PROP-09: Descrição truncada em 100 caracteres
  - RN-PROP-10: Prioridade urgente tem destaque visual (fundo vermelho claro)
  - RN-PROP-11: Status bidimensional sempre visível (2 badges)
- **Critérios de Aceite:**
  - ✓ Tabela exibe exatamente 7 colunas
  - ✓ Descrição truncada com "..." se > 100 chars
  - ✓ Tags renderizadas como badges coloridos
  - ✓ Se > 3 tags, exibir "+X" ao final
  - ✓ Status exibido como 2 badges empilhados verticalmente
  - ✓ Linha com prioridade=urgente tem fundo diferenciado
  - ✓ 3 botões de ação visíveis e funcionais

---

#### RF-PROP-005: Ação "Visualizar" - Modal de Detalhes

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir modal com detalhes completos da proposição e timeline.
- **Entrada:** Clique no botão "👁️ Visualizar" em qualquer linha
- **Processamento:**
  1. Identificar ID da proposição
  2. Buscar dados completos (incluindo correição vinculada)
  3. Renderizar modal com 3 seções:
     - Informações da Proposição (todos os campos)
     - Informações da Correição (dados básicos)
     - Timeline Completa (histórico cronológico)
  4. Renderizar timeline com cores diferenciadas:
     - 📤 Publicação (fundo laranja)
     - 📎 Comprovação (fundo azul)
     - ⚖️ Avaliação (fundo verde)
- **Saída:** Modal fullscreen com scroll interno
- **Regras de Negócio:**
  - RN-PROP-12: Timeline em ordem cronológica (mais antigo → mais recente)
  - RN-PROP-13: Cada entrada mostra: ícone, data, usuário, descrição, observações
  - RN-PROP-14: Publicações mostram prazoComprovacao
  - RN-PROP-15: Comprovações mostram lista de arquivos anexados
  - RN-PROP-16: Avaliações mostram transição de status
- **Critérios de Aceite:**
  - ✓ Modal ocupa 90% da tela
  - ✓ Seção 1: todos os campos da proposição visíveis
  - ✓ Seção 2: número, temática, ramoMP da correição
  - ✓ Seção 3: timeline com cores diferenciadas
  - ✓ Cada item da timeline tem ícone, data formatada, usuário, textos
  - ✓ Botão "X" e clicar fora fecham o modal
  - ✓ Modal tem scroll interno se conteúdo muito grande

---

#### RF-PROP-006: Ação "Avaliar" - Redirecionamento

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve redirecionar para página de avaliação ao clicar em "Avaliar".
- **Entrada:** Clique no botão "⚖️ Avaliar" em qualquer linha
- **Processamento:**
  1. Identificar ID da proposição
  2. Construir URL: `avaliacao.html?id={proposicaoId}`
  3. Redirecionar navegador
  4. Página de avaliação carrega proposição via query string
- **Saída:** Redirecionamento para avaliacao.html
- **Regras de Negócio:**
  - RN-PROP-17: Botão "Avaliar" disponível para qualquer status (não apenas em_analise)
  - RN-PROP-18: Usuário comum não vê este botão (apenas admin)
  - RN-PROP-19: Avaliação pode ocorrer a qualquer momento (flexibilidade)
- **Critérios de Aceite:**
  - ✓ Clicar em "Avaliar" redireciona para avaliacao.html?id=X
  - ✓ Botão visível apenas para admin
  - ✓ Botão disponível independente do status da proposição
  - ✓ Redirecionamento preserva sessão do usuário

---

#### RF-PROP-007: Ação "Editar" - Modal Inline

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve exibir modal de edição para alterar metadata da proposição.
- **Entrada:** Clique no botão "✏️ Editar" em qualquer linha
- **Processamento:**
  1. Identificar ID da proposição
  2. Abrir modal com formulário pré-preenchido
  3. Campos editáveis:
     - Tipo (dropdown)
     - Prioridade (dropdown)
     - Unidade (texto)
     - Membro (texto)
     - Descrição (textarea com contador)
     - Tags (checkboxes)
  4. Campo readonly:
     - Número (exibido mas não editável)
  5. Validar alterações
  6. Salvar no localStorage
  7. Re-renderizar tabela
- **Saída:**
  - Sucesso: "Proposição atualizada com sucesso!" + modal fecha + tabela atualiza
  - Falha: Mensagem de erro específica
- **Regras de Negócio:**
  - RN-PROP-20: Apenas admin pode editar
  - RN-PROP-21: Número da proposição não pode ser alterado
  - RN-PROP-22: Editar não altera status, histórico ou rascunhos
  - RN-PROP-23: Contador de caracteres em tempo real (5.000 máx)
- **Critérios de Aceite:**
  - ✓ Botão "Editar" visível apenas para admin
  - ✓ Modal abre com formulário pré-preenchido
  - ✓ Campo "Número" exibido mas readonly (cinza)
  - ✓ Alterar descrição atualiza contador: verde (0-4000), amarelo (4001-4900), vermelho (4901-5000)
  - ✓ Selecionar/desselecionar tags reflete imediatamente
  - ✓ Botão "Cancelar" fecha modal sem salvar
  - ✓ Botão "Salvar" valida + salva + fecha + atualiza tabela

---

#### RF-PROP-008: Sistema de Tags

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve implementar sistema de categorização com 11 tags predefinidas.
- **Entrada:** Checkboxes de tags no formulário de cadastro/edição
- **Processamento:**
  1. Renderizar 11 checkboxes com badges visuais:
     - administrativo, recursos-humanos, infraestrutura
     - tecnologia, processual, financeiro
     - capacitacao, gestao-documental, compliance
     - transparencia, outros
  2. Permitir seleção múltipla
  3. Salvar array de IDs das tags selecionadas
  4. Renderizar badges coloridos na tabela
- **Saída:**
  - Formulário: Checkboxes com badges coloridos
  - Tabela: Badges coloridos (máx 3 + contador)
  - Filtro: Dropdown com 11 tags
- **Regras de Negócio:**
  - [MD] RN-PROP-09: Apenas tags predefinidas são permitidas
  - RN-PROP-24: Proposição pode ter 0 a 11 tags
  - RN-PROP-25: Tags não podem ser criadas pelo usuário (fixas)
  - RN-PROP-26: Cada tag tem cor específica (definida no CSS)
- **Critérios de Aceite:**
  - ✓ Cadastro/edição mostra 11 checkboxes com badges
  - ✓ Tabela renderiza até 3 badges + "+X restantes"
  - ✓ Cada tag tem cor distinta e legível
  - ✓ Filtro por tag funciona (ver RF-PROP-010)
  - ✓ Proposição sem tags exibe "-" na coluna

---

#### RF-PROP-009: Status Bidimensional

- **Prioridade:** [E] Essencial
- **Descrição:** O sistema deve exibir status em formato bidimensional (processual + valoração).
- **Entrada:** Campo `status` da proposição (array de 2 elementos)
- **Processamento:**
  1. Extrair statusProcessual (índice 0)
  2. Extrair valoracao (índice 1)
  3. Renderizar 2 badges empilhados verticalmente:
     - Badge superior: statusProcessual
     - Badge inferior: valoracao
  4. Aplicar cores conforme padrão:
     - **Processual:** pendente (amarelo), aguardando_comprovacao (laranja), em_analise (azul), encerrada (azul escuro)
     - **Valoração:** nova (cinza), adimplente (verde), parcial (laranja), inadimplente (vermelho), prejudicada (cinza escuro)
- **Saída:** Container com 2 badges empilhados
- **Regras de Negócio:**
  - [MD] Status é array: [statusProcessual, valoracao]
  - RN-PROP-27: Ambos badges sempre visíveis
  - RN-PROP-28: Cores fixas conforme padrão
  - RN-PROP-29: Ordem fixa: processual em cima, valoração embaixo
- **Critérios de Aceite:**
  - ✓ Status renderizado como 2 badges empilhados
  - ✓ Badge superior mostra status processual com cor correta
  - ✓ Badge inferior mostra valoração com cor correta
  - ✓ Container tem espaçamento adequado entre badges
  - ✓ Cores acessíveis (contraste adequado)

---

#### RF-PROP-010: Filtros Avançados de Proposições

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve fornecer 5 filtros independentes combinados com lógica AND.
- **Entrada:** 5 campos de filtro acima da tabela:
  1. **Busca textual** (input texto)
  2. **Tipo** (dropdown: todas/determinação/recomendação)
  3. **Status** (dropdown: todos/valores de processual/valores de valoração)
  4. **Tags** (dropdown: todas/11 tags)
  5. **Prioridade** (dropdown: todas/urgente/alta/normal)
- **Processamento:**
  1. Capturar valores de todos os filtros
  2. Aplicar lógica AND (todos os filtros ativos simultaneamente)
  3. **Busca:** número, unidade, membro, descrição (case-insensitive)
  4. **Tipo:** filtrar por campo `tipo`
  5. **Status:** filtrar por `statusProcessual` OU `valoracao`
  6. **Tags:** filtrar se proposição contém a tag selecionada
  7. **Prioridade:** filtrar por campo `prioridade`
  8. Re-renderizar tabela
  9. Exibir contador: "Exibindo X de Y proposições"
- **Saída:** Tabela filtrada + contador de resultados
- **Regras de Negócio:**
  - RN-PROP-30: Todos os filtros trabalham em conjunto (AND)
  - RN-PROP-31: Filtros vazios/padrão não restringem (mostram tudo)
  - RN-PROP-32: Busca ignora acentuação e case
  - RN-PROP-33: Contador mostra quantidade filtrada vs total
- **Critérios de Aceite:**
  - ✓ 5 filtros posicionados em linha acima da tabela
  - ✓ Buscar "protocolo" encontra proposições com esta palavra na descrição
  - ✓ Filtrar tipo=Determinação + tag=tecnologia mostra apenas determinações com tag tecnologia
  - ✓ Filtrar status=aguardando_comprovacao mostra apenas este status processual
  - ✓ Filtrar prioridade=urgente mostra apenas proposições urgentes
  - ✓ Botão "Limpar Filtros" reseta todos para padrão

---

#### RF-PROP-011: Botão "Limpar Filtros"

- **Prioridade:** [I] Importante
- **Descrição:** O sistema deve fornecer botão para resetar todos os filtros de uma vez.
- **Entrada:** Clique no botão "Limpar Filtros"
- **Processamento:**
  1. Resetar campo de busca (vazio)
  2. Resetar dropdown tipo para "Todas"
  3. Resetar dropdown status para "Todos"
  4. Resetar dropdown tag para "Todas"
  5. Resetar dropdown prioridade para "Todas"
  6. Re-renderizar tabela sem filtros
  7. Atualizar contador
- **Saída:** Todos os filtros resetados + tabela completa exibida
- **Regras de Negócio:**
  - RN-PROP-34: Limpar filtros não altera correição selecionada
  - RN-PROP-35: Limpar filtros não altera ordenação (se aplicada)
- **Critérios de Aceite:**
  - ✓ Botão posicionado no final da linha de filtros
  - ✓ Ícone de "X" ou "Limpar" visível
  - ✓ Um clique reseta todos os 5 filtros simultaneamente
  - ✓ Tabela atualiza mostrando todas as proposições da correição
  - ✓ Contador volta para "Exibindo X de X proposições"

---

#### RF-PROP-012: Contador de Resultados

- **Prioridade:** [D] Desejável
- **Descrição:** O sistema deve exibir contador dinâmico de proposições exibidas vs total.
- **Entrada:** Estado atual dos filtros
- **Processamento:**
  1. Contar proposições após aplicar filtros (N)
  2. Contar total de proposições da correição (M)
  3. Renderizar texto: "Exibindo N de M proposições"
  4. Atualizar em tempo real ao mudar filtros
- **Saída:** Texto acima ou abaixo da tabela
- **Regras de Negócio:**
  - RN-PROP-36: Contador atualiza dinamicamente
  - RN-PROP-37: Se N=M, exibir: "Exibindo todas as M proposições"
- **Critérios de Aceite:**
  - ✓ Contador visível sempre que há proposições
  - ✓ Texto atualiza ao aplicar/limpar filtros
  - ✓ Formato: "Exibindo 5 de 10 proposições"
  - ✓ Se todas exibidas: "Exibindo todas as 10 proposições"
  - ✓ Se nenhuma: "Nenhuma proposição encontrada"

---

### 2.5 RF-PUB: Publicação de Proposições

*(A ser elaborado na Parte 2.3)*

---

### 2.6 RF-COMP: Comprovação

*(A ser elaborado na Parte 2.3)*

---

### 2.7 RF-AVAL: Avaliação

*(A ser elaborado na Parte 2.3)*

---

### 2.8 RF-BUSCA: Busca e Filtros

*(A ser elaborado na Parte 2.4)*

---

### 2.9 RF-EXP: Exportação de Dados

*(A ser elaborado na Parte 2.4)*

---

### 2.10 RF-HIST: Histórico e Auditoria

*(A ser elaborado na Parte 2.4)*

---

### 2.11 RF-NOTIF: Notificações

*(A ser elaborado na Parte 2.4)*

---

## 3. Casos de Uso Detalhados

*(A ser elaborado na Parte 2.5)*

---

## 4. Regras de Negócio Consolidadas

*(A ser elaborado na Parte 2.6)*

---

## 5. Matriz de Rastreabilidade

*(A ser elaborado na Parte 2.6)*

---

**Fim da Parte 2.2**

---

**Status da Documentação:**
- ✅ **Parte 2.1 (COMPLETA):** Introdução, RF-AUTH (6 requisitos), RF-DASH (7 requisitos)
- ✅ **Parte 2.2 (COMPLETA):** RF-COR (10 requisitos), RF-PROP (12 requisitos)
- ⏳ **Parte 2.3 (PENDENTE):** RF-PUB, RF-COMP, RF-AVAL
- ⏳ **Parte 2.4 (PENDENTE):** RF-BUSCA, RF-EXP, RF-HIST, RF-NOTIF
- ⏳ **Parte 2.5 (PENDENTE):** Casos de Uso Detalhados
- ⏳ **Parte 2.6 (PENDENTE):** Regras de Negócio e Matriz de Rastreabilidade

**Total documentado até agora:** 35 requisitos funcionais (13 em 2.1 + 22 em 2.2)

---

**Próximas Partes:**
- **Parte 2.3:** RF-PUB (Publicação), RF-COMP (Comprovação), RF-AVAL (Avaliação)
- **Parte 2.4:** RF-BUSCA, RF-EXP, RF-HIST, RF-NOTIF
- **Parte 2.5:** Casos de Uso Detalhados
- **Parte 2.6:** Regras de Negócio e Matriz de Rastreabilidade
