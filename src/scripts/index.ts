import './interfaces';
import '../css/style.css';
import * as Phaser from 'phaser';

import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Game from './scenes/Game';
import Hud from './scenes/Hud';
import Modal from './scenes/Modal';


const getSizes: Function = (): Isize => {
  return {
    width: Math.round(document.body.clientWidth),
    height: Math.round(document.body.clientHeight),
  }
}

window.onload = (): void => {
  const size: Isize = getSizes();
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: size.width,
    height: size.height,
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true,
        gravity: { x: 0, y: 0 }
      },
    },
    render: { transparent: true },
    scene: [ Boot, Preload, Game, Hud, Modal ],
  }
  
  const game: Phaser.Game = new Phaser.Game(config);

  window.addEventListener('resize', (): void => {
    const size: Isize = getSizes();
    // game.input.mousePointer.camera = game.scene.getScene('Game').cameras.main // фикс краша вывода курсора за предел веб окна для старшей версии Phasera
    const hud = game.scene.getScene('Hud') as Hud
    hud?.resize()
    game.scale.resize(size.width, size.height);
  }, false);
}
