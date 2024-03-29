import { FAPI } from '../libs/FAPI.js';
import StartGameBtn from "../components/buttons/StartGameBtn";
import Game from "./Game"
import bridge from '@vkontakte/vk-bridge';
import { platforms } from "../types";
import Utils from './../utils/Utils';
import axios from 'axios';
const TEXT_DISPLAY_PERCENT = 5;
const BTN_DISPLAY_PERCENT = 23;
const LOGO_DISPLAY_PERCENT = 30;

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  public state: Istate;
  public lang: any;
  private camera: Phaser.Cameras.Scene2D.BaseCamera;
  public gameScene: Game;
  private logo: Phaser.GameObjects.Sprite;
  private startGame: StartGameBtn;
  private name: Phaser.GameObjects.Text;
  private points: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.TileSprite;

  public init(state: Istate): void {
    this.state = state;
    this.lang = this.state.lang;
    this.camera = this.cameras.main;
    this.gameScene = this.game.scene.keys['Game'];
    this.gameScene.cameraFly(true);
    this.state.game.AI = '';
  }
  
  public create(): void {
    this.state.sounds.playMusic('menu-music');
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const currentBtnHeight = Math.round(document.body.clientHeight / 100 * BTN_DISPLAY_PERCENT);
    const currentLogoHeight = Math.round(document.body.clientHeight / 100 * LOGO_DISPLAY_PERCENT);
    this.bg = this.add.tileSprite(0, 0, this.camera.width, this.camera.height, 'pixel').setOrigin(0).setTint(0x20006b).setAlpha(0.55).setInteractive();
    this.logo = this.add.sprite(this.camera.centerX, this.camera.centerY - currentBtnHeight / 4, 'logo').setOrigin(0.5, 1).setScale(currentLogoHeight / 245);

    const position: Iposition = {
      x: this.cameras.main.centerX,
      y: this.logo.getBottomCenter().y + currentBtnHeight,
    };

    this.startGame = new StartGameBtn(this, position, () => { this.onStartGame(); }, this.lang.play);
    this.startGame.setScale(currentBtnHeight / 245, curFontSize + curFontSize * 0.20);

    this.createUserInfo();
  }

  private onStartGame(): void {
    this.scene.launch('Modal', { state: this.state, type: 'mainMenu' });
    this.state.amplitude.track('play', {});
  }

  private createUserInfo(): void {
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: `${curFontSize}px`,
      fontFamily: 'Molot',
      color: 'white',
      stroke: 'black',
      strokeThickness: 1,
    };
    const { name, points } = this.state.player;
    const isVertical = Utils.isVerticalOrientation();

    this.name = this.add.text(20, curFontSize / 2, name, style).setOrigin(0).setVisible(!isVertical);
    this.points = this.add.text(20, this.name.getBounds().bottom, `${this.lang.points} ${points}`, style).setOrigin(0).setVisible(!isVertical);

  }

  public resize(): void {
    const isVertical = Utils.isVerticalOrientation();
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const currentBtnHeight = Math.round(document.body.clientHeight / 100 * BTN_DISPLAY_PERCENT);
    const currentLogoHeight = Math.round(document.body.clientHeight / 100 * LOGO_DISPLAY_PERCENT);

    this.logo.setPosition(this.camera.centerX, this.camera.centerY - currentBtnHeight / 4).setScale(currentLogoHeight / 245);
    this.name.setPosition(20, curFontSize / 2).setFontSize(curFontSize).setVisible(!isVertical);
    this.points.setPosition(20, this.name.getBounds().bottom).setFontSize(curFontSize).setVisible(!isVertical);
    this.startGame.x = this.camera.centerX;
    this.startGame.y = this.logo.getBottomCenter().y + currentBtnHeight;
    this.startGame.setScale(currentBtnHeight / 245, curFontSize + curFontSize * 0.20);
    this.bg.setSize(this.camera.width, this.camera.height);
  }


  public update(): void {
    if (this.state.startGame) {
      this.state.socket.clearState();
      this.state.startGame = false;
      if (this.state.game.AI) this.state.player.color = Phaser.Math.Between(0, 1) === 0 ? 'green' : 'red'
      else {
        this.state.amplitude.track('start', { mode: 'online' });
      }
      this.gameScene.cameraFly(true, false)
      this.scene.stop()
      this.scene.stop('Modal');
      this.scene.start('Hud', this.state)
      this.gameScene.launch(this.state)
    }
    if (this.scene.isActive('Modal')) {
      this.startGame.setVisible(false);
      this.logo.setVisible(false);
    } else if (!this.scene.isActive('Modal') && !this.logo.visible) {
      this.startGame.setVisible(true);
      this.logo.setVisible(true);
    }
  }
}