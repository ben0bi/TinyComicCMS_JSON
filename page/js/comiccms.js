function confirmBox(title, text, successlabel, successfunc)
{
        BootstrapDialog.show({
            title: title,
            message: text,
            buttons: [{
                label: word_cancel,
                action: function(dialog) {
                    dialog.close();
                }
            }, {
                label: successlabel,
                action: function(dialog) {
                    successfunc(dialog);
                }
            }]
        });
}

// closes ALL bootstrap dialogs
function closeAllDialogs() {$.each(BootstrapDialog.dialogs, function(id, dialog){ dialog.close();});}

//-------------------------------------------------------------------------------------------------------------------------------------

// ComicCMS is singleton.
function ComicCMS() 
{
	var me = this; // prevent inner blocks from being this-ed.
	var m_actualPageID = 0;
	var m_imageJSONFile = "";
	var m_blogJSONFile = "";
	var m_langJSONFile = "";
//	var m_doneLoading = -3; // done if >= 0
	var isDoneLoading=function() 
	{
		if(m_doneLoading>=0)
			return true;
		return false;
	}
	
// from php
	var m_page = "latest";

	var m_imageDB = [];
	var m_blogDB = [];
	var m_langDB = [];
	
	var m_contentDivId; // the id of the div where the content should go in. 

	this.initialize = function(contentDivId, imagedbname="", blogdbname = "", langdbname="")
	{
		m_contentDivId = contentDivId;
		m_imageJSONFile = imagedbname;
		m_blogJSONFile = blogdbname;
		m_langJSONFile = langdbname;
		
		document.onkeydown=ComicCMS.checkKeys;

// from php
		m_page = "latest";

		// maybe get the page commmand.
		var p = $_GET("page");
		var pp = $_GET("p");
		if(p!=null)
			m_page = p;
		if(pp!=null)
			m_page = pp;

		// maybe get the page id.
		m_actualPageID = -1;
		var id = $_GET("id");
		if(id!=null)
		{
			m_actualPageID = id;
			if(m_page=="latest") m_page="next"; // set page command to next if it is latest.
		}
		m_actualPageID = getRealPageID(m_page, m_actualPageID);

		// load the jsons.
		
		// load the language db.
		if(langdbname!="")
		{
			__loadJSON(m_langJSONFile, function(data) 
			{
				log("Language Data: "+data);
				m_langDB = data;
			});
		}else{
			log("No language loaded.", LOG_DEBUG);
		}
		
		// load the image db.
		if(imagedbname!="")
		{
			__loadJSON(m_imageJSONFile, function(data) 
			{
				log("Image Data:"+data);
				m_imageDB = data;
			});
		}else{
			log("No Image DB loaded.", LOG_ERROR);
		}
		
		// load the blog db.
		if(blogdbname!="")
		{
			__loadJSON(m_blogJSONFile, function(data)
			{
				log("Blog Data ("+m_blogJSONFile+"):"+data);
				m_blogDB = data;
			});
		}else{
			log("No Blog DB loaded.", LOG_WARN);
		}
		
		// fire the init function after all jsons are loaded. It waits for itself for the loading.
		InitFunction();
	}
	
	// the real load function.
	var InitFunction=function()
	{
		// wait until the loading is done.
		if(__loadJSON.loadCounter<0)
		{
			console.log("NOT DONE LOADING; Waiting..");
			setTimeout(InitFunction, 30);
			return;
		}
		
		// loading is done, do the other stuff.
		console.log("DONE LOADING");

		// NEW
		buildPageContents();
		// ENDOF NEW

		ComicCMS.initializeTouch();
		ComicCMS.adjustPageHeight();
		ComicCMS.showTitle();
	}

	// create the page html.
	var buildPageContents = function()
	{
		//global $word_link_previous, $word_link_next, $word_link_first, $word_link_last, $word_link_archives;
		
		// TODO: no reload after click.
		var htm ='<div class="pagelinks" id="topnavigatinglinks">';
		htm+='<center><table border="0" class="pagelinks"><tr>';
		// Previous
		htm+='<td><nobr><a href="index.html?page=prev&id='+(m_actualPageID-1)+'">&nbsp;'+m_langDB['word_link_previous']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// First
		htm+='<td><nobr><a href="index.html?page=first">&nbsp;'+m_langDB['word_link_first']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Archives
		htm+='<td><nobr><a href="archives.html">&nbsp;'+m_langDB['word_link_archives']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Latest
		htm+='<td><nobr><a href="index.html?page=latest">&nbsp;'+m_langDB['word_link_last']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Next
		htm+='<td><nobr><a href="index.html?page=next&id='+(m_actualPageID+1)+'">&nbsp;'+m_langDB['word_link_next']+'&nbsp;</a></nobr></td>';
		htm+='</tr></table></center></div>';
		
		$('#'+m_contentDivId).html(htm);

//		// make pageid available for later use
//		echo '<script>pageid='.$pageid.'</script>';
	}

	// show a specific page
	this.showPage = function(pageID)
	{
		console.log("TODO: show page");
	}
	
	// returns the next or previous or actual page id depending on the command.
	var getRealPageID=function(cmd, pageid)
	{
		log("TODO: return real page id");
		return pageid;
	}
}

