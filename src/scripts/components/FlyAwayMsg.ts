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
  private tint: { red: string, blue: string, purple: string }

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
    this.scene = scene
    this.x = x
    this.y = y
    this.text = text
    this.color = color
    this.sprite = sprite
    this.lifeTime = lifeTime
    
    this.init()
  }


  private init(): void {
    this.colors = { red: '#bc2626', yellow: '#dfe13b', green: '#5ee13b' }
    this.tint = { red: '0xD68780', blue: '0x909CD1', purple: '0xb879ff' }
    this.create()
  }

  private create(): void {
    const targets: Array<Phaser.GameObjects.Text | Phaser.GameObjects.Sprite> = []
    const depth = 10000

    if (this.text) {
      this.msg = this.scene.add.text(this.x, this.y, this.text, {
        font: '16px Molot', align: 'center', color: this.colors[this.color], wordWrap: { width: 120 }
      }).setOrigin(0.5).setDepth(depth).setStroke('black', 4)
      if (this.msg.width > 100) this.msg.setFontSize(12)
      targets.push(this.msg)
    }


    if (this.sprite) {
      const texture = this.tint[this.sprite] ? 'hex' : this.sprite
      const x = this.text ? this.msg.getRightCenter().x + 5 : this.x
      const y = this.text ? this.msg.getRightCenter().y : this.y
      this.hex = this.scene.add.sprite(x, y, texture).setOrigin(0, 0.5).setScale(0.19).setDepth(depth)
      const bg  = this.scene.add.sprite(this.hex.getCenter().x, this.hex.getCenter().y, texture).setTint(0x000000).setScale(this.hex.scale + 0.04).setDepth(depth - 1)
      if (texture === 'hex') this.hex.setTint(this.tint[this.sprite])
      targets.push(this.hex, bg)
      targets.forEach(el => el.setX(el.x - this.hex.getBounds().width / 2))
    }

    const ani: Phaser.Tweens.Tween = this.scene.tweens.add({
      targets,
      y: { value: '-=40', duration: 600, ease: 'Power3' },
      alpha: { value: 0, duration: 200, delay: this.lifeTime || 600, ease: 'Power0' },
      onComplete: (): void => {
        targets.forEach(el => el.destroy())
        ani.remove()
      }
    })
  }
}