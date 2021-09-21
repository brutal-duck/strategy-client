import Game from "../scenes/Game";

export default class Hex extends Phaser.GameObjects.Sprite {
  
  public scene: Game
  public x: number
  public y: number
  public row: number
  public col: number
  public sprite: string

  public id: string
  public own: string
  public class: string
  public color: string
  public nearby: {
    top: string
    topRight: string
    botRight: string
    bot: string
    botLeft: string
    topLeft: string
  }

  
  constructor(scene: Game, x: number, y: number, row: number, col: number, sprite: string = 'hex') {
    super(scene , x, y, sprite)
    this.scene = scene
    this.x = x
    this.y = y
    this.row = row
    this.col = col
    this.sprite = sprite
    this.init()
  }


  private init(): void {
    this.id = `${this.col}-${this.row}`
    this.own = 'neutral'
    this.class = ''
    this.color = 'white'
    this.nearby = {
      top: `${this.col}-${this.row - 1}`,
      topRight: this.col % 2 === 0 ? `${this.col + 1}-${this.row - 1}` : `${this.col + 1}-${this.row}`,
      botRight: this.col % 2 === 0 ? `${this.col + 1}-${this.row}` : `${this.col + 1}-${this.row + 1}`,
      bot: `${this.col}-${this.row + 1}`,
      topLeft: this.col % 2 === 0 ? `${this.col - 1}-${this.row - 1}` : `${this.col - 1}-${this.row}`,
      botLeft: this.col % 2 === 0 ? `${this.col - 1}-${this.row}` : `${this.col - 1}-${this.row + 1}`,
    }
    this.create()
  }


  private create(): void {
    this.scene.add.existing(this)

    const w = this.scene.hexWidth
    const h = this.scene.hexHeight
    const vectors = [
      w/4, 0,
      w*0.75, 0,
      w, h/2,
      w*0.75, h,
      w/4, h,
      0, h/2
    ]

    // @ts-ignore
    const hitArea: Phaser.Geom.Polygon = new Phaser.Geom.Polygon(vectors)
    this.setDepth(1).setOrigin(0).setInteractive(hitArea, Phaser.Geom.Polygon.Contains)

    if (this.scene.debuging) this.debug()
  }


  public clame(color: string) {
    this.setColor(color)
  }


  public click(): void {
    this.setColor('gray')
  }

  /**
   * Установка цвета
   * @param color [ white / gray / red / blue ]
   * @returns Hex
   */
  public setColor(color: string): this {
    const colors = {
      gray: 0xAAADAF,
      red: 0xD80000,
      blue: 0x3E3BD6,
    }

    if (color === 'white') {
      this.clearTint()
      this.color = 'white'
    } else if (color[0] !== '#') {
      this.setTint(colors[color])
      this.color = color
    } else return this

    return this
  }


  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y, `col:  ${this.col}\nrow:  ${this.row}`, { font: '14px Colus', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(10)
  }
}