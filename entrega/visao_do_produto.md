# Documento de Visão do Produto
## Sistema de Acompanhamento de Proposições - CNMP

**Versão:** 1.0
**Data:** 10/12/2025
**Projeto:** Sistema NAD - Núcleo de Acompanhamento de Decisões
**Organização:** Conselho Nacional do Ministério Público (CNMP)

---

## Histórico de Revisões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 10/12/2025 | Documentação Técnica | Versão inicial do documento |

---

## 1. Introdução

### 1.1 Propósito

Este documento apresenta a visão do produto para o **Sistema de Acompanhamento de Proposições** do Conselho Nacional do Ministério Público (CNMP). O objetivo é estabelecer uma compreensão compartilhada entre todas as partes interessadas sobre o propósito, escopo, capacidades e restrições do sistema a ser desenvolvido.

O documento destina-se a:
- Equipe de desenvolvimento da fábrica de software
- Gestores e stakeholders do CNMP
- Equipe do Núcleo de Acompanhamento de Decisões (NAD)
- Usuários finais (Corregedoria Nacional e MPs correicionados)

### 1.2 Escopo do Produto

O **Sistema de Acompanhamento de Proposições** é uma aplicação web desenvolvida para digitalizar e automatizar o processo de acompanhamento de correições realizadas pela Corregedoria Nacional do Ministério Público nos 27 Ministérios Públicos brasileiros.

**O sistema gerencia:**
- Cadastro e acompanhamento de correições (procedimentos de revisão judicial)
- Registro e controle de proposições (determinações e recomendações)
- Workflow completo: publicação → comprovação → avaliação
- Dashboard executivo com estatísticas e indicadores
- Sistema de notificações e alertas de prazo
- Exportação de dados e geração de relatórios
- Controle de acesso baseado em perfis

**O sistema NÃO gerencia:**
- Processos disciplinares ou administrativos completos
- Sistema de protocolo geral do CNMP
- Gestão de recursos humanos dos MPs
- Sistema de documentos oficiais (SEI)
- Gestão financeira ou orçamentária

### 1.3 Definições, Acrônimos e Abreviações

| Termo | Definição |
|-------|-----------|
| **CNMP** | Conselho Nacional do Ministério Público |
| **NAD** | Núcleo de Acompanhamento de Decisões |
| **MP** | Ministério Público |
| **MPE** | Ministério Público Estadual |
| **MPU** | Ministério Público da União |
| **Correição** | Procedimento de revisão judicial realizado pela Corregedoria Nacional |
| **Proposição** | Determinação (obrigatória) ou recomendação (sugestiva) emitida durante uma correição |
| **Comprovação** | Evidência documental enviada pelo correicionado para demonstrar cumprimento da proposição |
| **Avaliação** | Análise realizada pela Corregedoria Nacional sobre a comprovação recebida |
| **Correicionado** | Órgão do Ministério Público que está sendo correicionado |
| **Corregedor Nacional** | Autoridade responsável pelas correições no âmbito do CNMP |
| **Rascunho** | Comprovação preparada mas ainda não enviada oficialmente |
| **ELO** | Sistema oficial de numeração de processos administrativos do CNMP |
| **Status Processual** | Estado atual do fluxo de trabalho da proposição |
| **Valoração** | Avaliação de conformidade/cumprimento da proposição |
| **SPA** | Single Page Application (aplicação de página única) |

### 1.4 Referências

- **Lei Complementar nº 75/1993** - Lei Orgânica do Ministério Público da União
- **Regimento Interno do CNMP** - Resolução CNMP nº 309/2024
- **Protótipo funcional** - Arquivos HTML/CSS/JS do sistema atual
- **Modelo de Dados** - Documento técnico de especificação do banco de dados

---

## 2. Posicionamento

### 2.1 Oportunidade de Negócio

A Corregedoria Nacional do Ministério Público realiza anualmente dezenas de correições nos 27 Ministérios Públicos brasileiros, gerando centenas de proposições (determinações e recomendações) que precisam ser acompanhadas desde a publicação até a comprovação de cumprimento.

**Atualmente, este processo enfrenta:**
- Controle manual via planilhas e documentos dispersos
- Dificuldade no acompanhamento de prazos e status
- Falta de visibilidade gerencial sobre o andamento das correições
- Retrabalho na geração de relatórios e ofícios
- Comunicação fragmentada entre Corregedoria e MPs correicionados
- Perda de histórico e dificuldade na auditoria

**A digitalização deste processo permite:**
- Centralização de informações em plataforma única
- Automação do workflow de publicação-comprovação-avaliação
- Transparência e rastreabilidade completa
- Alertas automáticos de prazos
- Dashboard executivo para tomada de decisão
- Redução de tempo em atividades operacionais
- Melhoria na gestão do conhecimento institucional

### 2.2 Descrição do Problema

