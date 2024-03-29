import Button from "./Button";

export default class ExitBtn extends Button {
  constructor(scene: Phaser.Scene, position: Iposition, action: () => void) {
    super(scene, position, action);
    this.createSprite();
    this.setClickListener();
  }

  private createSprite() {
    this.mainSprite = this.scene.add.sprite(this.position.x, this.position.y, 'exit-btn');
  }
}