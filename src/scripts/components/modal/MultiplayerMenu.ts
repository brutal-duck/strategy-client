import Modal from './../../scenes/Modal';
import ExitBtn from './../buttons/ExitBtn';
import MenuBtn from './../buttons/MenuBtn';

const SEARCH_DELAY: number = 30;

export default class MultiplayerMenu {
  private scene: Modal;
  private searchTimer: Phaser.Time.TimerEvent;
  private timerText: Phaser.GameObjects.Text;
  private timerBg: Phaser.GameObjects.Sprite;
  private repeatBtn: MenuBtn;
  private singletBtn: MenuBtn;
  private countTime: number;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private exit: ExitBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.scene.state.game.AI = '';
    this.createMainElements();
    this.startTimer();
  }

  private startTimer(): void {
    this.showTimer();
    this.scene.state.socket.findGame();
    this.countTime = SEARCH_DELAY;
    this.timerText.setText(`${this.scene.lang.timeLeft}: ${this.countTime}`);
    if (this.searchTimer) this.searchTimer.remove();
    this.searchTimer = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: (): void => {
        this.countTime -= 1;
        if (this.countTime <= 0) {
          this.searchTimer.remove();
          this.scene.state.socket.closeSocket();
          this.hideTimer();
        } else {
          this.timerText.setText(`${this.scene.lang.timeLeft}: ${this.countTime}`);
        }
      },
    });
  }

  private createMainElements(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '38px',
      color: '#CFCDCA',
    };

    const timerStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '25px',
      color: '#B27FFE',
    };

    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    const windowHeight = 470;

    this.top = this.scene.add.sprite(x, y - windowHeight / 2 - 50, 'header-mid').setOrigin(0.5, 0);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0).setInteractive();
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(midGeom.centerX, midGeom.bottom, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    this.title = this.scene.add.text(x, topGeom.bottom + 30, this.scene.lang.searchEnemy, textStyle).setOrigin(0.5).setDepth(2);

    this.repeatBtn = new MenuBtn(
      this.scene, 
      { x: this.scene.bg.getCenter().x, y: this.scene.bg.getCenter().y }, 
      (): void => { this.hideBtn(); },
      'repeat',
      false,
    );

    this.singletBtn = new MenuBtn(
      this.scene, 
      { x: this.scene.bg.getCenter().x, y: this.scene.bg.getCenter().y + 140 }, 
      (): void => { this.scene.scene.restart({ state: this.scene.state, type: 'singleplayerMenu' }); },
      'singleplayer',
      false,
    );

    this.timerBg = this.scene.add.sprite(x, midGeom.centerY, 'modal-plate').setAlpha(0);
    this.timerText = this.scene.add.text(x, midGeom.centerY, `${this.scene.lang.timeLeft}: ${SEARCH_DELAY}`, timerStyle).setOrigin(0.5).setAlpha(0);

    this.exit = new ExitBtn(
      this.scene,
      { x: topGeom.right - 45, y: topGeom.bottom + 30},
      (): void => { this.scene.scene.restart({ state: this.scene.state, type: 'mainMenu' });},
    );
  }

  private showBtn(): void {
    if (this.singletBtn.alpha !== 1) {
      this.scene.tweens.add({
        targets: [this.singletBtn, this.repeatBtn],
        duration: 200, 
        alpha: { from: 0, to: 1 },
        onStart: () => {
          this.repeatBtn?.setVisible(true);
          this.singletBtn?.setVisible(true);
        },
      });
    }
  }

  private showTimer(): void {
    if (this.timerBg.alpha !== 1) {
      this.scene.tweens.add({
        targets: [this.timerBg, this.timerText],
        duration: 200, 
        alpha: { from: 0, to: 1 },
      });
    }
  }

  private hideBtn(): void {
    if (this.singletBtn.alpha !== 0) {
      this.scene.tweens.add({
        targets: [this.singletBtn, this.repeatBtn],
        duration: 200, 
        alpha: { from: 1, to: 0 },
        onComplete: () => {
          this.startTimer();
          this.repeatBtn?.setVisible(false);
          this.singletBtn?.setVisible(false);
        }
      });
    }
  }

  private hideTimer(): void {
    if (this.timerBg.alpha !== 0) {
      this.scene.tweens.add({
        targets: [this.timerBg, this.timerText],
        duration: 200, 
        alpha: { from: 1, to: 0 },
        onComplete: () => {
          this.showBtn();
        }
      });
    }
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

    this.repeatBtn.setPosition(x, y);
    this.singletBtn.setPosition(x, y + 140);

    this.timerBg.setPosition(x, midGeom.centerY);
    this.timerText.setPosition(x, midGeom.centerY);

    this.exit.setPosition(topGeom.right - 45, topGeom.bottom + 30)
  }
}