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
  private player1Color: { str: string, num: number }
  private player2Color: { str: string, num: number }
  private player1AltColor: number
  private player2AltColor: number

  private switcher: Phaser.GameObjects.TileSprite
  private worldStatusBar: Phaser.GameObjects.TileSprite
  private player1StatusBar: Phaser.GameObjects.TileSprite
  private player2StatusBar: Phaser.GameObjects.TileSprite
  private player1StatusBarBg: Phaser.GameObjects.TileSprite
  private player2StatusBarBg: Phaser.GameObjects.TileSprite
  private playerHexCounter: Phaser.GameObjects.Text
  private enemyHexCounter: Phaser.GameObjects.Text
  private timer: Phaser.GameObjects.Text
  private worldStatusAni: Phaser.Tweens.Tween

  private hexBar: Phaser.GameObjects.Sprite
  private hexBarText: Phaser.GameObjects.Text
  private superHexBar: Phaser.GameObjects.Sprite
  private superHexBarText: Phaser.GameObjects.Text

  private targetText: Phaser.GameObjects.Text

  private hexBarP2: Phaser.GameObjects.Sprite
  private hexBarTextP2: Phaser.GameObjects.Text


  private debugText: Phaser.GameObjects.Text


  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.camera = this.cameras.main
    this.lang = langs.ru

    this.player1Color = { str: 'red', num: 0x990000 }
    this.player2Color = { str: 'blue', num: 0x000099 }
    this.player1AltColor = 0xDB3939
    this.player2AltColor = 0x5B65D8
    this.totalHexes = this.gameScene.hexes.filter(hex => !hex.landscape).length
  }
  
  public create(): void {
    
    this.createMainBar()
    // this.createHexBar()
    this.createHexBarPlayer2()
    this.createWorldStatusBar()
    this.createColorSwitcher()


    this.debugText = this.add.text(-6, this.worldStatusBar.getBottomCenter().y, '', { font: '10px Colus', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-7)
  }


  private createMainBar(): void {
    this.hexBar = this.add.sprite(this.camera.width / 2 - 50, 4, 'hex').setScale(0.7).setTint(0xD68780).setOrigin(0.5, 0)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2, String(this.gameScene.player1Config.hexes), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.superHexBar = this.add.sprite(this.camera.width / 2 + 50, 4, 'hex').setScale(0.7).setTint(0xb879ff).setOrigin(0.5, 0)
    this.superHexBarText = this.add.text(this.superHexBar.getCenter().x + 1, this.superHexBar.getCenter().y - 2, String(this.gameScene.player1Config.superHex), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)

    this.targetText = this.add.text(0, 4, this.lang.target, {
      font: '16px Colus',
      align: 'left',
      wordWrap: { width: this.camera.width / 3 },
      color: 'black'
    })
    console.log('Hud ~ createMainBar ~ this.targetText', this.targetText)

  }


  private createHexBar(): void {
    this.hexBar = this.add.sprite(10, this.camera.height - 10, 'hex').setScale(0.65).setTint(0xD68780).setOrigin(0, 1)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2, String(this.gameScene.player1Config.hexes), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
  }


  private createHexBarPlayer2(): void {
    this.hexBarP2 = this.add.sprite(this.camera.width - 10, this.camera.height - 10, 'hex').setScale(0.65).setTint(0x909CD1).setOrigin(1)
    this.hexBarTextP2 = this.add.text(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2, String(this.gameScene.player2Config.hexes), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
  }


  private createWorldStatusBar(): void {
    this.worldStatusBar = this.add.tileSprite(this.camera.width / 2, 60, this.camera.width, 20, 'pixel').setOrigin(0.5, 0)
    this.player1StatusBar = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player1Color.num).setDepth(2).setOrigin(0, 0.5).setVisible(false)
    this.player2StatusBar = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player2Color.num).setDepth(2).setOrigin(1, 0.5).setVisible(false)
    this.player1StatusBarBg = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player1AltColor).setOrigin(0, 0.5).setVisible(false)
    this.player2StatusBarBg = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player2AltColor).setOrigin(1, 0.5).setVisible(false)

    this.timer = this.add.text(this.worldStatusBar.getCenter().x, this.worldStatusBar.getBottomCenter().y + 2, '00:00', {
      font: '18px Colus', align: 'center', color: '#c6ea00'
    }).setOrigin(0.5, 0).setStroke('black', 3)

    const redHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'red').length
    const blueHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'blue').length

    this.playerHexCounter = this.add.text(this.worldStatusBar.getCenter().x - 40, this.worldStatusBar.getBottomCenter().y + 2, `${redHexes}`, {
      font: '24px Colus', align: 'right', color: '#D80000'
    }).setOrigin(1, 0).setStroke('black', 3)

    this.enemyHexCounter = this.add.text(this.worldStatusBar.getCenter().x + 40, this.worldStatusBar.getBottomCenter().y + 2, `${blueHexes}`, {
      font: '24px Colus', align: 'left', color: '#3E3BD6'
    }).setOrigin(0).setStroke('black', 3)

    this.updateWorldStatusBar()
  }


  public updateWorldStatusBar(): void {
    const redHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'red').length
    const blueHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'blue').length
    const line1Width = this.getLineWidth(redHexes)
    const line2Width = this.getLineWidth(blueHexes)

    if (!this.player1StatusBar.visible && line1Width > 1) {
      this.player1StatusBar.setVisible(true)
      this.player1StatusBarBg.setVisible(true)
    }
    if (!this.player2StatusBar.visible && line2Width > 1) {
      this.player2StatusBar.setVisible(true)
      this.player2StatusBarBg.setVisible(true)
    }

    if (line1Width !== this.player1StatusBar.getBounds().width || line2Width !== this.player2StatusBar.getBounds().width) {
      this.player1StatusBarBg.setSize(line1Width, this.player1StatusBar.height)
      this.player2StatusBarBg.setSize(line2Width, this.player2StatusBar.height)

      this.worldStatusAni?.remove()
      this.worldStatusAni = this.tweens.add({
        targets: [ this.player1StatusBar, this.player2StatusBar ],
        width: (target: Phaser.GameObjects.TileSprite): number => {
          if (target === this.player1StatusBar) return line1Width
          if (target === this.player2StatusBar) return line2Width
        },
        duration: 800,
        ease: 'Power2',
      })
    }

    this.playerHexCounter.setText(`${redHexes}`)
    this.enemyHexCounter.setText(`${blueHexes}`)
  }


  private createColorSwitcher(): void {
    this.switcher = this.add.tileSprite(this.camera.width / 2, this.camera.height, 60, 60, 'pixel').setOrigin(0.5, 1).setTint(this.gameScene.player.color === 'red' ? 0x990000 : 0x000099).setInteractive()
    this.switcher.on('pointerup', () => {
      if (this.gameScene.player.color === 'red') this.gameScene.player.color = 'blue'
      else this.gameScene.player.color = 'red'
      this.switcher.setTint(this.gameScene.player.color === 'red' ? 0x990000 : 0x000099)
    })
  }


  private getLineWidth(sum: number): number {
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    return p * sum
  }


  public resize(): void {
    const redHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'red').length
    const blueHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'blue').length

    this.switcher.setPosition(this.camera.width / 2, this.camera.height)

    this.worldStatusBar.setPosition(this.camera.width / 2, this.worldStatusBar.y).setSize(this.camera.width, 20)
    this.player1StatusBar.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLineWidth(redHexes), this.worldStatusBar.height)
    this.player2StatusBar.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLineWidth(blueHexes), this.worldStatusBar.height)
    this.player1StatusBarBg.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLineWidth(redHexes), this.worldStatusBar.height)
    this.player2StatusBarBg.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLineWidth(blueHexes), this.worldStatusBar.height)
    this.timer.setPosition(this.worldStatusBar.getCenter().x, this.worldStatusBar.getBottomCenter().y + 2)

    this.playerHexCounter.setPosition(this.worldStatusBar.getCenter().x - 40, this.worldStatusBar.getBottomCenter().y + 2)
    this.enemyHexCounter.setPosition(this.worldStatusBar.getCenter().x + 40, this.worldStatusBar.getBottomCenter().y + 2)

    this.hexBar.setPosition(this.camera.width / 2 - 50, 4)
    this.hexBarText.setPosition(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2)
    this.superHexBar.setPosition(this.camera.width / 2 + 50, 4)
    this.superHexBarText.setPosition(this.superHexBar.getCenter().x + 1, this.superHexBar.getCenter().y - 2)

    this.targetText.setPosition(0, 4).setWordWrapWidth(this.camera.width / 2.8)
    const fontSize = +this.targetText.style.fontSize.replace('px', '')

    if (this.targetText.height > 52) {
      this.targetText.setFontSize(fontSize - 1)
    } else if (this.targetText.height < 30) {
      this.targetText.setFontSize(fontSize + 1)
    }


    this.hexBarP2.setPosition(this.camera.width - 10, this.camera.height - 10)
    this.hexBarTextP2.setPosition(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2)
  }


  private debug(): void {
    let text = `
      desktop:  ${this.game.device.os.desktop}\n
      android:  ${this.game.device.os.android}\n
      width:  ${this.gameScene?.camera.width}\n
      height:  ${this.gameScene?.camera.height}\n
      worldView_width:  ${this.gameScene?.camera.worldView.width}\n
      worldView_height:  ${this.gameScene?.camera.worldView.height}\n
      zoom:  ${this.gameScene?.camera.zoom}\n
      rows:  ${this.gameScene?.rows}\n
      cols:  ${this.gameScene?.cols}\n
      Pointer_hex:  ${this.gameScene?.pointerHex?.id}\n
      hold_Counter:  ${this.gameScene.holdCounter}\n
    `
    this.debugText?.setText(text)
  }


  public update(): void {
    if (this.gameScene.debuging) this.debug()
  }
}