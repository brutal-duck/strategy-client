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
  public color: string

  
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
    this.id = `${this.row}-${this.col}`
    this.own = 'neutral'
    this.color = 'white'
    this.create()
  }


  private create(): void {
    this.scene.add.existing(this)

    const vectors = [
      25, 0,
      75, 0,
      100, 50,
      75, 100,
      25, 100,
      0, 50
    ]

    // @ts-ignore
    const hitArea: Phaser.Geom.Polygon = new Phaser.Geom.Polygon(vectors)
    this.setDepth(1).setOrigin(0).setInteractive(hitArea, Phaser.Geom.Polygon.Contains)

    if (this.scene.debuging) this.debug()
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
    } else if (typeof color === 'string' && color[0] !== '#') {
      this.setTint(colors[color])
      this.color = color
    } else return this

    return this
  }


  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y, `row:  ${this.row}\ncol:  ${this.col}`, { font: '14px Colus', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(10)
  }
}