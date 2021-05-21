export function mkdiv(type, attr = {}, children = "") {
  const div = document.createElement(type);
  for (const key in attr) {
    if (key.match(/on(.*)/)) {
      div.addEventListener(key.match(/on(.*)/)[1], attr[key]);
    } else {
      div.setAttribute(key, attr[key]);
    }
  }
  const charray = !Array.isArray(children) ? [children] : children;
  charray.forEach((c) => {
    typeof c == "string" ? (div.innerHTML += c) : div.append(c);
  });
  return div;
}
//
var zoomScale = 1,
  zoomXscale = 1;
const slider = mkdiv(
  "input",
  { type: "range", value: 1, max: 10, min: -10, step: 0.2 },
  []
);
slider.oninput = (e) => (zoomXscale = Math.pow(2, e.target.value));

export const draw = function (getData, lenght, canvas = null) {
  var canvas =
    canvas ||
    document.querySelector("canvas") ||
    document.createElement("canvas");
  if (!canvas.parentElement) {
    document.body.append(canvas);
  }
  const height = canvas.parentElement.clientHeight;
  const width = canvas.parentElement.clientWidth;
  const canvasCtx = canvas.getContext("2d");
  canvas.setAttribute("width", width + "");
  canvas.setAttribute("height", height + "");
  canvasCtx.fillStyle = "rbga(0,2,2,0.1)";
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = "white";
  var dataArray = new Float32Array(lenght);
  var convertY = (y) => (y * height * zoomScale) / 2 + height / 2;
  canvas.parentElement.append(slider);
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, convertY(0));
  var t = 0;
  canvasCtx.lineWidth = 1;
  var x = 0;

  let timer;
  function draw(once = false) {
    const dataArrayOrDone = getData();
    if (dataArrayOrDone === false || dataArrayOrDone === null) {
      return;
    } else {
      dataArray = dataArrayOrDone;
    }
    var bufferLength = dataArray.length;
    canvasCtx.beginPath();
    var sum = 0;
    canvasCtx.moveTo(0, height / 2);

    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.fillStyle = `rbga(10,10,10, ${1 * 100})`;
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.strokeStyle = "white";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    let x = 0,
      iwidth = (width / bufferLength) * zoomXscale; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
    for (let i = 0; i < bufferLength; i++) {
      canvasCtx.lineTo(x, convertY(dataArray[i]));
      x += iwidth;
    }
    canvasCtx.stroke();
    if (once) return;
    timer = requestAnimationFrame(draw);
  }
  canvas.onkeydown = (e) => {
    if (e.code == "+") zoomScale += 0.5;
  };
  draw(true);
  return {
    canvas: canvas,
    stop: () => {
      clearTimeout(timer);
    },
    start: () => {
      requestAnimationFrame(draw);
      return this;
    },
    drawOnce: () => {
      draw();
    },
  };
};
