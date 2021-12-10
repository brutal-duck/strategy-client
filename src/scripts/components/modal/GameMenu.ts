import Modal from './../../scenes/Modal';
import ExitBtn from '../../components/buttons/ExitBtn';
import MenuBtn from '../../components/buttons/MenuBtn';

export default class GameMenu {
  private scene: Modal;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private exit: ExitBtn;
  private btn1: MenuBtn;
  private btn2: MenuBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.createElements();
  }

  private createElements(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#CFCDCA',
    };
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 250;

    this.top = this.scene.add.sprite(x, y - windowHeight / 2 - 100, 'header-mid').setOrigin(0.5, 0);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    this.title = this.scene.add.text(x, topGeom.bottom + 30, this.scene.lang.menu, textStyle).setOrigin(0.5).setDepth(2);
    this.exit = new ExitBtn(this.scene, { x: topGeom.right - 45, y: topGeom.bottom + 30}, (): void => { this.scene.scene.stop(); });

    // this.btn1 = new MenuBtn(this.scene, { x: x, y: midGeom.centerY }, (): void => { console.log('settings'); });
    this.btn2 = new MenuBtn(this.scene, { x: x, y: midGeom.centerY + 20 }, (): void => { this.stopGame(); }, 'escape');
  }

  private stopGame(): void {
    this.scene.scene.stop();
    this.scene.gameScene.gameIsOn = false;
    this.scene.gameScene.hud.scene.stop();
    this.scene.gameScene.world.recreate(this.scene.gameScene.gameIsOn);
    if (this.scene.state.game.AI) this.scene.gameScene.AI.remove();
    if (!this.scene.state.game.AI) this.scene.state.socket?.closeSocket();
    this.scene.scene.start('MainMenu', this.scene.state);
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 390;

    this.top.setPosition(x, y - windowHeight / 2 - 100);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(topGeom.centerX, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(midGeom.centerX, midGeom.bottom);
    this.title.setPosition(x, topGeom.bottom + 30);

    this.exit.setPosition(topGeom.right - 45, topGeom.bottom + 30);
    this.btn1.setPosition(x, midGeom.centerY);
    this.btn2.setPosition(x, midGeom.centerY + 120);
  }
}