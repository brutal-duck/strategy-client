import Game from "../scenes/Game"
import Hex from '../components/Hex'

export default class AI {
  public scene: Game
  
  public launched: boolean
  public color: string
  private side: string
  private cicle: Phaser.Time.TimerEvent
  private priority: string
  // private tasks: boolean[]
  private paths: Hex[][]
  private enemyBase: Hex

  constructor(scene: Game) {
    this.scene = scene
  }

  public init(): void {
    this.launched = false
    this.color = this.scene.player.color === 'red' ? 'blue' : 'red'
    console.log('init ~ this.color', this.color)
    this.side = this.AIHexes().find(hex => hex.class === 'base').col > this.scene.cols / 2 ? 'right' : 'left'
    this.paths = [[],[],[]]
    this.enemyBase = this.scene.hexes.find(hex => hex.color === this.scene.player.color && hex.class === 'base')
    // this.tasks = [ false, false, false ]
    // this.path1 = []
    // this.path2 = []
    // this.path3 = []
    // this.task1 = false
    // this.task2 = false
    // this.task3 = false
  
    console.log('init ~ this.side', this.side)
    this.priority = 'resources'
    if (!this.launched) {
      this.launched = true
      this.cicle = this.scene.time.addEvent({
        delay: 1100,
        callback: (): void => { this.turn() },
        loop: true
      })
    }
  }


  private turn(): void {
    if (!this.scene.gameIsOver) {
      const resourceHexes = this.AIHexes().filter(hex => hex.class === 'x1' || hex.class === 'x3').length
      const tiles = this.scene[this.color].hexes

      if (resourceHexes === 0) this.priority = 'resources'
      else this.priority = 'expanse'


      if (this.priority === 'resources') this.getResources()
      // else if (this.priority === 'expanse') this.expanse()


      this.paths.forEach((path, i) => { if (path.length !== 0) this.clame(i, tiles) })
      console.log('turn ~ this.priority ', this.priority)
    }
  }

  private clame(i: number, tiles: number): void {
    const claming = this.scene.time.addEvent({
      delay: 50 + (100 * i),
      callback: (): void => {
        let hex = this.paths[i][0]
        console.log('clame ~ hex', hex.id, this.paths.map(el => el.map(hex => hex.id)))

        if (!hex?.clamingAni?.isPlaying() && hex?.color === this.color) {
          this.paths[i].splice(0, 1)
          hex = this.paths[i][0]
        }

        if (
          !hex?.clamingAni?.isPlaying() &&
          hex?.color !== this.color &&
          ((hex?.own === 'neutral' && tiles > 0) || tiles > 1)
        ) hex?.setClaming(this.color)
        
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
      if (distances[i] && distances[i].distance <= 3 && path.length === 0) this.paths[i] = this.findPath(distances[i].from, distances[i].to)
    })

    // console.log(this.paths.map(el => el.map(hex => hex.id)));
  }


  private expanse(): void {
    let resourceHex: Hex
    const distances: { from: Hex, to: Hex, distance: number }[] = []
    const outerAIHexes: Hex[] = this.outerAIHexes()

    for (let i = 0; i < outerAIHexes.length; i++) {
      resourceHex = this.nearbyHexes(outerAIHexes[i]).find(hex => hex?.color !== this.color && (hex?.class === 'x1' || hex?.class === 'x3'))
      if (resourceHex) {
        this.setPath([resourceHex])
        break
      }
    }
    
    outerAIHexes.forEach(from => { distances.push({ from, to: this.enemyBase, distance: this.getDistance(from, this.enemyBase) }) })
    distances.sort((a, b) => a.distance - b.distance)
    console.log('expanse ~ distances', distances.map(el => { return { from: el.from.id, to: el.to.id, distance: el.distance } }))

    for (let i = 0; i < 3; i++) { this.setPath(this.findPath(distances[i].from, this.enemyBase, 3)) }
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

      if (horizontal) {
        col = horizontal === '+' ? lastHex.col + 1 : lastHex.col - 1
        if (col === to.col) horizontal = ''
      }

      if (vertical) {
        row = vertical === '+' ? lastHex.row + 1 : lastHex.row - 1
        if (row === to.row) vertical = ''
      }

      const step: Hex = this.scene.getHexByID(`${col}-${row}`)
      if (!step.landscape) path.push(step)
      else {
        let distances: { fromNew: Hex, length: number }[] = []
        let ways = this.nearbyHexes(lastHex).filter(hex => !hex.landscape && hex.id !== step.id)
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

  private setPath(path: Hex[]): void {
    for (let i = 0; i < this.paths.length; i++) {
      if (this.paths[i].length === 0) {
        this.paths[i] = path
        break
      }
    }
  }


  private AIHexes(): Hex[] { return this.scene.hexes.filter(hex => hex.color === this.color) }
  private outerAIHexes(): Hex[] { return this.AIHexes().filter(hex => this.nearbyHexes(hex).some(el => el.color !== this.color)) }
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
}