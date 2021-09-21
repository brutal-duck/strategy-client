import Game from "./Game"

export default class Hud extends Phaser.Scene {
  constructor() {
    super('Hud')
  }

  public state: Istate
  public gameScene: Game

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
  private worldStatusAni: Phaser.Tweens.Tween
  private hexBar: Phaser.GameObjects.Sprite
  private hexBarText: Phaser.GameObjects.Text
  private hexBarP2: Phaser.GameObjects.Sprite
  private hexBarTextP2: Phaser.GameObjects.Text


  private debugText: Phaser.GameObjects.Text

  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.player1Color = { str: 'red', num: 0x990000 }
    this.player2Color = { str: 'blue', num: 0x000099 }
    this.player1AltColor = 0xDB3939
    this.player2AltColor = 0x5B65D8
    this.totalHexes = this.gameScene.cols * this.gameScene.rows
  }
  
  public create(): void {
    this.debugText = this.add.text(-6, 14, '', { font: '10px Colus', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-7)

    this.createHexBar()
    this.createHexBarPlayer2()
    this.createWorldStatusBar()
    this.createColorSwitcher()
  }


  private createHexBar(): void {
    this.hexBar = this.add.sprite(10, this.cameras.main.height - 10, 'hex').setScale(0.65).setTint(0xD68780).setOrigin(0, 1)
    this.hexBarText = this.add.text(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2, String(this.gameScene.player1Config.hexes), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
  }


  private createHexBarPlayer2(): void {
    this.hexBarP2 = this.add.sprite(this.cameras.main.width - 10, this.cameras.main.height - 10, 'hex').setScale(0.65).setTint(0x909CD1).setOrigin(1)
    this.hexBarTextP2 = this.add.text(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2, String(this.gameScene.player2Config.hexes), {
      font: '36px Colus', color: '#BED3C0'
    }).setOrigin(0.5).setStroke('black', 3)
  }


  private createWorldStatusBar(): void {
    this.worldStatusBar = this.add.tileSprite(this.cameras.main.width / 2, 0, this.cameras.main.width / 1.5, 20, 'pixel').setOrigin(0.5, 0)
    this.player1StatusBar = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player1Color.num).setDepth(2).setOrigin(0, 0.5).setVisible(false)
    this.player2StatusBar = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player2Color.num).setDepth(2).setOrigin(1, 0.5).setVisible(false)
    this.player1StatusBarBg = this.add.tileSprite(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player1AltColor).setOrigin(0, 0.5).setVisible(false)
    this.player2StatusBarBg = this.add.tileSprite(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y, 1, this.worldStatusBar.height, 'pixel').setTint(this.player2AltColor).setOrigin(1, 0.5).setVisible(false)
  }


  public updateWorldStatusBar(): void {
    const line1Width = this.getLine1Width()
    const line2Width = this.getLine2Width()

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

    // this.player1StatusBar.setSize(line1Width, this.player1StatusBar.height)
    // this.player2StatusBar.setSize(line2Width, this.player2StatusBar.height)
  }


  private createColorSwitcher(): void {
    this.switcher = this.add.tileSprite(this.cameras.main.width / 2, this.cameras.main.height, 60, 60, 'pixel').setOrigin(0.5, 1).setTint(this.gameScene.player.color === 'red' ? 0x990000 : 0x000099).setInteractive()
    this.switcher.on('pointerup', () => {
      if (this.gameScene.player.color === 'red') this.gameScene.player.color = 'blue'
      else this.gameScene.player.color = 'red'
      this.switcher.setTint(this.gameScene.player.color === 'red' ? 0x990000 : 0x000099)
    })
  }


  private getLine1Width(): number {
    const redHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'red').length
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    return p * redHexes
  }

  private getLine2Width(): number {
    const blueHexes: number = this.gameScene.hexes.filter(hex => hex.color === 'blue').length
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    return p * blueHexes
  }


  public resize(): void {
    this.switcher.setPosition(this.cameras.main.width / 2, this.cameras.main.height)
    this.worldStatusBar.setPosition(this.cameras.main.width / 2, 0).setSize(this.cameras.main.width / 1.5, 20)
    this.player1StatusBar.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLine1Width(), this.worldStatusBar.height)
    this.player2StatusBar.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLine2Width(), this.worldStatusBar.height)
    this.player1StatusBarBg.setPosition(this.worldStatusBar.getLeftCenter().x, this.worldStatusBar.getLeftCenter().y).setSize(this.getLine1Width(), this.worldStatusBar.height)
    this.player2StatusBarBg.setPosition(this.worldStatusBar.getRightCenter().x, this.worldStatusBar.getRightCenter().y).setSize(this.getLine2Width(), this.worldStatusBar.height)
    this.hexBar.setPosition(10, this.cameras.main.height - 10)
    this.hexBarText.setPosition(this.hexBar.getCenter().x + 1, this.hexBar.getCenter().y - 2)
    this.hexBarP2.setPosition(this.cameras.main.width - 10, this.cameras.main.height - 10)
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