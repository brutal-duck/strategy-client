import * as Webfont from '../libs/Webfonts.js';
import { FAPI } from '../libs/FAPI.js';
import bridge from '@vkontakte/vk-bridge';
import state from '../state';
import Socket from './../utils/Socket';
import Amplitude from './../libs/Amplitude';
import { platforms } from '../types';
import langs from '../langs';
const pixel: any = require("./../../assets/images/pixel.png");

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  public state: Istate;
  public fontsReady: boolean;
  public userIsReady: boolean;
  public build: number;
  public lang: { [key: string]: string };

  public preload(): void {
    this.load.image('pixel', pixel);
  }

  public init(): void {
    this.build = 1.00002;
    console.log('Build ' + this.build);
    this.lang = langs.ru;
    this.state = state;
    this.fontsReady = false;
    this.userIsReady = false;
    this.state.platform = 'web';
    
    if (process.env.PLATFORM !== platforms.YANDEX) {
      const search: string = window.location.search;
      const params = new URLSearchParams(search);
      const vk: string = params.get('api_url');
      const ok: string = params.get('api_server');
      if (vk === 'https://api.vk.com/api.php') this.state.platform = 'vk';
      else if (ok === 'https://api.ok.ru/') this.state.platform = 'ok';

      if (this.state.platform === platforms.VK) {
        this.initUserVK();
      } else if (this.state.platform === platforms.OK) {
        this.initUserOk();
      } else {
        this.initUserWeb();
      }
    } else {
      this.initYandexPlatform();
    }
    this.setFonts();
  }

  
  private setFonts(): void {
    let scene: Boot = this;
    Webfont.load({
      custom: { families: ['Molot'] },
      active() {
        scene.fontsReady = true;
      }
    });
  }


  private initUserWeb(): void {
    this.state.player.name = this.lang.you;
    this.state.player.points = Number(localStorage.getItem('points'));
    this.state.tutorial = Number(localStorage.getItem('tutorial'));
    const id = localStorage.getItem('id');
    if (id) {
      this.state.player.id = id;
    } else {
      this.state.player.id = this.randomString(10);
    }
    this.userIsReady = true;
    this.state.socket = new Socket(this.state);
    this.initAmplitude();
  }

  private initUserOk(): void {
    const FAPIData = FAPI.Util.getRequestParameters();
    FAPI.init(FAPIData.api_server, FAPIData.apiconnection, (): void => {
      this.okCallback(); 
    });
    this.state.player.id = FAPIData.logged_user_id;
    this.state.player.name = FAPIData.user_name || this.lang.you;

    FAPI.Client.call({ method: 'storage.get', keys: ['points', 'tutorial'] }, (res, data) => {
      const points = data.data['points'];
      const tutorial = data.data['tutorial'];
      if (points) {
        this.state.player.points = Number(points.value);
      }
      if (tutorial) {
        this.state.tutorial = Number(tutorial.value);
      }
      this.userIsReady = true;
      this.state.socket = new Socket(this.state);
      this.initAmplitude();
    });
  }

  private okCallback(): void {
    let win: any = window;
    win.API_callback = (method: any, result: any, data: any): void => {

    }
  }
  
  private initUserVK(): void {
    bridge.send('VKWebAppInit');
    bridge.send('VKWebAppGetUserInfo').then(data => {
      this.state.player.name = data.first_name + ' ' + data.last_name;
      this.state.player.id = data.id;
      bridge.send('VKWebAppStorageGet', { keys: ['points', 'tutorial']}).then(data => {
        const points = data.keys.find(el => el.key === 'points');
        const tutorial = data.keys.find(el => el.key === 'tutorial');
        if (points) {
          this.state.player.points = Number(points.value);
        }
        if (tutorial) {
          this.state.tutorial = Number(tutorial.value);
        }
        this.userIsReady = true;
        this.state.socket = new Socket(this.state);
        this.initAmplitude();
      });
    });
  }

  private initAmplitude(): void {
    this.state.amplitude = new Amplitude(this);
    this.state.amplitude.setUserProperty('build', this.build);
    this.state.amplitude.setUserProperty('platform', this.state.platform);
  }

  public update(): void {
    if (this.userIsReady && this.fontsReady) {
      this.userIsReady = false;
      this.fontsReady = false;
      this.start();
    }
  }

  private start(): void {
    this.scene.stop();
    this.scene.start('Preload', this.state)
  }

  private initYandexPlatform(): void {
    this.state.platform = platforms.YANDEX;
    const d: Document = document;
    const t: HTMLScriptElement = d.getElementsByTagName('script')[0];
    const s: HTMLScriptElement = d.createElement('script');
    s.src = 'https://yandex.ru/games/sdk/v2';
    s.async = true;
    t.parentNode.insertBefore(s, t);
    s.onload = (): void => {
      window['YaGames'].init().then((ysdk: any) => {
        this.state.ysdk = ysdk;
        this.initYandexUser().catch((err) => {
          this.state.player.id = this.randomString(10);
          this.state.player.name = this.lang.you;
        }).finally(() => {
          this.userIsReady = true;
          this.state.socket = new Socket(this.state);
          this.initAmplitude();
        });
      });
    }
  }

  private randomString(length: number = 5): string {
    let characters: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let rs: string = '';
  
    while (rs.length < length) {
      rs += characters[Math.floor(Math.random() * characters.length)];
    }
  
    return rs;
  }

  private async initYandexUser(): Promise<void> {
    return this.state.ysdk.getPlayer().then((player: IyandexPlayer) => {
      this.state.player.id = player.getUniqueID();
      this.state.player.name = player.getName();
      if (!this.state.player.name) this.state.player.name = `yandex_${String(this.state.player.id).substr(0, 4)}`;
      this.state.yaPlayer = player;
      this.state.yaPlayer.getData().then(data => {
        const result: IstorageData = {
          tutorial: 0,
          play: false,
          points: 0,
          gameCount: 0,
        };
        if (data) {
          result.tutorial = data.tutorial || result.tutorial;
          result.play = data.play || result.play;
          result.points = data.points || result.points;
          result.gameCount = data.gameCount || result.gameCount;
        }
        this.state.tutorial = Number(result.tutorial);
        this.state.player.points = Number(result.points);
        this.state.yaPlayer.setData(result, true);
        this.state.ysdk.adv.showFullscreenAdv({callbacks:{}});
      });
    });
  }

}

export default Boot;
