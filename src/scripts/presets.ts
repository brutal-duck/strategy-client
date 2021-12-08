const topLeft: string[][][] = [
  [
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,'spawn',''     ,'x1'   ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,'x1'   ,''     ,''     ,'rock' ,'rock' ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,'water','water'],
  ],
  [
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water',''     ,''     ,''     ,''     ,'water','water'],
    ['water','water',''     ,''     ,''     ,'x1'   ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,'x1'   ,''     ,''     ,''     ,'spawn',''     ],
    ['water','water',''     ,''     ,'rock' ,'rock' ,''     ,''     ,''     ],
  ],
];

const bottomLeft: string[][][] = [
  [
    ['water','water',''     ,'rock' ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,'rock' ],
    ['water','water',''     ,''     ,'spawn',''     ,''     ,'water','rock' ],
    ['water','water','x1'   ,''     ,''     ,''     ,''     ,''     ,'rock' ],
    ['water','water',''     ,''     ,'x1'   ,''     ,''     ,''     ,''     ],
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
  ],
  [
    ['water','water','water',''     ,''     ,'x1'   ,''     ,''     ,''     ],
    ['water','water','water',''     ,''     ,''     ,''     ,'spawn',''     ],
    ['water','water','water',''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water','water','water',''     ,''     ,''     ,'x1'   ,''     ],
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
  ],
];

const vertical: string[][][] = [
  [
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,'x1'   ,''     ,'spawn',''     ,'x1'   ,''     ,'water'],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,'rock' ,'rock' ,'rock' ,'rock' ,''     ,''     ,'water'],
  ],
  [
    ['water','water','water','water','water','water','water','water','water'],
    ['water','water','water','water','water','water','water','water','water'],
    ['super','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,'water',''     ,''     ,''     ,''     ,''     ,''     ,'x1'   ],
    [''     ,'water','water',''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,''     ,''     ,'x1'   ,''     ,''     ,'spawn',''     ],
    ['rock' ,'rock' ,'rock' ,''     ,''     ,''     ,''     ,''     ,''     ],
  ],
];

const horizontal: string[][][] = [
  [
    ['water','water','water',''     ,''     ,'water','water',''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,'x1'   ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,'spawn',''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,'x1'   ,''     ,''     ],
    ['water','water','water',''     ,''     ,'water','water',''     ,''     ],
  ],
  [
    ['water','water','rock' ,'rock' ,''     ,''     ,''     ,'water','water'],
    ['water','water','rock' ,''     ,''     ,''     ,''     ,''     ,'water'],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,'water'],
    ['water','water','x1'   ,''     ,''     ,'spawn',''     ,'x1'   ,'water'],
    ['water','water',''     ,''     ,''     ,''     ,''     ,''     ,'water'],
    ['water','water','rock' ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water','rock' ,'rock' ,''     ,''     ,''     ,'water','water'],
  ],
];

const center: string[][][] = [
  [
    ['super',''     ,''     ,''     ,''     ,''     ,'water','water',''     ],
    [''     ,'rock' ,''     ,''     ,''     ,''     ,''     ,'water','water'],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,''     ,''     ,'x3'   ,''     ,''     ,''     ,''     ],
    ['water',''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['water','water',''     ,''     ,''     ,''     ,''     ,'rock' ,''     ],
    [''     ,'water',''     ,''     ,''     ,''     ,''     ,''     ,'super'],
  ],
  [
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,'rock' ],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    [''     ,''     ,'rock' ,'rock' ,'x3'   ,'rock' ,'rock' ,''     ,''     ],
    [''     ,''     ,'super',''     ,''     ,''     ,'super',''     ,''     ],
    [''     ,''     ,'rock' ,'rock' ,''     ,'rock' ,'rock' ,''     ,''     ],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['rock' ,''     ,''     ,''     ,''     ,''     ,''     ,''     ,''     ],
  ],
  [
    ['rock' ,'rock' ,'water',''     ,'water',''     ,''     ,''     ,'water'],
    ['rock' ,'rock' ,''     ,''     ,''     ,'water',''     ,''     ,''     ],
    ['rock' ,'super',''     ,''     ,''     ,''     ,''     ,''     ,''     ],
    ['rock' ,''     ,''     ,''     ,'x3'   ,''     ,''     ,''     ,'rock' ],
    [''     ,''     ,''     ,''     ,''     ,''     ,''     ,'super','rock' ],
    [''     ,''     ,''     ,'water',''     ,''     ,''     ,'rock' ,'rock' ],
    ['water',''     ,''     ,''     ,'water',''     ,'water','rock' ,'rock' ],
  ],
];

const topLeftTutorial: string[][] = [
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
];

const bottomLeftTutorial: string[][] = [
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
];

const verticalTutorial: string[][] = [
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
];

const horizontalTutorial: string[][] = [
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
  ['water','water','water','water','water','water','water','water','water'],
];

const centerTutorial: string[][] = [
  ['','',''     ,'','','','','',''],
  ['','',''     ,'','','','','',''],
  ['','',''     ,'','','','','',''],
  ['','','base','','','base','','',''],
  ['','',''     ,'','','','','',''],
  ['','',''     ,'','','','','',''],
  ['','',''     ,'','','','','',''],
];

const tutorialPresets: string[][][] = [
  topLeftTutorial,
  bottomLeftTutorial,
  verticalTutorial,
  horizontalTutorial,
  centerTutorial,
];
export {
  topLeft,
  bottomLeft,
  vertical,
  horizontal,
  center,
  tutorialPresets,
};