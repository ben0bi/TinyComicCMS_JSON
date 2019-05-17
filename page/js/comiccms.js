// closes ALL bootstrap dialogs
function closeAllDialogs() {$.each(BootstrapDialog.dialogs, function(id, dialog){ dialog.close();});}

//-------------------------------------------------------------------------------------------------------------------------------------

// ComicCMS is singleton.
function ComicCMS()
{
	var me = this; // prevent inner blocks from being this-ed.
	var m_actualPageOrder = 0;
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
	var m_pageCmd = "latest";

	var m_imageDB = [];
	var m_blogDB = [];
	var m_langDB = [];
	this.getLang=function(name) {return m_langDB[name];};

	var m_contentDivId; // the id of the div where the content should go in.

	this.initialize = function(contentDivId, imagedbname="", blogdbname = "", langdbname="")
	{
		m_contentDivId = contentDivId;
		m_imageJSONFile = imagedbname;
		m_blogJSONFile = blogdbname;

		document.onkeydown=ComicCMS.checkKeys;

		// load the jsons.
		// load the language db.
		this.loadLanguage(langdbname);

		// load the image db.
		if(imagedbname!="")
		{
			__loadJSON(m_imageJSONFile, function(data)
			{
				log("Image Data:"+data, LOG_DEBUG_VERBOSE);
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
				log("Blog Data ("+m_blogJSONFile+"):"+data, LOG_DEBUG_VERBOSE);
				m_blogDB = data;
			});
		}else{
			log("No Blog DB loaded.", LOG_WARN);
		}

		// fire the init function after all jsons are loaded. It waits for itself for the loading.
		InitFunction();
	}

	// load a language file into the DB structure.
	this.loadLanguage = function(filename, func=null)
	{
		m_langJSONFile = filename;
		
		if(m_langJSONFile!="")
		{
			__loadJSON(m_langJSONFile, function(data)
			{
				log("Language Data: "+data, LOG_DEBUG_VERBOSE);
				m_langDB = data;
				if(typeof(func)==="function")
					func(data);
			});
		}else{
			log("No language loaded.", LOG_WARN);
		}		
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

		// from php
		m_pageCmd = "latest";

		// maybe get the page commmand.
		var p = $_GET("page");
		var pp = $_GET("p");
		if(p!=null)
			m_pageCmd = p;
		if(pp!=null)
			m_pageCmd = pp;

		// maybe get the page id.
		m_actualPageOrder = -1;
		var id = $_GET("id"); // for the end user, it's the id.
		if(id!=null)
		{
			m_actualPageOrder = parseInt(id);
			if(m_pageCmd=="latest") m_pageCmd="next"; // set page command to next if it is latest.
		}
		m_actualPageOrder = getRealPageOrder(m_pageCmd, m_actualPageOrder);

		// loading is done, do the other stuff.
		log("DONE LOADING");

		buildPageContents();
		ComicCMS.initializeTouch();
		ComicCMS.adjustPageHeight();
		ComicCMS.showTitle();
	}

	// create the navigating links.
	var buildNavigatingLinks = function(navlinkid)
	{
		log("Building navigation links (id: "+navlinkid+")", LOG_DEBUG_VERBOSE);
		var htm ='<center><div class="pagelinks" id="'+navlinkid+'">';
		htm+='<center><table border="0" class="pagelinks"><tr>';
		// Previous
		htm+='<td><nobr><a href="index.html?page=prev&id='+(m_actualPageOrder-1)+'">&nbsp;'+m_langDB['word_link_previous']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// First
		htm+='<td><nobr><a href="index.html?page=first">&nbsp;'+m_langDB['word_link_first']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Archives
		htm+='<td><nobr><a href="javascript:" onclick="ComicCMS.buildAndShowArchives();">&nbsp;'+m_langDB['word_link_archives']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Latest
		htm+='<td><nobr><a href="index.html?page=latest">&nbsp;'+m_langDB['word_link_last']+'&nbsp;</a></nobr></td>';
		htm+='<td>|</td>';
		// Next
		htm+='<td><nobr><a href="index.html?page=next&id='+(m_actualPageOrder+1)+'">&nbsp;'+m_langDB['word_link_next']+'&nbsp;</a></nobr></td>';
		htm+='</tr></table></center></div>';
		return htm;
	}

	// create the page html.
	var buildPageContents = function()
	{
		var htm=buildNavigatingLinks('topnavigatinglinks');

		// maybe show no pages error.
		if(m_actualPageOrder==-1)
			htm+=m_langDB['sentence_error_no_pages']+'<br />';

		// get the searched comic entry.
		var comicrow = db_getComicRowByOrder(m_actualPageOrder);
		if(comicrow!=null)
		{
			var comicid=comicrow['ID'];
			var comicimage = comicrow['IMAGE'];
			var comictitle = comicrow['TITLE'];
			var comicorder = comicrow['ORDER'];

			// build html for that image.
			if(comicimage!="")
			{
				htm+='<div id="pageimagediv"><div id="loadertext">'+m_langDB['sentence_wait_for_load']+'</div>';
				htm+='<div id="pageimageMoveContainer"><img id="pageimage" src="data/uploads/'+comicimage+'" />';
				htm+='</div><div class="popup">'+comictitle+'</div>';
				htm+='</div>';
				htm+=buildNavigatingLinks('bottomnavigatinglinks');
			}else{
				htm+="<br /><br />"+comictitle+"<br /><br />"+m_langDB['sentence_error_no_image'];
			}

			// get blog posts for that entry.
			var blogposts = db_getBlogPostsByComicID(comicid);
			for(var i=0;i<blogposts.length;i++)
			{
				var bp = blogposts[i];
				htm+='<center><article class="blogpost">';
				htm+='<div class="title">'+bp['TITLE']+'</div>';
				htm+='<div class="date">'+bp['DATETIME']+'</div>';
				htm+='<div class="text">';
				// create line breaks on blog text.
				var t = bp['TEXT'];
				var oldt="-1-1nop@nop+1+1";
				while(oldt!=t)
				{
					oldt=t;
					t.replace('\n', '<br />');
				}
				htm+=t;
				htm+='</div>';
				htm+='</article>';
			}
		}

		htm+='</center>';
		$('#'+m_contentDivId).html(htm);

		// show the stuff after the image has loaded.
		$("#pageimage").one("load", function()
		{
			log("IMAGE LOADED", LOG_DEBUG_VERBOSE);
			// do stuff
			$('#loadertext').hide();
			$('#pageimageMoveContainer').css('display', 'block');
			$('#bottomnavigatinglinks').css('display', 'block');
			$('.blogpost').css('display', 'block');

			// border problems: removed the border :(
			/*	var w=parseInt($('#pageimageMoveContainer').width()-20);
			$('#pageimage').width(w+'px');
			*/
		}).each(function() {
			// also do it from cache.
			if(this.complete)
			{
				log("IMAGE LOADED FROM CACHE", LOG_DEBUG_VERBOSE);
				$(this).load();
			}
		});

		$("#pagecontent").focus();
	}

	// build and show the archive content.
	this.buildAndShowArchives=function()
	{
		// switch the top bar links.
		$('#mainlink').hide();
		$('#archivelink').show();

		var db = db_getComicSortedByOrder(false);
		var txt="";
		txt+='<article id="archives">';
		if(db.length<=0)
		{
			$("#pagecontent").html(m_langDB['sentence_no_archive_result']);
			return;
		}

		// there is something in the db, process it.
		var cl="noborder"; // admin: horizontalborder

		txt+='<center><table style="position: relative; left:200px;">';
		for(var i=0;i<db.length;i++)
		{
			var itm=db[i];
			var id=itm['ID'];
			var pageorder=itm['ORDER'];
			var title=itm['TITLE'];
			var date=itm['DATETIME'];
			var path=itm['IMAGE'];

			txt+='<tr class="'+cl+'">';
			txt+='<td class="'+cl+'" valign="top">'+pageorder+'&nbsp;</td>';
			txt+='<td class="'+cl+'" valign="top" onmouseover="ComicCMS.showArchiveDate('+id+',true);" onmouseout="ComicCMS.showArchiveDate('+id+',false);" style="max-width: 350px;">';
			txt+='<a href="index.html?id='+pageorder+'">'+title+'</a>';
			txt+='</td>';
			txt+='<td class="'+cl+'" valign="top" style="min-width: 200px;">';
			txt+='<span id="dateof_'+id+'" style="display:none;">&nbsp;<small>&#8882;&#8986; '+date+'</small></span>';
			txt+='</td>';

			txt+='</tr>';
		}
		txt+='</table></center>';

		$("#pagecontent").html(txt);
		$("#pagecontent").focus();
	}

	// sort the db by order.
	var db_getComicSortedByOrder=function(ascending=false)
	{
		var db = m_imageDB['IMAGES'];
		if(db.length<=1)
			return db;

		var found= true;
		var sortsteps=0;
		while(found)
		{
			found=false; // reset found.
			sortsteps++;
			for(var i=0;i<db.length-1;i++)
			{
				var entry1=db[i];
				var entry2=db[i+1];
				var o1 = entry1['ORDER'];
				var o2 = entry2['ORDER'];
				// maybe switch entries.
				if(parseInt(o1)>parseInt(o2))
				{
					db[i]=entry2;
					db[i+1]=entry1;
					found = true;
				}
			}
		}
		// maybe switch.
		if(ascending==false)
		{
			var db2=[];;
			for(var i=db.length-1;i>=0;i--)
				db2.push(db[i]);
			db=db2;
		}
		log("DB sorted. Steps used: "+sortsteps, LOG_DEBUG_VERBOSE);
		return db;
	}

	// get a comic row from the comic array.
	var db_getComicRowByOrder = function(pageorder)
	{
		for(var i = 0;i<m_imageDB['IMAGES'].length;i++)
		{
			var idb = m_imageDB['IMAGES'][i];
			if(parseInt(idb['ORDER'])==pageorder)
			{
				log("FOUND IMAGE DB ENTRY: id "+idb['ID']+" / order "+idb['ORDER']+" / img "+idb['IMAGE'],LOG_DEBUG_VERBOSE);
				return idb;
			}
		}
		log("Image at position "+pageorder+" not found!", LOG_ERROR);
		return null;
	}

	// get all blog posts referring to the given comic page id.
	var db_getBlogPostsByComicID=function(pageid)
	{
		var blogarr=[];
		for(var i=0; i<m_blogDB['BLOGPOSTS'].length; i++)
		{
			var bp = m_blogDB['BLOGPOSTS'][i];
			var targetid = bp['IMAGEID'];
			if(parseInt(targetid)==pageid)
				blogarr.push(bp);
		}
		return blogarr;
	}

	// returns the next or previous or actual page id depending on the command.
	var getRealPageOrder=function(cmd, pageorder)
	{
		var target = parseInt(pageorder);
		if(target<0)
			target =0;

		var ret=pageorder;
		var firstorder=-1;
		var lastorder=-1;

		// get first and last row order id.
		for(var i=0; i<m_imageDB['IMAGES'].length; i++)
		{
			var img=m_imageDB['IMAGES'][i];
			var order = parseInt(img['ORDER']);
			if(firstorder==-1 || order<firstorder)
				firstorder=order;
			if(lastorder==-1 || order>lastorder)
				lastorder=order;
		}

		// select the id depending on the command.
		switch(cmd.toLowerCase())
		{
			case 'first': return firstorder;
			case 'latest':
			case 'last': return lastorder;
			case 'next':
				// only get next if the pageorder is in range.
				if(target<lastorder)
				{
					var nearest =-1;
					for(var i=0; i<m_imageDB['IMAGES'].length;i++)
					{
						var order = parseInt(m_imageDB['IMAGES'][i]['ORDER']);
						if(nearest==-1)
							nearest = order;

						// found, return it.
						if(order==target) {return target;}

						// not found, check if it is nearer.
						if(order-target>=0 && Math.abs(order-target)<Math.abs(nearest-target))
							nearest = order;
					}
					if(nearest!=-1)
						return nearest;
				}else{
					return lastorder;
				}
				break;
			case 'prev':
			case 'previous':
				if(target>=0)
				{
					var nearest =-1;
					for(var i=0; i<m_imageDB['IMAGES'].length;i++)
					{
						var order = parseInt(m_imageDB['IMAGES'][i]['ORDER']);
						if(nearest==-1)
							nearest = order;

						if(order==target) {return target;}

						if(order-target<=0 && Math.abs(order-target)<Math.abs(nearest-target))
							nearest = order;
					}
					if(nearest!=-1)
						return nearest;
				}else{
					return firstorder;
				}
				break;
			default: break;
		}
		log("No pageorder found for the given order "+ret, LOG_WARN);
		return ret;
	}

	this.nextPage = function() {window.document.location.href = 'index.html?page=next&id='+(m_actualPageOrder+1);}
	this.prevPage = function() {window.document.location.href = 'index.html?page=prev&id='+(m_actualPageOrder-1);}
	
	// show a confirm box. WHY DOES IT NOT TAKE THE LANGUAGE TRANSLATIONS?
	var a_confirmBox=function(title, text, successlabel, successfunc)
	{	
        BootstrapDialog.show(
		{
            title: title,
            message: text,
            buttons: [
			{
                label: m_langDB['word_cancel'],
                action: function(dialog) 
				{
                    dialog.close();
                }
            }, 
			{
                label: successlabel,
                action: function(dialog) 
				{
                    successfunc(dialog);
                }
            }]
        });
	}
	
	// Admin stuff.
	this.a_window_createPage = function(dirToRoot)
	{
		var msg='<center><form id="pageuploadform" action="AJAX.php" method="POST">'
		msg=msg+'<h3>'+m_langDB['word_title_comicpage']+'</h3><table border="0">';
		msg=msg+'<tr><td class="black">'+m_langDB['word_title']+':&nbsp;</td>';
		msg=msg+'<td><input type="text" id="upload_pagetitle" name="upload_pagetitle" /></td></tr>';
		msg=msg+'<tr><td class="black">'+m_langDB['word_file']+':&nbsp;</td>';
		msg=msg+'<td><input type="file" id="upload_pagefile" name="upload_pagefile" /></td></tr>';
		msg=msg+'</table><hr><h3>'+m_langDB['word_title_blogpost']+'</h3><table border="0" style="width:100%;" >';
		msg=msg+'<tr><td class="black">'+m_langDB['word_title']+':&nbsp;</td>';
		msg=msg+'<td><input type="text" id="upload_blogtitle" name="upload_blogtitle" /></td></tr>';
		msg=msg+'<tr><td valign="top" class="black">'+m_langDB['word_text']+':&nbsp;</td>';
		msg=msg+'<td><textarea id="upload_blogtext" name="upload_blogtext" style="width:100%;height:200px;"></textarea></td></tr>';
		msg=msg+'</table></form></center>';

		msg=msg+'<script>';
		msg=msg+'var form=document.getElementById("pageuploadform");';
		msg=msg+'form.onsubmit = function(event) {';
		msg=msg+	'event.preventDefault();';
		msg=msg+	'ComicCMS.a_pageUpload("'+dirToRoot+'");';
		msg=msg+'};';
		msg=msg+'</script>';

		a_confirmBox(m_langDB['sentence_title_newpage'], msg, m_langDB['word_save_page'], function(dialog)
		{
			// check if stuff exists.
			var title=$("#upload_pagetitle").val();
			if(title=="")
			{
				alert(m_langDB['sentence_must_input_title_for_page']);
				return;
			}

			if(document.getElementById('upload_pagefile').files.length == 0)
			{
				alert(m_langDB['sentence_must_input_file_for_page']);
				return;
			}

			var blogtitle=$("#upload_blogtitle").val();
			var blogtext=$("#upload_blogtext").val();

			if((blogtitle=="" && blogtext!="")||(blogtitle!="" && blogtext==""))
			{
				alert(m_langDB['sentence_blog_must_have_title_and_text']);
				return;
			}

			dialog.close();

			// submit the form.
			$("#pageuploadform").submit();
		});
	}
	
	// the real page upload function.
	this.a_pageupload=function(dirToRoot)
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

		// add ajax determinator
		formData.append('ajax', 'newpage');
	
		BootstrapDialog.show({
			title: m_langDB['sentence_please_wait'],
			message: "<center>"+m_langDB['sentence_please_wait_for_upload']+"</center>"
			});

		var xhr=new XMLHttpRequest();
		xhr.open('POST','AJAX.php',true);

		// Set up a handler for when the request finishes.
		xhr.onload = function ()
		{
			if (xhr.status === 200) 
			{
				// File(s) uploaded. Maybe show response.
				if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
					{$("#archivecontent").html(xhr.responseText);}
			} else {
					alert('AJAX ERROR: upload page call failed! ('+xhr.status+')');
			}
			actualAdminBlogTitleShowID=-1;
			closeAllDialogs();
		};

		xhr.send(formData);
	}
}

