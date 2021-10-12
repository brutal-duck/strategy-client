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
  public enemyColor: string
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
  public baseWasFound: boolean

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

    this.worldWidth = 2548
    this.worldHeight = 2548
    this.segmentRows = 7
    this.segmentCols = 9
    this.cols = this.segmentCols * 3 // общее количество колонок
    this.rows = this.segmentRows * 3 // общее количество рядов

    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.camera.centerOn(700, 800)
    this.scale.lockOrientation('landscape-primary')

    this.hexes = []

    new Zoom(this)
    this.debuging = true

    this.input.keyboard.addKey('W').on('up', (): void => { this.gameOver('enemyBaseHasCaptured', this.player.color) })
    this.input.keyboard.addKey('S').on('up', (): void => { this.hexes.forEach(hex => hex.removeFog()) })
    this.input.keyboard.addKey('Z').on('up', (): void => {
      console.log(this.pointerHex)
    })
    this.input.keyboard.addKey('C').on('up', (): void => { this.hud.setWarning(600, 600, '4-4') })
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
    this.enemyColor = this.player.color === 'red' ? 'green' : 'red'
    this.green = Object.assign({}, config)
    this.red = Object.assign({}, config)
    this.green.name = 'green_player'
    this.red.name = 'red_player'
    this.stars = 0
    this.baseWasFound = false
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

  public setHexSocketInteractive(): void {
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
              this.state.socket.hexClick(hex.id);
            } else if (this[`${this.player.color}`].hexes >= hex.defence + 1) {
              new FlyAwayMsg(this, x, y, `-${hex.defence + 1}`, 'red', this.player.color)
              this.state.socket.hexClick(hex.id);
            } else new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', this.player.color)
            this.hud.updateHexCounter()
          } else if (
            hex.own === this.player.color && hex.class === 'grass' && this[`${this.player.color}`].hexes >= hex.defence + 1 &&
            !hex.clamingAni?.isPlaying() && !hex.upgradeAni?.isPlaying()
          ) {
            this.state.socket.hexClick(hex.id);
            hex.upgradeSocketDefence();
            new FlyAwayMsg(this, x, y, `-${hex.defence + 1}`, 'red', this.player.color)
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

  public superHexSocketClameConfirmed(): void {
    new FlyAwayMsg(this, this.chosenHex.getCenter().x, this.chosenHex.getCenter().y, '-1', 'red', 'purple')
    this.chosenHex.removeFog()
    this.hud.updateHexCounter()
    this.state.socket.hexClick(this.chosenHex.id);
  }
  

  public multiClameCheck(color: string): void {
    const chains: Array<Hex[]> = []
    let chain: Hex[] = []
    let innerHexes: Array<Hex[]> = []
    let innerHexesIsClosed = false

    // Пушит новые найденые гексы в массив внутренних гексов
    const pushNewInnerHexes = (nextCol: Hex[], top: Hex, bot: Hex): void => {
      const filtered = nextCol.filter(hex => hex.row > top.row && hex.row < bot.row && (hex.own !== color))
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
    let newInnerHexes = []
    const reduce = () => {
      newInnerHexes = []
      let fullArr = []

      // Собираем все в один массив
      innerHexes.forEach(hex => fullArr = fullArr.concat(hex))

      // Удаляем одинаковые элементы в массиве
      fullArr = fullArr.reduce((arr, item) => arr.includes(item) ? arr : [...arr, item], [])
      // console.log('2 ~ fullArr', fullArr.map(hex => hex.id))

      // Создаем матрицу соседних элементов
      for (let i = 0; i < fullArr.length; i++) {
        if (i === 0) newInnerHexes.push([fullArr[i]])
        else {
          let hexSetted = false
          for (let j = 0; j < newInnerHexes.length; j++) {
            let arr = newInnerHexes[j]
            if (arr.some(hex => this.nearbyHexes(hex).some(hex2 => hex2.id === fullArr[i].id))) {
              arr.push(fullArr[i])
              hexSetted = true
              break
            }
          }
          if (!hexSetted) newInnerHexes.push([fullArr[i]])
        }
      }

      // Сокращаем массивы, если среди них есть соседние элементы
      reduceNewArrs()
      // console.log('4 ~ newInnerHexes', newInnerHexes.map(arr => arr.map(hex => hex.id)))
      innerHexes = newInnerHexes
    }

    const reduceNewArrs = () => {
      let isChanged = false
      for (let i = 1; i < newInnerHexes.length; i++) {
        let a = newInnerHexes[i - 1]
        let b = newInnerHexes[i]
        if (a.some(el => this.nearbyHexes(el).some(nearbyHex => b.some(hex2 => hex2.id === nearbyHex.id)))) {
          isChanged = true
          b.forEach(el => a.push(el))
          newInnerHexes.splice(i, 1)
          break
        }
      }
      if (isChanged) reduceNewArrs()
    }


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
          reduce()
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
      // console.log('5 ~ innerHexes', innerHexes.map(arr => arr.map(hex => hex.id)))
      innerHexes.forEach(arr => {
        innerHexesIsClosed = arr.every(hex => Object.values(hex.nearby).every(id => 
          arr.some(el => el.id === id) || this.getHexByID(id) === null || this.getHexByID(id).own === color
        ) && hex.col < this.world.cols - 1)
        if (innerHexesIsClosed) arr.forEach(hex => {
          hex.removeFog()
          if (!hex.landscape) hex.clame(color)
          else {
            hex.own = color
            if (hex.class === 'rock') hex.setWorldTexture(color)
          }
        })
      })
    }
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
  public playerHexes(): Hex[] { return this.hexes.filter(hex => hex?.own === this.player.color && !hex.landscape) }
  public enemyHexes(): Hex[] { return this.hexes.filter(hex => hex?.own == this.enemyColor && !hex.landscape) }
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
      this.centerCamera(this.startFlyX + 220, 900, true, 2500, 'Quad.easeOut')
      this.flyAni1 = this.tweens.add({
        onStart: (): void => {
          this.midPoint.setPosition(this.camera.midPoint.x, 900)
          this.camera.startFollow(this.midPoint)
        },
        targets: this.midPoint,
        x: this.worldWidth - this.startFlyX - 60, y: 1200,
        duration,
        delay: 3500,
        ease: 'Quad.easeInOut',
        onComplete: (): void => {
          this.flyAni2 = this.tweens.add({
            targets: this.midPoint,
            x: 1200, y: 1600,
            duration,
            ease: 'Quad.easeInOut',
            onComplete: (): void => {
              this.flyAni3 = this.tweens.add({
                targets: this.midPoint,
                x: this.startFlyX + 220, y: 900,
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
      if (this.state.game.updateHex) {
        this.updateHexState();
        this.updatePlayerState();
        this.state.game.updateHex = false;
      }
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

  private updateHexState(): void {
      if (this.state.game.hexes) {
        this.state.game.hexes.forEach(socketHex => {
          const hex = this.hexes.find(el => el.id === socketHex.id);
          if (hex.own !== socketHex.newOwn && socketHex.own !== socketHex.newOwn && !hex.clamingAni?.isPlaying()) {
            if (hex.own !== 'neutral') hex.setClearClame(socketHex.newOwn, socketHex.super); 
            else hex.setSocketClaming(socketHex.newOwn, socketHex.super);
          } else if (socketHex.own !== socketHex.newOwn && !hex.clamingAni?.isPlaying()) {
            hex.socketClame(socketHex.newOwn, socketHex.super);
          }
          if (hex.defence !== socketHex.defence) {
            console.log(socketHex.defence);
            hex.defence = socketHex.defence;
          }
        });
        console.log(this.state.game.hexes, 'update')
      }
      this.state.game.updateHex = false;
  }

  private updatePlayerState(): void {
    if (this.state.game.player) {
      const gameConfig: Iconfig = this[this.state.player.color];
      gameConfig.hexes = this.state.game.player.hexes;
      gameConfig.superHex = this.state.game.player.superHexes;
      this.hud.timer.updateTime(config.matchTime - this.state.game.serverGameTime);
    }
  }
}