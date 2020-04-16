

export class Color {
  constructor(r, g, b, a = 1) {
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
  }

  lightenColor (percent = 0.2) {
    let r = Math.min(this.red*(1+percent), 255);
    let g = Math.min(this.green*(1+percent), 255);
    let b = Math.min(this.blue*(1+percent), 255);
    return `rgba(${r},${g},${b},${this.alpha})`
  }

  darkenColor (percent = 0.8) {
    return `rgba(${this.red*percent},${this.green*percent},${this.blue*percent},${this.alpha})`
  }

  clone () {
    return new Color(this.red, this.green, this.blue, this.alpha);
  }

  iRequestNormalColor () {
    return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`;
  }

}
