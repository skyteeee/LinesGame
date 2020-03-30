function init () {
  game.init();
  game.draw();

}

class Cell {
  constructor(x, y) {
  this.x = x;
  this.y = y;
  }

}


class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.height = 0;
    this.width = 0;
    this.fieldHeight = 10;
    this.fieldWidth = 10;
    this.field = [];
    for (let y = 0; y < this.fieldHeight; y ++) {
      let row = [];
      for (let x = 0; x < this.fieldWidth; x++) {
        row.push(new Cell(x, y));
      }
      this.field.push(row);

    }
  }

  init () {
    this.canvas = document.getElementById('field');
    this.ctx = this.canvas.getContext('2d');
    this.height = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;


  }

  draw () {
    let numRec = 370;
    let border = 30;
    let gap = 0;
    let h = (this.height - border*2) / numRec - gap;
    for (let number = 0; number < numRec; number++) {
      let y = number * (h+gap) + border;
      let r = 25 / numRec * (numRec - number);
      let g = 255 / numRec * (numRec - number);
      let b = 100 / numRec * (numRec - number);
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillRect(200, y , 400, h);
    }
  }

}

let game = new Game();
