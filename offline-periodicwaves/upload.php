<?php
if($_POST && get_headers("filename"))
file_put_contents(get_headers("filename"),stream_get_contents(STDIN));
else {
	echo "<script>".file_get_contents("periodic-waveform.js")."</script>";
}