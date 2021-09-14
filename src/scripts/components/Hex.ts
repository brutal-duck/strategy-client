import Game from "../scenes/Game";

export default class Hex extends Phaser.GameObjects.Sprite {
  
  public scene: Game
  public x: number
  public y: number
  public sprite: string
  
  constructor(scene: Game, x: number, y: number, sprite: string = 'hex') {
    super(scene , x, y, sprite)
    this.scene = scene
    this.x = x
    this.y = y
    this.sprite = sprite
    this.create()
  }

  public create(): void {
    this.scene.add.existing(this)

    const vectors = [
      55, 0,
      165, 0,
      220, 100,
      165, 200,
      55, 200,
      0, 100
    ]

    const hitArea: Phaser.Geom.Polygon = new Phaser.Geom.Polygon(vectors)
    this.setDepth(1).setInteractive(hitArea, Phaser.Geom.Polygon.Contains)
    this.scene.input.enableDebug(this, 0xff00ff);
  }
}