| Item | Descrição |
|------|-----------|
| **O problema de** | Gestão manual e descentralizada do acompanhamento de proposições de correições |
| **Afeta** | Corregedoria Nacional, Núcleo de Acompanhamento de Decisões (NAD), e os 27 Ministérios Públicos correicionados |
| **Cujo impacto é** | Dificuldade no controle de prazos, perda de informações, retrabalho, falta de visibilidade gerencial, e morosidade no ciclo de acompanhamento |
| **Uma solução bem-sucedida seria** | Um sistema web integrado que automatize o workflow completo, forneça visibilidade em tempo real, emita alertas de prazo, e preserve o histórico completo de cada proposição |

### 2.3 Descrição da Solução

O **Sistema de Acompanhamento de Proposições** é uma aplicação web moderna que digitaliza o processo de gestão de correições e proposições do CNMP, implementando um workflow estruturado de publicação-comprovação-avaliação com controles automáticos, notificações e dashboards gerenciais.

**Principais características:**
- Interface web responsiva acessível via navegador
- Workflow automatizado com controle de estados
- Notificações automáticas por e-mail
- Dashboard executivo com gráficos e indicadores
- Sistema de busca e filtros avançados
- Exportação de dados (JSON/PDF)
- Geração automatizada de ofícios de publicação
- Histórico completo e auditável de cada proposição
- Controle de acesso baseado em perfis

### 2.4 Declaração de Posição do Produto

| Item | Descrição |
|------|-----------|
| **Para** | Corregedoria Nacional do Ministério Público e Ministérios Públicos correicionados |
| **Que** | Precisam acompanhar de forma eficiente o cumprimento de proposições emitidas em correições |
| **O Sistema de Acompanhamento de Proposições** | É uma aplicação web |
| **Que** | Automatiza o workflow completo de publicação-comprovação-avaliação, fornecendo controle de prazos, visibilidade gerencial e auditoria completa |
| **Diferente de** | Planilhas Excel, controles manuais, e sistemas genéricos de documentos |
| **Nosso produto** | É especializado no fluxo específico de correições, com regras de negócio incorporadas, notificações automáticas, e interface otimizada para este processo |

---

## 3. Descrição dos Stakeholders e Usuários

### 3.1 Resumo dos Stakeholders

| Nome | Descrição | Responsabilidades |
|------|-----------|-------------------|
| **Corregedoria Nacional** | Autoridade responsável pelas correições no CNMP | Definir requisitos, validar funcionalidades, homologar sistema |
| **Núcleo de Acompanhamento de Decisões (NAD)** | Setor operacional que gerencia o acompanhamento | Operar o sistema diariamente, gerenciar proposições, avaliar comprovações |
| **Procuradorias-Gerais dos MPs** | Órgãos máximos dos 27 Ministérios Públicos | Receber proposições, enviar comprovações, cumprir prazos |
| **Secretaria de Tecnologia da Informação (STI/CNMP)** | Área de TI responsável pela infraestrutura | Homologar arquitetura, garantir integração com sistemas existentes |
| **Fábrica de Software** | Equipe de desenvolvimento contratada | Desenvolver, testar e implantar o sistema conforme especificações |

### 3.2 Resumo dos Usuários

| Nome | Descrição | Stakeholder Representado | Perfil no Sistema |
|------|-----------|--------------------------|-------------------|
| **Assessor da Corregedoria** | Servidor do NAD que gerencia proposições | NAD | Admin |
| **Corregedor Nacional** | Autoridade máxima da Corregedoria | Corregedoria Nacional | Admin (visualização) |
| **Procurador-Geral de Justiça** | Chefe do MP correicionado | Procuradorias-Gerais | Usuário |
| **Assessor do MP** | Servidor que prepara comprovações | Procuradorias-Gerais | Usuário |
| **Coordenador do NAD** | Gestor do setor | NAD | Admin (gestão) |

### 3.3 Ambiente do Usuário

**Contexto de uso:**
- Usuários trabalham em escritórios institucionais (CNMP e MPs estaduais/federal)
- Acesso via computadores desktop e notebooks
- Conexão de internet estável (rede corporativa)
- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Necessidade de impressão de relatórios e documentos oficiais
- Uso intensivo durante períodos de correições ativas
- Múltiplos usuários simultâneos (até 50 usuários concorrentes)

**Características dos usuários:**
- Nível educacional: Superior completo (Direito, Administração)
- Familiaridade com sistemas web: Intermediária a avançada
- Faixa etária: 25 a 65 anos
- Experiência com sistemas jurídicos/administrativos
- Necessidade de treinamento inicial: Mínima (interface intuitiva)

### 3.4 Perfis dos Usuários

#### 3.4.1 Perfil: Administrador (Corregedoria Nacional)

