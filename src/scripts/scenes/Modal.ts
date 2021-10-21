import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import ColorsBtn from './../components/buttons/ColorsBtn';
import SingleplayerMenu from "../components/modal/SingleplayerMenu";
import MultiplayerMenu from './../components/modal/MultiplayerMenu';
import Menu from '../components/modal/Menu';
import GameMenu from './../components/modal/GameMenu';
import SuperHexConfirm from './../components/modal/SuperHexConfirm';
import GameOver from './../components/modal/GameOver';
export default class Modal extends Phaser.Scene {
  constructor() {
    super('Modal')
  }

  public state: Istate
  public type: string
  public info: any
  public lang: any

  private playerColor: string;
  private enemyColor: string;

  private gameMenu: GameMenu;
  private mainMenu: Menu;
  private superHexConfirm: SuperHexConfirm;
  private singleplayerMenu: SingleplayerMenu;
  private multiplayerMenu: MultiplayerMenu;
  private gameOver: GameOver;
  public gameScene: Game;
  public bg: Phaser.GameObjects.TileSprite;
  private openCloseAni: Phaser.Tweens.Tween;
  private createn: boolean = false;
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.createn = false;
    this.gameScene = this.game.scene.getScene('Game') as Game



  }

  public resize(): void {
    console.log('resize modal');
    const maxHeight = 1080;
    const currentHeight = Number(document.body.clientHeight);
    const currentWidth = Number(document.body.clientWidth);
    this.cameras.main.setZoom(currentHeight / maxHeight);
    const percent = (maxHeight - currentHeight) / currentHeight;
    const bgWidth = currentWidth * percent + currentWidth;
    const bgHeight = currentHeight * percent +  currentHeight;
    this.bg?.setDisplaySize(bgWidth, bgHeight);
    this.bg?.setPosition(0 - currentWidth * percent / 2, 0 - currentHeight * percent / 2);
    if (this.createn) {
      this.mainMenu?.resize();
      this.gameMenu?.resize();
      this.superHexConfirm?.resize();
      this.singleplayerMenu?.resize();
      this.multiplayerMenu?.resize();
      this.gameOver?.resize();
    }

  }

  public create(): void {
    this.createn = false;
    this.gameMenu = undefined;
    this.mainMenu = undefined;
    this.superHexConfirm = undefined;
    this.singleplayerMenu = undefined;
    this.multiplayerMenu = undefined;
    this.bg = this.add.tileSprite(0, 0, 0, 0, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0).setInteractive();
    this.resize();
    this.bg.on('pointerup', (): void => { if (this.type !== 'gameOver') this.scene.stop(); });
    const duration = this.type === 'gameOver' ? 1000 : 200;
    this.openCloseAni = this.tweens.add({
      targets: this.bg,
      alpha: 0.4,
      duration
    });

    switch (this.type) {
      case 'gameMenu':
        this.gameMenu = new GameMenu(this);
        break;

      case 'superHex':
        this.superHexConfirm = new SuperHexConfirm(this);
        break;

      case 'gameOver':
        this.gameOver = new GameOver(this);
        break;
      
      case 'mainMenu':
        this.mainMenu = new Menu(this);
        break;
      
      case 'singleplayerMenu':
        this.singleplayerMenu = new SingleplayerMenu(this);
        break;

      case 'multiplayerMenu':
        this.multiplayerMenu = new MultiplayerMenu(this);
        break;
      default: 
        break;
    }
    this.createn = true;
  }
};
