import langs from '../langs';

const block: string = require('./../../assets/images/block-rounded.png');
const world: string = require('./../../assets/images/world.png');
const hex: string = require('./../../assets/images/hex.png');
const superHex: string = require('./../../assets/images/super-hex.png');
const hexBorder2: string = require('./../../assets/images/hex-border-2.png');
const fog: string = require('./../../assets/images/fog.png');
const fogSoft: string = require('./../../assets/images/fog-soft.png');
const warning: string = require('./../../assets/images/warning.png');
const star: string = require('./../../assets/images/star.png');
const header: string = require('./../../assets/images/modal/header.png');
const headerMid: string = require('./../../assets/images/modal/header-mid.png');
const headerLil: string = require('./../../assets/images/modal/header-lil.png');
const circle: string = require('../../assets/images/circle.png');
const grayRock1: string = require('./../../assets/images/landscape/gray-rock-1.png');
const grayRock2: string = require('./../../assets/images/landscape/gray-rock-2.png');
const grayRock3: string = require('./../../assets/images/landscape/gray-rock-3.png');
const redRock1: string = require('./../../assets/images/landscape/red-rock-1.png');
const redRock2: string = require('./../../assets/images/landscape/red-rock-2.png');
const redRock3: string = require('./../../assets/images/landscape/red-rock-3.png');
const greenRock1: string = require('./../../assets/images/landscape/green-rock-1.png');
const greenRock2: string = require('./../../assets/images/landscape/green-rock-2.png');
const greenRock3: string = require('./../../assets/images/landscape/green-rock-3.png');
const greenGrass1: string = require('./../../assets/images/landscape/green-grass-1.png');
const greenGrass2: string = require('./../../assets/images/landscape/green-grass-2.png');
const greenGrass3: string = require('./../../assets/images/landscape/green-grass-3.png');
const greenGrass4: string = require('./../../assets/images/landscape/green-grass-4.png');
const greenGrass5: string = require('./../../assets/images/landscape/green-grass-5.png');
const grayGrass1: string = require('./../../assets/images/landscape/gray-grass-1.png');
const grayGrass2: string = require('./../../assets/images/landscape/gray-grass-2.png');
const grayGrass3: string = require('./../../assets/images/landscape/gray-grass-3.png');
const grayGrass4: string = require('./../../assets/images/landscape/gray-grass-4.png');
const grayGrass5: string = require('./../../assets/images/landscape/gray-grass-5.png');
const redGrass1: string = require('./../../assets/images/landscape/red-grass-1.png');
const redGrass2: string = require('./../../assets/images/landscape/red-grass-2.png');
const redGrass3: string = require('./../../assets/images/landscape/red-grass-3.png');
const redGrass4: string = require('./../../assets/images/landscape/red-grass-4.png');
const redGrass5: string = require('./../../assets/images/landscape/red-grass-5.png');
const water1: string = require('./../../assets/images/landscape/water-1.png');
const water2: string = require('./../../assets/images/landscape/water-2.png');
const redX1: string = require('./../../assets/images/landscape/red-x1-1.png');
const redX12: string = require('./../../assets/images/landscape/red-x1-2.png');
const greyX1: string = require('./../../assets/images/landscape/gray-x1-1.png');
const greyX12: string = require('./../../assets/images/landscape/gray-x1-2.png');
const greenX1: string = require('./../../assets/images/landscape/green-x1-1.png');
const greenX12: string = require('./../../assets/images/landscape/green-x1-2.png');
const redX3: string = require('./../../assets/images/landscape/red-x3-1.png');
const redX32: string = require('./../../assets/images/landscape/red-x3-2.png');
const grayX3: string = require('./../../assets/images/landscape/gray-x3-1.png');
const grayX32: string = require('./../../assets/images/landscape/gray-x3-2.png');
const greenX3: string = require('./../../assets/images/landscape/green-x3-1.png');
const greenX32: string = require('./../../assets/images/landscape/green-x3-2.png');
const baseRed: string = require('./../../assets/images/landscape/red-base.png');
const baseGreen: string = require('./../../assets/images/landscape/green-base.png');
const baseAlone: string = require('./../../assets/images/landscape/base-alone.png');
const greenSuper1: string = require('./../../assets/images/landscape/green-super-1.png');
const greenSuper2: string = require('./../../assets/images/landscape/green-super-2.png');
const redSuper1: string = require('./../../assets/images/landscape/red-super-1.png');
const redSuper2: string = require('./../../assets/images/landscape/red-super-2.png');
const graySuper1: string = require('./../../assets/images/landscape/gray-super-1.png');
const graySuper2: string = require('./../../assets/images/landscape/gray-super-2.png');
const greenFort1: string = require('./../../assets/images/landscape/green-fort-1.png');
const greenFort2: string = require('./../../assets/images/landscape/green-fort-2.png');
const redFort1: string = require('./../../assets/images/landscape/red-fort-1.png');
const redFort2: string = require('./../../assets/images/landscape/red-fort-2.png');
const greenTower: string = require('./../../assets/images/landscape/green-tower.png');
const redTower: string = require('./../../assets/images/landscape/red-tower.png');

