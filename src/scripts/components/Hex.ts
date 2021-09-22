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
  public class: string // '' / base / x1 / x3 / tower / water / rock
  public color: string
  public fog: boolean
  public tile: Phaser.GameObjects.Sprite
  public landscape: boolean
  // public claming: boolean
  private clamingAni: Phaser.Tweens.Tween
  public nearby: {
    top: string
    topRight: string
    botRight: string
    bot: string
    botLeft: string
    topLeft: string
  }

  
  constructor(scene: Game, x: number, y: number, row: number, col: number, sprite: string = 'hex') {
    super(scene, x, y, sprite)
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
    // this.claming = false
    this.landscape = false
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
    this.setDepth(1).setOrigin(0).setInteractive(hitArea, Phaser.Geom.Polygon.Contains).setFog()

    if (this.scene.debuging) this.debug()
  }


  public setClaming(color: string) {
    const bgColor = color === 'red' ? 0xD68780 : 0x909CD1
    const lineColor = color === 'red' ? 0xD80000 : 0x3E3BD6

    const lineBg: Phaser.GameObjects.TileSprite = this.scene.add.tileSprite(this.getCenter().x, this.getCenter().y - 22, 50, 5, 'pixel').setTint(bgColor).setDepth(this.depth + 2)
    const line: Phaser.GameObjects.TileSprite = this.scene.add.tileSprite(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(this.depth + 2)
    // this.claming = true

    this.clamingAni?.remove()
    this.clamingAni = this.scene.tweens.add({
      targets: line,
      width: lineBg.width,
      duration: this.scene.player1Config.clameTime,
      onComplete: (): void => {
        this.clame(color)
        this.scene.multiClameCheck(color)
        this.scene.hud.updateWorldStatusBar()

        // this.claming = false
        lineBg.destroy()
        line.destroy()
      }
    })
  }

  public clame(color: string) {
    this.setColor(color)
    this.own = color
    Object.values(this.nearby).forEach(id => {
      const hex = this.scene.getHexByID(id)
      if (hex.fog) hex?.removeFog()
      Object.values(hex.nearby).forEach(lvlPlusId => {
        const lvlPlusHex = this.scene.getHexByID(lvlPlusId)
        if (lvlPlusHex?.fog) lvlPlusHex.removeFog()
      })
    })
  }


  public setClass(newClass?: string, color?: string): this {
    this.class = newClass

    if (newClass === 'base') {
      this.setColor(color)
      this.own = color
    } else {
      if (newClass === 'rock' || newClass === 'water') this.landscape = true
      this.setColor(newClass)
    }

    this.scene.add.text(this.getCenter().x, this.getCenter().y + 10, newClass, { font: '17px Colus', color: 'black' }).setOrigin(0.5, 0).setDepth(10)
    return this
  }


  public setFog(): this {
    this.tile = this.scene.add.sprite(this.getCenter().x, this.getCenter().y - 6, 'hex').setAlpha(0.7).setDepth(this.depth + 1).setTint(0xAAADAF)
    this.fog = true
    return this
  }

  public removeFog(layerPlus?): this {
    this.tile?.destroy()
    this.fog = false

    if (layerPlus) {
      Object.values(this.nearby).forEach(id => {
        const hex = this.scene.getHexByID(id)
        if (hex.fog) hex.removeFog()
      })
    }

    return this
  }

  /**
   * Установка цвета
   * @param color [ white / gray / rock / x1 / x3 / water / red / blue ]
   * @returns Hex
   */
  public setColor(color: string): this {
    const colors = {
      gray: 0xAAADAF,
      rock: 0x333333,
      x1: 0x91ff96,
      x3: 0xffdc73,
      super: 0xa785ff,
      water: 0x80d4ff,
      red: 0xD80000,
      blue: 0x3E3BD6,
    }

    if (color === 'white') this.clearTint()
    else this.setTint(colors[color])

    this.color = color
    return this
  }


  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y - 6, `col:  ${this.col}\nrow:  ${this.row}`, { font: '14px Colus', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(10)
  }
}