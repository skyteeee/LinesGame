import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";
import * as PIXI from 'pixi.js';

export const colorWave = 'colorWave';

export class ColorWave extends Ball {
  constructor(x, y, cellWidth, cellHeight, colorIdx, color, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.colors.add(colorIdx);
    this.colorIdx = colorIdx;
    this.sprite = new PIXI.Sprite(this.game.tex.colorWaveTex[colorIdx]);
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
    this.color = color.clone();
  }
  getType() {
    return colorWave;
  }
  getScore() {
    return 10;
  }

  selected() {
    let rotation = new TWEEN.Tween(this.ballCont).to({angle:360}, 3000).repeat(Infinity).start();
    let scaling = new TWEEN.Tween(this.ballCont.scale).to({y:0.75, x:0.75}, 500).repeat(Infinity)
      .yoyo(true).easing(TWEEN.Easing.Elastic.In).start();
    this.selectedTween = [rotation, scaling];
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  vanish(onComplete, delay = 0) {
    this.isVanishing = true;
    if (this.dribbleTween) {
      this.dribbleTween.stop();
      this.dribbleTween = null;
    }
    let rescale = new TWEEN.Tween(this.ballCont.scale).to({x:0, y:0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
    let rotation = new TWEEN.Tween(this.ballCont).to({angle:360}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).onComplete(() => {
        if (onComplete) {
          onComplete();
        }
        this.removeFromScene();
      }).start();
  }

  dribble () {
    let angle = 15;
    this.ballCont.angle = -angle;

    let animation = new TWEEN.Tween(this.ballCont).to({angle:angle}, 200);

    let goBack = new TWEEN.Tween(this.ballCont).to({angle:-angle}, 200);

    animation.chain(goBack);
    goBack.chain(animation);
    animation.start();

    this.dribbleTween = animation;
  }

  removeFromScene() {
    super.removeFromScene();
    if (this.dribbleTween) {
      this.dribbleTween.stop();
      this.dribbleTween = null;
    }
  }

}
