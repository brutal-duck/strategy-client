import StartGameBtn from "../components/buttons/StartGameBtn"
import langs from "../langs"
import Game from "./Game"

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu')
  }

  public state: Istate
  public lang: any

  private camera: Phaser.Cameras.Scene2D.BaseCamera
  public gameScene: Game

  private title: Phaser.GameObjects.Text
  private debug: Phaser.GameObjects.Text
  private startGame: StartGameBtn;

  public init(state: Istate): void {
    this.state = state
    this.lang = langs.ru
    this.camera = this.cameras.main
    this.gameScene = this.game.scene.keys['Game']
    this.gameScene.cameraFly(true)
    this.state.game.AI = ''
  }
  
  public create(): void {
    this.add.tileSprite(0, 0, this.camera.width, this.camera.height, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0.001).setInteractive()
    this.title = this.add.text(this.camera.centerX, this.camera.centerY - 200, this.lang.gameName, {
      font: '40px Molot', align: 'center', color: 'white'
    }).setOrigin(0.5, 0).setStroke('black', 4)

    const position: Iposition = {
      x: this.cameras.main.centerX,
      y: this.title.y + 200,
    };
    const action = (): void => {
      this.scene.launch('Modal', { state: this.state, type: 'mainMenu' });
      // this.startGame.setText(this.lang.launch)
      // this.matchMaking()
    }

    this.startGame = new StartGameBtn(this, position, action, this.lang.play);

    // this.debug = this.add.text(this.title.x, this.title.y, '', { font: '24px Molot', align: 'left', color: 'black' }).setOrigin(0, 1)
    // this.createAICheckBox()
  }


  public resize(): void {
    this.title.setPosition(this.camera.centerX, this.camera.centerY - 200)
    this.startGame.x = this.camera.centerX;
    this.startGame.y = this.title.y + 200;
  }


  public update(): void {
    // this.debug.setText(`
    //   x: ${Math.round(this.gameScene.camera.midPoint.x)}
    //   w: ${Math.round(this.gameScene.camera.worldView.width)}
    // `)
    if (this.state.startGame) {
      this.state.socket.clearState();
      this.state.startGame = false;
      if (this.state.game.AI) this.state.player.color = Phaser.Math.Between(0, 1) === 0 ? 'green' : 'red'
      this.gameScene.cameraFly(true, false)
      this.scene.stop()
      this.scene.stop('Modal');
      this.scene.start('Hud', this.state)
      this.gameScene.launch(this.state)
    }
  }
}