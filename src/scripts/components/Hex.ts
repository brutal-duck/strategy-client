import { colors } from "../gameConfig";
import Game from "../scenes/Game";
import FlyAwayMsg from "./FlyAwayMsg";

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

  public id: string // col-row
  public own: string // владелец клетки
  public class: string // grass / base / x1 / x3 / super / water / rock
  // public color: string
  public defence: number // уровень защиты клетки (сколько постредуется потратиь клеток для захвата + 1)
  public landscape: boolean // является ли некликабельным ландшафтом (гора/вода)
  public landscapeNum: number
  public initTexture: string
  public worldSprite: Phaser.GameObjects.Sprite
  public resources: number // наличие и количество ресурсов получаемое игроком за захват
  public super: boolean // игроком установлена супер клетка
  public dark: boolean
  public fog: boolean
  public fogSprite: Phaser.GameObjects.Sprite
  public classText: Phaser.GameObjects.Text
  public defenceLvl: Phaser.GameObjects.Text
  private nearbyMark: Phaser.GameObjects.Sprite
  private baseMark: Phaser.GameObjects.Sprite
  private baseMarkAni: Phaser.Tweens.Tween
  // public claming: boolean
  public clamingAni: Phaser.Tweens.Tween // идет ли захват клетки
  public upgradeAni: Phaser.Tweens.Tween
  private lineBg: Phaser.GameObjects.TileSprite
  private line: Phaser.GameObjects.TileSprite
  private defLineBg: Phaser.GameObjects.TileSprite
  private defLine: Phaser.GameObjects.TileSprite
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
    // this.color = 'neutral'
    this.defence = 1
    this.dark = true
    this.fog = true
    // this.claming = false
    this.landscape = false
    this.initTexture = ''
    this.resources = 0
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
    this.fogSprite = this.scene.add.sprite(this.getCenter().x, this.getCenter().y, 'fog').setAlpha(1).setScale(1.01).setDepth(this.depth + 20)
    this.nearbyMark = this.scene.add.sprite(this.getCenter().x, this.getCenter().y - 1, 'hex-border-2').setDepth(this.depth + 10).setScale(0.95).setVisible(false).setAlpha(0.4)
    this.defenceLvl = this.scene.add.text(this.getCenter().x, this.getCenter().y - 20, '', { font: '17px Molot', color: 'black' }).setOrigin(0.5).setDepth(this.worldSprite.depth * 1.5)
    // if (this.col === 0) this.scene.add.sprite(this.x + w / 4 + 1, this.y + h / 2 - 7, 'fog').setOrigin(1, 0).setScale(this.fogSprite.scale).setDepth(this.fogSprite.depth + 1)
    // if (this.col === this.scene.cols - 1) this.scene.add.sprite(this.x + w * 0.75 - 1, this.y + h / 2 - 7, 'fog').setOrigin(0).setScale(this.fogSprite.scale).setDepth(this.fogSprite.depth + 1)
    // if (this.row === this.scene.rows - 1) this.scene.add.sprite(this.x, this.y + h - 7, 'fog').setOrigin(0).setScale(this.fogSprite.scale).setDepth(10000)
    if (this.scene.debuging) this.debug()
  }


  public setClearClame(color: string, superHex: boolean = false) {
    const lineColor = colors[color].light
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)
    this.line = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x - 25, this.defenceLvl.getBottomCenter().y, 50, 5, 'pixel').setOrigin(0).setTint(lineColor).setDepth(10000).setVisible(color === this.scene.player.color || !this.fog)
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
        if (this.defence > 1) this.breakDefence()
        else {
          this.productionTimer?.remove()
          // this.setColor('neutral')
          this.own = 'neutral'
          this.setClaming(color, superHex)
        }
      }
    })
  }


  public setClaming(color: string, superHex: boolean = false) {
    const bgColor = colors[color].light
    const lineColor = colors[color].main
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)

    this.lineBg = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x, this.defenceLvl.getBottomCenter().y, 50, 5, 'pixel').setTint(bgColor).setOrigin(0.5, 0).setDepth(10000).setVisible(color === this.scene.player.color || !this.fog)
    this.line = this.scene.add.tileSprite(this.lineBg.getLeftCenter().x, this.lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(10000).setVisible(color === this.scene.player.color || !this.fog)
    if (!this.scene.claming.find(id => id === this.id)) this.scene.claming.push(this.id)
    // this.claming = true

    this.clamingAni = this.scene.tweens.add({
      targets: this.line,
      width: this.lineBg.width,
      duration: this.scene.green.clameTime,
      onComplete: (): void => {
        this.clamingAniRemove()
        this.clame(color, superHex)
        // this.scene.multiClameCheck(color)
        this.scene.checkClosure(this);
        this.scene.hud.updateWorldStatusBar()
        this.scene.gameOverCheck(color)
        // this.claming = false
      }
    })
  }

  public hasSuperNeighbor(): boolean {
    Object.values(this.nearby).forEach(id => {
      const hex = this.scene.getHexById(id);
      if (hex.own === this.own && hex.super) return true;
    })
    return false;
  }

  public setSocketClaming(color: string, superHex: boolean = false) {
    const bgColor = colors[color].light
    const lineColor = colors[color].main
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)

    this.lineBg = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x, this.defenceLvl.getBottomCenter().y, 50, 5, 'pixel').setTint(bgColor).setOrigin(0.5, 0).setDepth(10000).setVisible(!this.fog)
    this.line = this.scene.add.tileSprite(this.lineBg.getLeftCenter().x, this.lineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(10000).setVisible(!this.fog)
    if (!this.scene.claming.find(id => id === this.id)) this.scene.claming.push(this.id)

    this.clamingAni = this.scene.tweens.add({
      targets: this.line,
      width: this.lineBg.width,
      duration: this.scene.green.clameTime,
      onComplete: (): void => {
        this.clamingAniRemove()
        this.socketClame(color, superHex)
        this.scene.hud.updateWorldStatusBar()
        this.giveResourceAnimFromSocket()
      }
    })
  }

  public setSocketClearClame(color: string, superHex: boolean = false) {
    const lineColor = colors[color].light
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)
    this.line = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x - 25, this.defenceLvl.getBottomCenter().y, 50, 5, 'pixel').setOrigin(0).setTint(lineColor).setDepth(10000).setVisible(!this.fog)
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
        if (this.defence > 1) this.breakSocketDefence()
        else {
          this.productionTimer?.remove()
          // this.setColor('neutral')
          this.own = 'neutral'
          this.setClaming(color, superHex)
        }
      }
    })
  }

  public socketClame(color: string, superHex: boolean = false) {
    this.own = color
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)
    if (this.fog && this.own === this.scene.player.color) this.removeFog()
    this.giveResourceAnimFromSocket();
    this.super = superHex
    this.setWorldTexture()
    this.setNearbyMark()
    if (color === this.scene.player.color && !this.super) {   
      Object.values(this.nearby).forEach(id => {
        const hex = this.scene.getHexById(id)
        if (hex) {
          if (hex.fog) hex.removeFog()
        }
      })
    }

    Phaser.Utils.Array.Remove(this.scene.claming, this.id)
    this.checkVisibility()
  }

  public clame(color: string, superHex: boolean = false) {
    this.own = color
    this.clamingAniRemove()
    if (this.upgradeAni?.isPlaying()) this.upgradeAniRemove(false)
    if (this.fog && this.own === this.scene.player.color) this.removeFog()
    // if (!this.dark) this.setColor(color)
    if (superHex) {
      this.super = true
      // if (this.class === 'grass') this.setWorldTexture()
      // this.classText.setText(this.class + ' S')
    }

    if (this.resources > 0) this.giveResources()
    this.setWorldTexture()
    this.setNearbyMark()

    if (color === this.scene.player.color && !this.super) {
      Object.values(this.nearby).forEach(id => {
        const hex = this.scene.getHexById(id)
        if (hex) {
          if (hex.fog) hex.removeFog()
          // Object.values(hex.nearby).forEach(lvlPlusId => {
          //   const lvlPlusHex = this.scene.getHexByID(lvlPlusId)
          //   if (lvlPlusHex?.fog) lvlPlusHex.removeFog()
          // })
        }
      })
    }

    if (this.class === 'x3') this.scene.hud.cityClamedOrLostInfo(this.own === this.scene.player.color)
    if (this?.own !== 'neutral' && (this?.class === 'x1' || this?.class === 'x3')) this.produceHexes()
    Phaser.Utils.Array.Remove(this.scene.claming, this.id)
    this.checkVisibility()
  }

  private clamingAniRemove(): void {
    this.clamingAni?.remove()
    this.line?.destroy()
    this.lineBg?.destroy()
  }

  private upgradeAniRemove(permoment: boolean = true): void {
    this.upgradeAni?.remove()
    this.defLine?.destroy()

    if (!permoment) {
      this.defLineBg?.setTint(0xbc2121)
      this.upgradeAni = this.scene.tweens.add({
        targets: this.defLineBg,
        scaleY: 0.1,
        duration: 500,
        onComplete: (): void => { this.defLineBg?.destroy() }
      })
    } else this.defLineBg?.destroy()
  }

  public setClass(newClass: string, color?: string): this {
    this.class = newClass
    this.produceHexesRemove()
    // if (!color) this.setColor(newClass)
    
    switch (newClass) {
      case 'base': {
        this.own = color
        this.setNearbyMark()
        this.produceHexes()
        if (this.scene.gameIsOn && color === this.scene.player.color) this.setBaseMark()
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
        this.resources = 10
        break
      }
      case 'x3': {
        this.landscapeNum = Phaser.Math.Between(1, 2)
        this.resources = 30
        this.removeFog()
        break
      }
      case 'super': {
        this.landscapeNum = Phaser.Math.Between(1, 2)
        this.resources = 1
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
    // this.color = 'neutral'
    this.defence = 1
    this.defenceLvl.setVisible(false)
    this.landscape = false
    this.super = false
    this.dark = true
    this.resources = 0
    this.produceHexesRemove()
    this.clamingAniRemove()
    this.showNearbyMark(false)
    this.worldSprite.setVisible(false)
    this.class = ''
    this.classText.setText(this.class)
    this.removeBaseMark()
  }

  private checkVisibility(): void {
    const exploredGround = this.scene.hexes.filter(hex => !hex.dark)
    const playerVisibleGround = this.scene.hexes.filter(hex => hex.own === this.scene.player.color)

    this.scene.outerPlayerHexes().forEach(outerHex => {
      if (outerHex) {
        this.scene.nearbyHexes(outerHex).forEach(nrbHex => {
          if (nrbHex && playerVisibleGround.every(hex => hex?.id !== nrbHex?.id)) playerVisibleGround.push(nrbHex)
        })
      }
    })

    exploredGround.forEach(explHex => { if (playerVisibleGround.every(hex => hex?.id !== explHex?.id)) explHex?.setFog() })
  }


  public setFog(dark: boolean = false, initial: boolean = false): this {
    const alpha = dark ? 1 : 0.7
    this.fog = true
    
    if (!dark) {
      this.scene.tweens.add({
        targets: this.fogSprite,
        alpha,
        duration: initial ? 10 : 400
      })
    } else this.fogSprite.setAlpha(alpha)
    
    if (dark) {
      this.dark = true
      if (this.class === 'x3') this.fogSprite.setAlpha(0.75)
    }

    if (this.class === 'base') this.removeBaseMark()
    return this
  }


  public removeFog(initial: boolean = false): this {
    // if (this.scene.gameIsOn) console.log('removeFog ~ initial', initial)
    let duration = this.scene.gameIsOn ? this.fogAndClameAniDuration : 10
    let delay = initial ? 200 : 0
    if (initial) {
      this.fogSprite.setScale(this.worldSprite.scale)
      this.nearbyMark.setAlpha(0)
      this.scene.tweens.add({
        targets: this.nearbyMark,
        alpha: 0.4,
        duration: initial ? duration + 400 : duration,
        delay: delay * 2 + 300
      })
    }

    this.scene.tweens.add({
      targets: this.fogSprite,
      alpha: 0,
      duration: initial ? duration + delay : duration,
      delay: initial && this.class !== 'base' ? duration + delay : delay
    })
    
    this.fog = false
    this.worldSprite.setVisible(true)

    if (this.dark) this.dark = false
    if (this.class === 'base' ) {
      if (!this.baseMarkAni?.isPlaying()) this.setBaseMark()
      if (this.scene.gameIsOn && !this.scene.baseWasFound && this.own !== this.scene.player?.color) {
        this.scene.baseWasFound = true
        this.scene.hud.enemyBaseSitedInfo()
        // this.scene.hud.createWarningBaseWasFoundBar(this.getCenter().x, this.getCenter().y)
        this.scene.centerCamera(this.getCenter().x, this.getCenter().y, false, 1000)
      }
    }
    // if (!this.landscape) this.setColor(this.own)
    // if (layerPlus) {
    //   Object.values(this.nearby).forEach(id => {
    //     const hex = this.scene.getHexByID(id)
    //     if (hex.fog) hex.removeFog()
    //   })
    // }

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

    if (this.own !== 'neutral' && this.class === 'super') this.class = 'grass';
    if (this.defence > 1) texture = `${this.own}-tower`
    else if (this.class === 'water') texture = `${this.class}-${this.landscapeNum}`
    else if (this.class === 'base') texture = `${this.class}-${color}`
    else if (this.super && this.class === 'grass') texture = `${color}-fort-${Phaser.Math.Between(1, 2)}`
    else texture = `${color}-${this.class}-${this.landscapeNum}`
    
    // if (this.class === 'water' || this.class === 'grass' || this.class === 'rock') flip = Phaser.Math.Between(0, 1) === 1

    // if (!this.initTexture) this.initTexture = texture
    this.worldSprite.setTexture(texture).setFlipX(flip)
    this.fogSprite.setTexture(texture).setFlipX(flip).setTint(0x000000).setScale(this.worldSprite.scale - 0.01)

    if (this.scene.gameIsOn && !this.dark && color !== 'neutral' && this.class !== 'base' && this.class !== 'water') {
      const fadeingSprite: Phaser.GameObjects.Sprite = this.scene.add.sprite(this.worldSprite.x, this.worldSprite.y, lastTexture).setDepth(this.worldSprite.depth + 1).setFlipX(flip).setScale(this.worldSprite.scale)
      this.scene.tweens.add({
        targets: fadeingSprite,
        alpha: 0,
        duration: this.fogAndClameAniDuration,
        onComplete: () => { fadeingSprite.destroy() }
      })
    }
  }

  public upgradeDefence(color: string): void {
    this.upgradeAniRemove()
    const bgColor = colors[color].light
    const lineColor = colors[color].main
    this.defLineBg = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x, this.defenceLvl.getBottomCenter().y + 7, 50, 5, 'pixel').setTint(bgColor).setOrigin(0.5, 0).setDepth(10000).setVisible(!this.fog)
    this.defLine = this.scene.add.tileSprite(this.defLineBg.getLeftCenter().x, this.defLineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(10000).setVisible(!this.fog)

    this.upgradeAni = this.scene.tweens.add({
      targets: this.defLine,
      width: this.defLineBg.width,
      duration: this.scene.green.clameTime,
      onComplete: (): void => {
        this.upgradeAniRemove()
        this.defence++
        this.defenceLvl.setText(`${this.defence}`).setVisible(true)
        if (this.worldSprite.texture.key !== `${this.own}-tower`) this.setTowerSprite()
      }
    })
  }

  public upgradeSocketDefence(): void {
    this.upgradeAniRemove()
    const bgColor = colors[this.scene.player.color].light
    const lineColor = colors[this.scene.player.color].main
    this.defLineBg = this.scene.add.tileSprite(this.defenceLvl.getBottomCenter().x, this.defenceLvl.getBottomCenter().y + 7, 50, 5, 'pixel').setTint(bgColor).setOrigin(0.5, 0).setDepth(10000).setVisible(this.own === this.scene.player.color)
    this.defLine = this.scene.add.tileSprite(this.defLineBg.getLeftCenter().x, this.defLineBg.getLeftCenter().y, 1, 5, 'pixel').setTint(lineColor).setOrigin(0, 0.5).setDepth(10000).setVisible(this.own === this.scene.player.color)

    this.upgradeAni = this.scene.tweens.add({
      targets: this.defLine,
      width: this.defLineBg.width,
      duration: this.scene.green.clameTime,
      onComplete: (): void => {
        this.upgradeAniRemove()
        this.defenceLvl.setText(`${this.defence}`).setVisible(true)
        if (this.worldSprite.texture.key !== `${this.own}-tower`) this.setTowerSprite()
      }
    })
  }
  
  private breakDefence(): void {
    this.defence--
    if (this.defence === 1) {
      this.defenceLvl.setVisible(false)
      this.setWorldTexture()
    } else if (this.defence > 1) this.defenceLvl.setText(String(this.defence))
  }
  
  public breakSocketDefence(): void {
    this.defence--
    if (this.defence === 1) {
      this.defenceLvl.setVisible(false)
      this.setWorldTexture()
    } else if (this.defence > 1) this.defenceLvl.setText(String(this.defence))
  }

  private setTowerSprite(): void {
    const fadeingSprite: Phaser.GameObjects.Sprite = this.scene.add.sprite(this.worldSprite.x, this.worldSprite.y, this.worldSprite.texture.key).setDepth(this.worldSprite.depth + 1).setScale(this.worldSprite.scale)
    this.worldSprite.setTexture(`${this.own}-tower`)
    this.fogSprite.setTexture(`${this.own}-tower`).setTint(0x000000).setScale(this.worldSprite.scale - 0.01)
    this.scene.tweens.add({
      targets: fadeingSprite,
      alpha: 0,
      duration: this.fogAndClameAniDuration,
      onComplete: () => { fadeingSprite.destroy() }
    })
  }


  private setNearbyMark(): void {
    this.scene.hexes.forEach(hex => {
      hex.showNearbyMark(false)
      hex.nearbyMark.setTint(colors[this.scene.player.color].light)
    })
    
    this.scene.outerPlayerHexes().forEach(hex => {
      this.scene.nearbyHexes(hex).forEach(nearbyHex => {
        if (!nearbyHex.landscape && nearbyHex.class !== 'base' && nearbyHex.own !== this.scene.player.color) nearbyHex.showNearbyMark()
      })
    })
  }

  public showNearbyMark(show: boolean = true): void { this.nearbyMark.setVisible(show) }

  private setBaseMark(): void {
    this.removeBaseMark()
    this.baseMark = this.scene.add.sprite(this.worldSprite.x, this.worldSprite.y, 'base-alone').setDepth(this.depth + 10).setScale(this.worldSprite.scale).setAlpha(0)
    this.baseMarkAni = this.scene.tweens.add({
      targets: this.baseMark,
      alpha: this.own === 'red' ? 0.4 : 0.45,
      duration: 900,
      delay: 1500,
      yoyo: true,
      loop: -1
    })
  }

  private removeBaseMark(): void {
    this.baseMarkAni?.remove()
    this.baseMark?.destroy()
  }

  private produceHexes(): void {
    const output = this.class === 'x3' ? 3 : 1
    const delay = this.scene[this.own].hexProductionSpeed

    this.productionTimer = this.scene.time.addEvent({
      delay,
      callback: (): void => {
        if (this.scene.gameIsOn && (this.own === 'green' ||  this.own === 'red')) {
          if (this.own === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${output}`, 'green', this.own)
          if (this.scene.state.game.AI) this.scene[this.own].hexes += output
          this.scene.hud.updateHexCounter()
        } else this.productionTimer.remove()
      },
      loop: true
    })
  }

  public produceHexesRemove(): void { this.productionTimer?.remove() }

  private giveResources(): void {
    if (this.class === 'super') this.scene[this.own].superHex += this.resources
    else this.scene[this.own].hexes += this.resources
    
    if (this.own === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${this.resources}`, 'green', this.class === 'super' ? 'purple' : this.own)
    this.scene.hud.updateHexCounter()
    this.resources = 0
  }

  public giveResourceAnimFromSocket(): void {
    if (this.resources <= 0) return; 
    if (this.own === this.scene.player.color) new FlyAwayMsg(this.scene, this.getCenter().x, this.getCenter().y, `+${this.resources}`, 'green', this.class === 'super' ? 'purple' : this.own)
    this.resources = 0
  }

  public setSegmentID(segCol: number, segRow: number): void {
    this.segCol = segCol
    this.segRow = segRow
    this.segmentID = `${segCol}-${segRow}`
  }

  public debug(): void {
    // this.scene.input.enableDebug(this, 0xff00ff);
    this.scene.add.text(this.getCenter().x, this.getCenter().y - 6, `col:  ${this.col}\nrow:  ${this.row}`, { font: '10px Molot', align: 'left', color: 'black' }).setOrigin(0.5).setDepth(this.depth + 10)
  }
}