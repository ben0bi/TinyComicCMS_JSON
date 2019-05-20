<?php
/* Configuration file for the admin stuff.
	by Benedict Jäggi in 2019
*/

// The administration password.
// if you use it with GET, you need to SHA1 it.
// With POST, it will read it in plain text.
$admin_login_password="anypass";

// DB file names and paths.
$langFileName = "data/jsons/lang.german.json";
$imageDBFileName = "data/jsons/imagedb.json";
$blogDBFileName = "data/jsons/blogdb.json";
// the relative path for the uploads.
$relative_upload_path="data/uploads/";

// relative directory from THIS page (sudo.php, AJAX.php) to the root of the page.
$dirToRoot = "../";