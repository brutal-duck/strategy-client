import Game from "../scenes/Game"
import Hex from '../components/Hex'

export default class AI {
  public scene: Game
  
  public launched: boolean
  public color: string
  private side: string
  private cicle: Phaser.Time.TimerEvent
  private priority: string
  private paths: Hex[][]
  private playerBase: Hex
  private holdCounter: number
  private clameTry: number

  constructor(scene: Game) {
    this.scene = scene
  }

  public init(): void {
    this.launched = false
    this.color = this.scene.player.color === 'green' ? 'blue' : 'green'
    this.side = this.AIHexes().find(hex => hex.class === 'base').col > this.scene.world.cols / 2 ? 'right' : 'left'
    this.paths = [[],[],[]]
    this.playerBase = this.scene.hexes.find(hex => hex.own === this.scene.player.color && hex.class === 'base')
    this.holdCounter = 7
    this.clameTry = 0
  
    // console.log('init ~ AI', this.color, this.side)
    this.priority = 'resources'
    if (!this.launched) {
      this.launched = true
      this.cicle = this.scene.time.addEvent({
        delay: 3000,
        callback: (): void => { this.turn() },
        loop: true
      })
    }
  }


  private turn(): void {
    if (!this.scene.gameIsOver) {
      const resourceHexes = this.AIHexes().filter(hex => hex.class === 'x1' || hex.class === 'x3').length
      const tiles = this.scene[this.color].hexes
      const playerHexes = this.scene.hexes.filter(hex => hex.own === this.scene.player.color).length
      const totalCaptured = playerHexes + this.AIHexes().length
      const AIcapturedPercent = Math.round(100 / totalCaptured * this.AIHexes().length)

      if (resourceHexes === 0) this.priority = 'resources'
      else if (this.scene[this.color].hexes < 5 || AIcapturedPercent > 40 || this.priority === 'hold') this.priority = 'hold'
      else this.priority = 'expanse'


      if (this.priority === 'resources') this.getResources()
      else if (this.priority === 'hold') this.hold()
      else if (this.priority === 'expanse') this.expanse()


      this.paths.forEach((path, i) => { if (path.length !== 0) this.clame(i, tiles) })
      console.log('turn ~ this.priority ', this.priority)
    }
  }


  private clame(i: number, tiles: number): void {
    this.clameTry++
    const claming = this.scene.time.addEvent({
      delay: 50 + (200 * i),
      callback: (): void => {
        let hex = this.paths[i][0]
        console.log('clame ~ hex', hex.id, this.paths.map(el => el.map(hex => hex.id)))

        if (!hex?.clamingAni?.isPlaying() && hex?.own === this.color) {
          this.paths[i].splice(0, 1)
          hex = this.paths[i][0]
        }

        if (
          !hex?.clamingAni?.isPlaying() &&
          hex?.own !== this.color &&
          hex?.class !== 'base' &&
          ((hex?.own === 'neutral' && tiles > 0) || tiles > 1)
        ) this.AIClame(hex)
        
        claming.remove()
      },
      loop: false
    })
  }


  private getResources(): void {
    const distances: { from: Hex, to: Hex, distance: number }[] = []
    const resourceHexes = this.scene.hexes.filter(hex => hex.class === 'x1' || hex.class === 'x3')
    this.outerAIHexes().forEach(from => { resourceHexes.forEach(to => { distances.push({ from, to, distance: this.getDistance(from, to) }) }) })
    distances.sort((a, b) => a.distance - b.distance)

    this.paths.forEach((path, i) => {
      if (distances[i] && distances[i].distance <= 4 && path.length === 0) this.paths[i] = this.findPath(distances[i].from, distances[i].to)
    })

    // console.log(this.paths.map(el => el.map(hex => hex.id)));
  }


  private expanse(): void {
    let resourceHex: Hex
    const distances: { from: Hex, to: Hex, distance: number }[] = []
    const outerAIHexes: Hex[] = this.outerAIHexes()

    for (let i = 0; i < outerAIHexes.length; i++) {
      resourceHex = this.nearbyHexes(outerAIHexes[i]).find(hex => hex?.own !== this.color && (hex?.class === 'x1' || hex?.class === 'x3'))
      if (resourceHex) {
        this.setPath([resourceHex])
        break
      }
    }
    
    outerAIHexes.forEach(from => {
      if (!this.nearbyHexes(from).every(hex => hex.own === this.color || hex.landscape)) {
        distances.push({ from, to: this.playerBase, distance: this.getDistance(from, this.playerBase) })
      }
    })
    distances.sort((a, b) => a.distance - b.distance)
    console.log('expanse ~ distances', distances.map(el => { return { from: el.from.id, to: el.to.id, distance: el.distance } }))

    for (let i = 0; i < 1; i++) { this.setPath(this.findPath(distances[i].from, this.playerBase, 3)) }
  }


