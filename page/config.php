<?php
/* Password for the login. 
Users will not see it because it is in PHP code.
(Most easy login I could think of.) *
*/
$admin_login_password="anypass";

/* SQL Credentials */
/* 
	Fast install with phpmyadmin:
	-> Go to your phpmyadmin
	-> Click on "Users"
	-> In the middle of the screen click on "Create new user"
	-> Input your new username and password, use "localhost" as host.
	-> Check the checkbox which says "Create database with the same name."
	-> Click OK. Done.
	-> Copy your data down here.
*/
$db_host = "localhost"; 	/* The host of your DB, mostly localhost */
$db_name = "tinycomiccms";	/* The name of your DB - should be same as username with above instructions. */
$db_user = "tinycomiccms";	/* The user name (DB user, not system user!) */
$db_pass = "comiccmstiny";	/* The password to your DB */

// the relative path for the uploads.
$relative_upload_path="../uploads/";

/* Include your language file/s here.
 Just copy the one file below and alter the content.
 You can also include multiple languages, it will overwrite
 each found word/sentence and leave the rest alone.
*/
include(__DIR__."/php/lang.german.php"); // the web page is in german language.

