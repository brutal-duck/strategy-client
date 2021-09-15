import Game from '../scenes/Game';

class Zoom extends Phaser.GameObjects.Sprite {
  constructor(scene: Game) {
    super(scene, 0, 0, '')
    this.scene = scene;
    this.setZoom();
  }

  public scene: Game;
  private zoom: number;
  private distance: number;
  private minScroll: number;


  public setZoom(): void {
    this.zoom = 1;
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.preUpdate, this);
    this.scene.cameras.main.setZoom(this.zoom);
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject, deltaX: number, deltaY: number): void => {
      if (deltaY < 0) {
        this.plusZoom();
      } else if (deltaY > 0) {
        this.minusZoom();
      }
    });

    this.scene.input.addPointer(1);

    const maxMultiplier: number = 1.4;
    const minMultiplier: number = 0.7;
    const maxWidth: number = 1920;
    const minWidth: number = 640;

    if (this.scene.cameras.main.width >= maxWidth) {
      this.minScroll = maxMultiplier;
    } else if (this.scene.cameras.main.width <= minWidth) {
      this.minScroll = minMultiplier;
    } else {
      const differenceWidth: number = maxWidth - minWidth;
      const differenceMultiplier: number = maxMultiplier - minMultiplier;
      const percent: number = Math.round((maxWidth - this.scene.cameras.main.width) / (differenceWidth / 100));
      this.minScroll = maxMultiplier - (differenceMultiplier / 100 * percent);
    }

    this.scene.input.keyboard.addKey('W').once('up', (): void => { this.debagZoomOnDesktop() })
  }

  private debagZoomOnDesktop(): void {
    this.scene.input.pointer2.x = this.scene.cameras.main.centerX - 300
    this.scene.input.pointer2.y = this.scene.cameras.main.centerY - 300
    this.scene.add.sprite(this.scene.input.pointer2.x, this.scene.input.pointer2.y, 'pixel').setScale(5).setTint(0x880000).setDepth(100)
    this.scene.input.pointer2.isDown = true
    this.scene.input.pointer1.isDown = true
    this.scene.input.on('drag', (pointer): void => {
      this.scene.input.pointer1.x = pointer.x
      this.scene.input.pointer1.y = pointer.y
    })
  }


  public preUpdate(): void {
    if (this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
      this.scene.press = false;
      const distance: number = Phaser.Math.Distance.Between(
        this.scene.input.pointer1.x,
        this.scene.input.pointer1.y,
        this.scene.input.pointer2.x,
        this.scene.input.pointer2.y
      );
      
      if (Math.abs(this.distance - distance) > 2) {
        if (distance > this.distance) this.plusZoom();
        else if (distance < this.distance) this.minusZoom();
      }

      this.distance = distance;
    } else if (this.distance) this.distance = null;
  }

  private minusZoom(): void {
    if (this.zoom > this.minScroll) {
      this.zoom -= 0.1;
      this.scene.cameras.main.setZoom(this.zoom);
    }
  }

  private plusZoom(): void {
    if (this.zoom < 3.9) {
      this.zoom += 0.1;
      this.scene.cameras.main.setZoom(this.zoom);
    }
  }
}

export default Zoom;