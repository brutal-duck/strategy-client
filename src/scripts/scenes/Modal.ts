import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import ExitBtn from './../components/buttons/ExitBtn';
import MenuBtn from './../components/buttons/MenuBtn';
import ColorsBtn from './../components/buttons/ColorsBtn';
import StartGameBtn from './../components/buttons/StartGameBtn';
import SingleplayerMenu from "../components/modal/SingleplayerMenu";
import MultiplayerMenu from './../components/modal/MultiplayerMenu';

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

  public gameScene: Game
  public bg: Phaser.GameObjects.TileSprite
  private openCloseAni: Phaser.Tweens.Tween
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.gameScene = this.game.scene.getScene('Game') as Game
    if (this.gameScene.player) {
      this.playerColor = this.gameScene.player.color
      this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'
    }
  }


  public create(): void {
    this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0).setInteractive()
    this.bg.on('pointerup', (): void => { if (this.type !== 'gameOver') this.close() })
    const duration = this.type === 'gameOver' ? 1000 : 200
    this.openCloseAni = this.tweens.add({
      targets: this.bg,
      alpha: 0.4,
      duration
    })

    switch (this.type) {
      case 'gameMenu':
        this.createGameMenuWindow();
        break;

      case 'superHex':
        this.createSuperHexConfirmWindow();
        break;

      case 'gameOver':
        this.createGameOverWindow();
        break;
      
      case 'mainMenu':
        this.createMainMenu();
        break;
      
      case 'singleplayerMenu':
        new SingleplayerMenu(this);
        break;

      case 'multiplayerMenu':
        new MultiplayerMenu(this);
        break;
      default: 
        break;
    }
  }


  private createGameMenuWindow(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#CFCDCA',
    };
    const x = this.bg.getCenter().x;
    const y = this.bg.getCenter().y;
    const windowHeight = 390;

    const top = this.add.sprite(x, y - windowHeight / 2 - 100, 'header-mid').setOrigin(0.5, 0);
    const topGeom = top.getBounds();
    const mid = this.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = mid.getBounds();
    const bot = this.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    const title = this.add.text(x, topGeom.bottom + 30, this.lang.menu, textStyle).setOrigin(0.5).setDepth(2);
    new ExitBtn(this, { x: topGeom.right - 45, y: topGeom.bottom + 30}, (): void => { this.scene.stop(); });

    new MenuBtn(this, { x: x, y: mid.getCenter().y }, (): void => { console.log('settings'); });
    new MenuBtn(this, { x: x, y: mid.getCenter().y + 120 }, (): void => { this.stopGame(); }, 'escape');
  }

  private createSuperHexConfirmWindow(): void {
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
    const windowHeight = 160
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '26px',
      color: '#A893F5',
    };
    const top = this.add.sprite(x, y - 100, 'header-lil').setOrigin(0.5, 0);
    const topGeom = top.getBounds();
    const mid = this.add.sprite(topGeom.centerX, topGeom.bottom,  'pixel-window-lil').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const bot = this.add.sprite(topGeom.centerX, topGeom.bottom + windowHeight, 'header-lil').setFlipY(true).setOrigin(0.5, 0);

    const title: Phaser.GameObjects.Text = this.add.text(x, topGeom.bottom + 10, this.lang.landTroops, textStyle).setOrigin(0.5, 0).setDepth(2);

    this.add.sprite(x, title.getBottomCenter().y + 30, 'super-hex').setScale(0.5);
    this.add.text(x, title.getBottomCenter().y + 30, `${this.gameScene[this.gameScene.player.color].superHex}`, textStyle).setOrigin(0.5).setColor('#EAE9EA');

    new ColorsBtn(this, { x: x - 64, y: mid.getCenter().y + 45 }, (): void => { this.close() }, {
      color: 'red',
      text: this.lang.no,
      icon: false,
    });

    new ColorsBtn(this, { x: x + 64, y: mid.getCenter().y + 45 }, (): void => { 
      if (this.gameScene.state.game.AI) this.gameScene.superHexClameConfirmed();
      else this.gameScene.superHexSocketClameConfirmed();
      this.close();
    }, {
      color: 'green',
      text: this.lang.yes,
      icon: true,
    });
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

    const btn = new ColorsBtn(this, { x: x, y: barGeom.bottom + 70 }, (): void => { this.stopGame(); }, {
      color: 'green',
      text: this.lang.continue,
      icon: false,
    }).setScale(1.5);
  }

  private createMainMenu(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#CFCDCA',
    };

    const x = this.bg.getCenter().x;
    const y = this.bg.getCenter().y;
    const windowHeight = 470;

    const top = this.add.sprite(x, y - windowHeight / 2 - 50, 'header-mid').setOrigin(0.5, 0);
    const topGeom = top.getBounds();
    const mid = this.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = mid.getBounds();
    const bot = this.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    const title = this.add.text(x, topGeom.bottom + 30, this.lang.menu, textStyle).setOrigin(0.5).setDepth(2);
    new ExitBtn(this, { x: topGeom.right - 45, y: topGeom.bottom + 30}, (): void => { this.scene.stop(); });

    new MenuBtn(
      this, 
      { x: x, y: mid.getCenter().y }, 
      (): void => { this.scene.restart({ state: this.state, type: 'multiplayerMenu' }); },
      'multiplayer',
    );
    new MenuBtn(
      this, 
      { x: x, y: mid.getCenter().y + 150 }, 
      (): void => { this.scene.restart({ state: this.state, type: 'singleplayerMenu' }); },
      'singleplayer',
    );
  }

  private stopGame(): void {
    this.close();
    this.gameScene.gameIsOn = false;
    this.gameScene.hud.scene.stop();
    this.gameScene.world.recreate(this.gameScene.gameIsOn);
    if (this.state.game.AI) this.gameScene.AI.remove();
    if (!this.state.game.AI) this.state.socket?.closeSocket();
    this.scene.start('MainMenu', this.state);
  }

  private close(): void {
    this.scene.stop()
  }
}