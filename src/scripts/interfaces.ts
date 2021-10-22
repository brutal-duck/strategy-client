interface Istate {
  player: Iplayer
  enemy?: Ienemy
  game: IGame
  platform: string
  startGame: boolean
  socket: Isocket
}
interface Isocket {
  win: boolean
  loose: boolean
  draw: boolean
  reason: string
  init: () => void;
  closeSocket: () => void;
  findGame: () => void;
  hexClick: (hexId: string) => void;
  clearState: () => void;
}
interface Ienemy {
  id: string;
  name: string;
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
  hexes: IsocketHex[]
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
  vkId: number;
}

interface Iposition {
  x: number;
  y: number;
}

interface Igraph {
  [key: string] : Set<string>;
}
interface IcolorsBtnSettings {
  color: string;
  text: string;
  icon: boolean;
}

interface IendGameData {
  reason: string;
}

interface IupdateHexData {
  hexes: IsocketHex[];
  player: IsocketPlayer;
  currentTime: number;
}

interface IsocketHex {
  id: string;
  col: number;
  row: number;
  class: string;
  own: string;
  newOwn: string;
  super: boolean;
  resources: number;
  defence: number;
  newDefence: number;
}

interface IstartGameData {
  seed: string;
  player: IsocketPlayer
  enemy: Ienemy
}