| Item | Descrição |
|------|-----------|
| **Representante** | Assessores e coordenadores do NAD, Corregedor Nacional |
| **Descrição** | Usuários da Corregedoria Nacional responsáveis por gerenciar correições, publicar proposições e avaliar comprovações |
| **Tipo** | Usuário expert com conhecimento técnico-jurídico avançado |
| **Responsabilidades** | - Cadastrar correições<br>- Cadastrar e editar proposições<br>- Publicar proposições para MPs<br>- Avaliar comprovações recebidas<br>- Gerar relatórios gerenciais<br>- Exportar dados<br>- Emitir ofícios oficiais |
| **Critérios de Sucesso** | - Redução de 70% no tempo de publicação de proposições<br>- 100% das avalições registradas no sistema<br>- Geração automática de ofícios em menos de 2 minutos |
| **Envolvimento** | Alto - uso diário, múltiplas vezes por dia |
| **Comentários** | Usuários-chave que determinam o sucesso do sistema. Interface deve ser eficiente para operações em lote. |

#### 3.4.2 Perfil: Usuário (MP Correicionado)

| Item | Descrição |
|------|-----------|
| **Representante** | Procuradores-Gerais, assessores jurídicos dos 27 MPs |
| **Descrição** | Usuários dos Ministérios Públicos que recebem proposições e devem enviar comprovações de cumprimento |
| **Tipo** | Usuário final com conhecimento jurídico, uso intermitente do sistema |
| **Responsabilidades** | - Visualizar proposições recebidas<br>- Preparar rascunhos de comprovação<br>- Enviar comprovações com documentos anexos<br>- Acompanhar status das proposições<br>- Visualizar histórico e prazos |
| **Critérios de Sucesso** | - 100% das comprovações enviadas pelo sistema<br>- Redução de 50% em atrasos de prazo (via alertas)<br>- Facilidade no upload de múltiplos documentos |
| **Envolvimento** | Médio - uso semanal ou conforme prazos |
| **Comentários** | Interface deve ser autoexplicativa. Funcionalidade de rascunho é crítica para preparação gradual das comprovações. |

### 3.5 Principais Necessidades dos Stakeholders

| Necessidade | Prioridade | Preocupações | Solução Atual | Solução Proposta |
|-------------|------------|--------------|---------------|------------------|
| Controle centralizado de proposições | Alta | Perda de informações, inconsistências | Planilhas Excel dispersas | Banco de dados único com interface web |
| Acompanhamento de prazos | Alta | Proposições vencidas sem controle | Controle manual de calendário | Alertas automáticos e dashboard de prazos |
| Rastreabilidade e auditoria | Alta | Falta de histórico completo | Documentos em pastas dispersas | Timeline completa de cada proposição |
| Comunicação eficiente | Média | E-mails perdidos, falta de formalização | E-mails manuais | Notificações automáticas do sistema |
| Visibilidade gerencial | Alta | Decisões sem dados consolidados | Relatórios manuais demorados | Dashboard executivo em tempo real |
| Redução de retrabalho | Média | Digitação repetitiva de dados | Cópia manual entre documentos | Geração automática de ofícios |
| Preservação do conhecimento | Alta | Perda de informações ao longo do tempo | Documentos sem versionamento | Histórico imutável e auditável |

---

## 4. Visão Geral do Produto

### 4.1 Perspectiva do Produto

O Sistema de Acompanhamento de Proposições é uma **aplicação web standalone** que opera de forma independente, mas preparada para futuras integrações com outros sistemas do ecossistema CNMP.

**Arquitetura proposta:**
```
┌─────────────────────────────────────────────────────┐
│                  Usuários (Web)                     │
│  (Corregedoria Nacional + 27 MPs correicionados)    │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│              Frontend (SPA - React/Vue)             │
│  - Dashboard executivo                              │
│  - Gestão de correições                             │
│  - Gestão de proposições                            │
│  - Workflow de comprovação                          │
│  - Sistema de exportação                            │
└────────────────────┬────────────────────────────────┘
                     │ REST API / JSON
                     ▼
┌─────────────────────────────────────────────────────┐
│           Backend (Node.js / Java / .NET)           │
│  - API RESTful                                      │
│  - Autenticação e autorização                       │
│  - Regras de negócio                                │
│  - Notificações por e-mail                          │
│  - Geração de relatórios PDF                        │
│  - Job scheduler (alertas de prazo)                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Banco de Dados  │    │  File Storage    │
│  (PostgreSQL/    │    │  (AWS S3 /       │
│   MongoDB)       │    │   Local)         │
└──────────────────┘    └──────────────────┘
```

**Integrações futuras planejadas:**
- Sistema de autenticação corporativa (SSO)
- Sistema de e-mail institucional (SMTP)
- Sistema SEI (Sistema Eletrônico de Informações)
- Sistema ELO (numeração de processos)

### 4.2 Resumo das Capacidades

