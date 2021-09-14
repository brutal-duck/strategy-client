
const block: any = require("./../../assets/images/block-rounded.png");
const world: any = require("./../../assets/images/world.png");
const hex: any = require("./../../assets/images/hex.png");

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
  }

  public create(): void {
    this.scene.stop()
    this.scene.start('Game')
  }
}

export default Preload;
