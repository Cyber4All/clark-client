export interface Config {
  color1: string;
  color2: string;
  accentColor: string;
  squareWidth: number;
  accentDots: number;
}

const defaultConfig: Config = {
  color1: '#FDFDFD',
  color2: '#FAFAFA',
  accentColor: '#1c70dd',
  squareWidth: 90,
  accentDots: 10
}

let canvas: HTMLCanvasElement;
let context: any;


/****************************/
/***** HELPER FUNCTIONS *****/
/****************************/

/**
 * Draws a single row of the grid
 * @param { Config } config a configuration object containing the config for the grid system
 * @param { number } row a number representing the row to draw
 * @param { boolean } isAlternateRow a boolean that's true if this row is even, false otherwise
 * @param { number } canvasWidth the width of the canvas
 */
function drawRow(config: Config, row: number, isAlternateRow = false, canvasWidth: number = canvas.offsetWidth) {
  let offset = 0;
  let column = 0;

  while (offset < canvasWidth) {
    // true if we should use the lighter color, false to use the darker color
    const useLight = getSquareColor(column, isAlternateRow);

    if (useLight) {
      // render new content on top of existing content with shadow
      context.globalCompositeOperation = 'source-over';
      context.shadowColor = 'rgba(0, 0, 0, 0.05)';
      context.shadowBlur = 10;
    } else {
      // render new content underneath existing content without shadow
      context.globalCompositeOperation = 'destination-over';
      context.shadowColor = 'rgba(0, 0, 0, 0)';
      context.shadowBlur = 0;
    }

    context.beginPath();
    context.rect(offset, config.squareWidth * (row), config.squareWidth, config.squareWidth);
    context.fillStyle = useLight ? config.color1 : config.color2;
    context.fill();
    context.closePath();

    offset += config.squareWidth;
    column++;
  }
}

/**
 * Draw's a single accent square of a random size and location
 * @param { string } color the color to render the square
 * @param { number } canvasWidth the width of the canvas
 */
function drawAccentSquare(color: string, canvasWidth: number = canvas.offsetWidth) {
  context.globalCompositeOperation = 'source-over';
  // generate a random size between 20px and 60px
  const size = Math.floor(Math.random() * (60 - 20 + 1) + 20);
  // generate a random x where the entire square will be on-screen and the origin will be in the right half of the canvas
  // (max - min + 1) + min = (canvasWidth - (canvasWidth / 2) + 1) + canvasWidth / 2
  const x = Math.floor(Math.random() * ((canvasWidth - size) - ((canvasWidth - size) / 2) + 1) + (canvasWidth - size) / 2);
  // generate a random y where the entire square will be on-screen
  const y = Math.floor(Math.random() * (canvas.offsetHeight - size));

  // start a new path for each square we draw
  context.beginPath();
  context.rect(x, y, size, size)
  context.fillStyle = color;
  // the min/max values here are different (smaller and larger respectively) so that no square is exactly transparent or exactly opaque
  context.globalAlpha = Math.max((norm(x, (canvasWidth - size) / 2.5, canvasWidth - size + 100)), 0);
  context.fill();
  context.closePath();
}

/**
 * The main function, draws the grid with accent squares
 * @param { Config } config a configuration object containing the config for the grid system
 */
function drawGrid(config: Config = defaultConfig) {
  canvas = document.querySelector('.details-splash canvas');
  context = canvas.getContext('2d');

  // set canvas width to 100%
  canvas.setAttribute('width', window.innerWidth.toString());

  let offset = 0;
  let row = 0;

  while (offset < canvas.offsetHeight) {
    drawRow(config, row, row % 2 === 1)
    row++;
    offset += config.squareWidth;
  }

  for (let i = 0; i < config.accentDots; i++) {
    drawAccentSquare(config.accentColor);
  }
}

/**
 * Dictates whether a square should be the dark or light value
 * @param { number } column a number representing the column of the target square
 * @param { boolean } isAlternateRow true if this is an odd row, false otherwise
 * @returns { boolean } True if square should be light, false otherwise
 */
function getSquareColor(column: number, isAlternateRow = false): boolean {
  let bool: boolean = column % 2 === 1 ? true : false;

  if (isAlternateRow) {
    bool = !bool;
  }

  return !bool;
}

/**
 * Normalizes a value between min and max to a value between 0 and 1
 * @param { number } val the value to normalize
 * @param { number } min the minumum value of the original range
 * @param { number } max the maximum value of the original range
 */
function norm(val: number, min: number, max: number) {
  // copied from https://stackoverflow.com/a/39776893/1855134
  return (val - min) / (max - min);
}

export const Grid = { drawGrid };
