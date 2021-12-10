import StartGameBtn from "../components/buttons/StartGameBtn"
import langs from "../langs"
import Game from "./Game"
const TEXT_DISPLAY_PERCENT = 5;
const BTN_DISPLAY_PERCENT = 30;

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  public state: Istate;
  public lang: any;
  private camera: Phaser.Cameras.Scene2D.BaseCamera;
  public gameScene: Game;
  private title: Phaser.GameObjects.Text;
  private startGame: StartGameBtn;
  private name: Phaser.GameObjects.Text;
  private points: Phaser.GameObjects.Text;

  public init(state: Istate): void {
    this.state = state;
    this.lang = langs.ru;
    this.camera = this.cameras.main;
    this.gameScene = this.game.scene.keys['Game'];
    this.gameScene.cameraFly(true);
    this.state.game.AI = '';
  }
  
  public create(): void {
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const currentBtnHeight = Math.round(document.body.clientHeight / 100 * BTN_DISPLAY_PERCENT);
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: `${curFontSize}px`,
      align: 'center',
      color: 'white',
      stroke: 'black',
      strokeThickness: 4,
    };
    this.add.tileSprite(0, 0, this.camera.width, this.camera.height, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0.001).setInteractive();
    this.title = this.add.text(this.camera.centerX, this.camera.centerY - currentBtnHeight / 2, this.lang.gameName, titleStyle).setOrigin(0.5, 1);

    const position: Iposition = {
      x: this.cameras.main.centerX,
      y: this.title.getBottomCenter().y + currentBtnHeight / 2,
    };
    const action = (): void => {
      this.scene.launch('Modal', { state: this.state, type: 'mainMenu' });
    }

    this.startGame = new StartGameBtn(this, position, action, this.lang.play);
    this.startGame.setScale(currentBtnHeight / 245, curFontSize + curFontSize * 0.20);

    this.createUserInfo();
  }

  private createUserInfo(): void {
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: `${curFontSize}px`,
      fontFamily: 'Molot',
      color: 'white',
      stroke: 'black',
      strokeThickness: 4,
    };
    const { name, points } = this.state.player;
    this.name = this.add.text(20, curFontSize / 2, name, style).setOrigin(0);
    this.points = this.add.text(20, this.name.getBounds().bottom, `${this.lang.points} ${points}`, style).setOrigin(0);

  }

  public resize(): void {
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const currentBtnHeight = Math.round(document.body.clientHeight / 100 * BTN_DISPLAY_PERCENT);
    this.title.setPosition(this.camera.centerX, this.camera.centerY - 100).setFontSize(curFontSize);
    this.name.setPosition(20, curFontSize / 2).setFontSize(curFontSize);
    this.points.setPosition(20, this.name.getBounds().bottom).setFontSize(curFontSize);
    this.startGame.x = this.camera.centerX;
    this.startGame.y = this.title.getBottomCenter().y + currentBtnHeight / 2;
    this.startGame.setScale(currentBtnHeight / 245, curFontSize + curFontSize * 0.20);
  }


  public update(): void {
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