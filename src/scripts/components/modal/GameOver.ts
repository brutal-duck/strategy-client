import Modal from './../../scenes/Modal';
import { colors } from '../../gameConfig';
import ColorsBtn from '../buttons/ColorsBtn';

export default class GameOver {
  private scene: Modal;
  private playerColor: string;
  private enemyColor: string;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private crown: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private reason: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.TileSprite;
  private playerSum: Phaser.GameObjects.Text;
  private playerGlow: Phaser.GameObjects.Sprite;
  private playerName: Phaser.GameObjects.Text;
  private dot: Phaser.GameObjects.Text;
  private enemySum: Phaser.GameObjects.Text;
  private enemyGlow: Phaser.GameObjects.Sprite;
  private enemyName: Phaser.GameObjects.Text;
  private wreath: Phaser.GameObjects.Sprite;
  private timeSpend: Phaser.GameObjects.Text;
  private timer: Phaser.GameObjects.Text;
  private timerBg: Phaser.GameObjects.Sprite;
  private lineBg: Phaser.GameObjects.TileSprite;
  private roundLeft: Phaser.GameObjects.Sprite;
  private roundRight: Phaser.GameObjects.Sprite;
  private playerLine: Phaser.GameObjects.TileSprite;
  private enemyLine: Phaser.GameObjects.TileSprite;
  private lineStar1: Phaser.GameObjects.Sprite;
  private lineStar2: Phaser.GameObjects.Sprite;
  private lineStar3: Phaser.GameObjects.Sprite;
  private btn: ColorsBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.playerColor = this.scene.gameScene.player.color
    this.enemyColor = this.scene.gameScene.player.color === 'red' ? 'green' : 'red'
    this.createElements();
  }

  private createElements(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    let text = this.scene.lang.tie;
    let titleColor = '#b1dafe';
    if (this.scene.info.winner !== null) {
      text = this.scene.info.win ? this.scene.lang.win : this.scene.lang.lose;
      titleColor = this.scene.info.win ? '#a893ff' : '#e86464';
    }

    let windowHeight = 600;
    const windowWidth = 600;
    if (!this.scene.info.winner) {
      windowHeight = 520
    } else {
      if (!this.scene.info.win) windowHeight = 520
    }

    const playerHexes: number = this.scene.gameScene?.playerHexes().length
    const enemyHexes: number = this.scene.gameScene?.enemyHexes().length
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
      color: this.scene.info.win ? '#a7e22d' : '#eba873',
    };

    const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '26px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
    };
    
    this.top = this.scene.add.sprite(x, y - windowWidth / 2, 'header').setOrigin(0.5, 1);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0);
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(topGeom.centerX, topGeom.bottom + windowHeight, 'header').setOrigin(0.5, 0).setFlipY(true);

    if (this.scene.info.win) this.crown = this.scene.add.sprite(x, midGeom.top + 40, 'crown');

    const titleY = this.crown ? this.crown.getBounds().bottom + 10 : midGeom.top;
    this.title = this.scene.add.text(x, titleY, text, titleStyle).setOrigin(0.5, 0);
    this.reason = this.scene.add.text(x, this.title.getBounds().bottom + 10, this.scene.lang[this.scene.info.reason], reasonStyle).setOrigin(0.5, 0);


    const winColor = 0x8569ED;
    const looseColor = 0xEA7363;
    const drawColor = 0x7e69ea;

    let color = drawColor;
    if (this.scene.info.winner) {
      color = this.scene.info.win ? winColor : looseColor;
    }
    this.bg = this.scene.add.tileSprite(x, this.reason.getBounds().bottom + 20, windowWidth + 10, 150, 'pixel').setTint(color).setOrigin(0.5, 0);
    const bgInfoGeom = this.bg.getBounds();

    this.playerSum = this.scene.add.text(bgInfoGeom.centerX - 170, bgInfoGeom.centerY + 25, `${playerHexes}`, hexCountStyle).setDepth(1).setOrigin(0.5);
    this.playerGlow = this.scene.add.sprite(this.playerSum.x, this.playerSum.y, this.scene.info.win && this.scene.info.winner ? 'glow-winner' : 'glow-looser').setAlpha(0.5);
    this.playerName = this.scene.add.text(this.playerSum.x, bgInfoGeom.top + 10, this.scene.gameScene[this.playerColor].name, nameStyle).setDepth(1).setOrigin(0.5, 0);
    this.dot = this.scene.add.text(x, bgInfoGeom.centerY + 20, '-', nameStyle).setOrigin(0.5);
    this.enemySum = this.scene.add.text(bgInfoGeom.centerX + 170, bgInfoGeom.centerY + 25, `${enemyHexes}`, hexCountStyle).setDepth(1).setColor(colors[this.enemyColor].mainStr).setOrigin(0.5);
    this.enemyGlow = this.scene.add.sprite(this.enemySum.x, this.enemySum.y, this.scene.info.win || !this.scene.info.winner ? 'glow-looser' : 'glow-winner').setAlpha(0.5);
    this.enemyName = this.scene.add.text(this.enemySum.x, bgInfoGeom.top + 10, this.scene.gameScene[this.enemyColor].name, nameStyle).setDepth(1).setOrigin(0.5, 0);

    if (this.scene.info.winner) {
      const wreathX = this.scene.info.win ? this.playerSum.x : this.enemySum.x;
      const wreathY = this.scene.info.win ? this.playerSum.y : this.enemySum.y;
      this.wreath = this.scene.add.sprite(wreathX, wreathY - 5, 'wreath');
    }

    this.timeSpend = this.scene.add.text(x, bgInfoGeom.bottom + 20, this.scene.lang.timeSpend, timerStyle).setOrigin(0.5, 0).setDepth(1);
    this.timer = this.scene.add.text(x, this.timeSpend.getBounds().bottom, this.scene.gameScene.hud.timer.getTimeLeft(), timerStyle).setOrigin(0.5, 0).setDepth(1);
    this.timerBg = this.scene.add.sprite(x, this.timeSpend.y - 10, 'timer-plate').setOrigin(0.5, 0);
    this.lineBg = this.scene.add.tileSprite(x, this.timer.getBounds().bottom + 20, lineWidth, 40, 'pixel').setOrigin(0.5, 0).setVisible(false);
    const barGeom = this.lineBg.getBounds();
    const scale = 35 / 50;
    this.roundLeft = this.scene.add.sprite(barGeom.left, barGeom.centerY, 'round-bar').setOrigin(0, 0.5).setScale(scale).setVisible(false);
    this.roundRight = this.scene.add.sprite(barGeom.right, barGeom.centerY, 'round-bar').setFlipX(true).setOrigin(1, 0.5).setScale(scale).setVisible(false);
    const leftMask = new Phaser.Display.Masks.BitmapMask(this.scene, this.roundLeft);
    const rightMask = new Phaser.Display.Masks.BitmapMask(this.scene, this.roundRight);

    this.playerLine = this.scene.add.tileSprite(barGeom.left, barGeom.centerY, playerLineWidth, barGeom.height, `pixel-${this.playerColor}`).setDepth(2).setOrigin(0, 0.5);
    this.enemyLine = this.scene.add.tileSprite(barGeom.right, barGeom.centerY, enemyLineWidth, barGeom.height, `pixel-${this.enemyColor}`).setDepth(2).setOrigin(1, 0.5);
    this.playerLine.setMask(leftMask).mask.invertAlpha = true;
    this.enemyLine.setMask(rightMask).mask.invertAlpha = true;

    if (this.playerLine.width > lineWidth - 1) this.scene.gameScene.stars = 3;
    const stars = this.scene.info.winner ? this.scene.gameScene.stars : 0
    this.lineStar1 = this.scene.add.sprite(x, barGeom.centerY, stars > 0 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);
    this.lineStar2 = this.scene.add.sprite(barGeom.left + lineWidth * 0.75, barGeom.centerY, stars > 1 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);
    this.lineStar3 = this.scene.add.sprite(barGeom.right, barGeom.centerY, stars > 2 ? 'lil-star' : 'lil-star-dis').setScale(0.8).setDepth(3);

    this.btn = new ColorsBtn(this.scene, { x: x, y: barGeom.bottom + 70 }, (): void => { this.stopGame(); }, {
      color: 'green',
      text: this.scene.lang.continue,
      icon: false,
    }).setScale(1.5);
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    let text = this.scene.lang.tie;
    let titleColor = '#b1dafe';
    if (this.scene.info.winner !== null) {
      text = this.scene.info.win ? this.scene.lang.win : this.scene.lang.lose;
      titleColor = this.scene.info.win ? '#a893ff' : '#e86464';
    }

    let windowHeight = 600;
    const windowWidth = 600;
    if (!this.scene.info.winner) {
      windowHeight = 520
    } else {
      if (!this.scene.info.win) windowHeight = 520
    }
        
    this.top.setPosition(x, y - windowWidth / 2);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(topGeom.centerX, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(topGeom.centerX, topGeom.bottom + windowHeight);

    this.crown?.setPosition(x, midGeom.top + 40);
    const titleY = this.crown ? this.crown.getBounds().bottom + 10 : midGeom.top;
    this.title.setPosition(x, titleY, text);
    this.reason.setPosition(x, this.title.getBounds().bottom + 10);


    this.bg.setPosition(x, this.reason.getBounds().bottom + 20, windowWidth + 10);
    const bgInfoGeom = this.bg.getBounds();

    this.playerSum.setPosition(bgInfoGeom.centerX - 170, bgInfoGeom.centerY + 25);
    this.playerGlow.setPosition(this.playerSum.x, this.playerSum.y);
    this.playerName.setPosition(this.playerSum.x, bgInfoGeom.top + 10);
    this.dot.setPosition(x, bgInfoGeom.centerY + 20);
    this.enemySum.setPosition(bgInfoGeom.centerX + 170, bgInfoGeom.centerY + 25);
    this.enemyGlow.setPosition(this.enemySum.x, this.enemySum.y);
    this.enemyName.setPosition(this.enemySum.x, bgInfoGeom.top + 10);

    if (this.scene.info.winner) {
      const wreathX = this.scene.info.win ? this.playerSum.x : this.enemySum.x;
      const wreathY = this.scene.info.win ? this.playerSum.y : this.enemySum.y;
      this.wreath.setPosition(wreathX, wreathY - 5);
    }

    this.timeSpend.setPosition(x, bgInfoGeom.bottom + 20);
    this.timer.setPosition(x, this.timeSpend.getBounds().bottom);
    this.timerBg.setPosition(this.timeSpend.x, this.timeSpend.y);

    this.lineBg.setPosition(x, this.timer.getBounds().bottom + 20);
    const barGeom = this.lineBg.getBounds();
    this.roundLeft.setPosition(barGeom.left, barGeom.centerY);
    this.roundRight.setPosition(barGeom.right, barGeom.centerY);

    this.playerLine.setPosition(barGeom.left, barGeom.centerY);
    this.enemyLine.setPosition(barGeom.right, barGeom.centerY);

    this.lineStar1.setPosition(x, barGeom.centerY);
    this.lineStar2.setPosition(barGeom.left + barGeom.width * 0.75, barGeom.centerY,);
    this.lineStar3.setPosition(barGeom.right - 5, barGeom.centerY);

    this.btn.setPosition(x,barGeom.bottom + 70);
  }

  public stopGame(): void {
    this.scene.scene.stop(); 
    this.scene.gameScene.gameIsOn = false
    this.scene.gameScene.hud.scene.stop()
    this.scene.gameScene.world.recreate(this.scene.gameScene.gameIsOn)
    if (this.scene.state.game.AI) this.scene.gameScene.AI.remove()
    this.scene.scene.start('MainMenu', this.scene.state)
    this.scene.state.socket?.closeSocket();
  }
}