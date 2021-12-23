import SandwichBtn from "../components/buttons/SandwichBtn"
import { colors } from "../gameConfig"
import langs from "../langs"
import Game from "./Game"
import StatusBar from '../components/hud/StatusBar';
import HexCounter from './../components/hud/HexCounter';
import WarningPlate from './../components/hud/WarningPlate';
import Hint from './../components/hud/Hint';

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
  public hints: Phaser.GameObjects.Group;


  public init(state: Istate): void {
    this.state = state
    this.gameScene = this.game.scene.getScene('Game') as Game
    this.camera = this.cameras.main
    this.lang = langs.ru
    this.allElements = [];
    this.playerColor = this.gameScene.player.color;
    this.enemyColor = this.gameScene.player.color === 'red' ? 'green' : 'red';
    this.hints = this.add.group();
  }
  
  public create(): void {
    this.statusBar = new StatusBar(this);
    this.menuBtn = new SandwichBtn(this);
    this.hexCounter = new HexCounter(this);
    this.warningPlate = new WarningPlate(this);

    this.debugText = this.add.text(-26, this.camera.height, '', { font: '20px Molot', align: 'left', color: '#54C649' }).setStroke('#000', 2).setLineSpacing(-9).setOrigin(0, 1).setVisible(false);
    this.resize();
  }

  public enemyBaseSitedInfo(): void {
    const text = this.lang.enemyBaseSited;
    const color = colors[this.enemyColor].mainStr;
    new Hint(this, text, color);
  }

  public yourBaseOnAttack(): void {
    const text = this.lang.baseOnAttack;
    const color = colors[this.enemyColor].mainStr
    new Hint(this, text, color);
  }

  public cityClamedOrLostInfo(clamed: boolean): void {
    const text = clamed ? this.lang.cityClamed : this.lang.cityLost;
    const color = clamed ? colors[this.playerColor].mainStr : '#bc2626';
    new Hint(this, text, color);
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
    this.hints.children.entries.forEach((hint: Hint) => {
      hint.destroy();
    });
    this.warnBaseWasFoundText?.setX(this.statusBar.getCenter().x);
    this.warnCity?.setX(this.statusBar.getCenter().x);
    
    this.debugText?.setPosition(-26, this.camera.height);
  }

  public hide(): void {
    this.statusBar.stopTimer();
    this.hints.children.entries.forEach((hint: Hint) => {
      hint.destroy();
    });
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