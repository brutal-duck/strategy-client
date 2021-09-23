interface Istate {
  player: Iplayer
  platform: string
}
interface Iplayer {
  color: string
  vk_id?: string
  ok_id?: string
  id: string
}
interface Iconfig {
  hexes: number
  superHex: number
  hexProductionSpeed: number
  clameTime: number
  matchTime: number
}
interface Isize {
  width: number
  height: number
}