// leaves the admin link where it should stay when scrolling or changing the size of the window.
var adminOrigPos=-999;
$( document ).ready(function()
{	
	adminOrigPos=parseFloat($('#adminlink').position().top);
	console.log("Admin link original y position: "+adminOrigPos);
	//ComicCMS.adjustPageHeight();
	
	$(window).resize(function() {location.reload();});
	
	$(document).scroll(function()
	{
		var st=$(document).scrollTop();
		st=st+adminOrigPos;
		$("#adminlink").css('top',st);
	});
});