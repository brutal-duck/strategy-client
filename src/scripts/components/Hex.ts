import Game from "../scenes/Game";
import FlyAwayMsg from "./FlyAwayMsg";

const greenLightStr = '#95ffa4'
const greenLight = 0x95ffa4
const green = 0x42e359
const blueLightStr = '#9ffffc'
const blueLight = 0x9ffffc
const blue = 0x61c3fb

export default class Hex extends Phaser.GameObjects.Sprite {  
  public scene: Game
  public x: number
  public y: number
  public row: number
  public col: number
  public sprite: string

  public segCol: number
  public segRow: number
  public segmentID: string

  public id: string
  public own: string
  public class: string // '' / base / x1 / x3 / tower / water / rock
  public color: string
  public landscape: boolean
  public haveSuper: boolean
  public super: boolean
  public dark: boolean
  public fog: boolean
  public fogSprite: Phaser.GameObjects.Sprite
  public classText: Phaser.GameObjects.Text
  private nearbyMark: Phaser.GameObjects.Sprite
  // public claming: boolean
  public clamingAni: Phaser.Tweens.Tween
  private lineBg: Phaser.GameObjects.TileSprite
  private line: Phaser.GameObjects.TileSprite
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
    this.color = 'neutral'
    this.fog = true
    this.dark = true
    // this.claming = false
    this.landscape = false
    this.haveSuper = false
    this.super = false
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

    const w = 100
    const h = 70
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
    this.classText = this.scene.add.text(this.getCenter().x, this.getCenter().y + 10, '', { font: '17px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(10).setStroke('#ffffff', 2)
    this.fogSprite = this.scene.add.sprite(this.getCenter().x, this.getCenter().y - 6, 'fog').setAlpha(1).setScale(1.01).setDepth(this.depth + 10)
    this.nearbyMark = this.scene.add.sprite(this.getCenter().x, this.getCenter().y, 'hex-border').setDepth(10).setScale(0.95).setVisible(false)
    // if (this.col === 0) this.scene.add.sprite(this.x + w / 4 + 1, this.y + h / 2 - 7, 'fog').setOrigin(1, 0).setScale(this.fogSprite.scale).setDepth(this.fogSprite.depth + 1)

    // if (this.scene.debuging) this.debug()
  }


  public setClearClame(color: string, superHex: boolean = false) {
    const lineColor = color === 'green' ? 0x95ffa4 : 0x9ffffc
    this.clamingAniRemove()
    this.line = this.scene.add.tileSprite(this.getCenter().x - 25, this.getCenter().y + 10, 50, 5, 'pixel').setOrigin(0, 0.5).setTint(lineColor).setDepth(this.depth + 2)
    this.scene.claming.push(this.id)
    // this.claming = true

    if (color !== this.scene.player.color) {
      new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y + 20, '', 'yellow', 'warning', 7000)
      this.scene.hud.setWarning(this.getCenter().x, this.getCenter().y, this.id)
    }

    this.clamingAni = this.scene.tweens.add({
      targets: this.line,
      width: 1,
      duration: this.super ? this.scene.green.superReclameTime : this.scene.green.clameTime,
      onComplete: (): void => {
        this.clamingAniRemove()
        this.productionTimer?.remove()
        this.setColor('neutral')
        this.own = 'neutral'
        this.setClaming(color, superHex)
      }
    })
  }


