<?php
require(__DIR__."/comiccms.php");

$deleteid=$_GET['id'];

SQL::openConnection();

// delete all entries with that id
SQL::query(SQL::delete_from_table(SQL::$table_blogpost, 'id',$deleteid));

if(SQL::Feedback()!="")
	echo "SQL_Feedback: ".SQL::Feedback()."<br />";

echo "$sentence_blogpost_deleted<br />";

ComicCMS::showArchives('../', 291);

SQL::closeConnection();

?>
