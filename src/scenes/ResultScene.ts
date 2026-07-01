import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type { ResultPayload } from '../game/types';

export class ResultScene extends Phaser.Scene {
  private payload!: ResultPayload;

  constructor() {
    super('ResultScene');
  }

  init(payload: ResultPayload) {
    this.payload = payload;
  }

  create() {
    this.cameras.main.setScroll(0, 0);
    const width = this.scale.width || GAME_WIDTH;
    const height = this.scale.height || GAME_HEIGHT;
    this.add.rectangle(0, 0, width, height, this.payload.won ? 0x22443d : 0x3b2d3c).setOrigin(0);
    this.add.text(width / 2, 116, this.payload.won ? '关卡完成' : '任务失败', {
      fontFamily: GAME_FONT,
      fontSize: '58px',
      color: '#fff2bf',
      fontStyle: '900',
      stroke: '#46392c',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(width / 2, 206, this.payload.levelName, {
      fontFamily: GAME_FONT,
      fontSize: '28px',
      color: '#b9e8df'
    }).setOrigin(0.5);

    this.add.text(width / 2, 292, this.payload.won ? '★'.repeat(this.payload.stars) + '☆'.repeat(3 - this.payload.stars) : '☆☆☆', {
      fontFamily: GAME_FONT,
      fontSize: '64px',
      color: '#ffd66b',
      stroke: '#6d4c32',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, 400, [
      `用时：${this.payload.seconds}s`,
      `击败敌人：${this.payload.defeated}`,
      `受伤次数：${this.payload.damageTaken}`
    ].join('\n'), {
      fontFamily: GAME_FONT,
      fontSize: '24px',
      color: '#f8f1dc',
      align: 'center',
      lineSpacing: 14
    }).setOrigin(0.5);

    const nextText = this.payload.challenge
      ? this.payload.won ? '下一张随机图' : '重新挑战'
      : this.payload.completedAll ? '回到主菜单' : this.payload.won ? '进入下一关' : '重新挑战';
    this.add.rectangle(width / 2, 560, 320, 76, 0xffc857).setStrokeStyle(4, 0x6b4c27);
    this.add.text(width / 2, 560, nextText, {
      fontFamily: GAME_FONT,
      fontSize: '30px',
      color: '#352d2a',
      fontStyle: '800'
    }).setOrigin(0.5);

    const proceed = () => {
      if (this.payload.challenge) {
        this.scene.start('LevelScene', {
          levelIndex: 0,
          carryState: this.payload.won ? this.payload.carryState : undefined,
          challenge: true,
          challengeRound: this.payload.won ? (this.payload.challengeRound ?? 1) + 1 : this.payload.challengeRound ?? 1
        });
      } else if (this.payload.completedAll) {
        this.scene.start('MenuScene');
      } else if (this.payload.won) {
        this.scene.start('LevelScene', {
          levelIndex: this.payload.levelIndex + 1,
          carryState: this.payload.carryState
        });
      } else {
        this.scene.start('LevelScene', {
          levelIndex: this.payload.levelIndex,
          carryState: this.payload.carryState
        });
      }
    };
    this.input.keyboard?.once('keydown-SPACE', proceed);
    this.input.once('pointerdown', proceed);
  }
}
