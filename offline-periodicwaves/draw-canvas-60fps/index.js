const draw = function (getData, lenght) {
  var canvas =
    document.querySelector("canvas") || document.createElement("canvas");
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
  var convertY = (y) => (y * height) / 2 + height / 2;
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, convertY(0));
  var t = 0;
  canvasCtx.lineWidth = 1;
  var x = 0;
  var zoomScale = 1;
  let timer;
  function draw() {
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
      iwidth = width / bufferLength; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
    for (let i = 0; i < bufferLength; i++) {
      canvasCtx.lineTo(x, convertY(dataArray[i]));
      x += iwidth;
    }
    canvasCtx.stroke();
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
