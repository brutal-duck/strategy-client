import MatchMenuBtn from "../components/buttons/MatchMenuBtn"
import Timer from "../components/Timer"
import { color } from "../gameConfig"
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

  private targetText: Phaser.GameObjects.Text

  private hexBarP2: Phaser.GameObjects.Sprite
  private hexBarTextP2: Phaser.GameObjects.Text

  private warnLogs: Array<{ x: number, y: number, id: string }>
  private warnElements: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>
  private warnBg: Phaser.GameObjects.Sprite
  private warnText: Phaser.GameObjects.Text
  private warnIcon: Phaser.GameObjects.Sprite
  private warnCreateAni: Phaser.Tweens.Tween
  private warnFadeInAni: Phaser.Tweens.Tween

  private menuBtn: MatchMenuBtn

  private debugText: Phaser.GameObjects.Text


  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.camera = this.cameras.main
    this.lang = langs.ru

    this.playerColor = this.gameScene.player.color
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red'

    this.allElements = []
    this.warnLogs = []
    this.warnElements = []
  }
  
  public create(): void {
    // this.bg = this.add.tileSprite(0, 0, this.camera.width, 44, 'pixel').setOrigin(0)
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
    this.hexBar = this.add.sprite(5, 5, 'hex').setScale(0.5).setTint(color[this.playerColor].light).setOrigin(0)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x, this.hexBar.getCenter().y, String(this.gameScene[this.playerColor].hexes), {
      font: '26px Molot', align: 'center', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.superHexBar = this.add.sprite(this.hexBar.getBottomCenter().x, this.hexBar.getBottomCenter().y + 10, 'hex').setScale(0.5).setTint(0xb879ff).setOrigin(0.5, 0)
    this.superHexBarText = this.add.text(this.superHexBar.getCenter().x, this.superHexBar.getCenter().y, String(this.gameScene.green.superHex), {
      font: '26px Molot', align: 'center', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.allElements.push(this.hexBar, this.hexBarText, this.superHexBar, this.superHexBarText)
  }

  private createMainBarOld(): void {
    this.tilesBarText = this.add.text(10, 12, `${this.lang.tiles}:`, { font: '16px Molot', color: 'black' }).setOrigin(0)
    this.hexBar = this.add.sprite(this.tilesBarText.getRightCenter().x + 10, this.tilesBarText.getRightCenter().y, 'hex').setScale(0.5).setTint(this.playerColor === 'green' ? 0x95ffa4 : 0x9ffffc).setOrigin(0, 0.5)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2, String(this.gameScene[this.playerColor].hexes), {
      font: '26px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.superTilesBarText = this.add.text(this.hexBar.getRightCenter().x + 16, this.hexBar.getRightCenter().y, `${this.lang.superTiles}:`, {
      font: '16px Molot', color: 'black'
    }).setOrigin(0, 0.5)
    this.superHexBar = this.add.sprite(this.superTilesBarText.getRightCenter().x + 10, this.superTilesBarText.getRightCenter().y, 'hex').setScale(0.5).setTint(0xb879ff).setOrigin(0, 0.5)
    this.superHexBarText = this.add.text(this.superHexBar.getCenter().x + 1, this.superHexBar.getCenter().y - 2, String(this.gameScene.green.superHex), {
      font: '26px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.targetText = this.add.text(this.menuBtn.border.getLeftCenter().x - 20, this.menuBtn.border.getLeftCenter().y, `${this.lang.target.toUpperCase()}:\n${this.lang.targetDiscr}`, {
      font: '12px Molot',
      align: 'center',
      wordWrap: { width: this.camera.width / 3 },
      color: 'black'
    }).setOrigin(1, 0.5).setInteractive()

    this.allElements.push(this.tilesBarText, this.hexBar, this.hexBarText, this.superTilesBarText, this.superHexBar, this.superHexBarText, this.targetText)
  }


  private createHexBarPlayer2(): void {
    this.hexBarP2 = this.add.sprite(this.camera.width - 10, this.camera.height - 10, 'hex').setScale(0.65).setTint(color[this.enemyColor].light).setOrigin(1)
    this.hexBarTextP2 = this.add.text(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2, String(this.playerColor === 'green' ? this.gameScene.red.hexes : this.gameScene.green.hexes), {
      font: '36px Molot', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
    this.allElements.push(this.hexBarP2, this.hexBarTextP2)
  }


  private createWorldStatusBar(): void {
    this.playerName = this.add.text(this.camera.width / 2 - 10, 4, this.gameScene[this.playerColor].name, { font: '20px Molot', color: color[this.playerColor].lightStr }).setOrigin(1, 0)
    this.enemyName = this.add.text(this.camera.width / 2 + 10, 4, this.gameScene[this.enemyColor].name, { font: '20px Molot', color: color[this.enemyColor].lightStr })

    this.worldStatusBar = this.add.tileSprite(this.camera.width / 2, this.playerName.getBottomCenter().y + 4, this.camera.width / 2.5, 20, 'pixel').setOrigin(0.5, 0)
    this.playerStatusBar = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(color[this.playerColor].main).setDepth(4).setOrigin(0, 0.5).setVisible(false)
    this.enemyStatusBar = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(color[this.enemyColor].main).setDepth(4).setOrigin(1, 0.5).setVisible(false)
    this.playerStatusBarBg = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(color[this.playerColor].light).setDepth(3).setOrigin(0, 0.5).setVisible(false)
    this.enemyStatusBarBg = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(color[this.enemyColor].light).setDepth(3).setOrigin(1, 0.5).setVisible(false)

    // const greenHexes: number = this.gameScene.hexes.filter(hex => hex.own === 'green').length
    // const redHexes: number = this.gameScene.hexes.filter(hex => hex.own === 'red').length

    // this.playerClamedHexCounter = this.add.text(this.worldStatusBar.getCenter().x - 40, this.worldStatusBar.getBottomCenter().y + 2, `${greenHexes}`, {
    //   font: '24px Molot', align: 'right', color: '#D80000'
    // }).setOrigin(1, 0).setStroke('black', 3)

    // this.enemyHexCounter = this.add.text(this.worldStatusBar.getCenter().x + 40, this.worldStatusBar.getBottomCenter().y + 2, `${redHexes}`, {
    //   font: '24px Molot', align: 'left', color: '#3E3BD6'
    // }).setOrigin(0).setStroke('black', 3)

    this.allElements.push(this.playerName, this.enemyName, this.worldStatusBar, this.playerStatusBar, this.enemyStatusBar, this.playerStatusBarBg, this.enemyStatusBarBg)
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


  private createColorSwitcher(): void {
    this.switcher = this.add.tileSprite(this.camera.width / 2, this.camera.height, 60, 60, 'pixel').setOrigin(0.5, 1).setTint(color[this.playerColor].main).setInteractive()
    this.switcher.on('pointerup', () => {
      if (this.gameScene.player.color === 'green') this.gameScene.player.color = 'red'
      else this.gameScene.player.color = 'green'
      this.switcher.setTint(color[this.playerColor].main)
    })
  }


  public updateWorldStatusBar(): void {
    const playerHexes: number = this.gameScene.hexes.filter(hex => hex.own === this.playerColor).length
    const enemyHexes: number = this.gameScene.hexes.filter(hex => hex.own === this.enemyColor).length
    const line1Width = this.getLineWidth(playerHexes)
    const line2Width = this.getLineWidth(enemyHexes)

    if (!this.playerStatusBar.visible && line1Width > 1) {
      this.playerStatusBar.setVisible(true)
      this.playerStatusBarBg.setVisible(true)
    }

    if (!this.enemyStatusBar.visible && line2Width > 1) {
      this.enemyStatusBar.setVisible(true)
      this.enemyStatusBarBg.setVisible(true)
    }

    if (line1Width !== this.playerStatusBar.getBounds().width || line2Width !== this.enemyStatusBar.getBounds().width) {
      this.playerStatusBarBg.setSize(line1Width, this.playerStatusBar.height).setDepth(3)
      this.enemyStatusBarBg.setSize(line2Width, this.enemyStatusBar.height).setDepth(3)
      this.playerStatusBar.setDepth(4)
      this.enemyStatusBar.setDepth(4)

      this.worldStatusAni?.remove()
      this.worldStatusAni = this.tweens.add({
        onStart: (): void => {
          if (this.playerStatusBar.getBounds().width < line1Width) {
            this.enemyStatusBarBg.setDepth(1)
            this.enemyStatusBar.setDepth(2)
          } else {
            this.playerStatusBarBg.setDepth(1)
            this.playerStatusBar.setDepth(2)
          }
        },
        targets: [ this.playerStatusBar, this.enemyStatusBar ],
        width: (target: Phaser.GameObjects.TileSprite): number => {
          if (target === this.playerStatusBar) return line1Width
          if (target === this.enemyStatusBar) return line2Width
        },
        duration: 800,
        ease: 'Power2',
      })
    }

    this.playerClamedHexCounter?.setText(`${playerHexes}`)
    this.enemyHexCounter?.setText(`${enemyHexes}`)
  }


  public updateHexCounter(): void {
    this.hexBarText.setText(`${this.gameScene[this.playerColor].hexes}`)
    this.superHexBarText.setText(`${this.gameScene[this.playerColor].superHex}`)
    this.hexBarTextP2.setText(`${this.playerColor === 'green' ? this.gameScene.red.hexes : this.gameScene.green.hexes}`)
  }


  private getLineWidth(sum: number): number {
    this.totalHexes = this.gameScene.hexes.filter(hex => hex.own === 'green' || hex.own === 'red').length
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    return p * sum
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
    
    this.warnBg.setPosition(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 10)
    this.warnIcon.setPosition(this.warnBg.getLeftCenter().x + 6, this.warnBg.getLeftCenter().y)
    this.warnText.setPosition(this.warnIcon.getRightCenter().x + 6, this.warnIcon.getRightCenter().y)
    
    // this.playerClamedHexCounter?.setPosition(this.worldStatusBar.getCenter().x - 40, this.worldStatusBar.getBottomCenter().y + 2)
    // this.enemyHexCounter?.setPosition(this.worldStatusBar.getCenter().x + 40, this.worldStatusBar.getBottomCenter().y + 2)

    // this.tilesBarText?.setPosition(10, 12)
    this.hexBar?.setPosition(5, 5)
    this.hexBarText?.setPosition(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2)
    // this.superTilesBarText?.setPosition(this.hexBar.getRightCenter().x + 16, this.hexBar.getRightCenter().y)
    this.superHexBar?.setPosition(this.hexBar.getBottomCenter().x, this.hexBar.getBottomCenter().y + 10)
    this.superHexBarText?.setPosition(this.superHexBar.getCenter().x + 1, this.superHexBar.getCenter().y - 2)

    // this.targetText?.setPosition(this.menuBtn.border.getLeftCenter().x - 20, this.menuBtn.border.getLeftCenter().y).setWordWrapWidth(this.camera.width / 2.8)
    // const minSize = 9
    // const maxSize = 12
    // if (this.camera.width < 650 && this.targetText.style.fontSize === `${maxSize}px`) this.targetText.setFontSize(minSize)
    // else if (this.camera.width >= 650 && this.targetText.style.fontSize === `${minSize}px`) this.targetText.setFontSize(maxSize)

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