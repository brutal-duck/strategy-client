import platform = require('platform');

export default class Utils {
  public static isVerticalOrientation: () => boolean = () => {
    const { clientHeight, clientWidth } = document.body;
    return clientHeight > clientWidth;
  }

  public static isMobilePlatform: () => boolean = () => {
    return platform.os.family === 'Android' 
    || platform.os.family === 'iOS' 
    || platform.os.family === 'Windows Phone';
  }
};
