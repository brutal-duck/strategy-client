import Hud from '../../scenes/Hud';
import Timer from '../Timer';
import Utils from './../../utils/Utils';

const BAR_DISPLAY_PERCENT = 5;
const MOBILE_BAR_DISPLAY_PERCENT = 7;
const TEXT_DISPLAY_PERCENT = 4;
const MAX_TEXT_SIZE = 24;

export default class StatusBar extends Phaser.GameObjects.Sprite {
  public scene: Hud;
  private playerName: Phaser.GameObjects.Text;
  private enemyName: Phaser.GameObjects.Text;
  private playerBar: Phaser.GameObjects.TileSprite;
  private enemyBar: Phaser.GameObjects.TileSprite;
  private maskGraphics: Phaser.GameObjects.Graphics;
  private animation: Phaser.Tweens.Tween;
  private star1: Phaser.GameObjects.Sprite;
  private star2: Phaser.GameObjects.Sprite;
  private star3: Phaser.GameObjects.Sprite;
  private playerColor: string;
  private enemyColor: string;
  public timer: Timer;

  constructor(scene: Hud) {
    const { centerX } = scene.cameras.main;
    super(scene, centerX, 0, 'pixel');
    this.scene.add.existing(this);
    this.setVisible(false);
    this.playerColor = this.scene.gameScene.player.color;
    this.enemyColor = this.scene.gameScene.player.color === 'red' ? 'green' : 'red';
    this.create();
  }

  private getSettings(): { fontSize: number, barHeight: number } {
    const { clientHeight } = document.body;
    let fontSize = Math.round(clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    if (fontSize > MAX_TEXT_SIZE) fontSize = MAX_TEXT_SIZE;

    let barHeight = clientHeight / 100 * BAR_DISPLAY_PERCENT;
    if (Utils.isVerticalOrientation()) {
      barHeight = clientHeight / 100 * MOBILE_BAR_DISPLAY_PERCENT;
    }
    return { fontSize, barHeight };
  }

  private create(): void {
    const { fontSize, barHeight } = this.getSettings();
    const lineWidth = this.getBarWidth();

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: fontSize + 'px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 1,
    };

    this.setDisplaySize(lineWidth, barHeight);
    const { width } = this.scene.cameras.main; 
    this.playerName = this.scene.add.text(width / 2 - lineWidth / 2, fontSize, this.scene.lang.you, textStyle)
      .setOrigin(0, 0.5)
      .setCrop(0, 0, width / 5, 200);

    this.enemyName = this.scene.add.text(width / 2 + lineWidth / 2, fontSize, this.scene.gameScene[this.scene.enemyColor].name, textStyle)
      .setOrigin(1, 0.5)
      .setCrop(0, 0, width / 5, 200);

    const barY = this.playerName.getBounds().bottom + fontSize;
    this.setY(barY);
    const barGeom = this.getBounds();

    this.maskGraphics = this.scene.add.graphics({ x: barGeom.centerX, y: barGeom.centerY })
      .fillStyle(0x00ff00)
      .fillRoundedRect(- barGeom.width / 2, -barGeom.height / 2, barGeom.width, barGeom.height, barGeom.height / 2)
      .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.maskGraphics);
    this.playerBar = this.scene.add.tileSprite(barGeom.centerX - lineWidth / 2, barGeom.centerY, 1, barGeom.height, `pixel-${this.playerColor}`).setDepth(4).setOrigin(0, 0.5);
    this.enemyBar = this.scene.add.tileSprite(barGeom.centerX + lineWidth / 2, barGeom.centerY, 1, barGeom.height, `pixel-${this.enemyColor}`).setDepth(4).setOrigin(1, 0.5);
    this.playerBar.setMask(mask);
    this.enemyBar.setMask(mask);
    const scale = barHeight / 50;

    this.star1 = this.scene.add.sprite(barGeom.left + this.getStarPoint(1), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6);
    this.star2 = this.scene.add.sprite(barGeom.left + this.getStarPoint(2), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6);
    this.star3 = this.scene.add.sprite(barGeom.left + this.getStarPoint(3), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6);

