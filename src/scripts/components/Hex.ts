import Game from "../scenes/Game";
import FlyAwayMsg from "./FlyAwayMsg";

const greenLightStr = '#95ffa4'
const greenLight = 0x95ffa4
const green = 0x42e359
const redLightStr = '#ffe595'
const redLight = 0xffe595
const red = 0xe3b742

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
  public class: string // 'grass' / base / x1 / x3 / super / water / rock
  public color: string
  public landscape: boolean
  public landscapeNum: number
  public worldSprite: Phaser.GameObjects.Sprite
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
  private fogAndClameAniDuration: number
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
    this.dark = true
    this.fog = true
    // this.claming = false
    this.landscape = false
    this.haveSuper = false
    this.super = false
    this.fogAndClameAniDuration = 600
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
    this.setDepth(this.y).setOrigin(0).setAlpha(0.001).setInteractive(hitArea, Phaser.Geom.Polygon.Contains)
    this.worldSprite = this.scene.add.sprite(this.getCenter().x, this.getCenter().y, 'hex').setDepth(this.depth + 9).setScale(1.02).setVisible(false)
    this.classText = this.scene.add.text(this.getCenter().x, this.getCenter().y + 10, '', { font: '17px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(this.depth + 10).setStroke('#ffffff', 2)
    this.fogSprite = this.scene.add.sprite(this.getCenter().x, this.getCenter().y, 'fog').setAlpha(1).setScale(1.01).setDepth(this.depth + 10)
    this.nearbyMark = this.scene.add.sprite(this.getCenter().x, this.getCenter().y - 1, 'hex-border').setDepth(this.depth + 10).setScale(0.95).setVisible(false)
    // if (this.col === 0) this.scene.add.sprite(this.x + w / 4 + 1, this.y + h / 2 - 7, 'fog').setOrigin(1, 0).setScale(this.fogSprite.scale).setDepth(this.fogSprite.depth + 1)
    // if (this.col === this.scene.cols - 1) this.scene.add.sprite(this.x + w * 0.75 - 1, this.y + h / 2 - 7, 'fog').setOrigin(0).setScale(this.fogSprite.scale).setDepth(this.fogSprite.depth + 1)
    // if (this.row === this.scene.rows - 1) this.scene.add.sprite(this.x, this.y + h - 7, 'fog').setOrigin(0).setScale(this.fogSprite.scale).setDepth(10000)
    // if (this.scene.debuging) this.debug()
  }


  public setClearClame(color: string, superHex: boolean = false) {
    const lineColor = color === 'green' ? 0x95ffa4 : 0x9ffffc
    this.clamingAniRemove()
    this.line = this.scene.add.tileSprite(this.getCenter().x - 25, this.getCenter().y, 50, 5, 'pixel').setOrigin(0, 0.5).setTint(lineColor).setDepth(10000)
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
    const bgColor = color === 'green' ? greenLight : redLight
    const lineColor = color === 'green' ? green : red
    this.clamingAniRemove()

    this.lineBg = this.scene.add.tileSprite(this.getCenter().x, this.getCenter().y, 50, 5, 'pixel').setTint(bgColor).setDepth(10000)
    this.line = this.scene.add.tileSprite(this.lineBg.getLeftCenter().x, this.lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(10000)
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
    this.setWorldTexture()
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
    if (!color) this.setColor(newClass)
    
    switch (newClass) {
      case 'base': {
        this.own = color
        this.setNearbyMark()
        this.produceHexes()
        break
      }
      case 'rock': {
        this.landscape = true
        this.landscapeNum = Phaser.Math.Between(1, 3)
        break
      }
      case 'water': {
        this.landscape = true
        this.landscapeNum = Phaser.Math.Between(1, 2)
        break
      }
      case 'x1': {
        this.landscapeNum = Phaser.Math.Between(1, 2)
        break
      }
      case 'x3': {
        this.landscapeNum = 1
        break
      }
      case 'super': {
        this.landscapeNum = 1
        this.haveSuper = true
        break
      }
      default: {
        if (newClass === '') {
          this.class = 'grass'
          this.landscapeNum = Phaser.Math.Between(1, 5)
        }
        break
      }
    }

    this.setWorldTexture()
    // this.classText.setText(newClass)
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
    this.worldSprite.setVisible(false)
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
    if (dark) {
      this.dark = true
      if (this.class === 'x3') this.fogSprite.setAlpha(0.6)
    }
    return this
  }


  public removeFog(layerPlus?): this {
    const duration = this.scene.gameIsOver ? 10 : this.fogAndClameAniDuration
    this.scene.tweens.add({
      targets: this.fogSprite,
      alpha: 0,
      duration
    })
    this.fog = false
    this.worldSprite.setVisible(true)

    if (this.dark) this.dark = false
    if (!this.landscape) this.setColor(this.own)
    if (layerPlus) {
      Object.values(this.nearby).forEach(id => {
        const hex = this.scene.getHexByID(id)
        if (hex.fog) hex.removeFog()
      })
    }

    // if (!this.scene.gameIsOver) this.setSoftFog()
    return this
  }

  private setSoftFog(): void {
    const borderHexes = this.scene.hexes.filter(hex => !hex.dark && this.scene.nearbyHexes(hex).some(el => el?.dark))
    borderHexes.forEach(hex => this.scene.nearbyHexes(hex).forEach(el => { if (el && el.dark && el.fogSprite.texture.key === 'fog') el.fogSprite.setTexture('fog-soft') }))
  }

  public setWorldTexture(color?: string): void {
    if (!color) color = this.own === 'neutral' || this.landscape ? 'gray' : this.own
    const lastTexture = this.worldSprite.texture.key
    let texture: string
    let flip = false

    if (this.class === 'water') texture = `${this.class}-${this.landscapeNum}`
    else if (this.class === 'base') texture = `${this.class}-${color}`
    else texture = `${color}-${this.class}-${this.landscapeNum}`
    
    // if (this.class === 'water' || this.class === 'grass' || this.class === 'rock') flip = Phaser.Math.Between(0, 1) === 1

    this.worldSprite.setTexture(texture).setFlipX(flip)
    this.fogSprite.setTexture(texture).setFlipX(flip).setTint(0x000000).setScale(this.worldSprite.scale - 0.01)

    if (color !== 'neutral' && !this.scene.gameIsOver && this.class !== 'base' && this.class !== 'water') {
      const fadeingSprite: Phaser.GameObjects.Sprite = this.scene.add.sprite(this.worldSprite.x, this.worldSprite.y, lastTexture).setDepth(this.worldSprite.depth + 1).setFlipX(flip).setScale(this.worldSprite.scale)
      this.scene.tweens.add({
        targets: fadeingSprite,
        alpha: 0,
        duration: this.fogAndClameAniDuration,
        onComplete: () => { fadeingSprite.destroy() }
      })
    }
  }

  public setColor(color: string): this {
    const colors = {
      gray: 0xAAADAF,
      rock: 0x333333,
      x1: 0xffdc73,
      x3: 0xde9f32,
      super: 0xa785ff,
      water: 0xC6F0FF,
      green,
      red,
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
      hex.nearbyMark.setTint(this.scene.player?.color === 'green' ? greenLight : redLight)
    })
    
    this.scene.outerPlayerHexes().forEach(hex => {
      this.scene.nearbyHexes(hex).forEach(nearbyHex => {
        if (!nearbyHex.landscape && nearbyHex.own !== this.scene.player.color) nearbyHex.showNearbyMark()
      })
    })
  }

  public showNearbyMark(show: boolean = true): void { this.nearbyMark.setVisible(show) }

  private produceHexes(): void {
    const output = this.class === 'x3' ? 3 : 1
    const delay = this.scene[this.own].hexProductionSpeed

    this.productionTimer = this.scene.time.addEvent({
      delay,
      callback: (): void => {
        if (this.scene.isLaunched) {
          if (this.own === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${output}`, 'green', this.color)
          this.scene[this.own].hexes += output
          this.scene.hud.updateHexCounter()
        } else this.productionTimer.remove()
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
    this.scene.add.text(this.getCenter().x, this.getCenter().y - 6, `col:  ${this.col}\nrow:  ${this.row}`, { font: '12px Molot', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(this.depth + 10)
  }
}