ComicCMS.instance =new ComicCMS;
ComicCMS.initialize = function(contentDivId,imagedbname = "", blogdbname = "", langdbname="") {ComicCMS.instance.initialize(contentDivId, imagedbname, blogdbname,langdbname);}

ComicCMS.buildAndShowArchives = function() {ComicCMS.instance.buildAndShowArchives();}

// return the language associated with the given term.
ComicCMS.getLang = function(name) {return ComicCMS.instance.getLang(name);};
ComicCMS.loadLanguage = function(filename, func=null) {ComicCMS.instance.loadLanguage(filename, func);};

// show or hide the date in the archives.
ComicCMS.showArchiveDate=function(id, show=true)
{
	if(show)
		$('#dateof_'+id).css('display', 'block');
	else
		$('#dateof_'+id).css('display', 'none');
}

// get the next or the previous page.
ComicCMS.nextPage = function() {ComicCMS.instance.nextPage();}
ComicCMS.prevPage = function() {ComicCMS.instance.prevPage();}

// create a comic page.
ComicCMS.a_window_createPage = function(dirToRoot) {ComicCMS.instance.a_window_createPage(dirToRoot);};

// page upload
ComicCMS.a_pageUpload = function(dirToRoot)
{
	ComicCMS.instance.a_pageupload(dirToRoot);
};

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


// REALLY OLD STUFF...review

// DB STUFF. needs to be reviewed alot. That is the sudo.php for. All teh stuff below.

//ComicCMS.showPage = function(pageID) {ComicCMS.instance.showPage(pageID);}
/*
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
*/

/*
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
*/

/*
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
*/
