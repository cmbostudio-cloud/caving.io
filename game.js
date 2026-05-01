// ============================================================
//  caving.io -- ASCII mining roguelite
// ============================================================

const MAP_SIZE = 25;
const MAP_W = MAP_SIZE;
const MAP_H = MAP_SIZE;

const TILES = {
  WALL: { ch: '#', fg: '#333333' },
  FLOOR: { ch: '.', fg: '#1e1e1e' },
  PLAYER: { ch: '@', fg: '#ffeb3b' },
  STAIRS: { ch: '>', fg: '#ff9800' },
};

const FOREST_POINTS = {
  spawn: { x: 1, y: 12 },
  plazaExit: { x: 0, y: 12 },
  mine: { x: 18, y: 12 },
};

const PLAZA_POINTS = {
  spawn: { x: 12, y: 12 },
  forestGate: { x: 24, y: 12 },
  forestReturn: { x: 23, y: 12 },
  shop: { x: 5, y: 5 },
  anvil: { x: 5, y: 19 },
};

const SHOP_POINTS = {
  spawn: { x: 12, y: 14 },
  exit: { x: 12, y: 16 },
  exchange: { x: 12, y: 11 },
};

const ORES = [
  { id: 'coal', ch: 'c', name: '석탄', fg: '#607d8b', minDepth: 1, weight: 60, xp: 2, pickReq: 1 },
  { id: 'iron', ch: 'i', name: '철광석', fg: '#90a4ae', minDepth: 1, weight: 50, xp: 5, pickReq: 1 },
  { id: 'copper', ch: 'u', name: '구리', fg: '#ff7043', minDepth: 2, weight: 40, xp: 8, pickReq: 1 },
  { id: 'silver', ch: 's', name: '은', fg: '#cfd8dc', minDepth: 3, weight: 25, xp: 15, pickReq: 2 },
  { id: 'gold', ch: 'o', name: '금', fg: '#ffd700', minDepth: 4, weight: 15, xp: 25, pickReq: 2 },
  { id: 'emerald', ch: 'e', name: '에메랄드', fg: '#26a69a', minDepth: 5, weight: 10, xp: 40, pickReq: 3 },
  { id: 'ruby', ch: 'r', name: '루비', fg: '#ef5350', minDepth: 6, weight: 7, xp: 55, pickReq: 3 },
  { id: 'diamond', ch: 'd', name: '다이아몬드', fg: '#80deea', minDepth: 7, weight: 3, xp: 80, pickReq: 4 },
];

const PICKAXES = [
  { name: 'Wood Lv.1', level: 1, power: 1 },
  { name: 'Stone Lv.2', level: 2, power: 2 },
  { name: 'Iron Lv.3', level: 3, power: 3 },
  { name: 'Gold Lv.4', level: 4, power: 4 },
  { name: 'Diamond Lv.5', level: 5, power: 5 },
];

const MATERIALS = [
  { id: 'wood_plank', ch: '=', fg: '#8d6e63', name: { en: 'Wood Plank', ko: '나무판자' } },
];

const SELL_VALUES = {
  wood_plank: 1,
  coal: 2,
  iron: 4,
  copper: 6,
  silver: 12,
  gold: 24,
  emerald: 48,
  ruby: 80,
  diamond: 160,
};

const SAVE_KEY = 'caving-io-save-v1';

let G = {}; // game state
const SETTINGS_KEY = 'caving-io-settings';
let SETTINGS = loadSettings();

const ORE_NAMES = {
  coal: { en: 'Coal', ko: '석탄' },
  iron: { en: 'Iron', ko: '철광석' },
  copper: { en: 'Copper', ko: '구리' },
  silver: { en: 'Silver', ko: '은' },
  gold: { en: 'Gold', ko: '금' },
  emerald: { en: 'Emerald', ko: '에메랄드' },
  ruby: { en: 'Ruby', ko: '루비' },
  diamond: { en: 'Diamond', ko: '다이아몬드' },
};

