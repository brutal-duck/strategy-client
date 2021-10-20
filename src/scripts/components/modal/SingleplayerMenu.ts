import Modal from './../../scenes/Modal';
import StartGameBtn from './../buttons/StartGameBtn';
import ExitBtn from './../buttons/ExitBtn';

export default class SingleplayerMenu {
  private scene: Modal;
  private level: string;
  private easyCircle: Phaser.GameObjects.Sprite;
  private normalCircle: Phaser.GameObjects.Sprite;
  private hardCircle: Phaser.GameObjects.Sprite;

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

    const top = this.scene.add.sprite(x, y - windowHeight / 2 - 50, 'header-mid').setOrigin(0.5, 0);
    const topGeom = top.getBounds();
    const mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = mid.getBounds();
    const bot = this.scene.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    const title = this.scene.add.text(x, topGeom.bottom + 30, this.scene.lang.choiceOfDifficulty, textStyle).setOrigin(0.5).setDepth(2);

    const easyPlate = this.scene.add.sprite(x, title.getBounds().bottom + 50, 'modal-plate').setOrigin(0.5, 0).setInteractive();
    easyPlate.on('pointerup', () => { this.setLevel('easy'); });
    const easyPlateGeom = easyPlate.getBounds();
    const normalPlate = this.scene.add.sprite(x, easyPlateGeom.bottom + 10, 'modal-plate').setOrigin(0.5, 0).setInteractive();
    normalPlate.on('pointerup', () => { this.setLevel('normal'); });
    const normalPlateGeom = normalPlate.getBounds();

    const hardPlate = this.scene.add.sprite(x, normalPlateGeom.bottom + 10, 'modal-plate').setOrigin(0.5, 0);
    const hardPlateGeom = hardPlate.getBounds();

    this.scene.add.sprite(easyPlateGeom.left + 40, easyPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    this.scene.add.sprite(normalPlateGeom.left + 40, normalPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    this.scene.add.sprite(hardPlateGeom.left + 40, hardPlateGeom.centerY, 'circle').setScale(0.8).setTint(0xFEFAE9);
    
    this.scene.add.text(easyPlateGeom.centerX + 20, easyPlateGeom.centerY, this.scene.lang.easy, levelStyle).setOrigin(0.5);
    this.scene.add.text(normalPlateGeom.centerX + 20, normalPlateGeom.centerY, this.scene.lang.normal, levelStyle).setColor('#FEC100').setOrigin(0.5);
    this.scene.add.text(hardPlateGeom.centerX + 20, hardPlateGeom.centerY, this.scene.lang.hard, levelStyle).setColor('#D5D1D5').setOrigin(0.5);

    this.easyCircle = this.scene.add.sprite(easyPlateGeom.left + 40, easyPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);
    this.normalCircle = this.scene.add.sprite(normalPlateGeom.left + 40, normalPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);
    this.hardCircle = this.scene.add.sprite(hardPlateGeom.left + 40, hardPlateGeom.centerY, 'circle').setScale(0.6).setTint(0xB65CFE);

    new StartGameBtn(this.scene, { x: x, y: hardPlate.getBounds().bottom + 90 }, () => {
      this.startSinglePlayerGame();
    }, this.scene.lang.play).setScale(0.5);
    new ExitBtn(
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
}