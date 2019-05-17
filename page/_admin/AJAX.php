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

// get the language translations.
$langFile = file_get_contents($dirToRoot.$langFileName);
$langDB = json_decode($langFile, true);

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

function saveImageDB()
{
	global $imageDBFileName;
	global $dirToRoot;
	// TODO: save image db.
}

function saveBlogDB()
{
	global $blogDBFileName;
	global $dirToRoot;
	// TODO: save blog db.
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
if($ajax=='newpage')
{
	$title=$_POST['title'];
	$blogtitle=$_POST['blogtitle'];
	$blogtext=$_POST['blogtext'];
	
	$newfilename=phpupload('file');
	echo "FILE: $newfilename";
//	if($newfilename==-1)
//		return;
}
?>