ComicCMS.instance =new ComicCMS;

ComicCMS.showPage = function(pageID) {ComicCMS.instance.showPage(pageID);}
ComicCMS.initialize = function(contentDivId,imagedbname = "", blogdbname = "", langdbname="") {ComicCMS.instance.initialize(contentDivId, imagedbname, blogdbname,langdbname);}

// show a window with the blog posts and update stuff for a given post.
var actualAdminBlogTitleShowID=-1;
ComicCMS.showAdminBlogTitles= function(id)
{
	if(actualAdminBlogTitleShowID!=-1)
		$("#admin_blogtitles_"+actualAdminBlogTitleShowID).hide();
	if(actualAdminBlogTitleShowID!=id)
	{
		$("#admin_blogtitles_"+id).show();
		actualAdminBlogTitleShowID=id;
	}else{
		actualAdminBlogTitleShowID=-1;
	}
}


// show a box to update a page title.
ComicCMS.updatePageTitleForm = function(dirToRoot, pageID)
{
	var path=dirToRoot+"php/ajax_updatePageTitleForm.php";
	//get form with its values
	$.ajax({
	  	type: "GET",
	  	url: path+"?pageid="+pageID,
  		success : function(data)
		{
		    confirmBox(word_title_update_title, data, word_save_page, function(dialog)
			{
				var pagetitle=$("#update_pagetitle").val();

				if(pagetitle=="")
				{
					alert("Page must have a title.");
					return;
				}

				dialog.close();
				// submit the form.
				$("#pagetitleupdateform").submit();
			});
	        }
	});
}

// show a box to update a blog post.
ComicCMS.updateBlogPostShowForm = function(dirToRoot, blogID)
{
	var path=dirToRoot+"php/ajax_createUpdateBlogpostForm.php";
	//get form with its values
	$.ajax({
	  	type: "GET",
	  	url: path+"?blogid="+blogID,
  		success : function(data)
		{
		    confirmBox(word_title_update_blogpost, data, word_save_blogpost, function(dialog)
			{
				var blogtitle=$("#update_blogtitle").val();
				var blogtext=$("#update_blogtext").val();

				if(blogtitle=="" || blogtext=="")
				{
					alert("Blog must have title and text.");
					return;
				}

				dialog.close();
				// submit the form.
				$("#blogpostupdateform").submit();
			});
	        }
	});
}

// Update a blog post
ComicCMS.updateBlogpost = function(dirToRoot, blogID)
{
	var blogtitle=$('#update_blogtitle').val();
	var blogtext=$('#update_blogtext').val();

	// create form data
	var formData=new FormData();

	formData.append('blogid', blogID);
	formData.append('blogtitle', blogtitle);
	formData.append('blogtext', blogtext);

	BootstrapDialog.show({
		title: sentence_please_wait,
		message: "<center>"+sentence_please_wait_for_upload+"</center>"
        });

	var xhr=new XMLHttpRequest();
	xhr.open('POST',dirToRoot+"php/ajax_updateblogpost.php",true);

	// Set up a handler for when the request finishes.
	xhr.onload = function ()
	{
		if (xhr.status === 200) {
	    		// File(s) uploaded. Maybe show response.
			if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
				$("#archivecontent").html(xhr.responseText);
	  	} else {
	    		alert('AJAX ERROR: upload page call failed! ('+xhr.status+')');
	  	}
		closeAllDialogs();
		actualAdminBlogTitleShowID=-1;
	};

	xhr.send(formData);
}

// Update the title of a page.
ComicCMS.updatePageTitle = function(dirToRoot, pageID)
{
	var pagetitle=$('#update_pagetitle').val();

	// create form data
	var formData=new FormData();

	formData.append('pageid', pageID);
	formData.append('pagetitle', pagetitle);

	BootstrapDialog.show({
		title: sentence_please_wait,
		message: "<center>"+sentence_please_wait_for_upload+"</center>"
        });

	var xhr=new XMLHttpRequest();
	xhr.open('POST',dirToRoot+"php/ajax_updatepagetitle.php",true);

	// Set up a handler for when the request finishes.
	xhr.onload = function ()
	{
		if (xhr.status === 200) {
	    		// File(s) uploaded. Maybe show response.
			if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
				$("#archivecontent").html(xhr.responseText);
	  	} else {
	    		alert('AJAX ERROR: upload page call failed! (Ref. B) ('+xhr.status+')');
	  	}
		closeAllDialogs();
		actualAdminBlogTitleShowID=-1;
	};

	xhr.send(formData);
}

