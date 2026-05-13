// ============================================
// SISTEMA DE AUTOCOMPLETE PARA MÉDICOS
// ============================================

class MedicoAutocomplete {
  constructor() {
    this.currentInput = null;
    this.suggestionBox = null;
    this.currentSuggestions = [];
    this.selectedIndex = -1;
    this.isVisible = false;
    this.replaceStart = 0;
    this.replaceEnd = 0;
    
    this.init();
  }

  init() {
    this.createSuggestionBox();
    this.attachEventListeners();
    console.log('Sistema de autocomplete para médicos inicializado');
  }

  createSuggestionBox() {
    this.suggestionBox = document.createElement('div');
    this.suggestionBox.className = 'medico-autocomplete-box';
    this.suggestionBox.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 200px;
      overflow-y: auto;
      z-index: 999999;
      display: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    document.body.appendChild(this.suggestionBox);
  }

  attachEventListeners() {
    // Listener global para inputs
    document.addEventListener('input', (e) => {
      // Ignora eventos que não foram disparados pelo usuário (como o espelhamento automático)
      if (!e.isTrusted) return;

      if (this.isMedicoField(e.target)) {
        // Adiciona indicador visual temporário
        e.target.style.borderColor = '#4CAF50';
        setTimeout(() => {
          e.target.style.borderColor = '';
        }, 1000);
        
        this.handleInput(e);
      }
    }, true);

    // Listener para teclas
    document.addEventListener('keydown', (e) => {
      if (this.isVisible && this.isMedicoField(e.target)) {
        this.handleKeydown(e);
      }
    }, true);

    // Listener para cliques fora
    document.addEventListener('click', (e) => {
      if (!this.suggestionBox.contains(e.target) && e.target !== this.currentInput) {
        this.hideSuggestions();
      }
    });

    // Listener para scroll (esconde sugestões)
    document.addEventListener('scroll', () => {
      if (this.isVisible) {
        this.hideSuggestions();
      }
    }, true);
    
    // Listener para focus - mostra indicador
    document.addEventListener('focus', (e) => {
      if (this.isMedicoField(e.target)) {
        // Adiciona placeholder temporário
        if (!e.target.placeholder) {
          e.target.placeholder = 'Digite o nome do médico em qualquer lugar do texto...';
        }
      }
    }, true);
  }

  isMedicoField(element) {
    if (!element || !['INPUT', 'TEXTAREA'].includes(element.tagName)) return false;
    
    // Verifica se é um campo de médico baseado em atributos comuns
    const label = element.getAttribute('controllabel') || '';
    const placeholder = element.placeholder || '';
    const name = element.name || '';
    const id = element.id || '';
    const formControlName = element.getAttribute('formcontrolname') || '';
    
    const medicoKeywords = [
      'medico', 'médico', 'doctor', 'dr', 'dra',
      'solicitante', 'requisitante', 'profissional',
      'hipotese', 'hipótese', 'diagnostica', 'diagnóstica',
      'observacao', 'observação', 'justificativa', 'descricao', 'descrição'
    ];
    
    const allText = `${label} ${placeholder} ${name} ${id} ${formControlName}`.toLowerCase();
    
    return medicoKeywords.some(keyword => allText.includes(keyword));
  }

  handleInput(e) {
    const input = e.target;
    const fullValue = input.value;
    const cursorPosition = input.selectionStart;
    
    this.currentInput = input;
    
    // Encontra a palavra atual onde está o cursor
    const textBeforeCursor = fullValue.substring(0, cursorPosition);
    
    // Procura pela última palavra antes do cursor (apenas letras e acentos)
    // Não inclui "DR" ou "DRA" na busca, apenas o nome
    const wordMatch = textBeforeCursor.match(/([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]{2,})$/i);
    
    if (!wordMatch) {
      this.hideSuggestions();
      return;
    }
    
    const searchTerm = wordMatch[1].trim();
    
    if (searchTerm.length < 2) {
      this.hideSuggestions();
      return;
    }
    
    // Busca médicos que contenham o termo digitado
    this.currentSuggestions = buscarMedicos(searchTerm);
    
    if (this.currentSuggestions.length === 0) {
      this.hideSuggestions();
      return;
    }
    
    // Salva a posição para substituição posterior (apenas a palavra, não DR/DRA)
    this.replaceStart = cursorPosition - wordMatch[1].length;
    this.replaceEnd = cursorPosition;
    
    this.showSuggestions();
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentSuggestions.length - 1);
        this.updateSelection();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection();
        break;
        
