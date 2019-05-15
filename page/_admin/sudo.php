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

$langFileName = "../data/jsons/lang.german.json";
$langFile = file_get_contents($langFileName);
$langFileJSON = json_decode($langFile, true);

// returns 291 on success.
function getAdminPass()
{
	global $admin_login_password;
	// get login password from "adress bar"
	if(isset($_GET['pass']))
	{
		if($_GET['pass'] == sha1($admin_login_password))
			return 291;
	}
	// get login password from form
	if(isset($_POST['rawloginpassword']))
	{
		if($_POST['rawloginpassword']==$admin_login_password)
		{
			// return the admin pass
			return 291;
		}else{
			// wrong password returns 777.
			return 777;
		}
	}
	return -1;
}


$login=getAdminPass();
$error="";
if($login==777) $error=$sentence_wrong_password;

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
		<div class="pagelinks">
			<nobr>
			<?php
				if($login==291)
				{ 	
					echo '<a href="javascript:" onclick="ComicCMS.window_createPage(\'../\');">'.$langFileJSON['word_link_newpage'].'</a>';
					echo '&nbsp;|&nbsp;';
				}
			 	echo '<a href="javascript:" onclick="leaveAdminPanel();">'.$langFileJSON['word_link_mainsite'].'</a>';
			?>
			</nobr>
		</div>
		
	<?php
	if($error!="")
		echo '<br /><font class="error">'.$error.'</font><br />';
	
	if($login==291)
	{
		echo '<div id="archivecontent">'; // for AJAX rebuild of the archives.
		echo ' you are in. ';
			//ComicCMS::showArchives('../', 291);
		echo '</div>';
		echo "<hr>Relative upload path (from page root): $relative_upload_path<br />(Change it in _admin/sudo.php)<br />";
	}else{
		echo '<br />'.$langFileJSON['sentence_please_input_password'].'<br /><form action="sudo.php" method="post">';
		echo '<input type="password" name="rawloginpassword" >';
		echo '<button type="submit">'.$langFileJSON['word_submit'].'</button>';
		echo '</form>';	
	}
	?>
	
	</div>
</div>
<br />

<div id="adminlink">
	<a href="https://github.com/ben0bi/TinyComicCMS_JSON" target="_new" class="bglinkcolor">Source</a>
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
	ComicCMS.adjustPageHeight();
});
</script>

</body>
</html>
