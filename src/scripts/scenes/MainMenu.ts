import MainMenuBtn from "../components/buttons/MainMenuBtn"
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
  private newGame: MainMenuBtn
  private AIcheckBoxNormal: Phaser.GameObjects.Sprite
  private AIcheckBoxEasy: Phaser.GameObjects.Sprite
  private AIcheckBoxTextNormal: Phaser.GameObjects.Text
  private AIcheckBoxTextEasy: Phaser.GameObjects.Text
  private AIText: Phaser.GameObjects.Text
  private AIcheckBoxCross: Phaser.GameObjects.Sprite

  private debug: Phaser.GameObjects.Text


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

    this.newGame = new MainMenuBtn(this, this.camera.centerX, this.title.y + 200)
    this.newGame.border.on('pointerup', (): void => {
      this.newGame.block(this.lang.launch)
      this.matchMaking()
    })

    // this.debug = this.add.text(this.title.x, this.title.y, '', { font: '24px Molot', align: 'left', color: 'black' }).setOrigin(0, 1)
    this.createAICheckBox()
  }


  private createAICheckBox(): void {
    this.AIText = this.add.text(this.newGame.x, this.newGame.border.getBottomCenter().y + 2, this.lang.ai, { font: '32px Molot', color: 'white' }).setOrigin(0.5, 0).setStroke('black', 3)
    this.AIcheckBoxEasy = this.add.sprite(this.AIText.x - 20, this.AIText.getBottomCenter().y + 6, 'block').setScale(0.225).setTint(0xef8e8e).setOrigin(1, 0).setInteractive()
    this.AIcheckBoxTextEasy = this.add.text(this.AIcheckBoxEasy.x + 5, this.AIcheckBoxEasy.getCenter().y, this.lang.easy, { font: '32px Molot', color: 'white' }).setOrigin(0, 0.5).setStroke('black', 3)
    this.AIcheckBoxNormal = this.add.sprite(this.AIcheckBoxEasy.getCenter().x, this.AIcheckBoxEasy.getBottomCenter().y + 6, 'block').setScale(0.225).setTint(0xef8e8e).setOrigin(0.5, 0).setInteractive()
    this.AIcheckBoxTextNormal = this.add.text(this.AIcheckBoxNormal.getRightCenter().x + 5, this.AIcheckBoxNormal.getCenter().y, this.lang.normal, { font: '32px Molot', color: 'white' }).setOrigin(0, 0.5).setStroke('black', 3)
    this.AIcheckBoxCross = this.add.sprite(this.AIcheckBoxNormal.getCenter().x, this.AIcheckBoxNormal.getCenter().y, 'cross').setScale(0.6).setTint(0xc54242).setVisible(false)

    this.AIcheckBoxNormal.on('pointerup', (): void => {
      if (!this.AIcheckBoxCross.visible || this.state.game.AI === 'easy') {
        this.state.game.AI = 'normal'
        this.AIcheckBoxCross.setPosition(this.AIcheckBoxNormal.getCenter().x, this.AIcheckBoxNormal.getCenter().y).setVisible(true)
      } else {
        this.state.game.AI = ''
        this.AIcheckBoxCross.setVisible(false)
      }
    })

    this.AIcheckBoxEasy.on('pointerup', (): void => {
      if (!this.AIcheckBoxCross.visible || this.state.game.AI === 'normal') {
        this.state.game.AI = 'easy'
        this.AIcheckBoxCross.setPosition(this.AIcheckBoxEasy.getCenter().x, this.AIcheckBoxEasy.getCenter().y).setVisible(true)
      } else {
        this.state.game.AI = ''
        this.AIcheckBoxCross.setVisible(false)
      }
    })
  }


  private matchMaking(): void {
    this.state.player.color = Phaser.Math.Between(0, 1) === 0 ? 'green' : 'red'
    this.gameScene.cameraFly(true, false)
    this.scene.stop()
    this.scene.start('Hud', this.state)
    this.gameScene.launch(this.state)
  }


  public resize(): void {
    this.title.setPosition(this.camera.centerX, this.camera.centerY - 200)
    this.newGame.setPosition(this.camera.centerX, this.title.y + 200)
    this.AIText.setPosition(this.newGame.border.getCenter().x, this.newGame.border.getBottomCenter().y + 2)
    this.AIcheckBoxEasy.setPosition(this.AIText.x - 20, this.AIText.getBottomCenter().y + 6)
    this.AIcheckBoxTextEasy.setPosition(this.AIcheckBoxEasy.x + 5, this.AIcheckBoxEasy.getCenter().y)
    this.AIcheckBoxNormal.setPosition(this.AIcheckBoxEasy.getCenter().x, this.AIcheckBoxEasy.getBottomCenter().y + 6)
    this.AIcheckBoxTextNormal.setPosition(this.AIcheckBoxNormal.getRightCenter().x + 5, this.AIcheckBoxNormal.getCenter().y)
    this.AIcheckBoxCross.setPosition(this.AIcheckBoxNormal.getCenter().x, this.AIcheckBoxNormal.getCenter().y)
  }


  public update(): void {
    // this.debug.setText(`
    //   x: ${Math.round(this.gameScene.camera.midPoint.x)}
    //   w: ${Math.round(this.gameScene.camera.worldView.width)}
    // `)
  }
}