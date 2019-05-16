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
$admin_login_password="anypass";

// THESE ARE TO BE SET FROM THE ROOT DIR.
// DB file names.
$langFileName = "data/jsons/lang.german.json";
$imageDBFileName = "data/jsons/imagedb.json";
$blogDBFileName = "data/jsons/blogdb.json";
// the relative path for the uploads.
$relative_upload_path="data/uploads/";

// relative directory from THIS page to the root of the page.
$dirToRoot = "../";

// ENDOF VALUES ************************************************************************************************

//echo "Admin stuff in PHP for security reasons.";

// get the language translations.
$langFile = file_get_contents($dirToRoot.$langFileName);
$langDB = json_decode($langFile, true);

// get the image db.
$imageDBFile = file_get_contents($dirToRoot.$imageDBFileName);
$imageDB = json_decode($imageDBFile, true);

// get the blog db.
$blogDBFile = file_get_contents($dirToRoot.$blogDBFileName);
$blogDB = json_decode($blogDBFile,true);

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

// sort the image db by the pageorder.
function sortImageDBByOrder($reverse=0)
{
	global $imageDB;
	
	$source = $imageDB['IMAGES'];
	$switched = 1;
	while($switched==1)
	{
		// reset switched.
		$switched = 0;
		// clear target.
		for($i=0;$i<sizeof($source)-2;$i++)
		{
			// get this and the next element and maybe switch them.
			$elem1= $source[$i];
			$elem2 = $source[$i+1];

			// get the order.
			$o1=$elem1['ORDER'];
			$o2=$elem2['ORDER'];
			
			// maybe switch them.
			if($o1>$o2)
			{
				// something changed, set switched to 1.
				$switched=1;
				$source[$i]=$elem2;
				$source[$i+1]=$elem1;
			}
		}
	}
	return $source;
}
// sort it just when loading the page.
$imageDB['IMAGES'] = sortImageDBByOrder(1);

// get all blog entries for an image by image id.
function getBlogEntriesByImageID($targetid)
{
	global $blogDB;
	$ret = array();
	foreach($blogDB['BLOGPOSTS'] as $itm)
	{
		$iid = $itm['IMAGEID'];
		if($iid==$targetid)
			$ret[]=$itm;
	}
	return $ret;
}

