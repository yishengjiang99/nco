export const chart = function (dataArray, canvas) {
    const height = parseInt(canvas.height) || 555;
    const width = parseInt(canvas.width) || 720;
    const canvasCtx = canvas.getContext("2d");
    canvas.setAttribute("width", width + "");
    canvasCtx.fillStyle = "rbga(0,2,2,0.1)";
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = "white";
    var convertY = (y) => y*height/2+height/5;
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
    let x = 0, iwidth = (width / bufferLength) * 1; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
    for (let i = 0; i < bufferLength; i++) {
        if (i == 0)
            canvasCtx.moveTo(0, convertY(dataArray[i]));
        else
            canvasCtx.lineTo(x, convertY(dataArray[i]));
        x += iwidth;
    }
    canvasCtx.stroke();
};