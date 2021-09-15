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

  public press: boolean
  public draging: boolean
  public camera: Phaser.Cameras.Scene2D.Camera

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
    this.press = false
    this.draging = false
    this.hexes = []
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, 2048, 2048)

    this.startX = 400
    this.startY = 400
    this.rows = 26
    this.cols = 8

    this.debuging = true
    new Zoom(this)
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    
    this.createWorld()
    this.createField()
    this.setInput()
    this.setHexInteractive()

    console.log('init ~ this.camera', this.camera)
    // console.log('create ~ this.input', this.input)

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
    console.log('createField ~ this.hexes', this.hexes)
  }


  private createWorld(): void {
    this.world = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
  }


  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const midPoint: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000).setDepth(10)
    const midPointBorders = {
      x1: this.camera.width / 2,
      x2: this.camera.getBounds().width - this.camera.width / 2,
      y1: this.camera.height / 2,
      y2: this.camera.getBounds().height - this.camera.height / 2,
    }
    console.log('setInput ~ midPointBorders', midPointBorders)
    
    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10

    this.world.on('dragstart', (pointer): void => {
      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y
      midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y)
      this.camera.startFollow(midPoint)
      this.draging = true
    })

    this.world.on('drag', (pointer): void => {
      if (!this.input.pointer2.isDown && this.draging) {
        const diffrenceX = holdedPoint.x - pointer.x
        let x = midPoint.x + diffrenceX
        holdedPoint.x = pointer.x

        const diffrenceY = holdedPoint.y - pointer.y
        let y = midPoint.y + diffrenceY
        holdedPoint.y = pointer.y

        if (x < midPointBorders.x1) x = midPointBorders.x1
        else if (x > midPointBorders.x2) x = midPointBorders.x2

        if (y < midPointBorders.y1) y = midPointBorders.y1
        else if (y > midPointBorders.y2) y = midPointBorders.y2

        midPoint.setPosition(x, y)
      }
    })

    this.world.on('dragend', (pointer: Phaser.Input.Pointer): void => {
      this.camera.stopFollow()
      this.input.mousePointer.camera = this.camera
    })
  }


  private setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (pointer): void => {
        if (this.draging) this.draging = false
        else {
          this.chosenHex = hex
          this.clearGrayHex()
          hex.click()
          console.log('hex.on ~ this.chosenHex', this.chosenHex)
        }
      })
    })
  }

  private clearGrayHex(): void {
    this.hexes.filter(hex => hex.color = 'gray').forEach(hex => hex.setColor('white'))
  }


  public update(): void {
    // console.log(this.input.activePointer.y);
  }
}