<!DOCTYPE html>
<html>
<head>
	<?php
		require("../php/comiccms.php");
		
		ComicCMS::includeCSS('../');
		
		$login=ComicCMS::getAdminPass();
		$error="";
		if($login==777) $error=$sentence_wrong_password;
	?>
</head>
<body>
<div id="wrapper">
	<div id="pagetitle">
		<img id="pagetitle_image" src="../images/pagetitle.png" /><br />
	</div>
	<div id="pagecontent">
		<div class="pagelinks">
			<nobr>
			<?php
				if($login==291)
				{ 	
					echo '<a href="javascript:" onclick="ComicCMS.window_createPage(\'../\');">'.$word_link_newpage.'</a>';
					echo '&nbsp;|&nbsp;';
				}
			 	echo '<a href="../index.php" >'.$word_link_mainsite.'</a>'; 
			?>
			</nobr>
		</div>
	<?php

	if($error!="")
		echo '<br /><font class="error">'.$error.'</font><br />';

	if($login==291)
	{
		echo '<div id="archivecontent">'; // for AJAX rebuild of the archives.
			ComicCMS::showArchives('../', 291);
		echo '</div>';
		echo "<hr>Relative upload path (from page root): $relative_upload_path<br />(Change it in config.php)<br />";
	}else{
		echo '<br />'.$sentence_please_input_password.'<br /><form action="index.php" method="post">';
		echo '<input type="password" name="rawloginpassword" >';
		echo '<button type="submit">'.$word_submit.'</button>';
		echo '</form>';	
	}
	?>
	</div>
</div>

<!-- Scripts -->
<?php ComicCMS::includeJSScripts('../'); ?>
<script>
$( document ).ready(function()
{
	ComicCMS.adjustPageHeight();
});
</script>
</body>
</html>
