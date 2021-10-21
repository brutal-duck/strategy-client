import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import ExitBtn from './../components/buttons/ExitBtn';
import MenuBtn from './../components/buttons/MenuBtn';
import ColorsBtn from './../components/buttons/ColorsBtn';
import SingleplayerMenu from "../components/modal/SingleplayerMenu";
import MultiplayerMenu from './../components/modal/MultiplayerMenu';
import Menu from '../components/modal/Menu';
import GameMenu from './../components/modal/GameMenu';
import SuperHexConfirm from './../components/modal/SuperHexConfirm';
export default class Modal extends Phaser.Scene {
  constructor() {
    super('Modal')
  }

  public state: Istate
  public type: string
  public info: any
  public lang: any

  private playerColor: string
  private enemyColor: string

  private gameMenu: GameMenu;
  private mainMenu: Menu;
  private superHexConfirm: SuperHexConfirm;
  private singleplayerMenu: SingleplayerMenu;
  private multiplayerMenu: MultiplayerMenu;
  public gameScene: Game
  public bg: Phaser.GameObjects.TileSprite
  private openCloseAni: Phaser.Tweens.Tween;
  private createn: boolean = false;
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.createn = false;
    this.gameScene = this.game.scene.getScene('Game') as Game
    if (this.gameScene.player) {
      this.playerColor = this.gameScene.player.color
      this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'
    }


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
    this.bg.on('pointerup', (): void => { if (this.type !== 'gameOver') this.close() })
    const duration = this.type === 'gameOver' ? 1000 : 200
    this.openCloseAni = this.tweens.add({
      targets: this.bg,
      alpha: 0.4,
      duration
    })

    switch (this.type) {
      case 'gameMenu':
        this.gameMenu = new GameMenu(this);
        break;

      case 'superHex':
        this.superHexConfirm = new SuperHexConfirm(this);
        break;

      case 'gameOver':
        this.createGameOverWindow();
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

  private createGameOverWindow(): void {
    console.log(this.info);
    
    const x = this.bg.getCenter().x;
    const y = this.bg.getCenter().y;
    let text = this.lang.tie;
    let titleColor = '#b1dafe';
    if (this.info.winner !== null) {
      text = this.info.win ? this.lang.win : this.lang.lose;
      titleColor = this.info.win ? '#a893ff' : '#e86464';
    }

    let windowHeight = 600;
    const windowWidth = 600;
    if (!this.info.winner) {
      windowHeight = 520
    } else {
      if (!this.info.win) windowHeight = 520
    }

    const playerHexes: number = this.gameScene?.playerHexes().length
    const enemyHexes: number = this.gameScene?.enemyHexes().length
    const totalHexes = playerHexes + enemyHexes
    const lineWidth = windowWidth - 50
    const playerLineWidth = lineWidth / totalHexes * playerHexes
    const enemyLineWidth = lineWidth / totalHexes * enemyHexes
    
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '60px',
      fontFamily: 'Molot',
      color: titleColor,
    };

    const timerStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '20px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
    };

