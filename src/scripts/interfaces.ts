interface Istate {
  player: Iplayer
  game: IGame
  platform: string
  socket: any
  startGame: boolean
}
interface Iplayer {
  name: string
  color: string
  vk_id?: string
  ok_id?: string
  poinst?: number;
  wins?: number;
  id: string
}
interface IGame {
  AI: boolean
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