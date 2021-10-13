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
      if (this.state.game.isStarted) {
        this.state.socketLoose = true;
      }
    });

    this.io.on('gameStart', data => {
      console.log('gameStart');
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

    this.io.on('updateHex', (data) => {
      this.state.game.hexes = data.hexes;
      this.state.game.player = data.player;
      this.state.game.updateHex = true;
      this.state.game.serverGameTime = data.currentTime;
    });

    this.io.on('otherConnection', () => {
      alert('Other connection')
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