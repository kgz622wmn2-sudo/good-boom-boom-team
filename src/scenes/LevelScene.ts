import Phaser from 'phaser';
import { createChallengeLevel, levels } from '../data/levels';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type {
  BombKind,
  BombState,
  EnemyKind,
  EnemyState,
  GridPoint,
  LevelDefinition,
  PlayerCarryState,
  PlayerState,
  PowerUpKind,
  PowerUpState
} from '../game/types';

const TILE = 48;
const BOARD_X = 152;
const BOARD_Y = 112;
const BOMB_TIME = 2200;
const DIRECTIONS: GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

type Cell = 'floor' | 'wall' | 'crate' | 'moving';

export class LevelScene extends Phaser.Scene {
  private levelIndex = 0;
  private level!: LevelDefinition;
  private cells: Cell[][] = [];
  private floorLayer!: Phaser.GameObjects.Container;
  private objectLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private player!: PlayerState;
  private playerSprite!: Phaser.GameObjects.Container;
  private playerMoving = false;
  private bombs: BombState[] = [];
  private enemies: EnemyState[] = [];
  private powerUps: PowerUpState[] = [];
  private exitGrid: GridPoint = { x: 13, y: 1 };
  private exitSprite: Phaser.GameObjects.Container | null = null;
  private keyGrid: GridPoint | null = null;
  private keySprite: Phaser.GameObjects.Container | null = null;
  private keyRevealed = false;
  private exitRevealed = false;
  private hasKey = false;
  private startedAt = 0;
  private defeated = 0;
  private damageTaken = 0;
  private bombSeq = 0;
  private enemySeq = 0;
  private pressedKeys = new Set<string>();
  private virtualKeys = new Set<string>();
  private spaceQueued = false;
  private keyDownHandler?: (event: KeyboardEvent) => void;
  private keyUpHandler?: (event: KeyboardEvent) => void;
  private bgRect!: Phaser.GameObjects.Rectangle;
  private topBar!: Phaser.GameObjects.Rectangle;
  private bottomBar!: Phaser.GameObjects.Rectangle;
  private hud!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private pausedPanel!: Phaser.GameObjects.Container;
  private isPaused = false;
  private firedEvents = new Set<number>();
  private entryCarryState?: PlayerCarryState;
  private challenge = false;
  private challengeRound = 1;

  constructor() {
    super('LevelScene');
  }

  init(data: { levelIndex?: number; carryState?: PlayerCarryState; challenge?: boolean; challengeRound?: number }) {
    this.levelIndex = data.levelIndex ?? 0;
    this.entryCarryState = data.carryState ? { ...data.carryState } : undefined;
    this.challenge = data.challenge ?? false;
    this.challengeRound = data.challengeRound ?? 1;
  }

  create() {
    this.level = this.challenge ? createChallengeLevel(this.challengeRound) : levels[this.levelIndex];
    this.startedAt = this.time.now;
    this.defeated = 0;
    this.damageTaken = 0;
    this.hasKey = false;
    this.keyRevealed = false;
    this.exitRevealed = false;
    this.keySprite = null;
    this.exitSprite = null;
    this.playerMoving = false;
    this.isPaused = false;
    this.bombs = [];
    this.enemies = [];
    this.powerUps = [];
    this.firedEvents.clear();

    this.bgRect = this.add.rectangle(0, 0, this.viewWidth(), this.viewHeight(), 0x203843).setOrigin(0);
    this.topBar = this.add.rectangle(0, 0, this.viewWidth(), 92, 0x18292f).setOrigin(0);
    this.bottomBar = this.add.rectangle(0, this.viewHeight() - 78, this.viewWidth(), 78, 0x18292f).setOrigin(0);

    this.floorLayer = this.add.container(0, 0);
    this.objectLayer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0);

    this.parseLevel();
    this.drawBoard();
    this.spawnPowerUps();
    this.spawnEnemies();
    this.playerSprite = this.makePlayer(this.player.grid);
    this.objectLayer.add(this.playerSprite);
    this.layoutBoard();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
    this.installKeyboardControls();

