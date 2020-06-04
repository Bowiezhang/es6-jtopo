/**
 * 提供线动画功能
 */
CanvasRenderingContext2D.prototype.JtopoDrawPointPath = function (a, b, c, d, e, f) {
  let animespeed = new Date() / 10
  let xs = c - a
  let xy = d - b
  let l = Math.floor(Math.sqrt(xs * xs + xy * xy))
  let colorlength = 50
  let j = l
  let xl = xs / l
  let yl = xy / l
  let colorpoint = (animespeed % (l + colorlength)) - colorlength
  for (let i = 0; i < j; i++) {
    if (i > colorpoint && i < colorpoint + colorlength) {
      this.beginPath()
      this.strokeStyle = f
      this.moveTo(a + (i - 1) * xl, b + (i - 1) * yl)
      this.lineTo(a + i * xl, b + i * yl)
      this.stroke()
      this.strokeStyle = e
    } else {
      this.beginPath()
      this.strokeStyle = e
      this.moveTo(a + (i - 1) * xl, b + (i - 1) * yl)
      this.lineTo(a + i * xl, b + i * yl)
      this.stroke()
    }
  }
}