ComicCMS.nextPage = function() {window.document.location.href = 'index.php?page=next&id='+(pageid+1);}
ComicCMS.prevPage = function() {window.document.location.href = 'index.php?page=prev&id='+(pageid-1);}

// use as document.onkeydown=ComicCMS.checkKeys
// get next or previous post with arrow keys.
ComicCMS.checkKeys = function(e)
{
	e = e || window.event();

	// left arrow
	if(e.keyCode=='37')
		ComicCMS.prevPage();

	// right arrow
	if(e.keyCode=='39')
		ComicCMS.nextPage();
};

// get next or previous post with swiping on a tablet.
ComicCMS.touchStartX = 0;
ComicCMS.initializeTouch = function()
{
	var pgimgdiv = document.getElementById("pageimagediv");

	pgimgdiv.addEventListener('touchstart', function(e)
	{
		e.preventDefault();
		ComicCMS.touchStartX=e.changedTouches[0].pageX;
	});

	// move the image on touch.
	pgimgdiv.addEventListener('touchmove', function(e)
	{
		e.preventDefault();
		var startedX=ComicCMS.touchStartX;
		var actualX=e.changedTouches[0].pageX;
		var computed = actualX-startedX;
		$('#pageimageMoveContainer').css('left',computed);
		var l=$('#pageimageMoveContainer').css('left');
	});

	// maybe load a page if touch ends.
	pgimgdiv.addEventListener('touchend', function(e)
	{
		e.preventDefault();
		var dir = 0;
		var tE=e.changedTouches[0].pageX;
		if(tE<ComicCMS.touchStartX-200)
			dir = -1;
		if(tE>ComicCMS.touchStartX+200)
			dir = 1;

		// reset the image position.
		$('#pageimageMoveContainer').css('left',0);

		// maybe load the new page.
		// Warning: vice-versa to the swipe direction.
		if(dir==1)
			ComicCMS.prevPage();
		if(dir==-1)
			ComicCMS.nextPage();
		//alert("End: "+dir);
	});

	pgimgdiv.addEventListener('touchcancel', function(e) 
	{
		// reset the image position.
		$('#pageimageMoveContainer').css('left',0);
	});
};

// because of the moving image when swiping, the position of the image mover div is "absolute"
// so, we need to adjust its height to get the page flow right again.
ComicCMS.adjustPageHeight = function()
{
	// adjust image containers the top link bar.
	//var tlh = $('#topnavigatinglinks').height();
	//$("#pageimageMoveContainer").css('top', tlh);

	// get the width from the wrapper for different stuff.
	var ww = $("#wrapper").width();
	$(".pagelinks").width(ww);
	$("#pagetitle").width(ww);
	if(ww<$("#pagetitle_image").width())
	{
		$("#pagetitle_image").width(ww);
		$("#pagecontent").css('top',$("#pagetitle_image").height()+10);
	}

	$("#pagecontent").width(ww);
	$("#pageimage").width(ww);

	// eventually adjust the page height.
	var h = $('#pageimageMoveContainer').outerHeight();
	$('#pageimagediv').height(h);

	// do it again if the image is not loaded.
	if($('#pageimage').prop('complete')==false)
	{
		$('#pageimage').load(function() 
		{
			var h = $('#pageimageMoveContainer').outerHeight();
			$('#pageimagediv').height(h);
		});
	}
}

