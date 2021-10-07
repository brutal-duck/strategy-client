const config: Iconfig = {
  name: '',
  hexes: 10,
  superHex: 1,
  hexProductionSpeed: 50000,
  clameTime: 2000,
  superReclameTime: 4000,
  matchTime: 1 * 60000
}

type colorTypes = {
  main: number
  mainStr: string
  light: number
  lightStr: string
}

const color: { green: colorTypes, red: colorTypes} = {
  green: {
    main: 0x8fe06b,
    mainStr: '#8fe06b',
    light: 0x95ffa4,
    lightStr: '#95ffa4'
  },
  red: {
    main: 0xe4b742,
    mainStr: '#e4b742',
    light: 0xffe595,
    lightStr: '#ffe595'
  }
}

export { config, color }