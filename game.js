// ============================================================
//  caving.io -- ASCII mining roguelite
// ============================================================

const MAP_SIZE = 30;
const VIEW_W = 15;
const VIEW_H = 15;
const MAP_W = MAP_SIZE;
const MAP_H = MAP_SIZE;
const MAP_LAST_X = MAP_W - 1;
const MAP_LAST_Y = MAP_H - 1;
const MAP_MID_Y = Math.floor(MAP_H / 2);

const TILES = {
  WALL: { ch: '#', fg: '#333333' },
  FLOOR: { ch: '.', fg: '#1e1e1e' },
  PLAYER: { ch: '@', fg: '#ffeb3b' },
  STAIRS: { ch: '>', fg: '#ff9800' },
};

const FOREST_POINTS = {
  spawn: { x: 1, y: MAP_MID_Y },
  plazaExit: { x: 0, y: MAP_MID_Y },
  mine: { x: MAP_W - 7, y: MAP_MID_Y },
};

const PLAZA_POINTS = {
  spawn: { x: Math.floor(MAP_W / 2), y: MAP_MID_Y },
  forestGate: { x: MAP_LAST_X - 1, y: MAP_MID_Y },
  forestReturn: { x: MAP_LAST_X - 2, y: MAP_MID_Y },
  shop: { x: 5, y: 5 },
academy: { x: 5, y: MAP_H - 6 },
};

const SHOP_POINTS = {
  spawn: { x: 12, y: 14 },
  exit: { x: 12, y: 16 },
};

