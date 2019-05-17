<?php

require __DIR__."/comiccms.php";

$pageid=$_POST['pageid'];
$pagetitle=$_POST['pagetitle'];

$pagetitle=SQL::textToSQL($pagetitle);

SQL::openConnection();
SQL::query(SQL::update_single_value(SQL::$table_comicpage,'title', $pagetitle, 'id', $pageid));
if(SQL::Feedback()!="") echo SQL::Feedback()."<br />";
SQL::closeConnection();

echo $sentence_pagetitle_updated."<br />";
ComicCMS::showArchives('../',291);
?>
