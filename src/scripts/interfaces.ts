interface Istate {
  player: Iplayer
  game: IGame
  platform: string
}
interface Iplayer {
  color: string
  vk_id?: string
  ok_id?: string
  id: string
}
interface IGame {
  AI: boolean
}
interface Iconfig {
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