| Benefício para o Cliente | Recursos de Suporte |
|--------------------------|---------------------|
| **Gestão centralizada de correições** | - Cadastro completo de correições com metadata<br>- Vinculação automática com proposições<br>- Cálculo automático de status (ativo/inativo) |
| **Controle eficiente de proposições** | - Cadastro detalhado com unidade, membro, tags<br>- Status bidimensional (processual + valoração)<br>- Filtros avançados e busca textual |
| **Workflow automatizado** | - Publicação em lote de proposições<br>- Envio de comprovações com anexos<br>- Avaliação estruturada com parecer<br>- Transições de status automáticas |
| **Acompanhamento de prazos** | - Dashboard com contador de prazos vencidos<br>- Alertas visuais no painel<br>- Notificações por e-mail (futura) |
| **Visibilidade gerencial** | - Dashboard executivo com 5 indicadores-chave<br>- 2 gráficos (workflow + valoração)<br>- Filtro por correição específica<br>- Exportação JSON/PDF |
| **Auditoria e transparência** | - Timeline completa de cada proposição<br>- Histórico imutável de interações<br>- Registro de usuário, data e ação<br>- Visualização cronológica |
| **Eficiência operacional** | - Sistema de rascunhos para comprovações<br>- Geração automática de ofícios<br>- Exportação de dados estruturados<br>- Interface responsiva |

### 4.3 Suposições e Dependências

**Suposições:**
- Usuários possuem acesso a computadores com navegadores modernos
- Conexão de internet estável disponível (mínimo 2 Mbps)
- Organização já possui infraestrutura de servidores ou contrato cloud
- Existe equipe técnica para suporte e manutenção
- Usuários receberão treinamento inicial de 4 horas

**Dependências:**
- Servidor de aplicação (Linux/Windows Server)
- Banco de dados (PostgreSQL, MySQL ou MongoDB)
- Servidor de e-mail SMTP para notificações
- Certificado SSL para HTTPS
- Storage para arquivos anexados (mínimo 100 GB)
- Backup automatizado diário

### 4.4 Custo e Precificação

*(A definir pela fábrica de software e CNMP)*

**Estimativa de investimento:**
- Desenvolvimento customizado: [A definir]
- Licenças de software (se aplicável): [A definir]
- Infraestrutura cloud (1 ano): [A definir]
- Treinamento de usuários: [A definir]
- Manutenção anual: [A definir]

---

## 5. Recursos do Produto

### 5.1 Gestão de Correições

**Descrição:**
Módulo para cadastro, edição e acompanhamento de correições realizadas pela Corregedoria Nacional nos 27 Ministérios Públicos.

**Funcionalidades:**
- Cadastro de nova correição com 13 campos (número, temática, número ELO, tipo, MP, UF, datas, etc.)
- Listagem com tabela de 13 colunas ordenável e filtrável
- Visualização detalhada com estatísticas de proposições vinculadas
- Cálculo automático de status (ativo/inativo) baseado em proposições
- Filtros por status, busca textual, e ordenação por múltiplas colunas
- Indicadores visuais: pendentes (amarelo), em análise (azul), prazo vencido (vermelho)
- Exportação: JSON, PDF tabular, PDF detalhado

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, NAD

---

### 5.2 Gestão de Proposições

**Descrição:**
Módulo para cadastro e acompanhamento de proposições (determinações e recomendações) vinculadas a correições.

**Funcionalidades:**
- Cadastro de proposição com tipo, unidade, membro, descrição, prioridade, tags
- Página dedicada `proposicoes.html` com seleção obrigatória de correição
- Tabela simplificada de 7 colunas com 3 ações: Visualizar, Avaliar, Editar
- Edição inline de metadata (tipo, prioridade, unidade, membro, descrição, tags)
- Status bidimensional: [status processual, valoração]
- Sistema de tags (11 categorias predefinidas)
- Filtros avançados: busca, tipo, status, tags, prioridade
- Modal de detalhes com timeline completa
- Exportação: JSON, PDF, PDF completo com timeline

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, NAD, MPs

---

### 5.3 Workflow de Publicação

**Descrição:**
Módulo exclusivo para administradores publicarem proposições em lote para os MPs correicionados.

**Funcionalidades:**
- Página dedicada `publicacao.html` (acesso restrito admin)
- Seleção obrigatória de correição
- Tabela com checkboxes para seleção individual ou em lote
- Filtros: busca, tipo, tags, prioridade
- Contadores em tempo real de proposições selecionadas
- Formulário de publicação com:
  - Prazo de comprovação único para todas as selecionadas
  - Observações opcionais (máx 1.000 caracteres)
- Confirmação antes de publicar
- Atualização automática de status para `aguardando_comprovacao`
- Registro de publicação no histórico com prazo e status
- Geração automática de ofício de publicação (PDF formal)
- Notificação por e-mail ao MP correicionado (futura)

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, NAD

---

### 5.4 Workflow de Comprovação

