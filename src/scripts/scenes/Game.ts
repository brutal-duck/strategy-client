import FlyAwayMsg from "../components/FlyAwayMsg"
import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import { config } from "../gameConfig"
import langs from "../langs"
import AI from "../utils/AI"
import World from "../utils/World"
import WorldTest from "../utils/WorldTest"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
  public lang: any
  // public isLaunched: boolean = false
  public player: Iplayer
  public hud: Hud
  public world: World | WorldTest
  public gameIsOn: boolean = false
  public debuging: boolean
  public AI: AI

  public green: Iconfig
  public red: Iconfig

  public camera: Phaser.Cameras.Scene2D.Camera
  public pan: Phaser.Cameras.Scene2D.Effects.Pan
  private flyAni1: Phaser.Tweens.Tween
  private flyAni2: Phaser.Tweens.Tween
  private flyAni3: Phaser.Tweens.Tween
  private startFlyX: number
  public midPoint: Phaser.Physics.Arcade.Sprite
  public vector: Phaser.Physics.Arcade.Sprite
  public distanceX: number
  public distanceY: number
  public holdCounter: number
  public zoomed: boolean
  public draged: boolean
  public twoPointerZoom: boolean
  public worldViewBorders: { x1: number, x2: number, y1: number, y2: number }
  public worldWidth: number
  public worldHeight: number
  public segmentRows: number
  public segmentCols: number
  public rows: number
  public cols: number

  public stars: number

  private worldBG: Phaser.GameObjects.TileSprite
  public hexes: Hex[]
  public pointerHex: Hex
  public chosenHex: Hex

  public claming: string[]

  public init(state: Istate) {
    this.state = state
    this.lang = langs.ru
    this.hud = this.game.scene.getScene('Hud') as Hud
    this.gameIsOn = false

    this.worldWidth = 2048
    this.worldHeight = 2048
    this.segmentRows = 7
    this.segmentCols = 9
    this.cols = this.segmentCols * 3 // общее количество колонок
    this.rows = this.segmentRows * 3 // общее количество рядов

    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.camera.centerOn(500, 600)
    this.scale.lockOrientation('landscape-primary')

    this.hexes = []

    new Zoom(this)
    this.debuging = true

    this.input.keyboard.addKey('W').on('up', (): void => { this.gameOver('enemyBaseHasCaptured', this.player.color) })
    this.input.keyboard.addKey('S').on('up', (): void => { this.hexes.forEach(hex => hex.removeFog()) })
    this.input.keyboard.addKey('Z').on('up', (): void => {
      console.log(this.pointerHex.own)
      this.test(this.player.color)
    })
    this.input.keyboard.addKey('C').on('up', (): void => { this.scene.launch('Modal', { state: this.state, type: 'landing' }) })
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    this.worldBG = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
    this.world = new World(this, this.gameIsOn)
    // this.world = new WorldTest(this, this.gameIsOn)
    this.setInput()
    this.setEvents()
  }


  public launch(state: Istate): void {
    this.state = state
    this.player = state.player
    this.green = Object.assign({}, config)
    this.red = Object.assign({}, config)
    this.green.name = 'green_player'
    this.red.name = 'red_player'
    this.stars = 0
    this.claming = [] // массив захватываемых в данный момент клеток

    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.twoPointerZoom = false
    this.draged = false
    this.zoomed = false
    
    this.gameIsOn = true // запущен ли матч
    this.world.recreate(this.gameIsOn, this.state.game.seed);
    
    if (this.state.game.AI) {
      this.AI = new AI(this)
      this.AI.init()
    }

    console.log('init ~ this.camera', this.camera)
    console.log('create ~ this.input', this.input)
  }


  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const vectorStep = this.game.device.os.desktop ? 0.5 : 4 // Сила "натяжения" точки для быстрого драга
    const dragStep = this.game.device.os.desktop ? 1 : 1.7
    let ani: Phaser.Tweens.Tween

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x000000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x008800).setDepth(10)
    // console.log('setInput ~ midPoint', this.midPoint)

    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10

    this.worldBG.on('dragstart', (pointer): void => {
      ani?.remove()
      this.camera.panEffect.reset()
      this.camera.zoomEffect.reset()
      this.worldViewBorders = {
        x1: this.camera.worldView.width / 2,
        x2: this.camera.getBounds().width - this.camera.worldView.width / 2,
        y1: this.camera.worldView.height / 2,
        y2: this.camera.getBounds().height - this.camera.worldView.height / 2,
      }

      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y

      this.distanceX = 0
      this.distanceY = 0
      this.vector.setPosition(this.midPoint.x, this.midPoint.y)
      this.midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y).body.stop()
      pointerPoint.setPosition(pointer.worldX, pointer.worldY)
      
      this.camera.startFollow(this.midPoint)
      this.draged = true
    })


    this.worldBG.on('drag', (pointer): void => {
      if (!this.input.pointer2.isDown && (this.draged || this.zoomed)) {
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


    this.worldBG.on('dragend', (): void => {
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


  public setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (): void => {
        if (this.draged) {
          this.draged = false
          // this.zoomed = false
        } else if (this.twoPointerZoom) this.twoPointerZoom = false
        else {
          // console.log('hex.on ~', hex)
          this.chosenHex = hex
          const x = hex.getCenter().x
          const y = hex.getCenter().y
          
          if (
            hex.own !== this.player.color && hex.class !== 'base' &&
            !hex.landscape && !hex.clamingAni?.isPlaying() &&
            this.nearbyHexes(hex).some(el => el?.own === this.player.color)
          ) {

            if (hex.own === 'neutral' && this[`${this.player.color}`].hexes >= hex.defence) {
              new FlyAwayMsg(this, x, y, `-${hex.defence}`, 'red', this.player.color)
              this[`${this.player.color}`].hexes -= hex.defence
              hex.setClaming(this.player.color)

            } else if (this[`${this.player.color}`].hexes >= hex.defence + 1) {
              new FlyAwayMsg(this, x, y, `-${hex.defence + 1}`, 'red', this.player.color)
              this[`${this.player.color}`].hexes -= hex.defence + 1
              hex.setClearClame(this.player.color)

            } else new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', this.player.color)

            this.hud.updateHexCounter()

          } else if (
            hex.own === this.player.color && hex.class === 'grass' && this[`${this.player.color}`].hexes >= hex.defence + 1 &&
            !hex.clamingAni?.isPlaying() && !hex.upgradeAni?.isPlaying()
          ) {
            this[`${this.player.color}`].hexes -= hex.defence + 1
            new FlyAwayMsg(this, x, y, `-${hex.defence + 1}`, 'red', this.player.color)
            hex.upgradeDefence()
            
          } else if (hex.own !== this.player.color && hex.class !== 'base') {

            if (this[`${this.player.color}`].superHex > 0 && !hex.clamingAni?.isPlaying()) {
  
              if (hex.own !== this.player.color && !hex.landscape && hex.class !== 'base' && !hex.clamingAni?.isPlaying()) {
                this.scene.launch('Modal', { state: this.state, type: 'landing' })

              } else if (hex.class !== 'base' || (hex.landscape && hex.dark)) new FlyAwayMsg(this, x, y, this.lang.wrongPlace, 'red', '', 1000)
  
            } else if (hex.dark || !hex.landscape) new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', 'purple')

          } else if (hex.class === 'base' && !hex.dark && hex.own !== this.player.color) {
            new FlyAwayMsg(this, x, y, this.lang.surroundBase, 'yellow', '', 2000)
          } 
        }
      })
    })
  }

  public superHexClameConfirmed(): void {
    new FlyAwayMsg(this, this.chosenHex.getCenter().x, this.chosenHex.getCenter().y, '-1', 'red', 'purple')
    this.chosenHex.removeFog()
    this[`${this.player.color}`].superHex--
    this.hud.updateHexCounter()

    if (this.chosenHex.own === 'neutral') this.chosenHex.setClaming(this.player.color, true)
    else this.chosenHex.setClearClame(this.player.color, true)
  }
  

  public multiClameCheck(color: string): void {
    const chains: Array<Hex[]> = []
    let chain: Hex[] = []
    let innerHexes: Array<Hex[]> = []
    let innerHexesIsClosed = false

    // Пушит новые найденые гексы в массив внутренних гексов
    const pushNewInnerHexes = (nextCol: Hex[], top: Hex, bot: Hex): void => {
      const filtered = nextCol.filter(hex => hex.row > top.row && hex.row < bot.row && (hex.own !== color || hex.landscape))
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
    const reduce = (arrs: Hex[][]) => {
      // console.log('reduce ~ arrs', arrs.map(arr => arr.map(el => el.id)))
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


    // const sheduce = (arrs: Hex[][]) => {
    //   let newInnerHexes = []
    //   let fullArr = []
    //   arrs.forEach(el => fullArr = fullArr.concat(el))
    //   fullArr.forEach((el, i) => { if (fullArr.filter(hex => hex.id === el.id).length > 1) fullArr.splice(i, 1) })

    //   for (let i = 0; i < fullArr.length; i++) {
    //     if (i === 0) newInnerHexes.push([fullArr[i]])
    //     if (fullArr[i])
    //   }
    // }


    // Поиск верхней и нижней клетки игрока
    const findTopAndBotPlayerHexes = (arr: Hex[]): { top: Hex, bot: Hex } => {
      const array = arr
      let top = array[0]
      let bot = array[array.length - 1]

      while (top.own !== color && array.length > 3) {
        array.shift()
        top = array[0]
      }

      while (bot.own !== color && array.length > 3) {
        array.pop()
        bot = array[array.length - 1]
      }

      const nonPlayerHexes = array.filter(hex => hex.own !== color).sort((a, b) => a.row - b.row)
      top = array.find(hex => hex.row === nonPlayerHexes[0]?.row - 1)
      bot = array.find(hex => hex.row === nonPlayerHexes[nonPlayerHexes.length - 1]?.row + 1)
      return { top, bot }
    }


    const findInnerHexes = (array: Hex[]): void => {
      if (array[0].col < this.world.cols - 1) {
        array = array.sort((a, b) => a.row - b.row)

        let topHex = array[0]
        let botHex = array[array.length - 1]
  
        // следующая колонка
        const nextCol = this.nextColHexesBetween(topHex, botHex).sort((a, b) => a.row - b.row)
        const nextColCheck = nextCol.filter(hex => hex.own === color).length < 2 || nextCol.every(hex => hex.own === color) || nextCol.every(hex => hex.own !== color)
        if (nextColCheck) return
        
        const { top, bot } = findTopAndBotPlayerHexes(nextCol)        
  
        if (top && bot) {
          pushNewInnerHexes(nextCol, top, bot)
          let iner = []
          iner = iner.concat(innerHexes)
          // console.log('1 ~ innerHexes', iner.map(arr => arr.map(hex => hex.id)))
          innerHexes = reduce(innerHexes)
          findInnerHexes(nextCol)
        } else return
      }
    }


    // 1. Поиск цепочек захваченых гексов
    for (let i = 0; i < this.world.cols; i++) {
      const colHexes: Hex[] = this.hexes.filter(hex => hex.col === i && hex.own === color).sort((a, b) => a.row - b.row)
      // const colHexes: Hex[] = this.hexes.filter(hex => hex.col === i && (hex.own === color || hex.landscape)).sort((a, b) => a.row - b.row)
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
    // chains.forEach((arr, i) => { if (arr.every(hex => hex.landscape)) chains.splice(i, 1) })
    chains.forEach(arr => findInnerHexes(arr))
    // console.log('multiClameCheck ~ chains', chains.map(arr => arr.map(hex => hex.id)))

    // 3. Проверка на замыкание внутренних незахваченных гекс
    if (innerHexes.length > 0) {
      console.log('2 ~ innerHexes', innerHexes.map(arr => arr.map(hex => hex.id)))
      innerHexes.forEach(arr => {
        innerHexesIsClosed = arr.every(hex => Object.values(hex.nearby).every(id => 
          arr.some(el => el.id === id) || this.getHexByID(id) === null || this.getHexByID(id).own === color
        ) && hex.col < this.world.cols - 1)
        if (innerHexesIsClosed) arr.forEach(hex => {
          hex.removeFog()
          if (!hex.landscape) hex.clame(color)
          else if (hex.class === 'rock') hex.setWorldTexture(color)
        })
      })
    }
  }

  private test(color: string): void {
    // this.hexes.forEach(hex => {})
    let check = [
      this.topIsClosed(this.pointerHex, color),
      this.topRightIsClosed(this.pointerHex, color),
      this.botRightIsClosed(this.pointerHex, color),
      this.botIsClosed(this.pointerHex, color),
      this.botLeftIsClosed(this.pointerHex, color),
      this.topLeftIsClosed(this.pointerHex, color),
    ]
    console.log('test ~ check', check.every(el => el))
  }

  private topIsClosed(hex: Hex, color: string): boolean {
    const col = hex.col
    let row = hex.row - 1
    while (row >= 0) {
      if (this.getHexByID(`${col}-${row}`).own === color) return true
      row--
    }
    return false
  }

  private topRightIsClosed(hex: Hex, color: string): boolean {
    let topRight = this.getHexByID(hex.nearby.topRight)
    let row = topRight.row
    let col = topRight.col
    while (row > 0 && col < this.cols - 1) {
      if (topRight.own === color) return true
      topRight = this.getHexByID(topRight.nearby.topRight)
      row = topRight.row
      col = topRight.col
    }
    return false
  }

  private botRightIsClosed(hex: Hex, color: string): boolean {
    let botRight = this.getHexByID(hex.nearby.botRight)
    let row = botRight.row
    let col = botRight.col
    while (row < this.rows && col < this.cols - 1) {
      if (botRight.own === color) return true
      botRight = this.getHexByID(botRight.nearby.botRight)
      row = botRight.row
      col = botRight.col
    }
    return false
  }

  private botIsClosed(hex: Hex, color: string): boolean {
    const col = hex.col
    let row = hex.row + 1
    while (row < this.rows) {
      if (this.getHexByID(`${col}-${row}`).own === color) return true
      else row++
    }
    return false
  }

  private botLeftIsClosed(hex: Hex, color: string): boolean {
    let botLeft = this.getHexByID(hex.nearby.botLeft)
    let row = botLeft.row
    let col = botLeft.col
    while (row < this.rows - 1 && col > 0) {
      if (botLeft.own === color) return true
      botLeft = this.getHexByID(botLeft.nearby.botLeft)
      row = botLeft.row
      col = botLeft.col
    }
    return false
  }

  private topLeftIsClosed(hex: Hex, color: string): boolean {
    let topLeft = this.getHexByID(hex.nearby.topLeft)
    let row = topLeft.row
    let col = topLeft.col
    while (row > 0 && col > 0) {
      if (topLeft.own === color) return true
      topLeft = this.getHexByID(topLeft.nearby.topLeft)
      row = topLeft.row
      col = topLeft.col
    }
    return false
  }

  private nextColHexesBetween(topHex: Hex, botHex: Hex = topHex): Hex[] {
    if (topHex.col < this.world.cols - 1) {
      topHex = this.findTopRightHex(topHex)
      botHex = this.findBottomRightHex(botHex)

      if (topHex.id !== botHex.id && topHex.row + 1 !== botHex.row) {
        for (let i = topHex.row; topHex.row > 0; i--) {
          const upperHex = this.hexes.find(hex => hex.col === topHex.col && hex.row === i - 1)
          if (upperHex.own === this.player.color) topHex = upperHex
          else break
        }
    
        for (let i = botHex.row; i < this.world.rows - 1; i++) {
          const lowerHex = this.hexes.find(hex => hex.col === botHex.col && hex.row === i + 1)
          if (lowerHex.own === this.player.color) botHex = lowerHex
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
    if (hex.y > nextColHex.y && hex.row < this.world.rows - 1) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row + 1)
    return nextColHex
  }

  public getHexByID(id: string): Hex { return this.hexes.find(hex => hex.id === id) }
  public playerHexes(): Hex[] { return this.hexes.filter(hex => hex?.own === this.player.color) }
  public nearbyHexes(hex: Hex): Hex[] { if (hex) return Object.values(hex?.nearby).map(id => { if (this.isValidID(id)) return this.getHexByID(id) }) }
  public outerPlayerHexes(): Hex[] { return this.playerHexes().filter(hex => { if (hex) return this.nearbyHexes(hex).some(el => el?.own !== this.player.color) }) }
  public isValidID(id: string): boolean {
    let counter = 0
    for (let i = 0; i < id.length; i++) if (id[i] === '-') counter++
    return counter < 2
  }


  public centerCamera(x: number, y: number, zoom: boolean = false, duration: number = 1500, ease: string = 'Power2'): void {
    this.camera.stopFollow()
    this.camera.panEffect.reset()
    this.camera.zoomEffect.reset()
    this.camera.pan(x, y, duration, ease)
    if (zoom) this.camera.zoomTo(1.6, duration, ease)
  }

  public cameraFly(updateStartFlyX: boolean = false, fly: boolean = true): void {
    this.flyAni1?.remove()
    this.flyAni2?.remove()
    this.flyAni3?.remove()
    this.camera.stopFollow()
    this.camera.panEffect.reset()
    this.camera.zoomEffect.reset()

    if (fly) {
      const duration = 30000
      if (updateStartFlyX) this.startFlyX = this.camera.worldView.width / 2 > 0 ? this.camera.worldView.width / 2 : 600
      this.centerCamera(this.startFlyX + 60, 600, true, 2500, 'Quad.easeOut')
      this.flyAni1 = this.tweens.add({
        onStart: (): void => {
          this.midPoint.setPosition(this.camera.midPoint.x, 600)
          this.camera.startFollow(this.midPoint)
        },
        targets: this.midPoint,
        x: this.worldWidth - this.startFlyX - 60, y: 800,
        duration,
        delay: 3500,
        ease: 'Quad.easeInOut',
        onComplete: (): void => {
          this.flyAni2 = this.tweens.add({
            targets: this.midPoint,
            x: 1000, y: 1400,
            duration,
            ease: 'Quad.easeInOut',
            onComplete: (): void => {
              this.flyAni3 = this.tweens.add({
                targets: this.midPoint,
                x: this.startFlyX + 60, y: 600,
                duration,
                ease: 'Quad.easeInOut',
                onComplete: (): void => { this.cameraFly() }
              })
            }
          })
        }
      })
    }
  }
  
  public gameOverCheck(color: string): void {
    const baseHexes = this.hexes.filter(hex => hex.own === color && hex.class === 'base')
    if (baseHexes.length > 1) this.gameOver('enemyBaseHasCaptured', color)
  }


  public gameOver(reason: string, winner?: string): void {
    if (this.gameIsOn) {
      this.gameIsOn = false
      this.hud.hide()
      this.hexes.forEach(hex => {
        hex.clamingAni?.remove()
        hex.upgradeAni?.remove()
        hex.produceHexesRemove()
      })
  
      if (!winner) {
        const green = this.hexes.filter(hex => hex.own === 'green').length
        const red = this.hexes.filter(hex => hex.own === 'red').length

        if (green === red) winner = null
        else if (green > red) winner = 'green'
        else winner = 'red'
      }
      
      const win = winner === this.player.color
      if (this.AI) this.AI.remove()
      this.scene.launch('Modal', { state: this.state, type: 'gameOver', info: { win, winner, reason } })
    }
  }

  
  public update(): void {
    if (this.gameIsOn) {
      if (!this.input.pointer2.isDown && (this.draged || this.zoomed)) {
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

      // if (this.flyAni?.isPlaying()) this.flyAni.remove()
      this.checkSocketGameOver();
    }
  }

  private checkSocketGameOver(): void {
    if (this.state.socketWin) {
      console.log(this.state, 'this.state');
      this.gameOver('enemyBaseHasCaptured', this.player.color);
      this.state.socket.closeSocket();
    }
    if (this.state.socketLoose) {
      console.log(this.state, 'this.state');
      this.gameOver('yourBaseHasCaptured', this.player.color === 'red' ? 'green' : 'red');
      this.state.socket.closeSocket();
    }
  }
}