const ORES = [
  { id: 'coal', ch: 'c', name: '석탄', fg: '#607d8b', minDepth: 1, weight: 60, xp: 2, depthReq: 1, hardness: 2 },
  { id: 'iron', ch: 'i', name: '철광석', fg: '#90a4ae', minDepth: 1, weight: 50, xp: 5, depthReq: 1, hardness: 2 },
  { id: 'copper', ch: 'u', name: '구리', fg: '#ff7043', minDepth: 2, weight: 40, xp: 8, depthReq: 1, hardness: 2 },
  { id: 'silver', ch: 's', name: '은', fg: '#cfd8dc', minDepth: 3, weight: 25, xp: 15, depthReq: 2, hardness: 4 },
  { id: 'gold', ch: 'o', name: '금', fg: '#ffd700', minDepth: 4, weight: 15, xp: 25, depthReq: 2, hardness: 4 },
  { id: 'emerald', ch: 'e', name: '에메랄드', fg: '#26a69a', minDepth: 5, weight: 10, xp: 40, depthReq: 3, hardness: 6 },
  { id: 'ruby', ch: 'r', name: '루비', fg: '#ef5350', minDepth: 6, weight: 7, xp: 55, depthReq: 3, hardness: 6 },
  { id: 'diamond', ch: 'd', name: '다이아몬드', fg: '#80deea', minDepth: 7, weight: 3, xp: 80, depthReq: 4, hardness: 8 },
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

const CARDINAL_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const ORE_BY_ID = Object.fromEntries(ORES.map(ore => [ore.id, ore]));

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
    loading: 'LOADING', settings: 'SETTINGS', settingsShort: 'SET', install: 'INSTALL', layout: 'LAYOUT', classic: 'CLASSIC', square: 'SQUARE', saveLoad: 'SAVE/LOAD',
    miniMap: 'MINIMAP', on: 'ON', off: 'OFF', theme: 'THEME', dark: 'DARK', light: 'LIGHT',
    language: 'LANGUAGE', status: 'STATUS', hp: 'HP', stamina: 'STAMINA', exp: 'EXP', level: 'LEVEL',
    power: 'POWER', area: 'AREA', gold: 'GOLD', statPoints: 'STAT POINTS', points: 'POINTS', statDamage: 'Damage Up', statAttackSpeed: 'Attack Speed Up', statGoldMult: 'Gold Rate Up', upgradeDamage: 'Damage Upgrade (100G)', upgradeGoldMult: 'Gold Gain Upgrade (180G)', upgradeAttackSpeed: 'Attack Speed Upgrade (150G)', inventory: 'INVENTORY', inventoryButton: 'INVENTORY (I)', saveButton: 'SAVE (K)', loadButton: 'LOAD (L)', materials: 'MATERIALS', action: 'ACTION',
    use: 'USE', mine: 'MINE', return: 'RETURN (R)', rest: 'REST', log: 'LOG',
    noSelection: 'NO TILE SELECTED', moving: 'MOVING', select: 'SELECT', enter: 'ENTER', move: 'MOVE',
    player: 'Player', wall: 'Wall', floor: 'Floor', stairs: 'Stairs', grass: 'Grass', tree: 'Tree',
    stone: 'Stone', flower: 'Flower', mineEntrance: 'Mine entrance', shop: 'Shop', shopExit: 'Shop exit',
    academy: 'Academy', upgrades: 'Upgrades', craftWoodPickaxe: 'Craft Wood Pickaxe', craftStonePickaxe: 'Craft Stone Pickaxe', craftWoodPickaxeReq: 'Craft Wood Pickaxe (Needs: Wood Plank x5)', craftStonePickaxeReq: 'Craft Stone Pickaxe (Needs: Wood Pickaxe + Iron x5 + Coal x3)', crafted: item => `Crafted ${item}.`, alreadyOwned: item => `Already own ${item}.`, notEnoughMaterials: 'Not enough materials.', exchange: 'Exchange', forestGate: 'Forest gate', plazaGate: 'Plaza gate', plazaExit: 'Plaza exit',
    interactHint: 'Select a tile to see actions.', moveHint: 'Tap tile to move.', enterHint: 'Press E or tap tile to enter.',
    mineHintAction: 'Press Space/Z or tap tile to mine.', noActionHint: 'No action available.',
    oreHp: (hp, maxHp) => `ORE HP ${hp}/${maxHp}`,
    itemsTab: 'ITEMS', equipmentTab: 'EQUIPMENT', pickaxeSlot: 'PICKAXE SLOT', dragPickaxeHint: 'Drag a pickaxe card and drop it in the slot.',
    equipped: 'EQUIPPED', equipEmpty: 'No pickaxe equipped.', equippedPickaxe: pick => `Equipped pickaxe: ${pick}`, noPickaxeEquipped: 'No pickaxe equipped.',
    emptyInventory: '-- EMPTY --', exchange: 'EXCHANGE', exchangeEmpty: 'Nothing to exchange.', sellOne: 'SELL 1', sellAll: 'SELL ALL',
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
    loading: '로딩 중', settings: '설정', settingsShort: '설정', install: '설치', layout: '배치', classic: '기본', square: '정사각', saveLoad: '저장/불러오기',
    miniMap: '미니맵', on: '켜기', off: '끄기', theme: '테마', dark: '다크', light: '라이트',
    language: '언어', status: '상태', hp: '체력', stamina: '스태미나', exp: '경험치', level: '레벨',
    power: '능력', area: '지역', gold: '골드', statPoints: '스탯 포인트', points: '포인트', statDamage: '데미지 증가', statAttackSpeed: '공격 속도 증가', statGoldMult: '획득 골드 비율 증가', upgradeDamage: '데미지 강화 (100G)', upgradeGoldMult: '획득 골드 강화 (180G)', upgradeAttackSpeed: '공격 속도 강화 (150G)', inventory: '인벤토리', inventoryButton: '인벤토리 (I)', saveButton: '저장 (K)', loadButton: '불러오기 (L)', materials: '재료', action: '행동',
    use: '사용', mine: '채굴', return: '귀환 (R)', rest: '휴식', log: '기록',
    noSelection: '선택한 타일 없음', moving: '이동 중', select: '선택', enter: '입장', move: '이동',
    player: '플레이어', wall: '벽', floor: '바닥', stairs: '계단', grass: '풀', tree: '나무',
    stone: '돌', flower: '꽃', mineEntrance: '광산 입구', shop: '상점', shopExit: '상점 출구',
    academy: '훈련소', upgrades: '강화', craftWoodPickaxe: '나무 곡괭이 제작', craftStonePickaxe: '돌 곡괭이 제작', craftWoodPickaxeReq: '나무 곡괭이 제작 (재료: 나무판자 5개)', craftStonePickaxeReq: '돌 곡괭이 제작 (재료: 나무 곡괭이 + 철광석 5개 + 석탄 3개)', crafted: item => `${item} 제작 완료.`, alreadyOwned: item => `${item}은 이미 보유 중이다.`, notEnoughMaterials: '재료가 부족하다.', exchange: '거래소', forestGate: '숲 입구', plazaGate: '광장 입구', plazaExit: '광장 출구',
    interactHint: '타일을 선택하면 행동 방법이 표시됩니다.', moveHint: '타일을 누르면 이동합니다.', enterHint: 'E 또는 타일 터치로 입장합니다.',
    mineHintAction: 'Space/Z 또는 타일 터치로 채굴합니다.', noActionHint: '가능한 행동이 없습니다.',
    oreHp: (hp, maxHp) => `광석 체력 ${hp}/${maxHp}`,
    itemsTab: '아이템', equipmentTab: '장비', pickaxeSlot: '곡괭이 슬롯', dragPickaxeHint: '곡괭이 카드를 드래그해서 슬롯에 장착하세요.',
    equipped: '장착 중', equipEmpty: '장착된 곡괭이가 없습니다.', equippedPickaxe: pick => `곡괭이 장착: ${pick}`, noPickaxeEquipped: '장착한 곡괭이가 없다.',
    emptyInventory: '-- 비어 있음 --', exchange: '거래소', exchangeEmpty: '교환할 물건이 없습니다.', sellOne: '1개 판매', sellAll: '전부 판매',
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

function log(message, type = 'sys') { /* log panel removed */ }

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      layoutMode: saved.layoutMode === 'square' ? 'square' : 'classic',
      language: saved.language === 'ko' ? 'ko' : 'en',
      minimapEnabled: saved.minimapEnabled !== false,
      themeMode: saved.themeMode === 'light' ? 'light' : 'dark',
    };
  } catch {
    return { layoutMode: 'classic', language: 'en', minimapEnabled: true, themeMode: 'dark' };
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
  document.querySelectorAll('[data-minimap-option]').forEach(btn => {
    const enabled = SETTINGS.minimapEnabled !== false;
    btn.classList.toggle('active', (btn.dataset.minimapOption === 'on') === enabled);
  });
  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeOption === (SETTINGS.themeMode || 'dark'));
  });
  const upgradeLabelKey = {
    damage: 'upgradeDamage',
    gold_mult: 'upgradeGoldMult',
    attack_speed: 'upgradeAttackSpeed',
  };
  document.querySelectorAll('[data-upgrade]').forEach(btn => {
    const key = upgradeLabelKey[btn.dataset.upgrade];
    if (key) btn.textContent = t(key);
  });
  const allocOpen = document.getElementById('stat-alloc-list')?.classList.contains('open') ?? true;
  updateStatToggleLabel(allocOpen);
  if (G.map) render();
  else updateSelectionInfo();
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