// show the admin archives panel.
function showAdmin()
{
	global $dirToRoot;
	global $imageDB;
	global $langDB;
	$db = $imageDB['IMAGES'];

	// The db should already be sorted, see above.
	$firstorder = -1;
	$lastorder = -1;
	
	echo '<article id="archives">'.chr(13);
	if(sizeof($db)>0)
	{
		$firstorder=$db[0]['ORDER'];
		$lastorder = $db[sizeof($db)-1]['ORDER'];
		
		// it's already admin we don't need to set the class but this is from the original version. 
		$class="horizontalborder";
		echo '<center><table border="0">'.chr(13);
		// go through the db reversed.
		for($ri=sizeof($db)-1; $ri>=0;$ri--)
		{
			$itm=$db[$ri];
			$id=$itm['ID'];
			$pageorder=$itm['ORDER'];
			$title=$itm['TITLE'];
			$date=date('d.m.Y',strtotime($itm['DATETIME']));
			$path=$itm['IMAGE'];
			
			echo "<tr class=\"$class\"><td class=\"$class\" valign=\"top\">$pageorder.&nbsp;</td>".chr(13);
			
			echo "<td class=\"$class\" valign=\"top\"><a href=\"javascript:\" onclick=\"ComicCMS_showAdminBlogTitles('$id')\">$title&nbsp;</a>".chr(13);

			// push all blog titles here
			echo '<div id="admin_blogtitles_'.$id.'" style="display:none;">';
			echo '<img src="'.$dirToRoot.$relative_upload_path.$path.'" class="image_preview" /><br>';
			
			$blogresult=getBlogEntriesByImageID($id);
			if(sizeof($blogresult)>0)
			{
				echo '<table border="0">';
				foreach($blogresult as $itm)
				{
					$bt = $itm['TITLE'];
					$bid=$itm['ID'];
					echo '<tr><td>&nbsp;&gt;&nbsp;</td>';
					echo '<td><a href="javascript:" onclick="ComicCMS.updateBlogPostShowForm(\'../\', \''.$bid.'\')">'.$bt."&nbsp;</a></td>";
					echo "<td>&nbsp;|&nbsp;</td><td><a href=\"javascript:\" onclick=\"ComicCMS.window_deleteblogpost('$dirToRoot','$bid','$bt');\">".$langDB['word_delete']."</a></td>";
						echo '</tr>';
				}
				echo '</table>';
			}else{
				echo $langDB['sentence_admin_no_blogpost']."&nbsp;";
			}
			
			echo '</div>';
			echo "</td>\n";
			
			// show change title link
			echo("<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.updatePageTitleForm('$dirToRoot', '$id');\">&lt;- ???</a>&nbsp;</td>");
			
			// show page moving stuff
			if($pageorder!=$firstorder)
				echo("<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.movepageup('$dirToRoot', '$pageorder');\">&nbsp;v&nbsp;</a></td>".chr(13));
			else
				echo("<td class=\"$class\" valign=\"top\">|</td>".chr(13));
			
			if($pageorder!=$lastorder)
				echo "<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.movepagedown('$dirToRoot', '$pageorder');\">&nbsp;^&nbsp;</a></td>".chr(13);
			else
				echo "<td class=\"$class\" valign=\"top\">|</td>".chr(13);
			
			// show delete page
			echo "<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.window_deletepage('$dirToRoot', '$id', '$title');\">".$langDB['word_delete']."</a></td>\n";
			// show create blog post
			echo "<td class=\"$class\" valign=\"top\">&nbsp;|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.window_createblogpost('$dirToRoot','$id')\">".$langDB['word_link_newblogpost']."</a></td>\n";

			echo "</tr>".chr(13);
		}
		echo '</table></center>'.chr(13);
	}else{
		echo $langDB['sentence_no_archive_result'];
	}
	echo '</article>'.chr(13);
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
		<a href="javascript:" style="border:0;" onclick="leaveAdminPanel();"><img id="pagetitle_image" src="../images/pagetitle.png" /></a>
	</div>

	<div id="pagecontent">
		<div class="pagelinks">
			<nobr>
			<?php
				if($login==291)
				{ 	
					echo '<a href="javascript:" onclick="ComicCMS.window_createPage(\'../\');">'.$langDB['word_link_newpage'].'</a>';
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
			showAdmin();
		echo '</div>';
		echo "<hr>Relative upload path (from page root): $relative_upload_path<br />(Change it in _admin/sudo.php)<br />";
	}else{
		echo '<br />'.$langDB['sentence_please_input_password'].'<br /><form action="sudo.php" method="post">';
		echo '<input type="password" name="rawloginpassword" >';
		echo '<button type="submit">'.$langDB['word_submit'].'</button>';
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
<script src="extern/bootstrap.min.js"></script>
<script src="extern/bootstrap-dialog.min.js"></script>

<script src="../js/bhelpers.js"></script>
<script src="../js/comiccms.js"></script>

<script src="../js/AdminLinkOriginalPos.js"></script>

<script>
// show a window with the blog posts and update stuff for a given post.
var actualAdminBlogTitleShowID=-1;
function ComicCMS_showAdminBlogTitles(id)
{
	if(actualAdminBlogTitleShowID!=-1)
		$("#admin_blogtitles_"+actualAdminBlogTitleShowID).hide();
	if(actualAdminBlogTitleShowID!=id)
	{
		$("#admin_blogtitles_"+id).show();
		actualAdminBlogTitleShowID=id;
	}else{
		actualAdminBlogTitleShowID=-1;
	}
}
</script>

<script>
$( document ).ready(function()
{
	ComicCMS.adjustPageHeight();
});
</script>

</body>
</html>