const I18N = {
  en: {
    loading: 'LOADING', settings: 'SETTINGS', layout: 'LAYOUT', classic: 'CLASSIC', square: 'SQUARE', saveLoad: 'SAVE/LOAD',
    language: 'LANGUAGE', status: 'STATUS', hp: 'HP', stamina: 'STAMINA', exp: 'EXP', level: 'LEVEL',
    pickaxe: 'PICKAXE', area: 'AREA', gold: 'GOLD', inventory: 'INVENTORY', inventoryButton: 'INVENTORY (I)', saveButton: 'SAVE (K)', loadButton: 'LOAD (L)', materials: 'MATERIALS', action: 'ACTION',
    use: 'USE', mine: 'MINE', return: 'RETURN (R)', rest: 'REST', log: 'LOG',
    noSelection: 'NO TILE SELECTED', moving: 'MOVING', select: 'SELECT', enter: 'ENTER', move: 'MOVE',
    player: 'Player', wall: 'Wall', floor: 'Floor', stairs: 'Stairs', grass: 'Grass', tree: 'Tree',
    stone: 'Stone', flower: 'Flower', mineEntrance: 'Mine entrance', shop: 'Shop', shopExit: 'Shop exit',
    anvil: 'Anvil', exchange: 'Exchange', forestGate: 'Forest gate', plazaGate: 'Plaza gate', plazaExit: 'Plaza exit',
    interactHint: 'Select a tile to see actions.', moveHint: 'Tap tile to move.', enterHint: 'Press E or tap tile to enter.',
    mineHintAction: 'Press Space/Z or tap tile to mine.', noActionHint: 'No action available.',
    emptyInventory: '-- EMPTY --', exchangeEmpty: 'Nothing to exchange.', sellOne: 'SELL 1', sellAll: 'SELL ALL',
    moreInventory: count => `+${count} more. Press I to view.`, plaza: 'PLAZA', forest: 'FOREST', shopArea: 'SHOP', plazaMap: 'PLAZA MAP', forestMap: 'FOREST MAP',
    shopMap: 'SHOP MAP', dungeonMap: 'DUNGEON MAP',
    enterFloor: depth => `Entered B${depth}F.`,
    deeper: 'The cave gets darker.', forestStart: 'You stand at the forest trail.',
    plazaStart: 'You are in the plaza.', plazaReturn: 'Returned to the plaza.',
    forestEnter: 'Entered the forest.', forestReturn: 'Returned to the forest.', shopEnter: 'Entered the shop.',
    cannotMineHere: 'You can only mine inside the cave.', lowStaminaMine: 'Not enough stamina to mine.',
    wallMined: 'Cleared the wall.', treeMined: amount => `Chopped down the tree. Wood Plank x${amount} gained.`, pickTooWeak: ore => `${ore} needs a stronger pickaxe.`,
    oreGained: (ore, amount, xp) => `${ore} x${amount} mined. (+${xp} XP)`,
    cannotReach: 'No path to that tile.', cannotReachBlock: 'No path to that block.',
    noSelectedTile: 'No tile selected.', selectNearby: 'Select a reachable tile first.',
    pathBlocked: 'Path blocked.', nothingToMine: 'Nothing nearby to mine.',
    goingDown: depth => `Going down to B${depth}F...`, enterMine: 'Entering the cave...',
    noEntrance: 'Nothing to enter here.', alreadyRested: 'Already fully rested.',
    restGain: (hp, stam) => `Rested: HP +${hp}, Stamina +${stam}`,
    exhausted: 'Exhaustion is draining HP.', levelUp: level => `LEVEL UP! Lv.${level}`,
    maxUp: 'Max HP and stamina increased.', pickUpgrade: pick => `Pickaxe upgraded: ${pick}`,
    returned: 'Returned to the forest.', returnUnavailable: 'You can return only from inside the cave.',
    gameOver: 'GAME OVER', gameOverLog: 'You collapsed in the cave.',
    gameOverText: depth => `You fell at B${depth}F.`, restart: 'RESTART',
    startHint: 'Choose a destination on the map.', mineHint: 'Use the east gate to reach the forest.',
    gameSaved: 'Game saved.', gameLoaded: 'Save loaded.', noSave: 'No save data found.'
  },
  ko: {
    loading: '로딩 중', settings: '설정', layout: '배치', classic: '기본', square: '정사각', saveLoad: '저장/불러오기',
    language: '언어', status: '상태', hp: '체력', stamina: '스태미나', exp: '경험치', level: '레벨',
    pickaxe: '곡괭이', area: '지역', gold: '골드', inventory: '인벤토리', inventoryButton: '인벤토리 (I)', saveButton: '저장 (K)', loadButton: '불러오기 (L)', materials: '재료', action: '행동',
    use: '사용', mine: '채굴', return: '귀환 (R)', rest: '휴식', log: '기록',
    noSelection: '선택한 타일 없음', moving: '이동 중', select: '선택', enter: '입장', move: '이동',
    player: '플레이어', wall: '벽', floor: '바닥', stairs: '계단', grass: '풀', tree: '나무',
    stone: '돌', flower: '꽃', mineEntrance: '광산 입구', shop: '상점', shopExit: '상점 출구',
    anvil: '모루', exchange: '거래소', forestGate: '숲 입구', plazaGate: '광장 입구', plazaExit: '광장 출구',
    interactHint: '타일을 선택하면 행동 방법이 표시됩니다.', moveHint: '타일을 누르면 이동합니다.', enterHint: 'E 또는 타일 터치로 입장합니다.',
    mineHintAction: 'Space/Z 또는 타일 터치로 채굴합니다.', noActionHint: '가능한 행동이 없습니다.',
    emptyInventory: '-- 비어 있음 --', exchangeEmpty: '교환할 물건이 없습니다.', sellOne: '1개 판매', sellAll: '전부 판매',
    moreInventory: count => `외 ${count}개. I 키로 확인.`, plaza: '광장', forest: '숲', shopArea: '상점', plazaMap: '광장 지도', forestMap: '숲 지도',
    shopMap: '상점 지도', dungeonMap: '동굴 지도',
    enterFloor: depth => `B${depth}F에 진입했다.`,
    deeper: '동굴이 더 어두워진다.', forestStart: '숲길에 도착했다.',
    plazaStart: '광장에 도착했다.', plazaReturn: '광장으로 돌아왔다.',
    forestEnter: '숲으로 들어왔다.', forestReturn: '숲으로 돌아왔다.', shopEnter: '상점에 들어왔다.',
    cannotMineHere: '동굴 안에서만 채굴할 수 있다.', lowStaminaMine: '채굴할 스태미나가 부족하다.',
    wallMined: '벽을 부쉈다.', treeMined: amount => `나무를 베었다. 나무판자 x${amount} 획득.`, pickTooWeak: ore => `${ore}은 더 강한 곡괭이가 필요하다.`,
    oreGained: (ore, amount, xp) => `${ore} x${amount} 획득. (+${xp} XP)`,
    cannotReach: '그 타일까지 갈 수 없다.', cannotReachBlock: '그 블록 앞까지 갈 수 없다.',
    noSelectedTile: '선택한 타일이 없다.', selectNearby: '먼저 도달 가능한 타일을 선택해야 한다.',
    pathBlocked: '이동 경로가 막혔다.', nothingToMine: '주변에 채굴할 것이 없다.',
    goingDown: depth => `B${depth}F로 내려간다...`, enterMine: '동굴로 들어간다...',
    noEntrance: '들어갈 곳이 없다.', alreadyRested: '이미 충분히 회복했다.',
    restGain: (hp, stam) => `휴식: 체력 +${hp}, 스태미나 +${stam}`,
    exhausted: '탈진으로 체력이 줄어든다.', levelUp: level => `레벨 업! Lv.${level}`,
    maxUp: '최대 체력과 스태미나가 증가했다.', pickUpgrade: pick => `곡괭이 강화: ${pick}`,
    returned: '숲으로 귀환했다.', returnUnavailable: '동굴 안에서만 귀환할 수 있다.',
    gameOver: '게임 오버', gameOverLog: '동굴 안에서 쓰러졌다.',
    gameOverText: depth => `B${depth}F에서 쓰러졌다.`, restart: '다시 시작',
    startHint: '지도에서 목적지를 선택하세요.', mineHint: '동쪽 문을 사용하면 숲으로 갈 수 있습니다.',
    gameSaved: '게임을 저장했다.', gameLoaded: '저장 데이터를 불러왔다.', noSave: '저장 데이터가 없다.'
  }
};

function lang() {
  return SETTINGS.language === 'ko' ? 'ko' : 'en';
}

