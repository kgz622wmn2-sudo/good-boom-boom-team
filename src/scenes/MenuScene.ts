import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setScroll(0, 0);
    const width = this.scale.width || GAME_WIDTH;
    const height = this.scale.height || GAME_HEIGHT;
    this.add.rectangle(0, 0, width, height, 0x203843).setOrigin(0);

    for (let i = 0; i < 22; i += 1) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const c = this.add.circle(x, y, Phaser.Math.Between(2, 6), 0xffd66b, 0.35);
      this.tweens.add({ targets: c, y: y - 18, alpha: 0.05, duration: 1800 + i * 80, yoyo: true, repeat: -1 });
    }

    const compact = height < 620;
    const tight = height < 480;
    const titleY = tight ? 52 : compact ? 72 : 116;
    const subtitleY = tight ? 90 : compact ? 124 : 176;
    const taglineY = tight ? 122 : compact ? 164 : 226;
    const titleSize = tight ? 35 : compact ? 44 : width < 620 ? 38 : 58;
    const subtitleSize = tight ? 22 : compact ? 27 : width < 620 ? 25 : 34;
    const taglineSize = tight ? 17 : compact ? 20 : 24;

    this.add.text(width / 2, titleY, 'Good Boom-Boom Team', {
      fontFamily: GAME_FONT,
      fontSize: `${titleSize}px`,
      color: '#fff4ca',
      fontStyle: '900',
      stroke: '#493d31',
      strokeThickness: tight ? 5 : 8
    }).setOrigin(0.5);

    this.add.text(width / 2, subtitleY, '(顾的爆爆队)', {
      fontFamily: GAME_FONT,
      fontSize: `${subtitleSize}px`,
      color: '#ffd66b',
      fontStyle: '900',
      stroke: '#493d31',
      strokeThickness: tight ? 3 : 5
    }).setOrigin(0.5);

    this.add.text(width / 2, taglineY, '2.5D 卡通格子炸弹闯关', {
      fontFamily: GAME_FONT,
      fontSize: `${taglineSize}px`,
      color: '#b9e8df'
    }).setOrigin(0.5);

    const panelHeight = tight ? 172 : compact ? 222 : 292;
    const panelY = compact
      ? Phaser.Math.Clamp(height * 0.62, taglineY + panelHeight / 2 + 18, height - panelHeight / 2 - 68)
      : Math.min(330, height * 0.42);
    const panelWidth = Math.min(560, width - 28);
    this.add.rectangle(width / 2, panelY, panelWidth, panelHeight, 0xf7e0a6, 0.94)
      .setStrokeStyle(5, 0x6d775d);

    const buttonHeight = tight ? 48 : compact ? 56 : 68;
    const buttonWidth = Math.min(500, panelWidth - 42);
    const firstButtonY = panelY - (tight ? 48 : compact ? 60 : 82);
    const secondButtonY = panelY + (tight ? 10 : compact ? 12 : 2);
    const buttonFontSize = tight ? 24 : compact ? 27 : 31;

    this.makeButton(width / 2, firstButtonY, buttonWidth, buttonHeight, '开始冒险', 0x84c98f, () => {
      this.scene.start('LevelScene', { levelIndex: 0 });
    }, buttonFontSize);
    this.makeButton(width / 2, secondButtonY, buttonWidth, buttonHeight, '挑战模式', 0xffc857, () => {
      this.scene.start('LevelScene', { levelIndex: 0, challenge: true, challengeRound: 1 });
    }, buttonFontSize);

    const best = this.loadBest();
    const bestY = panelY + (tight ? 62 : compact ? 79 : 104);
    const bestTextSize = tight ? 11 : width < 520 ? 14 : compact ? 15 : 18;
    const bestLineSpacing = tight ? 2 : width < 520 ? 5 : compact ? 4 : 8;
    this.add.text(width / 2 - panelWidth * 0.23, bestY, best.slice(0, 5).join('\n'), {
      fontFamily: GAME_FONT,
      fontSize: `${bestTextSize}px`,
      color: '#354b4e',
      align: 'center',
      lineSpacing: bestLineSpacing
    }).setOrigin(0.5);
    this.add.text(width / 2 + panelWidth * 0.23, bestY, best.slice(5).join('\n'), {
      fontFamily: GAME_FONT,
      fontSize: `${bestTextSize}px`,
      color: '#354b4e',
      align: 'center',
      lineSpacing: bestLineSpacing
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 60, 'WASD / 方向键移动    空格放炸弹    Esc 暂停', {
      fontFamily: GAME_FONT,
      fontSize: `${compact ? 15 : 20}px`,
      color: '#e9fff6'
    }).setOrigin(0.5).setVisible(!tight);

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('LevelScene', { levelIndex: 0 }));
    this.input.keyboard?.once('keydown-C', () => this.scene.start('LevelScene', { levelIndex: 0, challenge: true, challengeRound: 1 }));
  }

  private loadBest() {
    const parts: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      const stars = Number(localStorage.getItem(`spark-bomber-level-${i}`) ?? 0);
      parts.push(`第 ${i + 1} 关最高评价：${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`);
    }
    return parts;
  }

  private makeButton(x: number, y: number, width: number, height: number, label: string, color: number, onPress: () => void, fontSize = 31) {
    const bg = this.add.rectangle(x, y, width, height, color, 0.96)
      .setStrokeStyle(3, 0x38685c)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: GAME_FONT,
      fontSize: `${fontSize}px`,
      color: '#1f3c38',
      fontStyle: '800'
    }).setOrigin(0.5);
    const press = () => {
      bg.setScale(0.98);
      text.setScale(0.98);
      onPress();
    };
    bg.on('pointerdown', press);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', press);
  }
}