    this.scene.allElements.push(
      this.playerName,
      this.enemyName,
      this.playerBar,
      this.enemyBar,
    );

    this.timer = new Timer(this.scene, this.x, this.playerBar.getBottomCenter().y + 2, this.scene.gameScene.green.matchTime);
    this.timer.setFontSize(fontSize);
    this.scene.allElements.push(this.timer.minutes, this.timer.seconds, this.timer.colon);

    this.update();
  }
  
  public update(): void {
    const playerHexes: number = this.scene.gameScene.playerHexes().length
    const enemyHexes: number = this.scene.gameScene.enemyHexes().length
    const playerLineWidth = this.getLineWidth(playerHexes)
    const enemyLineWidth = this.getLineWidth(enemyHexes)

    this.checkStarsProgress(playerLineWidth);

    if (
      playerLineWidth !== this.playerBar.getBounds().width 
      || enemyLineWidth !== this.enemyBar.getBounds().width
    ) {
      this.playerBar.setDepth(4);
      this.enemyBar.setDepth(4);

      this.animation?.remove();
      this.animation = this.scene.tweens.add({
        onStart: (): void => {
          if (this.playerBar.getBounds().width < playerLineWidth) {
            this.enemyBar.setDepth(2)
          } else {
            this.playerBar.setDepth(2)
          }
        },
        targets: [ this.playerBar, this.enemyBar ],
        displayWidth: (target: Phaser.GameObjects.TileSprite): number => {
          if (target === this.playerBar) return playerLineWidth;
          if (target === this.enemyBar) return enemyLineWidth;
        },
        duration: 800,
        ease: 'Power2',
      })
    }
  }

  private getLineWidth(sum: number): number {
    const lineWidth = this.getBarWidth();
    const totalHexes = this.scene.gameScene.playerHexes().length + this.scene.gameScene.enemyHexes().length;
    const p = lineWidth / totalHexes;
    if (sum / totalHexes > 0.55) p * sum - 25;
    return p * sum;
  }

  private checkStarsProgress(width: number): void {
    const lineWidth = this.getBarWidth();
    if (width >= lineWidth - 1) {
      if (this.star1.texture.key !== 'lil-star') this.star1.setTexture('lil-star');
      if (this.star2.texture.key !== 'lil-star') this.star2.setTexture('lil-star');
      if (this.star3.texture.key !== 'lil-star') this.star3.setTexture('lil-star');
      if (this.scene.gameScene.gameIsOn) this.scene.gameScene.stars = 3;
    } else if (width >= this.getStarPoint(2)) {
      if (this.star1.texture.key !== 'lil-star') this.star1.setTexture('lil-star')
      if (this.star2.texture.key !== 'lil-star') this.star2.setTexture('lil-star')
      if (this.star3.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.scene.gameScene.gameIsOn) this.scene.gameScene.stars = 2;
    } else if (width >= this.getStarPoint(1)) {
      if (this.star1.texture.key !== 'lil-star') this.star1.setTexture('lil-star')
      if (this.star2.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.star3.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.scene.gameScene.gameIsOn) this.scene.gameScene.stars = 1;
    } else {
      if (this.star1.texture.key === 'lil-star') this.star1.setTexture('lil-star-dis');
      if (this.star2.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis');
      if (this.star3.texture.key === 'lil-star') this.star3.setTexture('lil-star-dis');
      if (this.scene.gameScene.gameIsOn) this.scene.gameScene.stars = 0;
    }
  }

  private getStarPoint(number: 1 | 2 | 3): number {
    const lineWidth = this.getBarWidth();
    if (number === 1) return lineWidth / 2;
    else if (number === 2) return lineWidth * 0.75;
    return lineWidth;
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.hideAndShowElementsOnTutorial();
  }

  public hideAndShowElementsOnTutorial(): void {
    if (this.scene.state.tutorial === 0) {
      this.playerName.setVisible(false);
      this.enemyName.setVisible(false);
      this.playerBar.setVisible(false);
      this.enemyBar.setVisible(false);
      this.timer.setVisible(false);
      this.star1.setVisible(false);
      this.star2.setVisible(false);
      this.star3.setVisible(false);
    } else if (this.scene.state.tutorial === 4) {
      this.playerName.setVisible(true);
      this.enemyName.setVisible(true);
      this.playerBar.setVisible(true);
      this.enemyBar.setVisible(true);
      this.timer.setVisible(true);
      this.star1.setVisible(true);
      this.star2.setVisible(true);
      this.star3.setVisible(true);
    }
  }

  public stopTimer(): void {
    this.timer.stop();
  }

  public resize(): void {
    const { fontSize, barHeight } = this.getSettings();
    const { centerX, width } = this.scene.cameras.main;

    const greenHexes: number = this.scene.gameScene?.hexes.filter(hex => hex.own === 'green').length;
    const redHexes: number = this.scene.gameScene?.hexes.filter(hex => hex.own === 'red').length;

    const lineWidth = this.getBarWidth();
    this.setDisplaySize(lineWidth, barHeight);

    this.playerName?.setPosition(width / 2 - width / 5, fontSize).setFontSize(fontSize).setCrop(0, 0, width / 5, 200);
    this.enemyName?.setPosition(width / 2 + width / 5, fontSize).setFontSize(fontSize).setCrop(0, 0, width / 5, 200);
    const barY = Utils.isVerticalOrientation() ? barHeight / 2 : this.playerName.getBounds().bottom + fontSize;
    this.setPosition(centerX, barY);

    const barGeom = this.getBounds();
    const scale = barHeight / 50;
    this.maskGraphics
      .setPosition(barGeom.centerX, barGeom.centerY)
      .clear()
      .fillStyle(0x00ff00)
      .fillRoundedRect(- barGeom.width / 2, - barGeom.height / 2, barGeom.width, barGeom.height, barGeom.height / 2);

    this.playerBar?.setPosition(barGeom.left, barGeom.centerY).setDisplaySize(this.getLineWidth(greenHexes), barGeom.height);
    this.enemyBar?.setPosition(barGeom.right, barGeom.centerY).setDisplaySize(this.getLineWidth(redHexes), barGeom.height);
    this.timer?.setFontSize(fontSize).setPosition(barGeom.centerX, barGeom.bottom + 2);

    this.star1?.setPosition(barGeom.left + this.getStarPoint(1), barGeom.centerY + 3).setScale(scale);
    this.star2?.setPosition(barGeom.left + this.getStarPoint(2), barGeom.centerY + 3).setScale(scale);
    this.star3?.setPosition(barGeom.left + this.getStarPoint(3), barGeom.centerY + 3).setScale(scale);

    if (Utils.isVerticalOrientation()) {
      if (this.playerBar.texture.key !== 'pixel') {
        const playerColor = this.playerColor === 'green' ? 0x00D750 : 0xF39946;
        const enemyColor = this.enemyColor === 'green' ? 0x00D750 : 0xF39946;
        this.playerBar.setTexture('pixel').setTint(playerColor).clearMask();
        this.enemyBar.setTexture('pixel').setTint(enemyColor).clearMask();
      }
      this.star1.setVisible(false);
      this.star2.setVisible(false);
      this.star3.setVisible(false);
      this.playerName.setVisible(false);
      this.enemyName.setVisible(false);
    } else if (this.playerBar.texture.key !== `pixel-${this.playerColor}`) {
      const mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.maskGraphics);
      this.playerBar.setTexture(`pixel-${this.playerColor}`).setTint(0xffffff).setMask(mask);
      this.enemyBar.setTexture(`pixel-${this.enemyColor}`).setTint(0xffffff).setMask(mask);
      this.star1.setVisible(true);
      this.star2.setVisible(true);
      this.star3.setVisible(true);
      this.playerName.setVisible(true);
      this.enemyName.setVisible(true);
    }
    this.update();
  }

  private getBarWidth(): number {
    if (!Utils.isVerticalOrientation()){
      return this.scene.camera.width / 2.5;
    }
    return this.scene.camera.width;
  }

  public getBarHeight(): number {
    const { barHeight } = this.getSettings();
    return barHeight;
  }
};
