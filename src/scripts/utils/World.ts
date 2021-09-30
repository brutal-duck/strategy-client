import Hex from "../components/Hex"
import Game from "../scenes/Game"

export default class World {
  public scene: Game
  public game: boolean

  public segmentRows: number
  public segmentCols: number
  public rows: number
  public cols: number
  private startX: number
  private startY: number

  private tlSeg: Hex[]
  private tSeg: Hex[]
  private trSeg: Hex[]
  private clSeg: Hex[]
  private cSeg: Hex[]
  private crSeg: Hex[]
  private blSeg: Hex[]
  private bSeg: Hex[]
  private brSeg: Hex[]

  private angleSegments1: Hex[][]
  private angleSegments2: Hex[][]
  private sideSegments1: Hex[][]
  private sideSegments2: Hex[][]

  private spawnPresets: string[][][]
  private anglePreset1: string[][]
  private anglePreset2: string[][]
  private sidePreset1: string[][]
  private sidePreset2: string[][]
  private centerPreset: string[][]

  private redBaseID: string
  private blueBaseID: string

  constructor(scene: Game, game: boolean) {
    this.scene = scene
    this.game = game
    this.init()
  }

  
  private init(): void {
    this.startX = 0
    this.startY = 240
    this.segmentRows = 7
    this.segmentCols = 9
    this.rows = this.segmentRows * 3
    this.cols = this.segmentCols * 3

    this.tlSeg = []
    this.tSeg = []
    this.trSeg = []
    this.clSeg = []
    this.cSeg = []
    this.crSeg = []
    this.blSeg = []
    this.bSeg = []
    this.brSeg = []

    this.angleSegments1 = []
    this.angleSegments2 = []
    this.sideSegments1 = []
    this.sideSegments2 = []

    this.anglePreset1 = this.getTLAnglePresets()[Phaser.Math.Between(0, this.getTLAnglePresets().length - 1)]
    this.anglePreset2 = this.getBLAnglePresets()[Phaser.Math.Between(0, this.getBLAnglePresets().length - 1)]
    this.sidePreset1 = this.getVertSidePresets()[Phaser.Math.Between(0, this.getVertSidePresets().length - 1)]
    this.sidePreset2 = this.getHorzSidePresets()[Phaser.Math.Between(0, this.getHorzSidePresets().length - 1)]
    this.centerPreset = this.getCenterPresets()[Phaser.Math.Between(0, this.getCenterPresets().length - 1)]
    this.spawnPresets = [ this.anglePreset1, this.anglePreset2, this.sidePreset1, this.sidePreset2 ]

    this.redBaseID = ''
    this.blueBaseID = ''

    this.create()
  }


