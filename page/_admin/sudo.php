<!DOCTYPE html>
<?php
/* Admin file for the JSON version of TinyComicCMS.
	by Benedict Jäggi in 2019
	Copyleft under the GNU 3.0 License.
*/

// VALUES. THESE ARE TO CHANGE ********************************************************************************

/* Password for the login.
Users will not see it because it is in PHP code.
(Most easy login I could think of.) *
*/

require("AJAX.php");

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

// check if the user is logged in.
$login=getAdminPass();
$error="";
if($login==777) $error=$langDB['sentence_wrong_password'];

?>

<html>
<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="extern/bootstrap.min.css">
		<link rel="stylesheet" href="extern/bootstrap-theme.min.css">
		<link rel="stylesheet" href="extern/bootstrap-dialog.min.css">
		<link rel="stylesheet" href="../css/comiccms.css">
</head>
<body>
<div id="wrapper">
	<div id="pagetitle">
		<a href="javascript:" style="border:0;" onclick="leaveAdminPanel();"><img class="pagetitle_image" src="../images/pagetitle.png" /></a>
	</div>

	<div id="pagecontent">
		<div class="pagelinks">
			<nobr>
			<?php
				if($login==291)
				{ 	
					echo '<a href="javascript:" onclick="ComicCMS.a_window_createPage();">'.$langDB['word_link_newpage'].'</a>';
					echo '&nbsp;|&nbsp;';
				}
			 	echo '<a href="javascript:" onclick="leaveAdminPanel();">'.$langDB['word_link_mainsite'].'</a>';
			?>
			</nobr>
		</div>
		
	<?php
	if($error!="")
		echo '<br /><font class="error">'.$error.'</font><br />';
	
	if($login==291)
	{
		echo '<div id="archivecontent">'; // for AJAX rebuild of the archives.
			showAdmin(FALSE,-1,-1);
		echo '</div>';
		echo "<hr>Relative upload path (from page root): $relative_upload_path<br />(Change it in _admin/config.php)<br />";
	}else{
		echo '<br />'.$langDB['sentence_please_input_password'].'<br /><form action="sudo.php" method="post">';
		echo '<input type="password" name="rawloginpassword" id="passwordfield">';
		echo '<button type="submit">'.$langDB['word_submit'].'</button>';
		echo '</form>';	
	}
	?>
	
	</div>
</div>
<br />

<div id="adminlinkdiv">
	<a href="https://github.com/ben0bi/TinyComicCMS_JSON" target="_new" class="bglinkcolor" id="sourcelink">Source</a>
</div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="extern/bootstrap.min.js"></script>
<script src="extern/bootstrap-dialog.min.js"></script>

<script src="../js/bhelpers.js"></script>
<script src="../js/comiccms.js"></script>

<script src="../js/AdminLinkOriginalPos.js"></script>

<script>
// closes ALL bootstrap dialogs
function closeAllDialogs() {$.each(BootstrapDialog.dialogs, function(id, dialog){ dialog.close();});}
//-------------------------------------------------------------------------------------------------------------------------------------

// load the dbs into JS.
ComicCMS.loadLanguage("../data/jsons/lang.german.json");
ComicCMS.instance.loadImageDB("../data/jsons/imagedb.json");
ComicCMS.instance.loadBlogDB("../data/jsons/blogdb.json");

</script>

<script>
$( document ).ready(function()
{
	ComicCMS.adjustPageHeight();
	$(document).click(ComicCMS.a_removeHighlight);
	$('#passwordfield').focus();
});
</script>

</body>
</html>
