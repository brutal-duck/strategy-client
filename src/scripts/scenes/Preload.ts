
const block: any = require("./../../assets/images/block-rounded.png");
const world: any = require("./../../assets/images/world.png");
const hex: any = require("./../../assets/images/hex.png");
const hexBorder: any = require("./../../assets/images/hex-border.png");
const fog: any = require("./../../assets/images/fog.png");
const fogSoft: any = require("./../../assets/images/fog-soft.png");
const warning: any = require("./../../assets/images/warning.png");
const blink: any = require("./../../assets/images/blink-line.png");
const grade: any = require("./../../assets/images/grade.png");
const glow: any = require("./../../assets/images/glow.png");
const cross: any = require("./../../assets/images/cross.png");
const side: any = require("./../../assets/images/rounded-side.png");
const btnBorder: any = require("./../../assets/images/btns/btn-border.png");
const btnBorder1: any = require("./../../assets/images/btns/border-1.png");

const grayRock1: any = require("./../../assets/images/landscape/gray-rock-1.png");
const grayRock2: any = require("./../../assets/images/landscape/gray-rock-2.png");
const grayRock3: any = require("./../../assets/images/landscape/gray-rock-3.png");
const redRock1: any = require("./../../assets/images/landscape/red-rock-1.png");
const redRock2: any = require("./../../assets/images/landscape/red-rock-2.png");
const redRock3: any = require("./../../assets/images/landscape/red-rock-3.png");
const greenRock1: any = require("./../../assets/images/landscape/green-rock-1.png");
const greenRock2: any = require("./../../assets/images/landscape/green-rock-2.png");
const greenRock3: any = require("./../../assets/images/landscape/green-rock-3.png");
const greenGrass1: any = require("./../../assets/images/landscape/green-grass-1.png");
const greenGrass2: any = require("./../../assets/images/landscape/green-grass-2.png");
const greenGrass3: any = require("./../../assets/images/landscape/green-grass-3.png");
const greenGrass4: any = require("./../../assets/images/landscape/green-grass-4.png");
const greenGrass5: any = require("./../../assets/images/landscape/green-grass-5.png");
const grayGrass1: any = require("./../../assets/images/landscape/gray-grass-1.png");
const grayGrass2: any = require("./../../assets/images/landscape/gray-grass-2.png");
const grayGrass3: any = require("./../../assets/images/landscape/gray-grass-3.png");
const grayGrass4: any = require("./../../assets/images/landscape/gray-grass-4.png");
const grayGrass5: any = require("./../../assets/images/landscape/gray-grass-5.png");
const redGrass1: any = require("./../../assets/images/landscape/red-grass-1.png");
const redGrass2: any = require("./../../assets/images/landscape/red-grass-2.png");
const redGrass3: any = require("./../../assets/images/landscape/red-grass-3.png");
const redGrass4: any = require("./../../assets/images/landscape/red-grass-4.png");
const redGrass5: any = require("./../../assets/images/landscape/red-grass-5.png");
const water1: any = require("./../../assets/images/landscape/water-1.png");
const water2: any = require("./../../assets/images/landscape/water-2.png");
const redX1: any = require("./../../assets/images/landscape/red-x1-1.png");
const redX12: any = require("./../../assets/images/landscape/red-x1-2.png");
const greyX1: any = require("./../../assets/images/landscape/gray-x1-1.png");
const greyX12: any = require("./../../assets/images/landscape/gray-x1-2.png");
const greenX1: any = require("./../../assets/images/landscape/green-x1-1.png");
const greenX12: any = require("./../../assets/images/landscape/green-x1-2.png");
const redX3: any = require("./../../assets/images/landscape/red-x3-1.png");
const redX32: any = require("./../../assets/images/landscape/red-x3-2.png");
const grayX3: any = require("./../../assets/images/landscape/gray-x3-1.png");
const grayX32: any = require("./../../assets/images/landscape/gray-x3-2.png");
const greenX3: any = require("./../../assets/images/landscape/green-x3-1.png");
const greenX32: any = require("./../../assets/images/landscape/green-x3-2.png");
const baseRed: any = require("./../../assets/images/landscape/base-red.png");
const baseGreen: any = require("./../../assets/images/landscape/base-green.png");



class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  public state: Istate

  public init(state: Istate): void {
    this.state = state
  }

  public preload(): void {
    const line: Phaser.GameObjects.TileSprite = this.add.tileSprite(this.cameras.main.centerX - 200, this.cameras.main.centerY, 1, 20, 'pixel').setOrigin(0, 0.5).setTint(0x61ef93)

    this.load.on('progress', (value: number): void => {
      let percent: number = Math.round(value * 100);
      let onePercent: number = 400 / 100;
      let width: number = Math.round(percent * onePercent);
      line.setSize(width, line.height)
    });

    this.load.image('block', block)
    this.load.image('bg', world)
    this.load.image('hex', hex)
    this.load.image('hex-border', hexBorder)
    this.load.image('fog', fog)
    this.load.image('fog-soft', fogSoft)
    this.load.image('warning', warning)
    this.load.image('grade', grade)
    this.load.image('blink', blink)
    this.load.image('side', side)
    this.load.image('glow', glow)
    this.load.image('cross', cross)
    this.load.image('btn-border', btnBorder)
    this.load.image('border-1', btnBorder1)

    this.load.image('gray-rock-1', grayRock1)
    this.load.image('gray-rock-2', grayRock2)
    this.load.image('gray-rock-3', grayRock3)
    this.load.image('red-rock-1', redRock1)
    this.load.image('red-rock-2', redRock2)
    this.load.image('red-rock-3', redRock3)
    this.load.image('green-rock-1', greenRock1)
    this.load.image('green-rock-2', greenRock2)
    this.load.image('green-rock-3', greenRock3)
    this.load.image('green-grass-1', greenGrass1)
    this.load.image('green-grass-2', greenGrass2)
    this.load.image('green-grass-3', greenGrass3)
    this.load.image('green-grass-4', greenGrass4)
    this.load.image('green-grass-5', greenGrass5)
    this.load.image('gray-grass-1', grayGrass1)
    this.load.image('gray-grass-2', grayGrass2)
    this.load.image('gray-grass-3', grayGrass3)
    this.load.image('gray-grass-4', grayGrass4)
    this.load.image('gray-grass-5', grayGrass5)
    this.load.image('red-grass-1', redGrass1)
    this.load.image('red-grass-2', redGrass2)
    this.load.image('red-grass-3', redGrass3)
    this.load.image('red-grass-4', redGrass4)
    this.load.image('red-grass-5', redGrass5)
    this.load.image('water-1', water1)
    this.load.image('water-2', water2)
    this.load.image('red-x1-1', redX1)
    this.load.image('gray-x1-1', greyX1)
    this.load.image('green-x1-1', greenX1)
    this.load.image('red-x1-2', redX12)
    this.load.image('gray-x1-2', greyX12)
    this.load.image('green-x1-2', greenX12)
    this.load.image('red-x3-1', redX3)
    this.load.image('red-x3-2', redX32)
    this.load.image('gray-x3-1', grayX3)
    this.load.image('gray-x3-2', grayX32)
    this.load.image('green-x3-1', greenX3)
    this.load.image('green-x3-2', greenX32)
    this.load.image('base-green', baseGreen)
    this.load.image('base-red', baseRed)

  }

  public create(): void {
    this.scene.stop()
    this.scene.start('Game', this.state)
    this.scene.start('MainMenu', this.state)
  }
}

export default Preload;
