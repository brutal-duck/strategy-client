interface Istate {
  player: Iplayer
  platform: string
}
interface Iplayer {
  vk_id?: string
  ok_id?: string
  id: string
}
interface Isize {
  width: number
  height: number
}