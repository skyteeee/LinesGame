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
    this.gfx.interactive = true;

    let easyButton = {x: this.game.width*0.25, y: this.headerText.y+this.headerText.height*2, w: this.game.width*0.4, h: this.game.width*0.1};
    this.easygfx = new PIXI.Graphics();
    this.easygfx.beginFill(0xeaeae4);
    this.easygfx.drawRect(easyButton.x, easyButton.y, easyButton.w, easyButton.h);
    this.easygfx.endFill();
    this.easygfx.interactive=true;
    this.easygfx.on('pointerdown', () => {
      this.game.mode = 'easy';
      this.game.scoreToLevelUp = 20;
      this.game.toLvlUpDelta = 75;
      this.beginGame();
    });
    this.easygfx.zIndex = 100;
    this.easyText = new PIXI.Text('Play Beginner',
      new PIXI.TextStyle({
        fontFamily: 'MainFont',
        fontSize: this.headerText.height*0.2,
        fontWeight: 'bold',
        fill: ['#93f3ff', '#33b7ff'],
        stroke: '#ffffff',
        strokeThickness: 1
      }));
    this.easyText.zIndex = 101;
    this.easyText.x = easyButton.w/2+easyButton.x-this.easyText.width/2;
    this.easyText.y = easyButton.y+easyButton.h/2-this.easyText.height/2;

    let hardButton = {x: this.game.width*0.25, y: this.easyText.y + this.easyText.height*2, w: this.game.width*0.4, h: this.game.width*0.1};
    this.hardgfx = new PIXI.Graphics();
    this.hardgfx.beginFill(0xeaeae4);
    this.hardgfx.drawRect(hardButton.x, hardButton.y, hardButton.w, hardButton.h);
    this.hardgfx.endFill();
    this.hardgfx.interactive = true;
    this.hardgfx.on('pointerdown', () => {
      this.game.mode = 'hard';
      this.beginGame();
    });

    this.hardText = new PIXI.Text('Play Pro', new PIXI.TextStyle({
      fontFamily: 'MainFont',
      fontSize: this.headerText.height*0.2,
      fontWeight: 'bold',
      fill: ['#ff98f4', '#640064'],
      stroke: '#ffffff',
      strokeThickness: 1
    }));
    this.hardText.x = hardButton.w/2+hardButton.x-this.hardText.width/2;
    this.hardText.y = hardButton.y+hardButton.h/2-this.easyText.height/2;

    this.easyLeaderGfx = new PIXI.Graphics();
    this.easyLeaderGfx.beginFill(0xeaeae4);
    this.easyLeaderGfx.drawRect(easyButton.x + easyButton.w + easyButton.h/2, easyButton.y, easyButton.h, easyButton.h);
    this.easyLeaderGfx.endFill();
    this.easyLeaderGfx.interactive = true;
    this.easyLeaderGfx.on('pointerdown', () => {
      this.game.getLeaderBoard('easy');
    });
    this.easyLeaderGfx.zIndex = 100;
    this.easyCrownSprite = new PIXI.Sprite(this.game.tex.ballOverlay.leaderCrown);
    this.easyCrownSprite.scale.set(this.easyCrownSprite.height/easyButton.h*0.5);
    this.easyCrownSprite.x = easyButton.x + easyButton.w + easyButton.h/2 + easyButton.h/2 - this.easyCrownSprite.width/2;
    this.easyCrownSprite.y = easyButton.y + easyButton.h/2 - this.easyCrownSprite.height/2;
    this.easyCrownSprite.zIndex = 150;

    this.hardLeaderGfx = new PIXI.Graphics();
    this.hardLeaderGfx.beginFill(0xeaeae4);
    this.hardLeaderGfx.drawRect(hardButton.x + hardButton.w + hardButton.h/2, hardButton.y, hardButton.h, hardButton.h);
    this.hardLeaderGfx.endFill();
    this.hardLeaderGfx.interactive = true;
    this.hardLeaderGfx.on('pointerdown', () => {
      this.game.getLeaderBoard('hard');
    });
    this.hardLeaderGfx.zIndex = 100;
    this.hardCrownSprite = new PIXI.Sprite(this.game.tex.ballOverlay.leaderCrown);
    this.hardCrownSprite.scale.set(this.hardCrownSprite.height/hardButton.h*0.5);
    this.hardCrownSprite.x = hardButton.x + hardButton.w + hardButton.h/2 + hardButton.h/2 - this.hardCrownSprite.width/2;
    this.hardCrownSprite.y = hardButton.y + hardButton.h/2 - this.hardCrownSprite.height/2;
    this.hardCrownSprite.zIndex = 150;

    this.cont.x = 0;
    this.cont.y = 0;

    this.cont.addChild(this.gfx, this.headerText, this.easygfx, this.easyText, this.easyLeaderGfx, this.hardgfx, this.hardText, this.hardLeaderGfx);
    this.cont.addChild(this.easyCrownSprite, this.hardCrownSprite)

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
