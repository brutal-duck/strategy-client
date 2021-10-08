const config: Iconfig = {
  name: '',
  hexes: 10,
  superHex: 1,
  hexProductionSpeed: 50000,
  clameTime: 2000,
  superReclameTime: 4000,
  matchTime: 10 * 60000
}

type colorTypes = {
  main: number
  mainStr: string
  light: number
  lightStr: string
}

const colors: { green: colorTypes, red: colorTypes} = {
  green: {
    main: 0x67eb7a,
    mainStr: '#67eb7a',
    light: 0x95ffa4,
    lightStr: '#95ffa4'
  },
  red: {
    main: 0xedc95b,
    mainStr: '#edc95b',
    light: 0xffe595,
    lightStr: '#ffe595'
  }
}

export { config, colors }