<?php

//require __DIR__."/sql.php";
require __DIR__."/comiccms.php";

$id=$_GET['pageid'];

SQL::openConnection();
$pageresult=SQL::query(SQL::select_from_table(SQL::$table_comicpage,'id',$id));
$pagerow=SQL::getFirstRow($pageresult);

if($pagerow!=-1)
{
	echo '<center><form id="pagetitleupdateform" action="../php/ajax_updatepagetitle.php" method="POST">';
	echo '<table border="0" style="width:100%;" >';
	echo '<tr><td class="black">'.$word_title.':&nbsp;</td>';
	echo '<td><input type="text" id="update_pagetitle" name="update_pagetitle" value="'.SQL::sqlToText($pagerow->title).'"/></td></tr>';
	echo '</table></form></center>';

	echo '<script>';
	echo 'var form=document.getElementById("pagetitleupdateform");';
	echo 'form.onsubmit = function(event) {';
	echo 	'event.preventDefault();';
	echo 	'ComicCMS.updatePageTitle("../", '.$id.');';
	echo '};';
	echo '</script>';
}else{
	echo "ERROR: Comicpage not found. SQL:".SQL::Feedback();
}
SQL::closeConnection();
?>
