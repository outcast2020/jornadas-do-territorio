// ESTADO GLOBAL DO JOGO
const gameState = {
  profile: null,
  points: { vivencia: 0, imaginacao: 0, territorio: 0 },
  missions: {
    world1_m1: false,
    world1_m2: false,
    world1_m3: false,
    lit_fugaz: false,
    tematica: false
  },
  milestone100: false,
  wordChallengeCompleted: false,
  currentWordChallenge: null,
  controlsBlocked: false, // Flag to block player movement

  // posição do avatar no mapa (coordenadas de grid)
  playerPosition: { x: 10, y: 10 }, // Start position adjusted for larger map

  // NPCs (Static positions for now)
  npcs: [
    { x: 2, y: 2, type: 'npc-vivencia', msg: 'Aqui a vida acontece nos detalhes.' },
    { x: 10, y: 5, type: 'npc-imaginacao', msg: 'O laboratório é onde o sonho ganha forma.' },
    { x: 2, y: 9, type: 'npc-territorio', msg: 'Nossa voz precisa ocupar todos os espaços.' },
    { x: 17, y: 9, type: 'npc-fugaz', msg: 'Psst... viu algo passar por aqui?' }
  ],

  // textos guardados das missões
  m1_text: '',
  m2_image_poem: '',
  m2_user_verse: '',
  m3_new_verse: '',
  lit_fugaz_text: '',
  tematica_text: '',
  tematica_chosen: ''
};

// ========== MAPA EXPANDIDO (20x12) ========== //
const mapWidth = 20;
const mapHeight = 12;

