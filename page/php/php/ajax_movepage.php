<?php
require(__DIR__."/comiccms.php");

$direction=$_GET['direction'];
$movepageorder=$_GET['pageorder'];

$pageorder_first=-1;
$pageorder_second=-1;

SQL::openConnection();

$firstid=-1;
$lastid=-1;

// get first and last
$resultfirst=SQL::query(SQL::query_page_getFirst());
$rowfirst=SQL::getFirstRow($resultfirst);
if($rowfirst!=-1) {$firstid=$rowfirst->pageorder;}

$resultlast=SQL::query(SQL::query_page_getLast());
$rowlast=SQL::getFirstRow($resultlast);
if($rowlast!=-1) {$lastid=$rowlast->pageorder;}

if(($direction=="up" && $movepageorder>$firstid) || ($direction=="down" && $movepageorder<$lastid))
{
	// get the first row (and it's id)
	$firstquery=SQL::select_from_table(SQL::$table_comicpage, 'pageorder', $movepageorder);

	//[debug] echo "Search criteria given.";

	$firstresult=SQL::query($firstquery);
	$firstrow=SQL::getFirstRow($firstresult);
	if($firstrow!=-1)
	{
		// get values
		$id_first=$firstrow->id;
		$pageorder_first=$firstrow->pageorder;

		//[debug] echo "First found: $id_first ";

		// get the second row
		$secondresult=-1;
		$secondrow=-1;
		$secondquery="#none#";
		if($direction=="up")
		{
			$secondquery=SQL::query_page_getBeforeOrEqual($movepageorder-1);
		}else{
			$secondquery=SQL::query_page_getAfterOrEqual($movepageorder+1);
		}

		// query second row
		if($query!="#none#")
		{
			$secondresult=SQL::query($secondquery);
			$secondrow=SQL::getFirstRow($secondresult);
		}

		// switch values
		if($secondrow!=-1)
		{
			$id_second=$secondrow->id;
			$pageorder_second=$secondrow->pageorder;
			//[debug] echo(" Second Found: $id_second ");

			SQL::query(SQL::update_single_value(SQL::$table_comicpage, 'pageorder', $pageorder_second, 'id', $id_first));
			SQL::query(SQL::update_single_value(SQL::$table_comicpage, 'pageorder', $pageorder_first, 'id', $id_second));

			echo "$pageorder_first &lt;--&gt; $pageorder_second<br />";

		}
	}
}

SQL::closeConnection();

ComicCMS::showArchives('../', 291);

?>
