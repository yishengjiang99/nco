const rs1 = document.querySelector("#rx1");
const logrx1 = (msg) => {
    rs1.innerHTML = msg;
};
const WIDTH = 256;
const HEIGHT = 256;
function io_samplers(ctx, fftSize) {
    var _ctx = ctx;
    var sampled_at = [];
    var outputAnalyzer = _ctx.createAnalyser();
    outputAnalyzer.minDecibels = -90;
    outputAnalyzer.maxDecibels = -10;
    outputAnalyzer.smoothingTimeConstant = .10;
    outputAnalyzer.fftSize = fftSize;
    const [canvas1, canvas2] = Array.from(document.querySelectorAll("canvas"));
    const [canvasCtx1, canvasCtx2] = [canvas1.getContext("2d"), canvas2.getContext("2d")];
    var sample_timer;
    function drawFrame(canvas, dataArray, canvasCtx) {
        var bufferLength = dataArray.length;
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 20, WIDTH, HEIGHT);
        canvasCtx.beginPath();
        var x = 0;
        var sliceWidth = Math.floor(WIDTH / bufferLength) + 1;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 280.0;
            var y = v * HEIGHT / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            }
            else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
    }
    function drawBars(canvas, dataArray, canvasCtx, fftsize = 255, samplerate = _ctx.sampleRate) {
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 15, WIDTH, HEIGHT);
        var barWidth = (WIDTH / fftsize);
        var barHeight;
        var x = 0;
        for (var i = 0; i < 80; i++) {
            barHeight = dataArray[i];
            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
        for (var i = 0; i < 80; i += 5) {
            barHeight = dataArray[i];
            canvasCtx.fillStyle = 'rgb(255,255,255)';
            canvasCtx.strokeStyle = 'rgb(255,0,0)';
            canvasCtx.textAlign = 'center';
            var f = i / fftsize * samplerate;
            canvasCtx.strokeText(f + 'hz', x, HEIGHT);
            x += barWidth + 1;
        }
    }
    function run_samples() {
        var dataArr1 = new Uint8Array(fftSize);
        var dataArr2 = new Uint8Array(fftSize);
        outputAnalyzer.fftSize = fftSize;
        function sample() {
            sample_timer = requestAnimationFrame(sample);
            var t1 = ctx.getOutputTimestamp();
            let info = {
                baseLatency: ctx.baseLatency,
                gg: (t1.contextTime - t1.performanceTime).toFixed(4)
            };
            var sum = 0;
            outputAnalyzer.getByteTimeDomainData(dataArr1);
            drawFrame(canvas1, dataArr1, canvasCtx1);
            outputAnalyzer.getByteFrequencyData(dataArr2);
            drawBars(canvas2, dataArr2, canvasCtx2);
        }
        sample();
    }
    function disconnect() {
        cancelAnimationFrame(sample_timer);
    }
    return {
        outputAnalyzer,
        run_samples,
        disconnect
    };
}
export default io_samplers;