    this.hud = this.add.text(24, 18, '', {
      fontFamily: GAME_FONT,
      fontSize: '19px',
      color: '#f9f5df',
      fontStyle: '700',
      lineSpacing: 7
    });
    this.message = this.add.text(this.viewWidth() / 2, this.viewHeight() - 60, '', {
      fontFamily: GAME_FONT,
      fontSize: '22px',
      color: '#fff2bf',
      fontStyle: '800',
      stroke: '#26383b',
      strokeThickness: 5
    }).setOrigin(0.5, 0);
    this.pausedPanel = this.makePausePanel();
    this.pausedPanel.setVisible(false);
    this.setMobileControlsVisible(true);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutResponsive, this);
    this.layoutResponsive();
    this.showMessage(`第 ${this.level.id} 关：${this.level.name}`);
  }

  update(_time: number, delta: number) {
    if (this.isPaused) return;
    this.updateHud();
    this.handleEvents();
    this.handlePlayer();
    this.updateBombWarnings();
    this.updateBombs();
    this.updateEnemies(delta);
    this.checkPowerUps();
    this.checkKeyPickup();
    this.checkEnemyContact();
    this.checkExit();
  }

  private parseLevel() {
    this.cells = [];
    for (let y = 0; y < this.level.height; y += 1) {
      const row: Cell[] = [];
      for (let x = 0; x < this.level.width; x += 1) {
        const code = this.level.tiles[y][x];
        if (code === '#') row.push('wall');
        else if (code === 'X' || code === 'B' || code === 'C' || code === 'K' || code === 'O') row.push('crate');
        else if (code === 'M') row.push('moving');
        else row.push('floor');

        if (code === 'P') {
          this.player = {
            grid: { x, y },
            lives: this.entryCarryState?.lives ?? 3,
            speed: this.entryCarryState?.speed ?? 148,
            maxBombs: this.entryCarryState?.maxBombs ?? 1,
            availableBombs: this.entryCarryState?.maxBombs ?? 1,
            range: this.entryCarryState?.range ?? 2,
            nextBombKind: this.entryCarryState?.nextBombKind ?? 'normal',
            hurtCooldown: 0
          };
        }
        if (code === 'O') this.exitGrid = { x, y };
        if (code === 'K') this.keyGrid = { x, y };
      }
      this.cells.push(row);
    }
  }

  private drawBoard() {
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const p = this.world({ x, y });
        const floor = this.add.rectangle(p.x, p.y, TILE - 3, TILE - 3, (x + y) % 2 ? 0x88c49a : 0x93d2a0)
          .setStrokeStyle(1, 0x5a8f72)
          .setDepth(y);
        const shine = this.add.rectangle(p.x - 4, p.y - 8, TILE - 12, 7, 0xffffff, 0.16);
        this.floorLayer.add([floor, shine]);
        const cell = this.cells[y][x];
        if (cell === 'wall') this.objectLayer.add(this.makeWall({ x, y }, 0x6d7f8d, 0x405867));
        if (cell === 'crate') this.objectLayer.add(this.makeCrate({ x, y }));
        if (cell === 'moving') this.objectLayer.add(this.makeWall({ x, y }, 0x9b75d9, 0x6149a6));
      }
    }
  }

  private spawnPowerUps() {
    this.level.powerUps.forEach((p) => {
      const sprite = this.makePowerUp(p.kind, p);
      sprite.setVisible(false);
      this.powerUps.push({ kind: p.kind, grid: { x: p.x, y: p.y }, sprite });
      this.objectLayer.add(sprite);
    });
  }

  private spawnEnemies() {
    this.level.enemies.forEach((enemy) => this.addEnemy(enemy.kind, { x: enemy.x, y: enemy.y }));
  }

  private addEnemy(kind: EnemyKind, grid: GridPoint) {
    const hp = kind === 'armored' ? 2 : 1;
    const speed = kind === 'hunter' ? 118 : kind === 'armored' ? 78 : 92;
    const sprite = this.makeEnemy(kind, grid);
    this.enemies.push({
      id: ++this.enemySeq,
      kind,
      grid: { ...grid },
      hp,
      speed,
      sprite,
      direction: Phaser.Utils.Array.GetRandom(DIRECTIONS),
      decisionAt: 0,
      frozenUntil: 0
    });
    this.objectLayer.add(sprite);
  }

  private handlePlayer() {
    if (this.spaceQueued) {
      this.spaceQueued = false;
      this.placeBomb();
    }
    if (this.playerMoving) return;

    const dir =
      this.isPressed('ArrowLeft', 'KeyA') ? { x: -1, y: 0 } :
        this.isPressed('ArrowRight', 'KeyD') ? { x: 1, y: 0 } :
          this.isPressed('ArrowUp', 'KeyW') ? { x: 0, y: -1 } :
            this.isPressed('ArrowDown', 'KeyS') ? { x: 0, y: 1 } : null;

    if (!dir) return;
    const next = { x: this.player.grid.x + dir.x, y: this.player.grid.y + dir.y };
    if (!this.canEnter(next, true)) return;
    this.player.grid = next;
    this.playerMoving = true;
    this.tweens.add({
      targets: this.playerSprite,
      ...this.world(next),
      duration: 1000 * TILE / this.player.speed,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.playerMoving = false;
        this.playerSprite.setDepth(next.y + 20);
      }
    });
  }

  private placeBomb() {
    if (this.player.availableBombs <= 0) return;
    if (this.bombs.some((bomb) => this.same(bomb.grid, this.player.grid))) return;

    const kind = this.player.nextBombKind;
    const bomb: BombState = {
      id: ++this.bombSeq,
      grid: { ...this.player.grid },
      range: this.player.range,
      kind,
      placedAt: this.time.now,
      explodesAt: this.time.now + BOMB_TIME,
      sprite: this.makeBomb(kind, this.player.grid),
      warning: [],
      exploding: false
    };
    this.player.availableBombs -= 1;
    if (kind !== 'normal') this.player.nextBombKind = 'normal';
    this.bombs.push(bomb);
    this.objectLayer.add(bomb.sprite);
    this.tweens.add({ targets: bomb.sprite, scaleX: 1.1, scaleY: 0.92, yoyo: true, repeat: -1, duration: 460 });
  }

  private updateBombWarnings() {
    this.bombs.forEach((bomb) => {
      const timeLeft = bomb.explodesAt - this.time.now;
      if (timeLeft > 850 || bomb.warning.length > 0) return;
      bomb.warning = this.computeBlast(bomb).map((cell) => {
        const p = this.world(cell);
        const rect = this.add.rectangle(p.x, p.y, TILE - 6, TILE - 6, bomb.kind === 'ice' ? 0x8de8ff : 0xff6f59, 0.38);
        rect.setDepth(5);
        this.fxLayer.add(rect);
        this.tweens.add({ targets: rect, alpha: 0.12, yoyo: true, repeat: -1, duration: 160 });
        return rect;
      });
    });
  }

  private updateBombs() {
    [...this.bombs].forEach((bomb) => {
      if (!bomb.exploding && this.time.now >= bomb.explodesAt) this.explode(bomb);
    });
  }

  private explode(bomb: BombState) {
    if (bomb.exploding) return;
    bomb.exploding = true;
    const blast = this.computeBlast(bomb);
    bomb.warning.forEach((w) => w.destroy());
    bomb.sprite.destroy();
    this.bombs = this.bombs.filter((b) => b.id !== bomb.id);
    this.player.availableBombs = Math.min(this.player.maxBombs, this.player.availableBombs + 1);
    this.cameras.main.shake(130, 0.006);

    blast.forEach((cell, index) => {
      const p = this.world(cell);
      const color = bomb.kind === 'ice' ? 0x8de8ff : bomb.kind === 'bounce' ? 0xffd166 : 0xff735c;
      const flame = this.add.circle(p.x, p.y, 8, color, 0.9).setDepth(40);
      const glow = this.add.rectangle(p.x, p.y, TILE - 4, TILE - 4, color, 0.28).setDepth(35);
      this.fxLayer.add([flame, glow]);
      this.tweens.add({ targets: flame, scale: 3.6, alpha: 0, duration: 360, delay: index * 12, onComplete: () => flame.destroy() });
      this.tweens.add({ targets: glow, alpha: 0, duration: 300, delay: 70, onComplete: () => glow.destroy() });

      if (this.cells[cell.y][cell.x] === 'crate') this.breakCrate(cell);
      this.bombs.filter((other) => this.same(other.grid, cell)).forEach((other) => {
        other.explodesAt = Math.min(other.explodesAt, this.time.now + 70);
      });
      this.hitEnemies(cell, bomb.kind);
      if (this.same(this.player.grid, cell)) this.hurtPlayer();
    });
  }

  private computeBlast(bomb: BombState) {
    const cells: GridPoint[] = [{ ...bomb.grid }];
    for (const dir of DIRECTIONS) {
      for (let step = 1; step <= bomb.range; step += 1) {
        const cell = { x: bomb.grid.x + dir.x * step, y: bomb.grid.y + dir.y * step };
        if (!this.inBounds(cell)) break;
        const current = this.cells[cell.y][cell.x];
        if (current === 'wall' || current === 'moving') {
          if (bomb.kind === 'bounce' && step < bomb.range) {
            const side = dir.x !== 0 ? { x: 0, y: Phaser.Math.RND.pick([-1, 1]) } : { x: Phaser.Math.RND.pick([-1, 1]), y: 0 };
            const bent = { x: cell.x + side.x, y: cell.y + side.y };
            if (this.inBounds(bent) && this.cells[bent.y][bent.x] !== 'wall') cells.push(bent);
          }
          break;
        }
        cells.push(cell);
        if (current === 'crate') break;
      }
    }
    return cells;
  }

  private breakCrate(cell: GridPoint) {
    this.cells[cell.y][cell.x] = 'floor';
    this.objectLayer.each((child: Phaser.GameObjects.GameObject) => {
      const obj = child as Phaser.GameObjects.Container;
      if (obj.getData('crate') && this.same(obj.getData('grid'), cell)) {
        this.tweens.add({ targets: obj, alpha: 0, scale: 1.4, duration: 220, onComplete: () => obj.destroy() });
      }
    });
    const hidden = this.powerUps.find((p) => this.same(p.grid, cell));
    if (hidden) {
      hidden.sprite.setVisible(true);
      this.tweens.add({ targets: hidden.sprite, y: hidden.sprite.y - 8, yoyo: true, repeat: -1, duration: 520 });
    }
    if (this.keyGrid && this.same(this.keyGrid, cell)) {
      this.keyRevealed = true;
      this.keySprite = this.makeKey(this.keyGrid);
      this.objectLayer.add(this.keySprite);
      this.tweens.add({ targets: this.keySprite, y: this.keySprite.y - 8, yoyo: true, repeat: -1, duration: 640 });
      this.showMessage('星钥匙出现了');
    }
    if (this.same(this.exitGrid, cell)) {
      this.exitRevealed = true;
      this.exitSprite = this.makeExit();
      this.objectLayer.add(this.exitSprite);
      this.showMessage('隐藏出口出现了');
    }
  }

  private hitEnemies(cell: GridPoint, kind: BombKind) {
    [...this.enemies].forEach((enemy) => {
      if (!this.same(enemy.grid, cell)) return;
      if (kind === 'ice') enemy.frozenUntil = this.time.now + 2200;
      enemy.hp -= 1;
      this.tintContainer(enemy.sprite, kind === 'ice' ? 0x9eefff : 0xffc2a8);
      this.time.delayedCall(130, () => this.clearTintContainer(enemy.sprite));
      if (enemy.hp <= 0) {
        this.defeated += 1;
        this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
        this.tweens.add({ targets: enemy.sprite, alpha: 0, scale: 1.5, angle: 25, duration: 260, onComplete: () => enemy.sprite.destroy() });
      }
    });
  }

  private updateEnemies(delta: number) {
    this.enemies.forEach((enemy) => {
      if (this.time.now < enemy.frozenUntil || enemy.sprite.getData('moving')) return;
      if (this.time.now >= enemy.decisionAt) {
        enemy.direction = this.pickEnemyDirection(enemy);
        enemy.decisionAt = this.time.now + Phaser.Math.Between(350, 900);
      }
      const next = { x: enemy.grid.x + enemy.direction.x, y: enemy.grid.y + enemy.direction.y };
      if (!this.canEnter(next, false)) {
        enemy.decisionAt = 0;
        return;
      }
      enemy.grid = next;
      enemy.sprite.setData('moving', true);
      this.tweens.add({
        targets: enemy.sprite,
        ...this.world(next),
        duration: 1000 * TILE / enemy.speed,
        ease: 'Linear',
        onComplete: () => {
          enemy.sprite.setData('moving', false);
          enemy.sprite.setDepth(next.y + 18);
        }
      });
      if (delta > 0) enemy.sprite.rotation = Math.sin(this.time.now / 130) * 0.03;
    });
  }

  private pickEnemyDirection(enemy: EnemyState) {
    if (enemy.kind === 'hunter') {
      const dx = this.player.grid.x - enemy.grid.x;
      const dy = this.player.grid.y - enemy.grid.y;
      const primary = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      if (this.canEnter({ x: enemy.grid.x + primary.x, y: enemy.grid.y + primary.y }, false)) return primary;
    }
    const options = Phaser.Utils.Array.Shuffle(DIRECTIONS.filter((d) => this.canEnter({ x: enemy.grid.x + d.x, y: enemy.grid.y + d.y }, false)));
    return options[0] ?? { x: 0, y: 0 };
  }

  private checkPowerUps() {
    [...this.powerUps].forEach((power) => {
      if (!power.sprite.visible || !this.same(power.grid, this.player.grid)) return;
      this.applyPowerUp(power.kind);
      this.powerUps = this.powerUps.filter((p) => p !== power);
      power.sprite.destroy();
    });
  }

  private checkKeyPickup() {
    if (!this.keyGrid || !this.keyRevealed || this.hasKey || !this.same(this.player.grid, this.keyGrid)) return;
    this.hasKey = true;
    this.keySprite?.destroy();
    this.keySprite = null;
    this.showMessage('拿到星钥匙，出口正在解锁');
  }

  private applyPowerUp(kind: PowerUpKind) {
    const labels: Record<PowerUpKind, string> = {
      bomb: '炸弹容量 +1',
      range: '火力范围 +1',
      speed: '移动速度提升',
      heart: '生命 +1',
      ice: '下一枚变为冰冻炸弹',
      bounce: '下一枚变为弹跳炸弹'
    };
    if (kind === 'bomb') {
      this.player.maxBombs += 1;
      this.player.availableBombs += 1;
    }
    if (kind === 'range') this.player.range += 1;
    if (kind === 'speed') this.player.speed += 24;
    if (kind === 'heart') this.player.lives = Math.min(5, this.player.lives + 1);
    if (kind === 'ice' || kind === 'bounce') this.player.nextBombKind = kind;
    this.showMessage(labels[kind]);
  }

  private checkEnemyContact() {
    if (this.enemies.some((enemy) => this.same(enemy.grid, this.player.grid))) this.hurtPlayer();
  }

  private hurtPlayer() {
    if (this.time.now < this.player.hurtCooldown) return;
    this.player.hurtCooldown = this.time.now + 1300;
    this.player.lives -= 1;
    this.damageTaken += 1;
    this.playerSprite.setAlpha(0.45);
    this.cameras.main.shake(180, 0.01);
    this.time.delayedCall(260, () => this.playerSprite.setAlpha(1));
    if (this.player.lives <= 0) this.finish(false);
  }

  private checkExit() {
    if (!this.same(this.player.grid, this.exitGrid)) return;
    if (!this.exitRevealed) return;
    if (this.exitUnlocked()) this.finish(true);
    else this.showMessage(this.hasKey ? '清掉敌人后出口才会稳定' : '找到星钥匙才能打开出口');
  }

  private exitUnlocked() {
    return this.hasKey && this.enemies.length === 0;
  }

  private handleEvents() {
    const elapsed = Math.floor((this.time.now - this.startedAt) / 1000);
    this.level.events.forEach((event, index) => {
      if (this.firedEvents.has(index) || elapsed < event.at) return;
      this.firedEvents.add(index);
      this.showMessage(event.message);
      if (event.type === 'hunterRush') this.addEnemy('hunter', { x: 13, y: 1 });
      if (event.type === 'movingWall') this.shiftMovingWalls();
    });
  }

  private shutdownScene() {
    this.playerMoving = false;
    this.isPaused = false;
    this.pressedKeys.clear();
    this.virtualKeys.clear();
    this.spaceQueued = false;
    this.removeKeyboardControls();
    this.setMobileControlsVisible(false);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutResponsive, this);
    this.input.keyboard?.resetKeys();
    this.tweens.killAll();
  }

  private shiftMovingWalls() {
    for (let y = 1; y < this.level.height - 1; y += 1) {
      for (let x = 1; x < this.level.width - 1; x += 1) {
        if (this.cells[y][x] === 'moving') {
          this.cells[y][x] = 'floor';
          const next = { x: Math.min(this.level.width - 2, x + 1), y };
          if (this.cells[next.y][next.x] === 'floor' && !this.same(next, this.player.grid)) this.cells[next.y][next.x] = 'moving';
          this.drawBoard();
          return;
        }
      }
    }
  }

  private finish(won: boolean) {
    const seconds = Math.floor((this.time.now - this.startedAt) / 1000);
    const stars = won ? Math.max(1, 3 - (seconds > this.level.parSeconds ? 1 : 0) - (this.damageTaken > 0 ? 1 : 0)) : 0;
    if (won && !this.challenge) {
      const key = `spark-bomber-level-${this.levelIndex}`;
      localStorage.setItem(key, String(Math.max(Number(localStorage.getItem(key) ?? 0), stars)));
    }
    this.scene.start('ResultScene', {
      won,
      levelIndex: this.levelIndex,
      levelName: this.level.name,
      seconds,
      defeated: this.defeated,
      damageTaken: this.damageTaken,
      stars,
      completedAll: !this.challenge && won && this.levelIndex >= levels.length - 1,
      carryState: won ? this.makeCarryState() : this.entryCarryState,
      challenge: this.challenge,
      challengeRound: this.challengeRound
    });
  }

  private updateHud() {
    const seconds = Math.floor((this.time.now - this.startedAt) / 1000);
    const bombKind = this.player.nextBombKind === 'normal' ? '普通' : this.player.nextBombKind === 'ice' ? '冰冻' : '弹跳';
    const levelLabel = this.challenge ? `挑战 ${this.challengeRound}` : `关卡 ${this.level.id}/${levels.length}`;
    this.hud.setText([
      `${levelLabel}  ${this.level.name}`,
      `生命 ${'♥'.repeat(this.player.lives)}   炸弹 ${this.player.availableBombs}/${this.player.maxBombs}   火力 ${this.player.range}   下一枚 ${bombKind}`,
      `星钥匙 ${this.hasKey ? '已取得' : '未取得'}   敌人 ${this.enemies.length}   时间 ${seconds}s`
    ]);
  }

  private showMessage(text: string) {
    this.message.setText(text);
    this.message.setAlpha(1);
    this.tweens.killTweensOf(this.message);
    this.tweens.add({ targets: this.message, alpha: 0, duration: 700, delay: 1800 });
  }

  private tintContainer(container: Phaser.GameObjects.Container, color: number) {
    container.each((child: Phaser.GameObjects.GameObject) => {
      const tintable = child as Phaser.GameObjects.GameObject & { setTint?: (color: number) => void };
      tintable.setTint?.(color);
    });
  }

  private clearTintContainer(container: Phaser.GameObjects.Container) {
    container.each((child: Phaser.GameObjects.GameObject) => {
      const tintable = child as Phaser.GameObjects.GameObject & { clearTint?: () => void };
      tintable.clearTint?.();
    });
  }

  private installKeyboardControls() {
    this.removeKeyboardControls();
    this.pressedKeys.clear();
    this.spaceQueued = false;

    this.keyDownHandler = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'Space' && !this.pressedKeys.has('Space')) this.spaceQueued = true;
      if (event.code === 'Escape' && !this.pressedKeys.has('Escape')) this.togglePause();
      if (event.code === 'KeyR' && !this.pressedKeys.has('KeyR')) this.restartLevel();
      this.pressedKeys.add(event.code);
    };

    this.keyUpHandler = (event: KeyboardEvent) => {
      this.pressedKeys.delete(event.code);
    };

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  private removeKeyboardControls() {
    if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
    if (this.keyUpHandler) window.removeEventListener('keyup', this.keyUpHandler);
    this.keyDownHandler = undefined;
    this.keyUpHandler = undefined;
  }

  private isPressed(...codes: string[]) {
    return codes.some((code) => this.pressedKeys.has(code) || this.virtualKeys.has(code));
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    this.pausedPanel.setVisible(this.isPaused);
  }

  private restartLevel() {
    this.scene.restart({
      levelIndex: this.levelIndex,
      carryState: this.entryCarryState,
      challenge: this.challenge,
      challengeRound: this.challengeRound
    });
  }

  private makeCarryState(): PlayerCarryState {
    return {
      lives: this.player.lives,
      speed: this.player.speed,
      maxBombs: this.player.maxBombs,
      range: this.player.range,
      nextBombKind: this.player.nextBombKind
    };
  }

  private layoutResponsive() {
    const width = this.viewWidth();
    const height = this.viewHeight();
    this.bgRect.setSize(width, height);
    this.topBar.setSize(width, 92);
    this.bottomBar.setPosition(0, Math.max(0, height - 96));
    this.bottomBar.setSize(width, 96);
    this.message.setPosition(width / 2, Math.max(96, height - 74));
    this.pausedPanel.setPosition(width / 2, height / 2);
    this.layoutBoard();
  }

  private layoutBoard() {
    if (!this.level || !this.floorLayer || !this.objectLayer || !this.fxLayer) return;
    const width = this.viewWidth();
    const height = this.viewHeight();
    const boardWidth = this.level.width * TILE;
    const boardHeight = this.level.height * TILE;
    const boardMinX = BOARD_X - TILE / 2;
    const boardMinY = BOARD_Y - TILE / 2;

    if (width >= GAME_WIDTH * 0.9 && height >= GAME_HEIGHT * 0.9) {
      [this.floorLayer, this.objectLayer, this.fxLayer].forEach((layer) => {
        layer.setPosition(0, 0);
        layer.setScale(1);
      });
      return;
    }

    const compact = width < 620 || height < 620;
    const topSpace = compact ? Math.max(92, height * 0.14) : 100;
    const bottomSpace = compact ? Math.min(260, Math.max(178, height * 0.32)) : 128;
    const availableWidth = Math.max(260, width - 18);
    const availableHeight = Math.max(220, height - topSpace - bottomSpace);
    const boardScale = Phaser.Math.Clamp(Math.min(availableWidth / boardWidth, availableHeight / boardHeight), 0.42, 1);
    const boardX = (width - boardWidth * boardScale) / 2;
    const boardY = topSpace + Math.max(0, (availableHeight - boardHeight * boardScale) / 2);
    const layerX = boardX - boardMinX * boardScale;
    const layerY = boardY - boardMinY * boardScale;

    [this.floorLayer, this.objectLayer, this.fxLayer].forEach((layer) => {
      layer.setPosition(layerX, layerY);
      layer.setScale(boardScale);
    });
  }

  private viewWidth() {
    return this.scale.width || GAME_WIDTH;
  }

  private viewHeight() {
    return this.scale.height || GAME_HEIGHT;
  }

  private makePausePanel() {
    const panel = this.add.container(this.viewWidth() / 2, this.viewHeight() / 2);
    const bg = this.add.rectangle(0, 0, 430, 230, 0x203843, 0.95).setStrokeStyle(4, 0xffd166);
    const title = this.add.text(0, -58, '暂停', { fontFamily: GAME_FONT, fontSize: '42px', color: '#fff2bf', fontStyle: '900' }).setOrigin(0.5);
    const hint = this.add.text(0, 32, 'Esc / 暂停键继续    R / 重开键重来', { fontFamily: GAME_FONT, fontSize: '22px', color: '#d6f6e8' }).setOrigin(0.5);
    panel.add([bg, title, hint]);
    panel.setDepth(1000);
    return panel;
  }

  private setMobileControlsVisible(visible: boolean) {
    window.dispatchEvent(new CustomEvent('spark-bomber-controls', { detail: { visible } }));
  }

  private canEnter(cell: GridPoint, player: boolean) {
    if (!this.inBounds(cell)) return false;
    const current = this.cells[cell.y][cell.x];
    if (current === 'wall' || current === 'crate' || current === 'moving') return false;
    if (this.bombs.some((bomb) => this.same(bomb.grid, cell))) return false;
    if (!player && this.enemies.some((enemy) => this.same(enemy.grid, cell))) return false;
    return true;
  }

  private inBounds(cell: GridPoint) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < this.level.width && cell.y < this.level.height;
  }

  private same(a: GridPoint, b: GridPoint) {
    return a.x === b.x && a.y === b.y;
  }

  private world(cell: GridPoint) {
    return { x: BOARD_X + cell.x * TILE, y: BOARD_Y + cell.y * TILE };
  }

  private makeWall(cell: GridPoint, topColor: number, sideColor: number) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const side = this.add.rectangle(0, 8, TILE - 4, TILE - 8, sideColor);
    const top = this.add.rectangle(0, -4, TILE - 6, TILE - 18, topColor).setStrokeStyle(2, 0xffffff, 0.18);
    const cap = this.add.rectangle(-5, -13, TILE - 16, 6, 0xffffff, 0.18);
    c.add([side, top, cap]);
    c.setDepth(cell.y + 12);
    return c;
  }

  private makeCrate(cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const shadow = this.add.ellipse(2, 16, TILE - 8, 16, 0x273036, 0.28);
    const box = this.add.rectangle(0, 0, TILE - 8, TILE - 10, 0xc88d52).setStrokeStyle(3, 0x8a5a33);
    const band1 = this.add.rectangle(0, 0, 7, TILE - 13, 0xf4c27a, 0.88);
    const band2 = this.add.rectangle(0, 0, TILE - 12, 7, 0x9e6840, 0.6);
    c.add([shadow, box, band1, band2]);
    c.setData('crate', true);
    c.setData('grid', { ...cell });
    c.setDepth(cell.y + 14);
    return c;
  }

  private makePlayer(cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const shadow = this.add.ellipse(0, 18, 36, 15, 0x172329, 0.36);
    const body = this.add.circle(0, 0, 18, 0x4fd1b3).setStrokeStyle(4, 0x1f6f68);
    const face = this.add.circle(0, -8, 13, 0xffdfb0).setStrokeStyle(3, 0x8c6045);
    const visor = this.add.rectangle(0, -11, 19, 6, 0x3a5265, 0.85);
    const spark = this.add.star(15, -18, 5, 4, 9, 0xffd166);
    c.add([shadow, body, face, visor, spark]);
    c.setDepth(cell.y + 20);
    this.tweens.add({ targets: spark, angle: 360, duration: 1600, repeat: -1 });
    return c;
  }

  private makeEnemy(kind: EnemyKind, cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const color = kind === 'patrol' ? 0xf05d7b : kind === 'hunter' ? 0xff9f1c : 0x7a6ff0;
    const shadow = this.add.ellipse(0, 17, 34, 14, 0x172329, 0.35);
    const body = this.add.rectangle(0, 0, 34, 30, color).setStrokeStyle(3, 0x422b3f);
    const eye1 = this.add.circle(-7, -5, 4, 0xffffff);
    const eye2 = this.add.circle(7, -5, 4, 0xffffff);
    const core = this.add.circle(0, 7, kind === 'armored' ? 8 : 5, 0x26343f);
    c.add([shadow, body, eye1, eye2, core]);
    c.setDepth(cell.y + 18);
    this.tweens.add({ targets: body, scaleY: 0.9, yoyo: true, repeat: -1, duration: 520 });
    return c;
  }

  private makeBomb(kind: BombKind, cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const color = kind === 'ice' ? 0x80e1ff : kind === 'bounce' ? 0xffd166 : 0x303844;
    const shadow = this.add.ellipse(0, 15, 34, 12, 0x172329, 0.32);
    const ball = this.add.circle(0, 0, 16, color).setStrokeStyle(4, 0x1d252e);
    const shine = this.add.circle(-6, -7, 5, 0xffffff, 0.42);
    const fuse = this.add.rectangle(12, -16, 7, 14, 0xff785a).setAngle(35);
    c.add([shadow, ball, shine, fuse]);
    c.setDepth(cell.y + 16);
    return c;
  }

  private makePowerUp(kind: PowerUpKind, cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const colors: Record<PowerUpKind, number> = {
      bomb: 0x303844,
      range: 0xff6f59,
      speed: 0x45b7ff,
      heart: 0xff5f8f,
      ice: 0x80e1ff,
      bounce: 0xffd166
    };
    const bg = this.add.circle(0, 0, 16, colors[kind]).setStrokeStyle(3, 0xffffff, 0.75);
    const text = this.add.text(0, 0, kind[0].toUpperCase(), { fontFamily: GAME_FONT, fontSize: '17px', color: '#203843', fontStyle: '900' }).setOrigin(0.5);
    c.add([bg, text]);
    c.setDepth(cell.y + 13);
    return c;
  }

  private makeExit() {
    const p = this.world(this.exitGrid);
    const c = this.add.container(p.x, p.y);
    const pad = this.add.rectangle(0, 0, TILE - 10, TILE - 10, 0x315a64).setStrokeStyle(3, 0xffd166);
    const glow = this.add.circle(0, 0, 14, 0xffd166, 0.45);
    c.add([pad, glow]);
    c.setDepth(this.exitGrid.y + 8);
    this.tweens.add({ targets: glow, alpha: 0.08, scale: 1.5, yoyo: true, repeat: -1, duration: 700 });
    return c;
  }

  private makeKey(cell: GridPoint) {
    const p = this.world(cell);
    const c = this.add.container(p.x, p.y);
    const ring = this.add.circle(-6, -2, 8, 0xffd166).setStrokeStyle(3, 0x8a6026);
    const stem = this.add.rectangle(8, -2, 25, 6, 0xffd166);
    const tooth = this.add.rectangle(17, 5, 6, 10, 0xffd166);
    c.add([ring, stem, tooth]);
    c.setDepth(cell.y + 15);
    this.tweens.add({ targets: c, y: p.y - 8, yoyo: true, repeat: -1, duration: 640 });
    return c;
  }
}
