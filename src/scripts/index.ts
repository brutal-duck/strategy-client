import './interfaces';
import '../css/style.css';
import * as Phaser from 'phaser';

import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Game from './scenes/Game';
import Hud from './scenes/Hud';


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
      default: 'matter',
      matter: {
        debug: true,
        gravity: false
      },
    },
    render: { transparent: true },
    scene: [ Boot, Preload, Game, Hud ],
  }
  
  const game: Phaser.Game = new Phaser.Game(config);
  window.addEventListener('resize', (): void => {
    const size: Isize = getSizes();
    game.scale.resize(size.width, size.height);
  }, false);
}
