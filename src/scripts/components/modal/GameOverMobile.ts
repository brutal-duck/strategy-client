import Modal from '../../scenes/Modal';
import { FAPI } from '../../libs/FAPI.js';
import { colors } from '../../gameConfig';
import ColorsBtn from '../buttons/ColorsBtn';
import bridge from '@vkontakte/vk-bridge';
import { platforms } from '../../types';

export default class GameOverMobile {
  private scene: Modal;
  private playerColor: string;
  private enemyColor: string;
  private top: Phaser.GameObjects.Sprite;
  private mid: Phaser.GameObjects.Sprite;
  private bot: Phaser.GameObjects.Sprite;
  private crown: Phaser.GameObjects.Sprite;
  private title: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.TileSprite;
  private playerSum: Phaser.GameObjects.Text;
  private playerGlow: Phaser.GameObjects.Sprite;
  private playerName: Phaser.GameObjects.Text;
  private enemySum: Phaser.GameObjects.Text;
  private enemyGlow: Phaser.GameObjects.Sprite;
  private enemyName: Phaser.GameObjects.Text;
  private wreath: Phaser.GameObjects.Sprite;
  private btn: ColorsBtn;

  constructor(scene: Modal) {
    this.scene = scene;
    this.playerColor = this.scene.gameScene.player.color
    this.enemyColor = this.scene.gameScene.player.color === 'red' ? 'green' : 'red'
    this.createElements();
  }

  private createElements(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    let text = this.scene.lang.tie;
    let titleColor = '#b1dafe';
    if (this.scene.info.winner !== null) {
      text = this.scene.info.win ? this.scene.lang.win : this.scene.lang.lose;
      titleColor = this.scene.info.win ? '#a893ff' : '#e86464';
    }

    let windowHeight = 450;
    if (!this.scene.info.winner) windowHeight = 470 
    else {
      if (!this.scene.info.win) windowHeight = 470
    }

    const playerHexes: number = this.scene.gameScene?.playerHexes().length
    const enemyHexes: number = this.scene.gameScene?.enemyHexes().length
    
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '60px',
      fontFamily: 'Molot',
      color: titleColor,
    };

