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

  private create(): void {
    const color = '#c6ea00'
    const font = '18px Molot'
    const m: string = this.min > 9 ? `${this.min}` : `0${this.min}`
    const s: string = this.sec > 9 ? `${this.sec}` : `0${this.sec}`

    this.colon = this.scene.add.text(this.x, this.y, ':', { font, color }).setOrigin(0.5, 0).setStroke('black', 3)
    this.minutes = this.scene.add.text(this.colon.getLeftCenter().x, this.colon.getLeftCenter().y, m, { font, align: 'right', color }).setOrigin(1, 0.5).setStroke('black', 3)
    this.seconds = this.scene.add.text(this.colon.getRightCenter().x, this.colon.getRightCenter().y, s, { font, align: 'left', color }).setOrigin(0, 0.5).setStroke('black', 3)
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
          this.scene.gameScene.gameOver('timeIsUp')

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
          this.colon.setColor('#D80000')
          this.minutes.setColor('#D80000')
          this.seconds.setColor('#D80000')
        }

        this.minutes.setText(m)
        this.seconds.setText(s)
        this.playColonAni()
      },
      loop: true
    })
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

  public stop(): void {
    this.timeEvent.remove()
  }
}