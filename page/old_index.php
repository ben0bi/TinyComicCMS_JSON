<!DOCTYPE html>
<html>
<head>
	<?php
		require(__DIR__."/php/comiccms.php");

		ComicCMS::includeCSS('');

		// get page command and/or id
		$page="latest";
		if(isset($_GET['page']))
			$page=$_GET['page'];

		// get id from "adress bar"
		$pageid=-1;
		if(isset($_GET['id']))
		{
			$pageid=$_GET['id'];
			// reset page to show that one and not the latest one.
			if($page=="latest") $page="next";
		}

		// get real page id
		$pageid=ComicCMS::getRealPageID($page, $pageid);
	?>
</head>
<body>
<div id="wrapper">
	<div id="pagetitle">
		<a href="../../index.html" style="border: 0;"><img id="pagetitle_image" src="images/pagetitle.png" /></a><br />
	</div>

	<div id="pagecontent">
		<?php ComicCMS::showPage($pageid); ?>
	</div>
</div>

<!-- maybe this link is not used in your design, so its not in the above function. -->
<!-- <script src="js/AdminLinkOriginalPos.js"></script> -->
<div class="adminlinkdiv">
<span id="adminlink">
<a href="https://github.com/ben0bi/TinyComicCMS" target="_new" class="bglinkcolor" id="sourcelink">Source</a>
</span>
</div>

<!-- Scripts -->
<?php ComicCMS::includeJSScripts(''); ?>

<script src="js/AdminLinkOriginalPos.js"></script>

<script>

$( document ).ready(function()
{
	document.onkeydown=ComicCMS.checkKeys;
	ComicCMS.initializeTouch();

	ComicCMS.adjustPageHeight();

	ComicCMS.showTitle();

	// show the stuff after the image has loaded.
	$("#pageimage").one("load", function()
	{
		// do stuff
		$('#loadertext').hide();
		$('#pageimageMoveContainer').css('display', 'block');
		$('#bottomnavigatinglinks').css('display', 'block');
		$('.blogpost').css('display', 'block');

		// border problems: removed the border :(
		/*	var w=parseInt($('#pageimageMoveContainer').width()-20);
		$('#pageimage').width(w+'px');
		*/
	}).each(function() {
		// also do it from cache.
			if(this.complete) $(this).load();
	});

	$("#pagecontent").focus();
});

</script>

</body>
</html>