function t(key, ...args) {
  const value = I18N[lang()][key] ?? I18N.en[key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
}

function oreName(ore) {
  return ORE_NAMES[ore.id]?.[lang()] || ORE_NAMES[ore.id]?.en || ore.id;
}

function materialName(material) {
  return material.name[lang()] || material.name.en;
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function log(message, type = 'sys') {
  const list = document.getElementById('log-list');
  if (!list) return;
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = message;
  list.appendChild(line);
  while (list.children.length > 180) {
    list.removeChild(list.firstChild);
  }
  list.scrollTop = list.scrollHeight;
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      layoutMode: saved.layoutMode === 'square' ? 'square' : 'classic',
      language: saved.language === 'ko' ? 'ko' : 'en',
    };
  } catch {
    return { layoutMode: 'classic', language: 'en' };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
  } catch {
    // Settings are optional; the game should still run when storage is blocked.
  }
}

function applyLayoutMode(mode) {
  const layoutMode = mode === 'square' ? 'square' : 'classic';
  document.body.dataset.layout = layoutMode;
  document.querySelectorAll('[data-layout-option]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layoutOption === layoutMode);
  });
}

function applyLanguage() {
  document.documentElement.lang = lang();
  document.title = 'caving.io';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-lang-option]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langOption === lang());
  });
  if (G.map) render();
}

function setLayoutMode(mode) {
  SETTINGS.layoutMode = mode === 'square' ? 'square' : 'classic';
  saveSettings();
  applyLayoutMode(SETTINGS.layoutMode);
}

function setLanguage(language) {
  SETTINGS.language = language === 'ko' ? 'ko' : 'en';
  saveSettings();
  applyLanguage();
}

applyLayoutMode(SETTINGS.layoutMode);
applyLanguage();

// ---- MAP GENERATION ----
function blankMap(type) {
  return Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => ({ type }))
  );
}

function setCell(map, x, y, cell) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
  map[y][x] = cell;
}

function carveLine(map, from, to, type = 'grass') {
  let x = from.x;
  let y = from.y;
  setCell(map, x, y, { type });

  while (x !== to.x) {
    x += x < to.x ? 1 : -1;
    setCell(map, x, y, { type });
  }
  while (y !== to.y) {
    y += y < to.y ? 1 : -1;
    setCell(map, x, y, { type });
  }
}



function generateMap(depth) {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      // Border always wall
      if (x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) {
        row.push({ type: 'wall' });
      } else {
        // Random cave-ish: more walls near edges
        const wallChance = 0.35;
        row.push({ type: Math.random() < wallChance ? 'wall' : 'floor' });
      }
    }
    map.push(row);
  }

  // Cellular automata passes for cave feel
  for (let pass = 0; pass < 3; pass++) {
    const next = map.map(r => r.map(c => ({ ...c })));
    for (let y = 1; y < MAP_H - 1; y++) {
      for (let x = 1; x < MAP_W - 1; x++) {
        let walls = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (map[y + dy][x + dx].type === 'wall') walls++;
        next[y][x].type = walls >= 5 ? 'wall' : 'floor';
      }
    }
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) map[y][x] = next[y][x];
  }

  // Ensure player start area is floor
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const ny = 2 + dy, nx = 2 + dx;
      if (ny > 0 && ny < MAP_H - 1 && nx > 0 && nx < MAP_W - 1)
        map[ny][nx].type = 'floor';
    }

  // Place ores
  const available = ORES.filter(o => o.minDepth <= depth);
  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      if (map[y][x].type === 'wall') {
        // Some walls become ore walls
        if (Math.random() < 0.28 && available.length) {
          const totalWeight = available.reduce((s, o) => s + o.weight, 0);
          let r = Math.random() * totalWeight;
          for (const ore of available) {
            r -= ore.weight;
            if (r <= 0) {
              map[y][x] = { type: 'ore', ore: ore.id };
              break;
            }
          }
        }
      }
    }
  }

  return map;
}

function floodFill(map, sx, sy) {
  // Find every open tile reachable from the player.
  const visited = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(false));
  const queue = [[sx, sy]];
  visited[sy][sx] = true;
  while (queue.length) {
    const [cx, cy] = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (visited[ny][nx]) continue;
      const t = map[ny][nx].type;
      if (t === 'floor' || t === 'stairs') {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }
  return visited;
}

// ---- INIT ----


function newFloor() {
  stopAutoMove();
  G.area = 'mine';
  G.map = generateMap(G.depth);
  G.px = 2;
  G.py = 2;
  G.selected = null;
  G.map[G.py][G.px].type = 'floor';
  placeReachableStairs();
  render();
  log(t('enterFloor', G.depth), 'info');
  if (G.depth > 1) log(t('deeper'), 'sys');
}


function enterShop() {
  stopAutoMove();
  G.area = 'shop';
  G.map = generateShopMap();
  G.px = SHOP_POINTS.spawn.x;
  G.py = SHOP_POINTS.spawn.y;
  G.selected = null;
  render();
  log(t('shopEnter'), 'info');
}


function actOnTile(x, y) {
  if (!G.map || G.gameOver) return false;
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;

  const cell = G.map[y][x];
  const sameTile = x === G.px && y === G.py;
  if (sameTile) {
    if (isPortalCell(cell)) tryStairs();
    return isPortalCell(cell);
  }

  if (isWalkableCell(cell)) {
    const path = findPathTo(x, y);
    if (!path) {
      log(t('cannotReach'), 'warn');
      return false;
    }
    if (!path.length) {
      if (isPortalCell(cell)) { tryStairs(); return true; }
      return false;
    }
    startAutoMove(path, { x, y });
    return true;
  }

  if (isMineTarget(cell)) {
    if (!canMineTarget(cell)) {
      render();
      return true;
    }

    if (isAdjacentToPlayer(x, y)) {
      mineCell(x, y);
      G.selected = { x, y };
      render();
      return true;
    }

    const approach = findApproachTo(x, y);
    if (!approach) {
      log(t('cannotReachBlock'), 'warn');
      return false;
    }
    if (!approach.path.length) {
      mineCell(x, y);
      return true;
    }
    startAutoMove(approach.path, { x, y }, { x, y });
    return true;
  }

  return false;
}

function useSelectedTile() {
  stopAutoMove();
  const selected = selectedTile();
  if (!selected) {
    log(t('noSelectedTile'), 'sys');
    return;
  }

  const acted = actOnTile(selected.x, selected.y);
  if (!acted) {
    log(t('selectNearby'), 'sys');
    render();
  }
}

