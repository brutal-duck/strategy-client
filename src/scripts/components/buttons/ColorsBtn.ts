import Button from "./Button";
import Modal from './../../scenes/Modal';

export default class ColorsBtn extends Button {
  private color: string;
  private text: string;
  private icon: boolean;
  public scene: Modal;
  constructor(scene: Modal, position: Iposition, action: () => void, settings: IcolorsBtnSettings) {
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
      const text = this.scene.add.text(this.x, this.y, this.text, textStyle).setOrigin(0.5);
      this.add(text);
    } else {
      const text1 = this.scene.add.text(0, this.y, this.text, textStyle).setOrigin(0, 0.5);
      const text2 = this.scene.add.text(0, this.y, '-1', textStyle).setOrigin(0, 0.5).setColor('#FF7464').setFontSize(20);
      const icon = this.scene.add.sprite(0, this.y + 1, 'super-hex').setOrigin(0, 0.5).setScale(0.19);

      const width = text1.displayWidth + text2.displayWidth + icon.displayWidth;

      text1.setX(this.x - width / 2);
      text2.setX(text1.getBounds().right + 2);
      icon.setX(text2.getBounds().right + 2);

      this.add(text1);
      this.add(text2);
      this.add(icon);
    }
  }
}