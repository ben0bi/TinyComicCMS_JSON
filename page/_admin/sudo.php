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
function showAdmin($dirToRoot, $admin)
{
	if($admin!=291)
	{
		echo '<div id="passwordtext">*loading*</div>';
		return;
	}
	
	// firstid and lastid are only used on admin panel.
	$firstid=-1;
	$lastid=-1;
	if($admin==291)
	{
		// get first and last
		$resultfirst=SQL::query(SQL::query_page_getFirst());
		$rowfirst=SQL::getFirstRow($resultfirst);
		if($rowfirst!=-1) {$firstid=$rowfirst->pageorder;}

		$resultlast=SQL::query(SQL::query_page_getLast());
		$rowlast=SQL::getFirstRow($resultlast);
		if($rowlast!=-1) {$lastid=$rowlast->pageorder;}
	}

	// show posts.
	echo '<article id="archives">'.chr(13);
	$archiveresult=SQL::query(SQL::query_archives());
	if($archiveresult!=-1)
	{
		$class="noborder";
		if($admin==291)
			$class="horizontalborder";

		echo '<center><table style="position: relative; left: 50px;">'.chr(13);
		while($archiverow=mysqli_fetch_object($archiveresult))
		{
			$id=$archiverow->id;
			$pageorder=$archiverow->pageorder;
			$title=SQL::sqlToText($archiverow->title);
			$date=date('d.m.Y',strtotime($archiverow->createdate));
			$path=$archiverow->image;

			echo "<tr class=\"$class\"><td class=\"$class\" valign=\"top\">$pageorder.&nbsp;</td>".chr(13);
			if($admin==291)
			{
				// show admin stuff
				echo "<td class=\"$class\" valign=\"top\"><a href=\"javascript:\" onclick=\"ComicCMS.showAdminBlogTitles('$id')\">$title&nbsp;</a>\n";

				// push all blog titles here
				echo '<div id="admin_blogtitles_'.$id.'" style="display:none;">';
				echo '<img src="'.$dirToRoot.$relative_upload_path.$path.'" class="image_preview" /><br>';

				$blogresult=SQL::query(SQL::select_from_table(SQL::$table_blogpost,'comicpage_id',$id));
				$found=-1;
				if($blogresult!=-1)
				{
					echo '<table border="0">';
					while($blogrow=mysqli_fetch_object($blogresult))
					{
						$found=1;
						$bt = SQL::sqlToText($blogrow->title);
						$bt2=$blogrow->title;
						$bid=$blogrow->id;
						echo '<tr><td>&nbsp;&gt;&nbsp;</td>';
						echo '<td><a href="javascript:" onclick="ComicCMS.updateBlogPostShowForm(\'../\', \''.$bid.'\')">'.$bt."&nbsp;</a></td>";
						echo "<td>&nbsp;|&nbsp;</td><td><a href=\"javascript:\" onclick=\"ComicCMS.window_deleteblogpost('$dirToRoot','$bid','$bt2');\">$word_delete</a></td>";
						echo '</tr>';
					}
					echo '</table>';
				}
				if($found<=0)
					echo $sentence_admin_no_blogpost."&nbsp;";

				echo '</div>';
				echo "</td>\n";

				// show change title link
				echo("<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.updatePageTitleForm('$dirToRoot', '$id');\">&lt;- ???</a>&nbsp;</td>");

				// show page moving stuff
				if($pageorder!=$firstid)
					echo("<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.movepageup('$dirToRoot', '$pageorder');\">&nbsp;v&nbsp;</a></td>".chr(13));
				else
					echo("<td class=\"$class\" valign=\"top\">|</td>".chr(13));

				if($pageorder!=$lastid)
					echo "<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.movepagedown('$dirToRoot', '$pageorder');\">&nbsp;^&nbsp;</a></td>".chr(13);
				else
					echo "<td class=\"$class\" valign=\"top\">|</td>".chr(13);
				// show delete page
				echo "<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.window_deletepage('$dirToRoot', '$id', '$title');\">$word_delete</a></td>\n";

				// show create blog post
				echo "<td class=\"$class\" valign=\"top\">&nbsp;|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.window_createblogpost('../','$id')\">$word_link_newblogpost</a></td>\n";
			}else{
				// show end user archive link
				echo "<td class=\"$class\" valign=\"top\" onmouseover=\"$('#dateof_$id').css('display','block');\" onmouseout=\"$('#dateof_$id').css('display', 'none');\"><a href=\"index.php?id=$pageorder\">$title</a></td>".chr(13);
				echo "<td class=\"$class\" valign=\"top\" style=\"min-width:100px;\"><span id=\"dateof_$id\" style=\"display:none;\">&nbsp;<small>&#8882;&#8986; ".$date."</small></span></td>".chr(13);
			}
			echo "</tr>".chr(13);
		}
		echo '</table></center>'.chr(13);
	}else{
		echo $sentence_no_archive_result;
	}
	echo '</article>'.chr(13);
}
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
		$('#passwordtext').html(ComicCMS.getLang('sentence_please_input_password'));
	});

	ComicCMS.adjustPageHeight();
});
</script>

</body>
</html>
