import MainMenuBtn from "../components/buttons/MainMenuBtn"
import langs from "../langs"

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu')
  }

  public state: Istate
  public lang: any

  private camera: Phaser.Cameras.Scene2D.BaseCamera
  private AI: boolean

  private title: Phaser.GameObjects.Text
  private newGame: MainMenuBtn

  private AIcheckBox: Phaser.GameObjects.Sprite
  private AIcheckBoxCross: Phaser.GameObjects.Sprite
  private AIcheckBoxText: Phaser.GameObjects.Text


  public init(state: Istate): void {
    this.state = state
    this.lang = langs.ru
    this.camera = this.cameras.main
    // this.AI = this.state.game.AI
  }

  public create(): void {
    this.title = this.add.text(this.camera.centerX, this.camera.centerY - 200, this.lang.gameName, {
      font: '40px Molot', align: 'center', color: 'white'
    }).setOrigin(0.5, 0).setStroke('black', 4)

    this.newGame = new MainMenuBtn(this, this.camera.centerX, this.title.y + 200)
    this.newGame.border.on('pointerup', (): void => { this.matchMaking() })

    this.createAICheckBox()
  }

  private createAICheckBox(): void {
    this.AIcheckBox = this.add.sprite(this.newGame.x - 5, this.newGame.y + 100, 'block').setScale(0.225).setTint(0xc6ff98).setOrigin(1, 0.5).setInteractive()
    this.AIcheckBoxText = this.add.text(this.newGame.x + 5, this.AIcheckBox.y, this.lang.ai, { font: '32px Molot', color: 'white' }).setOrigin(0, 0.5).setStroke('black', 3)
    this.AIcheckBoxCross = this.add.sprite(this.AIcheckBox.getCenter().x, this.AIcheckBox.getCenter().y, 'cross').setScale(0.6).setTint(0x00c441).setVisible(this.state.game.AI)

    this.AIcheckBox.on('pointerup', (): void => {
      this.state.game.AI = !this.state.game.AI
      this.AIcheckBoxCross.setVisible(this.state.game.AI)
    })
  }


  private matchMaking(): void {
    this.state.player.color = Phaser.Math.Between(0, 1) === 0 ? 'red' : 'blue'
    this.scene.stop()
    this.scene.start('Game', this.state)
    this.scene.start('Hud', this.state)
  }


  public resize(): void {
    this.title.setPosition(this.camera.centerX, this.camera.centerY - 200)
    this.newGame.setPosition(this.camera.centerX, this.title.y + 200)
    this.AIcheckBox.setPosition(this.newGame.x - 5, this.newGame.y + 100)
    this.AIcheckBoxText.setPosition(this.newGame.x + 5, this.AIcheckBox.y)
    this.AIcheckBoxCross.setPosition(this.AIcheckBox.getCenter().x, this.AIcheckBox.getCenter().y)
  }
}