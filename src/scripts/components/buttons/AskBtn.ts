import Modal from "../../scenes/Modal"

export default class AskBtn {
  public scene: Modal
  public x: number
  public y: number
  public title: string
  public texture: boolean

  public border: Phaser.GameObjects.Sprite
  public mid: Phaser.GameObjects.TileSprite
  public text: Phaser.GameObjects.Text
  public sprite: Phaser.GameObjects.Sprite

  public elements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>

  constructor(scene: Modal, x: number, y: number, title: string, texture: boolean = false) {
    this.scene = scene
    this.x = x
    this.y = y
    this.title = title
    this.texture = texture
    this.init()
  }

  public init(): void {
    this.elements = []
    this.create()
  }

  public create(): void {
    const depth = 10000

    this.border = this.scene.add.sprite(this.x, this.y, 'border-1').setTint(0x909090).setScale(1).setDepth(2).setInteractive()
    this.mid = this.scene.add.tileSprite(this.border.getCenter().x, this.border.getCenter().y, this.border.getBounds().width - 8, this.border.getBounds().height - 8, 'pixel').setTint(0xc8c8c8)
    this.text = this.scene.add.text(this.border.getCenter().x - (this.texture ? 20 : 0), this.border.getCenter().y, this.title, { font: '22px Molot', color: 'black' }).setOrigin(0.5).setDepth(3)
    if (this.texture) {
      const cost: Phaser.GameObjects.Text = this.scene.add.text(this.text.getRightCenter().x + 2, this.text.getRightCenter().y, '-1', {
        font: '18px Molot', color: '#bc2626'
      }).setOrigin(0, 0.5).setStroke('black', 4).setDepth(3)
      this.sprite = this.scene.add.sprite(cost.getRightCenter().x + 4, cost.getRightCenter().y, 'hex').setOrigin(0, 0.5).setScale(0.19).setTint(0xb879ff).setDepth(3)
      const bg  = this.scene.add.sprite(this.sprite.getCenter().x, this.sprite.getCenter().y, 'hex').setTint(0x000000).setScale(this.sprite.scale + 0.04).setDepth(2)

      this.elements.push(cost, this.sprite, bg)
      // const textElements = [ this.text, cost, this.sprite, bg ]
      // textElements.forEach(el => el.setX(el.x - this.sprite.getBounds().width / 2))
    }

    this.elements.push(this.border, this.mid, this.text)
  }


  public setPosition(x: number, y: number): this {
    this.border.setPosition(x, y)
    this.elements.forEach(el => { if (el !== this.border) el.setPosition(this.border.getCenter().x, this.border.getCenter().y) })
    return this
  }


  public setOrigin(x: number, y?: number): this {
    this.elements.forEach(el => {
      if (el === this.border) this.border.setOrigin(x, y)
      else el.setPosition(this.border.getCenter().x, this.border.getCenter().y)
    })
    return this
  }

  public setAlpha(alpha): this {
    this.elements.forEach(el => el.setAlpha(alpha))
    return this
  }
}