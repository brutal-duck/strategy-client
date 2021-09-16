import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
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
    this.startX = 400
    this.startY = 400
    this.rows = 26
    this.cols = 8
  
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
    const rowPadding = 50
    const colPadding = 150
    const offsetX = 75

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.startX + (col * colPadding) + (row % 2 === 0 || row === 0 ? 0 : offsetX)
        const y = this.startY + (row * rowPadding)
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
    const step = this.game.device.os.desktop ? 0.4 : 3.5

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x008800).setDepth(10)
    console.log('setInput ~ midPoint', this.midPoint)

    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10
    let ani: Phaser.Tweens.Tween

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
        console.log('this.world.on ~ diffrenceX', diffrenceX)
        let x = this.midPoint.x + (diffrenceX * (step / 2))
        holdedPoint.x = pointer.x

        const diffrenceY = holdedPoint.y - pointer.y
        let y = this.midPoint.y + (diffrenceY * (step / 2))
        holdedPoint.y = pointer.y

        if (diffrenceX > 0) this.distanceX += step
        else if (diffrenceX < 0) this.distanceX -= step
        
        if (diffrenceY > 0) this.distanceY += step
        else if (diffrenceY < 0) this.distanceY -= step


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
          this.clearGrayHex()
          hex.click()
          console.log('hex.on ~ this.chosenHex', this.chosenHex)
        }
      })
    })
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