**Descrição:**
Módulo para MPs correicionados enviarem comprovações de cumprimento das proposições.

**Funcionalidades:**
- Página dedicada `comprovacao.html`
- Dropdown mostrando APENAS proposições com status `aguardando_comprovacao`
- Alerta visual de prazo com countdown e indicador de atraso
- Formulário com:
  - Descrição do adimplemento (máx 7.500 caracteres)
  - Observações adicionais (máx 1.000 caracteres)
  - Upload de múltiplos arquivos (drag-and-drop)
- Contador de caracteres em tempo real (verde → amarelo → vermelho)
- Sistema de rascunhos:
  - Salvar como rascunho (botão separado)
  - Carregamento automático de rascunho existente
  - Indicador visual quando editando rascunho
- Envio oficial (muda status para `em_analise`)
- Registro no histórico com arquivos anexados
- Redirecionamento automático após salvar/enviar

**Prioridade:** Alta
**Stakeholder:** MPs correicionados

---

### 5.5 Workflow de Avaliação

**Descrição:**
Módulo para Corregedoria Nacional avaliar comprovações recebidas dos MPs.

**Funcionalidades:**
- Página dedicada `avaliacao.html` (acesso restrito admin)
- Fila de avaliação mostrando proposições com status `em_analise`
- Visualização completa da proposição e histórico
- Exibição da comprovação atual com arquivos anexados
- Formulário de avaliação com:
  - Decisão (radio buttons visuais): adimplente, parcial, inadimplente, prejudicada
  - Parecer detalhado (máx 7.500 caracteres)
- Contador de caracteres em tempo real
- Lógica de transição de status:
  - Adimplente/Prejudicada → status `encerrada` (fim do ciclo)
  - Parcial/Inadimplente → status `pendente` (aguarda republicação)
- Registro no histórico com decisão e parecer
- Redirecionamento automático após avaliar
- Notificação por e-mail ao MP (futura)

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, NAD

---

### 5.6 Dashboard Executivo

**Descrição:**
Painel gerencial com indicadores-chave, gráficos e filtros para acompanhamento estratégico.

**Funcionalidades:**
- Filtro por correição (dropdown) para visão específica ou agregada
- 5 cards de indicadores:
  1. Correições Realizadas
  2. Correições Ativas
  3. Total de Proposições
  4. Proposições Ativas
  5. Prazo Vencido (com alerta visual)
- 2 gráficos de barras:
  1. **Fluxo de Trabalho** (4 categorias de status processual)
  2. **Valoração** (5 categorias de avaliação)
- Atualização dinâmica ao mudar filtro
- Layout responsivo (2 colunas desktop, 1 coluna mobile)
- Cores alinhadas ao tema institucional CNMP

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, Gestores

---

### 5.7 Sistema de Exportação de Dados

**Descrição:**
Funcionalidade transversal para exportar dados em múltiplos formatos para análise externa e arquivo.

**Funcionalidades:**
- Botões "📥 Exportar" em 5 locais estratégicos:
  1. Dashboard (JSON + PDF)
  2. Tabela de Correições (JSON + PDF simples + PDF detalhado)
  3. Página de Proposições (JSON + PDF + PDF completo)
  4. Modal de Detalhes (JSON + PDF)
  5. Página de Publicação (JSON pendentes + JSON selecionadas + Ofício PDF)
- Formatos:
  - **JSON:** Dados estruturados com metadata completa
  - **PDF simples:** Tabelas formatadas
  - **PDF detalhado:** Relatórios completos com timelines
  - **Ofício PDF:** Documento formal com layout institucional
- Exportações respeitam filtros aplicados
- Nome de arquivo automático com data
- Menu dropdown estilizado
- Geração client-side (JSON) e server-side (PDF complexos)

**Prioridade:** Média
**Stakeholder:** Corregedoria Nacional, NAD, Gestores

---

### 5.8 Sistema de Busca e Filtros

**Descrição:**
Funcionalidade transversal para localização rápida de informações em grandes volumes de dados.

**Funcionalidades:**
- **Busca textual:** Busca em múltiplos campos simultaneamente
  - Correições: número, ramoMP, temática, numeroElo
  - Proposições: número, unidade, membro, descrição
- **Filtros estruturados:**
  - Status (processual e valoração)
  - Tipo (correição e proposição)
  - Tags (11 categorias)
  - Prioridade (urgente, alta, normal)
  - Correição vinculada
- **Filtros combinados:** Lógica AND entre múltiplos filtros
- **Botão "Limpar Filtros":** Reset de todos os filtros
- **Contador de resultados:** Exibição dinâmica de quantidade filtrada
- **Performance:** Busca instantânea (< 100ms) até 10.000 registros

**Prioridade:** Alta
**Stakeholder:** Todos os usuários

---

### 5.9 Sistema de Notificações

