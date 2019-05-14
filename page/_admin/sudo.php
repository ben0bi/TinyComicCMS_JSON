<?php
/* Admin file for the JSON version of TinyComicCMS.
	by Benedict Jäggi in 2019
	Copyleft under the GNU 3.0 License.
*/

/* Password for the login.
Users will not see it because it is in PHP code.
(Most easy login I could think of.) *
*/
$admin_login_password="anypass";

// the relative path for the uploads.
$relative_upload_path="../data/uploads/";

echo "Admin stuff in PHP for security reasons.";
?>

<!DOCTYPE html>
<html>
<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="../css/bootstrap.min.css">
		<link rel="stylesheet" href="../css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="../css/bootstrap-dialog.min.css">
		<link rel="stylesheet" href="../css/comiccms.css">
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
