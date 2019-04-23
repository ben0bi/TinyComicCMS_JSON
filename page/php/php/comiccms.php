<?php
require __DIR__.'/sql.php';

// returns the new filename on success, -1 on fail.
function phpupload($fileID)
{
	global $sentence_new_page_created;

	global $relative_upload_path;

	$errcode="";
	$filename=$_FILES[$fileID]['name'];
	switch ($_FILES[$fileID]['error'])
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

/* Comic CMS class */
class ComicCMS
{
	// include the css files.
	public static function includeCSS($dirToRoot)
	{
		echo '<meta charset="utf-8">'.chr(13);
		echo '<link rel="stylesheet" href="'.$dirToRoot.'css/bootstrap.min.css">'.chr(13);
		echo '<link rel="stylesheet" href="'.$dirToRoot.'css/bootstrap-theme.min.css">'.chr(13);
		echo '<link rel="stylesheet" href="'.$dirToRoot.'css/bootstrap-dialog.min.css">'.chr(13);
		echo '<link rel="stylesheet" href="'.$dirToRoot.'css/comiccms.css">'.chr(13);

		self::includeJSLanguageTranslation();
	}

	// include the javascript files.
	public static function includeJSScripts($dirToRoot)
	{
		echo '<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>'.chr(13);
		echo '<script src="'.$dirToRoot.'js/bootstrap.min.js"></script>'.chr(13);
		echo '<script src="'.$dirToRoot.'js/bootstrap-dialog.min.js"></script>'.chr(13);
		echo '<script src="'.$dirToRoot.'js/comiccms.js"></script>'.chr(13);
	}

	// translate some words from php to js.
	private static function includeJSLanguageTranslation()
	{
		global $word_cancel;
		global $word_delete;
		global $word_title;
		global $word_file;
		global $word_text;
		global $word_title_blogpost;
		global $word_title_comicpage;
		global $word_save_page;
		global $word_save_blogpost;
		global $word_title_update_title;
		global $word_title_update_blogpost;
		global $sentence_title_newpage;
		global $sentence_title_reallydelete;
		global $sentence_title_reallydelete_blogpost;
		global $sentence_must_input_title_for_page;
		global $sentence_must_input_file_for_page;
		global $sentence_blog_must_have_title_and_text;
		global $sentence_please_wait;
		global $sentence_please_wait_for_upload;
		global $sentence_title_newblogpost;
		global $sentence_blog_must_have_title_and_text_02;
		echo '<script>';
		self::JSvar('word_cancel', $word_cancel);
		self::JSvar('word_delete', $word_delete);
		self::JSvar('word_title', $word_title);
		self::JSvar('word_file', $word_file);
		self::JSvar('word_text', $word_text);
		self::JSvar('word_title_blogpost', $word_title_blogpost);
		self::JSvar('word_title_comicpage', $word_title_comicpage);
		self::JSvar('word_save_page', $word_save_page);
		self::JSvar('word_save_blogpost', $word_save_blogpost);
		self::JSvar('word_title_update_title', $word_title_update_title);
		self::JSvar('word_title_update_blogpost', $word_title_update_blogpost);
		self::JSvar('sentence_title_newpage', $sentence_title_newpage);
		self::JSvar('sentence_title_reallydelete', $sentence_title_reallydelete);
		self::JSvar('sentence_title_reallydelete_blogpost', $sentence_title_reallydelete_blogpost);
		self::JSvar('sentence_must_input_title_for_page', $sentence_must_input_title_for_page);
		self::JSvar('sentence_must_input_file_for_page', $sentence_must_input_file_for_page);
		self::JSvar('sentence_blog_must_have_title_and_text', $sentence_blog_must_have_title_and_text);
		self::JSvar('sentence_please_wait', $sentence_please_wait);
		self::JSvar('sentence_please_wait_for_upload', $sentence_please_wait_for_upload);
		self::JSvar('sentence_title_newblogpost', $sentence_title_newblogpost);
		self::JSvar('sentence_blog_must_have_title_and_text_02', $sentence_blog_must_have_title_and_text_02);
		echo '</script>';
	}

	private static function JSvar($name, $text)
	{
		echo 'var '.$name.'="'.$text.'";'.chr(13);
	}

	// returns 291 on success.
	public static function getAdminPass()
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

	/* Shows the navigating links on the main page. */
	public static function showNavigatingLinks($pageid, $divid)
	{
		global $word_link_previous, $word_link_next, $word_link_first, $word_link_last, $word_link_archives;
		echo '<div class="pagelinks" id="'.$divid.'">'.chr(13);
		echo '<center><table border="0" class="pagelinks"><tr>'.chr(13);
		// Previous
		echo '<td><nobr><a href="index.php?page=prev&id='.($pageid-1).'">&nbsp;'.$word_link_previous.'&nbsp;</a></nobr></td>'.chr(13);
		echo '<td>|</td>'.chr(13);
		// First
		echo '<td><nobr><a href="index.php?page=first">&nbsp;'.$word_link_first.'&nbsp;</a></nobr></td>'.chr(13);
		echo '<td>|</td>'.chr(13);
		// Archives
		echo '<td><nobr><a href="archives.php">&nbsp;'.$word_link_archives.'&nbsp;</a></nobr></td>'.chr(13);
		echo '<td>|</td>'.chr(13);
		// Latest
		echo '<td><nobr><a href="index.php?page=latest">&nbsp;'.$word_link_last.'&nbsp;</a></nobr></td>'.chr(13);
		echo '<td>|</td>'.chr(13);
		// Next
		echo '<td><nobr><a href="index.php?page=next&id='.($pageid+1).'">&nbsp;'.$word_link_next.'&nbsp;</a></nobr></td>'.chr(13);
		echo '</tr></table></center></div>'.chr(13);

		// make pageid available for later use
		echo '<script>pageid='.$pageid.'</script>';
	}

	/* Shows a specific comic page. */
	public static function showPage($pageid)
	{
		global $relative_upload_path;
		global $sentence_error_no_pages;
		global $sentence_error_page_not_found;
		global $sentence_error_no_image;

		echo '<center>'.chr(13); // center all the stuff (again)
		// show upper navigating links
		ComicCMS::showNavigatingLinks($pageid, 'topnavigatinglinks');

		if($pageid==-1)
		{
			echo ("$sentence_error_no_pages<br />".chr(13));
			return;
		}

		SQL::openConnection();
		// get comic page
		$comicrow=-1;
		$comicresult=SQL::query(SQL::select_from_table(SQL::$table_comicpage,'pageorder', $pageid));
		$comicrow=SQL::getFirstRow($comicresult);
		if($comicrow!=-1)
		{

			// TODO: put that in language file.
			$sentence_wait_for_load="Bitte warten, ich lade..";

			$realpageid=$comicrow->id;
			$comicimage=$comicrow->image;
			$comictitle=SQL::sqlToText($comicrow->title);
			if($comicimage!="")
			{
				// output comic page
				echo '<div id="pageimagediv"><div id="loadertext">'.$sentence_wait_for_load.'</div>';
				echo '<div id="pageimageMoveContainer"><img id="pageimage" src="'.$relative_upload_path.$comicimage.'" />'.chr(13);
				echo '</div>';
				echo '<div class="popup">'.$comictitle.'</div>'.chr(13);
				echo '</div>';

				//echo '</div>'.chr(13);
				ComicCMS::showNavigatingLinks($pageid, 'bottomnavigatinglinks');
			}else{
				echo("<br /><br />$comictitle<br /><br />$sentence_error_no_image".chr(13));
			}

			// get blog posts and show them
			$blogresult=SQL::query(SQL::select_from_table_idASC(SQL::$table_blogpost,'comicpage_id',$realpageid));
			if($blogresult!=-1)
			{
				while($blogrow=mysqli_fetch_object($blogresult))
				{
					$blogtitle=SQL::sqlToText($blogrow->title);
					$blogtext=SQL::sqlToText($blogrow->text);
					$blogdate=$blogrow->createdate;
					echo '<center><article class="blogpost">'.chr(13);
					echo '<div class="title">'.$blogtitle.'</div>'.chr(13);
					echo '<div class="date">'.$blogdate.'</div>'.chr(13);
					echo '<div class="text">'.chr(13);
					// create line breaks on blog text.
					//echo "<pre>$blogtext</pre>----------------------------------------------------------";
					echo ComicCMS::parseEnterChars($blogtext);
					echo '</div>'.chr(13);
					echo '</article>'.chr(13);
				}
			}
		}else{
			echo($sentence_error_page_not_found." Pageorder-ID:".$pageid."<br />".chr(13));
		}

		echo '</center><div class="invisiblefooter"></div>'.chr(13);

		SQL::closeConnection();
	}

	// make html line breaks into a text.
	public static function parseEnterChars($text)
	{
		$strlen = strlen($text);
		$output="";
		for( $i = 0; $i <= $strlen; $i++ )
		{
    			$char = substr( $text, $i, 1 );
			if($char==chr(13) || $char=='\r' || $char=='\n')
				$output=$output.'<br />';
			else
				$output=$output.$char;
		}
		return $output;
	}

	// returns the real page id according to the command and the given pageid
	// cmd=latest	-> return latest page id
	// cmd=first	-> return first page id
	// cmd=next	-> return given pageid or the next one beneath it (or last one) if not in DB.
	// cmd=
	public static function getRealPageID($cmd, $pageid)
	{
		SQL::openConnection();
		$ret=$pageid;

		$firstid=-1;
		$lastid=-1;
		$query="#none#";

		// get first and last
		$resultfirst=SQL::query(SQL::query_page_getFirst());
		$rowfirst=SQL::getFirstRow($resultfirst);
		if($rowfirst!=-1) {$firstid=$rowfirst->pageorder;}

		$resultlast=SQL::query(SQL::query_page_getLast());
		$rowlast=SQL::getFirstRow($resultlast);
		if($rowlast!=-1) {$lastid=$rowlast->pageorder;}

		// maybe get next or previous
		if(strtolower($cmd)=="first")
			$ret=$firstid;
		if(strtolower($cmd)=="latest" || strtolower($cmd)=="last")
			$ret=$lastid;

		// get next or latest
		if(strtolower($cmd)=="next")
		{
			if($pageid<$lastid)
				$query=SQL::query_page_getAfterOrEqual($pageid);
			else
				$ret=$lastid; // set to last id if not bigger.
		}

		// get previous or first.
		if(strtolower($cmd)=="prev")
		{
			if($pageid>$firstid)
				$query=SQL::query_page_getBeforeOrEqual($pageid);
			else
				$ret=$firstid;
		}

		// maybe get next or previous from db
		if($query!="#none#")
		{
			$ret=-1;
			$result=SQL::query($query);
			$row=SQL::getFirstRow($result);
			if($row!=-1)
			{
				$ret=$row->pageorder;
			}
		}
		SQL::closeConnection();

		//[debug] echo "$query / Pageid: $pageid / Ret: $ret";

		return $ret;
	}

	// show the archives
	// if $admin == 291 -> show admin links
	public static function showArchives($dirToRoot, $admin)
	{
		global $sentence_no_archive_result, $sentence_admin_no_blogpost;
		global $word_delete, $word_link_newblogpost;
		global $relative_upload_path;

		SQL::openConnection();

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
					// show date
					echo "<td class=\"$class\" valign=\"top\" style=\"min-width:100px;\"><span id=\"dateof_$id\">&nbsp;<small>|&nbsp;&#8986; ".$date."</small></span></td>".chr(13);
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
		SQL::closeConnection();
	}
}
