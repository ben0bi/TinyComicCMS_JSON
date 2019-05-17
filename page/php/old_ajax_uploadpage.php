<?php

require __DIR__."/comiccms.php";

$title=$_POST['title'];
$blogtitle=$_POST['blogtitle'];
$blogtext=$_POST['blogtext'];

$newfilename=phpupload('file');
if($newfilename!=-1)
{
	SQL::openConnection();

	// create the new page order
	$lastorderresult=SQL::query(SQL::query_page_getLast());
	$lastorderrow=SQL::getFirstRow($lastorderresult);
	$order=0;
	if($lastorderrow!=-1)
		$order=$lastorderrow->pageorder+1;

	// create the new comic page entry
	if(SQL::query(SQL::insert_page($title,$newfilename,$order))==TRUE)
	{
		// maybe insert a blog post
		
		if($blogtitle!="" || $blogtext!="")
		{
			$lastid=SQL::getLastInsertedID();
			//echo "Create Blog post for id $lastid";
			SQL::query(SQL::insert_blogpost($lastid,$blogtitle,$blogtext));
			//echo "..done.<br>";
			echo $sentence_new_blogpost_created."<br />";
		}

		echo $sentence_new_page_created."<br />";
	}

	SQL::closeConnection();
	if(SQL::Feedback()!="")
		echo "SQL Feedback: ".SQL::Feedback();
}

//echo "Order: $order Title: $title <br />Blogtitle: $blogtitle<br />BlogText: $blogtext<br />";

ComicCMS::showArchives('../', 291);
?>
