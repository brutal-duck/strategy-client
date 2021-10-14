interface Istate {
  player: Iplayer
  game: IGame
  platform: string
  startGame: boolean
  socket: Isocket
}
interface Isocket {
  win: boolean
  loose: boolean
  reason: string
  init: () => void;
  closeSocket: () => void;
  findGame: () => void;
  hexClick: (hexId: string) => void;
}
interface Iplayer {
  name: string
  color: string
  vk_id?: string
  ok_id?: string
  poinst?: number
  wins?: number
  id: string
}
interface  IsocketPlayer {
  color: string
  hexes: number
  superHexes: number
  id: string
}
interface IGame {
  seed: string
  hexes: any[]
  updateHex: boolean
  player: IsocketPlayer
  serverGameTime: number
  isStarted: boolean
  AI: string
}
interface Iconfig {
  name: string
  hexes: number
  superHex: number
  hexProductionSpeed: number
  clameTime: number
  superReclameTime: number
  matchTime: number
}
interface Isize {
  width: number
  height: number
}

interface IuserData {
  id: string;
  poinst: number;
  wins: number;
}