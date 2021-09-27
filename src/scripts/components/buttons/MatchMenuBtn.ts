import Hud from "../../scenes/Hud"
import Modal from "../../scenes/Modal"

export default class MatchMenuBtn {
  public scene: Hud | Modal
  public x: number
  public y: number

  public border: Phaser.GameObjects.Sprite
  public mid: Phaser.GameObjects.TileSprite
  public text: Phaser.GameObjects.Text

  private elements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>

  constructor(scene: Hud | Modal, x: number, y: number) {
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
    this.border = this.scene.add.sprite(this.x, this.y, 'border-1').setTint(0x909090).setDepth(2).setInteractive()
    this.mid = this.scene.add.tileSprite(this.border.getCenter().x, this.border.getCenter().y, this.border.getBounds().width - 8, this.border.getBounds().height - 8, 'pixel').setTint(0xc8c8c8)
    this.text = this.scene.add.text(this.border.getCenter().x, this.border.getCenter().y, this.scene.lang.menu, { font: '18px Molot', color: 'black' }).setOrigin(0.5)
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

  public setScale(x: number, y: number): this {
    this.border.setScale(x, y)
    this.mid.setPosition(this.border.getCenter().x, this.border.getCenter().y).setSize(this.border.getBounds().width - 8, this.border.getBounds().height - 8)
    this.text.setPosition(this.border.getCenter().x, this.border.getCenter().y)
    return this
  }

  public setText(text: string): this {
    this.text.setText(text)
    return this
  }

  public setFontSize(size: number): this {
    this.text.setFontSize(size)
    return this
  }
}