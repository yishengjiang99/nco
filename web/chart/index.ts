
export const chart = function (dataArray: Float32Array, canvas: HTMLCanvasElement) {

  const height =
    parseInt(canvas.getAttribute("height")!) || 555;
  const width =
    parseInt(canvas.getAttribute("width")!) || 720;
  const canvasCtx = canvas.getContext("2d")!;
  canvas.setAttribute("width", width + "");

  canvasCtx.fillStyle = "rbga(0,2,2,0.1)";
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = "white";
  var convertY = (y: number) => y * height / 6 + height * y / 2
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.beginPath();
  canvasCtx.lineWidth = 1;
  var bufferLength = dataArray.length;


  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.fillStyle = `black`;
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.strokeStyle = "white";
  canvasCtx.lineWidth = 1;
  canvasCtx.beginPath();
  let x = 0,
    iwidth = (width / bufferLength) * 1; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
  for (let i = 0; i < bufferLength; i++)
  {
    if (i == 0) canvasCtx.moveTo(0, convertY(dataArray[i]));

    else canvasCtx.lineTo(x, convertY(dataArray[i]));
    x += iwidth;
  }
  canvasCtx.stroke();
};