  private create(): void {
    const offsetX = 75
    const offsetY = 70
    const rowPadding = offsetY / 2
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.startX + (offsetX * col)
        const y = this.startY + (offsetY * row) + (col % 2 !== 0 ? rowPadding : 0)
        const hex = new Hex(this.scene, x, y, row, col)

        hex.setSegmentID(col % this.segmentCols, row % this.segmentRows)
        this.scene.hexes.push(hex)

        if (row < this.rows / 3 && col < this.cols / 3) this.tlSeg.push(hex)
        else if (row < this.rows / 3 && col >= this.cols / 3 && col < this.cols - this.segmentCols) this.tSeg.push(hex)
        else if (row < this.rows / 3 && col >= this.cols - this.segmentCols) this.trSeg.push(hex)
        else if (row >= this.rows / 3 && row < this.rows - this.segmentRows && col < this.cols / 3) this.clSeg.push(hex)
        else if (row >= this.rows / 3 && row < this.rows - this.segmentRows && col >= this.cols - this.segmentCols) this.crSeg.push(hex)
        else if (row >= this.rows - this.segmentRows && col < this.cols / 3) this.blSeg.push(hex)
        else if (row >= this.rows - this.segmentRows && col >= this.cols / 3 && col < this.cols - this.segmentCols) this.bSeg.push(hex)
        else if (row >= this.rows - this.segmentRows && col >= this.cols - this.segmentCols) this.brSeg.push(hex)
        else this.cSeg.push(hex)
      }
    }

    this.angleSegments1.push(this.tlSeg, this.brSeg)
    this.angleSegments2.push(this.blSeg, this.trSeg)
    this.sideSegments1.push(this.tSeg, this.bSeg)
    this.sideSegments2.push(this.clSeg, this.crSeg)

    this.scene.setHexInteractive()
    this.createWorld()
  }


  private createWorld(): void {
    this.setBase()

    this.angleSegments1.forEach(segment => {
      if (segment === this.tlSeg) this.setPreset(segment, this.anglePreset1)
      else this.setPreset(segment, Phaser.Utils.Array.Matrix.Rotate180(this.anglePreset1))
    })

    this.angleSegments2.forEach(segment => {
      if (segment === this.blSeg) this.setPreset(segment, this.anglePreset2)
      else this.setPreset(segment, Phaser.Utils.Array.Matrix.Rotate180(this.anglePreset2))
    })

    this.sideSegments1.forEach(segment => {
      if (segment === this.tSeg) this.setPreset(segment, this.sidePreset1)
      else this.setPreset(segment, Phaser.Utils.Array.Matrix.Rotate180(this.sidePreset1))
    })

    this.sideSegments2.forEach(segment => {
      if (segment === this.clSeg) this.setPreset(segment, this.sidePreset2)
      else this.setPreset(segment, Phaser.Utils.Array.Matrix.Rotate180(this.sidePreset2))
    })

    this.setPreset(this.cSeg, this.centerPreset)

    if (this.game) {
      this.scene.hexes.forEach(hex => hex.setFog(true))
      this.createBase()
    } else this.scene.hexes.forEach(hex => hex.removeFog())
  }


  public recreate(game: boolean): void {
    this.game = game
    this.anglePreset1 = this.getTLAnglePresets()[Phaser.Math.Between(0, this.getTLAnglePresets().length - 1)]
    this.anglePreset2 = this.getBLAnglePresets()[Phaser.Math.Between(0, this.getBLAnglePresets().length - 1)]
    this.sidePreset1 = this.getVertSidePresets()[Phaser.Math.Between(0, this.getVertSidePresets().length - 1)]
    this.sidePreset2 = this.getHorzSidePresets()[Phaser.Math.Between(0, this.getHorzSidePresets().length - 1)]
    this.centerPreset = this.getCenterPresets()[Phaser.Math.Between(0, this.getCenterPresets().length - 1)]
    this.spawnPresets = [ this.anglePreset1, this.anglePreset2, this.sidePreset1, this.sidePreset2 ]
    this.redBaseID = ''
    this.blueBaseID = ''

    
    this.scene.hexes.forEach(hex => hex.removeClass())
    this.createWorld()
  }


  private setBase(): void {
    let preset: string[][] = Phaser.Utils.Array.GetRandom(this.spawnPresets)
    preset.forEach(row => Phaser.Utils.Array.Replace(row, 'spawn', 'base'))
    this.spawnPresets = this.spawnPresets.map(preset => preset.map(row => row.map(col => col = col === 'spawn' ? 'x1' : col)))
  }


  private setPreset(segment: Hex[], preset: string[][]) {
    for (let row = 0; row < this.segmentRows; row++) {
      for (let col = 0; col < this.segmentCols; col++) {
        const hex = segment.find(hex => hex.segmentID === `${col}-${row}`)
        const hexClass = preset[row][col]
        
        if (hexClass === 'base') {
          if (this.redBaseID === '') this.redBaseID = hex.id
          else if (this.blueBaseID === '') this.blueBaseID = hex.id
        } else if (hexClass !== 'spawn') hex.setClass(hexClass)
      }
    }
  }


  private getTLAnglePresets(): string[][][] {
    const presets = [
      [
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','','','','','','',''],
        ['water','water','','spawn','','x1','','',''],
        ['water','water','','','','','','',''],
        ['water','water','','x1','','','rock','rock',''],
        ['water','water','','','','','','water','water'],
      ],
      [
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','','','','','water','water'],
        ['water','water','','','','x1','','',''],
        ['water','water','','','','','','',''],
        ['water','water','','x1','','','','spawn',''],
        ['water','water','','','rock','rock','','',''],
      ],
    ]

    return presets
  }


  private getBLAnglePresets(): string[][][] {
    const presets = [
      [
        ['water','water','','rock','','','','',''],
        ['water','water','','','','','','','rock'],
        ['water','water','','','spawn','','','water','rock'],
        ['water','water','x1','','','','','','rock'],
        ['water','water','','','x1','','','',''],
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
      ],
      [
        ['water','water','water','','','','x1','',''],
        ['water','water','water','','','','','spawn',''],
        ['water','water','water','','','','','',''],
        ['water','water','water','water','','','','x1',''],
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
      ],
    ]

    return presets
  }


  private getVertSidePresets(): string[][][] {
    const presets = [
      [
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
        ['','','','','','','','',''],
        ['','','','','','','','',''],
        ['','','x1','','spawn','','x1','',''],
        ['','','','','','','','',''],
        ['','rock','rock','','','','','',''],
      ],
      [
        ['water','water','water','water','water','water','water','water','water'],
        ['water','water','water','water','water','water','water','water','water'],
        ['super','water','','','','','','',''],
        ['','water','','','','','','','x1'],
        ['','water','water','','','','','',''],
        ['','','','','x1','','','spawn',''],
        ['rock','rock','rock','','','','','',''],
      ],
  
    ]

    return presets
  }

  private getHorzSidePresets(): string[][][] {
    const presets = [
      [
        ['water','water','water','','','water','water','',''],
        ['water','water','','','','','x1','',''],
        ['water','water','','','','','','',''],
        ['water','water','','','','spawn','','',''],
        ['water','water','','','','','','',''],
        ['water','water','','','','','x1','',''],
        ['water','water','water','','','water','water','',''],
      ],
      [
        ['water','water','rock','rock','','','','water','water'],
        ['water','water','rock','','','','','','water'],
        ['water','water','','','','','','','water'],
        ['water','water','x1','','','spawn','','x1','water'],
        ['water','water','','','','','','','water'],
        ['water','water','rock','','','','','','water'],
        ['water','water','rock','rock','','','','water','water'],
      ],
    ]

    return presets
  }


  private getCenterPresets(): string[][][] {
    const presets = [
      [
        ['','','','','','','water','water',''],
        ['','rock','','','','','','water','water'],
        ['','','','','','','','',''],
        ['','','','','super','','','',''],
        ['water','','','','','','','',''],
        ['water','water','','','','','','rock',''],
        ['','water','','','','','','',''],
      ],
      [
        ['','','','','','','','','rock'],
        ['','','','','','','','',''],
        ['','','','rock','rock','rock','','',''],
        ['','','','rock','rock','rock','','',''],
        ['','','','rock','rock','rock','','',''],
        ['','','','','','','','',''],
        ['rock','','','','','','','',''],
      ],
      [
        ['rock','rock','water','','water','','','','water'],
        ['rock','rock','','','','water','','',''],
        ['rock','super','','','','','','',''],
        ['rock','','','','x3','','','','rock'],
        ['','','','','','','','super','rock'],
        ['','','','water','','','','rock','rock'],
        ['water','','','','water','','water','rock','rock'],
      ],
    ]

    return presets
  }


  /**
    [
      ['','','','','','','','',''],
      ['','','','','','','','',''],
      ['','','','','','','','',''],
      ['','','','','','','','',''],
      ['','','','','','','','',''],
      ['','','','','','','','',''],
      ['','','','','','','','',''],
    ],
   */
  


  public createBase(): void {
    const redBase = this.scene.hexes.find(hex => hex.id === this.redBaseID).setClass('base', 'red')
    const blueBase = this.scene.hexes.find(hex => hex.id === this.blueBaseID).setClass('base', 'blue')
    const playerBase = this.scene.player.color === 'red' ? redBase : blueBase

    playerBase.removeFog()
    Object.values(playerBase.nearby).forEach(id => this.scene.getHexByID(id).removeFog(true))
    this.scene.centerCamera(playerBase.getCenter().x, playerBase.getCenter().y, true)
  }
}