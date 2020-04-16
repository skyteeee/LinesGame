
export function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

export function xy2screen (x, y, object) {
  let pX = x * object.cellWidth + object.cellWidth / 2;
  let pY = y * object.cellHeight + object.cellHeight / 2;
  return {pX: pX, pY: pY};
}
