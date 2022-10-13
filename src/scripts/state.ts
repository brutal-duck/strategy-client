let state: Istate = {
  tutorial: 0,
  player: {
    name: 'player1',
    color: '',
    id: 0,
    points: 0,
  },
  game: {
    seed: '',
    hexes: [],
    updateHex: true,
    serverGameTime: 0,
    player: null,
    isStarted: false,
    AI: '',
    fakeOnline: false,
  },
  platform: '',
  socket: null,
  startGame: false,
  lang: null
};

export default state;
