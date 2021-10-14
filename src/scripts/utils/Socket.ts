import * as openSocket from 'socket.io-client';
interface IendGameData {
  reason: string;
}

interface IupdateHexData {
  hexes: IsocketHex[];
  player: IsocketPlayer;
  currentTime: number;
}

interface IsocketHex {
  id: string;
  col: number;
  row: number;
  class: string;
  own: string;
  newOwn: string;
  super: boolean;
  resources: number;
  defence: number;
  newDefence: number;
}

interface IstartGameData {
  seed: string;
  player: IsocketPlayer
}


export default class Socket {

  public io: openSocket;
  public state: Istate;
  public win: boolean;
  public loose: boolean;
  public reason: string;
  
  constructor(state: Istate) {
    this.state = state;
    this.init();
  }
  
  public init(): void {
    this.io = openSocket(process.env.API);

    this.io.on('connect', () => {
      console.log('connect');
      if (this.state.game.isStarted) {
        this.loose = true;
      }
    });

    this.io.on('gameStart', (data: IstartGameData) => {
      console.log('gameStart');
      this.state.player.color = data.player.color;
      this.state.game.seed = data.seed;
      this.state.startGame = true;
      this.win = false;
      this.loose = false;
    });

    this.io.on('winGame', ({ reason }: IendGameData) => {
      console.log('win!');
      this.win = true;
      this.reason = reason;
    });

    this.io.on('looseGame', ({ reason }: IendGameData) => {
      console.log('loose!');
      this.reason = reason;
      this.loose = true;
    });

    this.io.on('updateHex', (data: IupdateHexData) => {
      this.state.game.hexes = data.hexes;
      this.state.game.player = data.player;
      this.state.game.updateHex = true;
      this.state.game.serverGameTime = data.currentTime;
    });

    this.io.on('otherConnection', () => {
      alert('Other connection')
      window.location.reload();
    })
  }

  public closeSocket(): void {
    this.io.emit('closeGame');
  }

  public findGame(): void {
    this.io.emit('findGame', {
      id: this.state.player.id,
    });
  }

  public hexClick(hexId: string): void {
    console.log(hexId);
    this.io.emit('clickHex', {
      userId: this.state.player.id,
      id: hexId,
    });
  }
}