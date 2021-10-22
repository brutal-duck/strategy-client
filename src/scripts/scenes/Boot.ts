import * as Webfont from '../libs/Webfonts.js';
import bridgeMock from '@vkontakte/vk-bridge-mock'
import bridge from '@vkontakte/vk-bridge'
import { FAPI } from '../libs/Fapi.js'
import * as platform from 'platform';
import axios from 'axios';

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
    this.load.image('pixel', pixel)
  }

  public init(): void {
    this.build = '0.1';
    console.log('Build ' + this.build);

    this.state = state;
    this.fontsReady = false;
    this.userIsReady = false;
    
    // let search: string = window.location.search;
    // let params: URLSearchParams = new URLSearchParams(search);
    // let vk: string = params.get('api_url');
    // let ok: string = params.get('api_server');

    // if (vk === 'https://api.vk.com/api.php') this.state.platform = "vk";
    // else if (ok === 'https://api.ok.ru/') this.state.platform = "ok";

    // if (platform.os.family === 'Android' || platform.os.family === 'iOS') this.state.mobile = true;
    // if (process.env.DEV === 'true') this.state.platform = 'vk'

    if (this.game.device.os.windows) this.state.platform = 'windows web'
    else if (this.game.device.os.android) this.state.platform = 'android'

    console.log('Platform:', this.state.platform);
    
    this.setFonts()
    this.checkUser()
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
    const vkId = 12345 + Phaser.Math.Between(1, 2);
    this.checkUserOnServer(vkId);
    this.state.socket = new Socket(this.state)
  }


  public update(): void {
    if (this.userIsReady && this.fontsReady) {
      this.userIsReady = false;
      this.fontsReady = false;
      this.start();
    }
  }

  private checkUserOnServer(vkId: number): void {
    const data: { id: number } = { id: vkId };
    console.log(vkId);
    axios.post(process.env.API + '/checkUser', data).then(res => {
      const { error, userData }: { error: boolean, userData: IuserData } = res.data;
      if (!error) {
        this.state.player.id = userData.id;
        this.state.player.name = String(userData.vkId);
        this.userIsReady = true;
      }
    });
  }

  public start(): void {
    this.scene.stop();
    this.scene.start('Preload', this.state)
  }
  
}

export default Boot;
