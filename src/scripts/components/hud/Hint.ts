import Hud from "../../scenes/Hud";

export default class Hint extends Phaser.GameObjects.Text {
  public scene: Hud;
  private delay: number;
  private str: string;
  private timer: number;
  private timeEvent: Phaser.Time.TimerEvent;

  constructor(scene: Hud, text: string, color: string, timer?: number) {
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
    this.str = text;
    this.timer = timer;
    this.scene.hints.add(this);
    this.setOrigin(0.5, 0);
    this.delay = 4000;
    this.setAnimation();

    this.scene.hints.children.entries.forEach((el: Hint) => {
      el.scrollDown(this.displayHeight);
    });
    if (this.timer) {
      this.setText(`${this.str}: ${this.timer}`);
      this.timeEvent = this.scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (this.active) {
            this.timer -= 1;
            if (this.timer >= 0) {
              this.updateTimer();
            } else {
              this.timeEvent.remove();
            }
          } else {
            this.timeEvent.remove();
          } 
        }
      });
    }
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

  private updateTimer(): void {
    this.setText(`${this.str}: ${this.timer}`);
  }
}