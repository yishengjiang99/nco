export const draw = function (getData, getBars, lenght, canvas) {
  const height = canvas.height;
  const width = canvas.width;
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "white";
  canvasCtx.fillStyle = "black";

  var dataArray = new Float32Array(lenght);
  var convertY = (y) => (y * height) / 2 + height / 2;
  canvasCtx.fillRect(0, 0, width, height);
  var t = 0;
  var x = 0,
    iwidth;
  var zoomScale = 1;
  let timer;
  let animationLock = false;
  function draw() {
    const dataArray = getData();
    if (animationLock) return;
    var bufferLength = dataArray.length;
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.strokeStyle = "white";

    x = 0;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, height / 2);
    iwidth = width / bufferLength; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
    for (let i = 0; i < bufferLength; i++) {
      canvasCtx.lineTo(
        x,
        height / 2 + (dataArray[i * 2  +  1] >> 5) // >> (4 * (dataArray[i * 2] >> 4))
      );
      x += iwidth;
    }
    canvasCtx.stroke();
    // canvasCtx.restore();
    timer = requestAnimationFrame(draw);
  }

  return {
    canvas: canvas,
    stop: () => {
      clearTimeout(timer);
    },
    start: () => {
      requestAnimationFrame(draw);
      return this;
    },
  };
};
function drawbars(ctx, dataArray) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  var bufferLength = dataArray.length;
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 15, WIDTH, HEIGHT);

  var barWidth = WIDTH / fftsize / 2;
  var barHeight;
  var x = 0;

  for (var i = 0; i < fftsize / 2; i++) {
    barHeight = dataArray[i];

    ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";

    ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
}
