import {Game} from "./game";

function init () {
  game.init();
  game.refresh(performance.now());
}

function onResize() {
  game.resize();
}

window.onload = init;
window.onresize = onResize;

let game = new Game();
