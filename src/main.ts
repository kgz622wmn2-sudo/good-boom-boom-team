import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { LevelScene } from './scenes/LevelScene';
import { ResultScene } from './scenes/ResultScene';
import { GAME_HEIGHT, GAME_WIDTH } from './game/constants';

const CONTROL_EVENT = 'spark-bomber-controls';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#203843',
  pixelArt: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER
  },
  scene: [BootScene, MenuScene, LevelScene, ResultScene]
};

const game = new Phaser.Game(config);
installMobileControls();

declare global {
  interface Window {
    sparkBomberGame?: Phaser.Game;
  }
}

window.sparkBomberGame = game;
registerServiceWorker();

function registerServiceWorker() {
  const canRegister = 'serviceWorker' in navigator
    && (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));
  if (!canRegister) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI), { scope: './' }).catch(() => {
      // The game still runs normally if the installable offline shell is unavailable.
    });
  });
}

function installMobileControls() {
  const root = document.createElement('div');
  root.id = 'mobile-controls';
  root.setAttribute('aria-hidden', 'true');

  const dpad = document.createElement('div');
  dpad.className = 'mobile-dpad';
  const actions = document.createElement('div');
  actions.className = 'mobile-actions';
  const top = document.createElement('div');
  top.className = 'mobile-top-controls';

  root.append(dpad, actions, top);
  document.body.append(root);

  const holdButtons = [
    { label: '↑', code: 'ArrowUp', key: 'ArrowUp', className: 'up' },
    { label: '←', code: 'ArrowLeft', key: 'ArrowLeft', className: 'left' },
    { label: '→', code: 'ArrowRight', key: 'ArrowRight', className: 'right' },
    { label: '↓', code: 'ArrowDown', key: 'ArrowDown', className: 'down' }
  ];
  holdButtons.forEach((item) => dpad.append(makeControlButton(item.label, item.code, item.key, 'hold', item.className)));
  actions.append(makeControlButton('炸', 'Space', ' ', 'press', 'bomb'));
  top.append(
    makeControlButton('↻', 'KeyR', 'r', 'press', 'restart'),
    makeControlButton('Ⅱ', 'Escape', 'Escape', 'press', 'pause')
  );

  window.addEventListener(CONTROL_EVENT, (event) => {
    const visible = Boolean((event as CustomEvent<{ visible: boolean }>).detail?.visible);
    root.classList.toggle('visible', visible);
    if (!visible) releaseAll(root);
  });
}

function makeControlButton(label: string, code: string, key: string, mode: 'hold' | 'press', className: string) {
  const button = document.createElement('button');
  button.className = `mobile-control ${className}`;
  button.type = 'button';
  button.textContent = label;

  const press = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    button.classList.add('pressed');
    button.setPointerCapture?.(event.pointerId);
    sendKey('keydown', code, key);
    if (mode === 'press') {
      window.setTimeout(() => {
        sendKey('keyup', code, key);
        button.classList.remove('pressed');
      }, 70);
    }
  };

  const release = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (mode === 'hold' && button.classList.contains('pressed')) sendKey('keyup', code, key);
    button.classList.remove('pressed');
  };

  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  return button;
}

function sendKey(type: 'keydown' | 'keyup', code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent(type, {
    code,
    key,
    bubbles: true,
    cancelable: true
  }));
}

function releaseAll(root: HTMLElement) {
  root.querySelectorAll('.pressed').forEach((node) => node.classList.remove('pressed'));
  [
    ['ArrowUp', 'ArrowUp'],
    ['ArrowLeft', 'ArrowLeft'],
    ['ArrowRight', 'ArrowRight'],
    ['ArrowDown', 'ArrowDown'],
    ['Space', ' ']
  ].forEach(([code, key]) => sendKey('keyup', code, key));
}