function stepAutoMove(moveId) {
  if (G.autoMove?.id !== moveId) return;

  if (!G.map || G.gameOver || !G.autoMove?.path?.length) {
    stopAutoMove();
    render();
    return;
  }

  const next = G.autoMove.path.shift();
  if (!isWalkableCell(G.map[next.y][next.x])) {
    log(t('pathBlocked'), 'warn');
    stopAutoMove();
    render();
    return;
  }

  G.px = next.x;
  G.py = next.y;
  tick(1);

  if (G.gameOver) {
    stopAutoMove();
    render();
    return;
  }

  if (!G.autoMove.path.length) {
    const mineTarget = G.autoMove.mineTarget;
    stopAutoMove();
    if (mineTarget && isAdjacentToPlayer(mineTarget.x, mineTarget.y)) {
      const cell = G.map[mineTarget.y][mineTarget.x];
      if (isMineTarget(cell) && canMineTarget(cell)) {
        mineCell(mineTarget.x, mineTarget.y);
        return;
      }
    }
    const arrivedCell = G.map[G.py][G.px];
    if (isPortalCell(arrivedCell)) {
      tryStairs();
      return;
    }
    render();
    return;
  }

  render();
  G.autoMove.timer = setTimeout(() => stepAutoMove(moveId), 90);
}

function tryMine() {
  stopAutoMove();
  if (G.area !== 'mine') {
    log(t('cannotMineHere'), 'sys');
    return;
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let mined = false;
  for (const [dx, dy] of dirs) {
    const nx = G.px + dx;
    const ny = G.py + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    if (G.map[ny][nx].type === 'ore') {
      mineCell(nx, ny);
      mined = true;
    }
  }
  if (!mined) {
    for (const [dx, dy] of dirs) {
      const nx = G.px + dx;
      const ny = G.py + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (G.map[ny][nx].type === 'wall') {
        mineCell(nx, ny);
        mined = true;
        break;
      }
    }
    if (!mined) log(t('nothingToMine'), 'sys');
  }
}

function tick(n) {
  G.turn += n;
  if (G.stam <= 0 && G.turn % 10 === 0) {
    G.hp = Math.max(0, G.hp - 2);
    log(t('exhausted'), 'err');
    if (G.hp <= 0) gameOver();
  }
}

function checkLevelUp() {
  while (G.xp >= G.xpNext) {
    G.xp -= G.xpNext;
    G.level++;
    G.xpNext = Math.floor(G.xpNext * 1.5);
    G.hpMax = Math.floor(G.hpMax * 1.1);
    G.stamMax = Math.floor(G.stamMax * 1.1);
    G.hp = G.hpMax;
    G.stam = G.stamMax;
    log(t('levelUp', G.level), 'info');
    log(t('maxUp'), 'ok');
  }
}

function upgradeCheck() {
  const nextIdx = G.pickaxeIdx + 1;
  if (nextIdx >= PICKAXES.length) return;
  const threshold = nextIdx * 3;
  if (G.depth >= threshold) {
    G.pickaxeIdx = nextIdx;
    log(t('pickUpgrade', PICKAXES[G.pickaxeIdx].name), 'info');
  }
}




function generatePlazaMap() {
  const map = blankMap('floor');

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) {
        map[y][x] = { type: 'wall' };
      }
    }
  }

  for (let x = 4; x <= 20; x++) {
    setCell(map, x, 12, { type: 'floor' });
  }
  for (let y = 8; y <= 16; y++) {
    setCell(map, 12, y, { type: 'floor' });
  }

  setCell(map, PLAZA_POINTS.shop.x, PLAZA_POINTS.shop.y, { type: 'shop' });
  setCell(map, PLAZA_POINTS.anvil.x, PLAZA_POINTS.anvil.y, { type: 'anvil' });
  setCell(map, PLAZA_POINTS.forestGate.x, PLAZA_POINTS.forestGate.y, { type: 'forestGate' });
  setCell(map, PLAZA_POINTS.forestReturn.x, PLAZA_POINTS.forestReturn.y, { type: 'floor' });

  return map;
}

function generateForestMap() {
  const map = blankMap('grass');

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const roll = Math.random();
      if (roll < 0.10) map[y][x] = { type: 'tree' };
      else if (roll < 0.15) map[y][x] = { type: 'flower' };
      else map[y][x] = { type: 'grass' };
    }
  }

  carveLine(map, FOREST_POINTS.spawn, FOREST_POINTS.mine, 'grass');
  setCell(map, FOREST_POINTS.plazaExit.x, FOREST_POINTS.plazaExit.y, { type: 'plazaExit' });
  setCell(map, FOREST_POINTS.spawn.x, FOREST_POINTS.spawn.y, { type: 'grass' });

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setCell(map, FOREST_POINTS.mine.x + dx, FOREST_POINTS.mine.y + dy, { type: 'grass' });
    }
  }
  setCell(map, FOREST_POINTS.mine.x, FOREST_POINTS.mine.y, { type: 'mineEntrance' });

  return map;
}

function generateShopMap() {
  const map = blankMap('wall');

  for (let y = 8; y <= 16; y++) {
    for (let x = 7; x <= 17; x++) {
      map[y][x] = { type: 'floor' };
    }
  }

  for (let x = 7; x <= 17; x++) {
    map[8][x] = { type: 'wall' };
    map[16][x] = { type: 'wall' };
  }
  for (let y = 8; y <= 16; y++) {
    map[y][7] = { type: 'wall' };
    map[y][17] = { type: 'wall' };
  }

  setCell(map, SHOP_POINTS.spawn.x, SHOP_POINTS.spawn.y, { type: 'floor' });
  setCell(map, SHOP_POINTS.exchange.x, SHOP_POINTS.exchange.y, { type: 'exchange' });
  setCell(map, SHOP_POINTS.exit.x, SHOP_POINTS.exit.y, { type: 'shopExit' });
  return map;
}

// ---- AUTO MOVE ----
function stopAutoMove() {
  if (G.autoMove?.timer) clearTimeout(G.autoMove.timer);
  if (G.autoMove) {
    G.autoMove.path = [];
    G.autoMove.timer = null;
    G.autoMove.target = null;
    G.autoMove.mineTarget = null;
    G.autoMove.id = (G.autoMove.id || 0) + 1;
  }
}

