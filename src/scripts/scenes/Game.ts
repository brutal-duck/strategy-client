import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
  public player: Iplayer
  public hud: Hud
  public debuging: boolean

  public camera: Phaser.Cameras.Scene2D.Camera
  public midPoint: Phaser.Physics.Arcade.Sprite
  public vector: Phaser.Physics.Arcade.Sprite
  public distanceX: number
  public distanceY: number
  public holdCounter: number
  public press: boolean
  public dragOrZoom: boolean
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
  private hexes: Hex[]
  public pointerHex: Hex
  public chosenHex: Hex 


  public init(state: Istate) {
    this.state = state
    this.player = state.player
    this.player.color = 'red'
    this.hud = this.game.scene.getScene('Hud') as Hud

    this.worldWidth = 2048
    this.worldHeight = 2048
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.press = false
    this.dragOrZoom = false
    new Zoom(this)

    this.hexes = []
    this.hexWidth = 100
    this.hexHeight = 100
    this.startX = 400
    this.startY = 400
    this.rows = 8
    this.cols = 12
  
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
    const offsetY = 100
    const rowPadding = 50
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.startX + (offsetX * col)
        const y = this.startY + (offsetY * row) + (col % 2 !== 0 ? rowPadding : 0)
        this.hexes.push(new Hex(this, x, y, row, col))
      }
    }
    // console.log('createField ~ this.hexes', this.hexes)
  }


  private createWorld(): void {
    this.world = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
  }


  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const vectorStep = this.game.device.os.desktop ? 0.4 : 3.5
    const dragStep = this.game.device.os.desktop ? 1 : 1.5
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


  private setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (): void => {
        if (this.dragOrZoom) this.dragOrZoom = false
        else {
          this.chosenHex = hex
          // console.log('hex.on ~ this.chosenHex', this.chosenHex)
          // this.clearGrayHex()
          hex.clame(this.player.color)
          this.multiClameCheck()
        }
      })
    })
  }


  private multiClameCheck(): void {
    const chains: Array<Hex[]> = []
    let chain: Hex[] = []
    let innerHexes: Hex[] = []
    let innerHexesIsClosed = false

    const findTopAndBotPlayerHexes = (array: Hex[]): { top: Hex, bot: Hex } => {
      // возможно изменяет приходящий массив
      let top = array[0]
      let bot = array[array.length - 1]

      while (top.color !== this.player.color && array.length > 3) {
        array.shift()
        top = array[0]
      }

      while (bot.color !== this.player.color && array.length > 3) {
        array.pop()
        bot = array[array.length - 1]
      }

      const nonPlayerHexes = array.filter(hex => hex.color !== this.player.color).sort((a, b) => a.row - b.row)
      top = array.find(hex => hex.row === nonPlayerHexes[0]?.row - 1)
      bot = array.find(hex => hex.row === nonPlayerHexes[nonPlayerHexes.length - 1]?.row + 1)
      return { top, bot }
    }


    const findInnerHexes = (array: Hex[]): void => {
      // начальная цепь
      array = array.sort((a, b) => a.row - b.row)
      console.log('recurse', array.map(hex => hex.id));

      // верхняя и нижняя очки цепи
      let topHex = array[0]
      let botHex = array[array.length - 1]

      // следующая колонка
      const nextCol = this.nextColHexesBetween(topHex, botHex).sort((a, b) => a.row - b.row)
      console.log('multiClameCheck ~ nextCol', nextCol.map(hex => hex.id))

      const nextColCheck = nextCol.filter(hex => hex.color === this.player.color).length < 2 || nextCol.every(hex => hex.color === this.player.color) || nextCol.every(hex => hex.color !== this.player.color)

      if (nextColCheck) {
        console.log(nextCol.filter(hex => hex.color === this.player.color).length, nextCol.every(hex => hex.color === this.player.color), nextCol.every(hex => hex.color !== this.player.color), 'return');
        return
      }
      
      const { top, bot } = findTopAndBotPlayerHexes(nextCol)
      console.log('findInnerHexes ~ hex', top?.id, bot?.id)

      if (top && bot) {
        innerHexes = innerHexes.concat(nextCol.filter(hex => hex.row > top.row && hex.row < bot.row))
        findInnerHexes(this.hexesBeetween(top, bot))
      } else {
        console.log('return');
        return
      }
    }


    console.log('____________________');
    
    for (let i = 0; i < this.cols; i++) {
      const colHexes: Hex[] = this.hexes.filter(hex => hex.col === i && hex.color === this.player.color).sort((a, b) => a.row - b.row)
      // console.log('globalClameCheck ~ rowHexes', colHexes.map(hex => hex.id))
      
      if (colHexes.length > 1) {
        // console.log('multiClameCheck ~ colHexes.length', colHexes.length)

        for (let j = 0; j < colHexes.length; j++) {
          if (!chain.length) {
            // console.log('f push');
            chain.push(colHexes[j])
            continue
          }
          
          if (chain.length > 0 && colHexes[j].row === chain[chain.length - 1].row + 1) {
            // console.log('push');
            chain.push(colHexes[j])
          } else if (chain.length > 1) {
            // console.log('chain push');
            chains.push(chain)
            chain = [colHexes[j]]
          } else {
            // console.log('no chains');
            chain = [colHexes[j]]
          }

          if (i === colHexes.length - 1 && chain.length > 1) {
            // console.log('chain last push');
            chains.push(chain)
            chain = []
          }
          
          // console.log(j, chain.map(hex => hex.id))
        }

      }
    }

    if (chain.length > 1) chains.push(chain)
    console.log('multiClameCheck ~ chains', chains.map(arr => arr.map(hex => hex.id)))
    

    chains.forEach(arr => findInnerHexes(arr))

    if (innerHexes.length > 0) {
      innerHexes.sort((a, b) => b.col - a.col)
      console.log('multiClameCheck ~ innerHexes', innerHexes.map(hex => hex.id))
      const lastColInnerHexes = innerHexes.filter(hex => hex.col === innerHexes[0].col)
      const topHex = lastColInnerHexes[0]
      const botHex = lastColInnerHexes[lastColInnerHexes.length - 1]
      innerHexesIsClosed = this.nextColHexesBetween(topHex, botHex).every(hex => hex.color === this.player.color)
      console.log('~ this.nextColHexesBetween(topHex, botHex)', this.nextColHexesBetween(topHex, botHex).map(hex => hex.id), innerHexesIsClosed)
    }

    if (innerHexesIsClosed) innerHexes.forEach(hex => hex.clame(this.player.color))
    
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

    // this.events.on('preupdate', (): void => {
    // })
  }


  private clearGrayHex(): void {
    this.hexes.filter(hex => hex.color = 'gray').forEach(hex => hex.setColor('white'))
  }

  private hexesBeetween(topHex: Hex, botHex: Hex): Hex[] {
    return this.hexes.filter(hex => hex.col === topHex.col && hex.row >= topHex.row && hex.row <= botHex.row)
  }

  private nextColHexesBetween(topHex: Hex, botHex: Hex): Hex[] {
    return this.hexes.filter(hex => hex.col === this.findTopRightHex(topHex).col && hex.row >= this.findTopRightHex(topHex).row && hex.row <= this.findBottomRightHex(botHex).row)
  }

  private findTopRightHex(hex: Hex): Hex {
    const nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    return hex.y > nextColHex.y ? nextColHex : this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row - 1)
  }

  private findBottomRightHex(hex: Hex): Hex {
    const nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    return hex.y < nextColHex.y ? nextColHex : this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row + 1)
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