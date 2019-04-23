<?php
require(__DIR__."/comiccms.php");

$deleteid=$_GET['id'];

SQL::openConnection();

// get the pageorder
$pageorder=-1;
$result=SQL::query(SQL::select_from_table(SQL::$table_comicpage, 'id', $deleteid));
$row=SQL::getFirstRow($result);
if($row!=-1)
{ 
	$pageorder=$row->pageorder;
	// delete the file
	unlink("../$relative_upload_path".$row->image);
}

// delete all entries with that id
SQL::query(SQL::delete_from_table(SQL::$table_blogpost, 'comicpage_id',$deleteid));
SQL::query(SQL::delete_from_table(SQL::$table_comicpage,'id', $deleteid));

// set pageorder of all bigger ones to pageorder-1

if($pageorder!=-1)
{
	$orderresult=-1;
	$orderresult=SQL::query(SQL::getAllAfterPageorder($pageorder));
	// decrease pageorder by 1 on each object >= actual pageorder
	if($orderresult!=-1)
	{
		while($orderrow=mysqli_fetch_object($orderresult))
		{
			$newpageorder=$orderrow->pageorder;
			$newpageorder=$newpageorder-1;
			$id=$orderrow->id;
			SQL::query(SQL::update_single_value(SQL::$table_comicpage,'pageorder',$newpageorder,'id',$id));
		}
	}

}else{
	echo "$sentence_error_entry_has_no_pageorder<br>";
}

if(SQL::Feedback()!="")
	echo "SQL_Feedback: ".SQL::Feedback()."<br />";

echo "$sentence_entry_deleted<br />";

ComicCMS::showArchives('../', 291);

SQL::closeConnection();

?>
