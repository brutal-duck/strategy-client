import Button from "./Button";
import Modal from './../../scenes/Modal';

export default class MenuBtn extends Button {
  private visibility: boolean;
  public scene: Modal;
  constructor(scene: Phaser.Scene, position: Iposition, action: () => void, type: string = 'settings', visible: boolean = true) {
    super(scene, position, action);
    this.type = type;
    this.visibility = visible;
    this.createChildrens();
    this.setClickListener();
  }
  
  private createChildrens(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '25px',
      fontFamily: 'Molot',
      color: '#F0FDDA',
      align: 'center',
      shadow: {
        offsetX: 1,
        offsetY: 1, 
        color: '#96580e',
        blur: 2,
        fill: true,
      },
      wordWrap: { width: 120 },
    };
    if (this.type === 'escape') textStyle.color = '#EDB0AD';
    

    this.mainSprite = this.scene.add.sprite(this.x, this.y, `btn-${this.type}`).setAlpha(this.visibility ? 1 : 0);
    const text = this.scene.add.text(this.x + 10, this.y - 3, this.scene.lang[`${this.type}Btn`], textStyle).setAlpha(this.visibility ? 1 : 0).setOrigin(0.5);
    this.add(text);
  }
  
}