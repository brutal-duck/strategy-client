import MatchMenuBtn from "../components/buttons/MatchMenuBtn"
import MatchOverBtn from "../components/buttons/MatchOverBtn"
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
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
    const windowHeight = 220
    const windowWidth = 280

    const top: Phaser.GameObjects.Sprite = this.add.sprite(x, y - 100, 'side').setOrigin(0.5, 0).setFlipY(true).setDisplaySize(windowWidth, 15)
    const mid: Phaser.GameObjects.TileSprite = this.add.tileSprite(top.getBottomCenter().x, top.getBottomCenter().y, windowWidth, windowHeight, 'pixel').setOrigin(0.5, 0)
    const bot: Phaser.GameObjects.Sprite = this.add.sprite(mid.getBottomCenter().x, mid.getBottomCenter().y, 'side').setOrigin(0.5, 0).setDisplaySize(windowWidth, 15)

    const title: Phaser.GameObjects.Text = this.add.text(x, top.getTopCenter().y + 10, this.lang.menu, { font: '38px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(2)
    const cross: Phaser.GameObjects.Sprite = this.add.sprite(top.getTopRight().x - 5, top.getTopRight().y + 5, 'cross').setOrigin(1, 0).setScale(0.6).setTint(0xffafaf).setInteractive()
    cross.on('pointerup', (): void => { this.scene.stop() })

    const settingsBtn = new MatchMenuBtn(this, x, mid.getCenter().y - 20).setScale(1.8, 1.5).setText(this.lang.settings)
    settingsBtn.border.on('pointerup', (): void => { console.log('settings') })

    const leaveBtn = new MatchMenuBtn(this, x, mid.getCenter().y + 60).setScale(1.8, 1.5).setText(this.lang.surrenderAndLeave)
    leaveBtn.border.on('pointerup', (): void => { this.stopGame() })
  }

  private gameOverWindow(): void {
    console.log(this.info);
    
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
    const playerColor = this.state.player.color
    let text = this.lang.tie
    let windowColor = 0xfff7d9
    let titleColor = '#e5e5e5'
    let tint = 0xfff7d9
    if (this.info.winner !== null) {
      text = this.info.win ? this.lang.win : this.lang.lose
      windowColor = this.info.win ? 0xc3ffc1 : 0xffb6b6
      titleColor = this.info.win ? '#e6ffe5' : '#ffdddd'
      tint = this.info.win ? 0x5fe459 : 0xff7c7c
    }
    const titleAniDuration = 300
    const titleAniDelay = 500
    const windowHeight = 260
    const windowWidth = 340

    const title = this.add.text(x, y - 100, text, {
      font: '60px Molot', color: titleColor
    }).setOrigin(0.5).setTint(0xFFFFFF, 0xFFFFFF, tint, tint).setStroke('black', 5).setAlpha(0)

    const reason = this.add.text(title.getBottomCenter().x, y, this.lang[this.info.reason], {
      font: '18px Molot', color: titleColor
    }).setOrigin(0.5).setStroke('black', 4).setAlpha(0)

    const top: Phaser.GameObjects.Sprite = this.add.sprite(title.getBottomCenter().x, y, 'side').setOrigin(0.5, 0).setFlipY(true).setDisplaySize(windowWidth, 15).setAlpha(0)
    const mid: Phaser.GameObjects.TileSprite = this.add.tileSprite(top.getBottomCenter().x, top.getBottomCenter().y, windowWidth, windowHeight, 'pixel').setOrigin(0.5, 0).setAlpha(0).setTint(0xffffff, 0xffffff, windowColor, windowColor)
    const bot: Phaser.GameObjects.Sprite = this.add.sprite(mid.getBottomCenter().x, mid.getBottomCenter().y, 'side').setOrigin(0.5, 0).setDisplaySize(windowWidth, 15).setAlpha(0).setTint(windowColor)

    const result: Phaser.GameObjects.Text = this.add.text(mid.getTopCenter().x, y, this.lang.result, { font: '20px Molot', color: 'black' }).setOrigin(0.5).setAlpha(0)
    const tilesLeft: Phaser.GameObjects.Text = this.add.text(mid.getTopCenter().x, y, this.lang.tilesLeft, { font: '20px Molot', color: 'black' }).setOrigin(0.5).setAlpha(0)

    const greenHexes: number = this.gameScene?.hexes.filter(hex => hex.own === 'green').length
    const blueHexes: number = this.gameScene?.hexes.filter(hex => hex.own === 'blue').length
    const totalHexes = greenHexes + blueHexes
    const lineWidth = windowWidth - 40
    const greenLineWidth = lineWidth / totalHexes * greenHexes
    const blueLineWidth = lineWidth / totalHexes * blueHexes

    const lineBg: Phaser.GameObjects.TileSprite = this.add.tileSprite(mid.getTopCenter().x, y + 40, lineWidth, 20, 'pixel').setOrigin(0.5, 0).setAlpha(0)
    const greenLine: Phaser.GameObjects.TileSprite = this.add.tileSprite(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y, greenLineWidth, 20, 'pixel').setTint(0x95ffa4).setDepth(2).setOrigin(0, 0.5).setAlpha(0)
    const blueLine: Phaser.GameObjects.TileSprite = this.add.tileSprite(lineBg.getRightCenter().x, lineBg.getRightCenter().y, blueLineWidth, 20, 'pixel').setTint(0x9ffffc).setDepth(2).setOrigin(1, 0.5).setAlpha(0)
    const greenSum: Phaser.GameObjects.Text = this.add.text(lineBg.getBottomLeft().x + 10, lineBg.getBottomLeft().y + 4, `${greenHexes}`, { font: '26px Molot', color: '#42e359' }).setAlpha(0)
    const blueSum: Phaser.GameObjects.Text = this.add.text(lineBg.getBottomRight().x - 10, lineBg.getBottomRight().y + 4, `${blueHexes}`, { font: '26px Molot', color: '#61c3fb' }).setOrigin(1, 0).setAlpha(0)

    const hex: Phaser.GameObjects.Sprite = this.add.sprite(x - 40, y, 'hex').setTint(playerColor === 'green' ? 0x95ffa4 : 0x9ffffc).setScale(0.6).setAlpha(0)
    const hexSum: Phaser.GameObjects.Text = this.add.text(hex.getCenter().x, y, `${this.gameScene[playerColor].hexes}`, {
      font: '26px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setAlpha(0)

    const purpleHex: Phaser.GameObjects.Sprite = this.add.sprite(x + 40, y, 'hex').setTint(0xb879ff).setScale(0.6).setAlpha(0)
    const purpleHexSum: Phaser.GameObjects.Text = this.add.text(purpleHex.getCenter().x, y, `${this.gameScene[playerColor].superHex}`, {
      font: '26px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setAlpha(0)

    const titleFadeOut = () => {
      this.tweens.add({
        targets: title,
        alpha: 1,
        y: '-=50',
        duration: titleAniDuration,
        delay: titleAniDelay,
        ease: "Power2",
        onComplete: (): void => {
          if (this.info.win) this.blink(title)
          else if (this.info.winner !== null) this.grade(title)
          reasonFadeOut()
          bgFadeOut()
        }
      })
    }

    const reasonFadeOut = () => {
      this.tweens.add({
        onStart: (): void => {
          reason.setPosition(title.getBottomCenter().x, y - 100)
          this.lineOut(reason)
        },
        targets: reason,
        alpha: 1,
        duration: 300,
        delay: 100,
        ease: "Power2",
      })
    }

    const bgFadeOut = () => {
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
        duration: 500,
        delay: 500,
        completeDelay: 100,
        onComplete: (): void => {
          statisticFadeOut()
        }
      })
    }

    const statisticFadeOut = () => {
      const duration = 350
      const delay = 150

      result.setY(y - 75)
      lineBg.setPosition(mid.getTopCenter().x, y - 55)
      greenLine.setPosition(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y)
      blueLine.setPosition(lineBg.getRightCenter().x, lineBg.getRightCenter().y)
      greenSum.setPosition(lineBg.getBottomLeft().x + 20, lineBg.getBottomLeft().y + 15)
      blueSum.setPosition(lineBg.getBottomRight().x - 20, lineBg.getBottomRight().y + 15)
      
      tilesLeft.setY(y + 30)
      hex.setY(y + 70)
      hexSum.setY(hex.y)
      purpleHex.setY(y + 70)
      purpleHexSum.setY(purpleHex.y)

      const btn = new MatchOverBtn(this, x, y + 140).setAlpha(0)
      btn.border.on('pointerup', (): void => { this.stopGame() })

      const targets = [
        [result],
        [lineBg, greenLine, blueLine],
        [greenSum, blueSum],
        [tilesLeft],
        [hex, hexSum, purpleHex, purpleHexSum],
        btn.elements
      ]

      targets.forEach((el, i) => {
        this.tweens.add({
          targets: el,
          alpha: 1,
          y: '+=20',
          duration,
          delay: delay * i,
          ease: 'Power2',
          onComplete: (): void => {
            if (i === 1) {
              const glow: Phaser.GameObjects.Sprite = this.add.sprite(x, y, 'glow').setDepth(2).setAlpha(0)
              console.log('targets.forEach ~ this.info.winner', this.info.winner)
              if (this.info.winner === 'green') glow.setPosition(greenLine.getCenter().x, greenLine.getCenter().y).setDisplaySize(greenLine.width + 2, greenLine.height + 24).setTint(0x42e359)
              else if (this.info.winner === 'blue') glow.setPosition(blueLine.getCenter().x, blueLine.getCenter().y).setDisplaySize(blueLine.width + 2, blueLine.height + 24).setTint(0x61c3fb)
              this.tweens.add({
                targets: glow,
                alpha: 1,
                duration: 400
              })
            }
          }
        })
      })
    }

    titleFadeOut()
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
    let tint = this.info?.win ? 0x16ac0f : 0x800000
    const line: Phaser.GameObjects.TileSprite = this.add.tileSprite(text.getTopCenter().x, text.getTopCenter().y - 3, 1, 4, 'pixel').setOrigin(0.5, 1).setAlpha(0).setTint(this.info.winner === null ? 0xFFFFFF : tint)

    this.tweens.add({
      targets: line,
      alpha: { value: 1, duration: 200 },
      width: { value: text.width - 40, duration: 600 }
    })
  }

  public stopGame(): void {
    this.close()
    this.gameScene.hud.scene.stop()
    this.gameScene.world.recreate(false)
    if (this.state.game.AI) this.gameScene.AI.remove()
    this.scene.start('MainMenu', this.state)
  }

  private close(): void {
    this.scene.stop()
  }
}