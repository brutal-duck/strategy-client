import AskBtn from "../components/buttons/AskBtn"
import MatchMenuBtn from "../components/buttons/MatchMenuBtn"
import MatchOverBtn from "../components/buttons/MatchOverBtn"
import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import ExitBtn from './../components/buttons/ExitBtn';
import MenuBtn from './../components/buttons/MenuBtn';
import ColorsBtn from './../components/buttons/ColorsBtn';

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
  private bg: Phaser.GameObjects.TileSprite
  private openCloseAni: Phaser.Tweens.Tween
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.playerColor = this.gameScene.player.color
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'
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
      case 'matchMenu':
        this.matchMenuWindow()
        break

      case 'landing':
        this.landingConfirmWindow()
        break

      case 'gameOver':
        this.gameOverWindow()
        break

      default: break
    }
  }


  private matchMenuWindow(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#979EE0',
    };
    const x = this.bg.getCenter().x;
    const y = this.bg.getCenter().y;
    const windowHeight = 290;

    const top = this.add.sprite(x, y - 100, 'header-lil').setOrigin(0.5, 0);
    const topGeom = top.getBounds();
    const mid = this.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-lil').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = mid.getBounds();
    const bot = this.add.sprite(midGeom.centerX, midGeom.bottom, 'header-lil').setOrigin(0.5, 0).setFlipY(true);

    const title = this.add.text(x, topGeom.bottom + 30, this.lang.menu, textStyle).setOrigin(0.5).setDepth(2)
    new ExitBtn(this, { x: topGeom.right - 45, y: topGeom.bottom + 50}, (): void => { this.scene.stop(); });

    new MenuBtn(this, { x: x, y: mid.getCenter().y }, (): void => { console.log('settings'); });
    new MenuBtn(this, { x: x, y: mid.getCenter().y + 80 }, (): void => { this.stopGame(); }, 'leave');
  }


  private landingConfirmWindow(): void {
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


  private gameOverWindow(): void {
    console.log(this.info);
    
    const x = this.bg.getCenter().x;
    const y = this.bg.getCenter().y;
    let text = this.lang.tie;
    let titleColor = '#b1dafe';
    if (this.info.winner !== null) {
      text = this.info.win ? this.lang.win : this.lang.lose;
      titleColor = this.info.win ? '#a893ff' : '#e86464';
    }

    let windowHeight = 540;
    const windowWidth = 600;
    if (!this.info.winner) {
      windowHeight = 460
    } else {
      if (!this.info.win) windowHeight = 460
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
    if (this.info.win) crown = this.add.sprite(x, midGeom.top + 20, 'crown');

    const titleY = crown ? crown.getBounds().bottom + 10 : midGeom.top - 10;
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

  private blink(text: Phaser.GameObjects.Text): void {
    const duration = 300
    const line: Phaser.GameObjects.Sprite = this.add.sprite(text.getLeftCenter().x - 5, text.getLeftCenter().y, 'blink').setOrigin(1, 0.5).setAlpha(0.8)
    const whiteText: Phaser.GameObjects.Text = this.add.text(text.x, text.y, text.text, { font: `${text.style.fontSize} Molot`, color: 'white' }).setOrigin(0.5).setDepth(text.depth + 1).setStroke('white', 5).setVisible(false).setAlpha(0.7)
    const mask = text.createBitmapMask()
    line.setMask(mask)


    this.tweens.add({
      targets: line,
      x: text.getRightCenter().x + line.getBounds().width,
      duration,
    })


    this.tweens.add({
      targets: text,
      x: text.x,
      delay: duration / 2,
      duration: 30,
      onStart: (): void => { whiteText.setVisible(true) },
      onComplete: (): void => { whiteText.destroy() }
    })
  }

  private grade(text: Phaser.GameObjects.Text): void {
    const duration = 500
    const grade: Phaser.GameObjects.Sprite = this.add.sprite(text.getBottomCenter().x, text.getBottomCenter().y, 'grade').setOrigin(0.5, 1).setDisplaySize(text.width, text.height).setAlpha(0).setTint(0x800000)
    const mask = text.createBitmapMask()
    grade.setMask(mask)

    this.tweens.add({
      targets: grade,
      alpha: 0.7,
      duration
    })
  }

  private lineOut(text: Phaser.GameObjects.Text): void {
    let tint = this.info?.win ? 0x16ac0f : 0x800000
    const line: Phaser.GameObjects.TileSprite = this.add.tileSprite(text.getTopCenter().x, text.getTopCenter().y - 3, 1, 4, 'pixel').setOrigin(0.5, 1).setAlpha(0).setTint(this.info.winner === null ? 0xFFFFFF : tint)

    this.tweens.add({
      targets: line,
      alpha: { value: 1, duration: 200 },
      width: { value: text.width - 40, duration: 600 }
    })
  }

  public stopGame(): void {
    this.close()
    this.gameScene.gameIsOn = false
    this.gameScene.hud.scene.stop()
    this.gameScene.world.recreate(this.gameScene.gameIsOn)
    if (this.state.game.AI) this.gameScene.AI.remove()
    this.scene.start('MainMenu', this.state)
    this.state.socket?.closeSocket();
  }

  private close(): void {
    this.scene.stop()
  }
}