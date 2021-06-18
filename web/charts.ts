
export function line_chart(canvasId) {
	var canvas = document.querySelector(canvasId);
	if (!canvas)
	{
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

		for (var i = 0; i < bufferLength; i++)
		{

			var v = dataArray[i];
			var y = v * HEIGHT / 2;


			if (i - t0 < 2500)
			{
				ysum += (y * y);
				continue;
			}
			y = Math.sqrt(ysum);
			t++;
			t0 = i;
			ysum = 0;

			if (i === 0)
			{
				canvasCtx.moveTo(t, y);
			} else
			{
				canvasCtx.lineTo(t, y);
			}

			if (t >= WIDTH)
			{
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
		for (var i = 0; i < bufferLength; i++)
		{

			var v = dataArray[i] / 280.0;
			var y = v * HEIGHT / 2;

			if (i === 0)
			{
				canvasCtx.moveTo(x, y);
			} else
			{
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

	}

	function drawBars(dataArray, fftsize = 255, samplerate = 44180) {
		canvasCtx.fillStyle = 'rgb(0, 0, 0)';
		canvasCtx.fillRect(0, 15, WIDTH, HEIGHT);

		var barWidth = (WIDTH / fftsize);
		var barHeight;
		var x = 0;

		for (var i = 0; i < 80; i++)
		{
			barHeight = dataArray[i];

			canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';

			canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

			x += barWidth + 1;
		}
		for (var i = 0; i < 80; i += 5)
		{
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
	}
}


export function time_series(canvasId) {
	var canvas = document.querySelector(canvasId);
	var canvasCtx = canvas.getContext("2d");
	canvas.setAttribute('width', canvas.parentElement.clientWidth);
	canvas.setAttribute('height', canvas.parentElement.clientHeight);
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
	canvasCtx.lineWidth = 2;
	canvasCtx.strokeStyle = 'rgb(0, 0, 0)';



}


function dbToY(db) {
	var y = (0.5 * this.height) - 4 * db;
	return y;
}

export function drawCurve(canvas, canvasContext) {

	var curveColor = "rgb(192,192,192)";
	var playheadColor = "rgb(80, 100, 80)";
	var gridColor = "rgb(100,100,100)";


	// draw center
	width = canvas.width;
	height = canvas.height;
	var dbScale = 60;
	var pixelsPerDb;
	var width;
	var height;

	function dbToY(db) {
		var y = (0.5 * height) - pixelsPerDb * db;
		return y;
	}



	canvasContext.fillStyle = "rgb(0, 0, 0)";
	canvasContext.fillRect(0, 0, width, height);

	canvasContext.strokeStyle = curveColor;
	canvasContext.lineWidth = 3;

	canvasContext.beginPath();
	canvasContext.moveTo(0, 0);

	pixelsPerDb = (0.5 * height) / dbScale;

	var noctaves = 11;

	var nyquist = 0.5 * 48000;

	canvasContext.stroke();

	canvasContext.beginPath();

	canvasContext.lineWidth = 1;

	canvasContext.strokeStyle = gridColor;



	// Draw frequency scale.
	for (var octave = 0; octave <= noctaves; octave++)
	{
		var x = octave * width / noctaves;

		canvasContext.strokeStyle = gridColor;
		canvasContext.moveTo(x, 30);
		canvasContext.lineTo(x, height);
		canvasContext.stroke();

		var f = nyquist * Math.pow(2.0, octave - noctaves);
		canvasContext.textAlign = "center";
		canvasContext.strokeStyle = curveColor;
		canvasContext.strokeText(f.toFixed(0) + "Hz", x, 20);
	}

	// Draw 0dB line.
	canvasContext.beginPath();
	canvasContext.moveTo(0, 0.5 * height);
	canvasContext.lineTo(width, 0.5 * height);
	canvasContext.stroke();

	// Draw decibel scale.

	for (var db = -dbScale; db < dbScale; db += 5)
	{
		var y = dbToY(db);
		canvasContext.strokeStyle = curveColor;
		canvasContext.strokeText(db.toFixed(0) + "dB", width - 40, y);

		canvasContext.strokeStyle = gridColor;
		canvasContext.beginPath();
		canvasContext.moveTo(0, y);
		canvasContext.lineTo(width, y);
		canvasContext.stroke();
	}
}
const rs1 = document.querySelector("#rx1");


const logrx1 = (msg) => {
	rs1.innerHTML = msg;
}

function io_samplers(ctx, fftSize) {
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


	var canvas1 = line_chart("#canvas1");
	var canvas2 = line_chart("#canvas2");
	var input_freq = line_chart("#input_freq");
	var output_freq = line_chart("#output_freq");



	var sample_timer;

	var last_sampled_at = null;
	function run_samples() {

		var dataArrayIn2 = new Uint8Array(256);
		var dataArrayOut2 = new Uint8Array(256);
		inputAnalyzer.fftSize = 256;
		outputAnalyzer.fftSize = 256;

		function sample() {

			if (last_sampled_at != null && _ctx.currentTime - last_sampled_at < 1)
			{
				//                return;
			}
			last_sampled_at = _ctx.currentTime;


			var dataArrayIn = new Uint8Array(fftSize);
			var dataArrayOut = new Uint8Array(fftSize);
			sample_timer = requestAnimationFrame(sample);

			var t1 = ctx.getOutputTimestamp();
			let info = {
				baseLatency: ctx.baseLatency,
				gg: (t1.contextTime - t1.performanceTime).toFixed(4)
			}
			//	console.log(JSON.stringify(info, null, "\t"))

			var sum = 0;

			inputAnalyzer.getByteTimeDomainData(dataArrayIn);
			dataArrayIn.map(d => sum += d * d);
			var inputrms = Math.floor(Math.sqrt(sum));
			sum = 0;
			outputAnalyzer.getByteTimeDomainData(dataArrayOut);
			dataArrayOut.map(d => sum += d * d);

			var outputrms = Math.floor(Math.sqrt(sum));
			logrx1(`rsm:${inputrms} ${outputrms} + lag ${info.baseLatency}`)

			canvas1.drawFrame(dataArrayIn);
			canvas2.drawFrame(dataArrayOut);
			inputAnalyzer.getByteFrequencyData(dataArrayIn2);
			outputAnalyzer.getByteFrequencyData(dataArrayOut2)

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
		disconnect
	}

}


export default io_samplers