const startGameBtn: string = require('../../assets/images/btns/btn-play.png');
const pixelGreen: string = require('../../assets/images/pxl-green.png');
const pixelRed: string = require('../../assets/images/pxl-red.png');
const lilStar: string = require('../../assets/images/lil-star.png');
const lilStarDis: string = require('../../assets/images/lil-star-dis.png');
const windowPixel: string = require('../../assets/images/modal/pxl-window.png');
const windowPixelLil: string = require('../../assets/images/modal/pxl-window-lil.png');
const windowPixelMid: string = require('../../assets/images/modal/pxl-window-mid.png');
const exitBtn: string = require('../../assets/images/btns/btn-exit.png');
const menuBtn: string = require('../../assets/images/btns/btn-menu.png');
const btnSettings: string = require('../../assets/images/btns/btn-settings.png');
const btnEscape: string = require('../../assets/images/btns/btn-escape.png');
const btnRepeat: string = require('../../assets/images/btns/btn-repeat.png');
const btnSingleplayer: string = require('../../assets/images/btns/btn-singleplayer.png');
const btnMultiplayer: string = require('../../assets/images/btns/btn-multiplayer.png');
const btnGreen: string = require('../../assets/images/btns/btn-green.png');
const btnOrange: string = require('../../assets/images/btns/btn-orange.png');
const btnRed: string = require('../../assets/images/btns/btn-red.png');
const btnGray: string = require('../../assets/images/btns/btn-gray.png');
const crown: string = require('../../assets/images/modal/crown.png');
const glowWinner: string = require('../../assets/images/modal/glow-winner.png');
const glowLooser: string = require('../../assets/images/modal/glow-looser.png');
const wreath: string = require('../../assets/images/modal/wreath.png');
const modalPlate: string = require('../../assets/images/modal/plate.png');
const roundBar: string = require('../../assets/images/round-bar.png');
const roundGreen: string = require('../../assets/images/round-green.png');
const roundRed: string = require('../../assets/images/round-red.png');
const roundGreenLil: string = require('../../assets/images/round-green-lil.png');
const roundRedLil: string = require('../../assets/images/round-red-lil.png');
const timerPlate: string = require('../../assets/images/timer-plate.png');

