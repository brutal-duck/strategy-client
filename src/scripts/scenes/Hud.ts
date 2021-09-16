import Game from "./Game"

export default class Hud extends Phaser.Scene {
  constructor() {
    super('Hud')
  }

  public state: Istate
  public gameScene: Game

  private debugText: Phaser.GameObjects.Text

  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
  }
  
  public create(): void {
    this.debugText = this.add.text(-6, -3, '', { font: '10px Colus', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-7)
  }


  private debug(): void {
    let text = `
      desktop:  ${this.game.device.os.desktop}\n
      android:  ${this.game.device.os.android}\n
      width:  ${this.gameScene?.camera.width}\n
      height:  ${this.gameScene?.camera.height}\n
      worldView_width:  ${this.gameScene?.camera.worldView.width}\n
      worldView_height:  ${this.gameScene?.camera.worldView.height}\n
      zoom:  ${this.gameScene?.camera.zoom}\n
      rows:  ${this.gameScene?.rows}\n
      cols:  ${this.gameScene?.cols}\n
      Pointer:  ${this.gameScene?.pointerHex?.id}\n
      chosen:  ${this.gameScene?.chosenHex?.id}\n
      pointer-x:  ${this.gameScene.input.mousePointer.x}\n
      pointer-y:  ${this.gameScene.input.mousePointer.y}\n
      drag_Or_Zoom:  ${this.gameScene.dragOrZoom}\n
      hold_Counter:  ${this.gameScene.holdCounter}\n
    `
    this.debugText?.setText(text)
  }


  public update(): void {
    if (this.gameScene.debuging) this.debug()
  }
}