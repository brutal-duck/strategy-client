import * as openSocket from 'socket.io-client';

export default class Socket {

  public io: openSocket;
  public state: Istate;
  
  constructor(state: Istate) {
    this.state = state;
    this.init();
  }
  
  public init(): void {
    this.io = openSocket(process.env.API, { query: `id=${this.state.player.id}`});

    this.io.on('connect', () => {
      console.log('connect');
    });
    this.io.on('gameStart', data => {
      console.log('gameStart');
      console.log(data);
      this.state.startGame = true;
    });
    this.io.on('leaveGame', () => {
      console.log('зашел с таким же айди в другом браузере');
      this.io.emit('disconnecting');
    });
    this.io.on('test_event', data => {
      console.log(data);
    });
  }
}