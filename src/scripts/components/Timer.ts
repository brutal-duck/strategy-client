import Hud from "../scenes/Hud"


export default class Timer {

  public scene: Hud
  public x: number
  public y: number
  public time: number

  public min: number
  public sec: number

  public minutes: Phaser.GameObjects.Text
  public seconds: Phaser.GameObjects.Text
  public colon: Phaser.GameObjects.Text

  private timeEvent: Phaser.Time.TimerEvent
  private colonAni: Phaser.Tweens.Tween
  private firstPlay: boolean

  constructor(scene: Hud, x: number, y: number, time: number) {
    this.scene = scene
    this.x = x
    this.y = y
    this.time = time
    this.init()
  }

  private init(): void {
    this.min = Math.ceil(this.time / 60000)
    this.sec = this.time % 60000
    this.firstPlay = true
    this.create()
  }

  public updateTime(time: number): void {
    this.time = time;
    this.min = Math.floor(this.time / 60000);
    this.sec = Math.round((this.time - this.min * 60000) / 1000);
  }

  private create(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '24px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
    };
    const m: string = this.min > 9 ? `${this.min}` : `0${this.min}`
    const s: string = this.sec > 9 ? `${this.sec}` : `0${this.sec}`

    this.colon = this.scene.add.text(this.x, this.y, ':', textStyle).setOrigin(0.5, 0);
    this.minutes = this.scene.add.text(this.colon.getLeftCenter().x, this.colon.getLeftCenter().y, m, textStyle).setOrigin(1, 0.5);
    this.seconds = this.scene.add.text(this.colon.getRightCenter().x, this.colon.getRightCenter().y, s, textStyle).setOrigin(0, 0.5);
    this.startCountdown()
  }

  private startCountdown(): void {
    this.playColonAni()
    this.timeEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: (): void => {
        let m: string = this.minutes.text
        let s: string = this.seconds.text

        if (this.sec === 0 && this.min === 0) {
          this.timeEvent.remove()
          this.colonAni.remove()
          if (this.scene.state.tutorial === 10) {
            this.scene.gameScene.gameOver('timeIsUp')
          } else {
            this.stop();
            this.setVisible(false);
          }

        } else if (this.sec === 0 && this.min > 0) {
          this.sec = 59
          this.min--
          s = `${this.sec}`
          m = this.min > 9 ? `${this.min}` : `0${this.min}`

        } else {
          this.sec--
          s = this.sec > 9 ? `${this.sec}` : `0${this.sec}`
        }

        if (this.min === 0) {
          this.colon.setColor('#ee3434').setStroke('#123456', 0);
          this.minutes.setColor('#ee3434').setStroke('#123456', 0);
          this.seconds.setColor('#ee3434').setStroke('#123456', 0);
        }

        this.minutes.setText(m)
        this.seconds.setText(s)
        this.playColonAni()
      },
      loop: true,
      callbackScope: this,
    })
  }


  public getBounds(): Phaser.Geom.Rectangle {
    return this.colon.getBounds();
  }

  private playColonAni(): void {
    if (!this.firstPlay) this.colon.setAlpha(0)

    this.colonAni?.remove()
    this.colonAni = this.scene.tweens.add({
      targets: this.colon,
      onStart: (): void => {
        if (this.firstPlay) {
          this.scene.tweens.add({
            targets: this.colon,
            alpha: 0,
            duration: 475,
            delay: 475
          })
          this.firstPlay = false
        }
      },
      alpha: 1,
      duration: 475,
      yoyo: !this.firstPlay,
    })
  }

  public setPosition(x: number, y: number): this {
    this.colon.setPosition(x, y)
    this.minutes.setPosition(this.colon.getLeftCenter().x, this.colon.getLeftCenter().y)
    this.seconds.setPosition(this.colon.getRightCenter().x, this.colon.getRightCenter().y)
    return this
  }

  public getTimeLeft(): string {
    let min = 10 - this.min
    let sec = this.sec
    if (sec > 0) {
      min--
      sec = 60 - this.sec
    }
    return `${min < 10 ? 0 : ''}${min} : ${sec < 10 ? 0 : ''}${sec}`
  }

  public stop(): void {
    this.timeEvent.remove()
  }

  public get scale(): number {
    return this.minutes.scale;
  }

  public setScale(scale: number): this {
    this.minutes.setScale(scale);
    this.seconds.setScale(scale);
    this.colon.setScale(scale);
    return this;
  };

  public setVisible(visible: boolean): this {
    this.minutes.setVisible(visible);
    this.seconds.setVisible(visible);
    this.colon.setVisible(visible);
    return this;
  }
}