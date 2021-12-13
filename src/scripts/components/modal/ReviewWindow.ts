import Modal from '../../scenes/Modal';
import ColorsBtn from '../buttons/ColorsBtn';

export default class ReviewWindow {
  private scene: Modal;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private btn1: ColorsBtn;
  private btn2: ColorsBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.createElements();
  }

  private createElements(): void {
    const x = this.scene.bg.getCenter().x
    const y = this.scene.bg.getCenter().y
    const windowHeight = 230;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '21px',
      color: '#A893F5',
      align: 'center',
      wordWrap: { width: 250 }
    };
    this.top = this.scene.add.sprite(x, y - 180, 'header-lil').setOrigin(0.5, 0);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom,  'pixel-window-lil').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(topGeom.centerX, midGeom.bottom, 'header-lil').setFlipY(true).setOrigin(0.5, 0);

    this.title = this.scene.add.text(x, topGeom.bottom + 10, this.scene.lang.sendRewiew, textStyle).setOrigin(0.5, 0).setDepth(2);

    this.btn1 = new ColorsBtn(
      this.scene,
      { x: x - 64, y: midGeom.centerY + 70 },
      (): void => { this.scene.scene.stop(); }, 
      {
        color: 'red',
        text: this.scene.lang.no,
        icon: false,
      }
    );

    this.btn2 = new ColorsBtn(
      this.scene,
      { x: x + 64, y: midGeom.centerY + 70 },
      (): void => { 
        window.open(process.env.VK_SUPPORT_LINK, '_blank');
        this.scene.scene.stop();
      },
      {
        color: 'green',
        text: this.scene.lang.yes,
        icon: false,
      }
    );
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 160;
    this.top.setPosition(x, y - 180);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(topGeom.centerX, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(topGeom.centerX, midGeom.bottom);
    this.title.setPosition(x, topGeom.bottom + 10);
    this.btn1.setPosition(x - 64, midGeom.centerY + 50);
    this.btn2.setPosition(x + 64, midGeom.centerY + 50);
  }
}