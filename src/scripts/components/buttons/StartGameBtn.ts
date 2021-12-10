import Button from "./Button";

export default class StartGameBtn extends Button {
  private str: string;
  private text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, position: Iposition, action: () => void, text: string) {
    super(scene, position, action);
    this.str = text;
    this.createChildrens();
    this.setClickListener();
  }
  
  private createChildrens(): void {
    const fontStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '55px',
      fontFamily: 'Molot',
      color: '#EEFDBF',
      shadow: {
        offsetX: 1,
        offsetY: 1, 
        color: '#96580e',
        blur: 2,
        fill: true,
      },
    };

    this.mainSprite = this.scene.add.sprite(this.x, this.y, 'start-game-btn').setScale(0.9);
    this.text = this.scene.add.text(this.x, this.y - 5, this.str, fontStyle).setOrigin(0.3, 0.5);
    this.add(this.text);
  }

  public setText(text: string): void {
    this.text.setText(text);
  }

  public removeInteractive(): void {
    this.mainSprite.removeInteractive();
  }

  public setScale(scale: number, fontSize?: number): this {
    super.setScale(scale);
    this.text.setFontSize(fontSize);
    this.text.setX(this.x);
    return this;
  }

  public setVisible(visible: boolean): this {
    super.setVisible(visible);
    this.text.setVisible(visible);
    return this;
  }
};
