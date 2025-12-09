# Como Resetar os Dados de Demonstração

## Problema
Ao abrir o sistema, não aparecem dados de demonstração (correições e proposições).

## Causa
O sistema armazena dados no **localStorage do navegador**. Se:
- O localStorage foi limpo manualmente
- Você não fez login ainda
- Os dados estão corrompidos

...então não haverá dados visíveis.

## Solução Rápida

### Opção 1: Resetar via Interface (RECOMENDADO)
1. Abra o arquivo `index.html` no navegador
2. Na tela de login, clique no link **"🔄 Resetar Dados de Demonstração"**
3. Confirme a ação
4. Faça login novamente:
   - **Perfil:** Corregedoria Nacional (admin) ou Órgão Correicionado (user)
   - **Usuário/Senha:** qualquer valor (não há validação no protótipo)
5. Os dados de demonstração serão carregados automaticamente

### Opção 2: Limpar via Console do Navegador
1. Abra o Console do Navegador (F12)
2. Digite: `localStorage.clear()`
3. Pressione Enter
4. Recarregue a página (F5)
5. Faça login

### Opção 3: Limpar Dados do Site
**Chrome/Edge:**
1. Pressione F12 (DevTools)
2. Vá em "Application" > "Storage" > "Clear site data"
3. Clique em "Clear site data"
4. Recarregue a página

**Firefox:**
1. Pressione F12 (DevTools)
2. Vá em "Storage" > "Local Storage"
3. Clique com botão direito > "Delete All"
4. Recarregue a página

## Fluxo Normal de Inicialização

```
1. Abrir index.html
   ↓
2. Tela de LOGIN aparece
   ↓
3. Preencher formulário e clicar "Entrar"
   ↓
4. Sistema verifica localStorage:
   - Se vazio → carrega dados de demonstração
   - Se tem dados → usa dados existentes
   ↓
5. Dashboard aparece com dados
```

## Dados de Demonstração Incluídos

Após resetar, o sistema terá:
- **5 Correições** (MPBA, MPRJ, MPMG, MPSP, MPU)
- **13 Proposições** em diversos status:
  - 2 adimplentes
  - 5 pendentes
  - 4 aguardando comprovação
  - 1 em análise
  - 1 prejudicada
- Histórico completo de publicações, comprovações e avaliações

## Troubleshooting

### "Não aparece a tela de login"
- Verifique se o arquivo `app.js` está no mesmo diretório que `index.html`
- Abra o Console (F12) e veja se há erros JavaScript

### "Fiz login mas ainda não aparecem dados"
- Abra o Console (F12)
- Digite: `console.log(correicoes, proposicoes)`
- Se aparecer arrays vazios `[]`, use a Opção 1 para resetar

### "Dados aparecem mas estão incompletos"
- Pode ser que tenha dados antigos misturados
- Use a Opção 1 para resetar completamente

## Informações Técnicas

**Onde os dados são armazenados:**
- `localStorage.correicoes` - Array de correições
- `localStorage.proposicoes` - Array de proposições

**Como o sistema funciona:**
1. Ao fazer login, chama `loadFromLocalStorage()`
2. Se retornar `false` (não tem dados), chama `initializeSampleData()`
3. Depois salva com `saveToLocalStorage()`
4. Todas as alterações são persistidas no localStorage

**Arquivo:** `app.js` linhas 17-32 (funções de localStorage)
**Arquivo:** `app.js` linhas 234-656 (dados de amostra)
