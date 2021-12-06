import * as openSocket from 'socket.io-client';
export default class Socket implements Isocket {

  public io: openSocket;
  public state: Istate;
  public win: boolean;
  public loose: boolean;
  public draw: boolean;
  public reason: string;
  public points: number;
  
  constructor(state: Istate) {
    this.state = state;
    this.init();
  }
  
  public init(): void {
    this.io = openSocket(process.env.API);

    this.io.on('connect', () => {
      console.log('connect');
      if (this.state.game.isStarted && !this.state.game.AI) {
        this.loose = true;
      }
    });

    this.io.on('gameStart', (data: IstartGameData) => {
      console.log('gameStart');
      this.state.player.color = data.player.color;
      this.state.enemy = data.enemy;
      this.state.game.seed = data.seed;
      this.state.startGame = true;
      this.clearState();
    });

    this.io.on('winGame', ({ reason, points }: IendGameData) => {
      console.log('win!');
      this.win = true;
      this.reason = reason;
      this.points = points;
    });

    this.io.on('looseGame', ({ reason }: IendGameData) => {
      console.log('loose!');
      this.reason = reason;
      this.loose = true;
    });

    this.io.on('drawGame', () => {
      console.log('draw!');
      this.draw = true;
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
      name: this.state.player.name,
    });
  }

  public hexClick(hexId: string): void {
    console.log(hexId);
    this.io.emit('clickHex', {
      userId: this.state.player.id,
      id: hexId,
    });
  }

  public clearState(): void {
    this.win = false;
    this.loose = false;
    this.draw = false;
  }
}