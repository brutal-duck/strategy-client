import './interfaces';
import '../css/style.css';
import * as Phaser from 'phaser';

import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Game from './scenes/Game';
import Hud from './scenes/Hud';
import Modal from './scenes/Modal';
import MainMenu from './scenes/MainMenu';
import Tutorial from './scenes/Tutorial';


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
    scene: [ Boot, Preload, Game, MainMenu, Hud, Modal, Tutorial ],
  }
  
  const game: Phaser.Game = new Phaser.Game(config);
  game.scale.lockOrientation('landscape-primary')
  game.scale.on('orientationchange', (): void => {
    const size: Isize = getSizes();
    game.scale.resize(size.width, size.height);

    const hud = game.scene.getScene('Hud') as Hud
    const mainMenu = game.scene.getScene('MainMenu') as MainMenu
    if (hud.scene.isActive()) hud.resize()
    if (mainMenu.scene.isActive()) mainMenu.resize()
  })

  window.addEventListener('resize', (): void => {
    const size: Isize = getSizes();
    game.scale.resize(size.width, size.height);

    const hud = game.scene.getScene('Hud') as Hud
    const mainMenu = game.scene.getScene('MainMenu') as MainMenu
    const modal = game.scene.getScene('Modal') as Modal
    if (hud.scene.isActive()) hud.resize()
    if (mainMenu.scene.isActive()) mainMenu.resize()
    if (modal.scene.isActive()) modal.resize()

    // game.input.mousePointer.camera = game.scene.getScene('Game').cameras.main // фикс краша вывода курсора за предел веб окна для старшей версии Phasera
  }, false);
}
