import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";

export class NewGameScreen {
  constructor(game) {
    this.game = game;
    this.cont = new PIXI.Container();
    this.headerText = new PIXI.Text('Choose Difficulty',
      new PIXI.TextStyle({
        fontFamily: 'MainFont',
        fontSize: Math.ceil(game.width*0.075),
        fontWeight: 'bold',
        fill: ['#8dff83','#14a800'],
        stroke: '#ffffff',
        strokeThickness: 1
      }));
    this.headerText.x = this.game.width/2-this.headerText.width/2;
    this.headerText.y = this.game.height/4-this.headerText.height/2;

    this.gfx = new PIXI.Graphics();
    this.gfx.beginFill(0, 0.5);
    this.gfx.drawRect(0, 0, this.game.width, this.game.height);
    this.gfx.endFill();

    this.easygfx = new PIXI.Graphics();
    this.easygfx.beginFill(0xeaeae4);
    this.easygfx.drawRect(this.game.width*0.3, this.headerText.y+this.headerText.height*2, this.game.width*0.4, this.game.width*0.1);
    this.easygfx.endFill();
    this.easygfx.interactive=true;
    this.easygfx.on('pointerdown', () => {
      this.game.mode = 'easy';
      this.game.scoreToLevelUp = 20;
      this.game.toLvlUpDelta = 75;
      this.beginGame();
    });
    this.easygfx.zIndex = 100;
    this.easyText = new PIXI.Text('Beginner',
      new PIXI.TextStyle({
        fontFamily: 'MainFont',
        fontSize: this.headerText.height*0.25,
        fontWeight: 'bold',
        fill: ['#93f3ff', '#33b7ff'],
        stroke: '#ffffff',
        strokeThickness: 1
      }));
    this.easyText.zIndex = 101;
    this.easyText.x = this.game.width/2-this.easyText.width/2;
    this.easyText.y = this.headerText.y+this.headerText.height*2;

    this.hardgfx = new PIXI.Graphics();
    this.hardgfx.beginFill(0xeaeae4);
    this.hardgfx.drawRect(this.game.width*0.3, this.easyText.y+this.easyText.height*2, this.game.width*0.4, this.game.width*0.1);
    this.hardgfx.endFill();
    this.hardgfx.interactive = true;
    this.hardgfx.on('pointerdown', () => {
      this.game.mode = 'hard';
      this.beginGame();
    });

    this.hardText = new PIXI.Text('Pro', new PIXI.TextStyle({
      fontFamily: 'MainFont',
      fontSize: this.headerText.height*0.25,
      fontWeight: 'bold',
      fill: ['#ff98f4', '#640064'],
      stroke: '#ffffff',
      strokeThickness: 1
    }));
    this.hardText.x = this.game.width/2-this.hardText.width/2;
    this.hardText.y = this.easyText.y+this.easyText.height*2;

    this.cont.x = 0;
    this.cont.y = 0;

    this.cont.addChild(this.gfx, this.headerText, this.easygfx, this.easyText, this.hardgfx, this.hardText);

  }

  show () {
    this.game.app.stage.addChild(this.cont);
    this.cont.alpha = 0;
    let animation = new TWEEN.Tween(this.cont).to({alpha:1}, 300).start()
  }

  beginGame() {
    this.game.newSession();
    let animation = new TWEEN.Tween(this.cont).to({alpha: 0}, 300).onComplete(() => {
      this.game.app.stage.removeChild(this.cont);
    }).start();
  }

}
