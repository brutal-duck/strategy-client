import Hud from './../../scenes/Hud';

type WarnLog = { x: number, y: number, id: string };

export default class WarningPlate extends Phaser.GameObjects.Sprite {
  public scene: Hud;
  private bg: Phaser.GameObjects.Sprite;
  private icon: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.Text;
  private animation: Phaser.Tweens.Tween;
  private logs: WarnLog[];
  private createAnimation: Phaser.Tweens.Tween;

  constructor(scene: Hud) {
    super(scene, 0, 0, 'pixel');
    this.scene.add.existing(this);
    this.logs = [];
    this.create();
  }

  private create(): void {
    const { width } = this.scene.cameras.main;
    this.bg = this.scene.add.sprite(width - 6, this.scene.menuBtn.getBounds().bottom + 10, 'block').setOrigin(1, 0).setTint(0x000000).setAlpha(0).setDisplaySize(180, 30).setInteractive()
    this.icon = this.scene.add.sprite(this.bg.getLeftCenter().x + 6, this.bg.getLeftCenter().y, 'warning').setOrigin(0, 0.5).setScale(0.3).setAlpha(0)
    this.text = this.scene.add.text(this.icon.getRightCenter().x + 6, this.icon.getRightCenter().y, '', {
      font: '14px Molot', color: '#d8ae1c'
    }).setOrigin(0, 0.5).setStroke('#a65600', 1).setAlpha(0)

    this.bg.on('pointerup', (): void => {
      if (this.logs.length > 0) {
        const { x, y } = this.logs.pop();
        this.scene.gameScene.centerCamera(x, y, false, 1000);

        if (this.logs.length > 0) {
          this.text.setText(`${this.scene.lang.underAtack} (${this.logs.length})`)
          this.warnFadeIn()
        } else {
          this.hideElements();
          this.animation?.remove();
        }
      }
    })

    this.scene.allElements.push(this.bg, this.icon, this.text);
  }

  private hideElements(): void {
    this.bg.setAlpha(0);
    this.icon.setAlpha(0);
    this.text.setAlpha(0);
  }

  private showElements(): void {
    this.bg.setAlpha(0.4);
    this.icon.setAlpha(1);
    this.text.setAlpha(1);
  }

  private warnFadeIn(): void {
    this.animation?.remove();
    this.animation = this.scene.tweens.add({
      targets: [this.bg, this.icon, this.text],
      alpha: 0,
      duration: 500,
      delay: 7000,
      onComplete: (): void => { this.logs = [] },
    });
  }

  public setWarning(x: number, y: number, id: string): void {
    this.logs.push({ x, y, id });
    this.showElements();
    this.text.setText(`${this.scene.lang.underAtack} (${this.logs.length})`);
    if (this.logs.length === 1) {
      this.bg.x += 200;
      this.icon.x += 200;
      this.text.x += 200;
      this.createAnimation = this.scene.tweens.add({
        targets: [this.bg, this.icon, this.text],
        x: '-=200',
        duration: 300,
      });
    }

    this.warnFadeIn();
  }

  public resize(): void {
    this.bg?.setPosition(this.scene.cameras.main.width - 6, 30);
    this.icon?.setPosition(this.bg.getLeftCenter().x + 6, this.bg.getLeftCenter().y);
    this.text?.setPosition(this.icon.getRightCenter().x + 6, this.icon.getRightCenter().y);
  }
}