function startAutoMove(path, target, mineTarget = null) {
  stopAutoMove();
  const moveId = (G.autoMove?.id || 0) + 1;
  G.autoMove = { path: [...path], timer: null, target, mineTarget, id: moveId };
  stepAutoMove(moveId);
}

// ---- PATHFINDING ----
function findPathTo(tx, ty) {
  // BFS
  const visited = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(false));
  const prev = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(null));
  const queue = [[G.px, G.py]];
  visited[G.py][G.px] = true;
  while (queue.length) {
    const [cx, cy] = queue.shift();
    if (cx === tx && cy === ty) {
      const path = [];
      let cur = [tx, ty];
      while (cur[0] !== G.px || cur[1] !== G.py) {
        path.unshift({ x: cur[0], y: cur[1] });
        cur = prev[cur[1]][cur[0]];
      }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (visited[ny][nx]) continue;
      if (!isWalkableCell(G.map[ny][nx])) continue;
      visited[ny][nx] = true;
      prev[ny][nx] = [cx, cy];
      queue.push([nx, ny]);
    }
  }
  return null; // unreachable
}

function findApproachTo(tx, ty) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = tx + dx, ny = ty + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    if (!isWalkableCell(G.map[ny][nx])) continue;
    const path = findPathTo(nx, ny);
    if (path !== null) return { path };
  }
  return null;
}

function isAdjacentToPlayer(x, y) {
  return Math.abs(x - G.px) + Math.abs(y - G.py) === 1;
}

function selectedTile() {
  if (!G.selected || !G.map) return null;
  const { x, y } = G.selected;
  return { x, y, cell: G.map[y][x] };
}

// ---- MAP HELPERS ----
function placeReachableStairs() {
  const visited = floodFill(G.map, G.px, G.py);
  const candidates = [];
  for (let y = 1; y < MAP_H - 1; y++)
    for (let x = 1; x < MAP_W - 1; x++)
      if (visited[y][x] && G.map[y][x].type === 'floor' && (x !== G.px || y !== G.py))
        candidates.push({ x, y });
  if (!candidates.length) return;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  G.map[pick.y][pick.x] = { type: 'stairs' };
}

function initGame() {
  G = {
    area: 'plaza',
    depth: 1,
    px: PLAZA_POINTS.spawn.x, py: PLAZA_POINTS.spawn.y,
    hp: 100, hpMax: 100,
    stam: 100, stamMax: 100,
    xp: 0, xpNext: 100,
    level: 1,
    pickaxeIdx: 0,
    gold: 0,
    inventory: {},
    map: null,
    selected: null,
    autoMove: {
      path: [],
      timer: null,
      target: null,
      mineTarget: null,
      id: 0,
    },
    turn: 0,
    gameOver: false,
    plazaMap: null,
    forestMap: null,
  };
  ORES.forEach(o => { G.inventory[o.id] = 0; });
  MATERIALS.forEach(m => { G.inventory[m.id] = 0; });
  enterPlaza('start');
  saveGame();
}

function enterPlaza(entry = 'start') {
  stopAutoMove();
  G.area = 'plaza';
  if (!G.plazaMap) G.plazaMap = generatePlazaMap();
  G.map = G.plazaMap;
  G.selected = null;

  if (entry === 'forest') {
    G.px = PLAZA_POINTS.forestReturn.x;
    G.py = PLAZA_POINTS.forestReturn.y;
  } else {
    G.px = PLAZA_POINTS.spawn.x;
    G.py = PLAZA_POINTS.spawn.y;
  }

  render();
  log(entry === 'start' ? t('plazaStart') : t('plazaReturn'), 'info');
}

function enterForest(entry = 'plaza') {
  stopAutoMove();
  G.area = 'forest';
  if (!G.forestMap) G.forestMap = generateForestMap();
  G.map = G.forestMap;
  G.selected = null;
  if (entry === 'return') {
    G.px = FOREST_POINTS.mine.x;
    G.py = FOREST_POINTS.mine.y;
  } else {
    G.px = FOREST_POINTS.spawn.x;
    G.py = FOREST_POINTS.spawn.y;
  }
  render();
  log(entry === 'return' ? t('forestReturn') : t('forestEnter'), 'info');
}

function cellGlyph(cell, isPlayer) {
  if (isPlayer) {
    return { ch: '@', fg: '#ffeb3b', weight: 'bold' };
  }
  switch (cell.type) {
    case 'wall':
      return { ch: '#', fg: '#2a2a2a', weight: 'normal' };
    case 'floor':
      return { ch: '.', fg: '#1a1a1a', weight: 'normal' };
    case 'stairs':
      return { ch: '>', fg: '#ff9800', weight: 'bold' };
    case 'grass':
      return { ch: '.', fg: '#1f5f2c', weight: 'normal' };
    case 'tree':
      return { ch: 'T', fg: '#4caf50', weight: 'bold' };
    case 'flower':
      return { ch: '*', fg: '#ffeb3b', weight: 'bold' };
    case 'mineEntrance':
      return { ch: 'M', fg: '#ff9800', weight: 'bold' };
    case 'forestGate':
      return { ch: '>', fg: '#4caf50', weight: 'bold' };
    case 'plazaExit':
      return { ch: '<', fg: '#ff9800', weight: 'bold' };
    case 'shop':
      return { ch: '$', fg: '#ffd700', weight: 'bold' };
    case 'exchange':
      return { ch: 'G', fg: '#ffd700', weight: 'bold' };
    case 'shopExit':
      return { ch: '<', fg: '#ff9800', weight: 'bold' };
    case 'anvil':
      return { ch: 'A', fg: '#cfd8dc', weight: 'bold' };
    case 'ore': {
      const ore = ORES.find(o => o.id === cell.ore);
      return { ch: ore.ch, fg: ore.fg, weight: 'normal' };
    }
    default:
      return { ch: ' ', fg: '#111', weight: 'normal' };
  }
}

