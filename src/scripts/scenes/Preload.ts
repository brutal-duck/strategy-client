
const block: any = require("./../../assets/images/block-rounded.png");
const world: any = require("./../../assets/images/world.png");
const hex: any = require("./../../assets/images/hex.png");
const warning: any = require("./../../assets/images/warning.png");
const blink: any = require("./../../assets/images/blink-line.png");
const grade: any = require("./../../assets/images/grade.png");
const glow: any = require("./../../assets/images/glow.png");
const cross: any = require("./../../assets/images/cross.png");
const side: any = require("./../../assets/images/rounded-side.png");
const btnBorder: any = require("./../../assets/images/btns/btn-border.png");
const btnBorder1: any = require("./../../assets/images/btns/border-1.png");

class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  public state: Istate

  public init(state: Istate): void {
    this.state = state
  }

  public preload(): void {
    // this.load.on('progress', (value: number): void => {
    //   let percent: number = Math.round(value * 100);
    //   let onePercent: number = (300) / 100;
    //   let width: number = Math.round(percent * onePercent);
    // });

    this.load.image('block', block)
    this.load.image('bg', world)
    this.load.image('hex', hex)
    this.load.image('warning', warning)
    this.load.image('grade', grade)
    this.load.image('blink', blink)
    this.load.image('side', side)
    this.load.image('glow', glow)
    this.load.image('cross', cross)
    this.load.image('btn-border', btnBorder)
    this.load.image('border-1', btnBorder1)
  }

  public create(): void {
    this.scene.stop()
    this.scene.start('Game', this.state)
    // this.scene.start('Hud', this.state)
    this.scene.start('MainMenu', this.state)
  }
}

export default Preload;
