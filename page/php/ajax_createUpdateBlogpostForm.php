<?php

//require __DIR__."/sql.php";
require __DIR__."/comiccms.php";

$id=$_GET['blogid'];

SQL::openConnection();
$blogresult=SQL::query(SQL::select_from_table(SQL::$table_blogpost,'id',$id));
$blogrow=SQL::getFirstRow($blogresult);

if($blogrow!=-1)
{
	echo '<center><form id="blogpostupdateform" action="../php/ajax_updateblogpost.php" method="POST">';
	echo '<table border="0" style="width:100%;" >';
	echo '<tr><td class="black">'.$word_title.':&nbsp;</td>';
	echo '<td><input type="text" id="update_blogtitle" name="update_blogtitle" value="'.SQL::sqlToText($blogrow->title).'"/></td></tr>';
	echo '<tr><td valign="top" class="black">'.$word_text.':&nbsp;</td>';

	// replace \n else it will make it <br /> (I don't know why)
	$text=SQL::sqlToText($blogrow->text);
	$text=str_replace("\r\n","&#10;",$text);
	$text=str_replace("\n","&#10;",$text);

	echo '<td><textarea id="update_blogtext" name="update_blogtext" rows="5" cols="60">'.$text.'</textarea></td></tr>';
	echo '</table></form></center>';

	echo '<script>';
	echo 'var form=document.getElementById("blogpostupdateform");';
	echo 'form.onsubmit = function(event) {';
	echo 	'event.preventDefault();';
	echo 	'ComicCMS.updateBlogpost("../", '.$id.');';
	echo '};';
	echo '</script>';
}else{
	echo "ERROR: Blogpost not found. SQL:".SQL::Feedback();
}
SQL::closeConnection();
?>
