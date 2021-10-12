import MatchMenuBtn from "../components/buttons/MatchMenuBtn"
import Timer from "../components/Timer"
import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"

export default class Hud extends Phaser.Scene {
  constructor() {
    super('Hud')
  }

  public state: Istate
  public gameScene: Game
  public camera: Phaser.Cameras.Scene2D.Camera
  public lang: any

  private totalHexes: number
  private playerColor: string
  private enemyColor: string

  private allElements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>
  private bg: Phaser.GameObjects.TileSprite
  private switcher: Phaser.GameObjects.TileSprite

  private lineWidth: number

  private stars: Phaser.GameObjects.Sprite[]
  private star1: Phaser.GameObjects.Sprite
  private star2: Phaser.GameObjects.Sprite
  private star3: Phaser.GameObjects.Sprite

  private worldStatusBar: Phaser.GameObjects.TileSprite
  private playerName: Phaser.GameObjects.Text
  private enemyName: Phaser.GameObjects.Text
  private playerStatusBar: Phaser.GameObjects.TileSprite
  private enemyStatusBar: Phaser.GameObjects.TileSprite
  private playerStatusBarBg: Phaser.GameObjects.TileSprite
  private enemyStatusBarBg: Phaser.GameObjects.TileSprite
  private playerClamedHexCounter: Phaser.GameObjects.Text // счетчик захваченных гексов игрока
  private enemyHexCounter: Phaser.GameObjects.Text // счетчик захваченных гексов противника
  private worldStatusAni: Phaser.Tweens.Tween
  public timer: Timer

  private hexBar: Phaser.GameObjects.Sprite
  private hexBarText: Phaser.GameObjects.Text
  private tilesBarText: Phaser.GameObjects.Text
  private superHexBar: Phaser.GameObjects.Sprite
  private superHexBarText: Phaser.GameObjects.Text
  private superTilesBarText: Phaser.GameObjects.Text

  private hexBarP2: Phaser.GameObjects.Sprite
  private hexBarTextP2: Phaser.GameObjects.Text

  private warnLogs: Array<{ x: number, y: number, id: string }>
  private warnElements: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>
  private warnBg: Phaser.GameObjects.Sprite
  private warnText: Phaser.GameObjects.Text
  private warnIcon: Phaser.GameObjects.Sprite
  private warnCreateAni: Phaser.Tweens.Tween
  private warnFadeInAni: Phaser.Tweens.Tween
  private warnBaseWasFoundBg: Phaser.GameObjects.Sprite
  private warnBaseWasFoundText: Phaser.GameObjects.Text
  private warnBaseWasFoundIcon: Phaser.GameObjects.Sprite


  private menuBtn: MatchMenuBtn

  private debugText: Phaser.GameObjects.Text


  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.camera = this.cameras.main
    this.lang = langs.ru

    this.playerColor = this.gameScene.player.color
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'

    this.lineWidth = this.camera.width / 2.5

