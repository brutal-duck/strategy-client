import Game from "../scenes/Game";
import FlyAwayMsg from "./FlyAwayMsg";

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
  public clamingAni: Phaser.Tweens.Tween
  private productionTimer: Phaser.Time.TimerEvent
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

    // if (this.scene.debuging) this.debug()
  }


  public setClearClame(color: string) {
    const lineColor = color === 'red' ? 0xD68780 : 0x909CD1
    const line: Phaser.GameObjects.TileSprite = this.scene.add.tileSprite(this.getCenter().x - 25, this.getCenter().y, 50, 5, 'pixel').setOrigin(0, 0.5).setTint(lineColor).setDepth(this.depth + 2)
    // this.claming = true
    this.scene.claming.push(this.id)

    new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y + 20, '', 'yellow', 'warning', 7000)
    this.scene.hud.setWarning(this.getCenter().x, this.getCenter().y, this.id)

    this.clamingAni?.remove()
    this.clamingAni = this.scene.tweens.add({
      targets: line,
      width: 1,
      duration: this.scene.red.clameTime,
      onComplete: (): void => {
        this.productionTimer?.remove()
        line.destroy()
        this.setColor('white')
        this.setClaming(color)
      }
    })
  }


  public setClaming(color: string) {
    const bgColor = color === 'red' ? 0xD68780 : 0x909CD1
    const lineColor = color === 'red' ? 0xD80000 : 0x3E3BD6

    const lineBg: Phaser.GameObjects.TileSprite = this.scene.add.tileSprite(this.getCenter().x, this.getCenter().y, 50, 5, 'pixel').setTint(bgColor).setDepth(this.depth + 2)
    const line: Phaser.GameObjects.TileSprite = this.scene.add.tileSprite(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(this.depth + 2)
    // this.claming = true
    if (!this.scene.claming.find(id => id === this.id)) this.scene.claming.push(this.id)

    this.clamingAni?.remove()
    this.clamingAni = this.scene.tweens.add({
      targets: line,
      width: lineBg.width,
      duration: this.scene.red.clameTime,
      onComplete: (): void => {
        this.clame(color)
        this.scene.multiClameCheck(color)
        this.scene.hud.updateWorldStatusBar()
        this.scene.gameOverCheck(color)

        // this.claming = false
        lineBg.destroy()
        line.destroy()
      }
    })
  }


  public clame(color: string) {
    if (this?.own === 'neutral' && this.class === 'super') this.giveSuperHex(color)

    this.setColor(color)
    this.own = color

    Object.values(this.nearby).forEach(id => {
      const hex = this.scene.getHexByID(id)
      if (hex) {
        if (hex.fog) hex.removeFog()
        Object.values(hex.nearby).forEach(lvlPlusId => {
          const lvlPlusHex = this.scene.getHexByID(lvlPlusId)
          if (lvlPlusHex?.fog) lvlPlusHex.removeFog()
        })
      }
    })

    
    if (this?.own !== 'neutral' && (this?.class === 'x1' || this?.class === 'x3')) this.produceHexes()
    Phaser.Utils.Array.Remove(this.scene.claming, this.id)
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

    this.scene.add.text(this.getCenter().x, this.getCenter().y + 10, newClass, { font: '17px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(10).setStroke('#ffffff', 2)
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


  private produceHexes(): void {
    const output = this.class === 'x3' ? 3 : 1
    const delay = this.scene[this.color].hexProductionSpeed

    this.productionTimer?.remove()
    this.productionTimer = this.scene.time.addEvent({
      delay,
      callback: (): void => {
        new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${output}`, 'green', this.color)
        this.scene[this.color].hexes += output
        this.scene.hud.updateHexCounter()
      },
      loop: true
    })
  }

  private giveSuperHex(color): void {
    new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, '+1', 'green', 'purple')
    this.scene[color].superHex++
  }


  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y - 6, `col:  ${this.col}\nrow:  ${this.row}`, { font: '14px Molot', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(10)
  }
}