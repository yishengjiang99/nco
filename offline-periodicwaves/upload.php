<?php

if (isset($_SERVER["HTTP_FILENAME"])) {
		$inc = fopen("php://input", "rb"); 
		if(!$inc) die("unable to open incoming stream");
    $pcm =stream_get_contents($inc);
		

    file_put_contents("pcm/".$_SERVER["HTTP_FILENAME"], stream_get_contents(fopen("php://input", "rb")));
    file_put_contents("../".$_SERVER["HTTP_FILENAME"], stream_get_contents(fopen("php://input", "rb")));
}
else {
	
	echo "<script type='module'>".file_get_contents("periodic-waveform.js")."</script>";
}