**Descrição:**
Alertas automáticos para eventos críticos e prazos vencidos.

**Funcionalidades (Fase 1 - MVP):**
- Alertas visuais no dashboard (contador de prazos vencidos)
- Indicador vermelho em tabelas (proposições com prazo vencido)
- Mensagens de sucesso após operações (publicar, enviar, avaliar)

**Funcionalidades (Fase 2 - Futura):**
- Notificações por e-mail automáticas:
  - MP: ao receber publicação de proposição
  - MP: alerta 7 dias antes do prazo
  - MP: alerta no dia do vencimento
  - Corregedoria: ao receber comprovação
  - MP: ao receber avaliação
- Configuração de preferências de notificação por usuário
- Log de notificações enviadas

**Prioridade:** Média (Fase 1) / Alta (Fase 2)
**Stakeholder:** Todos os usuários

---

### 5.10 Controle de Acesso e Autenticação

**Descrição:**
Sistema de autenticação e autorização baseado em perfis de usuário.

**Funcionalidades:**
- **2 perfis de usuário:**
  1. **Admin** (Corregedoria Nacional): Acesso total
  2. **Usuário** (MP Correicionado): Acesso restrito ao seu MP
- **Tela de login:**
  - Autenticação por MP (dropdown) + senha
  - Sessão persistente (localStorage)
  - Logout seguro
- **Controle de acesso:**
  - Páginas restritas por perfil (publicacao, avaliacao)
  - Redirecionamento automático para usuários não autorizados
  - Validação server-side de permissões
- **Visibilidade de dados:**
  - Admin: vê todas as correições e proposições
  - Usuário: vê apenas correições e proposições do seu MP
- **Auditoria:**
  - Registro de usuário em todas as interações no histórico

**Prioridade:** Alta
**Stakeholder:** CNMP (segurança institucional)

---

### 5.11 Auditoria e Histórico

**Descrição:**
Sistema de registro imutável de todas as interações para rastreabilidade e conformidade.

**Funcionalidades:**
- **Timeline visual** em modal de detalhes:
  - Ordenação cronológica
  - Ícones por tipo: 📤 Publicação, 📎 Comprovação, ⚖️ Avaliação
  - Cores diferenciadas: laranja, azul, verde
- **Registro completo:**
  - Data e hora (ISO 8601 UTC)
  - Usuário responsável
  - Descrição da ação
  - Observações (opcional)
  - Status anterior e novo
  - Arquivos anexados (comprovação)
  - Prazo definido (publicação)
- **Imutabilidade:** Histórico não pode ser editado ou excluído
- **Append-only:** Apenas adição de novas entradas
- **Exportação:** Histórico incluído em exportações JSON e PDF

**Prioridade:** Alta
**Stakeholder:** Corregedoria Nacional, Auditoria interna

---

## 6. Restrições

### 6.1 Restrições Técnicas

| Restrição | Descrição |
|-----------|-----------|
| **RT-01: Navegadores** | Sistema deve funcionar nos navegadores Chrome (v90+), Firefox (v88+), Edge (v90+), Safari (v14+) |
| **RT-02: Resolução** | Interface deve ser responsiva para resoluções de 1024x768 até 1920x1080 |
| **RT-03: Dispositivos móveis** | Funcionalidade completa em tablets (iPad, Android 10"+). Smartphones com funcionalidade limitada (visualização) |
| **RT-04: Conectividade** | Sistema deve funcionar com conexões de mínimo 2 Mbps |
| **RT-05: Upload de arquivos** | Limite de 10 MB por arquivo, máximo 10 arquivos por comprovação |
| **RT-06: Formatos de arquivo** | Aceitar PDF, DOC, DOCX, JPG, PNG, ZIP |
| **RT-07: Banco de dados** | Suporte a PostgreSQL 12+, MySQL 8+ ou MongoDB 5+ |
| **RT-08: Sessão** | Timeout de sessão: 8 horas de inatividade |

### 6.2 Restrições Regulatórias e de Conformidade

| Restrição | Descrição |
|-----------|-----------|
| **RR-01: LGPD** | Sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018) |
| **RR-02: e-ARQ Brasil** | Documentos devem seguir padrões de arquivamento do e-ARQ Brasil (Resolução CONARQ 43/2015) |
| **RR-03: Assinatura digital** | Preparar sistema para futura integração com ICP-Brasil (assinatura digital) |
| **RR-04: Acessibilidade** | Conformidade com WCAG 2.1 nível AA (Web Content Accessibility Guidelines) |
| **RR-05: Segurança** | Conformidade com padrões de segurança do CNMP e boas práticas OWASP Top 10 |

### 6.3 Restrições de Design

