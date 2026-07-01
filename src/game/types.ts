import type Phaser from 'phaser';

export type TileCode = '#' | 'X' | 'B' | 'C' | '.' | 'P' | 'E' | 'A' | 'K' | 'O' | 'M';
export type EnemyKind = 'patrol' | 'hunter' | 'armored';
export type PowerUpKind = 'bomb' | 'range' | 'speed' | 'heart' | 'ice' | 'bounce';
export type BombKind = 'normal' | 'ice' | 'bounce';

export interface GridPoint {
  x: number;
  y: number;
}

export interface EnemyDefinition extends GridPoint {
  kind: EnemyKind;
}

export interface PowerUpDefinition extends GridPoint {
  kind: PowerUpKind;
}

export interface LevelEventDefinition {
  type: 'hunterRush' | 'gateTimer' | 'movingWall';
  at: number;
  message: string;
}

export interface LevelDefinition {
  id: number;
  name: string;
  parSeconds: number;
  width: number;
  height: number;
  tiles: string[];
  enemies: EnemyDefinition[];
  powerUps: PowerUpDefinition[];
  events: LevelEventDefinition[];
}

export interface PlayerState {
  grid: GridPoint;
  lives: number;
  speed: number;
  maxBombs: number;
  availableBombs: number;
  range: number;
  nextBombKind: BombKind;
  hurtCooldown: number;
}

export interface PlayerCarryState {
  lives: number;
  speed: number;
  maxBombs: number;
  range: number;
  nextBombKind: BombKind;
}

export interface BombState {
  id: number;
  grid: GridPoint;
  range: number;
  kind: BombKind;
  placedAt: number;
  explodesAt: number;
  sprite: Phaser.GameObjects.Container;
  warning: Phaser.GameObjects.GameObject[];
  exploding: boolean;
}

export interface EnemyState {
  id: number;
  kind: EnemyKind;
  grid: GridPoint;
  hp: number;
  speed: number;
  sprite: Phaser.GameObjects.Container;
  direction: GridPoint;
  decisionAt: number;
  frozenUntil: number;
}

export interface PowerUpState {
  kind: PowerUpKind;
  grid: GridPoint;
  sprite: Phaser.GameObjects.Container;
}

export interface ResultPayload {
  won: boolean;
  levelIndex: number;
  levelName: string;
  seconds: number;
  defeated: number;
  damageTaken: number;
  stars: number;
  completedAll: boolean;
  carryState?: PlayerCarryState;
  challenge?: boolean;
  challengeRound?: number;
}
