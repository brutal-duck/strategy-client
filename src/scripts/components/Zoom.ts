import Game from '../scenes/Game';

class Zoom extends Phaser.GameObjects.Sprite {
  constructor(scene: Game) {
    super(scene, 0, 0, '')
    this.scene = scene;
    this.init();
  }

  public scene: Game;
  private zoom: number;
  private zoomStap: number;
  private maxZoom: number;
  private minZoom: number;
  private distance: number;
  private minScroll: number;
  private zoomInToViewAni: Phaser.Tweens.Tween

  private init(): void {
    this.zoom = 1.2;
    this.zoomStap = 0.05
    this.maxZoom = 1.6
    this.minZoom = 0.7
    this.setZoom();
  }


  private setZoom(): void {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.preUpdate, this);
    this.scene.cameras.main.setZoom(this.zoom);
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject, deltaX: number, deltaY: number): void => {
      if (deltaY < 0) this.zooming('+');
      else if (deltaY > 0) this.zooming('-');
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
        if (distance > this.distance) this.zooming('+');
        else if (distance < this.distance) this.zooming('-');
      }

      this.distance = distance;
    } else if (this.distance) this.distance = null;
  }


  private zooming(inOrOut: string) {
    const widthZoom = this.scene.camera.width / this.scene.worldWidth
    const heightZoom = this.scene.camera.height / this.scene.worldHeight
    this.minZoom = this.scene.camera.width > this.scene.camera.height ? widthZoom : heightZoom

    if (inOrOut === '+' && this.zoom < this.maxZoom) this.zoom += this.zoomStap;
    else if (inOrOut === '-') {
      if (this.zoom - this.zoomStap > this.minZoom) this.zoom -= this.zoomStap;
      else this.zoom = this.minZoom
    }
    
    this.scene.camera.setZoom(this.zoom);
    this.scene.dragOrZoom = true
    this.scene.worldViewBorders = {
      x1: this.scene.camera.worldView.width / 2,
      x2: this.scene.camera.getBounds().width - this.scene.camera.worldView.width / 2,
      y1: this.scene.camera.worldView.height / 2,
      y2: this.scene.camera.getBounds().height - this.scene.camera.worldView.height / 2,
    }
  }
}

export default Zoom;