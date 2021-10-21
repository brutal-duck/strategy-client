import Modal from './../../scenes/Modal';
import StartGameBtn from './../buttons/StartGameBtn';
import ExitBtn from './../buttons/ExitBtn';

export default class SingleplayerMenu {
  private scene: Modal;
  private level: string;
  private easyCircle: Phaser.GameObjects.Sprite;
  private normalCircle: Phaser.GameObjects.Sprite;
  private hardCircle: Phaser.GameObjects.Sprite;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private easyPlate: Phaser.GameObjects.Sprite;
  private normalPlate: Phaser.GameObjects.Sprite;
  private hardPlate: Phaser.GameObjects.Sprite;
  private easyCircleInner: Phaser.GameObjects.Sprite;
  private normalCircleInner: Phaser.GameObjects.Sprite;
  private hardCircleInner: Phaser.GameObjects.Sprite;
  private easyText: Phaser.GameObjects.Text;
  private normalText: Phaser.GameObjects.Text;
  private hardText: Phaser.GameObjects.Text;
  private exit: ExitBtn;
  private btn: StartGameBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.level = '';
    this.createElements();
    this.setLevel('easy');
  }

  private createElements(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#CFCDCA',
    };

    const levelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '30px',
      color: '#83DE25',
    };

    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 470;

    this.top = this.scene.add.sprite(x, y - windowHeight / 2 - 50, 'header-mid').setOrigin(0.5, 0);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    this.title = this.scene.add.text(x, topGeom.bottom + 30, this.scene.lang.choiceOfDifficulty, textStyle).setOrigin(0.5).setDepth(2);

    this.easyPlate = this.scene.add.sprite(x, this.title.getBounds().bottom + 50, 'modal-plate').setOrigin(0.5, 0).setInteractive();
    this.easyPlate.on('pointerup', () => { this.setLevel('easy'); });
    const easyPlateGeom = this.easyPlate.getBounds();
    this.normalPlate = this.scene.add.sprite(x, easyPlateGeom.bottom + 10, 'modal-plate').setOrigin(0.5, 0).setInteractive();
    this.normalPlate.on('pointerup', () => { this.setLevel('normal'); });
    const normalPlateGeom = this.normalPlate.getBounds();

    this.hardPlate = this.scene.add.sprite(x, normalPlateGeom.bottom + 10, 'modal-plate').setOrigin(0.5, 0);
    const hardPlateGeom = this.hardPlate.getBounds();

    this.easyCircleInner = this.scene.add.sprite(easyPlateGeom.left + 40, easyPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    this.normalCircleInner = this.scene.add.sprite(normalPlateGeom.left + 40, normalPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    this.hardCircleInner = this.scene.add.sprite(hardPlateGeom.left + 40, hardPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    
    this.easyText = this.scene.add.text(easyPlateGeom.centerX + 20, easyPlateGeom.centerY, this.scene.lang.easy, levelStyle).setOrigin(0.5);
    this.normalText = this.scene.add.text(normalPlateGeom.centerX + 20, normalPlateGeom.centerY, this.scene.lang.normal, levelStyle).setColor('#FEC100').setOrigin(0.5);
    this.hardText = this.scene.add.text(hardPlateGeom.centerX + 20, hardPlateGeom.centerY, this.scene.lang.hard, levelStyle).setColor('#D5D1D5').setOrigin(0.5);

    this.easyCircle = this.scene.add.sprite(easyPlateGeom.left + 40, easyPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);
    this.normalCircle = this.scene.add.sprite(normalPlateGeom.left + 40, normalPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);
    this.hardCircle = this.scene.add.sprite(hardPlateGeom.left + 40, hardPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);

    this.btn = new StartGameBtn(this.scene, { x: x, y: hardPlateGeom.bottom + 90 }, () => {
      this.startSinglePlayerGame();
    }, this.scene.lang.play).setScale(0.5);
    this.exit = new ExitBtn(
      this.scene,
      { x: topGeom.right - 45, y: topGeom.bottom + 30},
      (): void => { this.scene.scene.restart({ state: this.scene.state, type: 'mainMenu' });},
    );
  }

  private setLevel(level: string) {
    if (level === this.level) return;
    this.level = level;
    this.easyCircle?.setVisible(this.level === 'easy');
    this.normalCircle?.setVisible(this.level === 'normal');
    this.hardCircle?.setVisible(this.level === 'hard');
  }

  private startSinglePlayerGame(): void {
    this.scene.state.game.AI = this.level;
    this.scene.state.socket.clearState();
    this.scene.state.player.color = Phaser.Math.Between(0, 1) === 0 ? 'green' : 'red';
    this.scene.gameScene.cameraFly(true, false);
    this.scene.scene.stop();
    this.scene.scene.stop('MainMenu');
    this.scene.scene.start('Hud', this.scene.state);
    this.scene.gameScene.launch(this.scene.state);
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 470;

    this.top.setPosition(x, y - windowHeight / 2 - 50);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(topGeom.centerX, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(midGeom.centerX, midGeom.bottom);

    this.title.setPosition(x, topGeom.bottom + 30);

    this.easyPlate.setPosition(x, this.title.getBounds().bottom + 50);
    const easyPlateGeom = this.easyPlate.getBounds();
    this.normalPlate.setPosition(x, easyPlateGeom.bottom + 10);
    const normalPlateGeom = this.normalPlate.getBounds();

    this.hardPlate.setPosition(x, normalPlateGeom.bottom + 10);
    const hardPlateGeom = this.hardPlate.getBounds();

    this.easyCircleInner.setPosition(easyPlateGeom.left + 40, easyPlateGeom.centerY);
    this.normalCircleInner.setPosition(normalPlateGeom.left + 40, normalPlateGeom.centerY);
    this.hardCircleInner.setPosition(hardPlateGeom.left + 40, hardPlateGeom.centerY);
    
    this.easyText.setPosition(easyPlateGeom.centerX + 20, easyPlateGeom.centerY);
    this.normalText.setPosition(normalPlateGeom.centerX + 20, normalPlateGeom.centerY);
    this.hardText.setPosition(hardPlateGeom.centerX + 20, hardPlateGeom.centerY);

    this.easyCircle.setPosition(easyPlateGeom.left + 40, easyPlateGeom.centerY);
    this.normalCircle.setPosition(normalPlateGeom.left + 40, normalPlateGeom.centerY);
    this.hardCircle.setPosition(hardPlateGeom.left + 40, hardPlateGeom.centerY);

    this.btn.setPosition(x, hardPlateGeom.bottom + 90);
    this.exit.setPosition(topGeom.right - 45, topGeom.bottom + 30);
  }
}