// create or a blogpost for a given id.
ComicCMS.window_createblogpost = function(dirToRoot, id)
{
	var msg='<center><form id="blogpostcreateform" action="'+dirToRoot+'php/ajax_createblogpost.php" method="POST">';
	msg=msg+'<hr><table border="0" style="width:100%;" >';
	msg=msg+'<tr><td class="black">'+word_title+':&nbsp;</td>';
	msg=msg+'<td><input type="text" id="upload_blogtitle" name="upload_blogtitle" /></td></tr>';
	msg=msg+'<tr><td valign="top" class="black">'+word_text+':&nbsp;</td>';
	msg=msg+'<td><textarea id="upload_blogtext" name="upload_blogtext" style="width:100%;height:200px;"></textarea></td></tr>';
	msg=msg+'</table></form></center>';

	msg=msg+'<script>';
	msg=msg+'var form=document.getElementById("blogpostcreateform");';
	msg=msg+'form.onsubmit = function(event) {';
	msg=msg+	'event.preventDefault();';
	msg=msg+	'ComicCMS.createBlogpost("'+dirToRoot+'", '+id+');';
	msg=msg+'};';
	msg=msg+'</script>';

	confirmBox(sentence_title_newblogpost, msg, word_save_blogpost, function(dialog)
		{
			var blogtitle=$("#upload_blogtitle").val();
			var blogtext=$("#upload_blogtext").val();

			if(blogtitle=="" || blogtext=="")
			{
				alert(sentence_blog_must_have_title_and_text);
				return;
			}

			dialog.close();

			// submit the form.
			$("#blogpostcreateform").submit();
		});
}

ComicCMS.createBlogpost = function(dirToRoot, id)
{
	var blogtitle=$('#upload_blogtitle').val();
	var blogtext=$('#upload_blogtext').val();

	// create form data
	var formData=new FormData();

	formData.append('pageid', id);
	formData.append('blogtitle', blogtitle);
	formData.append('blogtext', blogtext);

	BootstrapDialog.show({
		title: sentence_please_wait,
		message: "<center>"+sentence_please_wait_for_upload+"</center>"
        });

	var xhr=new XMLHttpRequest();
	xhr.open('POST',dirToRoot+"php/ajax_createblogpost.php",true);

	// Set up a handler for when the request finishes.
	xhr.onload = function ()
	{
		if (xhr.status === 200) {
	    		// File(s) uploaded. Maybe show response.
			if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
				$("#archivecontent").html(xhr.responseText);
	  	} else {
	    		alert('AJAX ERROR: upload page call failed! ('+xhr.status+')');
	  	}
		closeAllDialogs();
		actualAdminBlogTitleShowID=-1;
	};

	xhr.send(formData);

	//alert("Create Blog Post: "+dirToRoot+" "+id);
};

// create a comic page.
ComicCMS.window_createPage = function(dirToRoot)
{
	var msg='<center><form id="pageuploadform" action="'+dirToRoot+'php/ajax_uploadpage.php" method="POST">';
	msg=msg+'<h3>'+word_title_comicpage+'</h3><table border="0">';
	msg=msg+'<tr><td class="black">'+word_title+':&nbsp;</td>';
	msg=msg+'<td><input type="text" id="upload_pagetitle" name="upload_pagetitle" /></td></tr>';
	msg=msg+'<tr><td class="black">'+word_file+':&nbsp;</td>';
	msg=msg+'<td><input type="file" id="upload_pagefile" name="upload_pagefile" /></td></tr>';
	msg=msg+'</table><hr><h3>'+word_title_blogpost+'</h3><table border="0" style="width:100%;" >';
	msg=msg+'<tr><td class="black">'+word_title+':&nbsp;</td>';
	msg=msg+'<td><input type="text" id="upload_blogtitle" name="upload_blogtitle" /></td></tr>';
	msg=msg+'<tr><td valign="top" class="black">'+word_text+':&nbsp;</td>';
	msg=msg+'<td><textarea id="upload_blogtext" name="upload_blogtext" style="width:100%;height:200px;"></textarea></td></tr>';
	msg=msg+'</table></form></center>';

	msg=msg+'<script>';
	msg=msg+'var form=document.getElementById("pageuploadform");';
	msg=msg+'form.onsubmit = function(event) {';
	msg=msg+	'event.preventDefault();';
	msg=msg+	'ComicCMS.pageUpload("'+dirToRoot+'");';
	msg=msg+'};';
	msg=msg+'</script>';

	confirmBox(sentence_title_newpage, msg, word_save_page, function(dialog)
		{
			// check if stuff exists.
			var title=$("#upload_pagetitle").val();
			if(title=="")
			{
				alert(sentence_must_input_title_for_page);
				return;
			}

			if(document.getElementById('upload_pagefile').files.length == 0)
			{
				alert(sentence_must_input_file_for_page);
				return;
			}

			var blogtitle=$("#upload_blogtitle").val();
			var blogtext=$("#upload_blogtext").val();

			if((blogtitle=="" && blogtext!="")||(blogtitle!="" && blogtext==""))
			{
				alert(sentence_blog_must_have_title_and_text);
				return;
			}

			dialog.close();

			// submit the form.
			$("#pageuploadform").submit();
		});
};