  public setClaming(color: string, superHex: boolean = false) {
    const bgColor = color === 'green' ? 0x95ffa4 : 0x9ffffc
    const lineColor = color === 'green' ? 0x42e359 : 0x61c3fb
    this.clamingAniRemove()

    this.lineBg = this.scene.add.tileSprite(this.getCenter().x, this.getCenter().y + 10, 50, 5, 'pixel').setTint(bgColor).setDepth(this.depth + 2)
    this.line = this.scene.add.tileSprite(this.lineBg.getLeftCenter().x, this.lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(this.depth + 2)
    if (!this.scene.claming.find(id => id === this.id)) this.scene.claming.push(this.id)
    // this.claming = true

    this.clamingAni = this.scene.tweens.add({
      targets: this.line,
      width: this.lineBg.width,
      duration: this.scene.green.clameTime,
      onComplete: (): void => {
        this.clamingAniRemove()
        this.clame(color, superHex)
        this.scene.multiClameCheck(color)
        this.scene.hud.updateWorldStatusBar()
        this.scene.gameOverCheck(color)
        // this.claming = false
      }
    })
  }


  private clamingAniRemove(): void {
    this.clamingAni?.remove()
    this.line?.destroy()
    this.lineBg?.destroy()
  }


  public clame(color: string, superHex: boolean = false) {
    if (this.haveSuper) {
      this.giveSuperHex(color)
      this.haveSuper = false
    }
    if (!this.dark) this.setColor(color)
    if (superHex) {
      this.super = true
      this.classText.setText(this.class + ' S')
    }

    this.own = color
    this.setNearbyMark()

    if (color === this.scene.player.color) {   
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
    }

    if (this?.own !== 'neutral' && (this?.class === 'x1' || this?.class === 'x3')) this.produceHexes()
    Phaser.Utils.Array.Remove(this.scene.claming, this.id)
    this.checkVisibility()
  }

  public setClass(newClass: string, color?: string): this {
    this.class = newClass
    this.produceHexesRemove()

    if (newClass === 'base') {
      this.setColor(color)
      this.own = color
      this.setNearbyMark()
      this.produceHexes()
    } else {
      if (newClass === 'rock' || newClass === 'water') this.landscape = true
      if (!color) this.setColor(newClass)
    }

    if (newClass === 'super') this.haveSuper = true
    this.classText.setText(newClass)
    return this
  }

  
  public removeClass(): void {
    this.own = 'neutral'
    this.color = 'neutral'
    this.landscape = false
    this.super = false
    this.haveSuper = false
    this.produceHexesRemove()
    this.clamingAniRemove()
    this.showNearbyMark(false)
    this.class = ''
    this.classText.setText(this.class)
  }

  private checkVisibility(): void {
    const explogreenGround = this.scene.hexes.filter(hex => !hex.dark)
    const playerVisibleGround = []
    this.scene.outerPlayerHexes().forEach(outerHex => {
      if (outerHex) {
        this.scene.nearbyHexes(outerHex).forEach(nrbHex => {
          if (nrbHex) {
            if (playerVisibleGround.every(hex => hex?.id !== nrbHex?.id)) playerVisibleGround.push(nrbHex)
            this.scene.nearbyHexes(nrbHex).forEach(nrbHex2 => {
              if (nrbHex2 && playerVisibleGround.every(hex => hex?.id !== nrbHex2?.id)) playerVisibleGround.push(nrbHex2)
            })
          }
        })
      }
    })

    explogreenGround.forEach(explHex => { if (playerVisibleGround.every(hex => hex?.id !== explHex?.id)) explHex?.setFog() })
  }

  

  public setFog(dark: boolean = false): this {
    const alpha = dark ? 1 : 0.7
    if (!dark) {
      this.scene.tweens.add({
        targets: this.fogSprite,
        alpha,
        duration: 400
      })
    } else this.fogSprite.setAlpha(alpha)

    this.fog = true
    if (dark) this.dark = true
    return this
  }


  public removeFog(layerPlus?): this {
    this.scene.tweens.add({
      targets: this.fogSprite,
      alpha: 0,
      duration: 400
    })
    this.fog = false

    if (this.dark) this.dark = false
    if (!this.landscape) this.setColor(this.own)

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
      x1: 0xffdc73,
      x3: 0xde9f32,
      super: 0xa785ff,
      water: 0xC6F0FF,
      green: 0x42e359,
      blue: 0x61c3fb,
    }

    if (color === 'neutral') {
      if (this.class === '') this.clearTint()
      else this.setTint(colors[this.class])
    } else this.setTint(colors[color])

    this.color = color
    return this
  }

  private setNearbyMark(): void {
    this.scene.hexes.forEach(hex => {
      hex.showNearbyMark(false)
      hex.nearbyMark.setTint(this.scene.player?.color === 'green' ? greenLight : blueLight)
    })
    
    this.scene.outerPlayerHexes().forEach(hex => {
      this.scene.nearbyHexes(hex).forEach(nearbyHex => {
        if (!nearbyHex.landscape && nearbyHex.own !== this.scene.player.color) nearbyHex.showNearbyMark()
      })
    })
  }

  public showNearbyMark(show: boolean = true): void {
    this.nearbyMark.setVisible(show)
  }

  private produceHexes(): void {
    const output = this.class === 'x3' ? 3 : 1
    const delay = this.scene[this.own].hexProductionSpeed

    this.productionTimer = this.scene.time.addEvent({
      delay,
      callback: (): void => {
        if (this.own === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${output}`, 'green', this.color)
        this.scene[this.own].hexes += output
        this.scene.hud.updateHexCounter()
      },
      loop: true
    })
  }

  private produceHexesRemove(): void { this.productionTimer?.remove() }

  private giveSuperHex(color): void {
    if (color === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, '+1', 'green', 'purple')
    this.scene[color].superHex++
  }

  public setSegmentID(segCol: number, segRow: number): void {
    this.segCol = segCol
    this.segRow = segRow
    this.segmentID = `${segCol}-${segRow}`
  }

  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y - 6, `col:  ${this.col}\nrow:  ${this.row}`, { font: '12px Molot', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(10)
  }
}