  private hold(): void {
    this.holdCounter--
    if (this.holdCounter <= 0) {
      this.priority = 'expanse'
      this.holdCounter = 7
    }
  }


  private findPath(from: Hex, to: Hex, distance?: number): Hex[] {
    const path: Hex[] = []
    let horizontal: string = ''
    let vertical: string = ''
    const vertDistance: number = to.row - from.row
    const horzDistance: number = to.col - from.col

    if (vertDistance > 0) vertical = '+'
    else if (vertDistance < 0) vertical = '-'
    if (horzDistance > 0) horizontal = '+'
    else if (horzDistance < 0) horizontal = '-'

    let n = distance || Math.abs(vertDistance) + Math.abs(horzDistance)
    for (let i = 0; i < n; i++) {
      const lastHex = path.length === 0 ? from : path[path.length - 1]
      let col = lastHex.col
      let row = lastHex.row

      if (horizontal && this.clameTry < 6) {
        col = horizontal === '+' ? lastHex.col + 1 : lastHex.col - 1
        if (col === to.col) horizontal = ''
      }

      if (vertical) {
        row = vertical === '+' ? lastHex.row + 1 : lastHex.row - 1
        if (row === to.row) vertical = ''
      }

      const step: Hex = this.scene.getHexByID(`${col}-${row}`)
      if (step.id === lastHex.id) break
      else if (!step.landscape) path.push(step)
      else {
        let distances: { fromNew: Hex, length: number }[] = []
        let ways = this.nearbyHexes(lastHex).filter(hex => !hex.landscape && hex.id !== step.id && hex.own !== this.color)
        ways.forEach(fromNew => distances.push({ fromNew, length: this.getDistance(fromNew, to) }))
        distances.sort((a, b) => a.length - b.length)

        if (distances.length > 0) path.push(distances[0].fromNew)
        else return []
      }

      if (step.id === to.id) break
    }

    console.log('findPath ~ path', path.map(el => el.id))
    return path
  }


  private AIClame(hex: Hex): void {
    console.log('AIClame')
    if (hex && this.nearbyHexes(hex).some(el => el?.own === this.color)) {
      if (hex.own === 'neutral') {
        this.scene[this.color].hexes--
        hex.setClaming(this.color)
  
      } else if (hex.own === this.scene.player.color) {
        this.scene[this.color].hexes -= 2
        hex.setClearClame(this.color)
      }
      this.clameTry = 0
    }
  }

  private setPath(path: Hex[]): void {
    for (let i = 0; i < this.paths.length; i++) {
      if (this.paths[i].length === 0 || this.clameTry > 5) {
        this.paths[i] = path
        break
      }
    }
  }


  private AIHexes(): Hex[] { return this.scene.hexes.filter(hex => hex.own === this.color) }
  private outerAIHexes(): Hex[] { return this.AIHexes().filter(hex => this.nearbyHexes(hex).some(el => el.own !== this.color)) }
  private nearbyHexes(hex: Hex): Hex[] { return Object.values(hex.nearby).map(id => this.scene.getHexByID(id)) }
  private topRow(): number { return this.outerAIHexes().sort((a, b) => a.row - b.row)[0].row }
  private botRow(): number { return this.outerAIHexes().sort((a, b) => b.row - a.row)[0].row }
  private leftCol(): number { return this.outerAIHexes().sort((a, b) => a.col - b.col)[0].col }
  private rightCol(): number { return this.outerAIHexes().sort((a, b) => b.col - a.col)[0].col }

  private getDistance(a: Hex, b: Hex): number {
    const colDist = Math.abs(a.col - b.col)
    const rowDist = Math.abs(a.row - b.row)
    return colDist + rowDist
  }


  public remove(): void {
    this.launched = false
    this.color = ''
    this.side = ''
    this.paths = [[],[],[]]
    this.playerBase = null
    this.holdCounter = 7
    this.clameTry = 0
    this.cicle.remove()
  }
}