export default function io_samplers(ctx, fftSize, post_data) {
    var _ctx = ctx;
    var sampled_at = [];
    var outputAnalyzer = _ctx.createAnalyser();
    outputAnalyzer.minDecibels = -90;
    outputAnalyzer.maxDecibels = -10;
    outputAnalyzer.smoothingTimeConstant = 0;
    outputAnalyzer.fftSize = fftSize;
    var inputAnalyzer = _ctx.createAnalyser();
    inputAnalyzer.minDecibels = -90;
    inputAnalyzer.maxDecibels = -10;
    inputAnalyzer.smoothingTimeConstant = 0;
    inputAnalyzer.fftSize = fftSize;
    var input_freq = line_chart("#input_freq");
    var output_freq = line_chart("#output_freq");
    var sample_timer;
    var last_sampled_at = null;
    function run_samples() {
        function sample() {
            last_sampled_at = _ctx.currentTime;
            var dataArrayIn = new Float32Array(fftSize);
            var dataArrayOut = new Float32Array(fftSize);
            sample_timer = requestAnimationFrame(sample);
            var t1 = ctx.getOutputTimestamp();
            let info = {
                baseLatency: ctx.baseLatency,
                gg: (t1.contextTime - t1.performanceTime).toFixed(4),
            };
            logrx1(JSON.stringify(info, null, "\t"));
            var sum = 0;
            inputAnalyzer.getByteTimeDomainData(dataArrayIn);
            dataArrayIn.map((d) => (sum += d * d));
            var inputrms = Math.floor(Math.sqrt(sum));
            sum = 0;
            outputAnalyzer.getByteTimeDomainData(dataArrayOut);
            dataArrayOut.map((d) => (sum += d * d));
            var outputrms = Math.floor(Math.sqrt(sum));
            logrx1(`rsm:${inputrms} ${outputrms} + lag ${info.baseLatency}`);
            var dataArrayIn2 = new Float32Array(fftSize);
            var dataArrayOut2 = new Float32Array(fftSize);
            inputAnalyzer.getByteFrequencyData(dataArrayIn2);
            outputAnalyzer.getByteFrequencyData(dataArrayOut2);
            post_data("freq_out", dataArrayOut2, outputAnalyzer.frequencyBinCount);
            input_freq.drawBars(dataArrayIn2);
            output_freq.drawBars(dataArrayOut2);
        }
        sample();
    }
    function disconnect() {
        cancelAnimationFrame(sample_timer);
    }
    return {
        inputAnalyzer,
        outputAnalyzer,
        run_samples,
        disconnect,
    };
}
export default io_samplers;
export function line_chart(canvasId) {
    var canvas = document.querySelector(canvasId);
    if (!canvas) {
        return;
        canvas = document.createElement("canvas");
        canvas.setAttribute("id", canvasId);
        document.body.append(canvas);
    }
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width', canvas.parentElement.clientWidth);
    canvas.setAttribute('height', canvas.parentElement.clientHeight);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height - 15; // -15 for axis label;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    var t = 0;
    function drawTimeseries(dataArray) {
        var bufferLength = dataArray.length;
        canvasCtx.beginPath();
        var sliceWidth = 1;
        var ysum = 0;
        var t0 = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i];
            var y = v * HEIGHT / 2;
            if (i - t0 < 2500) {
                ysum += (y * y);
                continue;
            }
            y = Math.sqrt(ysum);
            t++;
            t0 = i;
            ysum = 0;
            if (i === 0) {
                canvasCtx.moveTo(t, y);
            }
            else {
                canvasCtx.lineTo(t, y);
            }
            if (t >= WIDTH) {
                t = 0;
                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            }
            canvasCtx.clearRect(t, 0, 80, HEIGHT);
            t++;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
    function drawFrame(dataArray) {
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
    function drawBars(dataArray, fftsize = 255, samplerate = 44180) {
        var bufferLength = dataArray.length;
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 15, WIDTH, HEIGHT);
        var barWidth = (WIDTH / fftsize);
        var barHeight;
        var x = 0;
        for (var i = 0; i < 80; i++) {
            barHeight = dataArray[i];
            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
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
    return {
        canvas, canvasCtx, WIDTH, HEIGHT,
        drawFrame, drawBars, drawTimeseries
    };
}
