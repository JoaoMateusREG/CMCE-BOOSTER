# CMCE BOOSTER

Esta extensão combina as funcionalidades de três extensões separadas em uma única solução otimizada para o sistema CMCE.

## 🚀 Funcionalidades

### 1. Busca CNS/CPF
- **Buscar CNS por CPF**: Consulta o CNS usando um CPF no SISREG
- **Buscar CPF por CNS**: Consulta o CPF usando um CNS no SISREG  
- **Preenchimento Completo**: Busca e preenche automaticamente todos os dados do paciente (nome, data de nascimento, sexo, etc.)
- **Interface Flutuante**: Botões aparecem automaticamente quando um formulário é detectado

### 2. Remoção de Carregamento
- Remove automaticamente as telas de carregamento do sistema
- Pode ser ativada/desativada via popup ou menu de contexto (clique direito)
- Melhora significativamente a velocidade de navegação

### 3. Monitor de Elementos
- Monitora campos de formulário em tempo real
- Exibe alertas automáticos baseados em regras configuradas
- Inclui informações sobre:
  - Procedimentos que precisam de APAC
  - Faixas etárias específicas
  - CIDs compatíveis com OCI do IOP
  - Orientações sobre médicos e procedimentos

### 4. 🆕 Autocomplete de Médicos
- **Sugestões Inteligentes**: Digite "DR GAB" e veja "DR GABRIEL SALES - CARDIOLOGIA"
- **Navegação por Teclado**: Use setas ↑↓ para navegar, Tab/Enter para aceitar
- **Base Expansível**: Adicione novos médicos facilmente
- **Busca por Especialidade**: Encontre médicos por área de atuação
- **Formatação Automática**: Inclui nome completo + especialidade automaticamente

## 📦 Instalação

1. Baixe todos os arquivos da pasta `CMCE BOOSTER`
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta `CMCE BOOSTER`

## 🎯 Como Usar

### Autocomplete de Médicos
1. **Detecção Automática**: A extensão detecta campos de médico automaticamente
2. **Digite o Início**: Comece digitando "DR GAB" ou "DRA MAR"
3. **Navegue**: Use ↑↓ para navegar pelas sugestões
4. **Aceite**: Pressione Tab ou Enter para aceitar a sugestão
5. **Adicione Novos**: Use o botão "Adicionar Médico" no popup

### Busca CNS/CPF
1. Acesse o formulário de cadastro no CMCE
2. Os botões aparecerão automaticamente no canto superior direito
3. Digite CPF ou CNS no campo do formulário
4. Clique no botão correspondente à busca desejada
5. Para preenchimento completo, use o botão "Preencher Completo"

### Remoção de Carregamento
- **Via Popup**: Clique no ícone da extensão e use o toggle
- **Via Menu**: Clique direito na página e selecione a opção de ativar/desativar

### Monitor de Elementos
- Funciona automaticamente ao digitar em campos de formulário
- Alertas aparecem no canto superior direito quando regras são acionadas
- Pode ser fechado clicando no "X" da notificação

## ⚡ Benefícios da Unificação

### Performance
- **Menos consumo de memória**: Uma única extensão ao invés de três
- **Menos processos**: Reduz a carga no navegador
- **Carregamento otimizado**: Scripts compartilhados e otimizados

### Manutenção
- **Atualizações centralizadas**: Uma única extensão para manter
- **Configuração simplificada**: Interface unificada no popup
- **Menos conflitos**: Evita interferências entre extensões

### Usabilidade
- **Interface consistente**: Design unificado e intuitivo
- **Controle centralizado**: Todas as funcionalidades em um local
- **Menos ícones**: Reduz a poluição visual na barra de extensões

## 🔧 Configurações Avançadas

### Personalizar Regras de Monitoramento
Edite o arquivo `regras.js` para adicionar/modificar alertas:

```javascript
{
  seletor: "select, input, textarea",
  valorEsperado: "NOVO_PROCEDIMENTO",
  mensagem: "Sua mensagem personalizada aqui",
  correspondenciaExata: false
}
```

### Permissões Necessárias
- `activeTab`: Para interagir com a aba ativa
- `scripting`: Para injetar scripts no CMCE
- `tabs`: Para comunicação entre abas
- `storage`: Para salvar configurações
- `contextMenus`: Para menu de contexto

## 🐛 Solução de Problemas

### Extensão não funciona
1. Verifique se está no site correto: `regulador.saude.pe.gov.br`
2. Recarregue a página
3. Verifique se a extensão está ativada em `chrome://extensions/`

### Botões não aparecem
1. Aguarde o carregamento completo da página
2. Verifique se há um formulário de cadastro aberto
3. Recarregue a extensão se necessário

### Busca não retorna resultados
1. Verifique se há uma aba do SISREG aberta: `sisregiii.saude.gov.br`
2. Certifique-se de que está logado no SISREG
3. Verifique se o CPF/CNS está correto

## 📝 Changelog

### v1.0 - Versão Unificada
- Combinação das três extensões originais
- Interface redesenhada e otimizada
- Performance melhorada
- Código refatorado e documentado
- **🆕 Autocomplete de médicos** com sugestões inteligentes
- **🆕 Base de dados expansível** de médicos
- **🆕 Formatação nome + especialidade** para fácil identificação

## 🤝 Suporte

Para dúvidas ou problemas, verifique:
1. Se todas as permissões estão concedidas
2. Se os sites estão acessíveis
3. Se não há conflitos com outras extensões

---

**Nota**: Esta extensão foi desenvolvida especificamente para uso interno com o sistema CMCE e requer acesso aos sites mencionados para funcionar corretamente.