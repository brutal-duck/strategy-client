interface Istate {
  player: Iplayer
  game: IGame
  platform: string
  socket: Isocket
  startGame: boolean
  socketWin?: boolean
  socketLoose?: boolean
}
interface Isocket {
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
  AI: boolean
  seed: string
  hexes: any[]
  updateHex: boolean
  player: IsocketPlayer
  serverGameTime: number
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