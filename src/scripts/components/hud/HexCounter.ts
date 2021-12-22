import Hud from '../../scenes/Hud';
import Utils from './../../utils/Utils';

const HEX_COUNT_DISPLAY_PECENT = 5;
const ICONS_DISPLAY_PERCENT = 5;

export default class HexCounter extends Phaser.GameObjects.Sprite {
  public scene: Hud;
  private playerColor: string;
  private enemyColor: string;
  private hexIcon: Phaser.GameObjects.Sprite;
  private superHexIcon: Phaser.GameObjects.Sprite;
  private hexText: Phaser.GameObjects.Text;
  private superHexText: Phaser.GameObjects.Text;
  private incAnimationHex: Phaser.Tweens.Tween;
  private incAnimationSuperHex: Phaser.Tweens.Tween;

  constructor(scene: Hud) {
    super(scene, 0, 0, 'pixel');
    this.scene.add.existing(this);

    this.playerColor = this.scene.gameScene.player.color;
    this.enemyColor = this.scene.gameScene.player.color === 'red' ? 'green' : 'red';

    this.create();
  }

  private create(): void {
    const { fontSize, iconsHeight } = this.getSettings();

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: fontSize + 'px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 1,
    };

    const scale = iconsHeight / 50;
    const player: Iconfig = this.scene.gameScene[this.playerColor];
    this.hexIcon = this.scene.add.sprite(iconsHeight, iconsHeight, 'hex').setScale(scale * 0.6);
    const hexBarGeom = this.hexIcon.getBounds();
    this.hexText = this.scene.add.text(hexBarGeom.right, hexBarGeom.centerY, String(player.hexes), textStyle).setOrigin(0, 0.5);

    this.superHexIcon = this.scene.add.sprite(hexBarGeom.centerX, hexBarGeom.bottom + iconsHeight, 'super-hex').setScale(scale * 0.6);
    const superGeom = this.superHexIcon.getBounds();
    this.superHexText = this.scene.add.text(superGeom.right, superGeom.centerY, String(player.superHex), textStyle).setOrigin(0, 0.5).setStroke('#97759E', 1);

    this.scene.allElements.push(this.hexIcon, this.hexText, this.superHexIcon, this.superHexText);
  }

  private getSettings(): { fontSize: number, iconsHeight: number } {
    const fontSize = Math.round(document.body.clientHeight / 100 * HEX_COUNT_DISPLAY_PECENT);
    const iconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    return { fontSize, iconsHeight };
  }

  public getHexIconPosition(): Phaser.Geom.Rectangle {
    return this.hexIcon.getBounds();
  }

  public getSuperHexIconPosition(): Phaser.Geom.Rectangle {
    return this.superHexIcon.getBounds();
  }

  public update(): void {
    if (Number(this.hexText.text) < this.scene.gameScene[this.playerColor].hexes) {
      this.setIncAnimHex('+');
    } else if (Number(this.hexText.text) > this.scene.gameScene[this.playerColor].hexes) {
      this.setIncAnimHex('-');
    }

    if (Number(this.superHexText.text) < this.scene.gameScene[this.playerColor].superHex) {
      this.setIncAnimSuperHex('+');
    } else if (Number(this.superHexText.text) > this.scene.gameScene[this.playerColor].superHex) {
      this.setIncAnimSuperHex('-');
    }
    this.hexText.setText(`${this.scene.gameScene[this.playerColor].hexes}`)
    this.superHexText.setText(`${this.scene.gameScene[this.playerColor].superHex}`)
  }

  
  private setIncAnimHex(sign: string): void {
    if (this.incAnimationHex) return;
    this.incAnimationHex = this.scene.tweens.add({
      targets: this.hexIcon,
      duration: 150,
      tint: {from: 0xffffff, to: sign === '-' ? 0xff0000 : 0xffffff},
      scale: `${sign}= 0.1`,
      yoyo: true,
      onComplete: () => {
        this.incAnimationHex = null;
      }
    });
  }

  private setIncAnimSuperHex(sign: string): void {
    if (this.incAnimationSuperHex) return;
    this.incAnimationSuperHex = this.scene.tweens.add({
      targets: this.superHexIcon,
      duration: 150,
      tint: {from: 0xffffff, to: sign === '-' ? 0xff0000 : 0xffffff},
      scale: `${sign}= 0.1`,
      yoyo: true,
      onComplete: () => {
        this.incAnimationSuperHex = null;
      }
    });
  }

  public resize(): void {
    const curCountFontSize = Math.round(document.body.clientHeight / 100 * HEX_COUNT_DISPLAY_PECENT);
    const currentIconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    const iconsScale = currentIconsHeight / 40;

    let y = currentIconsHeight;
    if (Utils.isMobilePlatform()) y += this.scene.statusBar.getBarHeight();
    this.hexIcon?.setPosition(currentIconsHeight, y).setScale(0.6 * iconsScale);
    this.hexText?.setPosition(this.hexIcon.getBounds().right, this.hexIcon.getBounds().centerY).setFontSize(curCountFontSize);
    this.superHexIcon?.setPosition(this.hexIcon.getBounds().centerX, this.hexIcon.getBounds().bottom + currentIconsHeight).setScale(0.6 * iconsScale);
    this.superHexText?.setPosition(this.superHexIcon.getBounds().right, this.superHexIcon.getBounds().centerY).setFontSize(curCountFontSize);
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.scene.state.tutorial === 0) {
      this.hexIcon.setVisible(false);
      this.hexText.setVisible(false);
      this.superHexText.setVisible(false);
      this.superHexIcon.setVisible(false);
    } else if (this.scene.state.tutorial === 1) {
      this.hexIcon.setVisible(true);
      this.hexText.setVisible(true);
    } else if (this.scene.state.tutorial === 3) {
      this.superHexIcon.setVisible(true);
      this.superHexText.setVisible(true);
    }
  }

  public getScale(): number {
    return this.hexIcon.scale;
  }
};