function setThemeMode(mode) {
  SETTINGS.themeMode = mode === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = SETTINGS.themeMode;
  saveSettings();
  applyLanguage();
}


function updateStatToggleLabel(isOpen) {
  const toggle = document.getElementById('alloc-toggle');
  if (!toggle) return;
  const points = G?.statPoints ?? 0;
  toggle.textContent = `${t('statPoints')} ${isOpen ? '▾' : '▸'}   ${points}`;
}

function toggleStatPoints(forceOpen) {
  const panel = document.getElementById('stat-alloc-list');
  const toggle = document.getElementById('alloc-toggle');
  if (!panel || !toggle) return;
  const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  updateStatToggleLabel(willOpen);
}

function setMinimapEnabled(enabled) {
  SETTINGS.minimapEnabled = enabled !== false;
  saveSettings();
  applyLanguage();
  if (G.map) render();
}


function syncViewportHeight() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}

window.addEventListener('resize', syncViewportHeight, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncViewportHeight, { passive: true });
}
syncViewportHeight();

applyLayoutMode(SETTINGS.layoutMode);
document.body.dataset.theme = SETTINGS.themeMode || 'dark';
applyLanguage();


const UI = {
  mapCanvas: () => document.getElementById('map-canvas'),
  miniMap: () => document.getElementById('mini-map'),
  hpVal: () => document.getElementById('hp-val'),
  stamVal: () => document.getElementById('stam-val'),
  xpVal: () => document.getElementById('xp-val'),
  lvVal: () => document.getElementById('lv-val'),
  pickVal: () => document.getElementById('pick-val'),
  depthVal: () => document.getElementById('depth-val'),
  goldVal: () => document.getElementById('gold-val'),
  statPointsVal: () => document.getElementById('stat-points-val'),
  mapTitle: () => document.getElementById('map-title'),
  hpBar: () => document.getElementById('hp-bar'),
  stamBar: () => document.getElementById('stam-bar'),
  xpBar: () => document.getElementById('xp-bar'),
};

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
              map[y][x] = { type: 'ore', ore: ore.id, hp: ore.hardness, maxHp: ore.hardness };
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
    for (const [dx, dy] of CARDINAL_DIRS) {
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
    G.statPoints = (G.statPoints || 0) + 1;
    log(t('levelUp', G.level), 'info');
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

  for (let x = 4; x <= PLAZA_POINTS.forestGate.x; x++) {
    setCell(map, x, MAP_MID_Y, { type: 'floor' });
  }
  for (let y = MAP_MID_Y - 4; y <= MAP_MID_Y + 4; y++) {
    setCell(map, PLAZA_POINTS.spawn.x, y, { type: 'floor' });
  }

  setCell(map, PLAZA_POINTS.shop.x, PLAZA_POINTS.shop.y, { type: 'shop' });
  setCell(map, PLAZA_POINTS.academy.x, PLAZA_POINTS.academy.y, { type: 'academy' });
  setCell(map, PLAZA_POINTS.forestGate.x, PLAZA_POINTS.forestGate.y, { type: 'forestGate' });
  setCell(map, PLAZA_POINTS.forestReturn.x, PLAZA_POINTS.forestReturn.y, { type: 'floor' });
  migrateWorkbenchInMap(map);
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
  let head = 0;
  visited[G.py][G.px] = true;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    if (cx === tx && cy === ty) {
      const path = [];
      let cur = [tx, ty];
      while (cur[0] !== G.px || cur[1] !== G.py) {
        path.unshift({ x: cur[0], y: cur[1] });
        cur = prev[cur[1]][cur[0]];
      }
      return path;
    }
    for (const [dx, dy] of CARDINAL_DIRS) {
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
  for (const [dx, dy] of CARDINAL_DIRS) {
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
function migrateWorkbenchInMap(map) {
  if (!Array.isArray(map)) return;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y]?.[x]?.type === 'anvil') map[y][x] = { type: 'academy' };
    }
  }
}


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
    attackDamage: 1,
    attackSpeed: 1,
    goldMult: 1,
    statPoints: 0,
    gold: 0,
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
  enterPlaza('start');
  saveGame();
}

