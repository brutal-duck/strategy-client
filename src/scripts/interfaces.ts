interface Istate {
  player: Iplayer;
  enemy?: Ienemy;
  game: IGame;
  platform: string;
  startGame: boolean;
  socket: Isocket;
  tutorial: number;
  amplitude?: Iamplitude;
  ysdk?: any;
  yaPlayer?: IyandexPlayer;
}
interface Iamplitude {
  setUserProperty: (property: string, data: string | number) => void;
  track: (event: string, data: { [key: string]: string | number }) => void;
  revenue: (pack: string, price: number, data: { [key: string]: string | number }, type?: string) => void;
}
interface IstorageData {
  tutorial: number;
  play: boolean;
  points: number;
  gameCount: number;
}
interface Isocket {
  win: boolean;
  loose: boolean;
  draw: boolean;
  reason: string;
  points: number;
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
  points: number
  wins?: number
  id: number | string;
}
interface IyandexPlayer {
  getUniqueID: () => string;
  getName: () => string;
  getPhoto: (size: 'small' | 'medium' | 'large') => string;
  setData: (data: IstorageData, flush: boolean) => Promise<void>;
  getData: (keys?: string[]) => Promise<IstorageData>;
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
  points?: number
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