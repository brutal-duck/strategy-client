import Modal from '../../scenes/Modal';
import ExitBtn from '../../components/buttons/ExitBtn';
import MenuBtn from '../../components/buttons/MenuBtn';

export default class Menu {
  private scene: Modal;
  private elements: any[] = [];
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
    const windowHeight = 470;

    this.top = this.scene.add.sprite(x, y - windowHeight / 2 - 50, 'header-mid').setOrigin(0.5, 0);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    this.title = this.scene.add.text(x, topGeom.bottom + 30, this.scene.lang.menu, textStyle).setOrigin(0.5).setDepth(2);
    this.exit = new ExitBtn(this.scene, { x: topGeom.right - 45, y: topGeom.bottom + 30}, (): void => { this.scene.scene.stop(); });

    this.btn1 = new MenuBtn(
      this.scene, 
      { x: x, y: midGeom.centerY + 150}, 
      (): void => { this.scene.scene.restart({ state: this.scene.state, type: 'multiplayerMenu' }); },
      'multiplayer',
    );
    this.btn2 = new MenuBtn(
      this.scene, 
      { x: x, y: midGeom.centerY }, 
      (): void => { this.scene.scene.restart({ state: this.scene.state, type: 'singleplayerMenu' }); },
      'singleplayer',
    );
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 470;

    this.top.setPosition(x, y - windowHeight / 2 - 50);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(x, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(midGeom.centerX, midGeom.bottom);
    this.title.setPosition(x, topGeom.bottom + 30);
    this.exit.setPosition(topGeom.right - 45, topGeom.bottom + 30);
    this.btn1.setPosition(x, y + 150);
    this.btn2.setPosition(x, y);
  }
}