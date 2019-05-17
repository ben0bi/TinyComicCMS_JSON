<?php
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


// AJAX STUFF
$ajax=$_POST['ajax'];
$title=$_POST['title'];
echo ">AJAX $ajax T:  $title";


if($ajax=='newpage')
{
	$title=$_POST['title'];
	$blogtitle=$_POST['blogtitle'];
	$blogtext=$_POST['blogtext'];
	echo "NEWPAGE";
}

?>