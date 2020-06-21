import * as PIXI from 'pixi.js';
import {Ball} from "./ball";

export class Base {
  constructor() {
    this.score = 0;
    this.app = null;
    this.height = 0;
    this.width = 0;
    this.rank = 999;
    this.cnt = {};
    this.fieldHeight = 8;
    this.fieldWidth = 8;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
  }

  createFieldGraphics(gfx) {
    gfx.clear();

    let gameHeight = this.height - this.hudHeight;
    gfx.beginFill(0xeaeae4);
    gfx.drawRect(0, 0, this.width, gameHeight);
    gfx.endFill();

    for (let x = 0; x < this.width; x += this.cellWidth) {
      for (let y = 0; y < gameHeight; y += this.cellHeight) {
        gfx.lineStyle(1, 0xfafffb);

        gfx.moveTo(x + this.cellWidth - 2, y);
        gfx.lineTo(x, y);
        gfx.lineTo(x, y + this.cellHeight - 1);

        gfx.lineStyle(1, 0xc8cdc9);

        gfx.lineTo(x + this.cellWidth - 1, y + this.cellHeight - 1);
        gfx.lineTo(x + this.cellWidth - 1, y - 1);
      }
    }

    return gfx;
  }

  initEngine() {
    let div = document.getElementById('fieldHolder');
    let versionElem = document.getElementById('version');
    this.version = versionElem.innerText.split(' ')[0];
    this.height = div.offsetHeight;
    this.width = div.offsetWidth;
    this.hudHeight = this.height - this.width; // field is a square. Using width to find the rest.
    this.cellHeight = (this.height - this.hudHeight) / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;

    this.app = new PIXI.Application({
      width: this.width, height: this.height,
      antialias: true, backgroundColor: 0xeaeae4, resolution: window.devicePixelRatio || 1
    });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

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

    this.graphics = new PIXI.Graphics();
    this.graphics = this.createFieldGraphics(this.graphics);
    this.graphics.interactive = true;
    this.graphics.on('pointerdown', (event) => {
      let pressCoord = this.graphics.toLocal(event.data.global);

      this.onClick(pressCoord.x, pressCoord.y);
    });
    this.cellGraphics = new PIXI.Graphics();
    this.cnt.background.addChild(this.graphics);
    this.cnt.background.addChild(this.cellGraphics);

    this.app.loader.add('img/images2.json')
      .add('fonts/mainfont2.xml')
      .load(() => {
        this.setupResources()
      });
    Ball.initFilters(this.cellWidth);
  }

  onClick(x, y) {

  }

  setupResources() {
    let div = document.getElementById('fieldHolder');
    div.appendChild(this.app.view);
    this.tex = {allImg: this.app.loader.resources['img/images2.json'].textures};
    this.tex.ballImg = [
      this.tex.allImg['ball_red.png'],
      this.tex.allImg['ball_orange.png'],
      this.tex.allImg['ball_yellow.png'],
      this.tex.allImg['ball_green.png'],
      this.tex.allImg['ball_lblue.png'],
      this.tex.allImg['ball_blue.png'],
      this.tex.allImg['ball_violet.png'],
    ];
    this.tex.ballOverlay = {
      particleBall: this.tex.allImg['particle_ball.png'],
      x3: this.tex.allImg['overlay_x3.png'],
      denied: this.tex.allImg['close.png'],
      contract: this.tex.allImg['overlay_contract.png'],
      expand: this.tex.allImg['overlay_expand.png'],
      rainbow: this.tex.allImg['ball_rainbow.png'],
      superBomb: this.tex.allImg['ball_superbomb.png']
    };

    this.tex.double = {};
    this.tex.double.top = [
      this.tex.allImg['thalf_ball_red.png'],
      this.tex.allImg['thalf_ball_orange.png'],
      this.tex.allImg['thalf_ball_yellow.png'],
      this.tex.allImg['thalf_ball_green.png'],
      this.tex.allImg['thalf_ball_lblue.png'],
      this.tex.allImg['thalf_ball_blue.png'],
      this.tex.allImg['thalf_ball_violet.png'],
    ];

    this.tex.double.bottom = [
      this.tex.allImg['bhalf_ball_red.png'],
      this.tex.allImg['bhalf_ball_orange.png'],
      this.tex.allImg['bhalf_ball_yellow.png'],
      this.tex.allImg['bhalf_ball_green.png'],
      this.tex.allImg['bhalf_ball_lblue.png'],
      this.tex.allImg['bhalf_ball_blue.png'],
      this.tex.allImg['bhalf_ball_violet.png'],
    ];

    this.tex.colorWaveTex = [
      this.tex.allImg['diamond_red.png'],
      this.tex.allImg['diamond_orange.png'],
      this.tex.allImg['diamond_yellow.png'],
      this.tex.allImg['diamond_green.png'],
      this.tex.allImg['diamond_lblue.png'],
      this.tex.allImg['diamond_blue.png'],
      this.tex.allImg['diamond_violet.png']
    ];

  }

  sendData(url, data2Send, callback) {
    fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2Send)
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data && data.success) {
          callback(data);
        }
      })
      .catch(error => {
        console.error('Failed to send request. ', error);
      })
  }

  endSession (name = 'Anonymous Player') {
    this.sendData('https://lines.navalclash.com/session/finish',
      {
        version: this.version,
        uuid:this.sessionID,
        score: Math.round(this.score),
        level: this.level,
        mode: this.mode,
        user: name
    }, data => {
      this.getLeaderBoard(this.mode);
      this.rank = data.data.rank;
      this.gameOver.updateSmallText();
      console.log('Finished session with data ', data.data);
      })
  }

  getLeaderBoard (mode = 'easy', amount = 10) {
    this.sendData('https://lines.navalclash.com/scores/top', {
      version: this.version,
      mode: mode,
      limit: amount,
      app: 'lines'
    }, data => {
      this.leaderboard = data.data;
      console.log('Received top scores ', data.data);
    })
  }

  updateSession() {
    this.sendData('https://lines.navalclash.com/session/update',
      {
        version: this.version,
        uuid: this.sessionID,
        score: Math.round(this.score),
        level: this.level,
        mode: this.mode,
        user: window.localStorage.getItem('lines.savedName'),
        done: this.isGameOver ? 1 : 0
      }, data => {
        this.rank = data.data.rank;
        console.log('Received session update. ', data.data);
      })
  }

  newSession() {
    this.sendData('https://lines.navalclash.com/session', {version: this.version, app: 'lines'},
      data => {
        this.sessionID = data.data.uuid;
        console.log('Received UUID ', this.sessionID);
      });
  }

}