    this.allElements = []
    this.warnLogs = []
    this.warnElements = []
  }
  
  public create(): void {
    this.menuBtn = new MatchMenuBtn(this, this.camera.width - 2, 1).setOrigin(1, 0)
    this.menuBtn.border.on('pointerup', (): void => { this.scene.launch('Modal', { state: this.state, type: 'matchMenu' }) })

    this.createMainBar()
    this.createWorldStatusBar()
    this.createWarningBar()
    this.timer = new Timer(this, this.worldStatusBar.getCenter().x, this.worldStatusBar.getBottomCenter().y + 2, this.gameScene.green.matchTime)
    this.allElements.push(this.bg, this.timer.minutes, this.timer.seconds, this.timer.colon, this.menuBtn.border, this.menuBtn.mid, this.menuBtn.text)

    // debug // !
    if (!this.state.game.AI) this.createColorSwitcher()
    this.createHexBarPlayer2()
    this.debugText = this.add.text(-26, this.camera.height, '', { font: '10px Molot', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-9).setOrigin(0, 1).setVisible(false)
    this.input.keyboard.addKey('A').on('up', (): void => { this.debugText.setVisible(!this.debugText.visible) })
  }


  private createMainBar(): void {
    this.hexBar = this.add.sprite(5, 5, 'hex').setScale(0.5).setTint(colors[this.playerColor].light).setOrigin(0)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x, this.hexBar.getCenter().y, String(this.gameScene[this.playerColor].hexes), {
      font: '26px Molot', align: 'center', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.superHexBar = this.add.sprite(this.hexBar.getBottomCenter().x, this.hexBar.getBottomCenter().y + 10, 'hex').setScale(0.5).setTint(0xb879ff).setOrigin(0.5, 0)
    this.superHexBarText = this.add.text(this.superHexBar.getCenter().x, this.superHexBar.getCenter().y, String(this.gameScene.green.superHex), {
      font: '26px Molot', align: 'center', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.allElements.push(this.hexBar, this.hexBarText, this.superHexBar, this.superHexBarText)
  }


  private createHexBarPlayer2(): void {
    this.hexBarP2 = this.add.sprite(this.camera.width - 10, this.camera.height - 10, 'hex').setScale(0.65).setTint(colors[this.enemyColor].light).setOrigin(1)
    this.hexBarTextP2 = this.add.text(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2, String(this.playerColor === 'green' ? this.gameScene.red.hexes : this.gameScene.green.hexes), {
      font: '36px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
    this.allElements.push(this.hexBarP2, this.hexBarTextP2)
  }


  private createWorldStatusBar(): void {
    this.playerName = this.add.text(this.camera.width / 2 - 10, 4, this.gameScene[this.playerColor].name, { font: '20px Molot', color: colors[this.playerColor].lightStr }).setOrigin(1, 0)
    this.enemyName = this.add.text(this.camera.width / 2 + 10, 4, this.gameScene[this.enemyColor].name, { font: '20px Molot', color: colors[this.enemyColor].lightStr })
    this.lineWidth = this.camera.width / 2.5

    this.worldStatusBar = this.add.tileSprite(this.camera.width / 2, this.playerName.getBottomCenter().y + 4, this.lineWidth, 20, 'pixel').setOrigin(0.5, 0)
    this.playerStatusBar = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(colors[this.playerColor].main).setDepth(4).setOrigin(0, 0.5).setVisible(false)
    this.enemyStatusBar = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(colors[this.enemyColor].main).setDepth(4).setOrigin(1, 0.5).setVisible(false)
    this.playerStatusBarBg = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(colors[this.playerColor].light).setDepth(3).setOrigin(0, 0.5).setVisible(false)
    this.enemyStatusBarBg = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(colors[this.enemyColor].light).setDepth(3).setOrigin(1, 0.5).setVisible(false)

    this.star1 = this.add.sprite(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(1), this.worldStatusBar.getTopCenter().y + 4, 'star-disabled').setScale(0.3).setDepth(6)
    this.star2 = this.add.sprite(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(2), this.worldStatusBar.getTopCenter().y + 4, 'star-disabled').setScale(0.3).setDepth(6)
    this.star3 = this.add.sprite(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(3), this.worldStatusBar.getTopCenter().y + 4, 'star-disabled').setScale(0.3).setDepth(6)
    this.stars = [ this.star1, this.star2, this.star3 ]

    this.allElements.push(this.playerName, this.enemyName, this.worldStatusBar, this.playerStatusBar, this.enemyStatusBar, this.playerStatusBarBg, this.enemyStatusBarBg)
    this.allElements = this.allElements.concat(this.stars)
    this.updateWorldStatusBar()
  }


  private createWarningBar(): void {
    this.warnBg = this.add.sprite(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 10, 'block').setOrigin(1, 0).setTint(0x000000).setAlpha(0).setDisplaySize(180, 30).setInteractive()
    this.warnIcon = this.add.sprite(this.warnBg.getLeftCenter().x + 6, this.warnBg.getLeftCenter().y, 'warning').setOrigin(0, 0.5).setScale(0.3).setAlpha(0)
    this.warnText = this.add.text(this.warnIcon.getRightCenter().x + 6, this.warnIcon.getRightCenter().y, '', {
      font: '14px Molot', color: '#d8ae1c'
    }).setOrigin(0, 0.5).setStroke('#a65600', 3).setAlpha(0)

    this.warnElements = [ this.warnBg, this.warnIcon, this.warnText ]

    this.warnBg.on('pointerup', (): void => {
      if (this.warnLogs.length > 0) {
        const { x, y } = this.warnLogs[this.warnLogs.length - 1]
        this.gameScene.centerCamera(x, y, false, 1000)
        this.warnLogs.pop()

        if (this.warnLogs.length > 0) {
          this.warnText.setText(`${this.lang.underAtack} (${this.warnLogs.length})`)
          this.warnFadeIn()
        } else {
          this.warnElements.forEach(el => el.setAlpha(0))
          this.warnFadeInAni.remove()
        }
      }
    })

    this.allElements = this.allElements.concat(this.warnElements)
  }


  public createWarningBaseWasFoundBar(x: number, y: number): void {
    this.warnBaseWasFoundBg = this.add.sprite(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 46, 'block').setOrigin(1, 0).setTint(0x000000).setAlpha(0.4).setDisplaySize(160, 40).setInteractive()
    this.warnBaseWasFoundIcon = this.add.sprite(this.warnBaseWasFoundBg.getLeftCenter().x + 6, this.warnBaseWasFoundBg.getLeftCenter().y, 'warning').setOrigin(0, 0.5).setScale(0.3)
    this.warnBaseWasFoundText = this.add.text(this.warnBaseWasFoundIcon.getRightCenter().x + 6, this.warnBaseWasFoundIcon.getRightCenter().y, this.lang.enemyBaseSited, {
      font: '12px Molot', align: 'center', color: '#d8ae1c'
    }).setOrigin(0, 0.5).setStroke('#a65600', 3)

    const targets = [ this.warnBaseWasFoundBg, this.warnBaseWasFoundIcon, this.warnBaseWasFoundText ]
    targets.forEach(el => el.setX(el.x + 200))

    const fadeOut: Phaser.Tweens.Tween = this.tweens.add({
      targets,
      x: '-=200',
      duration: 300
    })
    const fadeIn: Phaser.Tweens.Tween = this.tweens.add({
      targets,
      alpha: 0,
      duration: 500,
      delay: 10000
    })

    this.warnBaseWasFoundBg.on('pointerup', (): void => {
      this.gameScene.centerCamera(x, y, false, 1000)
      targets.forEach(el => el.destroy())
      fadeOut?.remove()
      fadeIn?.remove()
    })
  }


  private createColorSwitcher(): void {
    this.switcher = this.add.tileSprite(this.camera.width / 2, this.camera.height, 60, 60, 'pixel').setOrigin(0.5, 1).setTint(colors[this.playerColor].main).setInteractive()
    this.switcher.on('pointerup', () => {
      if (this.gameScene.player.color === 'green') {
        this.gameScene.player.color = 'red'
        this.gameScene.enemyColor = 'green'
      } else {
        this.gameScene.player.color = 'green'
        this.gameScene.enemyColor = 'red'
      }
      this.switcher.setTint(colors[this.gameScene.player.color].main)
    })
  }


  public updateWorldStatusBar(): void {
    const playerHexes: number = this.gameScene.playerHexes().length
    const enemyHexes: number = this.gameScene.enemyHexes().length
    const playerLineWidth = this.getLineWidth(playerHexes)
    const enemyLineWidth = this.getLineWidth(enemyHexes)

    this.checkStarsProgress(playerLineWidth)

    if (!this.playerStatusBar.visible && playerLineWidth > 1) {
      this.playerStatusBar.setVisible(true)
      this.playerStatusBarBg.setVisible(true)
    }

    if (!this.enemyStatusBar.visible && enemyLineWidth > 1) {
      this.enemyStatusBar.setVisible(true)
      this.enemyStatusBarBg.setVisible(true)
    }

    if (playerLineWidth !== this.playerStatusBar.getBounds().width || enemyLineWidth !== this.enemyStatusBar.getBounds().width) {
      this.playerStatusBarBg.setSize(playerLineWidth, this.playerStatusBar.height).setDepth(3)
      this.enemyStatusBarBg.setSize(enemyLineWidth, this.enemyStatusBar.height).setDepth(3)
      this.playerStatusBar.setDepth(4)
      this.enemyStatusBar.setDepth(4)

      this.worldStatusAni?.remove()
      this.worldStatusAni = this.tweens.add({
        onStart: (): void => {
          if (this.playerStatusBar.getBounds().width < playerLineWidth) {
            this.enemyStatusBarBg.setDepth(1)
            this.enemyStatusBar.setDepth(2)
          } else {
            this.playerStatusBarBg.setDepth(1)
            this.playerStatusBar.setDepth(2)
          }
        },
        targets: [ this.playerStatusBar, this.enemyStatusBar ],
        width: (target: Phaser.GameObjects.TileSprite): number => {
          if (target === this.playerStatusBar) return playerLineWidth
          if (target === this.enemyStatusBar) return enemyLineWidth
        },
        duration: 800,
        ease: 'Power2',
      })
    }

    this.playerClamedHexCounter?.setText(`${playerHexes}`)
    this.enemyHexCounter?.setText(`${enemyHexes}`)
  }

  private checkStarsProgress(width: number): void {
    this.lineWidth = this.camera.width / 2.5
    if (width >= this.lineWidth - 1) {
      this.stars.forEach(star => { if (star.texture.key !== 'star') star.setTexture('star') })
      if (this.gameScene.gameIsOn) this.gameScene.stars = 3
    } else if (width >= this.getStarPoint(2)) {
      if (this.star1.texture.key !== 'star') this.star1.setTexture('star')
      if (this.star2.texture.key !== 'star') this.star2.setTexture('star')
      if (this.star3.texture.key === 'star') this.star2.setTexture('star-disabled')
      if (this.gameScene.gameIsOn) this.gameScene.stars = 2
    } else if (width >= this.getStarPoint(1)) {
      if (this.star1.texture.key !== 'star') this.star1.setTexture('star')
      if (this.star2.texture.key === 'star') this.star2.setTexture('star-disabled')
      if (this.star3.texture.key === 'star') this.star2.setTexture('star-disabled')
      if (this.gameScene.gameIsOn) this.gameScene.stars = 1
    } else {
      this.stars.forEach(star => { if (star.texture.key === 'star') star.setTexture('star-disabled') })
      if (this.gameScene.gameIsOn) this.gameScene.stars = 0
    }
  }

  public updateHexCounter(): void {
    this.hexBarText.setText(`${this.gameScene[this.playerColor].hexes}`)
    this.superHexBarText.setText(`${this.gameScene[this.playerColor].superHex}`)
    this.hexBarTextP2.setText(`${this.playerColor === 'green' ? this.gameScene.red.hexes : this.gameScene.green.hexes}`)
  }

  private getLineWidth(sum: number): number {
    this.totalHexes = this.gameScene.playerHexes().length + this.gameScene.enemyHexes().length
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    return p * sum
  }

  private getStarPoint(number: number) {
    const lineWidth = this.camera.width / 2.5
    if (number === 1) return lineWidth / 2
    else if (number === 2) return lineWidth * 0.75
    else if (number === 3) return lineWidth
  }

  public setWarning(x: number, y: number, id: string): void {
    this.warnLogs.push({ x, y, id })
    this.warnElements.forEach(el => el.setAlpha(1))
    this.warnBg.setAlpha(0.4)
    this.warnText.setText(`${this.lang.underAtack} (${this.warnLogs.length})`)

    if (this.warnLogs.length === 1) {
      this.warnElements.forEach(el => el.setX(el.x + 200))
      this.warnCreateAni = this.tweens.add({
        targets: this.warnElements,
        x: '-=200',
        duration: 300
      })
    }

    this.warnFadeIn()
  }

  private warnFadeIn(): void {
    this.warnFadeInAni?.remove()
    this.warnFadeInAni = this.tweens.add({
      targets: this.warnElements,
      alpha: 0,
      duration: 500,
      delay: 7000,
      onComplete: (): void => { this.warnLogs = [] }
    })
  }

  public resize(): void {
    const greenHexes: number = this.gameScene?.hexes.filter(hex => hex.own === 'green').length
    const redHexes: number = this.gameScene?.hexes.filter(hex => hex.own === 'red').length

    this.bg?.setPosition(0, 0).setSize(this.camera.width, this.bg.height)
    this.menuBtn?.setPosition(this.camera.width - 2, 1)
    this.switcher?.setPosition(this.camera.width / 2, this.camera.height)

    this.playerName?.setPosition(this.camera.width / 2 - 10, 4)
    this.enemyName?.setPosition(this.camera.width / 2 + 10, 4)

    this.worldStatusBar?.setPosition(this.camera.width / 2, this.worldStatusBar.y).setSize(this.camera.width / 2.5, 20)
    this.playerStatusBar?.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLineWidth(greenHexes), this.worldStatusBar.height)
    this.enemyStatusBar?.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLineWidth(redHexes), this.worldStatusBar.height)
    this.playerStatusBarBg?.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLineWidth(greenHexes), this.worldStatusBar.height)
    this.enemyStatusBarBg?.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLineWidth(redHexes), this.worldStatusBar.height)
    this.timer?.setPosition(this.worldStatusBar.getCenter().x, this.worldStatusBar.getBottomCenter().y + 2)

    this.star1?.setPosition(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(1), this.worldStatusBar.getTopCenter().y + 4)
    this.star2?.setPosition(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(2), this.worldStatusBar.getTopCenter().y + 4)
    this.star3?.setPosition(this.worldStatusBar.getLeftCenter().x + this.getStarPoint(3), this.worldStatusBar.getTopCenter().y + 4)
    
    this.warnBg?.setPosition(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 10)
    this.warnIcon?.setPosition(this.warnBg.getLeftCenter().x + 6, this.warnBg.getLeftCenter().y)
    this.warnText?.setPosition(this.warnIcon.getRightCenter().x + 6, this.warnIcon.getRightCenter().y)

    this.warnBaseWasFoundBg?.setPosition(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 46)
    this.warnBaseWasFoundIcon?.setPosition(this.warnBaseWasFoundBg.getLeftCenter().x + 6, this.warnBaseWasFoundBg.getLeftCenter().y)
    this.warnBaseWasFoundText?.setPosition(this.warnBaseWasFoundIcon.getRightCenter().x + 6, this.warnBaseWasFoundIcon.getRightCenter().y)
    
    this.hexBar?.setPosition(5, 5)
    this.hexBarText?.setPosition(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2)
    this.superHexBar?.setPosition(this.hexBar.getBottomCenter().x, this.hexBar.getBottomCenter().y + 10)
    this.superHexBarText?.setPosition(this.superHexBar.getCenter().x + 1, this.superHexBar.getCenter().y - 2)

    this.hexBarP2?.setPosition(this.camera.width - 10, this.camera.height - 10)
    this.hexBarTextP2?.setPosition(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2)
  }


  public hide(): void {
    this.timer.stop()
    this.tweens.add({
      targets: this.allElements,
      alpha: 0,
      duration: 700
    })
  }


  private debug(): void {
    let text = `
      desktop:  ${this.game.device.os.desktop}\n
      android:  ${this.game.device.os.android}\n
      width:  ${this.gameScene?.camera.width}\n
      height:  ${this.gameScene?.camera.height}\n
      worldView_width:  ${this.gameScene?.camera.worldView.width}\n
      worldView_height:  ${this.gameScene?.camera.worldView.height}\n
      worldView_x:  ${this.gameScene?.camera.midPoint.x}\n
      worldView_y:  ${this.gameScene?.camera.midPoint.y}\n
      zoom:  ${this.gameScene?.camera.zoom}\n
    `

    // zoomed:  ${this.gameScene?.zoomed}\n
    // draged:  ${this.gameScene?.draged}\n
    // twoPointerZoom:  ${this.gameScene?.twoPointerZoom}\n
    // own:  ${this.gameScene?.pointerHex?.own}\n
    // landscape:  ${this.gameScene?.pointerHex?.landscape}\n
    // worldView_height:  ${this.gameScene?.camera.worldView.height}\n
    // zoom:  ${this.gameScene?.camera.zoom}\n
    // rows:  ${this.gameScene?.rows}\n
    // cols:  ${this.gameScene?.cols}\n
    // Pointer_hex:  ${this.gameScene?.pointerHex?.id}\n
    // hold_Counter:  ${this.gameScene.holdCounter}\n
    this.debugText?.setText(text)
  }


  public update(): void {
    if (this.gameScene.debuging) this.debug()
  }
}