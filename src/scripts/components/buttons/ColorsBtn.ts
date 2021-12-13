import Button from "./Button";
import Modal from './../../scenes/Modal';
import Tutorial from './../../scenes/Tutorial';

export default class ColorsBtn extends Button {
  private color: string;
  private text: string;
  private icon: boolean;
  private text1: Phaser.GameObjects.Text
  private text2: Phaser.GameObjects.Text
  private iconSprite: Phaser.GameObjects.Sprite
  public scene: Modal | Tutorial;
  constructor(scene: Modal | Tutorial, position: Iposition, action: () => void, settings: IcolorsBtnSettings) {
    super(scene, position, action);
    this.color = settings.color;
    this.text = settings.text;
    this.icon = settings.icon;
    this.createChildrens();
    this.setClickListener();
  }

  private createChildrens(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '25px',
      fontFamily: 'Molot',
      color: '#F0FDDA',
      shadow: {
        offsetX: 1,
        offsetY: 1, 
        color: '#96580e',
        blur: 2,
        fill: true,
      },
      wordWrap: { width: 120 },
    };

    this.mainSprite = this.scene.add.sprite(this.x, this.y, `btn-${this.color}`);
    if (!this.icon) {
      this.text1 = this.scene.add.text(this.x, this.y, this.text, textStyle).setOrigin(0.5);
      this.add(this.text1);
    } else {
      this.text1 = this.scene.add.text(0, this.y, this.text, textStyle).setOrigin(0, 0.5);
      this.text2 = this.scene.add.text(0, this.y, '-1', textStyle).setOrigin(0, 0.5).setColor('#FF7464').setFontSize(20);
      this.iconSprite = this.scene.add.sprite(0, this.y + 1, 'super-hex').setOrigin(0, 0.5).setScale(0.19);

      const width = this.text1.displayWidth + this.text2.displayWidth + this.iconSprite.displayWidth;

      this.text1.setX(this.x - width / 2);
      this.text2.setX(this.text1.getBounds().right + 2);
      this.iconSprite.setX(this.text2.getBounds().right + 2);

      this.add(this.text1);
      this.add(this.text2);
      this.add(this.iconSprite);
    }
  }

  public setPosition(x: number, y: number): this {
    if (this.icon) {
      const width = this.text1.displayWidth + this.text2.displayWidth + this.iconSprite.displayWidth;

      this.text1.setX(x - width / 2);
      this.text2.setX(this.text1.getBounds().right + 2);
      this.iconSprite.setX(this.text2.getBounds().right + 2);
      this.text1.setY(y);
      this.text2.setY(y);
      this.iconSprite.setY(y);
    } else {
      this.text1.setX(x);
      this.text1.setY(y);
    }
    this.mainSprite.setPosition(x, y);
    return this;
  }
}