function tileLabel(cell, isPlayer, x, y) {
  if (isPlayer) return `${t('player')} ${x}, ${y}`;
  if (cell.type === 'wall') return `${t('wall')} ${x}, ${y}`;
  if (cell.type === 'floor') return `${t('floor')} ${x}, ${y}`;
  if (cell.type === 'stairs') return `${t('stairs')} ${x}, ${y}`;
  if (cell.type === 'grass') return `${t('grass')} ${x}, ${y}`;
  if (cell.type === 'tree') return `${t('tree')} ${x}, ${y}`;
  if (cell.type === 'flower') return `${t('flower')} ${x}, ${y}`;
  if (cell.type === 'mineEntrance') return `${t('mineEntrance')} ${x}, ${y}`;
  if (cell.type === 'forestGate') return `${t('forestGate')} ${x}, ${y}`;
  if (cell.type === 'plazaExit') return `${t('plazaExit')} ${x}, ${y}`;
  if (cell.type === 'shop') return `${t('shop')} ${x}, ${y}`;
  if (cell.type === 'exchange') return `${t('exchange')} ${x}, ${y}`;
  if (cell.type === 'shopExit') return `${t('shopExit')} ${x}, ${y}`;
  if (cell.type === 'anvil') return `${t('anvil')} ${x}, ${y}`;
  if (cell.type === 'ore') {
    const ore = ORES.find(o => o.id === cell.ore);
    return `${oreName(ore)} ${x}, ${y}`;
  }
  return `${x}, ${y}`;
}

function isWalkableCell(cell) {
  return ['floor', 'stairs', 'grass', 'flower', 'mineEntrance', 'shop', 'shopExit', 'exchange', 'forestGate', 'plazaExit', 'anvil'].includes(cell.type);
}

function isPortalCell(cell) {
  return ['stairs', 'mineEntrance', 'shop', 'shopExit', 'exchange', 'forestGate', 'plazaExit'].includes(cell.type);
}

function areaLabel() {
  if (G.area === 'plaza') return t('plaza');
  if (G.area === 'forest') return t('forest');
  if (G.area === 'shop') return t('shopArea');
  return `B${G.depth}F`;
}

function render() {
  const canvas = document.getElementById('map-canvas');
  canvas.style.setProperty('--map-size', MAP_SIZE);
  canvas.className = `area-${G.area || 'mine'}`;
  let html = '';
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const isPlayer = (x === G.px && y === G.py);
      const selected = G.selected && G.selected.x === x && G.selected.y === y;
      const action = getTileAction(x, y);
      const glyph = cellGlyph(G.map[y][x], isPlayer);
      const underGlyph = isPlayer ? cellGlyph(G.map[y][x], false) : null;
      const classes = [
        'tile',
        `tile-${G.map[y][x].type}`,
        isPlayer ? 'tile-player' : '',
        selected ? 'selected' : '',
        action && action !== 'SELECT' && !isPlayer ? 'actionable' : '',
      ].filter(Boolean).join(' ');
      const corners = selected
        ? '<span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>'
        : '';
      const underlay = underGlyph
        ? `<span class="terrain-underlay" style="color:${underGlyph.fg};font-weight:${underGlyph.weight}">${underGlyph.ch}</span>`
        : '';
      html += `<button type="button" class="${classes}" data-x="${x}" data-y="${y}" aria-label="${tileLabel(G.map[y][x], isPlayer, x, y)}">
        ${underlay}<span class="tile-glyph" style="color:${glyph.fg};font-weight:${glyph.weight}">${glyph.ch}</span>${corners}
      </button>`;
    }
  }
  canvas.innerHTML = html;
  updateSelectionInfo();

  document.getElementById('hp-val').textContent = `${G.hp} / ${G.hpMax}`;
  document.getElementById('stam-val').textContent = `${G.stam} / ${G.stamMax}`;
  document.getElementById('xp-val').textContent = `${G.xp} / ${G.xpNext}`;
  document.getElementById('lv-val').textContent = G.level;
  document.getElementById('pick-val').textContent = PICKAXES[G.pickaxeIdx].name;
  document.getElementById('depth-val').textContent = areaLabel();
  document.getElementById('gold-val').textContent = G.gold || 0;
  document.getElementById('map-title').textContent =
    G.area === 'mine' ? t('dungeonMap') :
      G.area === 'shop' ? t('shopMap') :
        G.area === 'plaza' ? t('plazaMap') : t('forestMap');

  document.getElementById('hp-bar').style.width = (G.hp / G.hpMax * 100) + '%';
  document.getElementById('stam-bar').style.width = (G.stam / G.stamMax * 100) + '%';
  document.getElementById('xp-bar').style.width = (G.xp / G.xpNext * 100) + '%';

  const entries = inventoryEntries().filter(item => item.count > 0);
  let invHtml = entries.slice(0, 3).map(item => `<div class="ore-row">
    <span class="ore-sym" style="color:${item.fg}">${item.ch}</span>
    <span class="ore-name">${item.name}</span>
    <span class="ore-cnt">${item.count}</span>
  </div>`).join('');
  if (entries.length > 3) {
    invHtml += `<div class="inventory-more">${t('moreInventory', entries.length - 3)}</div>`;
  }
  if (!entries.length) invHtml = `<div style="color:#333;font-size:11px;padding:4px 0">${t('emptyInventory')}</div>`;
  document.getElementById('inv-list').innerHTML = invHtml;
  const invOverlay = document.getElementById('inventory-overlay');
  if (invOverlay && !invOverlay.hasAttribute('hidden')) renderInventoryOverlay();
  const exOverlay = document.getElementById('exchange-overlay');
  if (exOverlay && !exOverlay.hasAttribute('hidden')) renderExchangeWindow();
}

function tryStairs() {
  stopAutoMove();
  const cell = G.map[G.py][G.px];
  if (cell.type === 'stairs') {
    G.depth++;
    log(t('goingDown', G.depth), 'info');
    upgradeCheck();
    newFloor();
  } else if (cell.type === 'mineEntrance') {
    log(t('enterMine'), 'info');
    newFloor();
  } else if (cell.type === 'forestGate') {
    enterForest('plaza');
  } else if (cell.type === 'plazaExit') {
    enterPlaza('forest');
  } else if (cell.type === 'shop') {
    enterShop();
  } else if (cell.type === 'exchange') {
    toggleExchange(true);
  } else if (cell.type === 'shopExit') {
    enterPlaza('shop');
  } else {
    log(t('noEntrance'), 'sys');
  }
}

function tryReturn() {
  stopAutoMove();
  if (G.gameOver) return;

  if (G.area === 'mine' || G.area === 'forest' || G.area === 'shop') {
    enterPlaza('forest');
    return;
  }

  log(t('returnUnavailable'), 'sys');
}

function isMineTarget(cell) {
  return (G.area === 'mine' && (cell.type === 'wall' || cell.type === 'ore')) ||
    (G.area === 'forest' && cell.type === 'tree');
}

