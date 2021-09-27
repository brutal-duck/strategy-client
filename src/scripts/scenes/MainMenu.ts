import MainMenuBtn from "../components/buttons/MainMenuBtn"
import langs from "../langs"

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu')
  }

  public state: Istate
  public lang: any

  private camera: Phaser.Cameras.Scene2D.BaseCamera
  private newGame: MainMenuBtn


  public init(state: Istate): void {
    this.state = state
    this.lang = langs.ru
    this.camera = this.cameras.main
  }

  public create(): void {
    const title: Phaser.GameObjects.Text = this.add.text(this.camera.centerX, 200, this.lang.gameName, {
      font: '40px Molot', align: 'center', color: 'white'
    }).setOrigin(0.5, 0).setStroke('black', 4)

    this.newGame = new MainMenuBtn(this, this.camera.centerX, this.camera.centerY)
    this.newGame.border.on('pointerup', (): void => {
      this.scene.stop()
      this.scene.start('Game', this.state)
      this.scene.start('Hud', this.state)
    })
  }
}