    const hexCountStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '60px',
      fontFamily: 'Molot',
      color: colors[this.playerColor].mainStr,
      stroke: '#908F95',
      strokeThickness: 4,
    };

    const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '26px',
      fontFamily: 'Molot',
      color: '#ffffff',
      stroke: '#707070',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 200, useAdvancedWrap: true},
    };
    
    this.top = this.scene.add.sprite(x, y - windowHeight / 2, 'header-mid').setOrigin(0.5, 1);
    const topGeom = this.top.getBounds();
    this.mid = this.scene.add.sprite(topGeom.centerX, topGeom.bottom, 'pixel-window-mid').setDisplaySize(topGeom.width, windowHeight).setOrigin(0.5, 0);
    const midGeom = this.mid.getBounds();
    this.bot = this.scene.add.sprite(topGeom.centerX, topGeom.bottom + windowHeight, 'header-mid').setOrigin(0.5, 0).setFlipY(true);

    if (this.scene.info.win) this.crown = this.scene.add.sprite(x, midGeom.top + 40, 'crown');

    const titleY = this.crown ? this.crown.getBounds().bottom + 10 : midGeom.top;
    this.title = this.scene.add.text(x, titleY, text, titleStyle).setOrigin(0.5, 0);

    const winColor = 0x8569ED;
    const looseColor = 0xEA7363;
    const drawColor = 0x7e69ea;

    let color = drawColor;
    if (this.scene.info.winner) {
      color = this.scene.info.win ? winColor : looseColor;
    }
    this.bg = this.scene.add.tileSprite(x, this.title.getBounds().bottom + 20, topGeom.width - 95, 150, 'pixel').setTint(color).setOrigin(0.5, 0);
    const bgInfoGeom = this.bg.getBounds();
    this.scene.bg.removeInteractive();
    this.playerSum = this.scene.add.text(bgInfoGeom.centerX - 120, bgInfoGeom.centerY + 25, `${playerHexes}`, hexCountStyle).setDepth(1).setOrigin(0.5);
    this.playerGlow = this.scene.add.sprite(this.playerSum.x, this.playerSum.y, this.scene.info.win && this.scene.info.winner ? 'glow-winner' : 'glow-looser').setAlpha(0.5);
    this.playerName = this.scene.add.text(this.playerSum.x, bgInfoGeom.top + 5, this.scene.lang.you, nameStyle).setDepth(1).setOrigin(0.5, 0);
    this.enemySum = this.scene.add.text(bgInfoGeom.centerX + 120, bgInfoGeom.centerY + 25, `${enemyHexes}`, hexCountStyle).setDepth(1).setColor(colors[this.enemyColor].mainStr).setOrigin(0.5);
    this.enemyGlow = this.scene.add.sprite(this.enemySum.x, this.enemySum.y, this.scene.info.win || !this.scene.info.winner ? 'glow-looser' : 'glow-winner').setAlpha(0.5);
    this.enemyName = this.scene.add.text(this.enemySum.x, bgInfoGeom.top + 5, this.scene.lang.enemy, nameStyle).setDepth(1).setOrigin(0.5, 0);

    if (this.scene.info.winner) {
      const wreathX = this.scene.info.win ? this.playerSum.x : this.enemySum.x;
      const wreathY = this.scene.info.win ? this.playerSum.y : this.enemySum.y;
      this.wreath = this.scene.add.sprite(wreathX, wreathY - 5, 'wreath');
    }

    this.btn = new ColorsBtn(this.scene, { x: x, y: this.bg.getBounds().bottom + 70 }, (): void => { this.stopGame(); }, {
      color: 'green',
      text: this.scene.lang.continue,
      icon: false,
    }).setScale(1.5);
  }

  public resize(): void {
    const x = this.scene.bg.getCenter().x;
    const y = this.scene.bg.getCenter().y;
    let text = this.scene.lang.tie;
    if (this.scene.info.winner !== null) {
      text = this.scene.info.win ? this.scene.lang.win : this.scene.lang.lose;
    }

    let windowHeight = 450;
    if (!this.scene.info.winner) {
      windowHeight = 470
    } else {
      if (!this.scene.info.win) windowHeight = 470
    }
        
    this.top.setPosition(x, y - windowHeight / 2);
    const topGeom = this.top.getBounds();
    this.mid.setPosition(topGeom.centerX, topGeom.bottom);
    const midGeom = this.mid.getBounds();
    this.bot.setPosition(topGeom.centerX, topGeom.bottom + windowHeight);

    this.crown?.setPosition(x, midGeom.top + 40);
    const titleY = this.crown ? this.crown.getBounds().bottom + 10 : midGeom.top;
    this.title.setPosition(x, titleY, text);


    this.bg.setPosition(x, this.title.getBounds().bottom + 20, topGeom.width - 95);
    const bgInfoGeom = this.bg.getBounds();

    this.playerSum.setPosition(bgInfoGeom.centerX - 120, bgInfoGeom.centerY + 25);
    this.playerGlow.setPosition(this.playerSum.x, this.playerSum.y);
    this.playerName.setPosition(this.playerSum.x, bgInfoGeom.top + 10);
    this.enemySum.setPosition(bgInfoGeom.centerX + 120, bgInfoGeom.centerY + 25);
    this.enemyGlow.setPosition(this.enemySum.x, this.enemySum.y);
    this.enemyName.setPosition(this.enemySum.x, bgInfoGeom.top + 10);

    if (this.scene.info.winner) {
      const wreathX = this.scene.info.win ? this.playerSum.x : this.enemySum.x;
      const wreathY = this.scene.info.win ? this.playerSum.y : this.enemySum.y;
      this.wreath.setPosition(wreathX, wreathY - 5);
    }

    this.btn.setPosition(x,this.bg.getBounds().bottom + 70);
  }

  public stopGame(): void {
    this.trackGameResult();

    this.scene.scene.stop(); 
    this.scene.gameScene.gameIsOn = false
    this.scene.gameScene.hud.scene.stop()
    this.scene.gameScene.world.recreate(this.scene.gameScene.gameIsOn)
    if (this.scene.state.game.AI) this.scene.gameScene.AI?.remove()
    this.scene.scene.start('MainMenu', this.scene.state)
    this.scene.state.socket?.closeSocket();
    this.saveTutorial();
  }

  private trackGameResult(): void {
    if (this.scene.state.tutorial === 10) {
      let gameStatus = 'draw';
      if (this.scene.info.winner) {
        if (this.scene.info.win) gameStatus = 'win';
        else gameStatus = 'loose';
      }
      
      if (this.scene.state.platform === platforms.VK) {
        bridge.send('VKWebAppStorageGet', { keys: ['gameCount'] }).then(data => {
          const check = data.keys.find(key => key.key === 'gameCount');
          const count = Number(check?.value) || 0;
          this.scene.state.amplitude.track('done', {
            status: gameStatus,
            mode: this.scene.state.game.AI && !this.scene.state.game.fakeOnline ? 'bot' : 'online',
            fakeOnline: String(this.scene.state.game.fakeOnline),
            count: count + 1,
          });
          bridge.send('VKWebAppStorageSet', { key: 'gameCount', value: String(count + 1) });
          if (count === 5) {
            this.scene.scene.restart({ state: this.scene.state, type: 'review' });
          }
        });
      } else if (this.scene.state.platform === platforms.YANDEX) {
        this.scene.state.yaPlayer?.getData().then(data => {
          const result: IstorageData = {
            tutorial: this.scene.state.tutorial,
            play: true,
            points: this.scene.state.player.points,
            gameCount: 1,
          };
          if (data) {
            if (!isNaN(data.gameCount)) {
              result.gameCount = data.gameCount + 1 || result.gameCount;
            }
            if (data.gameCount === 5) {
              this.scene.state.ysdk.feedback.canReview().then(({ value }) => {
                if (value) this.scene.state.ysdk.feedback.requestReview();
              });
            }
          }
          this.scene.state.yaPlayer.setData(result, true);
          this.scene.state.amplitude.track('done', {
            status: gameStatus,
            mode: this.scene.state.game.AI && !this.scene.state.game.fakeOnline ? 'bot' : 'online',
            count: result.gameCount,
            fakeOnline: String(this.scene.state.game.fakeOnline),
          });
        });
      } else if (this.scene.state.platform === platforms.OK) {
        FAPI.Client.call({ method: 'storage.get', keys: ['gameCount'] }, (res, data) => {
          if (data.data) {
            const check = data.data['gameCount'];
            const count = Number(check?.value) || 0;
            if (!check || check && check.value !== 'true') {
              this.scene.state.amplitude.track('done', {
                status: gameStatus,
                mode: this.scene.state.game.AI && !this.scene.state.game.fakeOnline ? 'bot' : 'online',
                fakeOnline: String(this.scene.state.game.fakeOnline),
                count: count + 1,
              });
              FAPI.Client.call({ method: 'storage.set', key: 'gameCount', value: String(count + 1) });
            }
          } else {
            this.scene.state.amplitude.track('done', {
              status: gameStatus,
              mode: this.scene.state.game.AI && !this.scene.state.game.fakeOnline ? 'bot' : 'online',
              fakeOnline: String(this.scene.state.game.fakeOnline),
              count: 1,
            });
            FAPI.Client.call({ method: 'storage.set', key: 'gameCount', value: String(1) });
          }
        });
      } else {
        const checkCount = localStorage.getItem('gameCount');
        const count = isNaN(Number(checkCount)) ? 0 : Number(checkCount);
        this.scene.state.amplitude.track('done', {
          status: gameStatus,
          mode: this.scene.state.game.AI && !this.scene.state.game.fakeOnline ? 'bot' : 'online',
          fakeOnline: String(this.scene.state.game.fakeOnline),
          count: count + 1,
        });
        localStorage.setItem('gameCount', String(count + 1));
      }
    }
  }


  private saveTutorial(): void {
    if (this.scene.state.tutorial !== 10) {
      this.scene.state.tutorial = 10;
      this.scene.state.amplitude.track('tutorial', { step: 60 });
      if (this.scene.state.platform === platforms.VK) {
        bridge.send('VKWebAppStorageSet', { key: 'tutorial', value: '10' });
      } else if (this.scene.state.platform === platforms.YANDEX) {
        if (!this.scene.state.yaPlayer) return;
        this.scene.state.yaPlayer.getData().then(data => {
          const result: IstorageData = {
            tutorial: 10,
            play: data.play || false,
            points: data.points || 0,
            gameCount: data.gameCount || 0,
          };
          this.scene.state.yaPlayer.setData(result, true);
        });
      } else if (this.scene.state.platform === platforms.OK) {
        FAPI.Client.call({ method: 'storage.set', key: 'tutorial', value: '10' });
      } else {
        localStorage.setItem('tutorial', '10');
      }
    }
  }

}