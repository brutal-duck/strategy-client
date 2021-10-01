import FlyAwayMsg from "../components/FlyAwayMsg"
import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import { config } from "../gameConfig"
import langs from "../langs"
import AI from "../utils/AI"
import World from "../utils/World"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
  public lang: any
  public isLaunched: boolean = false
  public player: Iplayer
  public hud: Hud
  public world: World
  public gameIsOver: boolean
  public debuging: boolean
  private AI: AI

  public green: Iconfig
  public blue: Iconfig

  public camera: Phaser.Cameras.Scene2D.Camera
  public pan: Phaser.Cameras.Scene2D.Effects.Pan
  private flyAni: Phaser.Tweens.Tween
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

  private worldBG: Phaser.GameObjects.TileSprite
  public hexes: Hex[]
  public pointerHex: Hex
  public chosenHex: Hex

  public claming: string[]


  public init(state: Istate) {
    this.state = state
    this.lang = langs.ru
    this.hud = this.game.scene.getScene('Hud') as Hud

    this.worldWidth = 2048
    this.worldHeight = 2048
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.camera.centerOn(500, 600)
    this.scale.lockOrientation('landscape-primary')

    this.hexes = []

    new Zoom(this)
    this.debuging = true

    // this.input.keyboard.addKey('W').on('up', (): void => { this.gameOver('enemyBaseHasCaptured', 'green') })
    this.input.keyboard.addKey('W').on('up', (): void => { this.hexes.forEach(hex => hex.removeFog()) })
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    this.worldBG = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
    this.world = new World(this, this.isLaunched)
    this.setInput()
    this.setEvents()
  }



  public launch(state: Istate): void {
    this.state = state
    this.isLaunched = true
    this.player = state.player
    this.green = Object.assign({}, config)
    this.blue = Object.assign({}, config)
    this.claming = []

    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.twoPointerZoom = false
    this.dragOrZoom = false
    this.gameIsOver = false

    this.world.recreate(this.isLaunched)

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

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x008800).setDepth(10)
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
      this.dragOrZoom = true
    })


    this.worldBG.on('drag', (pointer): void => {
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
        if (this.dragOrZoom) this.dragOrZoom = false
        else if (this.twoPointerZoom) this.twoPointerZoom = false
        else {
          // console.log('hex.on ~', hex)
          const x = hex.getCenter().x
          const y = hex.getCenter().y
          
          if (hex.own !== this.player.color && hex.class !== 'base' && !hex.landscape && !hex.clamingAni?.isPlaying()) {

            if (Object.values(hex.nearby).some(id => this.getHexByID(id)?.own === this.player.color)) {
              if (hex.own === 'neutral' && this[`${this.player.color}`].hexes > 0) {
                new FlyAwayMsg(this, x, y, '-1', 'red', this.player.color)
                this[`${this.player.color}`].hexes--
                hex.setClaming(this.player.color)

              } else if (this[`${this.player.color}`].hexes > 1) {
                new FlyAwayMsg(this, x, y, '-2', 'red', this.player.color)
                this[`${this.player.color}`].hexes -= 2
                hex.setClearClame(this.player.color)

              } else new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', this.player.color)

            } else if (!hex.fog) {
              if (this[`${this.player.color}`].superHex > 0) {
                new FlyAwayMsg(this, x, y, '-1', 'red', 'purple')
                this[`${this.player.color}`].superHex--
  
                if (hex.own === 'neutral') hex.setClaming(this.player.color)
                else hex.setClearClame(this.player.color)

              } else new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', 'purple')
            }

            this.hud.updateHexCounter()

          } else if (hex.class === 'base' && hex.color !== this.player.color) new FlyAwayMsg(this, x, y, this.lang.surroundBase, 'yellow', '', 2000)
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
      if (array[0].col < this.world.cols - 1) {
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
    for (let i = 0; i < this.world.cols; i++) {      
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
        innerHexesIsClosed = arr.every(hex => Object.values(hex.nearby).every(id => 
          arr.some(el => el.id === id) || this.getHexByID(id) === null ||
          this.getHexByID(id).color === color || this.getHexByID(id).landscape
        ) && hex.col < this.world.cols - 1)
        if (innerHexesIsClosed) arr.forEach(hex => hex.clame(color))
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
          if (upperHex.color === this.player.color) topHex = upperHex
          else break
        }
    
        for (let i = botHex.row; i < this.world.rows - 1; i++) {
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
    if (hex.y > nextColHex.y && hex.row < this.world.rows - 1) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row + 1)
    return nextColHex
  }

  public getHexByID(id: string): Hex { return this.hexes.find(hex => hex.id === id) }
  public playerHexes(): Hex[] { return this.hexes.filter(hex => hex?.color === this.player.color) }
  public nearbyHexes(hex: Hex): Hex[] { if (hex) return Object.values(hex?.nearby).map(id => { if (this.isValidID(id)) return this.getHexByID(id) }) }
  public outerPlayerHexes(): Hex[] { return this.playerHexes().filter(hex => { if (hex) return this.nearbyHexes(hex).some(el => el?.color !== this.player.color) }) }
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

  public cameraFly(fly: boolean = true): void {
    this.flyAni?.remove()
    this.camera.stopFollow()
    this.camera.panEffect.reset()
    this.camera.zoomEffect.reset()

    if (fly) {
      const worldViewWidth = this.camera.worldView.width / 2 > 0 ? this.camera.worldView.width / 2 : 600
      this.centerCamera(worldViewWidth + 60, 600, true, 2500, 'Quad.easeOut')
      this.flyAni = this.tweens.add({
        onStart: (): void => {
          this.midPoint.setPosition(this.camera.midPoint.x, 600)
          this.camera.startFollow(this.midPoint)
        },
        targets: this.midPoint,
        x: this.worldWidth - worldViewWidth - 60, y: 800,
        duration: 30000,
        delay: 3500,
        ease: 'Quad.easeInOut',
        onComplete: (): void => {
          this.tweens.add({
            targets: this.midPoint,
            x: 1000, y: 1400,
            duration: 30000,
            ease: 'Quad.easeInOut',
            onComplete: (): void => {
              this.tweens.add({
                targets: this.midPoint,
                x: worldViewWidth + 60, y: 600,
                duration: 30000,
                ease: 'Quad.easeInOut',
                onComplete: (): void => { this.cameraFly() }
              })
            }
          })
        }
      })
    }
  }

  
  public gameOverCheck(color): void {
    const hexes = this.hexes.filter(hex => hex.color === color)
    if (hexes.filter(hex => hex.class === 'base').length > 1) this.gameOver('enemyBaseHasCaptured', color)
  }


  public gameOver(reason: string, winner?: string): void {
    if (!this.gameIsOver) {
      this.gameIsOver = true
      this.hud.hide()
  
      if (winner) {
        console.log('game over', winner, reason);
  
      } else {
        const green = this.hexes.filter(hex => hex.color === 'green').length
        const blue = this.hexes.filter(hex => hex.color === 'blue').length
  
        if (green === blue) {
          console.log('game over tie', reason);
          winner = null
        } else if (green > blue) {
          console.log('game over green', reason);
        } else {
          console.log('game over blue', reason);
        }
      }
      
      const win = winner === this.player.color
      if (this.AI) this.AI.remove()
      this.isLaunched = false
      this.scene.launch('Modal', { state: this.state, type: 'gameOver', info: { win, winner, reason } })
    }
  }

  
  public update(): void {
    if (this.isLaunched) {
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
}