function canMineTarget(cell) {
  if (cell.type === 'tree') return G.area === 'forest';
  if (cell.type === 'wall') return G.area === 'mine';
  if (cell.type !== 'ore') return false;
  const ore = ORES.find(o => o.id === cell.ore);
  const pick = PICKAXES[G.pickaxeIdx];
  return pick.power >= ore.pickReq;
}

function mineCell(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return;
  const cell = G.map[ty][tx];

  if (G.area === 'forest' && cell.type === 'tree') {
    if (G.stam < 3) {
      log(t('lowStaminaMine'), 'warn');
      return;
    }
    G.stam = Math.max(0, G.stam - 3);
    G.map[ty][tx] = { type: 'grass' };
    const amount = 1;
    G.inventory.wood_plank = (G.inventory.wood_plank || 0) + amount;
    log(t('treeMined', amount), 'ok');
    tick(2);
    render();
    return;
  }

  if (G.area !== 'mine') {
    log(t('cannotMineHere'), 'sys');
    return;
  }

  if (cell.type === 'wall') {
    if (G.stam < 5) {
      log(t('lowStaminaMine'), 'warn');
      return;
    }
    G.stam = Math.max(0, G.stam - 5);
    G.map[ty][tx] = { type: 'floor' };
    log(t('wallMined'), 'sys');
    tick(2);
    render();
    return;
  }

  if (cell.type === 'ore') {
    const ore = ORES.find(o => o.id === cell.ore);
    const pick = PICKAXES[G.pickaxeIdx];
    if (pick.power < ore.pickReq) {
      log(t('pickTooWeak', oreName(ore)), 'warn');
      return;
    }
    const stamCost = Math.max(2, 8 - pick.power);
    if (G.stam < stamCost) {
      log(t('lowStaminaMine'), 'warn');
      return;
    }
    G.stam = Math.max(0, G.stam - stamCost);

    G.map[ty][tx] = { type: 'floor' };
    const amount = rnd(1, 1 + pick.power);
    G.inventory[ore.id] += amount;
    G.xp += ore.xp * amount;
    log(t('oreGained', oreName(ore), amount, ore.xp * amount), 'ok');

    checkLevelUp();
    tick(3);
    render();
  }
}

function getTileAction(x, y) {
  if (!G.map) return '';
  const cell = G.map[y][x];
  const isPlayer = x === G.px && y === G.py;
  if (isPlayer && isPortalCell(cell)) return 'ENTER';
  if (isPlayer) return 'SELECT';
  if (isWalkableCell(cell)) return 'MOVE';
  if (isMineTarget(cell) && canMineTarget(cell)) return 'MINE';
  return 'SELECT';
}

function actionHint(action) {
  if (action === 'MOVE') return t('moveHint');
  if (action === 'ENTER') return t('enterHint');
  if (action === 'MINE') return t('mineHintAction');
  if (action === 'MOVING') return t('moving');
  return t('noActionHint');
}

function updateSelectionInfo() {
  const info = document.getElementById('selection-info');
  if (!info) return;
  const selected = selectedTile();
  if (!selected) {
    info.textContent = t('interactHint');
    return;
  }

  const { x, y, cell } = selected;
  const isPlayer = x === G.px && y === G.py;
  const target = tileLabel(cell, isPlayer, x, y).toUpperCase();
  const action = G.autoMove?.target ? 'MOVING' : getTileAction(x, y);
  info.textContent = `${target} / ${actionHint(action)}`;
}

function inventoryEntries() {
  return [
    ...MATERIALS.map(item => ({
      id: item.id,
      ch: item.ch,
      fg: item.fg,
      name: materialName(item),
      count: G.inventory[item.id] || 0,
    })),
    ...ORES.map(item => ({
      id: item.id,
      ch: item.ch,
      fg: item.fg,
      name: oreName(item),
      count: G.inventory[item.id] || 0,
    })),
  ];
}

function renderInventoryOverlay() {
  const overlay = document.getElementById('inventory-overlay');
  if (!overlay || !G.map) return;

  const stats = document.getElementById('inventory-stats-list');
  if (stats) {
    const rows = [
      [t('hp'), `${G.hp} / ${G.hpMax}`],
      [t('stamina'), `${G.stam} / ${G.stamMax}`],
      [t('exp'), `${G.xp} / ${G.xpNext}`],
      [t('level'), G.level],
      [t('pickaxe'), PICKAXES[G.pickaxeIdx].name],
      [t('area'), areaLabel()],
      [t('gold'), G.gold || 0],
    ];
    stats.innerHTML = rows.map(([label, value]) => `
      <div class="inventory-stat-row">
        <span>${label}</span>
        <span>${value}</span>
      </div>
    `).join('');
  }

  const grid = document.getElementById('inventory-card-grid');
  if (grid) {
    const entries = inventoryEntries().filter(item => item.count > 0);
    grid.innerHTML = entries.length
      ? entries.map(item => `
        <div class="material-card">
          <div class="material-symbol" style="color:${item.fg}">${item.ch}</div>
          <div class="material-name">${item.name}</div>
          <div class="material-count">${item.count}</div>
        </div>
      `).join('')
      : `<div style="color:#333;font-size:11px;padding:4px 0">${t('emptyInventory')}</div>`;
  }
}

function toggleInventory(forceOpen) {
  const overlay = document.getElementById('inventory-overlay');
  if (!overlay) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.hasAttribute('hidden');
  if (shouldOpen) renderInventoryOverlay();
  overlay.toggleAttribute('hidden', !shouldOpen);
}

function toggleSettings(forceOpen) {
  const overlay = document.getElementById('settings-overlay');
  const button = document.getElementById('settings-btn');
  if (!overlay) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.hasAttribute('hidden');
  overlay.toggleAttribute('hidden', !shouldOpen);
  if (button) button.setAttribute('aria-expanded', String(shouldOpen));
}

function exchangeEntries() {
  return inventoryEntries()
    .map(item => ({ ...item, value: SELL_VALUES[item.id] || 0 }))
    .filter(item => item.count > 0 && item.value > 0);
}

