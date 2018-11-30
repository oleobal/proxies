<?php
	/**
	 * gets a decklist as input 
	 * returns a js object with cards and image urls
	 */

	ini_set("log_errors", 1);
	ini_set("error_log", "/var/www/tools/proxies/php-error.log");

	//$input = htmlspecialchars($_POST["script"]);
	$input = file_get_contents('php://input');
	$fname = htmlspecialchars($_GET["name"]);
	//$output = shell_exec('svg-pinout/pinout.py ');
	//echo $inp;


	$logf = fopen("get-json-php-log.html", "w");

	fwrite($logf, $inp);
	
	$descriptors = array(
		0 => array("pipe", "r"),
		1 => array("pipe", "w"),
		2 => array("pipe", "w")
	);
	

	fwrite($logf, $input);


	$proc = proc_open("python3 ./MTGProxyPrinter/main.py --out ./pdf/".$fname.".pdf -", $descriptors, $pipes);

	
	//echo "PUTAIN RASMUS";

	if (is_resource($proc))
	{
		fwrite($pipes[0], $input);
		fclose($pipes[0]);
		echo stream_get_contents($pipes[1]);
		fclose($pipes[1]);
		echo stream_get_contents($pipes[2]);
		fclose($pipes[2]);
		//echo "pdf/".$fname.".pdf";

		$return_value = proc_close($proc);

		
	}
	else
	{
		echo "Invalid";
	}

	
	fclose($logf);
?>
