<?php

if(isset($_SERVER["HTTP_FILENAME"]))
	file_put_contents("pcm/".$_SERVER["HTTP_FILENAME"],stream_get_contents(fopen("php://input", "rb")));
else {
	
	echo "<script type='module'>".file_get_contents("periodic-waveform.js")."</script>";
}