function enterPlaza(entry = 'start') {
  stopAutoMove();
  G.area = 'plaza';
  if (!G.plazaMap) G.plazaMap = generatePlazaMap();
  migrateWorkbenchInMap(G.plazaMap);
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
    case 'shopExit':
      return { ch: '<', fg: '#ff9800', weight: 'bold' };
    case 'academy':
      return { ch: 'W', fg: '#8d6e63', weight: 'bold' };
    case 'ore': {
      const ore = ORE_BY_ID[cell.ore];
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
  if (cell.type === 'shopExit') return `${t('shopExit')} ${x}, ${y}`;
  if (cell.type === 'academy') return `${t('academy')} ${x}, ${y}`;
  if (cell.type === 'ore') return `${oreName(ORE_BY_ID[cell.ore])} ${x}, ${y}`;
  return `${x}, ${y}`;
}

function isWalkableCell(cell) {
  return ['floor', 'stairs', 'grass', 'flower', 'mineEntrance', 'shop', 'shopExit', 'forestGate', 'plazaExit', 'academy'].includes(cell.type);
}

function isPortalCell(cell) {
  return ['stairs', 'mineEntrance', 'shop', 'shopExit', 'forestGate', 'plazaExit', 'academy'].includes(cell.type);
}

function areaLabel() {
  if (G.area === 'plaza') return t('plaza');
  if (G.area === 'forest') return t('forest');
  if (G.area === 'shop') return t('shopArea');
  return `B${G.depth}F`;
}

function getViewportBounds() {
  const halfW = Math.floor(VIEW_W / 2);
  const halfH = Math.floor(VIEW_H / 2);
  const minX = Math.max(0, Math.min(G.px - halfW, MAP_W - VIEW_W));
  const minY = Math.max(0, Math.min(G.py - halfH, MAP_H - VIEW_H));
  return {
    startX: minX,
    startY: minY,
    endX: Math.min(MAP_W - 1, minX + VIEW_W - 1),
    endY: Math.min(MAP_H - 1, minY + VIEW_H - 1),
  };
}

function render() {
  const canvas = UI.mapCanvas();
  const view = getViewportBounds();
  canvas.style.setProperty('--map-cols', VIEW_W);
  canvas.style.setProperty('--map-rows', VIEW_H);
  canvas.className = `area-${G.area || 'mine'}`;
  let html = '';
  for (let y = view.startY; y <= view.endY; y++) {
    for (let x = view.startX; x <= view.endX; x++) {
      const isPlayer = (x === G.px && y === G.py);
      const selected = G.selected && G.selected.x === x && G.selected.y === y;
      const action = getTileAction(x, y);
      const cell = G.map[y][x];
      const glyph = cellGlyph(cell, isPlayer);
      const underGlyph = isPlayer ? cellGlyph(cell, false) : null;
      const oreHp = cell.type === 'ore' ? `<span class="tile-ore-hp">${Math.ceil(cell.hp ?? cell.maxHp ?? ORE_BY_ID[cell.ore].hardness)}</span>` : '';
      const classes = [
        'tile',
        `tile-${cell.type}`,
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
      html += `<button type="button" class="${classes}" data-x="${x}" data-y="${y}" aria-label="${tileLabel(cell, isPlayer, x, y)}">
        ${underlay}<span class="tile-glyph" style="color:${glyph.fg};font-weight:${glyph.weight}">${glyph.ch}</span>${oreHp}${corners}
      </button>`;
    }
  }
  canvas.innerHTML = html;
  updateSelectionInfo();

  UI.hpVal().textContent = `${G.hp} / ${G.hpMax}`;
  UI.stamVal().textContent = `${G.stam} / ${G.stamMax}`;
  UI.xpVal().textContent = `${G.xp} / ${G.xpNext}`;
  UI.lvVal().textContent = G.level;
  UI.pickVal().textContent = `DMG ${G.attackDamage.toFixed(1)} / ASPD ${G.attackSpeed.toFixed(1)} / GOLD x${G.goldMult.toFixed(1)}`;
  UI.depthVal().textContent = areaLabel();
  UI.goldVal().textContent = G.gold || 0;
  const sp = UI.statPointsVal();
  if (sp) sp.textContent = G.statPoints || 0;
  updateStatToggleLabel(document.getElementById('stat-alloc-list')?.classList.contains('open') ?? true);
  UI.mapTitle().textContent =
    G.area === 'mine' ? t('dungeonMap') :
      G.area === 'shop' ? t('shopMap') :
        G.area === 'plaza' ? t('plazaMap') : t('forestMap');

  UI.hpBar().style.width = (G.hp / G.hpMax * 100) + '%';
  UI.stamBar().style.width = (G.stam / G.stamMax * 100) + '%';
  UI.xpBar().style.width = (G.xp / G.xpNext * 100) + '%';
  renderMiniMap();

}

function minimapColor(cell) {
  if (!cell) return '#000';
  if (cell.type === 'wall') return '#111';
  if (cell.type === 'ore') return '#6f8a96';
  if (cell.type === 'floor') return '#404040';
  if (cell.type === 'grass') return '#22542a';
  if (cell.type === 'tree') return '#2e7d32';
  if (cell.type === 'flower') return '#e5dc54';
  if (cell.type === 'stairs') return '#ff9800';
  if (cell.type === 'mineEntrance') return '#ff9800';
  if (cell.type === 'forestGate' || cell.type === 'plazaExit' || cell.type === 'shopExit') return '#ff9800';
  if (cell.type === 'shop' || cell.type === 'academy') return '#ffd700';
  return '#505050';
}

function renderMiniMap() {
  const mini = UI.miniMap();
  if (!mini || !G.map) return;
  mini.hidden = SETTINGS.minimapEnabled === false;
  if (mini.hidden) return;
  const ctx = mini.getContext('2d');
  if (!ctx) return;
  const w = mini.width;
  const h = mini.height;
  ctx.clearRect(0, 0, w, h);
  const cw = w / MAP_W;
  const ch = h / MAP_H;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      ctx.fillStyle = minimapColor(G.map[y][x]);
      ctx.fillRect(x * cw, y * ch, Math.ceil(cw), Math.ceil(ch));
    }
  }
  ctx.strokeStyle = '#a0a0a0';
  ctx.strokeRect(0, 0, w, h);
  const view = getViewportBounds();
  ctx.strokeStyle = '#ffeb3b';
  ctx.lineWidth = 1;
  ctx.strokeRect(view.startX * cw, view.startY * ch, VIEW_W * cw, VIEW_H * ch);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(G.px * cw, G.py * ch, Math.max(2, cw), Math.max(2, ch));
}

