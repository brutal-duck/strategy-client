import Button from "./Button";
import Hud from './../../scenes/Hud';
import Utils from './../../utils/Utils';

const ICONS_DISPLAY_PERCENT = 5;
export default class SandwichBtn extends Button {
  public scene: Hud;

  constructor(scene: Hud) {
    super(scene, { x: 0, y: 0 }, (): void => { scene.scene.launch('Modal', { state: scene.state, type: 'gameMenu' }) });
    this.createSprite();
    this.setClickListener();
  }

  private createSprite() {
    this.mainSprite = this.scene.add.sprite(this.position.x, this.position.y, 'menu-btn');
    this.resize();
    this.scene.allElements.push(this);
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.scene.state.tutorial === 0) this.setVisible(false);
  }

  public resize() {
    const cameraWidth = this.scene.camera.width;
    const currentIconsHeight: number = document.body.clientHeight / 100 * ICONS_DISPLAY_PERCENT;
    const menuBtnScale = currentIconsHeight / 35;
    let y = currentIconsHeight * 1.2;
    if (Utils.isMobilePlatform()) y += this.scene.statusBar.getBarHeight();

    this.setScale(menuBtnScale).setPosition(cameraWidth - currentIconsHeight * 1.2, y);
  }
}