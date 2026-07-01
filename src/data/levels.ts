import type { LevelDefinition } from '../game/types';

export const levels: LevelDefinition[] = [
  {
    id: 1,
    name: '糖砖庭院',
    parSeconds: 95,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P..X..X..X..O#',
      '#.#.#X#.#X#.#.#',
      '#..X..E..X....#',
      '#X#.#.#X#.#.#X#',
      '#..X..B..X..E.#',
      '#.#X#.#.#.#X#.#',
      '#..E..X..B..X.#',
      '#X#.#X#.#.#.#X#',
      '#....X..E..X..#',
      '#.#.#.#X#.#.#.#',
      '#K..X..X..X..C#',
      '###############'
    ],
    enemies: [
      { kind: 'patrol', x: 6, y: 3 },
      { kind: 'patrol', x: 11, y: 5 },
      { kind: 'hunter', x: 3, y: 7 }
    ],
    powerUps: [
      { kind: 'bomb', x: 6, y: 5 },
      { kind: 'range', x: 10, y: 7 },
      { kind: 'heart', x: 13, y: 11 }
    ],
    events: [{ type: 'gateTimer', at: 45, message: '出口机关开始发光' }]
  },
  {
    id: 2,
    name: '果冻工坊',
    parSeconds: 115,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X...X...X.O#',
      '#.#X#.#.#.#X#.#',
      '#..X.E.X.E.X..#',
      '#X#.#X#.#X#.#X#',
      '#...X...B...X.#',
      '#.#.#.#K#.#.#.#',
      '#.X...X...C...#',
      '#X#.#X#.#X#.#X#',
      '#..E.X...X.E..#',
      '#.#X#.#.#.#X#.#',
      '#A.X...B...X..#',
      '###############'
    ],
    enemies: [
      { kind: 'patrol', x: 5, y: 3 },
      { kind: 'hunter', x: 9, y: 3 },
      { kind: 'armored', x: 3, y: 9 },
      { kind: 'patrol', x: 11, y: 9 }
    ],
    powerUps: [
      { kind: 'range', x: 8, y: 5 },
      { kind: 'speed', x: 6, y: 11 },
      { kind: 'ice', x: 1, y: 11 }
    ],
    events: [{ type: 'hunterRush', at: 60, message: '警报响起：新的追踪者入场' }]
  },
  {
    id: 3,
    name: '蒸汽温室',
    parSeconds: 125,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P..X.X...X..O#',
      '#.#.#.#X#.#.#.#',
      '#X..E...X..E..#',
      '#.#X#.#.#X#.#X#',
      '#..B..X..B..X.#',
      '#X#.#K#M#.#C#.#',
      '#.X..B..X..B..#',
      '#.#X#.#.#X#.#X#',
      '#..E..X...E..X#',
      '#.#.#.#X#.#.#.#',
      '#A..X...X.X...#',
      '###############'
    ],
    enemies: [
      { kind: 'hunter', x: 4, y: 3 },
      { kind: 'patrol', x: 11, y: 3 },
      { kind: 'armored', x: 3, y: 9 },
      { kind: 'hunter', x: 10, y: 9 }
    ],
    powerUps: [
      { kind: 'bomb', x: 3, y: 11 },
      { kind: 'range', x: 5, y: 5 },
      { kind: 'bounce', x: 9, y: 5 },
      { kind: 'speed', x: 11, y: 7 }
    ],
    events: [{ type: 'movingWall', at: 55, message: '中央蒸汽墙正在移动' }]
  },
  {
    id: 4,
    name: '夜光港口',
    parSeconds: 135,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X..X..X...O#',
      '#.#.#X#.#X#.#.#',
      '#..E..X..E.X..#',
      '#X#.#.#X#.#.#X#',
      '#..B.X...X.B..#',
      '#.#.#.#K#.#.#.#',
      '#..C.X...X.B..#',
      '#X#.#.#X#.#.#X#',
      '#..X.E..X..E..#',
      '#.#.#X#.#X#.#.#',
      '#A..X..B..X...#',
      '###############'
    ],
    enemies: [
      { kind: 'hunter', x: 3, y: 3 },
      { kind: 'armored', x: 9, y: 3 },
      { kind: 'patrol', x: 5, y: 9 },
      { kind: 'hunter', x: 11, y: 9 },
      { kind: 'armored', x: 2, y: 11 }
    ],
    powerUps: [
      { kind: 'ice', x: 1, y: 11 },
      { kind: 'range', x: 5, y: 11 },
      { kind: 'bomb', x: 10, y: 5 },
      { kind: 'heart', x: 2, y: 7 }
    ],
    events: [{ type: 'hunterRush', at: 50, message: '码头巡逻队加入战斗' }]
  },
  {
    id: 5,
    name: '星核塔顶',
    parSeconds: 150,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X.X...X.X.O#',
      '#.#.#.#X#.#.#.#',
      '#E..X..E..X..E#',
      '#X#.#X#.#X#.#X#',
      '#..B...M...B..#',
      '#.#X#.#K#.#X#.#',
      '#..B...C...B..#',
      '#X#.#X#.#X#.#X#',
      '#E..X..E..X..E#',
      '#.#.#.#X#.#.#.#',
      '#A.X.X...X.X.A#',
      '###############'
    ],
    enemies: [
      { kind: 'armored', x: 1, y: 3 },
      { kind: 'hunter', x: 6, y: 3 },
      { kind: 'armored', x: 13, y: 3 },
      { kind: 'patrol', x: 1, y: 9 },
      { kind: 'hunter', x: 6, y: 9 },
      { kind: 'armored', x: 13, y: 9 }
    ],
    powerUps: [
      { kind: 'ice', x: 1, y: 11 },
      { kind: 'bounce', x: 13, y: 11 },
      { kind: 'range', x: 6, y: 5 },
      { kind: 'bomb', x: 10, y: 5 },
      { kind: 'heart', x: 7, y: 7 }
    ],
    events: [
      { type: 'movingWall', at: 45, message: '星核墙开始错位' },
      { type: 'hunterRush', at: 85, message: '最后的追踪者入场' }
    ]
  },
  {
    id: 6,
    name: '蜂蜜回廊',
    parSeconds: 155,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P..X..B..X..O#',
      '#.#X#.#.#.#X#.#',
      '#E.X...X...E.X#',
      '#X#.#X#M#X#.#X#',
      '#..B.X...X.B..#',
      '#.#.#.#K#.#.#.#',
      '#..C.X...X.B..#',
      '#X#.#X#.#X#.#X#',
      '#X.E...X...E.X#',
      '#.#X#.#.#.#X#.#',
      '#A..X..B..X..A#',
      '###############'
    ],
    enemies: [
      { kind: 'hunter', x: 4, y: 3 },
      { kind: 'patrol', x: 10, y: 3 },
      { kind: 'armored', x: 3, y: 9 },
      { kind: 'hunter', x: 11, y: 9 },
      { kind: 'patrol', x: 13, y: 11 }
    ],
    powerUps: [
      { kind: 'range', x: 6, y: 1 },
      { kind: 'bomb', x: 3, y: 5 },
      { kind: 'speed', x: 11, y: 7 },
      { kind: 'ice', x: 7, y: 4 },
      { kind: 'heart', x: 13, y: 11 }
    ],
    events: [{ type: 'movingWall', at: 50, message: '蜂蜜墙缓缓滑动' }]
  },
  {
    id: 7,
    name: '琉璃矿洞',
    parSeconds: 165,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X.X...X.X.O#',
      '#.#.#X#.#X#.#.#',
      '#..E..X.X..E..#',
      '#X#.#.#X#.#.#X#',
      '#..B...B...B..#',
      '#X#.#K#.#.#C#X#',
      '#..B...M...B..#',
      '#X#.#.#X#.#.#X#',
      '#..E..X.X..E..#',
      '#.#.#X#.#X#.#.#',
      '#A.X.X...X.X.A#',
      '###############'
    ],
    enemies: [
      { kind: 'armored', x: 3, y: 3 },
      { kind: 'hunter', x: 11, y: 3 },
      { kind: 'patrol', x: 5, y: 9 },
      { kind: 'hunter', x: 9, y: 9 },
      { kind: 'armored', x: 13, y: 11 }
    ],
    powerUps: [
      { kind: 'bomb', x: 3, y: 5 },
      { kind: 'range', x: 7, y: 5 },
      { kind: 'bounce', x: 11, y: 5 },
      { kind: 'heart', x: 13, y: 11 }
    ],
    events: [{ type: 'hunterRush', at: 70, message: '矿洞深处传来追踪声' }]
  },
  {
    id: 8,
    name: '风车仓库',
    parSeconds: 175,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P...X.B.X...O#',
      '#.#X#.#.#.#X#.#',
      '#X..E.X.X.E..X#',
      '#.#.#X#M#X#.#.#',
      '#..B.X...X.B..#',
      '#X#.#.#K#.#.#X#',
      '#..C.X...X.B..#',
      '#.#.#X#.#X#.#.#',
      '#X..E.X.X.E..X#',
      '#.#X#.#.#.#X#.#',
      '#A...X.B.X...A#',
      '###############'
    ],
    enemies: [
      { kind: 'hunter', x: 1, y: 3 },
      { kind: 'armored', x: 13, y: 3 },
      { kind: 'patrol', x: 2, y: 9 },
      { kind: 'hunter', x: 12, y: 9 },
      { kind: 'armored', x: 1, y: 11 },
      { kind: 'patrol', x: 13, y: 11 }
    ],
    powerUps: [
      { kind: 'speed', x: 6, y: 1 },
      { kind: 'range', x: 3, y: 5 },
      { kind: 'bomb', x: 11, y: 7 },
      { kind: 'ice', x: 7, y: 4 },
      { kind: 'heart', x: 7, y: 11 }
    ],
    events: [
      { type: 'movingWall', at: 45, message: '风车推动机关墙' },
      { type: 'hunterRush', at: 95, message: '仓库门外又冲进来一个追踪者' }
    ]
  },
  {
    id: 9,
    name: '月影礼堂',
    parSeconds: 185,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X..X.X..X.O#',
      '#.#.#.#X#.#.#.#',
      '#E..X..E..X..E#',
      '#X#.#X#.#X#.#X#',
      '#..B.X.M.X.B..#',
      '#.#X#.#K#.#X#.#',
      '#..B.X.C.X.B..#',
      '#X#.#X#.#X#.#X#',
      '#E..X..E..X..E#',
      '#.#.#.#X#.#.#.#',
      '#A.X..X.X..X.A#',
      '###############'
    ],
    enemies: [
      { kind: 'armored', x: 1, y: 3 },
      { kind: 'hunter', x: 7, y: 3 },
      { kind: 'armored', x: 13, y: 3 },
      { kind: 'hunter', x: 1, y: 9 },
      { kind: 'patrol', x: 7, y: 9 },
      { kind: 'armored', x: 13, y: 9 }
    ],
    powerUps: [
      { kind: 'range', x: 3, y: 5 },
      { kind: 'bomb', x: 11, y: 5 },
      { kind: 'ice', x: 7, y: 5 },
      { kind: 'bounce', x: 7, y: 7 },
      { kind: 'heart', x: 13, y: 11 }
    ],
    events: [{ type: 'hunterRush', at: 75, message: '礼堂回声召来追踪者' }]
  },
  {
    id: 10,
    name: '晨星终点',
    parSeconds: 200,
    width: 15,
    height: 13,
    tiles: [
      '###############',
      '#P.X.X.B.X.X.O#',
      '#.#X#.#.#.#X#.#',
      '#E..X..E..X..E#',
      '#X#.#X#M#X#.#X#',
      '#..B.X...X.B..#',
      '#.#X#.#K#.#X#.#',
      '#..B.X.C.X.B..#',
      '#X#.#X#.#X#.#X#',
      '#E..X..E..X..E#',
      '#.#X#.#.#.#X#.#',
      '#A.X.X.B.X.X.A#',
      '###############'
    ],
    enemies: [
      { kind: 'armored', x: 1, y: 3 },
      { kind: 'hunter', x: 6, y: 3 },
      { kind: 'armored', x: 13, y: 3 },
      { kind: 'hunter', x: 1, y: 9 },
      { kind: 'armored', x: 8, y: 9 },
      { kind: 'hunter', x: 13, y: 9 },
      { kind: 'patrol', x: 7, y: 11 }
    ],
    powerUps: [
      { kind: 'bomb', x: 6, y: 1 },
      { kind: 'range', x: 3, y: 5 },
      { kind: 'speed', x: 11, y: 5 },
      { kind: 'ice', x: 7, y: 4 },
      { kind: 'bounce', x: 7, y: 7 },
      { kind: 'heart', x: 6, y: 11 }
    ],
    events: [
      { type: 'movingWall', at: 40, message: '终点机关墙启动' },
      { type: 'hunterRush', at: 80, message: '晨星守卫开始追击' }
    ]
  }
];

