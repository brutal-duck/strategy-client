import bridgeMock from "@vkontakte/vk-bridge-mock";
import bridge from "@vkontakte/vk-bridge";
import FlyAwayMsg from "../components/FlyAwayMsg";
import Hex from "../components/Hex";
import Zoom from "../components/Zoom";
import { config } from "../gameConfig";
import langs from "../langs";
import AI from "../utils/AI";
import World from "../utils/World";
import Hud from "./Hud";
import GraphManager from './../utils/GraphManager';

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  public state: Istate;
  public lang: any;
  public player: Iplayer;
  public enemyColor: string;
  public hud: Hud;
  public world: World;
  public gameIsOn: boolean = false;
  public debuging: boolean;
  public AI: AI;

  public green: Iconfig;
  public red: Iconfig;

  public camera: Phaser.Cameras.Scene2D.Camera;
  public pan: Phaser.Cameras.Scene2D.Effects.Pan;
  private flyAni1: Phaser.Tweens.Tween;
  private flyAni2: Phaser.Tweens.Tween;
  private flyAni3: Phaser.Tweens.Tween;
  private startFlyX: number;
  public midPoint: Phaser.Physics.Arcade.Sprite;
  public vector: Phaser.Physics.Arcade.Sprite;
  public distanceX: number;
  public distanceY: number;
  public holdCounter: number;
  public zoomed: boolean;
  public draged: boolean;
  public twoPointerZoom: boolean;
  public worldViewBorders: { x1: number, x2: number, y1: number, y2: number };
  public worldWidth: number;
  public worldHeight: number;
  public segmentRows: number;
  public segmentCols: number;
  public rows: number;
  public cols: number;

  public stars: number;
  public baseWasFound: boolean;
  public hidedHexes: string[];

  private worldBG: Phaser.GameObjects.TileSprite;
  public hexes: Hex[];
  public pointerHex: Hex;
  public chosenHex: Hex;

  public claming: string[];
  public graphManager: GraphManager;

  public init(state: Istate) {
    this.state = state
    this.lang = langs.ru
    this.state.game.updateHex = false;
    this.hud = this.game.scene.getScene('Hud') as Hud;
    this.gameIsOn = false

    this.worldWidth = 2548 * 1.5
    this.worldHeight = 2548 * 1.5
    this.segmentRows = 7
    this.segmentCols = 9
    this.cols = this.segmentCols * 3 // общее количество колонок
    this.rows = this.segmentRows * 3 // общее количество рядов

    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.camera.centerOn(this.worldWidth / 2, this.worldHeight / 4)
    this.scale.lockOrientation('landscape-primary')

    this.hexes = []

    new Zoom(this);
    this.debuging = Boolean(process.env.DEBUG_HEX);
  }


  public create(): void {
    this.add.sprite(0, 0, 'bg').setOrigin(0)
    this.worldBG = this.add.tileSprite(0, 0, this.camera.getBounds().width, this.camera.getBounds().height, 'pixel').setOrigin(0).setAlpha(0.001).setInteractive({ draggable: true })
    this.world = new World(this, this.gameIsOn)
    this.setInput()
    this.setEvents()
    this.graphManager = new GraphManager(this);
    if (this.state.tutorial === 0) {
      this.scene.stop('MainMenu');
      this.startTutorial(this.state);
    }
  }


  public launch(state: Istate): void {
    this.state.game.isStarted = true;
    this.state = state
    this.player = state.player
    this.enemyColor = this.player.color === 'red' ? 'green' : 'red'
    this.green = Object.assign({}, config)
    this.red = Object.assign({}, config)
    this[this.player.color].name = this.state.player.name;
    this[this.enemyColor].name = this.state.enemy?.name || this.state.game.AI.toUpperCase() + '_BOT';
    this.stars = 0
    this.baseWasFound = false
    this.claming = [] // массив захватываемых в данный момент клеток

    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.twoPointerZoom = false
    this.draged = false
    this.zoomed = false
    
    this.gameIsOn = true // запущен ли матч
    this.world.recreate(this.gameIsOn, this.state.game.seed);
    
    if (this.state.game.AI !== '') {
      this.AI = new AI(this, this.state.game.AI)
      this.AI.init()
    }

    this.input.keyboard.createCursorKeys().space.on('down', (): void => {
      bridge.send('VKWebAppStorageSet', { key: 'tutorial', value: '0' });
    });

    this.graphManager.initGraphs();
    this.graphManager.initNeutralGraphs();
  }


  private startTutorial(state: Istate): void {
    this.scene.launch('Hud', this.state);
    this.state.game.isStarted = true;
    this.state = state
    this.state.game.AI = 'easy';
    state.player.color = 'green';
    this.player = state.player
    this.enemyColor = 'red'
    this.green = Object.assign({}, config)
    this.red = Object.assign({}, config)
    this[this.player.color].name = '';
    this[this.player.color].clameTime = 500;
    this[this.enemyColor].name = '';
    this.stars = 0
    this.baseWasFound = false
    this.claming = [] // массив захватываемых в данный момент клеток

    this.distanceX = 0
    this.distanceY = 0
    this.holdCounter = 0
    this.twoPointerZoom = false
    this.draged = false
    this.zoomed = false
    
    this.gameIsOn = true // запущен ли матч
    this.world.createTutorialWorld(true);
    
    this.graphManager.initGraphs();
    this.graphManager.initNeutralGraphs();
    this.scene.launch('Tutorial', this.state);
  }

  private setInput(): void {
    const holdedPoint = { x: 0, y: 0 }
    const vectorStep = this.game.device.os.desktop ? 0.5 : 1.5 // Сила "натяжения" точки для быстрого драга
    const dragStep = this.game.device.os.desktop ? 1 : 2
    let ani: Phaser.Tweens.Tween

    this.midPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x000000).setDepth(10)
    this.vector = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x880000).setDepth(10)
    const pointerPoint = this.physics.add.sprite(0, 0, 'pixel').setVisible(false).setScale(5).setTint(0x008800).setDepth(10)
    // console.log('setInput ~ midPoint', this.midPoint)

    this.input.setPollAlways()
    this.input.setTopOnly(false)
    this.input.dragDistanceThreshold = 10

    this.worldBG.on('dragstart', (pointer): void => {
      if (this.state.tutorial <= 5) return;
      ani?.remove()
      this.camera.panEffect.reset()
      this.camera.zoomEffect.reset()
      this.worldViewBorders = {
        x1: this.camera.worldView.width / 2,
        x2: this.camera.getBounds().width - this.camera.worldView.width / 2,
        y1: this.camera.worldView.height / 2,
        y2: this.camera.getBounds().height - this.camera.worldView.height / 2,
      }

      holdedPoint.x = pointer.x
      holdedPoint.y = pointer.y

      this.distanceX = 0
      this.distanceY = 0
      this.vector.setPosition(this.midPoint.x, this.midPoint.y)
      this.midPoint.setPosition(this.camera.midPoint.x, this.camera.midPoint.y).body.stop()
      pointerPoint.setPosition(pointer.worldX, pointer.worldY)
      
      this.camera.startFollow(this.midPoint)
      this.draged = true
    })


    this.worldBG.on('drag', (pointer): void => {
      if (this.state.tutorial <= 5) return;

      if (!this.input.pointer2.isDown && this.draged) {
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


    this.worldBG.on('dragend', (): void => {
      if (this.state.tutorial <= 5) return;

      if (this.holdCounter < 3) {
        ani = this.tweens.add({
          targets: this.midPoint,
          x: this.vector.x,
          y: this.vector.y,
          duration: 800,
          ease: 'Power2'
        });
      }
      // this.input.mousePointer.camera = this.camera // фикс краша вывода курсора за предел веб окна для старшей версии Phasera
    });


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
  }

  public setHexInteractive(): void {
    this.hexes.forEach(hex => {
      hex.on('pointerover', (): void => { this.pointerHex = hex })
      hex.on('pointerup', (): void => {
        if (this.state.tutorial <= 5) return;
        if (this.state.game.AI) this.pointerUp(hex);
        else this.socketPointerUp(hex);
      });
    });
  }

  public pointerUp(hex: Hex): void {
    if (this.draged) {
      this.draged = false;
    } else if (this.twoPointerZoom) {
      this.twoPointerZoom = false;
      this.draged = false;
    } else {
      this.chosenHex = hex;
      const { x, y } = hex.getCenter();
      const { color } = this.player;
      const player: Iconfig = this[color];
      
      if (hex.dark || !this.nearbyHexes(hex).some(el => el?.own === color)) {
        if (player.superHex < 1) {
          new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', 'purple');
        } else if (hex.landscape || hex.class === 'base') {
          new FlyAwayMsg(this, x, y, this.lang.wrongPlace, 'red', '', 1000);
        } else {
          this.scene.launch('Modal', { state: this.state, type: 'superHex' });
        }
      } else if (hex.landscape) {
        new FlyAwayMsg(this, x, y, this.lang.wrongPlace, 'red', '', 1000);
      } else if (hex.own === color) {
        if (hex.class === 'grass') {
          if (!hex.clamingAni?.isPlaying()) {
            if (!hex.upgradeAni?.isPlaying()) {
              if (player.hexes >= hex.defence + 1) {
                player.hexes -= hex.defence + 1;
                new FlyAwayMsg(this, x, y, `-${hex.defence + 1}`, 'red', color);
                hex.upgradeDefence(color);
              } else {
                new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', color);
              }
            } else {
              new FlyAwayMsg(this, x, y, this.lang.upgrading, 'yellow', '', 1000);
            }
          } else {
            new FlyAwayMsg(this, x, y, this.lang.claming, 'yellow');
          }
        }
      } else if (hex.own !== color) {
        if (!hex.clamingAni?.isPlaying()) {
          if (hex.class !== 'base') {
            if (hex.own === 'neutral') {
              if (player.hexes >= hex.defence) {
                new FlyAwayMsg(this, x, y, `-${hex.defence}`, 'red', color);
                player.hexes -= hex.defence;
                hex.setClaming(color);
              } else {
                new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', color);
              }
            } else {
              if (hex.defence === 1 && player.hexes >= 2) {
                new FlyAwayMsg(this, x, y, `-${2}`, 'red', color);
                player.hexes -= 2;
                hex.setClearClame(color);
                this.graphManager.updateHexInGraphs(hex);
              } else if (hex.defence !== 1 && player.hexes >= 1) {
                new FlyAwayMsg(this, x, y, `-${1}`, 'red', color);
                player.hexes -= 1;
                hex.setClearClame(color);
              } else {
                new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', color);
              }
            }
          } else {
            new FlyAwayMsg(this, x, y, this.lang.surroundBase, 'yellow', '', 2000);
          }
        } else {
          new FlyAwayMsg(this, x, y, this.lang.claming, 'yellow');
        }
      }
      if (this.state.tutorial === 6) {
        if (this.green.hexes <= 20) this.green.hexes += 30;
      }
      this.hud.updateHexCounter();
    }
  }

  public socketPointerUp(hex: Hex): void {
    if (this.draged) {
      this.draged = false;
    } else if (this.twoPointerZoom) {
      this.twoPointerZoom = false;
      this.draged = false;
    } else {
      // console.log('hex.on ~', hex)
      this.chosenHex = hex
      const x = hex.getCenter().x
      const y = hex.getCenter().y
      const player = this[this.player.color]

      if (
        hex.own !== this.player.color && hex.class !== 'base' &&
        !hex.landscape && !hex.clamingAni?.isPlaying() &&
        this.nearbyHexes(hex).some(el => el?.own === this.player.color)
      ) {
        if (hex.own === 'neutral' && hex.defence === 1 && player.hexes >= hex.defence) {
          this.state.socket.hexClick(hex.id);
        } else if (hex.defence === 1 && player.hexes >= hex.defence) {
          this.state.socket.hexClick(hex.id);
        } else if (hex.defence > 1 && player.hexes >= hex.defence) {
          this.state.socket.hexClick(hex.id);
        }
        else new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', this.player.color)
      } else if (hex.landscape) new FlyAwayMsg(this, x, y, this.lang.wrongPlace, 'red', '', 1000)
        else if (hex.own === this.player.color && hex.class === 'grass' && player.hexes >= hex.defence + 1 && !hex.clamingAni?.isPlaying()) {
        if (!hex.upgradeAni?.isPlaying()) {
          this.state.socket.hexClick(hex.id);
        } else new FlyAwayMsg(this, x, y, this.lang.upgrading, 'yellow', '', 1000)
      } else if (hex.own !== this.player.color && hex.class !== 'base') {
        if (player.superHex > 0 && !hex.clamingAni?.isPlaying()) {
          if (hex.own !== this.player.color && !hex.landscape && hex.class !== 'base' && !hex.clamingAni?.isPlaying()) this.scene.launch('Modal', { state: this.state, type: 'superHex' })
          else if (hex.class !== 'base' || (hex.landscape && hex.dark)) new FlyAwayMsg(this, x, y, this.lang.wrongPlace, 'red', '', 1000)
        }
        else if ((hex.dark || !hex.landscape) && !hex.clamingAni?.isPlaying()) new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', 'purple')
        else if (hex.clamingAni?.isPlaying()) new FlyAwayMsg(this, x, y, this.lang.claming, 'yellow')
        
      } else if (hex.class === 'base' && !hex.dark && hex.own !== this.player.color) {
        new FlyAwayMsg(this, x, y, this.lang.surroundBase, 'yellow', '', 2000)
      }  else if (hex.own === this.player.color && (hex.class === 'x1' || hex.class === 'x3') && !hex.clamingAni?.isPlaying()){
        new FlyAwayMsg(this, x, y, this.lang.cantLevelUp, 'yellow', '', 2000);
      }  else if (hex.own === this.player.color && hex.class === 'grass' && player.hexes < hex.defence + 1 && !hex.clamingAni?.isPlaying()) {
        new FlyAwayMsg(this, x, y, this.lang.notEnought, 'red', this.player.color)
      } 
    }
  }

  public superHexClameConfirmed(): void {
    new FlyAwayMsg(this, this.chosenHex.getCenter().x, this.chosenHex.getCenter().y, '-1', 'red', 'purple')
    this.chosenHex.removeFog()
    this[`${this.player.color}`].superHex--
    this.hud.updateHexCounter()    
    if (this.chosenHex.own === 'neutral') this.chosenHex.setClaming(this.player.color, true)
    else {
      this.graphManager.updateHexInGraphs(this.chosenHex);
      this.chosenHex.setClearClame(this.player.color, true);
    }
  }

  public superHexSocketClameConfirmed(): void {
    this.chosenHex.removeFog()
    Object.values(this.chosenHex.nearby).forEach(el => {
      const hex = this.getHexById(el);
      if (hex) hex.removeFog();
    })
    this.hud.updateHexCounter()
    this.state.socket.hexClick(this.chosenHex.id);
  }

  public getHexById = (id: string): Hex => this.hexes.find(hex => hex.id === id);

  public playerHexes = (): Hex[] => this.hexes.filter(hex => hex.own === this.player.color && !hex.landscape);

  public enemyHexes = (): Hex[] => this.hexes.filter(hex => hex.own == this.enemyColor && !hex.landscape);

  public nearbyHexes(hex: Hex): Hex[] {
    const hexes = [];
    if (hex) {
      Object.values(hex.nearby).forEach(id => {
        const foundHex = this.getHexById(id);
        if (foundHex) hexes.push(foundHex)
      });
    }
    return hexes;
  }
  
  public outerPlayerHexes(): Hex[] {
    return this.playerHexes().filter(hex => this.nearbyHexes(hex).some(el => el.own !== this.player.color));
  }

  public centerCamera(x: number, y: number, zoom: boolean = false, duration: number = 1500, ease: string = 'Power2'): void {
    this.camera.stopFollow()
    this.camera.panEffect.reset()
    this.camera.zoomEffect.reset()
    this.camera.pan(x, y, duration, ease)
    if (zoom) this.camera.zoomTo(1.6, duration, ease)
    this.midPoint.x = x;
    this.midPoint.y = y;
  }

  public cameraFly(updateStartFlyX: boolean = false, fly: boolean = true): void {
    this.flyAni1?.remove()
    this.flyAni2?.remove()
    this.flyAni3?.remove()
    this.camera.stopFollow()
    this.camera.panEffect.reset()
    this.camera.zoomEffect.reset()

    if (fly) {
      const duration = 25000
      if (updateStartFlyX) this.startFlyX = this.camera.worldView.width / 2 > 0 ? this.camera.worldView.width / 2 : 1000
      this.centerCamera(this.startFlyX + 220, 900, true, 2500, 'Quad.easeOut')
      this.flyAni1 = this.tweens.add({
        onStart: (): void => {
          this.midPoint.setPosition(this.camera.midPoint.x, 900)
          this.camera.startFollow(this.midPoint)
        },
        targets: this.midPoint,
        x: this.worldWidth - this.startFlyX - 600, y: 1200,
        duration,
        delay: 3500,
        ease: 'Quad.easeInOut',
        onComplete: (): void => {
          this.flyAni2 = this.tweens.add({
            targets: this.midPoint,
            x: 1600, y: 1600,
            duration,
            ease: 'Quad.easeInOut',
            onComplete: (): void => {
              this.flyAni3 = this.tweens.add({
                targets: this.midPoint,
                x: this.startFlyX + 220, y: 900,
                duration,
                ease: 'Quad.easeInOut',
                onComplete: (): void => { this.cameraFly() }
              })
            }
          })
        }
      })
    }
  }
  
  public gameOverCheck(color: string): void {
    const baseHexes = this.hexes.filter(hex => hex.own === color && hex.class === 'base')
    if (baseHexes.length > 1) this.gameOver('enemyBaseHasCaptured', color)
  }

  public gameOver(reason: string, winner?: string): void {
    if (this.gameIsOn) {
      this.gameIsOn = false
      this.state.game.isStarted = false
      this.hud.hide()
      this.hexes.forEach(hex => {
        hex.clamingAni?.remove();
        hex.upgradeAni?.remove();
        hex.produceHexesRemove();
      });
  
      if (!winner) {
        const green = this.hexes.filter(hex => hex.own === 'green').length
        const red = this.hexes.filter(hex => hex.own === 'red').length

        if (green === red) winner = null
        else if (green > red) winner = 'green'
        else winner = 'red'
      }
      
      const win = winner === this.player.color
      if (this.AI) this.AI.remove()
      this.scene.launch('Modal', { state: this.state, type: 'gameOver', info: { win, winner, reason } })
    }
  }

  public update(): void {
    if (this.gameIsOn) {
      if (!this.input.pointer2.isDown && (this.draged || this.zoomed)) {
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

      this.checkSocketGameOver();
      if (this.state.game.updateHex) {
        this.updateHexState();
        this.updatePlayerState();
        this.state.game.updateHex = false;
      }
    }
  }

  private incPlayerPoints(): void {
    this.player.points += this.state.socket.points;
    if (process.env.DEV === 'true') {
      bridgeMock.send('VKWebAppStorageSet', { key: 'points', value: String(this.player.points) });
    } else {
      bridge.send('VKWebAppStorageSet', { key: 'points', value: String(this.player.points) });
    }
    this.state.socket.points = 0;
  }

  private checkSocketGameOver(): void {
    if (this.state.socket.win) {
      this.state.socket.win = false;
      console.log(this.state, 'this.state');
      let text = 'enemyBaseHasCaptured';
      if (this.state.socket.reason === 'ENEMY_LEFT') text = 'enemySurrendered';
      else if (this.state.socket.reason === 'TIME_IS_UP') text = 'timeIsUp';
      if (this.hexes.every(el => !el.clamingAni?.isPaused())) { 
        this.time.addEvent({
          delay: 200,
          callback: (): void => {     
            this.gameOver(text, this.player.color);
            this.incPlayerPoints();
          },
          callbackScope: this,
        });
      }
    }
    if (this.state.socket.loose) {
      this.state.socket.loose = false;
      console.log(this.state, 'this.state');
      if (this.hexes.every(el => !el.clamingAni?.isPaused())) {
        let text = 'yourBaseHasCaptured';
        if (this.state.socket.reason === 'ENEMY_LEFT') text = 'youSurrendered';
        else if (this.state.socket.reason === 'TIME_IS_UP') text = 'timeIsUp';
        this.time.addEvent({
          delay: 200,
          callback: (): void => {
            this.gameOver(text, this.player.color === 'red' ? 'green' : 'red');
          },
          callbackScope: this,
        });
      }
    }

  }

  private updateHexState(): void {
      if (this.state.game.hexes) {
        this.state.game.hexes.forEach(socketHex => {
          const hex = this.hexes.find(el => el.id === socketHex.id);
          if (hex.own !== socketHex.newOwn && socketHex.own !== socketHex.newOwn && !hex.clamingAni?.isPlaying()) {
            if (hex.own !== 'neutral') {
              if (socketHex.newOwn === this.player.color) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, `-${hex.defence + 1}`, 'red', this.player.color);
              }
              hex.setSocketClearClame(socketHex.newOwn, socketHex.super);
            } 
            else {
              if (socketHex.newOwn === this.player.color) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, `-${hex.defence}`, 'red', socketHex.super ? 'purple' : this.player.color);
              }
              hex.setSocketClaming(socketHex.newOwn, socketHex.super);}
          } else if (socketHex.own !== socketHex.newOwn && !hex.clamingAni?.isPlaying()) {
            hex.socketClame(socketHex.newOwn, socketHex.super);
          } else if (hex.own !== socketHex.own) {
            hex.socketClame(socketHex.newOwn, socketHex.super);
            if (hex.class === 'rock') hex.setWorldTexture(socketHex.newOwn);
          }
          if (socketHex.defence !== socketHex.newDefence && !hex.upgradeAni?.isPlaying() && socketHex.newDefence > socketHex.defence) {
            if (socketHex.newDefence > 1) {
              console.log('upgrade')
              hex.upgradeSocketDefence();
              if (socketHex.newOwn === this.player.color) {
                new FlyAwayMsg(this, hex.getCenter().x, hex.getCenter().y, `-${hex.defence + 1}`, 'red', this.player.color)
              }
            }
          }
          if (socketHex.defence !== socketHex.newDefence && !hex.clamingAni?.isPlaying() && socketHex.newDefence < socketHex.defence) {
            hex.setSocketClearClame(socketHex.newOwn, socketHex.super);
          }

          if (hex.defence !== socketHex.defence) {
            hex.defence = socketHex.defence;
            if (hex.defence > 1) {
              console.log(hex.defence, 'hex.defence')
              hex.defenceLvl?.setText(String(hex.defence));
            } else {
              console.log('hex.defenceLvl')
              hex.defenceLvl?.setVisible(false);
            }
            hex.setWorldTexture();
          }
        });
      }
      this.state.game.updateHex = false;
  }

  private updatePlayerState(): void {
    if (this.state.game.player) {
      const gameConfig: Iconfig = this[this.state.player.color];
      gameConfig.hexes = this.state.game.player.hexes;
      gameConfig.superHex = this.state.game.player.superHexes;
      this.hud.timer.updateTime(this.state.game.serverGameTime);
      this.hud.updateHexCounter()
    }
  }
}