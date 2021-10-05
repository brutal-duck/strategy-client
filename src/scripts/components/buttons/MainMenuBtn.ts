import MainMenu from "../../scenes/MainMenu"

export default class MainMenuBtn {
  public scene: MainMenu
  public x: number
  public y: number

  public border: Phaser.GameObjects.Sprite
  public mid: Phaser.GameObjects.TileSprite
  public text: Phaser.GameObjects.Text

  public elements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>

  constructor(scene: MainMenu, x: number, y: number) {
    this.scene = scene
    this.x = x
    this.y = y
    this.init()
  }

  public init(): void {
    this.elements = []
    this.create()
  }

  public create(): void {
    this.border = this.scene.add.sprite(this.x, this.y, 'border-1').setTint(0x909090).setScale(2).setDepth(2).setInteractive()
    this.mid = this.scene.add.tileSprite(this.border.getCenter().x, this.border.getCenter().y, this.border.getBounds().width - 8, this.border.getBounds().height - 8, 'pixel').setTint(0xc8c8c8)
    this.text = this.scene.add.text(this.border.getCenter().x, this.border.getCenter().y, this.scene.lang.play, { font: '24px Molot', color: 'black' }).setOrigin(0.5)
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