function tryStairs() {
  stopAutoMove();
  const cell = G.map[G.py][G.px];
  if (cell.type === 'stairs') {
    G.depth++;
    log(t('goingDown', G.depth), 'info');
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
  } else if (cell.type === 'shopExit') {
    enterPlaza('shop');
  } else if (cell.type === 'academy') {
    toggleCrafting(true);
  } else {
    log(t('noEntrance'), 'sys');
  }
}

function tryReturn() {
  stopAutoMove();
  if (G.gameOver) return;

  if (G.area === 'mine' || G.area === 'forest') {
    enterPlaza('forest');
    return;
  }

  if (G.area === 'shop') {
    enterPlaza('shop');
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
  return true;
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
    const goldGain = Math.max(1, Math.round((SELL_VALUES.wood_plank || 1) * amount * G.goldMult));
    G.gold += goldGain;
    log(`${t('treeMined', amount)} (+${goldGain}G)`, 'ok');
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
    const ore = ORE_BY_ID[cell.ore];
    const stamCost = Math.max(1, Math.round(6 - G.attackSpeed));
    if (G.stam < stamCost) {
      log(t('lowStaminaMine'), 'warn');
      return;
    }
    G.stam = Math.max(0, G.stam - stamCost);
    const nextHp = Math.max(0, (cell.hp ?? ore.hardness) - G.attackDamage);
    if (nextHp > 0) {
      G.map[ty][tx] = { ...cell, hp: nextHp, maxHp: cell.maxHp ?? ore.hardness };
      tick(Math.max(1, Math.round(3 - G.attackSpeed)));
      render();
      return;
    }
    G.map[ty][tx] = { type: 'floor' };
    const amount = 1;
    const xpGain = ore.xp * amount;
    const goldGain = Math.max(1, Math.round((SELL_VALUES[ore.id] || 1) * amount * G.goldMult));
    G.gold += goldGain;
    G.xp += xpGain;
    log(`${t('oreGained', oreName(ore), amount, xpGain)} (+${goldGain}G)`, 'ok');

    checkLevelUp();
    tick(Math.max(1, Math.round(3 - G.attackSpeed)));
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
  const oreHpText = cell.type === 'ore' ? ` / ${t('oreHp', Math.ceil(cell.hp ?? cell.maxHp ?? ORE_BY_ID[cell.ore].hardness), cell.maxHp ?? ORE_BY_ID[cell.ore].hardness)}` : '';
  info.textContent = `${target}${oreHpText} / ${actionHint(action)}`;
}
















function toggleSettings(forceOpen) {
  const overlay = document.getElementById('settings-overlay');
  const button = document.getElementById('settings-btn');
  if (!overlay) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.hasAttribute('hidden');
  if (shouldOpen) {
    toggleCrafting(false);
  }
  overlay.toggleAttribute('hidden', !shouldOpen);
  if (button) button.setAttribute('aria-expanded', String(shouldOpen));
}






function toggleCrafting(forceOpen) {
  const overlay = document.getElementById('crafting-overlay');
  if (!overlay) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.hasAttribute('hidden');
  overlay.toggleAttribute('hidden', !shouldOpen);
}

function craftPickaxe(id) {
  const cfg = { damage:{cost:100, apply:()=>G.attackDamage=Number((G.attackDamage+0.2).toFixed(1))}, attack_speed:{cost:150, apply:()=>G.attackSpeed=Number((G.attackSpeed+0.2).toFixed(1))}, gold_mult:{cost:180, apply:()=>G.goldMult=Number((G.goldMult+0.2).toFixed(1))} };
  const up = cfg[id];
  if (!up) return;
  if (G.gold < up.cost) { log(t('notEnoughMaterials'), 'warn'); return; }
  G.gold -= up.cost; up.apply();
  log(t('crafted', id), 'ok');
  render();
}


function allocateStat(stat) {
  if (!G.map || G.gameOver) return;
  if ((G.statPoints || 0) <= 0) return;
  if (stat === 'damage') { G.attackDamage = Number((G.attackDamage + 0.1).toFixed(1)); }
  else if (stat === 'attack_speed') { G.attackSpeed = Number((G.attackSpeed + 0.1).toFixed(1)); }
  else if (stat === 'gold_mult') { G.goldMult = Number((G.goldMult + 0.1).toFixed(1)); }
  else return;
  G.statPoints -= 1;
  render();
}

function saveGame() {
  if (!G.map || G.gameOver) return false;
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
        attackDamage: G.attackDamage,
      attackSpeed: G.attackSpeed,
      goldMult: G.goldMult,
      statPoints: G.statPoints || 0,
      gold: G.gold || 0,
      map: G.map,
      plazaMap: G.plazaMap,
      forestMap: G.forestMap,
      selected: G.selected,
      turn: G.turn,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // Autosave is best-effort; gameplay should continue if storage is blocked.
  }
  return false;
}

