import Hud from "../../scenes/Hud";

export default class Hint extends Phaser.GameObjects.Text {
  public scene: Hud;
  private delay: number;

  constructor(scene: Hud, text: string, color: string) {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: color,
      fontSize: '20px',
      fontFamily: 'Molot',
      align: 'center',
      wordWrap: { width: scene.cameras.main.width - 20 },
      stroke: '#000000',
      strokeThickness: 1,
    };
    super(scene, scene.cameras.main.centerX, scene.statusBar.timer.getBounds().bottom, text, style);
    this.scene.add.existing(this);
    this.scene.hints.add(this);
    this.setOrigin(0.5, 0);
    this.delay = 4000;
    this.setAnimation();

    this.scene.hints.children.entries.forEach((el: Hint) => {
      el.scrollDown(this.displayHeight);
    }); 
  }

  private setAnimation(): void {
    this.scene.add.tween({
      delay: this.delay,
      targets: this,
      duration: 500,
      alpha: 0,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  public scrollDown(value: number): void {
    this.scene?.tweens.add({
      targets: this,
      y: `+=${value}`,
      duration: 400,
      onCompleteParams: this,
    });
  }
}