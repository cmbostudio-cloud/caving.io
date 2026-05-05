// ============================================================
//  caving.io -- ASCII mining roguelite
// ============================================================

const MAP_SIZE = 30;
const VIEW_W = 15;
const VIEW_H = 9;
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
  mine: { x: 10, y: MAP_MID_Y - 4 },
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
    language: 'LANGUAGE', status: 'STATUS', statusPanel: 'STATUS', hp: 'HP', stamina: 'STAMINA', exp: 'EXP', level: 'LEVEL',
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
    language: '언어', status: '상태', statusPanel: '상태', hp: '체력', stamina: '스태미나', exp: '경험치', level: '레벨',
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
      themeMode: resolveThemeMode(saved.themeMode ?? saved.theme),
    };
  } catch {
    return { layoutMode: 'classic', language: 'en', minimapEnabled: true, themeMode: resolveThemeMode() };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
  } catch {
    // Settings are optional; the game should still run when storage is blocked.
  }
}


function resolveThemeMode(value) {
  return value === 'light' ? 'light' : 'dark';
}

function applyThemeMode(mode) {
  const themeMode = resolveThemeMode(mode);
  document.body.dataset.theme = themeMode;
  document.documentElement.style.colorScheme = themeMode;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', themeMode === 'light' ? '#f4f4f4' : '#0a0a0a');
  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeOption === themeMode);
  });
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
  applyThemeMode(SETTINGS.themeMode);
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
  SETTINGS.themeMode = resolveThemeMode(mode);
  saveSettings();
  applyThemeMode(SETTINGS.themeMode);
}



window.addEventListener('pageshow', () => {
  SETTINGS = loadSettings();
  applyThemeMode(SETTINGS.themeMode);
  applyLayoutMode(SETTINGS.layoutMode);
  applyLanguage();
});

window.addEventListener('storage', e => {
  if (e.key !== SETTINGS_KEY) return;
  SETTINGS = loadSettings();
  applyThemeMode(SETTINGS.themeMode);
  applyLayoutMode(SETTINGS.layoutMode);
  applyLanguage();
});

function updateStatToggleLabel(isOpen) {
  const toggle = document.getElementById('alloc-toggle');
  if (!toggle) return;
  const points = G?.statPoints ?? 0;
  toggle.innerHTML = `<span class="toggle-label">${t('statPoints')} ${isOpen ? '▾' : '▸'}</span><span class="toggle-value">${points}</span>`;
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


function updateStatusToggleLabel(isOpen) {
  const toggle = document.getElementById('status-toggle');
  if (!toggle) return;
  toggle.textContent = `${t('statusPanel')} ${isOpen ? '▾' : '▸'}`;
}

function toggleStatusPanel(forceOpen) {
  const core = document.getElementById('core-status-row');
  const meta = document.getElementById('meta-stack');
  const panel = document.getElementById('status-panel');
  const toggle = document.getElementById('status-toggle');
  if (!core || !meta || !toggle || !panel) return;
  const isOpen = core.classList.contains('open');
  const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
  core.classList.toggle('open', willOpen);
  meta.classList.toggle('open', willOpen);
  panel.dataset.expanded = willOpen ? 'true' : 'false';
  toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  updateStatusToggleLabel(willOpen);
}

function setMinimapEnabled(enabled) {
  SETTINGS.minimapEnabled = enabled !== false;
  saveSettings();
  applyLanguage();
  if (G.map) render();
}