// Cada linha = y, cada coluna = x
// Legend:
// 'decor': Wall/Border
// 'empty': Grass/Path
// 'start': Start Point
// 'm1', 'lab', 'm3', 'lit', 'tematica': Missions
// 'laje', 'feira', 'quadra', 'igreja', 'ponto': Biomes
const mapTiles = [
  // y=0
  ['decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor'],
  // y=1
  ['decor', 'laje', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'tematica', 'empty', 'decor'],
  // y=2
  ['decor', 'empty', 'm1', 'empty', 'empty', 'laje', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=3
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=4
  ['decor', 'empty', 'empty', 'empty', 'feira', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=5
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'lab', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=6
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=7
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'quadra', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=8
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=9
  ['decor', 'empty', 'm3', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'igreja', 'empty', 'lit', 'empty', 'decor'],
  // y=10
  ['decor', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'start', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'decor'],
  // y=11
  ['decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor', 'decor']
];

// ATUALIZA HUD (pontuação)
function updateHUD() {
  const v = document.getElementById('p-vivencia');
  const i = document.getElementById('p-imaginacao');
  const t = document.getElementById('p-territorio');
  if (!v || !i || !t) return;
  v.textContent = gameState.points.vivencia;
  i.textContent = gameState.points.imaginacao;
  t.textContent = gameState.points.territorio;

  // Check for 100 points milestone
  const totalPoints = gameState.points.vivencia + gameState.points.imaginacao + gameState.points.territorio;
  if (totalPoints >= 100 && !gameState.milestone100) {
    gameState.milestone100 = true;
    // Immediately and unavoidably trigger transition - no delay
    showTransitionToWordChallenge();
  }
}

// ========== SISTEMA DE DIÁLOGO ========== //
function showDialog(text, onDismiss) {
  let overlay = document.getElementById('dialog-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = '<div class="dialog-box"></div>';
    document.body.appendChild(overlay);
  }

  const box = overlay.querySelector('.dialog-box');
  box.textContent = text;
  overlay.style.display = 'flex';

  // Remove listener anterior para evitar múltiplos disparos
  const newOverlay = overlay.cloneNode(true);
  overlay.parentNode.replaceChild(newOverlay, overlay);

  newOverlay.onclick = () => {
    newOverlay.style.display = 'none';
    if (onDismiss) onDismiss();
  };
}

// Helper function to navigate safely (respects milestone transition)
function safeNavigateToMap() {
  // If the milestone transition is already triggered or controls are blocked,
  // do NOT return to map - the transition will handle navigation
  if (gameState.milestone100 || gameState.controlsBlocked) {
    return; // Block navigation
  }
  renderScreen('world_map');
}

// ========== 100 POINTS MILESTONE TRANSITION ========== //

function showTransitionToWordChallenge() {
  // Block all game controls immediately
  gameState.controlsBlocked = true;

  // Create a full-screen overlay that takes over everything
  const overlay = document.createElement('div');
  overlay.id = 'milestone-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.animation = 'fadeIn 0.5s ease-in';

  overlay.innerHTML = `
    <div class="center transition-scene" style="background: var(--bg-color); padding: 40px; border: 4px solid var(--border-color); max-width: 600px; box-shadow: 0 0 50px rgba(255, 222, 0, 0.5);">
      <div id="transition-content">
        <h1>🎉 CONQUISTA DESBLOQUEADA! 🎉</h1>
        <p>Você alcançou 100 pontos!</p>
        <div id="player-transform" class="player-transform">
          <div class="player-small">✍️</div>
        </div>
        <p id="transform-text"></p>
      </div>
    </div>
  `;

  // Append overlay to body (not app) so it's truly unavoidable
  document.body.appendChild(overlay);

  // Animate transformation
  setTimeout(() => {
    const textEl = document.getElementById('transform-text');
    if (textEl) textEl.textContent = 'O escritor ganha um lápis mágico...';
  }, 1000);

  setTimeout(() => {
    const playerEl = document.querySelector('.player-small');
    if (playerEl) {
      playerEl.classList.add('growing');
      playerEl.textContent = '✍️✏️';
    }
  }, 2500);

  setTimeout(() => {
    const textEl = document.getElementById('transform-text');
    if (textEl) textEl.textContent = '...e cresce com o poder da escrita!';
  }, 3000);

  setTimeout(() => {
    // Remove overlay before transitioning
    const milestoneOverlay = document.getElementById('milestone-overlay');
    if (milestoneOverlay) {
      milestoneOverlay.remove();
    }
    fadeToWordChallenge();
  }, 5000);
}

function fadeToWordChallenge() {
  const app = document.getElementById('app');
  app.classList.add('fade-out');

  setTimeout(() => {
    app.classList.remove('fade-out');
    renderWordChallenge();
  }, 1000);
}

// ========== WORD CHALLENGE GAME ========== //

const challengeWords = [
  'Poesia', 'Vivências', 'Criatividade', 'prosa',
  'cordel', 'Sentimentos', 'território', 'voz', 'escrita'
];

function renderWordChallenge() {
  // Select a random word if not already set
  if (!gameState.currentWordChallenge) {
    const randomIndex = Math.floor(Math.random() * challengeWords.length);
    gameState.currentWordChallenge = challengeWords[randomIndex];
  }

  const word = gameState.currentWordChallenge;
  const scrambled = scrambleWord(word);

  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="form word-challenge">
      <h2>🧩 Desafio das Palavras Ocultas</h2>
      <p>Organize as letras para formar a palavra correta!</p>
      <p class="hint">Dica: Relacionado à literatura e território</p>
      
      <div class="timer" id="timer">
        <span>⏱️ Tempo: </span>
        <span id="time-remaining">60</span>
        <span> segundos</span>
      </div>
      
      <div class="scrambled-word">${scrambled.split('').join(' ')}</div>
      
      <label>Digite a palavra:
        <input id="word-input" type="text" placeholder="Digite aqui..." autocomplete="off" />
      </label>
      
      <button id="btn-submit-word">Enviar Resposta</button>
      <div id="word-feedback"></div>
    </section>
  `;

  // Start countdown
  let timeLeft = 60;
  const timerInterval = setInterval(() => {
    timeLeft--;
    const timeEl = document.getElementById('time-remaining');
    if (timeEl) {
      timeEl.textContent = timeLeft;
      if (timeLeft <= 10) {
        timeEl.style.color = 'red';
        timeEl.style.fontWeight = 'bold';
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleWordTimeout();
    }
  }, 1000);

  // Submit button handler
  document.getElementById('btn-submit-word').onclick = () => {
    clearInterval(timerInterval);
    checkWordAnswer();
  };

  // Allow Enter key to submit
  document.getElementById('word-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      clearInterval(timerInterval);
      checkWordAnswer();
    }
  });

  // Store timer interval in case we need to clear it
  gameState.wordTimerInterval = timerInterval;
}

function scrambleWord(word) {
  const arr = word.split('');
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function checkWordAnswer() {
  const input = document.getElementById('word-input').value.trim();
  const correct = gameState.currentWordChallenge;

  if (input.toLowerCase() === correct.toLowerCase()) {
    // Success!
    gameState.wordChallengeCompleted = true;
    gameState.currentWordChallenge = null;
    showDialog('🎊 Parabéns! Você acertou a palavra!', () => {
      transitionToCityMaze();
    });
  } else {
    // Wrong answer
    showDialog('❌ Ops! Palavra incorreta. Tente novamente com outra palavra.', () => {
      gameState.currentWordChallenge = null; // Reset to get a new word
      renderWordChallenge();
    });
  }
}

function handleWordTimeout() {
  showDialog('⏰ Tempo esgotado! Vamos tentar com outra palavra.', () => {
    gameState.currentWordChallenge = null; // Reset to get a new word
    renderWordChallenge();
  });
}

// ========== CITY MAZE LEVEL ========== //

function transitionToCityMaze() {
  const app = document.getElementById('app');
  app.classList.add('fade-out');

  setTimeout(() => {
    app.classList.remove('fade-out');
    renderCityMaze();
  }, 1000);
}

function renderCityMaze() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="city-maze">
      <h2>🏙️ Labirinto da Cidade</h2>
      <p>Você entrou em um novo território urbano!</p>
      <p class="hint">Explore as ruas da cidade. Novos desafios virão em breve...</p>
      
      <div class="maze-container">
        <div class="maze-grid" id="city-maze-grid"></div>
      </div>
      
      <div class="controls">
        <button id="btn-maze-up">↑</button>
        <div style="display:flex; gap:4px;">
          <button id="btn-maze-left">←</button>
          <button id="btn-maze-down">↓</button>
          <button id="btn-maze-right">→</button>
        </div>
      </div>
      
      <div style="text-align:center; margin-top:20px;">
        <button id="btn-back-to-map">Voltar ao Território Original</button>
      </div>
    </section>
  `;

  drawCityMaze();

  // Movement controls
  document.getElementById('btn-maze-up').onclick = () => moveMaze(0, -1);
  document.getElementById('btn-maze-down').onclick = () => moveMaze(0, 1);
  document.getElementById('btn-maze-left').onclick = () => moveMaze(-1, 0);
  document.getElementById('btn-maze-right').onclick = () => moveMaze(1, 0);

  document.getElementById('btn-back-to-map').onclick = () => renderScreen('world_map');
}

// Simple city maze (10x10 grid)
const cityMazeData = [
  ['🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢'],
  ['🏢', '🛣️', '🛣️', '🛣️', '🏢', '🛣️', '🛣️', '🛣️', '🛣️', '🏢'],
  ['🏢', '🛣️', '🏢', '🛣️', '🏢', '🛣️', '🏢', '🏢', '🛣️', '🏢'],
  ['🏢', '🛣️', '🏢', '🛣️', '🛣️', '🛣️', '🛣️', '🏢', '🛣️', '🏢'],
  ['🏢', '🛣️', '🏢', '🏢', '🏢', '🏢', '🛣️', '🏢', '🛣️', '🏢'],
  ['🏢', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🏢', '🛣️', '🏢'],
  ['🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🛣️', '🏢', '🛣️', '🏢'],
  ['🏢', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🛣️', '🏢'],
  ['🏢', '🛣️', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🌟', '🏢'],
  ['🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢', '🏢']
];

let mazePlayerPos = { x: 1, y: 1 }; // Start position in maze

function drawCityMaze() {
  const grid = document.getElementById('city-maze-grid');
  if (!grid) return;

  grid.innerHTML = '';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(10, 40px)';
  grid.style.gap = '2px';
  grid.style.margin = '20px auto';
  grid.style.width = 'fit-content';

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.style.width = '40px';
      cell.style.height = '40px';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '24px';
      cell.style.border = '1px solid #ccc';
      cell.style.position = 'relative';

      if (x === mazePlayerPos.x && y === mazePlayerPos.y) {
        cell.textContent = '🚶';
        cell.style.backgroundColor = '#ffeb3b';
      } else {
        cell.textContent = cityMazeData[y][x];
        if (cityMazeData[y][x] === '🛣️') {
          cell.style.backgroundColor = '#e0e0e0';
        } else if (cityMazeData[y][x] === '🏢') {
          cell.style.backgroundColor = '#90a4ae';
        } else if (cityMazeData[y][x] === '🌟') {
          cell.style.backgroundColor = '#ffd54f';
        }
      }

      grid.appendChild(cell);
    }
  }
}

function moveMaze(dx, dy) {
  const newX = mazePlayerPos.x + dx;
  const newY = mazePlayerPos.y + dy;

  // Check bounds
  if (newX < 0 || newX >= 10 || newY < 0 || newY >= 10) return;

  // Check if it's a wall (building)
  if (cityMazeData[newY][newX] === '🏢') return;

  // Move player
  mazePlayerPos = { x: newX, y: newY };
  drawCityMaze();

  // Check if reached the goal
  if (cityMazeData[newY][newX] === '🌟') {
    showDialog('🌟 Você encontrou um ponto especial da cidade! Mais aventuras virão...', () => {
      renderScreen('world_map');
    });
  }
}

// ========== SISTEMA DE TELAS ========== //

function renderScreen(id) {
  const app = document.getElementById('app');
  if (!app) return;

  // SPLASH
  if (id === 'splash') {
    app.innerHTML = `
      <section class="center">
        <h1>Jornadas do Território</h1>
        <p>Um jogo de escrita viva, memória e território.</p>
        <p>Aqui, quem escreve é você. A IA entra só depois — sua história é essencial.</p>
        <button id="btn-start">Começar jornada</button>
      </section>
    `;
    document.getElementById('btn-start').onclick = () => renderScreen('create_profile');
    return;
  }

  // PERFIL
  if (id === 'create_profile') {
    app.innerHTML = `
      <section class="form">
        <h2>Quem é você na quebrada do poema?</h2>
        <label>Seu nome ou apelido poético
          <input id="nome-poetico" placeholder="Ex.: Nina da Laje" />
        </label>
        <label>De onde você fala?
          <input id="territorio" placeholder="Bairro, comunidade ou cidade" />
        </label>
        <button id="btn-save">Salvar e continuar</button>
      </section>
    `;
    document.getElementById('btn-save').onclick = () => {
      const nome = document.getElementById('nome-poetico').value.trim();
      const terr = document.getElementById('territorio').value.trim();
      if (!nome) {
        showDialog('Precisa pelo menos do nome ou apelido poético.');
        return;
      }
      gameState.profile = { nome, territorio: terr };
      renderScreen('world_map');
    };
    return;
  }

  // MAPA
  if (id === 'world_map') {
    renderMapScreen();
    return;
  }

  // MISSÃO 1
  if (id === 'world1_m1') {
    app.innerHTML = `
      <section class="form">
        <h2>Missão 1: Despertar da Vivência</h2>
        <p>Escolha um fragmento da sua vida real — algo pequeno, cotidiano, íntimo.</p>
        <textarea id="m1-text" placeholder="Ex.: O som do ônibus passando na subida da minha rua de madrugada.">${gameState.m1_text}</textarea>
        <button id="btn-m1">Concluir missão</button>
        <button id="btn-m1-back">Voltar ao mapa</button>
      </section>
    `;
    document.getElementById('btn-m1').onclick = () => {
      const txt = document.getElementById('m1-text').value.trim();
      if (!txt) {
        showDialog('Tente escrever pelo menos uma frase sobre a sua vivência.');
        return;
      }
      gameState.missions.world1_m1 = true;
      gameState.m1_text = txt;
      gameState.points.vivencia += 20;
      updateHUD();
      showDialog('Vivência registrada! Você ganhou +20 Pontos de Vivência.', () => safeNavigateToMap());
    };
    document.getElementById('btn-m1-back').onclick = () => safeNavigateToMap();
    return;
  }

  // MISSÃO 2 – LABORATÓRIO
  if (id === 'world1_m2') {
    app.innerHTML = `
      <section class="form">
        <h2>Missão 2: Mapa Simbólico do Sentir</h2>
        <p>Vamos criar uma imagem-poema: Substantivo + Adjetivos + Conector + Ambiente.</p>
        <label>Substantivo
          <input id="m2-noun" placeholder="Ex.: vento, rua, silêncio, laje..." />
        </label>
        <label>Adjetivos (1 a 3)
          <input id="m2-adj" placeholder="Ex.: pesado, elétrico, silencioso..." />
        </label>
        <label>Ambiente do seu território
          <input id="m2-env" placeholder="Ex.: laje, ponto de ônibus, feira..." />
        </label>
        <label>Conector
          <input id="m2-con" placeholder="Ex.: em, sobre, perto de..." />
        </label>
        <button id="btn-m2-generate">Gerar imagem-poema</button>
        <div id="m2-result"></div>
        <button id="btn-m2-back">Voltar ao mapa</button>
      </section>
    `;

    document.getElementById('btn-m2-generate').onclick = () => {
      const noun = document.getElementById('m2-noun').value.trim();
      const adj = document.getElementById('m2-adj').value.trim();
      const env = document.getElementById('m2-env').value.trim();
      const con = document.getElementById('m2-con').value.trim() || 'em';

      if (!noun || !adj || !env) {
        showDialog('Preencha pelo menos substantivo, adjetivos e ambiente.');
        return;
      }

      const imagePoem = `${noun} ${adj} ${con} ${env}`;
      gameState.m2_image_poem = imagePoem;

      document.getElementById('m2-result').innerHTML = `
        <hr>
        <p><strong>Imagem-poema:</strong> ${imagePoem}</p>
        <label>Escreva um verso a partir dessa imagem
          <textarea id="m2-verse" placeholder="Ex.: O vento elétrico varre a laje em silêncio.">${gameState.m2_user_verse}</textarea>
        </label>
        <button id="btn-m2-finish">Concluir missão</button>
      `;

      document.getElementById('btn-m2-finish').onclick = () => {
        const verse = document.getElementById('m2-verse').value.trim();
        if (!verse) {
          showDialog('Escreva pelo menos um verso.');
          return;
        }
        gameState.m2_user_verse = verse;
        gameState.missions.world1_m2 = true;
        gameState.points.imaginacao += 15;
        updateHUD();
        showDialog('Missão 2 concluída! Você ganhou +15 Pontos de Imaginação.', () => safeNavigateToMap());
      };
    };

    document.getElementById('btn-m2-back').onclick = () => safeNavigateToMap();
    return;
  }

  // MISSÃO 3 – INSCRIÇÃO TERRITORIAL
  if (id === 'world1_m3') {
    const appVerse = gameState.m2_user_verse || '(Você ainda não concluiu a Missão 2)';
    app.innerHTML = `
      <section class="form">
        <h2>Missão 3: Inscrição Territorial da Voz</h2>
        <p>Reescreva seu verso incluindo: uma cor, um som, um gesto e algo da sua rua/bairro.</p>
        <p><strong>Verso anterior:</strong> ${appVerse}</p>
        <textarea id="m3-text" placeholder="Ex.: O vento elétrico varre a laje azul enquanto alguém bate palma no portão da minha rua.">${gameState.m3_new_verse}</textarea>
        <button id="btn-m3">Concluir missão</button>
        <button id="btn-m3-back">Voltar ao mapa</button>
      </section>
    `;
    document.getElementById('btn-m3').onclick = () => {
      const txt = document.getElementById('m3-text').value.trim();
      if (!txt) {
        showDialog('Escreva seu novo verso com o território.');
        return;
      }
      gameState.m3_new_verse = txt;
      gameState.missions.world1_m3 = true;
      gameState.points.territorio += 30;
      updateHUD();
      showDialog('Missão 3 concluída! Você ganhou +30 Pontos de Território.', () => safeNavigateToMap());
    };
    document.getElementById('btn-m3-back').onclick = () => safeNavigateToMap();
    return;
  }

  // ========= MISSÃO LITERÁRIA – ENCONTRO FUGAZ =========
  if (id === 'lit_fugaz') {
    app.innerHTML = `
      <section class="form">
        <h2>Missão Literária: Encontro Fugaz no Território</h2>
        <p>
          Em alguns lugares, um encontro dura só alguns segundos e muda tudo por dentro. 
        </p>
        <textarea id="lit-text" placeholder="Descreva a cena em poucas linhas, como se fosse um flash de filme.">${gameState.lit_fugaz_text}</textarea>
        <button id="btn-lit">Concluir missão literária</button>
        <button id="btn-lit-back">Voltar ao mapa</button>
      </section>
    `;

    document.getElementById('btn-lit').onclick = () => {
      const txt = document.getElementById('lit-text').value.trim();
      if (!txt) {
        showDialog('Escreva pelo menos algumas linhas sobre essa cena fugaz.');
        return;
      }
      gameState.lit_fugaz_text = txt;
      gameState.missions.lit_fugaz = true;
      gameState.points.imaginacao += 20;
      gameState.points.territorio += 10;
      updateHUD();
      showDialog('Missão literária concluída! Você ganhou +20 Imaginação e +10 Território.', () => safeNavigateToMap());
    };

    document.getElementById('btn-lit-back').onclick = () => safeNavigateToMap();
    return;
  }

  // ========= MISSÃO TEMÁTICA – BIBLIOTECAS =========
  if (id === 'mission_tematica') {
    const themes = [
      "Cultura Afro-brasileira",
      "Contos de Fadas",
      "Cinema",
      "Ciências",
      "Arquitetura e Urbanismo",
      "Poesia",
      "Música",
      "Meio Ambiente e Sustentabilidade",
      "Literatura Policial",
      "Literatura Fantástica",
      "Literatura Feminista",
      "Cultura Popular",
      "Direitos Humanos"
    ];

    // Create options
    const optionsHtml = themes.map(t => `<option value="${t}">${t}</option>`).join('');

    app.innerHTML = `
      <section class="form">
        <h2>Desafio das Bibliotecas Temáticas</h2>
        <p>
          As bibliotecas de São Paulo guardam tesouros temáticos. 
          Escolha um tema e escreva um pequeno texto ou poema inspirado nele.
        </p>
        <label>Escolha o tema:
          <select id="tematica-select" style="width:100%; padding:8px; margin-top:4px;">
            ${optionsHtml}
          </select>
        </label>
        <textarea id="tematica-text" placeholder="Escreva aqui sua inspiração sobre o tema escolhido...">${gameState.tematica_text}</textarea>
        <button id="btn-tematica">Concluir Desafio</button>
        <button id="btn-tematica-back">Voltar ao mapa</button>
      </section>
    `;

    document.getElementById('btn-tematica').onclick = () => {
      const theme = document.getElementById('tematica-select').value;
      const txt = document.getElementById('tematica-text').value.trim();
      if (!txt) {
        showDialog('Escreva algo sobre o tema escolhido.');
        return;
      }
      gameState.tematica_chosen = theme;
      gameState.tematica_text = txt;
      gameState.missions.tematica = true;
      gameState.points.imaginacao += 25;
      gameState.points.vivencia += 10;
      updateHUD();
      showDialog(`Desafio de ${theme} concluído! +25 Imaginação, +10 Vivência.`, () => safeNavigateToMap());
    };

    document.getElementById('btn-tematica-back').onclick = () => safeNavigateToMap();
    return;
  }
}

// ========== MAPA VISUAL + MOVIMENTO ========== //

function renderMapScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="map-wrapper">
      <h2>Território</h2>
      <div id="map" class="map-grid"></div>
      
      <div class="controls">
        <button id="btn-up">↑</button>
        <div style="display:flex; gap:4px;">
            <button id="btn-left">←</button>
            <button id="btn-down">↓</button>
            <button id="btn-right">→</button>
        </div>
      </div>
      
      <div class="biome-legend">
        <span class="legend-tile laje">Laje</span>
        <span class="legend-tile feira">Feira</span>
        <span class="legend-tile quadra">Quadra</span>
        <span class="legend-tile igreja">Igreja</span>
        <span class="legend-tile ponto">Ponto</span>
        <span class="legend-tile lit">Encontro</span>
        <span class="legend-tile tematica">Biblioteca Temática</span>
      </div>
      
      <div style="text-align:center; margin-top:20px; display:flex; flex-direction:column; gap:8px;">
        <button id="btn-library" style="background:#81d4fa; color:#000;">📖 Ler Cordéis Encontrados</button>
        <button id="btn-send-email" style="background:#ffeb3b; color:#000;">💾 Baixar Jornada (.doc)</button>
      </div>
    </section>
  `;

  drawMap();
  updatePlayerPosition();

  document.getElementById('btn-up').onclick = () => step(0, -1);
  document.getElementById('btn-down').onclick = () => step(0, 1);
  document.getElementById('btn-left').onclick = () => step(-1, 0);
  document.getElementById('btn-right').onclick = () => step(1, 0);

  document.getElementById('btn-send-email').onclick = sendEmail;
  document.getElementById('btn-library').onclick = showLibrary;
}

function showLibrary() {
  const app = document.getElementById('app');
  let poemsHtml = '';
  if (typeof cordelLibrary !== 'undefined') {
    poemsHtml = cordelLibrary.map(p => `
      <div style="margin-bottom:24px; border-bottom:1px dashed #ccc; padding-bottom:16px;">
        <h3 style="margin-bottom:8px; color:#d32f2f;">${p.title}</h3>
        <pre style="font-family:inherit; white-space:pre-wrap; line-height:1.6;">${p.body}</pre>
      </div>
    `).join('');
  } else {
    poemsHtml = '<p>Nenhum cordel encontrado na biblioteca.</p>';
  }

  app.innerHTML = `
    <section class="form">
      <h2>Biblioteca de Cordel</h2>
      <p>Versos recolhidos na memória do território.</p>
      <div style="max-height:300px; overflow-y:auto; text-align:left;">
        ${poemsHtml}
      </div>
      <button id="btn-lib-back">Voltar ao Mapa</button>
    </section>
  `;

  document.getElementById('btn-lib-back').onclick = () => safeNavigateToMap();
}

function drawMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  mapEl.innerHTML = '';
  mapEl.style.gridTemplateColumns = `repeat(${mapWidth}, 32px)`;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const tileType = mapTiles[y][x];
      const tile = document.createElement('div');
      tile.classList.add('tile');

      if (tileType === 'decor') tile.classList.add('tile-decor');
      if (tileType === 'start') tile.classList.add('tile-start');
      if (tileType === 'm1' || tileType === 'lab' || tileType === 'm3') {
        tile.classList.add('tile-mission');
      }
      if (tileType === 'laje') tile.classList.add('tile-laje');
      if (tileType === 'feira') tile.classList.add('tile-feira');
      if (tileType === 'quadra') tile.classList.add('tile-quadra');
      if (tileType === 'igreja') tile.classList.add('tile-igreja');
      if (tileType === 'ponto') tile.classList.add('tile-ponto');
      if (tileType === 'lit') tile.classList.add('tile-lit');
      if (tileType === 'tematica') tile.classList.add('tile-tematica');

      mapEl.appendChild(tile);
    }
  }

  // Render NPCs
  gameState.npcs.forEach(npc => {
    const npcEl = document.createElement('div');
    npcEl.classList.add('npc-base', npc.type); // Use base class + specific type
    npcEl.style.left = (npc.x * 32) + 'px';
    npcEl.style.top = (npc.y * 32) + 'px';

    // Assign Emojis for Human Representation
    if (npc.type === 'npc-vivencia') npcEl.textContent = '👵🏾';
    if (npc.type === 'npc-imaginacao') npcEl.textContent = '🧑🏽';
    if (npc.type === 'npc-territorio') npcEl.textContent = '👦🏿';
    if (npc.type === 'npc-fugaz') npcEl.textContent = '👤';

    mapEl.appendChild(npcEl);
  });

  // Cria o elemento do jogador
  const player = document.createElement('div');
  player.id = 'player-sprite';
  player.classList.add('player-sprite');
  mapEl.appendChild(player);
}

function updatePlayerPosition() {
  const player = document.getElementById('player-sprite');
  if (player) {
    player.style.left = (gameState.playerPosition.x * 32) + 'px';
    player.style.top = (gameState.playerPosition.y * 32) + 'px';
  }
}

// Movimento
function step(dx, dy) {
  // Block movement if controls are blocked (during transition)
  if (gameState.controlsBlocked) return;

  const newX = gameState.playerPosition.x + dx;
  const newY = gameState.playerPosition.y + dy;

  if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) return;

  const tileType = mapTiles[newY][newX];
  if (tileType === 'decor') return; // muro / borda

  gameState.playerPosition = { x: newX, y: newY };
  updatePlayerPosition();

  // Pequeno delay para permitir a animação antes do evento (opcional)
  setTimeout(() => handleTileEvent(tileType), 300);
}

// Eventos dos tiles
function handleTileEvent(tileType) {
  // Check for NPC interaction first
  const npc = gameState.npcs.find(n => n.x === gameState.playerPosition.x && n.y === gameState.playerPosition.y);

  if (tileType === 'm1') {
    showDialog('Dona Cida: "Ei, meu filho! Senta aqui. A vida é feita de detalhes, né? Me conta um..."', () => renderScreen('world1_m1'));
  }
  else if (tileType === 'lab') {
    showDialog('Cauã: "Opa! Aqui no laboratório a gente mistura sonho com realidade. Bora criar?"', () => renderScreen('world1_m2'));
  }
  else if (tileType === 'm3') {
    showDialog('Zé do Boné: "Aí, a quebrada tem voz! Mas ela precisa ocupar o muro, a rua, o papel. Manda a letra!"', () => renderScreen('world1_m3'));
  }
  else if (tileType === 'lit') {
    showDialog('Viajante: "Psst... viu aquele vulto? Foi rápido, né? Escreve antes que suma da memória."', () => renderScreen('lit_fugaz'));
  }
  else if (tileType === 'tematica') {
    showDialog('Bibliotecária: "Bem-vindo! Aqui guardamos saberes de todos os cantos. Escolha um tema e se inspire."', () => renderScreen('mission_tematica'));
  }

  // Biomas com pequenos feedbacks
  if (tileType === 'feira') {
    gameState.points.territorio += 1;
    updateHUD();
  }
  if (tileType === 'laje') {
    gameState.points.vivencia += 1;
    updateHUD();
  }
  if (tileType === 'quadra') {
    gameState.points.imaginacao += 1;
    updateHUD();
  }
  if (tileType === 'ponto') {
    gameState.points.vivencia += 1;
    updateHUD();
  }
}

// Função de Email
// Coleta todos os dados do jogo para exportação
function getGameData() {
  const now = new Date();
  return {
    timestamp: now.toLocaleString('pt-BR'),
    nickname: gameState.profile ? gameState.profile.nome : 'Viajante',
    place: gameState.profile ? gameState.profile.territorio : 'Desconhecido',
    points_vivencia: gameState.points.vivencia,
    points_imaginacao: gameState.points.imaginacao,
    points_territorio: gameState.points.territorio,
    text_m1: gameState.m1_text || '',
    text_m2_poem: gameState.m2_image_poem || '',
    text_m2_verse: gameState.m2_user_verse || '',
    text_m3: gameState.m3_new_verse || '',
    text_lit_fugaz: gameState.lit_fugaz_text || '',
    text_tematica_theme: gameState.tematica_chosen || '',
    text_tematica: gameState.tematica_text || ''
  };
}

// Gera e baixa um arquivo DOC (compatível com Word)
function saveToDoc(data) {
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    "xmlns='http://www.w3.org/TR/REC-html40'> " +
    "<head><meta charset='utf-8'><title>Jornada do Território</title></head><body>";
  const footer = "</body></html>";

  // Cordel 2.0 logo as base64 (you can replace this with the actual logo)
  const cordelLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGF0lEQVR4nO2dT2wbRRTGv7U3TuI/TdM0adI2SUvbNKSlQIFSQUGIIiQOSBw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAg';

  const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cordel-logo.png" alt="Cordel 2.0" style="width: 80px; height: 80px;" />
      </div>
      <h1 style="text-align: center;">Registro de Jornada: ${data.nickname}</h1>
      <p><strong>Data:</strong> ${data.timestamp}</p>
      <p><strong>Lugar:</strong> ${data.place}</p>
      <hr>
      <h2>Pontuação</h2>
      <ul>
          <li>Vivência: ${data.points_vivencia}</li>
          <li>Imaginação: ${data.points_imaginacao}</li>
          <li>Território: ${data.points_territorio}</li>
      </ul>
      <hr>
      <h2>Produções Textuais</h2>
      <h3>1. Vivência</h3>
      <p>${data.text_m1}</p>
      
      <h3>2. Imagem-Poema</h3>
      <p><strong>Imagem:</strong> ${data.text_m2_poem}</p>
      <p><strong>Verso:</strong> ${data.text_m2_verse}</p>
      
      <h3>3. Inscrição Territorial</h3>
      <p>${data.text_m3}</p>
      
      <h3>4. Encontro Fugaz</h3>
      <p>${data.text_lit_fugaz}</p>
      
      <h3>5. Desafio Temático (${data.text_tematica_theme})</h3>
      <p>${data.text_tematica}</p>
  `;

  const sourceHTML = header + content + footer;

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jornada_${data.nickname.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função de Registro e Download
function sendEmail() {
  const data = getGameData();

  // 1. Baixa o arquivo DOC para o usuário
  saveToDoc(data);

  // 2. Envia para o Google Sheets (mantendo o registro)
  sendToGoogleSheets(data);

  // Feedback visual
  showDialog('Seu registro foi baixado (.doc) e os dados enviados para a nuvem!');
}

// Função para envio automático para o Google Sheets
function sendToGoogleSheets(data) {
  // COLOQUE SUA URL DO GOOGLE APPS SCRIPT AQUI:
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw3EG5Fd0npGniyfsCgaMIGea7NuB0TLeEKSs8KF9ioEb28pAbJwED5_9GH4t6B8HwS/exec';

  if (SCRIPT_URL === 'COLE_SUA_URL_DO_WEB_APP_AQUI') {
    console.log('URL do Google Sheets não configurada. Veja GOOGLE_SHEETS_SETUP.md');
    return;
  }

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // 'no-cors' é necessário para enviar dados para o Google Scripts sem erro de CORS
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(() => {
      console.log('Dados enviados para a planilha!');
      showDialog('Dados sincronizados com a nuvem com sucesso!');
    })
    .catch(err => {
      console.error('Erro ao enviar para planilha:', err);
      showDialog('Erro ao sincronizar com a nuvem. Verifique o console.');
    });
}

// Controles pelo teclado
window.addEventListener('keydown', (e) => {
  const currentScreenIsMap = document.querySelector('.map-grid');
  const currentScreenIsMaze = document.getElementById('city-maze-grid');

  if (currentScreenIsMap && !currentScreenIsMaze) {
    // Main map controls
    if (e.key === 'ArrowUp') step(0, -1);
    if (e.key === 'ArrowDown') step(0, 1);
    if (e.key === 'ArrowLeft') step(-1, 0);
    if (e.key === 'ArrowRight') step(1, 0);
  } else if (currentScreenIsMaze) {
    // Maze controls
    if (e.key === 'ArrowUp') moveMaze(0, -1);
    if (e.key === 'ArrowDown') moveMaze(0, 1);
    if (e.key === 'ArrowLeft') moveMaze(-1, 0);
    if (e.key === 'ArrowRight') moveMaze(1, 0);
  }
});

// INICIALIZAÇÃO
window.onload = () => {
  updateHUD();
  renderScreen('splash');
};
