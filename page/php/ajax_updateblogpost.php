<?php

require __DIR__."/comiccms.php";

$blogid=$_POST['blogid'];
$blogtitle=$_POST['blogtitle'];
$blogtext=$_POST['blogtext'];

$blogtitle=SQL::textToSQL($blogtitle);
$blogtext=SQL::textToSQL($blogtext);

SQL::openConnection();
SQL::query(SQL::update_single_value(SQL::$table_blogpost,'title', $blogtitle, 'id', $blogid));
if(SQL::Feedback()!="") echo SQL::Feedback()."<br />";
SQL::query(SQL::update_single_value(SQL::$table_blogpost,'text', $blogtext, 'id', $blogid));
if(SQL::Feedback()!="") echo SQL::Feedback()."<br />";
SQL::closeConnection();

echo $sentence_blogpost_updated."<br />";
ComicCMS::showArchives('../',291);
?>
