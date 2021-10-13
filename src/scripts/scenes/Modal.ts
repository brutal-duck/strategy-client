import AskBtn from "../components/buttons/AskBtn"
import MatchMenuBtn from "../components/buttons/MatchMenuBtn"
import MatchOverBtn from "../components/buttons/MatchOverBtn"
import { colors } from "../gameConfig"
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

  private playerColor: string
  private enemyColor: string

  public gameScene: Game
  private bg: Phaser.GameObjects.TileSprite
  private openCloseAni: Phaser.Tweens.Tween
  
  public init(data: { state: Istate, type: string, info?: any }): void {
    this.state = data.state
    this.type = data.type
    this.info = data.info
    this.lang = langs.ru
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.playerColor = this.gameScene.player.color
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'
  }


  public create(): void {
    this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'pixel').setOrigin(0).setTint(0x000000).setAlpha(0).setInteractive()
    this.bg.on('pointerup', (): void => { if (this.type !== 'gameOver') this.close() })
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

      case 'landing':
        this.landingConfirmWindow()
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
    const mid: Phaser.GameObjects.TileSprite = this.add.tileSprite(top.getBottomCenter().x, top.getBottomCenter().y, windowWidth, windowHeight, 'pixel').setOrigin(0.5, 0).setInteractive()
    const bot: Phaser.GameObjects.Sprite = this.add.sprite(mid.getBottomCenter().x, mid.getBottomCenter().y, 'side').setOrigin(0.5, 0).setDisplaySize(windowWidth, 15)

    const title: Phaser.GameObjects.Text = this.add.text(x, top.getTopCenter().y + 10, this.lang.menu, { font: '38px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(2)
    // const cross: Phaser.GameObjects.Sprite = this.add.sprite(top.getTopRight().x - 5, top.getTopRight().y + 5, 'cross').setOrigin(1, 0).setScale(0.6).setTint(0xffafaf).setInteractive()
    // cross.on('pointerup', (): void => { this.scene.stop() })

    const settingsBtn = new MatchMenuBtn(this, x, mid.getCenter().y - 20).setScale(1.8, 1.5).setText(this.lang.settings)
    settingsBtn.border.on('pointerup', (): void => { console.log('settings') })

    const leaveBtn = new MatchMenuBtn(this, x, mid.getCenter().y + 60).setScale(1.8, 1.5).setText(this.lang.surrenderAndLeave)
    leaveBtn.border.on('pointerup', (): void => {
      leaveBtn.block(this.lang.shutdown)
      this.stopGame()
    })
  }


  private landingConfirmWindow(): void {
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
    const windowHeight = 100
    const windowWidth = 280

    const top: Phaser.GameObjects.Sprite = this.add.sprite(x, y - 100, 'side').setOrigin(0.5, 0).setFlipY(true).setDisplaySize(windowWidth, 15)
    const mid: Phaser.GameObjects.TileSprite = this.add.tileSprite(top.getBottomCenter().x, top.getBottomCenter().y, windowWidth, windowHeight, 'pixel').setOrigin(0.5, 0).setInteractive()
    const bot: Phaser.GameObjects.Sprite = this.add.sprite(mid.getBottomCenter().x, mid.getBottomCenter().y, 'side').setOrigin(0.5, 0).setDisplaySize(windowWidth, 15)

    const title: Phaser.GameObjects.Text = this.add.text(x, top.getTopCenter().y + 10, this.lang.landTroops, { font: '26px Molot', color: 'black' }).setOrigin(0.5, 0).setDepth(2)

    const superHexBg: Phaser.GameObjects.Sprite = this.add.sprite(x, title.getBottomCenter().y + 20, 'hex').setTint(0x000000).setScale(0.4)
    const superHex: Phaser.GameObjects.Sprite = this.add.sprite(superHexBg.x, superHexBg.y, 'hex').setTint(0xb879ff).setScale(0.38)
    const superHexSum: Phaser.GameObjects.Text = this.add.text(superHexBg.x, superHexBg.y, `${this.gameScene[this.gameScene.player.color].superHex}`, {
      font: '26px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    const no = new AskBtn(this, x - 64, title.getBottomCenter().y + 64, `${this.lang.no}`)
    const yes = new AskBtn(this, x + 64, title.getBottomCenter().y + 64, `${this.lang.yes}`, true)

    no.border.on('pointerup', (): void => { this.close() })
    yes.border.on('pointerup', (): void => {
      if (this.gameScene.state.game.AI) this.gameScene.superHexClameConfirmed()
      else this.gameScene.superHexSocketClameConfirmed()
      this.close()
    })
  }


  private gameOverWindow(): void {
    console.log(this.info);
    
    const x = this.bg.getCenter().x
    const y = this.bg.getCenter().y
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
    const windowHeight = 226
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
    // const tilesLeft: Phaser.GameObjects.Text = this.add.text(mid.getTopCenter().x, y, this.lang.tilesLeft, { font: '20px Molot', color: 'black' }).setOrigin(0.5).setAlpha(0)

    const playerHexes: number = this.gameScene?.playerHexes().length
    const enemyHexes: number = this.gameScene?.enemyHexes().length
    const totalHexes = playerHexes + enemyHexes
    const lineWidth = windowWidth - 50
    const playerLineWidth = lineWidth / totalHexes * playerHexes
    const enemyLineWidth = lineWidth / totalHexes * enemyHexes

    const lineBg: Phaser.GameObjects.TileSprite = this.add.tileSprite(mid.getTopCenter().x, y + 60, lineWidth, 20, 'pixel').setOrigin(0.5, 0).setAlpha(0)
    const playerLine: Phaser.GameObjects.TileSprite = this.add.tileSprite(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y, playerLineWidth, 26, 'pixel').setTint(colors[this.playerColor].main).setDepth(2).setOrigin(0, 0.5).setAlpha(0)
    const enemyLine: Phaser.GameObjects.TileSprite = this.add.tileSprite(lineBg.getRightCenter().x, lineBg.getRightCenter().y, enemyLineWidth, 26, 'pixel').setTint(colors[this.enemyColor].main).setDepth(2).setOrigin(1, 0.5).setAlpha(0)
    const playerSum: Phaser.GameObjects.Text = this.add.text(lineBg.getBottomLeft().x + 10, lineBg.getBottomLeft().y + 12, `${playerHexes}`, { font: '30px Molot', color: colors[this.playerColor].mainStr }).setAlpha(0)
    const enemySum: Phaser.GameObjects.Text = this.add.text(lineBg.getBottomRight().x - 10, lineBg.getBottomRight().y + 12, `${enemyHexes}`, { font: '30px Molot', color: colors[this.enemyColor].mainStr }).setOrigin(1, 0).setAlpha(0)

    const stars = this.gameScene.stars
    const lineStar1: Phaser.GameObjects.Sprite = this.add.sprite(lineBg.getCenter().x, lineBg.getCenter().y, stars > 0 ? 'star' : 'star-disabled').setScale(0.32).setDepth(3).setAlpha(0)
    const lineStar2: Phaser.GameObjects.Sprite = this.add.sprite(lineBg.getLeftCenter().x + lineWidth * 0.75, lineBg.getCenter().y, stars > 1 ? 'star' : 'star-disabled').setScale(0.32).setDepth(3).setAlpha(0)
    const lineStar3: Phaser.GameObjects.Sprite = this.add.sprite(lineBg.getRightCenter().x, lineBg.getCenter().y, stars > 2 ? 'star' : 'star-disabled').setScale(0.32).setDepth(3).setAlpha(0)

    const timeSpend: Phaser.GameObjects.Text = this.add.text(mid.getTopCenter().x, playerSum.getBottomCenter().y + 20, this.lang.timeSpend, {
      font: '18px Molot', color: 'black'
    }).setOrigin(0.5, 0).setAlpha(0)

    const timer: Phaser.GameObjects.Text = this.add.text(mid.getTopCenter().x, timeSpend.getBottomCenter().y, this.gameScene.hud.timer.getTimeLeft(), {
      font: '20px Molot', color: '#c6ea00'
    }).setOrigin(0.5, 0).setAlpha(0).setStroke('black', 3)

    // const hex: Phaser.GameObjects.Sprite = this.add.sprite(x - 40, y, 'hex').setTint(colors[this.playerColor].main).setScale(0.6).setAlpha(0)
    // const hexSum: Phaser.GameObjects.Text = this.add.text(hex.getCenter().x, y, `${this.gameScene[this.playerColor].hexes}`, {
    //   font: '26px Molot', color: '#BED3C0'
    // }).setOrigin(0.5).setAlpha(0)

    // const purpleHex: Phaser.GameObjects.Sprite = this.add.sprite(x + 40, y, 'hex').setTint(0xb879ff).setScale(0.6).setAlpha(0)
    // const purpleHexSum: Phaser.GameObjects.Text = this.add.text(purpleHex.getCenter().x, y, `${this.gameScene[this.playerColor].superHex}`, {
    //   font: '26px Molot', color: '#BED3C0'
    // }).setOrigin(0.5).setAlpha(0)

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
      lineBg.setPosition(mid.getTopCenter().x, y - 45)
      playerLine.setPosition(lineBg.getLeftCenter().x, lineBg.getLeftCenter().y)
      enemyLine.setPosition(lineBg.getRightCenter().x, lineBg.getRightCenter().y)
      playerSum.setPosition(lineBg.getBottomLeft().x + 20, lineBg.getBottomLeft().y + 15)
      enemySum.setPosition(lineBg.getBottomRight().x - 20, lineBg.getBottomRight().y + 15)
      lineStar1.setPosition(lineBg.getCenter().x, lineBg.getCenter().y)
      lineStar2.setPosition(lineBg.getLeftCenter().x + lineWidth * 0.75, lineBg.getCenter().y)
      lineStar3.setPosition(lineBg.getRightCenter().x, lineBg.getCenter().y)
      timeSpend.setPosition(mid.getTopCenter().x, playerSum.getBottomCenter().y + 8)
      timer.setPosition(mid.getTopCenter().x, timeSpend.getBottomCenter().y)
      
      // tilesLeft.setY(y + 30)
      // hex.setY(y + 70)
      // hexSum.setY(hex.y)
      // purpleHex.setY(y + 70)
      // purpleHexSum.setY(purpleHex.y)

      const btn = new MatchOverBtn(this, x, y + 112).setAlpha(0)
      btn.border.on('pointerup', (): void => { this.stopGame() })

      const targets = [
        [result],
        [lineBg, playerLine, enemyLine, lineStar1, lineStar2, lineStar3],
        [playerSum, enemySum],
        // [tilesLeft],
        // [hex, hexSum, purpleHex, purpleHexSum],
        [timeSpend, timer],
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
            if (i === 1 && this.info.winner) {
              const glow: Phaser.GameObjects.Sprite = this.add.sprite(x, y, 'glow').setDepth(2).setAlpha(0)
              if (this.info.winner === this.playerColor) glow.setPosition(playerLine.getCenter().x, playerLine.getCenter().y).setDisplaySize(playerLine.width + 2, playerLine.height + 30).setTint(colors[this.playerColor].main)
              else glow.setPosition(enemyLine.getCenter().x, enemyLine.getCenter().y).setDisplaySize(enemyLine.width + 2, enemyLine.height + 30).setTint(colors[this.enemyColor].main)
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
    this.gameScene.gameIsOn = false
    this.gameScene.hud.scene.stop()
    this.gameScene.world.recreate(this.gameScene.gameIsOn)
    if (this.state.game.AI) this.gameScene.AI.remove()
    this.scene.start('MainMenu', this.state)
    this.state.socket?.closeSocket();
  }

  private close(): void {
    this.scene.stop()
  }
}