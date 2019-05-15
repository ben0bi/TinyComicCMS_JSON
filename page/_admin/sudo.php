<!DOCTYPE html>
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

//echo "Admin stuff in PHP for security reasons.";

?>

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
		<a href="javascript:" style="border:0;" onclick="leaveAdminPanel();"><img id="pagetitle_image" src="../images/pagetitle.png" /></a>
	</div>

	<div id="pagecontent">
		<div class="title" id="title">*loading*</div>
		<div id="archivecontent"> <!-- for AJAX rebuild of the archives -->
			<?php //showAdmin('', 0); ?>
		</div>
	</div>
</div>
<br />

<div id="adminlink">
	<a href="https://github.com/ben0bi/TinyComicCMS" target="_new" class="bglinkcolor">Source</a>
</div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="../js/bootstrap.min.js"></script>
<script src="../js/bootstrap-dialog.min.js"></script>

<script src="../js/bhelpers.js"></script>
<script src="../js/comiccms.js"></script>

<script src="../js/AdminLinkOriginalPos.js"></script>

<script>
$( document ).ready(function()
{
	ComicCMS.loadLanguage("../data/jsons/lang.german.json", function() {
		$('#title').html(ComicCMS.getLang('word_title_adminpage'));
	});

	ComicCMS.adjustPageHeight();
});
</script>

</body>
</html>
