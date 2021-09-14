import Zoom from "../components/Zoom"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate

  public press: boolean
  private camera: Phaser.Cameras.Scene2D.Camera

  private world: Phaser.GameObjects.TileSprite
  private hexSprites: any[]

  public init(state: Istate) {
    this.state = state
    this.press = false
    this.hexSprites = []
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, 4096, 4096);
    this.matter.world.setBounds(0, 0, 4096, 4096);
    new Zoom(this)
  }

  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)

    for (let i = 0; i < 20; i++) {
      let hex = this.matter.add.sprite(0, 0, 'hex').setDepth(1)
      if (i < 10) hex.setPosition(this.camera.centerX - 150 + i * 300, this.camera.centerY).setPolygon(100, 6).setInteractive()
      else hex.setPosition(this.camera.centerX + (i - 10) * 300, this.camera.centerY + 300).setPolygon(100, 6).setInteractive()
      this.hexSprites.push(hex)
    }

    this.world = this.add.tileSprite(0, 0, 4096, 4096, 'pixel').setOrigin(0).setAlpha(0.0001).setInteractive({ draggable: true })
    this.setScroll()
    this.setHexInteractive()


    let hex = this.matter.add.sprite(this.camera.centerX, this.camera.centerY, 'hex').setDepth(3).setTint(0x880000).setBody({
      
    })
    
  }


  private setScroll(): void {
    let moveCounter = 0
    const holdedPoint = { x: 0, y: 0 }
    const midPoint: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000)

    // this.input.on('pointerdown', (): void => { moveCounter = 0 })

    // this.input.on('pointermove', (): void => {
    //   if (this.input.pointer1.isDown) moveCounter++
    //   console.log('this.input.on ~ moveCounter', moveCounter)
    //   if (moveCounter > 5) this.world.setDepth(this.hexSprites[0].depth)
    // })

    // this.input.on('pointerup', (): void => { this.world.setDepth(this.hexSprites[0].depth - 1) })

    this.world.on('dragstart', (pointer): void => {
      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y
      midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y)
      this.camera.startFollow(midPoint)
    })

    this.world.on('drag', (pointer): void => {
      moveCounter++

      if (!this.input.pointer2.isDown && moveCounter > 5) {
        this.world.setDepth(this.hexSprites[0].depth)

        const diffrenceX = holdedPoint.x - pointer.x
        holdedPoint.x = pointer.x

        const diffrenceY = holdedPoint.y - pointer.y
        holdedPoint.y = pointer.y

        midPoint.setPosition(midPoint.x + diffrenceX, midPoint.y + diffrenceY)
      }
    })

    this.world.on('dragand', (): void => {
      moveCounter = 0
      this.camera.stopFollow()
      this.world.setDepth(0)
    })

  }

  private setHexInteractive(): void {
    this.hexSprites.forEach(hex => hex.on('pointerup', (): void => { console.log('!') }))
  }
}