export function createChallengeLevel(round = 1): LevelDefinition {
  const templates = levels.map((level) => level.tiles);
  const rows = ['###############'];
  for (let y = 1; y < 12; y += 1) {
    const source = templates[Math.floor(Math.random() * templates.length)];
    rows.push(cleanChallengeRow(source[y]));
  }
  rows.push('###############');

  const grid = rows.map((row) => row.split(''));
  setTile(grid, 1, 1, 'P');
  setTile(grid, 2, 1, '.');
  setTile(grid, 1, 2, '.');
  setTile(grid, 13, 1, 'O');

  const crateCells = collectCells(grid, (tile) => tile === 'X');
  const floorCells = collectCells(grid, (tile, x, y) => tile === '.' && Math.abs(x - 1) + Math.abs(y - 1) > 4);
  const take = <T>(items: T[]) => items.splice(Math.floor(Math.random() * items.length), 1)[0];
  const keyCell = take(crateCells) ?? { x: 7, y: 6 };
  setTile(grid, keyCell.x, keyCell.y, 'K');

  const powerKinds = ['bomb', 'range', 'speed', 'heart', 'ice', 'bounce'] as const;
  const powerUps = powerKinds.slice(0, Math.min(4 + Math.floor(round / 3), powerKinds.length)).map((kind) => {
    const cell = take(crateCells) ?? take(floorCells) ?? { x: 7, y: 7 };
    setTile(grid, cell.x, cell.y, 'X');
    return { kind, x: cell.x, y: cell.y };
  });

  const enemyKinds = ['patrol', 'hunter', 'armored', 'patrol', 'hunter', 'armored', 'hunter'] as const;
  const enemyCount = Math.min(3 + Math.floor(round / 2), enemyKinds.length);
  const enemies = enemyKinds.slice(0, enemyCount).map((kind) => {
    const cell = take(floorCells) ?? { x: 12, y: 10 };
    return { kind, x: cell.x, y: cell.y };
  });

  const events: LevelDefinition['events'] = [
    { type: 'hunterRush', at: Math.max(45, 80 - round * 3), message: '挑战警报：新的追踪者入场' }
  ];
  if (round % 2 === 0) events.unshift({ type: 'movingWall', at: 50, message: '挑战地图机关墙移动' });

  return {
    id: round,
    name: `随机挑战 ${round}`,
    parSeconds: 120 + round * 8,
    width: 15,
    height: 13,
    tiles: grid.map((row) => row.join('')),
    enemies,
    powerUps,
    events
  };
}

function cleanChallengeRow(row: string) {
  return row.replace(/[PBCKO]/g, 'X').replace(/[EAM]/g, '.');
}

function setTile(grid: string[][], x: number, y: number, tile: string) {
  grid[y][x] = tile;
}

function collectCells(grid: string[][], predicate: (tile: string, x: number, y: number) => boolean) {
  const cells: { x: number; y: number }[] = [];
  grid.forEach((row, y) => row.forEach((tile, x) => {
    if (predicate(tile, x, y)) cells.push({ x, y });
  }));
  return cells;
}
