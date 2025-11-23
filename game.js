// ESTADO GLOBAL DO JOGO
const gameState = {
  profile: null,
  points: { vivencia: 0, imaginacao: 0, territorio: 0 },
  missions: {
    world1_m1: false,
    world1_m2: false,
    world1_m3: false,
    lit_fugaz: false
  },

  // posição do avatar no mapa (coordenadas de grid)
  playerPosition: { x: 1, y: 4 },

  // textos guardados das missões
  m1_text: '',
  m2_image_poem: '',
  m2_user_verse: '',
  m3_new_verse: '',
  lit_fugaz_text: ''
};

// ========== MAPA COM MAIS BIOMAS ========== //
// Tipos: 'empty', 'start', 'm1', 'lab', 'm3', 'decor',
//        'laje', 'feira', 'quadra', 'igreja', 'ponto', 'lit'

const mapWidth = 10;
const mapHeight = 7;

// Cada linha = y, cada coluna = x
const mapTiles = [
  // y = 0
  ['decor','decor','decor','decor','decor','decor','decor','decor','decor','decor'],
  // y = 1
  ['decor','feira','empty','empty','igreja','lit','empty','quadra','decor','decor'],
  // y = 2
  ['decor','empty','empty','m1','empty','empty','empty','empty','empty','decor'],
  // y = 3
  ['decor','ponto','empty','empty','lab','empty','laje','empty','empty','decor'],
  // y = 4
  ['decor','start','empty','empty','empty','m3','empty','empty','empty','decor'],
  // y = 5
  ['decor','empty','empty','empty','empty','empty','empty','empty','empty','decor'],
  // y = 6
  ['decor','decor','decor','decor','decor','decor','decor','decor','decor','decor']
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
        alert('Precisa pelo menos do nome ou apelido poético.');
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
        <textarea id="m1-text" placeholder="Ex.: O som do ônibus passando na subida da minha rua de madrugada."></textarea>
        <button id="btn-m1">Concluir missão</button>
        <button id="btn-m1-back">Voltar ao mapa</button>
      </section>
    `;
    document.getElementById('btn-m1').onclick = () => {
      const txt = document.getElementById('m1-text').value.trim();
      if (!txt) {
        alert('Tente escrever pelo menos uma frase sobre a sua vivência.');
        return;
      }
      gameState.missions.world1_m1 = true;
      gameState.m1_text = txt;
      gameState.points.vivencia += 20;
      updateHUD();
      alert('Vivência registrada! Você ganhou +20 Pontos de Vivência.');
      renderScreen('world_map');
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
        alert('Preencha pelo menos substantivo, adjetivos e ambiente.');
        return;
      }

      const imagePoem = `${noun} ${adj} ${con} ${env}`;
      gameState.m2_image_poem = imagePoem;

      document.getElementById('m2-result').innerHTML = `
        <hr>
        <p><strong>Imagem-poema:</strong> ${imagePoem}</p>
        <label>Escreva um verso a partir dessa imagem
          <textarea id="m2-verse" placeholder="Ex.: O vento elétrico varre a laje em silêncio."></textarea>
        </label>
        <button id="btn-m2-finish">Concluir missão</button>
      `;

      document.getElementById('btn-m2-finish').onclick = () => {
        const verse = document.getElementById('m2-verse').value.trim();
        if (!verse) {
          alert('Escreva pelo menos um verso.');
          return;
        }
        gameState.m2_user_verse = verse;
        gameState.missions.world1_m2 = true;
        gameState.points.imaginacao += 15;
        updateHUD();
        alert('Missão 2 concluída! Você ganhou +15 Pontos de Imaginação.');
        renderScreen('world_map');
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
        <textarea id="m3-text" placeholder="Ex.: O vento elétrico varre a laje azul enquanto alguém bate palma no portão da minha rua."></textarea>
        <button id="btn-m3">Concluir missão</button>
        <button id="btn-m3-back">Voltar ao mapa</button>
      </section>
    `;
    document.getElementById('btn-m3').onclick = () => {
      const txt = document.getElementById('m3-text').value.trim();
      if (!txt) {
        alert('Escreva seu novo verso com o território.');
        return;
      }
      gameState.m3_new_verse = txt;
      gameState.missions.world1_m3 = true;
      gameState.points.territorio += 30;
      updateHUD();
      alert('Missão 3 concluída! Você ganhou +30 Pontos de Território.');
      renderScreen('world_map');
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
          Como numa cena em que alguém passa, nasce um desejo,
          e logo em seguida tudo se desfaz, engolido pela cidade ou pela estrada.
        </p>
        <p>
          Pense em uma cena rápida no seu território (bairro, cidade, vila, interior ou metrópole):
          alguém que passa, um olhar, uma vontade que não se realiza.
        </p>
        <p>
          Escreva essa cena ligando o sentimento ao lugar: como o espaço (rua, praça, igreja, feira, estação, ponto de ônibus…) 
          interfere no jeito dessa vontade aparecer e desaparecer?
        </p>
        <textarea id="lit-text" placeholder="Descreva a cena em poucas linhas, como se fosse um flash de filme."></textarea>
        <button id="btn-lit">Concluir missão literária</button>
        <button id="btn-lit-back">Voltar ao mapa</button>
      </section>
    `;

    document.getElementById('btn-lit').onclick = () => {
      const txt = document.getElementById('lit-text').value.trim();
      if (!txt) {
        alert('Escreva pelo menos algumas linhas sobre essa cena fugaz.');
        return;
      }
      gameState.lit_fugaz_text = txt;
      gameState.missions.lit_fugaz = true;
      gameState.points.imaginacao += 20;
      gameState.points.territorio += 10;
      updateHUD();
      alert('Missão literária concluída! Você ganhou +20 Imaginação e +10 Território.');
      renderScreen('world_map');
    };

    document.getElementById('btn-lit-back').onclick = () => renderScreen('world_map');
    return;
  }

}

// ========== MAPA VISUAL + MOVIMENTO ========== //

function renderMapScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="map-wrapper">
      <h2>Território – Caminhe e descubra missões</h2>
      <div id="map" class="map-grid"></div>
      <div class="biome-legend">
        <span class="legend-tile laje">Laje</span>
        <span class="legend-tile feira">Feira</span>
        <span class="legend-tile quadra">Quadra</span>
        <span class="legend-tile igreja">Igreja</span>
        <span class="legend-tile ponto">Ponto de ônibus</span>
        <span class="legend-tile lit">Encontro fugaz</span>
      </div>
      <div class="controls">
        <button id="btn-up">↑</button>
        <button id="btn-left">←</button>
        <button id="btn-right">→</button>
        <button id="btn-down">↓</button>
      </div>
      <p class="hint">Use as setas do teclado ou os botões para andar.</p>
    </section>
  `;

  drawMap();

  document.getElementById('btn-up').onclick = () => step(0, -1);
  document.getElementById('btn-down').onclick = () => step(0, 1);
  document.getElementById('btn-left').onclick = () => step(-1, 0);
  document.getElementById('btn-right').onclick = () => step(1, 0);
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

      if (gameState.playerPosition.x === x && gameState.playerPosition.y === y) {
        tile.classList.add('tile-player');
        tile.textContent = '🧍';
      }

      mapEl.appendChild(tile);
    }
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
  drawMap();
  handleTileEvent(tileType);
}

// Eventos dos tiles
function handleTileEvent(tileType) {
  if (tileType === 'm1') {
    alert('Você sente um verso pedindo para nascer aqui (Missão 1).');
    renderScreen('world1_m1');
  }
  if (tileType === 'lab') {
    alert('Você entrou no Laboratório de Versos Semióticos (Missão 2).');
    renderScreen('world1_m2');
  }
  if (tileType === 'm3') {
    alert('Aqui sua voz quer ganhar mais território (Missão 3).');
    renderScreen('world1_m3');
  }

  // Biomas com pequenos feedbacks (opcional)
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
  if (tileType === 'igreja') {
    // reservado pra futuras missões, se quiser
  }

  if (tileType === 'lit') {
    alert('Algo acontece rápido demais nesse lugar. Uma cena fugaz quer virar literatura.');
    renderScreen('lit_fugaz');
  }
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