function renderExchangeWindow() {
  const overlay = document.getElementById('exchange-overlay');
  if (!overlay || !G.map) return;
  const goldVal = document.getElementById('exchange-gold-val');
  if (goldVal) goldVal.textContent = G.gold || 0;
  const list = document.getElementById('exchange-list');
  if (!list) return;
  const entries = exchangeEntries();
  list.innerHTML = entries.length
    ? entries.map(item => `
      <div class="exchange-row">
        <span class="ore-sym" style="color:${item.fg}">${item.ch}</span>
        <span class="exchange-name">${item.name} x${item.count}</span>
        <span class="exchange-value">${item.value}G</span>
        <button type="button" onclick="sellItem('${item.id}', 1)">${t('sellOne')}</button>
        <button type="button" onclick="sellItem('${item.id}', ${item.count})">${t('sellAll')}</button>
      </div>
    `).join('')
    : `<div style="color:#333;font-size:11px;padding:4px 0">${t('exchangeEmpty')}</div>`;
}

function toggleExchange(forceOpen) {
  const overlay = document.getElementById('exchange-overlay');
  if (!overlay) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.hasAttribute('hidden');
  if (shouldOpen) renderExchangeWindow();
  overlay.toggleAttribute('hidden', !shouldOpen);
}

function sellItem(id, amount) {
  const current = G.inventory[id] || 0;
  const qty = Math.max(0, Math.min(current, amount));
  const value = SELL_VALUES[id] || 0;
  if (!qty || !value) return;
  G.inventory[id] = current - qty;
  G.gold = (G.gold || 0) + qty * value;
  render();
}

function saveGame() {
  if (!G.map || G.gameOver) return;
  try {
    const state = {
      area: G.area,
      depth: G.depth,
      px: G.px,
      py: G.py,
      hp: G.hp,
      hpMax: G.hpMax,
      stam: G.stam,
      stamMax: G.stamMax,
      xp: G.xp,
      xpNext: G.xpNext,
      level: G.level,
      pickaxeIdx: G.pickaxeIdx,
      gold: G.gold || 0,
      inventory: G.inventory,
      map: G.map,
      plazaMap: G.plazaMap,
      forestMap: G.forestMap,
      selected: G.selected,
      turn: G.turn,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Autosave is best-effort; gameplay should continue if storage is blocked.
  }
}

function manualSave() {
  saveGame();
  log(t('gameSaved'), 'ok');
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!saved || !saved.map) return false;
    G = {
      area: saved.area || 'plaza',
      depth: saved.depth || 1,
      px: saved.px ?? PLAZA_POINTS.spawn.x,
      py: saved.py ?? PLAZA_POINTS.spawn.y,
      hp: saved.hp ?? 100,
      hpMax: saved.hpMax ?? 100,
      stam: saved.stam ?? 100,
      stamMax: saved.stamMax ?? 100,
      xp: saved.xp ?? 0,
      xpNext: saved.xpNext ?? 100,
      level: saved.level ?? 1,
      pickaxeIdx: saved.pickaxeIdx ?? 0,
      gold: saved.gold ?? 0,
      inventory: saved.inventory || {},
      map: saved.map,
      selected: saved.selected || null,
      autoMove: { path: [], timer: null, target: null, mineTarget: null, id: 0 },
      turn: saved.turn || 0,
      gameOver: false,
      plazaMap: saved.plazaMap || null,
      forestMap: saved.forestMap || null,
    };
    ORES.forEach(o => { if (G.inventory[o.id] == null) G.inventory[o.id] = 0; });
    MATERIALS.forEach(m => { if (G.inventory[m.id] == null) G.inventory[m.id] = 0; });
    render();
    return true;
  } catch {
    return false;
  }
}

function manualLoad() {
  const loaded = loadGame();
  if (loaded) {
    log(t('gameLoaded'), 'ok');
  } else {
    log(t('noSave'), 'warn');
  }
}

function startGame(options = {}) {
  try { localStorage.removeItem(SAVE_KEY); } catch { }
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('fade-out');
  overlay.style.display = options.showOverlay ? 'flex' : 'none';
  initGame();
  applyLanguage();
  log(t('mineHint'), 'sys');
}

function gameOver() {
  G.gameOver = true;
  try { localStorage.removeItem(SAVE_KEY); } catch { }
  log(t('gameOverLog'), 'err');
  setTimeout(() => {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.classList.remove('fade-out');
    document.getElementById('overlay-box').innerHTML = `
      <h2>${t('gameOver')}</h2>
      <p>
        ${t('gameOverText', G.depth)}<br><br>
        <span style="color:var(--gold)">GOLD : ${G.gold || 0}</span><br>
        <span style="color:var(--text)">LEVEL : ${G.level}</span><br>
        <span style="color:var(--muted)">DEPTH : B${G.depth}F</span>
      </p>
      <button id="start-btn" onclick="startGame()">[ ${t('restart')} ]</button>
    `;
    document.getElementById('overlay-box').className = '';
  }, 800);
}

function bootGame() {
  const overlay = document.getElementById('overlay');
  setTimeout(() => {
    const loaded = loadGame();
    if (!loaded) {
      initGame();
      log(t('startHint'), 'sys');
      log(t('mineHint'), 'sys');
    }
    applyLanguage();
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('fade-out');
    }, 1100);
  }, 1200);
}

setInterval(() => {
  if (!G.map || G.gameOver || G.stam >= G.stamMax) return;
  G.stam = Math.min(G.stamMax, G.stam + 1);
  render();
}, 1000);

// Auto-save every 5 seconds (separate from render to avoid perf issues)
setInterval(() => {
  if (G.map && !G.gameOver) saveGame();
}, 5000);

// ---- INPUT HANDLERS ----
document.getElementById('map-canvas').addEventListener('pointerdown', e => {
  const btn = e.target.closest('[data-x]');
  if (!btn || G.gameOver) return;
  e.preventDefault();
  const x = parseInt(btn.dataset.x, 10);
  const y = parseInt(btn.dataset.y, 10);
  G.selected = { x, y };
  if (!actOnTile(x, y)) render();
});

document.addEventListener('keydown', e => {
  if (G.gameOver) return;
  if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
    e.preventDefault();
    useSelectedTile();
  } else if (e.key === 'z' || e.key === 'Z') {
    tryMine();
  } else if (e.key === 'r' || e.key === 'R') {
    tryReturn();
  } else if (e.key === 'i' || e.key === 'I') {
    toggleInventory();
  } else if (e.key === 'k' || e.key === 'K') {
    manualSave();
  } else if (e.key === 'l' || e.key === 'L') {
    manualLoad();
  }
});

bootGame();
