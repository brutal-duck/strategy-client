import SandwichBtn from "../components/buttons/SandwichBtn"
import Timer from "../components/Timer"
import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"

const BAR_DISPLAY_PERCENT = 5;
const TEXT_DISPLAY_PERCENT = 2;
const HEX_COUNT_DISPLAY_PECENT = 4;
const ICONS_DISPLAY_PERCENT = 4;
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

  private allElements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text | SandwichBtn>
  private bg: Phaser.GameObjects.TileSprite
  private switcher: Phaser.GameObjects.TileSprite

  private lineWidth: number

  private stars: Phaser.GameObjects.Sprite[]
  private star1: Phaser.GameObjects.Sprite
  private star2: Phaser.GameObjects.Sprite
  private star3: Phaser.GameObjects.Sprite

  public worldStatusBar: Phaser.GameObjects.TileSprite
  private playerName: Phaser.GameObjects.Text
  private enemyName: Phaser.GameObjects.Text
  private playerStatusBar: Phaser.GameObjects.TileSprite
  private enemyStatusBar: Phaser.GameObjects.TileSprite
  private worldStatusAni: Phaser.Tweens.Tween
  public timer: Timer
  private maskGraphics: Phaser.GameObjects.Graphics;

  public hexBar: Phaser.GameObjects.Sprite
  private hexBarText: Phaser.GameObjects.Text
  public superHexBar: Phaser.GameObjects.Sprite
  private superHexBarText: Phaser.GameObjects.Text

  private hexBarP2: Phaser.GameObjects.Sprite
  private hexBarTextP2: Phaser.GameObjects.Text

  private warnLogs: Array<{ x: number, y: number, id: string }>
  private warnElements: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Text>
  private warnBg: Phaser.GameObjects.Sprite
  private warnText: Phaser.GameObjects.Text
  private warnIcon: Phaser.GameObjects.Sprite
  private warnCreateAni: Phaser.Tweens.Tween
  private warnFadeInAni: Phaser.Tweens.Tween

  private warnBaseWasFoundText: Phaser.GameObjects.Text
  private warnBaseWasFoundAni: Phaser.Tweens.Tween

  private warnYourBaseOnAttackText: Phaser.GameObjects.Text;
  private warnYourBaseOnAttackAni: Phaser.Tweens.Tween;

  private warnCity: Phaser.GameObjects.Text
  private warnCityAni: Phaser.Tweens.Tween

  private menuBtn: SandwichBtn

  private debugText: Phaser.GameObjects.Text

  private incAnimationHex: Phaser.Tweens.Tween;
  private incAnimationSuperHex: Phaser.Tweens.Tween;

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
    const currentIconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    const scale = currentIconsHeight / 35;
    this.menuBtn = new SandwichBtn(this, { x: this.camera.width - currentIconsHeight / 2 - 15, y: currentIconsHeight / 2 + 15 }, (): void => { this.scene.launch('Modal', { state: this.state, type: 'gameMenu' }) });
    this.menuBtn.setScale(scale);
    this.createMainBar()
    this.createWorldStatusBar()
    this.createWarningBar()
    this.timer = new Timer(this, this.worldStatusBar.getCenter().x, this.worldStatusBar.getBottomCenter().y + 2, this.gameScene.green.matchTime)
    this.allElements.push(this.bg, this.timer.minutes, this.timer.seconds, this.timer.colon, this.menuBtn)

    this.debugText = this.add.text(-26, this.camera.height, '', { font: '20px Molot', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-9).setOrigin(0, 1).setVisible(false);
  }


  private createMainBar(): void {
    const currentTextHeight = Math.round(document.body.clientHeight / 100 * HEX_COUNT_DISPLAY_PECENT);
    const currentIconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: currentTextHeight + 'px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 5,
    };
    const scale = currentIconsHeight / 50;
    const player: Iconfig = this.gameScene[this.playerColor];
    this.hexBar = this.add.sprite(40, 40, 'hex').setScale(scale * 0.6);
    const hexBarGeom = this.hexBar.getBounds();
    this.hexBarText = this.add.text(hexBarGeom.right, hexBarGeom.centerY, String(player.hexes), textStyle).setOrigin(0, 0.5);

    this.superHexBar = this.add.sprite(hexBarGeom.centerX, hexBarGeom.bottom + 30, 'super-hex').setScale(scale * 0.6);
    const superGeom = this.superHexBar.getBounds();
    this.superHexBarText = this.add.text(superGeom.right, superGeom.centerY, String(player.superHex), textStyle).setOrigin(0, 0.5).setStroke('#97759E', 5);

    this.allElements.push(this.hexBar, this.hexBarText, this.superHexBar, this.superHexBarText)
  }

  private setIncAnimHex(sign: string): void {
    if (this.incAnimationHex) return;
    this.incAnimationHex = this.tweens.add({
      targets: this.hexBar,
      duration: 150,
      tint: {from: 0xffffff, to: sign === '-' ? 0xff0000 : 0xffffff},
      scale: `${sign}= 0.1`,
      yoyo: true,
      onComplete: () => {
        this.incAnimationHex = null;
      }
    });
  }

  private setIncAnimSuperHex(sign: string): void {
    if (this.incAnimationSuperHex) return;
    this.incAnimationSuperHex = this.tweens.add({
      targets: this.superHexBar,
      duration: 150,
      tint: {from: 0xffffff, to: sign === '-' ? 0xff0000 : 0xffffff},
      scale: `${sign}= 0.1`,
      yoyo: true,
      onComplete: () => {
        this.incAnimationSuperHex = null;
      }
    });
  }


  private createWorldStatusBar(): void {
    const currentTextHeight = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const currentBarHeight: number = document.body.clientHeight / 100 * BAR_DISPLAY_PERCENT;
    this.lineWidth = this.camera.width / 2.5;

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: currentTextHeight + 'px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
      wordWrap: { width: this.lineWidth / 2, useAdvancedWrap: true },
    };

    this.playerName = this.add.text(this.camera.width / 2 - this.lineWidth / 2, currentTextHeight * 1.5, this.gameScene[this.playerColor].name, textStyle).setOrigin(0, 0.5);
    this.enemyName = this.add.text(this.camera.width / 2 + this.lineWidth / 2, currentTextHeight * 1.5, this.gameScene[this.enemyColor].name, textStyle).setOrigin(1, 0.5);

    const barY = currentTextHeight * 4.2;
    this.worldStatusBar = this.add.tileSprite(this.camera.width / 2, barY, this.lineWidth, currentBarHeight, 'pixel').setOrigin(0.5).setVisible(false);

    const barGeom = this.worldStatusBar.getBounds();

    this.maskGraphics = this.add.graphics({ x: barGeom.centerX, y: barGeom.centerY })
      .fillStyle(0x00ff00)
      .fillRoundedRect(- barGeom.width / 2, -barGeom.height / 2, barGeom.width, barGeom.height, barGeom.height / 2)
      .setVisible(false);
    const mask = new Phaser.Display.Masks.GeometryMask(this, this.maskGraphics);
    this.playerStatusBar = this.add.tileSprite(barGeom.left, barGeom.centerY, 1, barGeom.height, `pixel-${this.playerColor}`).setDepth(4).setOrigin(0, 0.5);
    this.enemyStatusBar = this.add.tileSprite(barGeom.right, barGeom.centerY, 1, barGeom.height, `pixel-${this.enemyColor}`).setDepth(4).setOrigin(1, 0.5);
    this.playerStatusBar.setMask(mask);
    this.enemyStatusBar.setMask(mask);
    const scale = currentBarHeight / 50;

    this.star1 = this.add.sprite(barGeom.left + this.getStarPoint(1), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6)
    this.star2 = this.add.sprite(barGeom.left + this.getStarPoint(2), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6)
    this.star3 = this.add.sprite(barGeom.left + this.getStarPoint(3), barGeom.centerY + 3, 'lil-star-dis').setScale(scale).setDepth(6)
    this.stars = [ this.star1, this.star2, this.star3 ]

    this.allElements = this.allElements.concat(this.stars)
    this.allElements.push(
      this.playerName,
      this.enemyName,
      this.worldStatusBar,
      this.playerStatusBar,
      this.enemyStatusBar,
      this.warnBaseWasFoundText,
      this.warnCity,
    )
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

  public enemyBaseSitedInfo(): void {
    this.warnBaseWasFoundText = this.add.text(this.worldStatusBar.getCenter().x, this.worldStatusBar.getCenter().y, this.lang.enemyBaseSited, {
      font: '20px Molot', align: 'center', color: colors[this.enemyColor].mainStr
    }).setOrigin(0.5).setStroke('#000000', 2).setAlpha(0)

    const value = this.warnCityAni?.isPlaying() ? '+=66' : '+=46'
    this.warnBaseWasFoundAni = this.tweens.add({
      targets: this.warnBaseWasFoundText,
      alpha: { value: 1, duration: 600 },
      y: { value, duration: 600, ease: 'Quart.easeIn' },
      onComplete: (): void => {
        this.warnBaseWasFoundAni = this.tweens.add({
          targets: this.warnBaseWasFoundText,
          alpha: 0,
          duration: 600,
          delay: 4000,
          onComplete: (): void => {
            if (this.warnCityAni?.isPlaying()) {
              this.tweens.add({
                targets: this.warnCity,
                y: '-=20',
                duration: 200
              })
            }
          }
        })
      }
    })
  }

  public yourBaseOnAttack(): void {
    if (this.warnYourBaseOnAttackAni?.isPlaying()) return;
    this.warnYourBaseOnAttackText = this.add.text(this.worldStatusBar.getCenter().x, this.worldStatusBar.getCenter().y, this.lang.baseOnAttack, {
      font: '20px Molot', align: 'center', color: colors[this.enemyColor].mainStr
    }).setOrigin(0.5).setStroke('#000000', 2).setAlpha(0)
    const value = this.warnCityAni?.isPlaying() ? '+=66' : '+=46'
    this.warnYourBaseOnAttackAni = this.tweens.add({
      targets: this.warnYourBaseOnAttackText,
      alpha: { value: 1, duration: 600 },
      y: { value, duration: 600, ease: 'Quart.easeIn' },
      onComplete: (): void => {
        this.warnBaseWasFoundAni = this.tweens.add({
          targets: this.warnYourBaseOnAttackText,
          alpha: 0,
          duration: 600,
          delay: 4000,
          onComplete: (): void => {
            if (this.warnCityAni?.isPlaying()) {
              this.tweens.add({
                targets: this.warnCity,
                y: '-=20',
                duration: 200
              })
            }
          }
        })
      }
    })
  }

  public cityClamedOrLostInfo(clamed: boolean): void {
    const color = clamed ? colors[this.playerColor].mainStr : '#bc2626'
    const text = clamed ? this.lang.cityClamed : this.lang.cityLost
    this.warnCity = this.add.text(this.worldStatusBar.getCenter().x, this.worldStatusBar.getCenter().y, text, {
      font: '20px Molot', align: 'center', color
    }).setOrigin(0.5).setStroke('#000000', 2).setAlpha(0)
    

    const value = this.warnBaseWasFoundAni?.isPlaying() ? '+=80' : '+=80'
    this.warnCityAni = this.tweens.add({
      targets: this.warnCity,
      alpha: { value: 1, duration: 600 },
      y: { value, duration: 600, ease: 'Quart.easeIn' },
      onComplete: (): void => {
        this.warnCityAni = this.tweens.add({
          targets: this.warnCity,
          alpha: 0,
          duration: 600,
          delay: 4000,
          onComplete: (): void => {
            if (this.warnBaseWasFoundAni?.isPlaying()) {
              this.tweens.add({
                targets: this.warnBaseWasFoundText,
                y: '-=20',
                duration: 400
              })
            }
          }
        })
      }
    })
  }

  public updateWorldStatusBar(): void {
    const playerHexes: number = this.gameScene.playerHexes().length
    const enemyHexes: number = this.gameScene.enemyHexes().length
    const playerLineWidth = this.getLineWidth(playerHexes)
    const enemyLineWidth = this.getLineWidth(enemyHexes)

    this.checkStarsProgress(playerLineWidth);

    if (playerLineWidth !== this.playerStatusBar.getBounds().width || enemyLineWidth !== this.enemyStatusBar.getBounds().width) {
      this.playerStatusBar.setDepth(4)
      this.enemyStatusBar.setDepth(4)

      this.worldStatusAni?.remove()
      this.worldStatusAni = this.tweens.add({
        onStart: (): void => {
          if (this.playerStatusBar.getBounds().width < playerLineWidth) {
            this.enemyStatusBar.setDepth(2)
          } else {
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
  }

  private checkStarsProgress(width: number): void {
    this.lineWidth = this.camera.width / 2.5
    if (width >= this.lineWidth - 1) {
      this.stars.forEach(star => { if (star.texture.key !== 'lil-star') star.setTexture('lil-star') })
      if (this.gameScene.gameIsOn) this.gameScene.stars = 3
    } else if (width >= this.getStarPoint(2)) {
      if (this.star1.texture.key !== 'lil-star') this.star1.setTexture('lil-star')
      if (this.star2.texture.key !== 'lil-star') this.star2.setTexture('lil-star')
      if (this.star3.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.gameScene.gameIsOn) this.gameScene.stars = 2
    } else if (width >= this.getStarPoint(1)) {
      if (this.star1.texture.key !== 'lil-star') this.star1.setTexture('lil-star')
      if (this.star2.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.star3.texture.key === 'lil-star') this.star2.setTexture('lil-star-dis')
      if (this.gameScene.gameIsOn) this.gameScene.stars = 1
    } else {
      this.stars.forEach(star => { if (star.texture.key === 'lil-star') star.setTexture('lil-star-dis') })
      if (this.gameScene.gameIsOn) this.gameScene.stars = 0
    }
  }

  public updateHexCounter(): void {
    if (Number(this.hexBarText.text) < this.gameScene[this.playerColor].hexes) {
      this.setIncAnimHex('+');
    } else if (Number(this.hexBarText.text) > this.gameScene[this.playerColor].hexes) {
      this.setIncAnimHex('-');
    }

    if (Number(this.superHexBarText.text) < this.gameScene[this.playerColor].superHex) {
      this.setIncAnimSuperHex('+');
    } else if (Number(this.superHexBarText.text) > this.gameScene[this.playerColor].superHex) {
      this.setIncAnimSuperHex('-');
    }
    this.hexBarText.setText(`${this.gameScene[this.playerColor].hexes}`)
    this.superHexBarText.setText(`${this.gameScene[this.playerColor].superHex}`)
    this.hexBarTextP2?.setText(`${this.playerColor === 'green' ? this.gameScene.red.hexes : this.gameScene.green.hexes}`)
  }

  private getLineWidth(sum: number): number {
    this.totalHexes = this.gameScene.playerHexes().length + this.gameScene.enemyHexes().length
    const width = this.worldStatusBar.getBounds().width
    const p = width / this.totalHexes
    if (sum / this.totalHexes > 0.55) p * sum - 25;
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
    const currentHeight = document.body.clientHeight / 100 * BAR_DISPLAY_PERCENT;
    const curFontSize = Math.round(document.body.clientHeight / 100 * TEXT_DISPLAY_PERCENT);
    const curCountFontSize = Math.round(document.body.clientHeight / 100 * HEX_COUNT_DISPLAY_PECENT);
    const currentIconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    const iconsScale = currentIconsHeight / 40;
    const menuBtnScale = currentIconsHeight / 35;
    this.bg?.setPosition(0, 0).setSize(this.camera.width, this.bg.height)
    this.menuBtn?.setScale(menuBtnScale).setPosition(this.camera.width - currentIconsHeight / 2 - 15, currentIconsHeight / 2 + 15);
    this.switcher?.setPosition(this.camera.width / 2, this.camera.height)
    this.playerName?.setPosition(this.camera.width / 2 - this.camera.width / 5, curFontSize * 1.5).setWordWrapWidth(this.camera.width / 5).setFontSize(curFontSize);
    this.enemyName?.setPosition(this.camera.width / 2 + this.camera.width / 5, curFontSize * 1.5).setWordWrapWidth(this.camera.width / 5).setFontSize(curFontSize);
    const barY = curFontSize * 4.2;

    this.worldStatusBar?.setPosition(this.camera.width / 2, barY).setSize(this.camera.width / 2.5, currentHeight)
    const barGeom = this.worldStatusBar.getBounds();
    const scale = currentHeight / 50;
    this.maskGraphics
      .setPosition(barGeom.centerX, barGeom.centerY)
      .clear()
      .fillStyle(0x00ff00)
      .fillRoundedRect(- barGeom.width / 2, - barGeom.height / 2, barGeom.width, barGeom.height, barGeom.height / 2);

    this.playerStatusBar?.setPosition(barGeom.left, barGeom.centerY).setSize(this.getLineWidth(greenHexes), barGeom.height);
    this.enemyStatusBar?.setPosition(barGeom.right, barGeom.centerY).setSize(this.getLineWidth(redHexes), barGeom.height);
    this.timer?.setPosition(barGeom.centerX, barGeom.bottom + 2);

    this.star1?.setPosition(barGeom.left + this.getStarPoint(1), barGeom.centerY + 3).setScale(scale);
    this.star2?.setPosition(barGeom.left + this.getStarPoint(2), barGeom.centerY + 3).setScale(scale);
    this.star3?.setPosition(barGeom.left + this.getStarPoint(3), barGeom.centerY + 3).setScale(scale);
    
    this.warnBg?.setPosition(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 10)
    this.warnIcon?.setPosition(this.warnBg.getLeftCenter().x + 6, this.warnBg.getLeftCenter().y)
    this.warnText?.setPosition(this.warnIcon.getRightCenter().x + 6, this.warnIcon.getRightCenter().y)

    // this.warnBaseWasFoundBg?.setPosition(this.camera.width - 6, this.worldStatusBar.getBottomRight().y + 46)
    // this.warnBaseWasFoundBg?.setPosition(this.worldStatusBar.getCenter().x + 6, this.worldStatusBar.getCenter().y)
    // this.warnBaseWasFoundIcon?.setPosition(this.warnBaseWasFoundBg.getLeftCenter().x + 6, this.warnBaseWasFoundBg.getLeftCenter().y)
    this.warnBaseWasFoundText?.setX(this.worldStatusBar.getCenter().x)
    this.warnCity?.setX(this.worldStatusBar.getCenter().x)
    
    this.hexBar?.setPosition(40, 40).setScale(0.6 * iconsScale)
    this.hexBarText?.setPosition(this.hexBar.getBounds().right, this.hexBar.getBounds().centerY).setFontSize(curCountFontSize);
    this.superHexBar?.setPosition(this.hexBar.getBounds().centerX, this.hexBar.getBounds().bottom + 30).setScale(0.6 * iconsScale);
    this.superHexBarText?.setPosition(this.superHexBar.getBounds().right, this.superHexBar.getBounds().centerY).setFontSize(curCountFontSize);


    this.hexBarP2?.setPosition(this.camera.width - 10, this.camera.height - 10)
    this.hexBarTextP2?.setPosition(this.hexBarP2.getCenter().x + 1, this.hexBarP2.getCenter().y - 2)
    this.debugText?.setPosition(-26, this.camera.height);
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
      width:  ${this.gameScene?.camera.width}\n
      height:  ${this.gameScene?.camera.height}\n
      zoom:  ${this.gameScene?.camera.zoom.toFixed(2)}\n
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
    this.debug()

    if (this.state.tutorial === 0) {
      this.hexBar.setVisible(false);
      this.hexBarText.setVisible(false);
      this.superHexBarText.setVisible(false);
      this.superHexBar.setVisible(false);
      this.playerName.setVisible(false);
      this.enemyName.setVisible(false);
      this.playerStatusBar.setVisible(false);
      this.enemyStatusBar.setVisible(false);
      this.timer.setVisible(false);
      this.star1.setVisible(false);
      this.star2.setVisible(false);
      this.star3.setVisible(false);
      this.menuBtn.setVisible(false);
    } else if (this.state.tutorial === 1) {
      this.hexBar.setVisible(true);
      this.hexBarText.setVisible(true);
    } else if (this.state.tutorial === 3) {
      this.superHexBar.setVisible(true);
      this.superHexBarText.setVisible(true);
    } else if (this.state.tutorial === 4) {
      this.playerName.setVisible(true);
      this.enemyName.setVisible(true);
      this.playerStatusBar.setVisible(true);
      this.enemyStatusBar.setVisible(true);
      this.timer.setVisible(true);
      this.star1.setVisible(true);
      this.star2.setVisible(true);
      this.star3.setVisible(true);
    }
  }
}