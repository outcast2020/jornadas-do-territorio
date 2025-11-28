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
      showDialog('Vivência registrada! Você ganhou +20 Pontos de Vivência.', () => renderScreen('world_map'));
    };
    document.getElementById('btn-m1-back').onclick = () => renderScreen('world_map');
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
        showDialog('Missão 2 concluída! Você ganhou +15 Pontos de Imaginação.', () => renderScreen('world_map'));
      };
    };

    document.getElementById('btn-m2-back').onclick = () => renderScreen('world_map');
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
      showDialog('Missão 3 concluída! Você ganhou +30 Pontos de Território.', () => renderScreen('world_map'));
    };
    document.getElementById('btn-m3-back').onclick = () => renderScreen('world_map');
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
      showDialog('Missão literária concluída! Você ganhou +20 Imaginação e +10 Território.', () => renderScreen('world_map'));
    };

    document.getElementById('btn-lit-back').onclick = () => renderScreen('world_map');
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
      showDialog(`Desafio de ${theme} concluído! +25 Imaginação, +10 Vivência.`, () => renderScreen('world_map'));
    };

    document.getElementById('btn-tematica-back').onclick = () => renderScreen('world_map');
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
        <button id="btn-send-email" style="background:#ffeb3b; color:#000;">📩 Enviar Jornada por Email</button>
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

  document.getElementById('btn-lib-back').onclick = () => renderScreen('world_map');
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

// Gera e baixa um arquivo CSV (Excel)
function saveToCSV(data) {
  // Cabeçalho para o Excel reconhecer acentos (BOM)
  const BOM = "\uFEFF";
  const headers = [
    "Data", "Nome", "Territorio",
    "Pts_Vivencia", "Pts_Imaginacao", "Pts_Territorio",
    "M1_Vivencia", "M2_ImagemPoema", "M2_Verso", "M3_Inscricao",
    "Lit_Fugaz", "Tema_Escolhido", "Texto_Tematico"
  ];

  const row = [
    data.timestamp, data.nickname, data.place,
    data.points_vivencia, data.points_imaginacao, data.points_territorio,
    data.text_m1, data.text_m2_poem, data.text_m2_verse, data.text_m3,
    data.text_lit_fugaz, data.text_tematica_theme, data.text_tematica
  ];

  // Escapar aspas e quebras de linha para CSV
  const csvRow = row.map(field => {
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }).join(",");

  const csvContent = BOM + headers.join(",") + "\n" + csvRow;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `jornada_${data.nickname.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função de Email e Registro
function sendEmail() {
  const data = getGameData();

  // 1. Gera o arquivo Excel (CSV) para o usuário
  saveToCSV(data);

  // 2. Prepara o corpo do email
  const subject = encodeURIComponent(`Registro de Jornada: ${data.nickname}`);
  const body = encodeURIComponent(`
Olá! 

Estou enviando o registro da minha Jornada do Território.
Em anexo (se baixado) segue a planilha com os dados.

--- DADOS GERAIS ---
Data: ${data.timestamp}
Nome: ${data.nickname}
Lugar: ${data.place}

--- PONTUAÇÃO ---
Vivência: ${data.points_vivencia}
Imaginação: ${data.points_imaginacao}
Território: ${data.points_territorio}

--- PRODUÇÕES TEXTUAIS ---

1. Vivência:
"${data.text_m1}"

2. Imagem-Poema:
"${data.text_m2_poem}"
Verso: "${data.text_m2_verse}"

3. Inscrição Territorial:
"${data.text_m3}"

4. Encontro Fugaz:
"${data.text_lit_fugaz}"

5. Desafio Temático (${data.text_tematica_theme}):
"${data.text_tematica}"

-----------------------------------
Jogo: Jornadas do Território
`);

  // 3. Abre o cliente de email
  window.open(`mailto:?subject=${subject}&body=${body}`);

  // Feedback visual
  showDialog('Seu registro foi baixado (CSV) e o email foi aberto! Envie o email para o administrador.');

  // NOTA PARA O DESENVOLVEDOR (ADMIN):
  // Siga as instruções em GOOGLE_SHEETS_SETUP.md para configurar a planilha.
  // Depois de configurar, cole a URL do Web App abaixo.
  sendToGoogleSheets(data);
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
  if (!currentScreenIsMap) return;

  if (e.key === 'ArrowUp') step(0, -1);
  if (e.key === 'ArrowDown') step(0, 1);
  if (e.key === 'ArrowLeft') step(-1, 0);
  if (e.key === 'ArrowRight') step(1, 0);
});

// INICIALIZAÇÃO
window.onload = () => {
  updateHUD();
  renderScreen('splash');
};
