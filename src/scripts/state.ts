let state: Istate = {
  player: {
    name: 'player1',
    color: '',
    vk_id: '',
    ok_id: '',
    id: '',
  },
  game: {
    AI: false,
    seed: '',
    hexes: [],
    updateHex: true,
    serverGameTime: 0,
    player: null,
    isStarted: false,
  },
  platform: '',
  socket: null,
  startGame: false,
};

export default state;
