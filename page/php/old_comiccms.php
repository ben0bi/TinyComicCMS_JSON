<?php
require __DIR__.'/sql.php';

// returns the new filename on success, -1 on fail.
function phpupload($fileID)
{
	global $sentence_new_page_created;

	global $relative_upload_path;

	$errcode="";
	$filename=$_FILES[$fileID]['name'];
	switch($_FILES[$fileID]['error'])
	{
       		case UPLOAD_ERR_OK:
        	   	break;
        	case UPLOAD_ERR_NO_FILE:
        	    	$errcode= '[PHP] No file sent.<br />';
        	case UPLOAD_ERR_INI_SIZE:
        	case UPLOAD_ERR_FORM_SIZE:
        	    	$errcode='[PHP] Exceeded filesize limit.<br />';
        	default:
        	    	$errcode= '[PHP] Unknown errors.<br />';
	}

	if($errcode=="")
	{
		if(isset($_FILES[$fileID]['tmp_name']))
		{
			if(!empty($filename))
			{
				$newfilename=time()."_".$filename;
				if(!move_uploaded_file($_FILES[$fileID]['tmp_name'],"../$relative_upload_path$newfilename"))
				{
					$errcode="[PHP] Move file failed.<br />";
				}else{
					return $newfilename;
				}
			}else{
				$errcode="[PHP] No Filename.<br />";
			}
		}
	}

	echo $errcode;
	return -1;
}


// show the archives
// if $admin == 291 -> show admin links

//TODO: json stuff

/*
function showArchives($dirToRoot, $admin)
{
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
*/
