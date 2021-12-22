import SandwichBtn from "../components/buttons/SandwichBtn"
import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import StatusBar from '../components/hud/StatusBar';
import HexCounter from './../components/hud/HexCounter';
import WarningPlate from './../components/hud/WarningPlate';

export default class Hud extends Phaser.Scene {
  constructor() {
    super('Hud')
  }

  public state: Istate
  public gameScene: Game
  public camera: Phaser.Cameras.Scene2D.Camera
  public lang: any

  public totalHexes: number
  private playerColor: string
  public enemyColor: string

  public allElements: Array<Phaser.GameObjects.TileSprite | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text | SandwichBtn>

  public statusBar: StatusBar;
  public hexCounter: HexCounter;
  public warningPlate: WarningPlate;

  private warnBaseWasFoundText: Phaser.GameObjects.Text;
  private warnBaseWasFoundAni: Phaser.Tweens.Tween;
  private warnYourBaseOnAttackText: Phaser.GameObjects.Text;
  private warnYourBaseOnAttackAni: Phaser.Tweens.Tween;
  private warnCity: Phaser.GameObjects.Text;
  private warnCityAni: Phaser.Tweens.Tween;

  public menuBtn: SandwichBtn;
  private debugText: Phaser.GameObjects.Text;


  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.camera = this.cameras.main
    this.lang = langs.ru
    this.allElements = [];
    this.playerColor = this.gameScene.player.color;
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red';
  }
  
  public create(): void {
    this.menuBtn = new SandwichBtn(this);
    this.statusBar = new StatusBar(this);
    this.hexCounter = new HexCounter(this);
    this.warningPlate = new WarningPlate(this);

    this.debugText = this.add.text(-26, this.camera.height, '', { font: '20px Molot', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-9).setOrigin(0, 1).setVisible(false);
  }

  public enemyBaseSitedInfo(): void {
    this.warnBaseWasFoundText = this.add.text(this.statusBar.getCenter().x, this.statusBar.getCenter().y, this.lang.enemyBaseSited, {
      font: '20px Molot', align: 'center', color: colors[this.enemyColor].mainStr
    }).setOrigin(0.5).setStroke('#000000', 1).setAlpha(0)
    this.allElements.push(this.warnBaseWasFoundText);

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
    this.warnYourBaseOnAttackText = this.add.text(this.statusBar.getCenter().x, this.statusBar.getCenter().y, this.lang.baseOnAttack, {
      font: '20px Molot', align: 'center', color: colors[this.enemyColor].mainStr
    }).setOrigin(0.5).setStroke('#000000', 1).setAlpha(0)
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
    this.warnCity = this.add.text(this.statusBar.getCenter().x, this.statusBar.getCenter().y, text, {
      font: '20px Molot', align: 'center', color
    }).setOrigin(0.5).setStroke('#000000', 1).setAlpha(0)
    

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
    this.statusBar.update();
  }

  public updateHexCounter(): void {
    this.hexCounter.update();
  }

  public setWarning(x: number, y: number, id: string): void {
    this.warningPlate.setWarning(x, y, id);
  }

  public resize(): void {
    this.statusBar.resize();
    this.hexCounter.resize();
    this.menuBtn?.resize();
    this.warningPlate?.resize();

    this.warnBaseWasFoundText?.setX(this.statusBar.getCenter().x);
    this.warnCity?.setX(this.statusBar.getCenter().x);
    
    this.debugText?.setPosition(-26, this.camera.height);
  }


  public hide(): void {
    this.statusBar.stopTimer();
    this.tweens.add({
      targets: this.allElements,
      alpha: 0,
      duration: 700
    });
  }


  private debug(): void {
    const text = `
      width:  ${this.gameScene?.camera.width}\n
      height:  ${this.gameScene?.camera.height}\n
      zoom:  ${this.gameScene?.camera.zoom.toFixed(2)}\n
    `;
    this.debugText?.setText(text)
  }


  public update(): void {
    this.debug()
  }
}