import Hex from "../components/Hex"
import Zoom from "../components/Zoom"
import Hud from "./Hud"

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  public state: Istate
  public player: Iplayer
  public hud: Hud
  public debuging: boolean

  public camera: Phaser.Cameras.Scene2D.Camera
  public midPoint: Phaser.Physics.Arcade.Sprite
  public vector: Phaser.Physics.Arcade.Sprite
  public distanceX: number
  public distanceY: number
  public holdCounter: number
  public press: boolean
  public dragOrZoom: boolean
  public worldViewBorders: { x1: number, x2: number, y1: number, y2: number }
  public worldWidth: number
  public worldHeight: number

  public hexWidth: number
  public hexHeight: number
  private startX: number
  private startY: number
  public rows: number
  public cols: number

  private world: Phaser.GameObjects.TileSprite
  private hexes: Hex[]
  public pointerHex: Hex
  public chosenHex: Hex 


  public init(state: Istate) {
    this.state = state
    this.player = state.player
    this.player.color = 'red'
    this.hud = this.game.scene.getScene('Hud') as Hud

    this.worldWidth = 2048
    this.worldHeight = 2048
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.press = false
    this.dragOrZoom = false
    new Zoom(this)

    this.hexes = []
    this.hexWidth = 100
    this.hexHeight = 100
    this.startX = 400
    this.startY = 400
    this.rows = 8
    this.cols = 12
  
    this.debuging = true
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    
    this.createWorld()
    this.createField()
    this.setInput()
    this.setHexInteractive()
    this.setEvents()

    console.log('init ~ this.camera', this.camera)
    console.log('create ~ this.input', this.input)
  }


  private createField(): void {
    const offsetX = 75
    const offsetY = 100
    const rowPadding = 50
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.startX + (offsetX * col)
        const y = this.startY + (offsetY * row) + (col % 2 !== 0 ? rowPadding : 0)
        this.hexes.push(new Hex(this, x, y, row, col))
      }
    }
    // console.log('createField ~ this.hexes', this.hexes)
        
  }


  private createWorld(): void {
    this.world = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
  }


  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const vectorStep = this.game.device.os.desktop ? 0.4 : 3.5
    const dragStep = this.game.device.os.desktop ? 1 : 1.5
    let ani: Phaser.Tweens.Tween

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(true).setScale(5).setTint(0x008800).setDepth(10)
    console.log('setInput ~ midPoint', this.midPoint)

    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10

    this.world.on('dragstart', (pointer): void => {
      ani?.remove()

      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y

      this.distanceX = 0
      this.distanceY = 0
      this.vector.setPosition(this.midPoint.x, this.midPoint.y)
      this.midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y).body.stop()
      pointerPoint.setPosition(pointer.worldX, pointer.worldY)
      
      this.camera.startFollow(this.midPoint)
      this.dragOrZoom = true
    })


    this.world.on('drag', (pointer): void => {
      if (!this.input.pointer2.isDown && this.dragOrZoom) {
        this.holdCounter = 0

        const diffrenceX = holdedPoint.x - pointer.x
        let x = this.midPoint.x + (diffrenceX * (dragStep / 2))
        holdedPoint.x = pointer.x
        // console.log('this.world.on ~ diffrenceX', diffrenceX)

        const diffrenceY = holdedPoint.y - pointer.y
        let y = this.midPoint.y + (diffrenceY * (dragStep / 2))
        holdedPoint.y = pointer.y

        if (diffrenceX > 0) this.distanceX += vectorStep
        else if (diffrenceX < 0) this.distanceX -= vectorStep
        
        if (diffrenceY > 0) this.distanceY += vectorStep
        else if (diffrenceY < 0) this.distanceY -= vectorStep


        this.vector.setPosition(chechBordersX(x + this.distanceX), chechBordersY(y + this.distanceY))
        this.midPoint.setPosition(chechBordersX(x), chechBordersY(y))
      }
    })


    this.world.on('dragend', (): void => {
      if (this.holdCounter < 3) {
        ani = this.tweens.add({
          targets: this.midPoint,
          x: this.vector.x,
          y: this.vector.y,
          duration: 800,
          ease: 'Power2'
        })
      }
      // this.input.mousePointer.camera = this.camera // фикс краша вывода курсора за предел веб окна для старшей версии Phasera
    })


    const chechBordersX = (x: number): number => {
      if (x < this.worldViewBorders.x1) x = this.worldViewBorders.x1
      else if (x > this.worldViewBorders.x2) x = this.worldViewBorders.x2
      return x
    }

    const chechBordersY = (y: number): number => {
      if (y < this.worldViewBorders.y1) y = this.worldViewBorders.y1
      else if (y > this.worldViewBorders.y2) y = this.worldViewBorders.y2
      return y
    }
  }


  private setEvents(): void {
    this.events.once('render', (): void => {
      this.worldViewBorders = {
        x1: this.camera.worldView.width / 2,
        x2: this.camera.getBounds().width - this.camera.worldView.width / 2,
        y1: this.camera.worldView.height / 2,
        y2: this.camera.getBounds().height - this.camera.worldView.height / 2,
      }
    })

    // this.events.on('preupdate', (): void => {
    // })
  }


  private setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (): void => {
        if (this.dragOrZoom) this.dragOrZoom = false
        else {
          this.chosenHex = hex
          // console.log('hex.on ~ this.chosenHex', this.chosenHex)
          // this.clearGrayHex()
          hex.clame(this.player.color)
          this.multiClameCheck()
        }
      })
    })
  }
  

  private multiClameCheck(): void {
    const chains: Array<Hex[]> = []
    let chain: Hex[] = []
    let innerHexes: Array<Hex[]> = []

    let innerHexesIsClosed = false

    const reduce = (arr) => {
      console.log('1 - createField ~ arr', arr)

      for (let i = arr.length - 1; i > 0; i--) {
        const a = arr[i]
        const b = arr[i - 1]
        let newA = []
        newA = newA.concat(a)
        console.log('1: createField ~ a', a, b)
  
        if (b) {
          a.forEach(el1 => {
            b.forEach(el2 => {
              if (el1 === el2) {
                Phaser.Utils.Array.Remove(newA, el1)
              }
              console.log('---createField ~ a', a, newA, b)
            })
          })
  
          if (newA.length === 0) arr.splice(i, 1)
          console.log('2: createField ~ a', newA, b)
        } else break
      }
      console.log('2 - createField ~ arr', arr)
    }

    const findTopAndBotPlayerHexes = (arr: Hex[]): { top: Hex, bot: Hex } => {
      const array = arr
      console.log('f ~ array', array.map(hex => hex.id))
      let top = array[0]
      let bot = array[array.length - 1]

      while (top.color !== this.player.color && array.length > 3) {
        array.shift()
        top = array[0]
      }

      while (bot.color !== this.player.color && array.length > 3) {
        array.pop()
        bot = array[array.length - 1]
      }

      const nonPlayerHexes = array.filter(hex => hex.color !== this.player.color).sort((a, b) => a.row - b.row)
      top = array.find(hex => hex.row === nonPlayerHexes[0]?.row - 1)
      bot = array.find(hex => hex.row === nonPlayerHexes[nonPlayerHexes.length - 1]?.row + 1)
      return { top, bot }
    }


    const findInnerHexes = (array: Hex[]): void => {
      if (array[0].col < this.cols - 1) {
        // начальная цепь
        array = array.sort((a, b) => a.row - b.row)
        console.log('1: recurse', array.map(hex => hex.id));
  
        // верхняя и нижняя очки цепи
        let topHex = array[0]
        let botHex = array[array.length - 1]
  
        // следующая колонка
        const nextCol = this.nextColHexesBetween(topHex, botHex).sort((a, b) => a.row - b.row)
        console.log('2: следующая колонка ~ nextCol', nextCol.map(hex => hex.id))
  
        const nextColCheck = nextCol.filter(hex => hex.color === this.player.color).length < 2 || nextCol.every(hex => hex.color === this.player.color) || nextCol.every(hex => hex.color !== this.player.color)
  
        if (nextColCheck) {
          console.log(nextCol.filter(hex => hex.color === this.player.color).length, nextCol.every(hex => hex.color === this.player.color), nextCol.every(hex => hex.color !== this.player.color), 'return_____________');
          return
        }
        
        const { top, bot } = findTopAndBotPlayerHexes(nextCol)
        console.log('3: findInnerHexes ~ hex', top?.id, bot?.id, nextCol.map(hex => hex.id))
        
  
        if (top && bot) {
          const filtered = nextCol.filter(hex => hex.row > top.row && hex.row < bot.row && hex.color !== this.player.color)
          console.log('4: findInnerHexes ~ filtered', filtered.map(hex => hex.id))

          const length = filtered.length

          for (let i = 0; i < length; i++) {
            if (innerHexes.length === 0) {
              innerHexes.push([filtered[i]])
              continue
            }

            
              // console.log('56: findInnerHexes ~ innerHexes', innerHexes.map(arr => arr.map(hex => hex.id)))

              innerHexes.forEach((arr, j) => {
                const nearbyIDs = Object.values(filtered[i].nearby)
                console.log('innerHexes.forEach ~ nearbyIDs', nearbyIDs)
                if (innerHexes.every(arr => arr.every(el => el.id !== filtered[i].id))) {
                  arr.forEach(hex => {
                    if (hex.id !== filtered[i].id && nearbyIDs.some(id => id === hex.id)) {
                      console.log('wefgetge');
                      
                      arr.push(filtered[i])
                    } else {
                      innerHexes.push([filtered[i]])
                    }
                  })
                }
                // arr.some(hex => nearbyIDs.some(id => id === hex.id))
                // Object.values(filtered[i].nearby).some(id => id === hex.id)
              })
              
            
            
          }

          // filtered.forEach(hex => {
          //   if (innerHexes.length === 0) {
          //     innerHexes.push([hex])
          //   } else {
          //     const length = innerHexes.length

          //     for (let j = 0; j < length; j++) {
                
                
          //       if (!innerHexes[j].some(el => el.id === hex.id)) {
          //         if (innerHexes[j].some(el => Object.values(el.nearby).some(id => id === hex.id))) {
          //           innerHexes[j].push(hex)
          //         } else innerHexes.push([hex])
          //       }


          //     }

          //   }
          // })

          console.log('!!! 5: innerHexes', innerHexes.map(arr => arr.map(hex => hex.id)))

          // reduce(innerHexes)
          findInnerHexes(nextCol)
        } else {
          console.log('return_________________');
          return
        }
      }
    }


    console.log('____________________');
    // поиск цепочек захваченых гексов
    for (let i = 0; i < this.cols; i++) {      
      const colHexes: Hex[] = this.hexes.filter(hex => hex.col === i && hex.color === this.player.color).sort((a, b) => a.row - b.row)
      // console.log('globalClameCheck ~ rowHexes', colHexes.map(hex => hex.id))
      chain = []

      if (colHexes.length > 1) {
        colHexes.forEach((hex, i) => {
          if (i === 0) chain.push(hex)
          else if (colHexes[i - 1].row + 1 === hex.row) chain.push(hex)
          else if (chain.length > 1) {
            chains.push(chain)
            chain = [hex]
          } else chain = [hex]
        })

        if (chain.length > 1) chains.push(chain)
      }
    }
    
    
    
    console.log('~ chains', chains.map(arr => arr.map(hex => hex.id)))
    chains.forEach(arr => findInnerHexes(arr))

    if (innerHexes.length > 0) {
      innerHexes.forEach(arr => {
        innerHexesIsClosed = arr.every(hex => Object.values(hex.nearby).every(id => arr.some(el => el.id === id) || this.getHexByID(id) === null || this.getHexByID(id).color === this.player.color) && hex.col < this.cols - 1)
        console.log('multiClameCheck ~ innerHexesIsClosed', innerHexesIsClosed)
        if (innerHexesIsClosed) arr.forEach(hex => hex.clame(this.player.color))
      })
    }

  }


  private clearGrayHex(): void {
    this.hexes.filter(hex => hex.color = 'gray').forEach(hex => hex.setColor('white'))
  }

  private hexesBeetween(topHex: Hex, botHex: Hex): Hex[] {
    return this.hexes.filter(hex => hex.col === topHex.col && hex.row >= topHex.row && hex.row <= botHex.row)
  }

  private nextColHexesBetween(topHex: Hex, botHex: Hex = topHex): Hex[] {
    if (topHex.col < this.cols - 1) {
      // console.log('nextColHexesBetween ~ in', topHex.id, botHex.id)
      topHex = this.findTopRightHex(topHex)
      botHex = this.findBottomRightHex(botHex)

      // console.log('nextColHexesBetween ~ mod', topHex.id, botHex.id)

      if (topHex.id !== botHex.id && topHex.row + 1 !== botHex.row) {

        for (let i = topHex.row; topHex.row > 0; i--) {
          const upperHex = this.hexes.find(hex => hex.col === topHex.col && hex.row === i - 1)
          if (upperHex.color === this.player.color) topHex = upperHex
          else break
        }
    
        for (let i = botHex.row; i < this.rows - 1; i++) {
          const lowerHex = this.hexes.find(hex => hex.col === botHex.col && hex.row === i + 1)
          if (lowerHex.color === this.player.color) botHex = lowerHex
          else break
        }
      }
  
      // console.log('nextColHexesBetween ~ out', topHex.id, botHex.id)
      
      
      // const topRightHex = this.findTopRightHex(topHex)
      // const botRightHex = this.findBottomRightHex(botHex)
      // console.log('nextColHexesBetween out', topRightHex.id, botRightHex.id)
      return this.hexes.filter(hex => hex.col === topHex.col && hex.row >= topHex.row && hex.row <= botHex.row)
    }
  }

  private findTopRightHex(hex: Hex): Hex {
    let nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    if (hex.y < nextColHex.y && hex.row > 0) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row - 1)
    return nextColHex
  }

  private findBottomRightHex(hex: Hex): Hex {
    let nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row)
    if (hex.y > nextColHex.y && hex.row < this.rows - 1) nextColHex = this.hexes.find(el => el.col === hex.col + 1 && el.row === hex.row + 1)
    return nextColHex
  }


  private getHexByID(id: string): Hex {
    return this.hexes.find(hex => hex.id === id) || null
  }


  // private findNeighborHexesIDs(hex: Hex): string[] {
  //   const ids = [ `${hex.col}-${hex.row + 1}`, `${hex.col}-${hex.row - 1}` ]
  //   if (hex.col % 2 === 0) {
  //     ids.push(
  //       `${hex.col + 1}-${hex.row}`, `${hex.col + 1}-${hex.row - 1}`,
  //       `${hex.col - 1}-${hex.row}`, `${hex.col - 1}-${hex.row - 1}`
  //     )
  //   } else {
  //     ids.push(
  //       `${hex.col + 1}-${hex.row}`, `${hex.col + 1}-${hex.row + 1}`,
  //       `${hex.col - 1}-${hex.row}`, `${hex.col - 1}-${hex.row + 1}`
  //     )
  //   }
    
  //   return ids
  // }


  public update(): void {
    if (!this.input.pointer2.isDown && this.dragOrZoom) {
      this.holdCounter++
      this.physics.moveToObject(this.vector, this.midPoint, 120)

      if (this.holdCounter > 10) {
        this.vector.setPosition(this.midPoint.x, this.midPoint.y)
        this.distanceX = 0
        this.distanceY = 0
        this.vector.body.stop()
      } 

    } else {
      this.vector.body.stop()
    }
  }
}