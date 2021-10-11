import * as openSocket from 'socket.io-client';

export default class Socket {

  public io: openSocket;
  public state: Istate;
  
  constructor(state: Istate) {
    this.state = state;
    this.init();
  }
  
  public init(): void {
    this.io = openSocket(process.env.API);

    this.io.on('connect', () => {
      console.log('connect');
    });

    this.io.on('gameStart', data => {
      console.log('gameStart');
      console.log(data);
      this.state.player.color = data.player.color;
      this.state.game.seed = data.seed;
      this.state.startGame = true;
    });

    this.io.on('winGame', () => {
      console.log('win!');
      this.state.socketWin = true;
    });

    this.io.on('looseGame', () => {
      console.log('loose!');
      this.state.socketLoose = true;
    });
  }

  public closeSocket(): void {
    this.io.emit('closeGame');
  }

  public findGame(): void {
    this.io.emit('findGame', {
      id: this.state.player.id,
    });
  }
}