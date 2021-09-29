import Hex from "../components/Hex"
import Game from "../scenes/Game"

export default class World {
  public scene: Game

  public segmentRows
  public segmentCols
  public rows: number
  public cols: number
  private startX: number
  private startY: number

  private TL: Hex[]
  private T: Hex[]
  private TR: Hex[]
  private CL: Hex[]
  private C: Hex[]
  private CR: Hex[]
  private BL: Hex[]
  private B: Hex[]
  private BR: Hex[]
  private segments: any

  constructor(scene: Game) {
    this.scene = scene
    this.init()
  }

  
  private init(): void {
    this.startX = 0
    this.startY = 240
    this.segmentRows = 7
    this.segmentCols = 9
    this.rows = this.segmentRows * 3
    this.cols = this.segmentCols * 3
    this.segments = {
      TL: [],
      T: [],
      TR: [],
      CL: [],
      C: [],
      CR: [],
      BL: [],
      B: [],
      BR: []
    }

    this.TL = []
    this.T = []
    this.TR = []
    this.CL = []
    this.C = []
    this.CR = []
    this.BL = []
    this.B = []
    this.BR = []

    
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
        this.scene.hexes.push(hex)
        if (row < this.rows / 3 && col < this.cols / 3) this.TL.push(hex)
        else if (row < this.rows / 3 && col >= this.cols / 3 && col < this.cols - this.segmentCols) this.T.push(hex)
        else if (row < this.rows / 3 && col >= this.cols - this.segmentCols) this.TR.push(hex)
        else if (row >= this.rows / 3 && row < this.rows - this.segmentRows && col < this.cols / 3) this.CL.push(hex)
        else if (row >= this.rows / 3 && row < this.rows - this.segmentRows && col >= this.cols - this.segmentCols) this.CR.push(hex)
        else if (row >= this.rows - this.segmentRows && col < this.cols / 3) this.BL.push(hex)
        else if (row >= this.rows - this.segmentRows && col >= this.cols / 3 && col < this.cols - this.segmentCols) this.B.push(hex)
        else if (row >= this.rows - this.segmentRows && col >= this.cols - this.segmentCols) this.BR.push(hex)
        else this.C.push(hex)
      }
    }

    this.TL.forEach(el => el.setTint(0xcecece))
    this.T.forEach(el => el.setTint(0xffdc62))
    this.TR.forEach(el => el.setTint(0x62ffa8))
    this.CL.forEach(el => el.setTint(0xa381d7))
    this.C.forEach(el => el.setTint(0xd78181))
    this.CR.forEach(el => el.setTint(0xa3d781))
    this.BL.forEach(el => el.setTint(0x81b4d7))
    this.B.forEach(el => el.setTint(0xd7b681))
    this.BR.forEach(el => el.setTint(0xff7f58))    
  }


  public createBase(): void {
    const redBase = this.scene.hexes.find(hex => hex.id === '2-5').setClass('base', 'red')
    const blueBase = this.scene.hexes.find(hex => hex.id === '14-5').setClass('base', 'blue')
    const playerBase = this.scene.player.color === 'red' ? redBase : blueBase

    playerBase.removeFog()
    Object.values(playerBase.nearby).forEach(id => this.scene.getHexByID(id).removeFog(true))
    this.scene.centerCamera(playerBase.getCenter().x, playerBase.getCenter().y)
  }


  private createLandscape(): void {
    const rocks = [
      '5-4', '5-5', '6-5',
      '10-5', '11-4', '11-5',
      '7-1', '9-1', '7-9', '9-9'
    ]
    const water = this.scene.hexes.filter(hex => hex.row === 0 || hex.row === this.rows - 1)
    rocks.forEach(id => this.scene.getHexByID(id).setClass('rock'))
    water.forEach(hex => hex.setClass('water'))
  }


  private createResource(): void {
    const x1 = [
      '0-5', '1-2', '1-7', '4-4', '4-5', '4-6', '5-1', '5-9', '7-3', '7-6',
      '16-5', '15-2', '15-7', '12-4', '12-5', '12-6', '11-1', '11-9', '9-3', '9-6',
    ]
    const x3 = ['8-1', '8-5', '8-10',]
    const superHexes = ['4-8', '6-8', '8-8', '10-8', '12-8']
    x1.forEach(id => this.scene.getHexByID(id).setClass('x1'))
    x3.forEach(id => this.scene.getHexByID(id).setClass('x3'))
    superHexes.forEach(id => this.scene.getHexByID(id).setClass('super'))
  }

}