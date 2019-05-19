<?php

$ajax=$_POST['ajax'];

// functions for loading and saving the databases (again).
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

// LOAD AND SAVE THE DBs
$imageDB=array();
function loadImageDB()
{
	global $imageDBFileName;
	global $dirToRoot;
	
	// get the image db.
	$imageDBFile = file_get_contents($dirToRoot.$imageDBFileName);
	$imageDB = json_decode($imageDBFile, true);
	return $imageDB;
}

function loadBlogDB()
{
	global $blogDBFileName;
	global $dirToRoot;
	// get the blog db.
	$blogDBFile = file_get_contents($dirToRoot.$blogDBFileName);
	$blogDB = json_decode($blogDBFile,true);
	return $blogDB;
}

function saveImageDB($imgDB)
{
	global $imageDBFileName;
	global $dirToRoot;
	$json_data = json_encode($imgDB);
	return file_put_contents($dirToRoot.$imageDBFileName, $json_data);
}

function saveBlogDB($blgDB)
{
	global $blogDBFileName;
	global $dirToRoot;
	$json_data = json_encode($blgDB);
	return file_put_contents($dirToRoot.$blogDBFileName, $json_data);
}
// ENDOF LOAD AND SAVE FUNCTIONS

// LOAD THE STUFF

// get the language translations.
$langFile = file_get_contents($dirToRoot.$langFileName);
$langDB = json_decode($langFile, true);
// get the blog db. Get the image db below the next function.
$blogDB = loadBlogDB();

// sort it just when loading the page.
// get the image DB
$imageDB=loadImageDB();

// ENDOF LOAD THE STUFF

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
// highlightImageID is the id of the comic page entry to highlight.
// if reload is set to true, it will reload the DB into JS.
function showAdmin($reload=FALSE, $highlightImageID = -1)
{
	global $dirToRoot;
	global $relative_upload_path;
	global $imageDB;
	global $langDB;
	$db = $imageDB['IMAGES'];

	// The db should already be sorted, see above.
	$firstorder = 0;
	$lastorder = sizeof($db)-1;
	
	// reload the image db in the JavaScript.
	if($reload!=FALSE)
	{
		echo '<script>';
		echo 'log("Reloading DBs..", LOG_DEBUG);';
		echo 'ComicCMS.instance.reloadImageDB();';
		echo 'ComicCMS.instance.reloadBlogDB();';
		echo '</script>';
	}
	
	// show the archive page for the admin while the dbs are loading for js.
	echo '<article id="archives">'.chr(13);
	if(sizeof($db)>0)
	{		
		// it's already admin we don't need to set the class but this is from the original version. 
		echo '<center><table border="0">'.chr(13);
		// go through the db reversed.
		for($ri=sizeof($db)-1; $ri>=0;$ri--)
		{
			$itm=$db[$ri];
			$id=$itm['ID'];
			$title=$itm['TITLE'];
			$date=date('d.m.Y',strtotime($itm['DATETIME']));
			$path=$itm['IMAGE'];

			// set the table cell classes.
			$class="horizontalborder";
			if($id==$highlightImageID)
				$class=$class." highlightitem";

			echo "<tr class=\"$class\"><td class=\"$class\" valign=\"top\">$ri.&nbsp;</td>".chr(13);
			echo "<td class=\"$class\" valign=\"top\"><a href=\"javascript:\" onclick=\"ComicCMS.a_showAdminBlogTitles('$id')\">$title&nbsp;</a>".chr(13);

			// push all blog titles here
			echo '<div id="admin_blogtitles_'.$id.'" class="admin_blogtitles" style="display:none;">';
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
			echo("<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.a_updatePageTitleForm('$id');\">&lt;- ???</a>&nbsp;</td>");
			
			// show page moving stuff
			if($ri!=$firstorder) // up needs down arrow.
				echo("<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.a_movepageup('$ri');\" class=\"arrow\">&nbsp;&#9661;&nbsp;</a></td>".chr(13));
			else
				echo("<td class=\"$class\" valign=\"top\">|</td>".chr(13));
			
			if($ri!=$lastorder) // down needs up arrow.
				echo "<td class=\"$class\" valign=\"top\">|<a href=\"javascript:\" onclick=\"ComicCMS.a_movepagedown('$ri');\" class=\"arrow\">&nbsp;&#9651;&nbsp;</a></td>".chr(13);
			else
				echo "<td class=\"$class\" valign=\"top\">|</td>".chr(13);
			
			// show delete page
			echo "<td class=\"$class\" valign=\"top\">|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.window_deletepage('$id', '$title');\">".$langDB['word_delete']."</a></td>\n";
			// show create blog post
			echo "<td class=\"$class\" valign=\"top\">&nbsp;|&nbsp;<a href=\"javascript:\" onclick=\"ComicCMS.a_window_createblogpost('$id')\">".$langDB['word_link_newblogpost']."</a></td>\n";

			echo "</tr>".chr(13);
		}
		echo '</table></center>'.chr(13);
	}else{
		echo $langDB['sentence_no_archive_result'];
	}
	echo '</article>'.chr(13);
}

