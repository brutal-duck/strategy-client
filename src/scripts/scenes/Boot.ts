import * as Webfont from '../libs/Webfonts.js';
import bridgeMock from '@vkontakte/vk-bridge-mock'
import bridge from '@vkontakte/vk-bridge'
import state from '../state';
import Socket from './../utils/Socket';
const pixel: any = require("./../../assets/images/pixel.png");

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  public state: Istate;
  public lang: string;
  public fontsReady: boolean;
  public userIsReady: boolean;
  public build: string;


  public preload(): void {
    this.load.image('pixel', pixel);
  }

  public init(): void {
    this.build = '0.1';
    console.log('Build ' + this.build);

    this.state = state;
    this.fontsReady = false;
    this.userIsReady = false;
    

    if (process.env.DEV === 'true') {
      this.initMockUser();
    } else {
      this.checkUser();
    }

    
    this.setFonts()
  }

  
  private setFonts(): void {
    let scene: Boot = this;
    Webfont.load({
      custom: {
        families: ['Molot']
      },
      active() {
        scene.fontsReady = true;
      }
    });
  }

  
  private checkUser() {
    bridge.send('VKWebAppInit');
    bridge.send('VKWebAppGetUserInfo').then(data => {
      this.state.player.name = data.first_name + ' ' + data.last_name;
      this.state.player.id = data.id;
      this.userIsReady = true;
      this.state.socket = new Socket(this.state);
    });
    bridge.send('VKWebAppStorageGet', { keys: ['points']}).then(data => {
      this.state.player.points = Number(data.keys[0].value) || 0;
    });

  }


  private initMockUser(): void {
    bridgeMock.send('VKWebAppInit');
    bridgeMock.send('VKWebAppGetUserInfo').then(data => {
      this.state.player.name = data.first_name + ' ' + data.last_name;
      this.state.player.id = data.id;
      this.userIsReady = true;
      this.state.socket = new Socket(this.state);
    });
    bridgeMock.send('VKWebAppStorageGet', { keys: ['points']}).then(data => {
      if (data.keys[0]) {
        this.state.player.points = Number(data.keys[0].value) || 0;
      } else {
        this.state.player.points = 0;
      }
    });
  }

  public update(): void {
    if (this.userIsReady && this.fontsReady) {
      this.userIsReady = false;
      this.fontsReady = false;
      this.start();
    }
  }

  public start(): void {
    this.scene.stop();
    this.scene.start('Preload', this.state)
  }
  
}

export default Boot;
