import langs from "../langs"
import Game from "./Game"

export default class Modal extends Phaser.Scene {
  constructor() {
    super('Modal')
  }

  public state: Istate
  public type: string
  public info: any
  public lang: any

  public gameScene: Game
  private bg: Phaser.GameObjects.TileSprite
  private openCloseAni: Phaser.Tweens.Tween
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.gameScene = this.game.scene.getScene('Game') as Game
  }


  public create(): void {
    this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0).setInteractive()
    const duration = this.type === 'gameOver' ? 1000 : 200
    this.openCloseAni = this.tweens.add({
      targets: this.bg,
      alpha: 0.4,
      duration
    })

    switch (this.type) {
      case 'matchMenu':
        this.matchMenuWindow()
        break

      case 'gameOver':
        this.gameOverWindow()
        break

      default: break
    }
  }


  private matchMenuWindow(): void {
    console.log('matchMenuWindow');
    
  }

  private gameOverWindow(): void {
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
    const text = this.info.win ? this.lang.win : this.lang.lose
    const windowColor = this.info.win ? 0xc3ffc1 : 0xffb6b6
    const titleColor = this.info.win ? '#e6ffe5' : '#ffdddd'
    const tint = this.info.win ? 0x5fe459 : 0xff7c7c
    const titleAniDuration = 300
    const titleAniDelay = 500
    const windowHeight = 260
    const windowWidth = 360

    const title = this.add.text(x, y - 100, text, {
      font: '60px Molot', color: titleColor
    }).setOrigin(0.5).setTint(0xFFFFFF, 0xFFFFFF, tint, tint).setStroke('black', 5).setAlpha(0)

    const reason = this.add.text(title.getBottomCenter().x, title.getBottomCenter().y, this.lang[this.info.reason], {
      font: '18px Molot', color: titleColor
    }).setOrigin(0.5).setStroke('black', 4).setAlpha(0)

    const top: Phaser.GameObjects.Sprite = this.add.sprite(title.getBottomCenter().x, title.getBottomCenter().y + 10, 'side').setOrigin(0.5, 0).setFlipY(true).setDisplaySize(windowWidth, 15).setAlpha(0)
    const mid: Phaser.GameObjects.TileSprite = this.add.tileSprite(top.getBottomCenter().x, top.getBottomCenter().y, windowWidth, windowHeight, 'pixel').setOrigin(0.5, 0).setAlpha(0).setTint(0xffffff, 0xffffff, windowColor, windowColor)
    const bot: Phaser.GameObjects.Sprite = this.add.sprite(mid.getBottomCenter().x, mid.getBottomCenter().y, 'side').setOrigin(0.5, 0).setDisplaySize(windowWidth, 15).setAlpha(0).setTint(windowColor)


    this.tweens.add({
      targets: title,
      alpha: 1,
      y: '-=50',
      duration: titleAniDuration,
      delay: titleAniDelay,
      ease: "Power2",
      onComplete: (): void => {
        if (this.info.win) this.blink(title)
        else this.grade(title)

        
        reason.setPosition(title.getBottomCenter().x, title.getBottomCenter().y + 6)
        this.lineOut(reason)

        this.tweens.add({
          targets: reason,
          alpha: 1,
          duration: 300,
          ease: "Power2",
        })
      }
    })


    const windowAniDelay = titleAniDuration + titleAniDelay + 800
    const windowAniiDuration = 500

    this.tweens.add({
      onStart: (): void => {
        top.setPosition(reason.getBottomCenter().x, reason.getBottomCenter().y + 55)
        mid.setPosition(top.getBottomCenter().x, top.getBottomCenter().y)
        bot.setPosition(mid.getBottomCenter().x, mid.getBottomCenter().y)
      },
      targets: [ top, bot, mid ],
      alpha: 1,
      y: '-=50',
      ease: 'Power2',
      duration: windowAniiDuration,
      delay: windowAniDelay
    })
  }

  private blink(text: Phaser.GameObjects.Text): void {
    const duration = 300
    const line: Phaser.GameObjects.Sprite = this.add.sprite(text.getLeftCenter().x - 5, text.getLeftCenter().y, 'blink').setOrigin(1, 0.5).setAlpha(0.8)
    const whiteText: Phaser.GameObjects.Text = this.add.text(text.x, text.y, text.text, { font: `${text.style.fontSize} Molot`, color: 'white' }).setOrigin(0.5).setDepth(text.depth + 1).setStroke('white', 5).setVisible(false).setAlpha(0.7)
    const mask = text.createBitmapMask()
    line.setMask(mask)


    this.tweens.add({
      targets: line,
      x: text.getRightCenter().x + line.getBounds().width,
      duration,
    })


    this.tweens.add({
      targets: text,
      x: text.x,
      delay: duration / 2,
      duration: 30,
      onStart: (): void => { whiteText.setVisible(true) },
      onComplete: (): void => { whiteText.destroy() }
    })
  }

  private grade(text: Phaser.GameObjects.Text): void {
    const duration = 500
    const grade: Phaser.GameObjects.Sprite = this.add.sprite(text.getBottomCenter().x, text.getBottomCenter().y, 'grade').setOrigin(0.5, 1).setDisplaySize(text.width, text.height).setAlpha(0).setTint(0x800000)
    const mask = text.createBitmapMask()
    grade.setMask(mask)

    this.tweens.add({
      targets: grade,
      alpha: 0.7,
      duration
    })
  }

  private lineOut(text: Phaser.GameObjects.Text): void {
    const tint = this.info?.win ? 0x16ac0f : 0x800000
    const line: Phaser.GameObjects.TileSprite = this.add.tileSprite(text.getTopCenter().x, text.getTopCenter().y, 1, 4, 'pixel').setOrigin(0.5, 1).setAlpha(0).setTint(tint)

    this.tweens.add({
      targets: line,
      alpha: { value: 1, duration: 200 },
      width: { value: text.width - 40, duration: 600 }
    })
  }

  private close(): void {
    this.scene.stop()
  }
}