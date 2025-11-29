# 100 POINTS MILESTONE FEATURE - README

## Visão Geral
Este documento descreve a nova funcionalidade implementada que é ativada quando o jogador atinge 100 pontos totais no jogo.

## Fluxo da Funcionalidade

### 1. **Transição Inicial (100 Pontos)**
Quando o jogador acumula 100 pontos (somando Vivência + Imaginação + Território):
- Uma transição animada é exibida
- O jogador NPC recebe um lápis mágico ✍️✏️
- O personagem "cresce" com uma animação de escala
- Mensagens narrativas aparecem sequencialmente:
  - "O escritor ganha um lápis mágico..."
  - "...e cresce com o poder da escrita!"
- Duração: ~5 segundos
- Após a transição, o jogo automaticamente passa para o Desafio das Palavras

### 2. **Desafio das Palavras Ocultas**
Um mini-jogo de palavras embaralhadas:

**Palavras Disponíveis:**
- Poesia
- Vivências
- Criatividade
- prosa
- cordel
- Sentimentos
- território
- voz
- escrita

**Mecânica:**
- Uma palavra aleatória é selecionada e embaralhada
- O jogador tem 60 segundos para organizar as letras
- Timer com contagem regressiva visual (números ficam vermelhos nos últimos 10 segundos)
- Input de texto para digitar a resposta
- Possível enviar com botão ou tecla Enter

**Resultados:**
- **VITÓRIA**: Palavra correta → Transição para o Labirinto da Cidade
- **DERROTA**: Tempo esgotado ou palavra incorreta → Nova palavra é selecionada, tentativa recomeça

### 3. **Labirinto da Cidade** 
Novo ambiente após completar o desafio de palavras:

**Características:**
- Mapa 10x10 com emojis visuais:
  - 🏢 Edifícios (paredes/obstáculos)
  - 🛣️ Ruas (caminhos livres)
  - 🌟 Ponto especial (objetivo)
  - 🚶 Jogador
- Navegação com:
  - Botões direcionais na tela
  - Teclas de seta do teclado
- Ao encontrar o ponto especial (🌟), uma mensagem é exibida
- Opção de voltar ao território original a qualquer momento

## Implementação Técnica

### JavaScript (game.js)
**Novas Funções Adicionadas:**
- `showTransitionToWordChallenge()` - Exibe transição dos 100 pontos
- `fadeToWordChallenge()` - Efeito de fade entre cenas
- `renderWordChallenge()` - Renderiza o desafio de palavras
- `scrambleWord(word)` - Embaralha as letras da palavra
- `checkWordAnswer()` - Verifica se a resposta está correta
- `handleWordTimeout()` - Lida com timeout do timer
- `transitionToCityMaze()` - Transição para o labirinto
- `renderCityMaze()` - Renderiza o labirinto da cidade
- `drawCityMaze()` - Desenha o grid do labirinto
- `moveMaze(dx, dy)` - Controla movimento no labirinto

**Estado do Jogo Atualizado:**
```javascript
gameState: {
  ...
  milestone100: false,          // Flag de conquista dos 100 pontos
  wordChallengeCompleted: false, // Flag de conclusão do desafio
  currentWordChallenge: null,    // Palavra atual do desafio
  wordTimerInterval: null        // Referência do timer
}
```

### CSS (style.css)
**Novos Estilos Adicionados:**

**Transições:**
- `.transition-scene` - Container da cena de transição
- `.player-transform` - Animação de transformação do player
- `.player-small` e `.player-small.growing` - Estados da animação
- Animações: `fadeIn`, `fadeOut`, `slideIn`

**Desafio de Palavras:**
- `.word-challenge` - Container do desafio
- `.timer` - Estilo do cronômetro
- `.scrambled-word` - Exibição da palavra embaralhada (com animação pulse)
- Animação: `pulse`

**Labirinto:**
- `.city-maze` - Container do labirinto
- `.maze-container` - Wrapper do grid
- `.maze-grid` - Grid do labirinto

## Como Testar

1. **Acumule 100 pontos:**
   - Complete missões (Missão 1: +20, Missão 2: +15, Missão 3: +30, etc.)
   - Caminhe pelos biomas para ganhar pontos adicionais
   - Ou edite temporariamente o código para setar pontos manualmente

2. **Teste o Desafio de Palavras:**
   - Observe a palavra embaralhada
   - Digite a palavra corretamente
   - Ou deixe o tempo esgotar para ver o comportamento de restart

3. **Explore o Labirinto:**
   - Use arrow keys ou botões na tela
   - Navegue até o ponto especial (🌟)
   - Teste o botão de voltar ao mapa original

## Funcionalidades Futuras Sugeridas

Para o labirinto da cidade (atualmente sem desafios):
- NPCs com diálogos específicos da cidade
- Missões de escrita urbana
- Pontos de coleta de histórias
- Mini-desafios literários em pontos específicos
- Sistema de desbloqueio de áreas
- Conquistas especiais do labirinto

## Observações Importantes

- O milestone dos 100 pontos só é ativado UMA VEZ por sessão de jogo
- O timer do desafio de palavras é limpo corretamente ao mudar de tela
- Keyboard controls funcionam tanto no mapa principal quanto no labirinto
- A transição é automática e não pode ser pulada (design intencional para narrativa)
- Todas as animações usam CSS para performance otimizada

## Arquivos Modificados

1. **game.js** - Lógica principal, funções de transição, desafio e labirinto
2. **style.css** - Estilos e animações para todas as novas telas
3. **index.html** - Sem modificações necessárias (já estava preparado)

---

**Desenvolvido para: Jornadas do Território - O Jogo da Escrita Viva**
**Data: 2025-11-29**