// returns the new filename on success, -1 on fail.
function phpupload($fileID)
{
	global $langDB;
	
	//global $sentence_new_page_created;
	global $dirToRoot;
	global $relative_upload_path;

	$errcode="";
	$filename=$_FILES[$fileID]['name'];
	switch($_FILES[$fileID]['error'])
	{
       		case UPLOAD_ERR_OK:
        	   	break;
        	case UPLOAD_ERR_NO_FILE:
        	    $errcode= '[PHP] No file sent.<br />';
				break;
        	case UPLOAD_ERR_INI_SIZE:
        	case UPLOAD_ERR_FORM_SIZE:
        	    $errcode='[PHP] Exceeded filesize limit.<br />';
				break;
        	default:
        	    $errcode= '[PHP] Unknown errors.<br />';
				break;
	}

	if($errcode=="")
	{
		if(isset($_FILES[$fileID]['tmp_name']))
		{
			if(!empty($filename))
			{
				$newfilename=time()."_".$filename;
				$tmpname=$_FILES[$fileID]['tmp_name'];
				if(!move_uploaded_file($_FILES[$fileID]['tmp_name'],$dirToRoot.$relative_upload_path.$newfilename))
				{
					$errcode="[PHP] Move file failed.<br />($tmpname to ".$dirToRoot.$relative_upload_path.$newfilename.")";
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

// DO SOME AJAX STUFF HERE.

// CREATE A NEW PAGE
if($ajax=='newpage')
{
	$title=$_POST['title'];
	$blogtitle=$_POST['blogtitle'];
	$blogtext=$_POST['blogtext'];
	
	$newfilename=phpupload('file');
	$newid=-1;
	if($newfilename!=-1)
	{
		$imageDB = loadImageDB();
		// create the new page order and page id.
		// order can be changed afterwards but not the page id.
		$lastorder=sizeof($imageDB['IMAGES']);
		$newid=-1;
		// OBSOLETE:
		foreach($imageDB['IMAGES'] as $itm)
		{
			if($itm['ID']>$newid || $newid==-1)
				$newid=$itm['ID'];
		}
		$newid=$newid+1;
		
		$blogDB = loadBlogDB();
		$newblogid=-1;
		foreach($blogDB['BLOGPOSTS'] as $bl)
		{
			if($bl['ID']>$newblogid || $newblogid==-1)
				$newblogid=$bl['ID'];
		}
		$newblogid=$newblogid+1;

		// create the new comic page entry
		$itm = array();
		$itm['TITLE'] = $title;
		$itm['IMAGE'] = $newfilename;
		$itm['ID'] = $newid;
		$itm['DATETIME'] = date('Y-m-d H:i:s');
		// add the item.
		$imageDB['IMAGES'][] = $itm;
		
		if(saveImageDB($imageDB)!=FALSE)
		{
			echo $langDB['sentence_new_page_created']."<br />";
			// maybe create a new blog entry.
			if($blogtitle!="" || $blogtext!="")
			{
				$blitem = array();
				$blitem['DATETIME'] = $itm['DATETIME'];
				$blitem['TITLE'] = $blogtitle;
				$blitem['TEXT'] = $blogtext;
				$blitem['IMAGEID']=$newid;
				$blitem['ID']=$newblogid;
				$blogDB['BLOGPOSTS'][] = $blitem;
				if(saveBlogDB($blogDB)!=FALSE)
					echo $langDB['sentence_new_blogpost_created']."<br />";
				else
					echo $langDB['sentence_could_not_save_blogdb']."<br />";
			}
		}else{
			// remove the uploaded file.
			echo $langDB['sentence_could_not_save_imagedb']."<br />";
			if(unlink($dirToRoot.$relative_upload_path.$newfilename)==FALSE)
				echo("PHP ERROR: Couldn't delete file $newfilename.<br />");
		}
	}else{
		echo $langDB['sentence_could_not_upload_file'];
	}
	
	// reload the dbs just for that they are right.
	$imageDB = loadImageDB();
	$blogDB = loadBlogDB();
	
	showAdmin(TRUE, $newid);
}

// UPDATE A PAGE TITLE
if($ajax=='updatepagetitle')
{
	$pageid=$_POST['pageid'];
	$pagetitle=$_POST['pagetitle'];

	$imageDB = loadImageDB();
	$showid=-1;
	for($i=0;$i<sizeof($imageDB['IMAGES']);$i++)
	{
		if($imageDB['IMAGES'][$i]['ID']==$pageid)
		{
			$showid=$pageid;
			$imageDB['IMAGES'][$i]['TITLE']=$pagetitle;
			saveImageDB($imageDB);
			echo $langDB['sentence_pagetitle_updated']."<br />";
			
			// only reload the image db.
			$imageDB = loadImageDB();
			break;
		}
	}
	showAdmin(TRUE,$showid);
}

// MOVE A PAGE UP OR DOWN.
if($ajax=='movepage')
{
	$pageorder_first=-1;
	$pageorder_second=-1;

	$direction=$_POST['direction'];
	$movepageposition=$_POST['pageposition'];
	
	$imageDB = loadImageDB();
	$firstidx=0;
	$lastidx=sizeof($imageDB['IMAGES'])-1;
	
	$showid=-1;
	if(($direction=="up" && $movepageposition>$firstidx) || ($direction=="down" && $movepageposition<$lastidx))
	{
		// get the row at the movepageposition
		$firstrow = $imageDB['IMAGES'][$movepageposition];
		$showid=$firstrow['ID'];
		$secondrow= $firstrow;
		$pageorder_first = $movepageposition; // new: not the order anymore.
		
		// move the second position.
		$secondposition=$movepageposition;
		if($direction=="up")
			$secondposition = $movepageposition-1;
		else
			$secondposition = $movepageposition+1;
		
		// second is in range, get it.
		if($secondposition>=$firstidx && $secondposition<=$lastidx)
		{
			$secondrow = $imageDB['IMAGES'][$secondposition];
			
			// switch the values.
			$imageDB['IMAGES'][$secondposition] = $firstrow;
			$imageDB['IMAGES'][$movepageposition] = $secondrow;
			saveImageDB($imageDB);
			$imageDB=loadImageDB();
		}
	}
	showAdmin(TRUE,$showid);
}
?>