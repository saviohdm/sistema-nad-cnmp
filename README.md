# Sistema de Acompanhamento de Proposições - CNMP

Sistema web para acompanhamento de proposições decorrentes de correições realizadas pela Corregedoria Nacional do Ministério Público (CNMP).

## 📋 Sobre o Projeto

Este é um sistema de gestão para o Núcleo de Acompanhamento de Decisões (NAD) que permite:

- **Cadastro de Correições**: Registro de processos de correição realizados nos 27 Ministérios Públicos brasileiros
- **Gestão de Proposições**: Acompanhamento de proposições com controle de status e prazos
- **Workflow de Comprovação**: Órgãos correicionados enviam comprovações de cumprimento
- **Avaliação pela Corregedoria**: Análise e parecer sobre as comprovações enviadas
- **Histórico Completo**: Timeline detalhada de todas as interações e mudanças de status
- **Dashboard Analítico**: Visualização de estatísticas e indicadores de acompanhamento

## 🚀 Tecnologias

Este é um projeto **zero dependencies** construído com:

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização e responsividade
- **JavaScript Vanilla** - Lógica da aplicação (ES6+)

**Sem frameworks, sem build tools, sem npm** - apenas um único arquivo HTML autocontido.

## 📦 Como Executar

### Opção 1: Abrir diretamente no navegador
```bash
open index.html
```

### Opção 2: Servidor local (recomendado)
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (com npx)
npx http-server
```

Acesse: `http://localhost:8000`

## 👥 Perfis de Usuário

### Órgão Correicionado (User)
- Visualizar correições e proposições
- Enviar comprovações de cumprimento
- Anexar documentos comprobatórios
- Acompanhar histórico de avaliações

**Login de teste:**
- Usuário: `qualquer`
- Senha: `qualquer`
- Tipo: `user`

### Corregedoria Nacional (Admin)
- Todas as funcionalidades de usuário
- Cadastrar novas correições
- Cadastrar novas proposições
- Avaliar comprovações enviadas
- Emitir pareceres

**Login de teste:**
- Usuário: `qualquer`
- Senha: `qualquer`
- Tipo: `admin`

## 🔄 Workflow de Acompanhamento

```
1. Proposição criada → Status: Pendente
2. Órgão envia comprovação → Status: Em Análise
3. Corregedoria avalia:
   ✅ Adimplente (finaliza)
   ⚠️  Parcial (retorna para novo ciclo)
   ❌ Inadimplente (retorna para novo ciclo)
   🚫 Prejudicada (finaliza)
4. Se Parcial/Inadimplente → volta ao passo 2
```

## 📊 Status de Proposições

| Status | Descrição | Cor |
|--------|-----------|-----|
| **Pendente** | Aguardando comprovação inicial | Amarelo |
| **Em Análise** | Comprovação enviada, aguardando avaliação | Azul |
| **Adimplente** | Totalmente cumprida | Verde |
| **Parcial** | Parcialmente cumprida | Laranja |
| **Inadimplente** | Não cumprida | Vermelho |
| **Prejudicada** | Superada por nova legislação/decisão | Cinza |

## 🏗️ Estrutura do Código

O arquivo `index.html` (~1.900 linhas) está organizado em:

- **Linhas 1-657**: HTML e CSS (estilos, tema, timeline)
- **Linhas 658-1000**: Estrutura das páginas
- **Linhas 1001-1891**: JavaScript (lógica, dados, funções)

### Principais Funções

- `login()` - Autenticação e controle de acesso
- `showPage(pageId)` - Navegação SPA
- `updateDashboard()` - Atualização de estatísticas
- `renderProposicoesTable()` - Renderização da tabela de proposições
- `submitComprovacao()` - Envio de comprovação
- `submitAvaliacao()` - Avaliação pela Corregedoria
- `viewDetails(id)` - Exibição de timeline histórica

## 📁 Modelo de Dados

```javascript
correicoes: [
  {
    id: "COR-2024-01",
    numero: "001/2024",
    ramoMP: "mpba",
    ramoMPNome: "Ministério Público da Bahia",
    dataInicio: "2024-01-15",
    dataFim: "2024-03-30",
    observacoes: "..."
  }
]

proposicoes: [
  {
    id: "PROP-2024-0001",
    numero: "001/2024",
    correicaoId: "COR-2024-01",
    descricao: "...",
    prazo: "2024-06-30",
    prioridade: "alta",
    status: "em_analise",
    historico: [
      {
        tipo: "comprovacao",
        data: "2024-04-15T10:30:00",
        usuario: "Ministério Público da Bahia",
        descricao: "...",
        arquivos: ["documento.pdf"]
      },
      {
        tipo: "avaliacao",
        data: "2024-04-20T14:00:00",
        usuario: "Corregedoria Nacional",
        parecer: "...",
        statusAnterior: "em_analise",
        statusNovo: "adimplente"
      }
    ]
  }
]
```

## 🎨 Customização

As cores do sistema podem ser alteradas editando as variáveis CSS (linha 14):

```css
--primary-color: #003366;    /* Azul CNMP */
--secondary-color: #0066cc;  /* Azul claro */
--success-color: #28a745;    /* Verde */
--warning-color: #ffc107;    /* Amarelo */
--danger-color: #dc3545;     /* Vermelho */
```

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoint em 768px:
- Desktop: Sidebar fixa + área de conteúdo
- Mobile: Layout em coluna única

## 🔒 Segurança

**⚠️ IMPORTANTE**: Este é um **protótipo educacional**. Para produção, implemente:

- Autenticação real (OAuth, JWT, etc.)
- Backend com API REST
- Banco de dados persistente
- Upload real de arquivos
- Validação server-side
- Proteção CSRF
- Controle de acesso granular

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Leia o arquivo `CLAUDE.md` para entender a arquitetura
2. Faça suas modificações
3. Teste manualmente todas as funcionalidades
4. Envie um pull request

## 📧 Contato

Desenvolvido para o Conselho Nacional do Ministério Público (CNMP)