| Restrição | Descrição |
|-----------|-----------|
| **RD-01: Identidade visual** | Usar cores institucionais do CNMP (azul #003366 como cor primária) |
| **RD-02: Logo** | Incluir logo oficial do CNMP em cabeçalhos e documentos gerados |
| **RD-03: Tipografia** | Fontes: Arial/Helvetica para interface web, Times New Roman para documentos oficiais |
| **RD-04: Nomenclatura** | Usar terminologia jurídica oficial conforme glossário fornecido |
| **RD-05: Layout** | Seguir padrões de design de sistemas governamentais brasileiros (DS Gov) |

---

## 7. Faixas de Qualidade

### 7.1 Requisitos de Usabilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **US-01** | Usuários devem conseguir cadastrar uma correição completa em menos de 3 minutos | Tempo médio < 3 min |
| **US-02** | Publicação em lote de 20 proposições deve levar menos de 5 minutos (incluindo preenchimento de dados) | Tempo médio < 5 min |
| **US-03** | Taxa de erro de usuários em tarefas principais deve ser inferior a 5% | Taxa de erro < 5% |
| **US-04** | 90% dos usuários devem conseguir enviar uma comprovação sem treinamento formal | Taxa de sucesso > 90% |
| **US-05** | Interface deve ser compreendida por usuários com conhecimento básico de web | Avaliação SUS > 70 |
| **US-06** | Mensagens de erro devem ser claras e orientativas (não técnicas) | 100% das mensagens |

### 7.2 Requisitos de Confiabilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **CF-01** | Sistema deve ter disponibilidade de 99,5% durante horário comercial (8h-18h) | Uptime > 99,5% |
| **CF-02** | Backup automático diário dos dados com retenção de 30 dias | 100% de sucesso |
| **CF-03** | Recuperação de desastre (disaster recovery) em até 4 horas | RTO = 4h |
| **CF-04** | Perda máxima de dados de 1 hora em caso de falha | RPO = 1h |
| **CF-05** | Sistema deve suportar até 50 usuários simultâneos sem degradação | 50 usuários concurrent |
| **CF-06** | Taxa de erro do sistema deve ser inferior a 0,1% das transações | Taxa de erro < 0,1% |

### 7.3 Requisitos de Desempenho

| ID | Requisito | Métrica |
|----|-----------|---------|
| **DF-01** | Tempo de carregamento inicial da página deve ser inferior a 3 segundos | Load time < 3s |
| **DF-02** | Busca e filtros devem retornar resultados em menos de 1 segundo | Response time < 1s |
| **DF-03** | Geração de PDF simples deve levar menos de 5 segundos | Generation time < 5s |
| **DF-04** | Upload de arquivo de 5 MB deve completar em menos de 10 segundos | Upload time < 10s |
| **DF-05** | Dashboard deve atualizar estatísticas em menos de 2 segundos | Refresh time < 2s |
| **DF-06** | Sistema deve suportar banco de dados com até 100.000 proposições sem degradação | Scalability: 100k records |

### 7.4 Requisitos de Suportabilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **SP-01** | Sistema deve gerar logs detalhados de erros para troubleshooting | 100% de erros logados |
| **SP-02** | Código deve ter documentação inline (comentários) em partes críticas | Cobertura > 50% |
| **SP-03** | Manual do usuário deve ser fornecido em formato PDF e online | 2 formatos |
| **SP-04** | Vídeos tutoriais de 5-10 minutos para tarefas principais | Mínimo 5 vídeos |
| **SP-05** | Sistema deve ter API REST documentada (OpenAPI/Swagger) para futuras integrações | Documentação completa |
| **SP-06** | Arquitetura deve permitir fácil adição de novos MPs sem alteração de código | Configurável via banco |

---

## 8. Precedência e Prioridade

### 8.1 Recursos por Prioridade

#### Prioridade CRÍTICA (Essencial para MVP)
1. Controle de acesso e autenticação
2. Gestão de correições (CRUD básico)
3. Gestão de proposições (CRUD básico)
4. Workflow de publicação
5. Workflow de comprovação
6. Workflow de avaliação
7. Status bidimensional e transições
8. Histórico e timeline

#### Prioridade ALTA (Importante para Fase 1)
9. Dashboard executivo com gráficos
10. Sistema de busca e filtros avançados
11. Sistema de tags
12. Exportação JSON e PDF
13. Sistema de rascunhos
14. Alertas visuais de prazo
15. Geração de ofício de publicação

#### Prioridade MÉDIA (Desejável para Fase 2)
16. Notificações por e-mail
17. Edição inline de proposições
18. Estatísticas detalhadas por correição
19. Exportação completa com timelines
20. Ordenação de tabelas por múltiplas colunas

#### Prioridade BAIXA (Melhorias Futuras)
21. Integração com sistema SEI
22. Assinatura digital de documentos
23. Chatbot de suporte
24. App mobile nativo
25. Relatórios personalizáveis pelo usuário

### 8.2 Fases de Entrega Sugeridas

**Fase 1 - MVP (3-4 meses):**
- Recursos CRÍTICOS completos
- Interface funcional básica
- Testes de aceitação

**Fase 2 - Melhorias (2-3 meses):**
- Recursos ALTA prioridade
- Refinamento de UX
- Treinamento de usuários

**Fase 3 - Expansão (2 meses):**
- Recursos MÉDIA prioridade
- Integrações básicas
- Documentação completa

**Fase 4 - Evolução (contínua):**
- Recursos BAIXA prioridade
- Feedback de usuários
- Melhorias iterativas

---

## 9. Outros Requisitos do Produto

### 9.1 Padrões Aplicáveis

- **ISO/IEC 25010** - Modelo de qualidade de software
- **WCAG 2.1 AA** - Acessibilidade web
- **OWASP Top 10** - Segurança de aplicações web
- **e-ARQ Brasil** - Arquivamento de documentos digitais
- **LGPD** - Proteção de dados pessoais

### 9.2 Requisitos de Licenciamento

- Sistema deve ser desenvolvido sob licença proprietária do CNMP
- Código-fonte deve ser entregue ao CNMP ao final do projeto
- Bibliotecas de terceiros devem usar licenças permissivas (MIT, Apache, BSD)
- Documentação completa deve ser fornecida

### 9.3 Requisitos Legais e de Conformidade

- Conformidade com Lei de Acesso à Informação (LAI - Lei 12.527/2011)
- Conformidade com LGPD (Lei 13.709/2018)
- Conformidade com Marco Civil da Internet (Lei 12.965/2014)
- Respeito a normas do Regimento Interno do CNMP

### 9.4 Requisitos de Documentação

**Documentação Técnica:**
- Documento de arquitetura do sistema
- Diagramas UML (casos de uso, classes, sequência)
- Modelo de dados completo
- Manual de instalação e configuração
- Documentação de API (Swagger/OpenAPI)

**Documentação do Usuário:**
- Manual do usuário (admin e correicionado)
- Guia rápido de referência
- Vídeos tutoriais
- FAQ (Perguntas Frequentes)
- Glossário de termos

---

## 10. Apêndices

### 10.1 Glossário Expandido

*(Vide seção 1.3 para termos principais)*

**Termos adicionais:**
- **Comarca:** Divisão territorial do Poder Judiciário
- **Promotoria:** Órgão de primeira instância do Ministério Público
- **Procuradoria:** Órgão de segunda instância do Ministério Público
- **ICP-Brasil:** Infraestrutura de Chaves Públicas Brasileira
- **SEI:** Sistema Eletrônico de Informações (Gov Federal)
- **SSO:** Single Sign-On (autenticação única)
- **SMTP:** Simple Mail Transfer Protocol (protocolo de e-mail)
- **API REST:** Interface de programação de aplicações baseada em HTTP
- **SPA:** Single Page Application (aplicação de página única)

### 10.2 Lista de MPs por Região

**Região Norte (7):**
- MPAC, MPAM, MPAP, MPPA, MPRO, MPRR, MPTO

**Região Nordeste (9):**
- MPAL, MPBA, MPCE, MPMA, MPPB, MPPE, MPPI, MPRN, MPSE

**Região Centro-Oeste (4):**
- MPDF, MPGO, MPMS, MPMT

**Região Sudeste (4):**
- MPES, MPMG, MPRJ, MPSP

**Região Sul (3):**
- MPPR, MPRS, MPSC

**Federal (1):**
- MPU (Ministério Público da União)

### 10.3 Referências Externas

- **Site oficial do CNMP:** https://www.cnmp.mp.br
- **Legislação:** http://www.planalto.gov.br
- **e-ARQ Brasil:** https://www.gov.br/conarq
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21
- **OWASP:** https://owasp.org/www-project-top-ten

---

## 11. Aprovações

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| **Patrocinador do Projeto** | [Nome do Corregedor Nacional] | _______________ | ___/___/_____ |
| **Gerente do Projeto** | [Nome do Coordenador NAD] | _______________ | ___/___/_____ |
| **Representante da STI** | [Nome do Diretor de TI] | _______________ | ___/___/_____ |
| **Representante dos Usuários** | [Nome do Assessor-Chefe] | _______________ | ___/___/_____ |

---

**Fim do Documento de Visão do Produto**

---

**Notas para a Fábrica de Software:**

Este documento estabelece a visão de alto nível do Sistema de Acompanhamento de Proposições. Para detalhes técnicos adicionais, consulte:
- **Modelo de Dados** (`modelo_de_dados.md`) - Estrutura completa do banco de dados
- **Especificação de Requisitos Funcionais** (a ser elaborado) - Casos de uso detalhados
- **Protótipo funcional** (arquivos HTML/CSS/JS) - Referência visual e comportamental

Para esclarecimentos, entre em contato com o Núcleo de Acompanhamento de Decisões (NAD) do CNMP.
