import * as PIXI from 'pixi.js';


export class Base {
  constructor() {
    this.app = null;
    this.height = 0;
    this.width = 0;
    this.cnt = {};
    this.fieldHeight = 8;
    this.fieldWidth = 8;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
  }

  createFieldGraphics() {
    let gameHeight = this.height-this.hudHeight;
    let gfx = new PIXI.Graphics();
    gfx.beginFill(0xe4e4e4);
    gfx.drawRect(0,0, this.width, gameHeight);
    gfx.endFill();


    for (let x=0; x<this.width; x+=this.cellWidth) {
      for (let y = 0; y<gameHeight; y+=this.cellHeight){
        gfx.lineStyle(1, 0xfafffb);

        gfx.moveTo(x+this.cellWidth-2,y);
        gfx.lineTo(x,y);
        gfx.lineTo(x,y+this.cellHeight-1);

        gfx.lineStyle(1, 0xc8cdc9);

        gfx.lineTo(x+this.cellWidth-1, y+this.cellHeight-1);
        gfx.lineTo(x+this.cellWidth-1, y-1);
      }
    }

    return gfx;
  }

  initEngine() {
    let div = document.getElementById('fieldHolder');
    this.height = div.offsetHeight;
    this.width = div.offsetWidth;
    this.hudHeight = this.height-this.width; // field is a square. Using width to find the rest.
    this.cellHeight = (this.height-this.hudHeight) / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;

    this.app = new PIXI.Application({width:this.width, height:this.height,
      antialias:true, backgroundColor:0xe4e400, resolution: window.devicePixelRatio || 1});
    div.appendChild(this.app.view);

    this.cnt.HUD = new PIXI.Container();
    this.cnt.field = new PIXI.Container();
    this.cnt.background = new PIXI.Container();
    this.cnt.game = new PIXI.Container();

    this.app.stage.addChild(this.cnt.HUD);
    this.app.stage.addChild(this.cnt.field);
    this.cnt.field.addChild(this.cnt.background);
    this.cnt.field.addChild(this.cnt.game);

    this.cnt.game.sortableChildren = true;
    this.cnt.field.y = this.hudHeight;

    let graphics = this.createFieldGraphics();
    this.cnt.background.addChild(graphics);

    this.app.loader.add('img/images2.json').load(() => {this.setupResources()})
  }

  setupResources () {
    this.tex = {allImg:this.app.loader.resources['img/images2.json'].textures};
    this.tex.ballImg = [
    this.tex.allImg['ball_red.png'],
    this.tex.allImg['ball_orange.png'],
    this.tex.allImg['ball_yellow.png'],
    this.tex.allImg['ball_green.png'],
    this.tex.allImg['ball_lblue.png'],
    this.tex.allImg['ball_blue.png'],
    this.tex.allImg['ball_violet.png'],
    ]
  }

}
