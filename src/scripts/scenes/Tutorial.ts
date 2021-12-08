import langs from "../langs";
import Hex from './../components/Hex';
import Game from './Game';
import FlyAwayMsg from './../components/FlyAwayMsg';
import { config } from "../gameConfig";
import Hud from './Hud';

export default class Tutorial extends Phaser.Scene {
  public state: Istate;
  private lang: { [key: string]: string };
  private gameScene: Game;
  
  constructor() {
    super('Tutorial');
  }

  public init(state: Istate): void {
    this.state = state;
    this.lang = langs.ru;
    this.gameScene = this.game.scene.getScene('Game') as Game;
  }

  public create(): void {
    switch(this.state.tutorial) {
      case 0:
        this.createStep0();
        break;
      case 1:
        this.createStep1();
        break;
      case 2:
        this.createStep2();
        break;
      case 3:
        this.createStep3();
        break;
      case 4:
        this.createStep4();
        break;
      case 5:
        this.createStep5();
        break;
    }
  }

  private createStep0(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep0);
    const baseHex = this.gameScene.getHexById('11-10');
    const action = (hex: Hex) => {
      const { x, y } = hex.getCenter();
      new FlyAwayMsg(this.gameScene, x, y, `-${hex.defence}`, 'red', 'green');
      hex.setClaming('green');
      this.gameScene.green.hexes -= 1;
      this.gameScene.centerCamera(hex.getCenter().x, hex.getCenter().y);
      const topHex = this.gameScene.getHexById(hex.nearby.top);
      const botHex = this.gameScene.getHexById(hex.nearby.bot);
      if (topHex && topHex.dark) {
        topHex.setClass('x1');
        this.gameScene.chosenHex = topHex;
      } else if (botHex && botHex.dark) {
        botHex.setClass('x1');
        this.gameScene.chosenHex = botHex;
      }
      this.gameScene.time.addEvent({
        delay: this.gameScene.green.clameTime,
        callback: (): void => {
          this.state.tutorial += 1;
          this.gameScene.scene.launch('Tutorial', this.state);
        }
      });
      this.scene.stop();
    }
    Object.values(baseHex.nearby).forEach(id => {
      this.createHexZone(this.gameScene.getHexById(id), baseHex, action);
    });
  }

  private createStep1(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep1);
    const hudScene = this.game.scene.getScene('Hud') as Hud;
    const { bottom, right } = hudScene.hexBar.getBounds();
    this.createArrow(right, bottom, true);
    const { width, height } = this.cameras.main;
    this.add.tileSprite(0, 0, width, height, 'pixel')
      .setOrigin(0)
      .setAlpha(0.001)
      .setTint(0)
      .setInteractive()
      .on('pointerup', () => {
        this.state.tutorial += 1;
        this.scene.restart(this.state);
        this.gameScene.centerCamera(this.gameScene.chosenHex.getCenter().x, this.gameScene.chosenHex.getCenter().y);
      });
  }

  private createStep2(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep2);
    const action = (hex: Hex) => {
      const { x, y } = hex.getCenter();
      new FlyAwayMsg(this.gameScene, x, y, `-${hex.defence}`, 'red', 'green');
      this.gameScene.green.hexes -= 1;
      hex.setClaming('green');
      this.gameScene.centerCamera(hex.getCenter().x, hex.getCenter().y);
      const topHex = this.gameScene.getHexById(hex.nearby.top);
      const botHex = this.gameScene.getHexById(hex.nearby.bot);
      if (topHex && topHex.dark) {
        topHex.setClass('super');
        this.gameScene.chosenHex = topHex;
      } else if (botHex && botHex.dark) {
        botHex.setClass('super');
        this.gameScene.chosenHex = botHex;
      }
      this.gameScene.time.addEvent({
        delay: this.gameScene.green.clameTime,
        callback: (): void => {
          this.state.tutorial += 1;
          this.gameScene.scene.launch('Tutorial', this.state);
          this.gameScene.centerCamera(this.gameScene.chosenHex.getCenter().x, this.gameScene.chosenHex.getCenter().y);
        }
      });
      this.scene.stop();
    }
    const hexZone = this.createHexZone(this.gameScene.chosenHex, this.gameScene.chosenHex, action);
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        const { left, centerY } = hexZone.getBounds();
        this.createArrow(left, centerY);
      }
    });
  }

  private createStep3(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep3);
    const action = (hex: Hex) => {
      const { x, y } = hex.getCenter();
      new FlyAwayMsg(this.gameScene, x, y, `-${hex.defence}`, 'red', 'green');
      this.gameScene.green.hexes -= 1;
      hex.setClaming('green');
      this.gameScene.centerCamera(hex.getCenter().x, hex.getCenter().y);
      this.gameScene.time.addEvent({
        delay: this.gameScene.green.clameTime,
        callback: (): void => {
          this.state.tutorial += 1;
          this.gameScene.scene.launch('Tutorial', this.state);
        }
      });
      this.scene.stop();
    }
    const hexZone = this.createHexZone(this.gameScene.chosenHex, this.gameScene.chosenHex, action);
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        const { left, centerY } = hexZone.getBounds();
        this.createArrow(left, centerY);
        const hudScene = this.game.scene.getScene('Hud') as Hud;
        const { bottom, right } = hudScene.superHexBar.getBounds();
        this.createArrow(right, bottom, true);
      }
    });
  }

  private createStep4(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep4);
    const hudScene = this.game.scene.getScene('Hud') as Hud;
    const { centerX, bottom } = hudScene.timer.getBounds();
    this.createArrow(centerX, bottom, true);

    const { width, height } = this.cameras.main;
    this.add.tileSprite(0, 0, width, height, 'pixel')
      .setOrigin(0)
      .setAlpha(0.001)
      .setTint(0)
      .setInteractive()
      .on('pointerup', () => {
        const hex = this.gameScene.hexes.find(el => el.own === 'red');
        hex.removeFog();
        this.state.tutorial += 1;
        this.scene.restart(this.state);
      });
  }

  private createStep5(): void {
    this.createBubble({ x: 200, y: 200 }, this.lang.tutorialStep5);
    const { width, height } = this.cameras.main;
    this.add.tileSprite(0, 0, width, height, 'pixel')
      .setOrigin(0)
      .setAlpha(0.001)
      .setTint(0)
      .setInteractive()
      .on('pointerup', () => {
        this.state.tutorial += 1;
        this.scene.restart(this.state);
      });
  }
  
  private createBubble(pos: Iposition, str: string): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Molot',
      fontSize: '20px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 350 },
    };
    const text = this.add.text(pos.x, pos.y, str, textStyle).setOrigin(0.5).setDepth(1);
    const { width, height, centerX, centerY } = text.getBounds();
    const bubble = this.add.graphics().fillStyle(0xffffff)
      .fillRoundedRect(centerX - width / 2 - 20, centerY - height / 2 - 20, width + 40, height + 40);
  }

  private createHexZone(hex: Hex, baseHex: Hex, action: (hex: Hex) => void, zoom: number = 1.6): Phaser.GameObjects.Sprite {
    if (!hex) return;
    const w = 100 * zoom;
    const h = 70 * zoom;
    const vectors = [
      w/4, 0,
      w*0.75, 0,
      w, h/2,
      w*0.75, h,
      w/4, h,
      0, h/2
    ];
    //@ts-ignore
    const hitArea: Phaser.Geom.Polygon = new Phaser.Geom.Polygon(vectors);

    const { x, y } = hex.getCenter();
    const dx = x - baseHex.getCenter().x;
    const dy = y - baseHex.getCenter().y;
    const startX = this.cameras.main.centerX + dx * zoom;
    const startY = this.cameras.main.centerY + dy * zoom;
    const hexZone = this.add.sprite(startX, startY, 'hex').setDepth(2);
    hexZone
      .setAlpha(0.001)
      .setInteractive(hitArea, Phaser.Geom.Polygon.Contains)
      .on('pointerup', () => {
        action(hex);
      });
    return hexZone;
  }

  private createArrow(x: number, y: number, vertical: boolean = false): void {
    const arrow = this.add.sprite(x, y, 'arrow').setAngle(vertical ? -90 : 0).setOrigin(1, 0.5).setScale(0.5);
    this.tweens.add({
      targets: arrow,
      x: vertical ? '+=0' : '+= 20',
      y: vertical ? '+=20' : '+= 0',
      duration: 350,
      yoyo: true,
      repeat: -1,
    });
  }
};
