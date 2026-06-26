import Phaser from 'phaser';
import GameScene from './GameScene';
import { GAME_VIEW_HEIGHT, GAME_VIEW_WIDTH } from './gamePresentation';

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_VIEW_WIDTH,
    height: GAME_VIEW_HEIGHT,
    backgroundColor: '#17112a',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [GameScene],
  });
}