function manualSave() {
  if (saveGame()) {
    log(t('gameSaved'), 'ok');
  } else {
    log(t('noSave'), 'warn');
  }
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
        attackDamage: Number(saved.attackDamage) || 1,
      attackSpeed: Number(saved.attackSpeed) || 1,
      goldMult: Number(saved.goldMult) || 1,
      statPoints: saved.statPoints ?? 0,
      gold: saved.gold ?? 0,
      map: saved.map,
      selected: saved.selected || null,
      autoMove: { path: [], timer: null, target: null, mineTarget: null, id: 0 },
      turn: saved.turn || 0,
      gameOver: false,
      plazaMap: saved.plazaMap || null,
      forestMap: saved.forestMap || null,
    };
    migrateWorkbenchInMap(G.plazaMap);
    migrateWorkbenchInMap(G.map);
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
  if (e.key === 'Escape') {
    toggleSettings(false);
    toggleCrafting(false);
    return;
  }
  if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
    e.preventDefault();
    useSelectedTile();
  } else if (e.key === 'z' || e.key === 'Z') {
    tryMine();
  } else if (e.key === 'r' || e.key === 'R') {
    tryReturn();
  } else if (e.key === 'k' || e.key === 'K') {
    manualSave();
  } else if (e.key === 'l' || e.key === 'L') {
    manualLoad();
  }
});

bootGame();
