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

