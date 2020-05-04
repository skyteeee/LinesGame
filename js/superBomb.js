import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";
import {xy2screen} from "./tools";

export const superBomb = 'superBomb';

export class SuperBomb extends Ball {

  constructor(x, y, cellHeight, cellWidth, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.pixelCoords = xy2screen(this.x, this.y, this);
    this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.superBomb);
    this.initParticles();
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
    for (let idx in this.game.possibleBallColors) {
      this.colors.add(parseInt(idx));
    }
  }

  initParticles () {
    this.particleCont = new PIXI.ParticleContainer(100);
    this.emitter = new particles.Emitter(this.particleCont, [this.game.tex.ballOverlay.particleBall],
      {
        "alpha": {
          "start": 0,
          "end": 1
        },
        "scale": {
          "start": 0.75,
          "end": 0.075,
          "minimumScaleMultiplier": 1
        },
        "color": {
          "start": "#bbbcbd",
          "end": "#000000"
        },
        "speed": {
          "start": 100,
          "end": 50,
          "minimumSpeedMultiplier": 1
        },
        "acceleration": {
          "x": 0,
          "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
          "min": 0,
          "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
          "min": 0,
          "max": 0
        },
        "lifetime": {
          "min": 0.00015 * this.cellWidth,
          "max": 0.0075 * this.cellWidth,
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 100,
        "pos": {
          "x": 0,
          "y": 0
        },
        "addAtBack": false,
        "spawnType": "point"
      });
    this.particleCont.x = 0;
    this.particleCont.y = 0;
    this.emitter.updateOwnerPos(this.pixelCoords.pX, this.pixelCoords.pY);
    this.game.cnt.game.addChild(this.particleCont);
  }

  selected() {
    super.selected();
    let position = {x: this.pixelCoords.pX, y:this.pixelCoords.pY};
    let topPos = {x:this.pixelCoords.pX, y: this.pixelCoords.pY-this.cellHeight*0.25};
    let particleGoUp = new TWEEN.Tween(position).to({y: this.pixelCoords.pY - this.game.cellHeight/4}, 500)
      .onUpdate((object) => {
      this.emitter.updateOwnerPos(object.x, object.y);
    });
    let particleGoDown = new TWEEN.Tween(topPos).to({y:this.pixelCoords.pY}, 300).onUpdate((object) => {
      this.emitter.updateOwnerPos(object.x, object.y);
    });
    let rest = new TWEEN.Tween({time:0}).to({time: 1}, 500);
    particleGoUp.chain(particleGoDown);
    particleGoDown.chain(rest);
    rest.chain(particleGoUp);
    particleGoUp.start();
    this.curentAnimations.push(...[particleGoUp, particleGoDown, rest]);
  }

  hoover(oldx, oldy, onComplete) {
    super.hoover(oldx, oldy, onComplete);
    this.particleCont.zIndex = 95;
    let oldP = xy2screen(oldx, oldy, this);
    let p = xy2screen(this.x, this.y, this);
    let animateEmitter = new TWEEN.Tween(oldP).to({pX: p.pX, pY: p.pY}, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((object) => {
        this.emitter.updateOwnerPos(object.pX, object.pY);
      })
      .onComplete(() => {
        this.reset();
      })
      .start();
  }

  reset() {
    super.reset();
    this.particleCont.zIndex = 0;
    this.pixelCoords = xy2screen(this.x, this.y, this);
    this.emitter.updateOwnerPos(this.pixelCoords.pX, this.pixelCoords.pY);
  }

  getScore() {
    return 10;
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getType() {
    return superBomb;
  }

  appear(delay = 0, callback) {
    super.appear(delay, () => {
      if (callback) {
        callback();
      }
      this.game.addAnimatedObject(this.emitter);
    });
  }

  removeFromScene() {
    super.removeFromScene();
    this.game.cnt.game.removeChild(this.particleCont);
    this.game.removeAnimatedObject(this.emitter);
  }

}