class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  public state: Istate
  private lang
  private progressText: Phaser.GameObjects.Text

  public init(state: Istate): void {
    this.state = state
    this.lang = langs.ru
  }

  public preload(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '25px',
      fontFamily: 'Molot',
      color: '#FEFEFD',
      stroke: '#9779f5',
      strokeThickness: 5,
      shadow: {
        color: '#33333388',
        fill: true,
        offsetX: 0,
        offsetY: 5,
        blur: 10,
      }
    };
    const lineLength = this.cameras.main.width
    const line: Phaser.GameObjects.TileSprite = this.add.tileSprite(0, this.cameras.main.height, 1, 20, 'pixel').setOrigin(0, 1).setTint(0x9779f5)
    this.progressText = this.add.text(this.cameras.main.width / 2, line.getTopCenter().y - 10, this.lang.loadTextures, textStyle).setOrigin(0.5, 1)
    
    this.load.on('progress', (value: number): void => {
      let percent: number = Math.round(value * 100);
      let onePercent: number = lineLength / 100;
      let width: number = Math.round(percent * onePercent);
      line.setSize(width, line.height)
      // if (percent >= 90) this.progressText.setText(this.lang.loadWorld)
    });

    this.load.image('block', block)
    this.load.image('bg', world)
    this.load.image('hex', hex)
    this.load.image('super-hex', superHex);
    this.load.image('hex-border-2', hexBorder2)
    this.load.image('fog', fog)
    this.load.image('fog-soft', fogSoft)
    this.load.image('warning', warning)
    this.load.image('header', header)
    this.load.image('header-lil', headerLil)
    this.load.image('header-mid', headerMid)
    this.load.image('circle', circle);
    this.load.image('star', star);
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
    this.load.image('base-alone', baseAlone)
    this.load.image('base-red', baseRed)
    this.load.image('green-super-1', greenSuper1)
    this.load.image('green-super-2', greenSuper2)
    this.load.image('red-super-1', redSuper1)
    this.load.image('red-super-2', redSuper2)
    this.load.image('gray-super-1', graySuper1)
    this.load.image('gray-super-2', graySuper2)
    this.load.image('green-fort-1', greenFort1)
    this.load.image('green-fort-2', greenFort2)
    this.load.image('red-fort-1', redFort1)
    this.load.image('red-fort-2', redFort2)
    this.load.image('green-tower', greenTower)
    this.load.image('red-tower', redTower)

    this.load.image('start-game-btn', startGameBtn);
    this.load.image('pixel-green', pixelGreen);
    this.load.image('pixel-red', pixelRed);
    this.load.image('lil-star', lilStar);
    this.load.image('lil-star-dis', lilStarDis);
    this.load.image('pixel-window', windowPixel);
    this.load.image('pixel-window-lil', windowPixelLil);
    this.load.image('pixel-window-mid', windowPixelMid);
    this.load.image('exit-btn', exitBtn);
    this.load.image('menu-btn', menuBtn);
    this.load.image('btn-settings', btnSettings);
    this.load.image('btn-escape', btnEscape);
    this.load.image('btn-repeat', btnRepeat);
    this.load.image('btn-singleplayer', btnSingleplayer);
    this.load.image('btn-multiplayer', btnMultiplayer);
    this.load.image('btn-green', btnGreen);
    this.load.image('btn-orange', btnOrange);
    this.load.image('btn-red', btnRed);
    this.load.image('btn-gray', btnGray);
    this.load.image('crown', crown);
    this.load.image('glow-winner', glowWinner);
    this.load.image('glow-looser', glowLooser);
    this.load.image('wreath', wreath);
    this.load.image('modal-plate', modalPlate);
    this.load.image('round-bar', roundBar);
    this.load.image('timer-plate', timerPlate);
    this.load.image('round-green', roundGreen);
    this.load.image('round-red', roundRed);
    this.load.image('round-green-lil', roundGreenLil);
    this.load.image('round-red-lil', roundRedLil);
  }
  
  public create(): void {
    // new Promise((resolve, reject) => {
    //   this.progressText.setText(this.lang.loadWorld)
    //   if (this.progressText.text === this.lang.loadWorld) resolve('ok');
    //   console.log('newPromise ~ this.progressText', this.progressText)
    // }).then(() => {
    //   this.scene.stop()
    //   this.scene.start('Game', this.state)
    //   this.scene.start('MainMenu', this.state)
    // })

    this.progressText.setText(this.lang.loadWorld)
    this.time.addEvent({
      delay: 1,
      callback: (): void => {
        this.scene.stop()
        this.scene.start('Game', this.state)
        this.scene.start('MainMenu', this.state)
      },
      loop: false
    })
  }
}

export default Preload;
