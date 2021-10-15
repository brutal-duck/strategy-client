import Game from "../scenes/Game";

export default class FlyAwayMsg {
  public scene: Game
  public x: number
  public y: number
  public text: string
  public color: string
  public sprite: string
  public lifeTime: number

  public msg: Phaser.GameObjects.Text
  public hex: Phaser.GameObjects.Sprite
  private colors: { red: string, yellow: string, green: string }
  private tint: { green: number, red: number, purple: number }

  /**
   * 
   * @param scene сцена
   * @param x x
   * @param y y
   * @param text текст
   * @param color red / yellow / green
   * @param sprite red / blue / purple / другой
   * @param lifeTime время жизни
   */
  constructor(scene: Game, x: number, y: number, text: string, color: string, sprite?: string, lifeTime?: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.sprite = sprite;
    this.lifeTime = lifeTime;
    
    this.init();
  }


  private init(): void {
    this.colors = { red: '#ce4941', yellow: '#dfe13b', green: '#5b9ef0' }
    this.tint = { green: 0x95ffa4, red: 0xffe595, purple: 0xb879ff }
    this.create()
  }

  private create(): void {
    const targets: Array<Phaser.GameObjects.Text | Phaser.GameObjects.Sprite> = [];
    const depth = 10000;

    const msgStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot', 
      fontSize: '16px',
      align: 'center', 
      color: this.colors[this.color], 
      wordWrap: { width: 120 },
    };

    if (this.text) {
      this.msg = this.scene.add.text(this.x, this.y, this.text, msgStyle).setOrigin(0.5).setDepth(depth)
      if (this.msg.width > 100) this.msg.setFontSize(12)
      targets.push(this.msg)
    };


    if (this.sprite) {
      let texture = this.tint[this.sprite] ? 'hex' : this.sprite;
      if (this.sprite === 'purple') texture = 'super-hex';
      const x = this.text ? this.msg.getRightCenter().x + 5 : this.x;
      const y = this.text ? this.msg.getRightCenter().y : this.y;
      this.hex = this.scene.add.sprite(x, y, texture).setOrigin(0, 0.5).setScale(0.19).setDepth(depth);
      targets.push(this.hex);
      targets.forEach(el => el.setX(el.x - this.hex.getBounds().width / 2));
    }

    const ani: Phaser.Tweens.Tween = this.scene.tweens.add({
      targets,
      y: { value: '-=40', duration: 600, ease: 'Power3' },
      alpha: { value: 0, duration: 200, delay: this.lifeTime || 600, ease: 'Power0' },
      onComplete: (): void => {
        targets.forEach(el => el.destroy());
        ani.remove();
      },
    });
  }
}