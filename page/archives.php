<!DOCTYPE html>
<html>
<head>
	<?php
		require(__DIR__."/php/comiccms.php");
		ComicCMS::includeCSS('');
	?>
</head>
<body>
<div id="wrapper">
	<div id="pagetitle">
		<a href="index.php" style="border:0;"><img id="pagetitle_image" src="images/pagetitle.png" /></a>
	</div>

	<div id="pagecontent">
		<div class="title"><?php echo($word_title_archives); ?></div>
		<div id="archivecontent"> <!-- for AJAX rebuild of the archives -->
			<?php ComicCMS::showArchives('', 0); ?>
		</div>
	</div>
</div>
<br />

<div class="adminlinkdiv">
<span id="adminlink" class="bglinkcolor"><nobr>
<a href="_admin/index.php" class="bglinkcolor">Admin</a>&nbsp;|
<a href="https://github.com/ben0bi/TinyComicCMS" target="_new" class="bglinkcolor">Source</a>
</nobr></span>
</div>

<?php ComicCMS::includeJSScripts(''); ?>

<script src="js/AdminLinkOriginalPos.js"></script>

<script>
$( document ).ready(function()
{
	ComicCMS.adjustPageHeight();
});
</script>

</body>
</html>
