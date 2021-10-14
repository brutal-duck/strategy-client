import Button from "./Button";

export default class SandwichBtn extends Button {
  constructor(scene: Phaser.Scene, position: Iposition, action: () => void) {
    super(scene, position, action);
    this.createSprite();
    this.setClickListener();
  }

  private createSprite() {
    this.mainSprite = this.scene.add.sprite(this.position.x, this.position.y, 'menu-btn');
  }
}