      case 'Tab':
      case 'Enter':
        if (this.selectedIndex >= 0) {
          e.preventDefault();
          this.selectSuggestion(this.selectedIndex);
        }
        break;
        
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  }

  showSuggestions() {
    if (!this.currentInput || this.currentSuggestions.length === 0) return;
    
    // Posiciona a caixa de sugestões
    const rect = this.currentInput.getBoundingClientRect();
    this.suggestionBox.style.left = rect.left + 'px';
    this.suggestionBox.style.top = (rect.bottom + window.scrollY) + 'px';
    this.suggestionBox.style.width = Math.max(rect.width, 300) + 'px';
    
    // Cria as sugestões
    this.suggestionBox.innerHTML = '';
    
    this.currentSuggestions.forEach((medico, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition: background 0.2s;
      `;
      
      // Formatação da sugestão
      const nomeCompleto = medico.nome.replace(/^DR[A]?\s+/i, ''); // Remove DR/DRA
      const especialidade = medico.especialidade;
      const crm = medico.crm;
      
      item.innerHTML = `
        <div style="font-weight: 500; color: #333;">${nomeCompleto}</div>
        <div style="font-size: 12px; color: #666; margin-top: 2px;">${especialidade} • ${crm}</div>
      `;
      
      // Eventos
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
      
      item.addEventListener('click', () => {
        this.selectSuggestion(index);
      });
      
      this.suggestionBox.appendChild(item);
    });
    
    this.suggestionBox.style.display = 'block';
    this.isVisible = true;
    this.selectedIndex = -1;
  }

  updateSelection() {
    const items = this.suggestionBox.querySelectorAll('.autocomplete-item');
    
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.style.backgroundColor = '#e3f2fd';
        item.style.color = '#1976d2';
      } else {
        item.style.backgroundColor = 'white';
        item.style.color = '#333';
      }
    });
  }

  selectSuggestion(index) {
    if (index < 0 || index >= this.currentSuggestions.length) return;
    
    const medico = this.currentSuggestions[index];
    
    // Remove "DR" ou "DRA" do nome para inserir apenas o nome + especialidade
    const nomeCompleto = medico.nome.replace(/^DR[A]?\s+/i, '');
    const textoParaInserir = `${nomeCompleto} ${medico.crm} - ${medico.especialidade}`;
    
    // Substitui apenas a parte que foi digitada, mantendo o resto do texto
    const fullValue = this.currentInput.value;
    const beforeText = fullValue.substring(0, this.replaceStart);
    const afterText = fullValue.substring(this.replaceEnd);
    
    const newValue = beforeText + textoParaInserir + afterText;
    const newCursorPosition = beforeText.length + textoParaInserir.length;
    
    // Atualiza o campo
    this.currentInput.value = newValue;
    this.currentInput.setSelectionRange(newCursorPosition, newCursorPosition);
    
    // Dispara eventos para que o sistema reconheça a mudança
    this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.currentInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Esconde sugestões
    this.hideSuggestions();
    
    // Mantém o foco no campo atual
    this.currentInput.focus();
  }

  hideSuggestions() {
    this.suggestionBox.style.display = 'none';
    this.isVisible = false;
    this.selectedIndex = -1;
    this.currentSuggestions = [];
  }

  // Método para adicionar médico dinamicamente
  adicionarMedicoRapido(nome, crm, especialidade = '') {
    const novoMedico = {
      nome: nome.toUpperCase(),
      crm: crm.toUpperCase(),
      especialidade: especialidade.toUpperCase(),
      busca: `${nome} ${crm} ${especialidade}`.toUpperCase()
    };
    
    adicionarMedico(novoMedico);
    console.log(`Novo médico adicionado: ${nome}`);
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Inicializa quando o DOM estiver pronto
function inicializarAutocomplete() {
  if (typeof buscarMedicos === 'undefined') {
    console.error('Base de dados de médicos não carregada');
    return;
  }
  
  window.medicoAutocomplete = new MedicoAutocomplete();
  
  console.log('Sistema de autocomplete ativado');
  console.log('Atalhos disponíveis:');
  console.log('- Tab/Enter: Aceitar sugestão de médico');
}

// Aguarda o carregamento da base de dados
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarAutocomplete);
} else {
  inicializarAutocomplete();
}