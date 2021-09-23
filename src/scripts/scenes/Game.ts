import FlyAwayMsg from "../components/FlyAwayMsg"
import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import { config } from "../gameConfig"
import langs from "../langs"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
  public lang: any
  public player: Iplayer
  public hud: Hud
  public debuging: boolean

  public red: Iconfig
  public blue: Iconfig

  public camera: Phaser.Cameras.Scene2D.Camera
  public midPoint: Phaser.Physics.Arcade.Sprite
  public vector: Phaser.Physics.Arcade.Sprite
  public distanceX: number
  public distanceY: number
  public holdCounter: number
  public dragOrZoom: boolean
  public twoPointerZoom: boolean
  public worldViewBorders: { x1: number, x2: number, y1: number, y2: number }
  public worldWidth: number
  public worldHeight: number

  public hexWidth: number
  public hexHeight: number
  private startX: number
  private startY: number
  public rows: number
  public cols: number

  private world: Phaser.GameObjects.TileSprite
  public hexes: Hex[]
  public pointerHex: Hex
  public chosenHex: Hex 


  public init(state: Istate) {
    this.state = state
    this.lang = langs.ru
    this.player = state.player
    this.player.color = 'red'
    this.hud = this.game.scene.getScene('Hud') as Hud

    this.red = Object.assign({}, config)
    this.blue = Object.assign({}, config)

    this.worldWidth = 2048
    this.worldHeight = 2048
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.twoPointerZoom = false
    this.dragOrZoom = false
    new Zoom(this)

    this.hexes = []
    this.hexWidth = 100
    this.hexHeight = 70
    this.startX = 340
    this.startY = 340
    this.rows = 12
    this.cols = 17
  
    this.debuging = true
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    
    this.createWorld()
    this.createField()
    this.setInput()
    this.setHexInteractive()
    this.setEvents()

    console.log('init ~ this.camera', this.camera)
    console.log('create ~ this.input', this.input)
  }


  private createField(): void {
    const offsetX = 75
    const offsetY = this.hexHeight
    const rowPadding = offsetY / 2
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.startX + (offsetX * col)
        const y = this.startY + (offsetY * row) + (col % 2 !== 0 ? rowPadding : 0)
        this.hexes.push(new Hex(this, x, y, row, col))
      }
    }
    
    this.createBase()
    this.createLandscape()
    this.createResource()
  }


  private createBase(): void {
    const redBase = this.hexes.find(hex => hex.id === '2-5').setClass('base', 'red').removeFog()
    Object.values(redBase.nearby).forEach(id => this.getHexByID(id).removeFog(true))

    const blueBase = this.hexes.find(hex => hex.id === '14-5').setClass('base', 'blue').removeFog()
    Object.values(blueBase.nearby).forEach(id => this.getHexByID(id).removeFog(true))
  }


  private createLandscape(): void {
    const rocks = [
      '5-4', '5-5', '6-5',
      '10-5', '11-4', '11-5',
      '7-1', '9-1', '7-9', '9-9'
    ]
    const water = this.hexes.filter(hex => hex.row === 0 || hex.row === this.rows - 1)
    rocks.forEach(id => this.getHexByID(id).setClass('rock'))
    water.forEach(hex => hex.setClass('water'))
  }


  private createResource(): void {
    const x1 = [
      '0-5', '1-2', '1-7', '4-4', '4-5', '4-6', '5-1', '5-9', '7-3', '7-6',
      '16-5', '15-2', '15-7', '12-4', '12-5', '12-6', '11-1', '11-9', '9-3', '9-6',
    ]
    const x3 = ['8-1', '8-5', '8-10',]
    const superHexes = ['4-8', '6-8', '8-8', '10-8', '12-8']
    x1.forEach(id => this.getHexByID(id).setClass('x1'))
    x3.forEach(id => this.getHexByID(id).setClass('x3'))
    superHexes.forEach(id => this.getHexByID(id).setClass('super'))
  }


  private createWorld(): void {
    this.world = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
  }


  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const vectorStep = this.game.device.os.desktop ? 0.5 : 4 // Сила "натяжения" точки для быстрого драга
    const dragStep = this.game.device.os.desktop ? 1 : 1.7
    let ani: Phaser.Tweens.Tween

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x008800).setDepth(10)
    console.log('setInput ~ midPoint', this.midPoint)

    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10

    this.world.on('dragstart', (pointer): void => {
      ani?.remove()

      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y

      this.distanceX = 0
      this.distanceY = 0
      this.vector.setPosition(this.midPoint.x, this.midPoint.y)
      this.midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y).body.stop()
      pointerPoint.setPosition(pointer.worldX, pointer.worldY)
      
      this.camera.startFollow(this.midPoint)
      this.dragOrZoom = true
    })


    this.world.on('drag', (pointer): void => {
      if (!this.input.pointer2.isDown && this.dragOrZoom) {
        this.holdCounter = 0

        const diffrenceX = holdedPoint.x - pointer.x
        let x = this.midPoint.x + (diffrenceX * (dragStep / 2))
        holdedPoint.x = pointer.x
        // console.log('this.world.on ~ diffrenceX', diffrenceX)

        const diffrenceY = holdedPoint.y - pointer.y
        let y = this.midPoint.y + (diffrenceY * (dragStep / 2))
        holdedPoint.y = pointer.y

        if (diffrenceX > 0) this.distanceX += vectorStep
        else if (diffrenceX < 0) this.distanceX -= vectorStep
        
        if (diffrenceY > 0) this.distanceY += vectorStep
        else if (diffrenceY < 0) this.distanceY -= vectorStep


        this.vector.setPosition(chechBordersX(x + this.distanceX), chechBordersY(y + this.distanceY))
        this.midPoint.setPosition(chechBordersX(x), chechBordersY(y))
      }
    })


    this.world.on('dragend', (): void => {
      if (this.holdCounter < 3) {
        ani = this.tweens.add({
          targets: this.midPoint,
          x: this.vector.x,
          y: this.vector.y,
          duration: 800,
          ease: 'Power2'
        })
      }
      // this.input.mousePointer.camera = this.camera // фикс краша вывода курсора за предел веб окна для старшей версии Phasera
    })


    const chechBordersX = (x: number): number => {
      if (x < this.worldViewBorders.x1) x = this.worldViewBorders.x1
      else if (x > this.worldViewBorders.x2) x = this.worldViewBorders.x2
      return x
    }

    const chechBordersY = (y: number): number => {
      if (y < this.worldViewBorders.y1) y = this.worldViewBorders.y1
      else if (y > this.worldViewBorders.y2) y = this.worldViewBorders.y2
      return y
    }
  }


  private setEvents(): void {
    this.events.once('render', (): void => {
      this.worldViewBorders = {
        x1: this.camera.worldView.width / 2,
        x2: this.camera.getBounds().width - this.camera.worldView.width / 2,
        y1: this.camera.worldView.height / 2,
        y2: this.camera.getBounds().height - this.camera.worldView.height / 2,
      }
    })
  }


  private setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (): void => {
        if (this.dragOrZoom) this.dragOrZoom = false
        else if (this.twoPointerZoom) this.twoPointerZoom = false
        else {
          this.chosenHex = hex
          // console.log('hex.on ~ this.chosenHex', this.chosenHex)

          
          if (hex.own !== this.player.color && !hex.landscape && !hex.clamingAni?.isPlaying()) {

            if (Object.values(hex.nearby).some(id => this.getHexByID(id)?.own === this.player.color)) {
              if (hex.own === 'neutral' && this[`${this.player.color}`].hexes > 0) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, '-1', 'red', this.player.color)
                this[`${this.player.color}`].hexes--
                hex.setClaming(this.player.color)

              } else if (this[`${this.player.color}`].hexes > 1) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, '-2', 'red', this.player.color)
                this[`${this.player.color}`].hexes -= 2
                hex.setClearClame(this.player.color)

              } else new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, this.lang.notEnought, 'red', this.player.color)

            } else if (!hex.fog) {
              if (this[`${this.player.color}`].superHex > 0) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, '-1', 'red', 'purple')
                this[`${this.player.color}`].superHex--
  
                if (hex.own === 'neutral') hex.setClaming(this.player.color)
                else hex.setClearClame(this.player.color)

              } else new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, this.lang.notEnought, 'red', 'purple')
            }

            this.hud.updateHexCounter()
          }
        }
      })
    })
  }
  

  public multiClameCheck(color: string): void {
    const chains: Array<Hex[]> = []
    let chain: Hex[] = []
    let innerHexes: Array<Hex[]> = []
    let innerHexesIsClosed = false


    // Пушит новые найденые гексы в массив внутренних гексов
    const pushNewInnerHexes = (nextCol: Hex[], top: Hex, bot: Hex): void => {
      const filtered = nextCol.filter(hex => hex.row > top.row && hex.row < bot.row && hex.color !== color && !hex.landscape)
      const length = filtered.length

      for (let i = 0; i < length; i++) {
        const newHex = filtered[i]

        if (innerHexes.length === 0) {
          innerHexes.push([newHex])
          continue
        }
    
        for (let j = 0; j < innerHexes.length; j++) {
          const arr = innerHexes[j]
          if (arr.some(hex => hex.id === newHex.id)) continue
        }

        const nearbyIDs = Object.values(newHex.nearby)
        const innerHexesLength = innerHexes.length
        let newHexSetted = false

        for (let j = 0; j < innerHexesLength; j++) {
          const arr = innerHexes[j]
          if (arr.some(hex => nearbyIDs.some(id => id === hex.id))) {
            arr.push(newHex)
            newHexSetted = true
            break
          }
        }

        if (!newHexSetted) innerHexes.push([newHex])
      }
    }


    // Сокращение массива внутренних незахваченных гекс
    const reduce = (arrs) => {
      let newArrs = []
      let arrayIsChanged = false

      for (let i = 0; i < arrs.length; i++) {
        const arr = arrs[i]
        const newArr = []

        for (let j = 0; j < arr.length; j++) {
          const hex = arr[j]
          if (j === 0) {
            newArr.push(hex)
            continue
          }
          if (newArr.every(el => el.id !== hex.id)) newArr.push(hex)
        }

        newArrs.push(newArr)
      }

      for (let i = newArrs.length - 1; i > 0; i--) {
        let a = newArrs[i]
        let b = newArrs[i - 1]

        if (b) {
          for (let j = a.length - 1; j >= 0; j--) {
            let nearby = Object.values(a[j].nearby)
            if (b.some(hex => nearby.some(id => id === hex.id))) {
              b.push(a.splice(j, 1)[0])
              if (!arrayIsChanged) arrayIsChanged = true
            }
          }
          if (a.length === 0) newArrs.pop()
        }
      }

      arrs = newArrs
      if (arrayIsChanged) arrs = reduce(arrs)
      return arrs
    }


    // Поиск верхней и нижней клетки игрока
    const findTopAndBotPlayerHexes = (arr: Hex[]): { top: Hex, bot: Hex } => {
      const array = arr
      let top = array[0]
      let bot = array[array.length - 1]

      while (top.color !== color && array.length > 3) {
        array.shift()
        top = array[0]
      }

      while (bot.color !== color && array.length > 3) {
        array.pop()
        bot = array[array.length - 1]
      }

      const nonPlayerHexes = array.filter(hex => hex.color !== color).sort((a, b) => a.row - b.row)
      top = array.find(hex => hex.row === nonPlayerHexes[0]?.row - 1)
      bot = array.find(hex => hex.row === nonPlayerHexes[nonPlayerHexes.length - 1]?.row + 1)
      return { top, bot }
    }


    const findInnerHexes = (array: Hex[]): void => {
      if (array[0].col < this.cols - 1) {
        array = array.sort((a, b) => a.row - b.row)

        let topHex = array[0]
        let botHex = array[array.length - 1]
  
        // следующая колонка
        const nextCol = this.nextColHexesBetween(topHex, botHex).sort((a, b) => a.row - b.row)  
        const nextColCheck = nextCol.filter(hex => hex.color === color).length < 2 || nextCol.every(hex => hex.color === color) || nextCol.every(hex => hex.color !== color)
        if (nextColCheck) return
        
        const { top, bot } = findTopAndBotPlayerHexes(nextCol)        
  
        if (top && bot) {
          pushNewInnerHexes(nextCol, top, bot)
          innerHexes = reduce(innerHexes)
          findInnerHexes(nextCol)
        } else return
      }
    }


    // 1. Поиск цепочек захваченых гексов
    for (let i = 0; i < this.cols; i++) {      
      const colHexes: Hex[] = this.hexes.filter(hex => hex.col === i && hex.color === color).sort((a, b) => a.row - b.row)
      chain = []

      if (colHexes.length > 1) {
        colHexes.forEach((hex, i) => {
          if (i === 0) chain.push(hex)
          else if (colHexes[i - 1].row + 1 === hex.row) chain.push(hex)
          else if (chain.length > 1) {
            chains.push(chain)
            chain = [hex]
          } else chain = [hex]
        })

        if (chain.length > 1) chains.push(chain)
      }
    }
    
    // 2. Поиск внутренних незахваченных гекс
    chains.forEach(arr => findInnerHexes(arr))

    // 3. Проверка на замыкание внутренних незахваченных гекс
    if (innerHexes.length > 0) {
      innerHexes.forEach(arr => {
        innerHexesIsClosed = arr.every(hex => Object.values(hex.nearby).every(id => arr.some(el => el.id === id) || this.getHexByID(id) === null || this.getHexByID(id).color === color) && hex.col < this.cols - 1)
        if (innerHexesIsClosed) arr.forEach(hex => hex.clame(color))
      })
    }
  }


  private clearGrayHex(): void {
    this.hexes.filter(hex => hex.color = 'gray').forEach(hex => hex.setColor('white'))
  }

  private hexesBeetween(topHex: Hex, botHex: Hex): Hex[] {
    return this.hexes.filter(hex => hex.col === topHex.col && hex.row >= topHex.row && hex.row <= botHex.row)
  }

  private nextColHexesBetween(topHex: Hex, botHex: Hex = topHex): Hex[] {
    if (topHex.col < this.cols - 1) {
      topHex = this.findTopRightHex(topHex)
      botHex = this.findBottomRightHex(botHex)

      if (topHex.id !== botHex.id && topHex.row + 1 !== botHex.row) {
        for (let i = topHex.row; topHex.row > 0; i--) {
          const upperHex = this.hexes.find(hex => hex.col === topHex.col && hex.row === i - 1)
          if (upperHex.color === this.player.color) topHex = upperHex
          else break
        }
    
        for (let i = botHex.row; i < this.rows - 1; i++) {
          const lowerHex = this.hexes.find(hex => hex.col === botHex.col && hex.row === i + 1)
          if (lowerHex.color === this.player.color) botHex = lowerHex
          else break
        }
      }
  
      return this.hexes.filter(hex => hex.col === topHex.col && hex.row >= topHex.row && hex.row <= botHex.row)
    }
  }

  private findTopRightHex(hex: Hex): Hex {
    let nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    if (hex.y < nextColHex.y && hex.row > 0) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row - 1)
    return nextColHex
  }

  private findBottomRightHex(hex: Hex): Hex {
    let nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    if (hex.y > nextColHex.y && hex.row < this.rows - 1) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row + 1)
    return nextColHex
  }


  public getHexByID(id: string): Hex {
    return this.hexes.find(hex => hex.id === id) || null
  }


  public gameOver(): void {
    console.log('game over');
  }


  public update(): void {
    if (!this.input.pointer2.isDown && this.dragOrZoom) {
      this.holdCounter++
      this.physics.moveToObject(this.vector, this.midPoint, 120)

      if (this.holdCounter > 10) {
        this.vector.setPosition(this.midPoint.x, this.midPoint.y)
        this.distanceX = 0
        this.distanceY = 0
        this.vector.body.stop()
      } 

    } else {
      this.vector.body.stop()
    }
  }
}