ComicCMS.pageUpload = function(dirToRoot)
{
	var fileSelect=document.getElementById("upload_pagefile");
	var title=$('#upload_pagetitle').val();
	var blogtitle=$('#upload_blogtitle').val();
	var blogtext=$('#upload_blogtext').val();
	var files=fileSelect.files;

	// create form data
	var formData=new FormData();

	// single file
	var file=files[0];
	formData.append('file', file,file.name);

	// add title, blogtitle and blogtext
	formData.append('title', title);
	formData.append('blogtitle', blogtitle);
	formData.append('blogtext', blogtext);

	BootstrapDialog.show({
		title: sentence_please_wait,
		message: "<center>"+sentence_please_wait_for_upload+"</center>"
        });

	var xhr=new XMLHttpRequest();
	xhr.open('POST',dirToRoot+"php/ajax_uploadpage.php",true);

	// Set up a handler for when the request finishes.
	xhr.onload = function ()
	{
		if (xhr.status === 200) {
	    		// File(s) uploaded. Maybe show response.
			if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
				$("#archivecontent").html(xhr.responseText);
	  	} else {
	    		alert('AJAX ERROR: upload page call failed! ('+xhr.status+')');
	  	}
		actualAdminBlogTitleShowID=-1;
		closeAllDialogs();
	};

	xhr.send(formData);
};

// delete a comic page.
ComicCMS.window_deletepage = function(dirToRoot, id, title)
{
	confirmBox(sentence_title_reallydelete, title, word_delete, function(dialog)
		{
			$.ajax({
				type: "GET",
				url: dirToRoot+"php/ajax_deletepage.php?id="+id,
			 	success : function(data) 
				{
					actualAdminBlogTitleShowID=-1;
					$("#archivecontent").html(data);
				}
			});
			dialog.close();
		});
};

// delete a blog post.
ComicCMS.window_deleteblogpost = function(dirToRoot, id, title)
{
	confirmBox(sentence_title_reallydelete_blogpost, title, word_delete, function(dialog)
		{
			$.ajax({
				type: "GET",
				url: dirToRoot+"php/ajax_deleteblogpost.php?id="+id,
			 	success : function(data) 
				{
					actualAdminBlogTitleShowID=-1;
					$("#archivecontent").html(data);
				}
			});
			dialog.close();
		});
};

// show the title beneath the mouse pointer.
// or in the upper left if it is a touch device.
ComicCMS.touching = 0;
ComicCMS.showTitle = function()
{
	// load some stuff if document is ready
	// show the title of the page beneath the mouse button.
	$("#pageimage").mousemove(function(e)
	{
		var offset=$("#pageimagediv").offset();
		var x=e.pageX-offset.left+20;
		var y=e.pageY-offset.top+20;
		$("#pageimagediv").children(".popup").css({position: "absolute", left:x, top:y});
		$("#pageimagediv").children(".popup").show();
	})

	// hide the title of the page if the mouse is not over the image.
	$("#pageimage").mouseout(function() {$("#pageimagediv").children(".popup").hide();});

	// show the title if a touch starts. show it at top left of the image.
	$("#pageimage").on('touchstart', function(e)
	{
		//e.preventDefault();
		ComicCMS.touching = 1;
		var mtop = parseInt($("#pageimageMoveContainer").css('top'))+20;

		var x2 = '20px';
		var y2 = mtop+'px';
		$("#pageimagediv").children(".popup").css({position: "absolute", left:x2, top:y2});
		$("#pageimagediv").children(".popup").show();
	});//, {passive: true});

	$("#pageimage").on('touchend', function(e) 
	{
		if(ComicCMS.touching==1)
		{
			e.preventDefault();
			$("#pageimagediv").children(".popup").hide();
			ComicCMS.touching = 0;
		}
	});
	$("#pageimage").on('touchcancel', function(e) 
	{
		if(ComicCMS.touching==1)
		{
			e.preventDefault();
			$("#pageimagediv").children(".popup").hide();
			ComicCMS.touching = 0;
		}
	});
};

// move a page up or down in the pageorder.
ComicCMS.movepage = function(dirToRoot, pageorder, direction)
{
	// move page call
	$.ajax({
	  type: "GET",
	  url: dirToRoot+"php/ajax_movepage.php?direction="+direction+"&pageorder="+pageorder,
	  success : function(data) 
		{
			actualAdminBlogTitleShowID=-1;
			$("#archivecontent").html(data);
		}
	});
}

// move the page with pageorder a one page up (admin)
ComicCMS.movepageup = function(dirToRoot,pageorder)
{
	this.movepage(dirToRoot, pageorder, "up");
};

// move the page wit pageorder a page down (admin)
ComicCMS.movepagedown = function(dirToRoot, pageorder)
{
	this.movepage(dirToRoot, pageorder, "down");
};