    const hexCountStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '60px',
      fontFamily: 'Molot',
      color: colors[this.playerColor].mainStr,
      stroke: '#908F95',
      strokeThickness: 4,
    };

    const reasonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '20px',
      fontFamily: 'Molot',
      color: this.info.win ? '#a7e22d' : '#eba873',
    };

    const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '26px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
    };
    
    const top = this.add.sprite(x, y - windowWidth / 2, 'header').setOrigin(0.5, 1);
    const topGeom = top.getBounds();
    const mid = this.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0);
    const midGeom = mid.getBounds();
    const bot = this.add.sprite(topGeom.centerX, topGeom.bottom + windowHeight, 'header').setOrigin(0.5, 0).setFlipY(true);

    let crown: Phaser.GameObjects.Sprite;
    if (this.info.win) crown = this.add.sprite(x, midGeom.top + 40, 'crown');

    const titleY = crown ? crown.getBounds().bottom + 10 : midGeom.top;
    const title = this.add.text(x, titleY, text, titleStyle).setOrigin(0.5, 0);
    const reason = this.add.text(x, title.getBounds().bottom + 10, this.lang[this.info.reason], reasonStyle).setOrigin(0.5, 0);


    const winColor = 0x8569ED;
    const looseColor = 0xEA7363;
    const drawColor = 0x7e69ea;

    let color = drawColor;
    if (this.info.winner) {
      color = this.info.win ? winColor : looseColor;
    }
    const bg = this.add.tileSprite(x, reason.getBounds().bottom + 20, windowWidth + 10, 150, 'pixel').setTint(color).setOrigin(0.5, 0);
    const bgInfoGeom = bg.getBounds();

    const playerSum = this.add.text(bgInfoGeom.centerX - 170, bgInfoGeom.centerY + 25, `${playerHexes}`, hexCountStyle).setDepth(1).setOrigin(0.5);
    const playerGlow = this.add.sprite(playerSum.x, playerSum.y, this.info.win && this.info.winner ? 'glow-winner' : 'glow-looser').setAlpha(0.5);
    const playerName = this.add.text(playerSum.x, bgInfoGeom.top + 10, this.gameScene[this.playerColor].name, nameStyle).setDepth(1).setOrigin(0.5, 0);
    const dot = this.add.text(x, bgInfoGeom.centerY + 20, '-', nameStyle).setOrigin(0.5);
    const enemySum = this.add.text(bgInfoGeom.centerX + 170, bgInfoGeom.centerY + 25, `${enemyHexes}`, hexCountStyle).setDepth(1).setColor(colors[this.enemyColor].mainStr).setOrigin(0.5);
    const enemyGlow = this.add.sprite(enemySum.x, enemySum.y, this.info.win || !this.info.winner ? 'glow-looser' : 'glow-winner').setAlpha(0.5);
    const enemyName = this.add.text(enemySum.x, bgInfoGeom.top + 10, this.gameScene[this.enemyColor].name, nameStyle).setDepth(1).setOrigin(0.5, 0);

    if (this.info.winner) {
      const wreathX = this.info.win ? playerSum.x : enemySum.x;
      const wreathY = this.info.win ? playerSum.y : enemySum.y;
      const wreath = this.add.sprite(wreathX, wreathY - 5, 'wreath');
    }

    const timeSpend = this.add.text(x, bgInfoGeom.bottom + 20, this.lang.timeSpend, timerStyle).setOrigin(0.5, 0).setDepth(1);
    const timer = this.add.text(x, timeSpend.getBounds().bottom, this.gameScene.hud.timer.getTimeLeft(), timerStyle).setOrigin(0.5, 0).setDepth(1);
    const textWindth = timeSpend.displayWidth > timer.displayWidth ? timeSpend.displayWidth + 20 : timer.displayWidth + 20;
    const textHeight = timeSpend.displayHeight + timer.displayHeight + 20;
    const timerBg = this.add.graphics().fillStyle(0xEAE4EA).fillRoundedRect(x - textWindth / 2, timeSpend.getBounds().top - 10, textWindth, textHeight, 5);

    const lineBg = this.add.tileSprite(x, timer.getBounds().bottom + 20, lineWidth, 40, 'pixel').setOrigin(0.5, 0).setVisible(false);
    const barGeom = lineBg.getBounds();
    const barMask = this.add.graphics().fillStyle(0x000000).fillRoundedRect(barGeom.left, barGeom.top, lineWidth, barGeom.height, barGeom.height / 2).setVisible(false);
    const mask = new Phaser.Display.Masks.GeometryMask(this, barMask);
    const playerLine = this.add.tileSprite(barGeom.left, barGeom.centerY, playerLineWidth, barGeom.height, `pixel-${this.playerColor}`).setDepth(2).setOrigin(0, 0.5);
    const enemyLine = this.add.tileSprite(barGeom.right, barGeom.centerY, enemyLineWidth, barGeom.height, `pixel-${this.enemyColor}`).setDepth(2).setOrigin(1, 0.5);
    playerLine.setMask(mask);
    enemyLine.setMask(mask);

    if (playerLine.width > lineWidth - 1) this.gameScene.stars = 3;
    const stars = this.info.winner ? this.gameScene.stars : 0
    const lineStar1 = this.add.sprite(x, barGeom.centerY, stars > 0 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);
    const lineStar2 = this.add.sprite(barGeom.left + lineWidth * 0.75, barGeom.centerY, stars > 1 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);
    const lineStar3 = this.add.sprite(barGeom.right, barGeom.centerY, stars > 2 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);

    const btn = new ColorsBtn(this, { x: x, y: barGeom.bottom + 70 }, (): void => { this.scene.stop(); }, {
      color: 'green',
      text: this.lang.continue,
      icon: false,
    }).setScale(1.5);
  }

  private close(): void {
    this.scene.stop()
  }
}