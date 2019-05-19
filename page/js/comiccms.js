// ComicCMS is singleton.
function ComicCMS()
{
	var me = this; // prevent inner blocks from being this-ed.
	var m_actualPagePosition = 0;
	var m_imageJSONFile = "";
	var m_blogJSONFile = "";
	var m_langJSONFile = "";
	var isDoneLoading=function()
	{
		if(m_doneLoading>=0)
			return true;
		return false;
	}

	var m_pageCmd = "latest";

	// the three dbs: images,  blog posts and page translations
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
		this.loadImageDB(imagedbname);
		this.loadBlogDB(blogdbname);

		// fire the init function after all jsons are loaded. It waits for itself for the loading.
		InitFunction();
	}
	
	// load the image db.
	this.loadImageDB = function(imagedbname)
	{
		m_imageJSONFile=imagedbname;
		if(imagedbname!="")
		{
			__loadJSON(imagedbname+"?nocache="+(new Date()).getTime(), function(data)
			{
				log("Image Data:"+data, LOG_DEBUG_VERBOSE);
				m_imageDB = data;
			});
		}else{
			log("No Image DB loaded.", LOG_ERROR);
		}
	}

	// load the blog db.
	this.loadBlogDB = function(blogdbname)
	{
		m_blogJSONFile=blogdbname;
		if(blogdbname!="")
		{
			__loadJSON(blogdbname+"?nocache="+(new Date()).getTime(), function(data)
			{
				log("Blog Data ("+m_blogJSONFile+"):"+data, LOG_DEBUG_VERBOSE);
				m_blogDB = data;
			});
		}else{
			log("No Blog DB loaded.", LOG_WARN);
		}
	}
	
	// reload the image/blog db.
	this.reloadImageDB = function() {me.loadImageDB(m_imageJSONFile);};
	this.reloadBlogDB = function() {me.loadBlogDB(m_blogJSONFile);};

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
		m_actualPagePosition = -1;
		var id = $_GET("id"); // for the end user, it's the id.
		if(id!=null)
		{
			// New: get pageorder from the id.
			for(var i=0;i<m_imageDB['IMAGES'].length;i++)
			{
				var itm=m_imageDB['IMAGES'][i];
				if(itm['ID']==id)
					m_actualPagePosition = i;
			}
			
			// set page command to next if it is latest, because an id was set.
			if(m_pageCmd=="latest" || m_pageCmd=="last") m_pageCmd="next";
		}
		m_actualPagePosition = getRealPagePosition(m_pageCmd, m_actualPagePosition);

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
		htm+='<td><nobr><a href="index.html?page=prev&id='+getImageIDFromArrayPosition(m_actualPagePosition-1)+'">&nbsp;'+m_langDB['word_link_previous']+'&nbsp;</a></nobr></td>';
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
		htm+='<td><nobr><a href="index.html?page=next&id='+getImageIDFromArrayPosition(m_actualPagePosition+1)+'">&nbsp;'+m_langDB['word_link_next']+'&nbsp;</a></nobr></td>';
		htm+='</tr></table></center></div>';
		return htm;
	}

	// create the page html.
	var buildPageContents = function()
	{
		var htm=buildNavigatingLinks('topnavigatinglinks');

		// maybe show no pages error.
		if(m_actualPagePosition==-1)
			htm+=m_langDB['sentence_error_no_pages']+'<br />';

		// get the searched comic entry.
		var comicrow = db_getComicRowByOrder(m_actualPagePosition);
		if(comicrow!=null)
		{
			var comicid=comicrow['ID'];
			var comicimage = comicrow['IMAGE'];
			var comictitle = comicrow['TITLE'];

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
		$('#adminlink').show();

		var db = m_imageDB['IMAGES']; // OBSOLETE: db_getComicSortedByOrder(false);
		
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
		// go through the db backwards so the last entry is at top.
		for(var i=db.length-1;i>=0;i--)
		{
			var itm=db[i];
			var id=itm['ID'];
			var title=itm['TITLE'];
			var date=itm['DATETIME'];
			var path=itm['IMAGE'];

			txt+='<tr class="'+cl+'">';
			txt+='<td class="'+cl+'" valign="top">'+i+'&nbsp;</td>';
			txt+='<td class="'+cl+'" valign="top" onmouseover="ComicCMS.showArchiveDate('+id+',true);" onmouseout="ComicCMS.showArchiveDate('+id+',false);" style="max-width: 350px;">';
			txt+='<a href="index.html?id='+id+'">'+title+'</a>';
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

	// get a comic row from the comic array by the index in the array.
	var db_getComicRowByOrder = function(pageorder)
	{
		if(m_imageDB['IMAGES'].length>pageorder && pageorder>=0)
			return m_imageDB['IMAGES'][pageorder];

		log("Image at position "+pageorder+" not found!", LOG_ERROR);
		return null;
	}
	
	// get a comic row from the comic array.
	var db_getComicRowByID = function(pageid)
	{
		for(var i = 0;i<m_imageDB['IMAGES'].length;i++)
		{
			var idb = m_imageDB['IMAGES'][i];
			if(parseInt(idb['ID'])==pageid)
			{
				log("FOUND IMAGE DB ENTRY: by id "+idb['ID']+" position: "+i+" / img "+idb['IMAGE'],LOG_DEBUG_VERBOSE);
				return idb;
			}
		}
		log("Image with id "+pageid+" not found!", LOG_ERROR);
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
	
	// get a blog post by its id.
	var db_getBlogPostByID=function(blogID)
	{
		for(var i=0;i<m_blogDB['BLOGPOSTS'].length;i++)
		{
			if(m_blogDB['BLOGPOSTS'][i]['ID']==blogID)
				return m_blogDB['BLOGPOSTS'][i];
		}
		return null;
	}

	// returns the next or previous or actual page id depending on the command.
	var getRealPagePosition=function(cmd, pageorder)
	{
		var target = parseInt(pageorder);
		if(target<0)
			target=0;

		var firstorder=0;
		var lastorder=m_imageDB['IMAGES'].length-1;

		// select the id depending on the command.
		switch(cmd.toLowerCase())
		{
			case 'first': return firstorder;
			case 'latest':
			case 'last': return lastorder;
			case 'next':
				// only get next if the pageorder is in range.
				if(target<=lastorder)
					return target;
				else
					return lastorder;
				break;
			case 'prev':
			case 'previous':
				if(target>=0)
					return target;
				else
					return firstorder;
				break;
			default: break;
		}
		log("No pageorder found for the given position "+target, LOG_WARN);
		return target;
	}

	// TODO, new: get id from the item for that pageorder.
	var getImageIDFromArrayPosition=function(idx)
	{
		var firstpos=0;
		var lastpos=m_imageDB['IMAGES'].length-1;
		
		if(idx>=firstpos && idx<=lastpos)
			return m_imageDB['IMAGES'][idx]['ID'];
		
		if(idx>lastpos)
			return m_imageDB['IMAGES'][lastpos]['ID'];
		
		if(idx<firstpos)
			return m_imageDB['IMAGES'][firstpos]['ID'];
	}
	
	this.nextPage = function() {window.document.location.href = 'index.html?page=next&id='+getImageIDFromArrayPosition(m_actualPagePosition+1);}
	this.prevPage = function() {window.document.location.href = 'index.html?page=prev&id='+getImageIDFromArrayPosition(m_actualPagePosition-1);}
	
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
	this.a_window_createPage = function()
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
		msg=msg+	'ComicCMS.a_pageupload();';
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
	this.a_pageupload=function()
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
			message: "<center>"+m_langDB['sentence_applying_changes']+"</center>"
			});

		var xhr=new XMLHttpRequest();
		xhr.open('POST','AJAX.php',true);

		// Set up a handler for when the request finishes.
		xhr.onload = function ()
		{
			if (xhr.status === 200) 
			{
				m_highlightRemoved=false;
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
	
	// update the title of a comic poge.
	this.a_updatePageTitle = function(pageID)
	{
		var pagetitle=$('#update_pagetitle').val();

		// create form data
		var formData=new FormData();

		formData.append('pageid', pageID);
		formData.append('pagetitle', pagetitle);
		formData.append('ajax', 'updatepagetitle');

		BootstrapDialog.show({
			title: m_langDB['sentence_please_wait'],
			message: "<center>"+m_langDB['sentence_please_wait_for_upload']+"</center>"
		});

		var xhr=new XMLHttpRequest();
		xhr.open('POST',"AJAX.php",true);

		// Set up a handler for when the request finishes.
		xhr.onload = function ()
		{
			if (xhr.status === 200) {
				m_highlightRemoved=false;
				// Page title changed. Maybe show response.
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
	
	// show a box to update a page title.
	this.a_updatePageTitleForm = function(pageID)
	{
		// get the page with the given pageid.
		var page = db_getComicRowByID(pageID);
		if(page==null)
		{
			log("Could not update title; page with id "+pageID+" not found.", LOG_ERROR);
			return;
		}
		
		var txt="";
		txt=txt+'<center><form id="pagetitleupdateform" action="AJAX.php" method="POST">';
		txt=txt+'<table border="0" style="width:100%;" >';
		txt=txt+'<tr><td class="black">'+m_langDB['word_title']+':&nbsp;</td>';
		txt=txt+'<td><input type="text" id="update_pagetitle" name="update_pagetitle" value="'+page['TITLE']+'"/></td></tr>';
		txt=txt+'</table></form></center>';

		txt=txt+'<script>';
		txt=txt+'var form=document.getElementById("pagetitleupdateform");';
		txt=txt+'form.onsubmit = function(event) {';
		txt=txt+'  event.preventDefault();';
		txt=txt+'  ComicCMS.a_updatePageTitle('+pageID+');';
		txt=txt+'};';
		txt=txt+'</script>';
		
		a_confirmBox(m_langDB['word_title_update_title'], txt, m_langDB['word_save_page'], function(dialog)
		{
			var pagetitle=$("#update_pagetitle").val();
			if(pagetitle=="")
			{	
				alert(m_langDB['sentence_page_must_have_title']);
				return;
			}	
			dialog.close();
			// submit the form.
			$("#pagetitleupdateform").submit();
		});
	};
	
	// move a page up or down in the pageorder.
	this.a_movepage = function(pageorder, direction)
	{
		// create form data
		var formData=new FormData();
		formData.append('ajax', 'movepage');
		formData.append('direction', direction);
		formData.append('pageposition', pageorder);

		BootstrapDialog.show({
			title: m_langDB['sentence_please_wait'],
			message: "<center>"+m_langDB['sentence_applying_changes']+"</center>"
		});

		var xhr=new XMLHttpRequest();
		xhr.open('POST',"AJAX.php",true);

		// Set up a handler for when the request finishes.
		xhr.onload = function ()
		{
			if (xhr.status === 200) {
				m_highlightRemoved=false;
				// The pages were moved.
				if(xhr.responseText!="" && xhr.responseText!=null && xhr.responseText!=0)
					$("#archivecontent").html(xhr.responseText);
			} else {
					alert('AJAX ERROR: move page call failed! (Ref. C) ('+xhr.status+')');
			}
			closeAllDialogs();
		};
		xhr.send(formData);
	}
	
	// create the form for a new blogpost for a given comic id.
	this.a_window_createblogpost = function(id)
	{
		var msg='<center><form id="blogpostcreateform" action="AJAX.php" method="POST">';
		msg=msg+'<hr><table border="0" style="width:100%;" >';
		msg=msg+'<tr><td class="black">'+m_langDB['word_title']+':&nbsp;</td>';
		msg=msg+'<td><input type="text" id="upload_blogtitle" name="upload_blogtitle" /></td></tr>';
		msg=msg+'<tr><td valign="top" class="black">'+m_langDB['word_text']+':&nbsp;</td>';
		msg=msg+'<td><textarea id="upload_blogtext" name="upload_blogtext" style="width:100%;height:200px;"></textarea></td></tr>';
		msg=msg+'</table></form></center>';

		msg=msg+'<script>';
		msg=msg+'var form=document.getElementById("blogpostcreateform");';
		msg=msg+'form.onsubmit = function(event) {';
		msg=msg+	'event.preventDefault();';
		msg=msg+	'ComicCMS.a_createBlogpost('+id+');';
		msg=msg+'};';
		msg=msg+'</script>';

		a_confirmBox(m_langDB['sentence_title_newblogpost'], msg, m_langDB['word_save_blogpost'], function(dialog)
		{
			var blogtitle=$("#upload_blogtitle").val();
			var blogtext=$("#upload_blogtext").val();

			if(blogtitle=="" || blogtext=="")
			{
				alert(m_langDB['sentence_blog_must_have_title_and_text_02']);
				return;
			}

			dialog.close();

			// submit the form.
			$("#blogpostcreateform").submit();
		});
	}
	
	// send the blogpost form to create a new blogpost.
	this.a_createBlogpost = function(id)
	{
		var blogtitle=$('#upload_blogtitle').val();
		var blogtext=$('#upload_blogtext').val();

		// create form data
		var formData=new FormData();

		formData.append('ajax', 'createblogpost');
		formData.append('pageid', id);
		formData.append('blogtitle', blogtitle);
		formData.append('blogtext', blogtext);

		BootstrapDialog.show({
			title: m_langDB['sentence_please_wait'],
			message: "<center>"+m_langDB['sentence_please_wait_for_upload']+"</center>"
        });

		var xhr=new XMLHttpRequest();
		xhr.open('POST',"AJAX.php",true);

		// Set up a handler for when the request finishes.
		xhr.onload = function ()
		{
			if (xhr.status === 200) 
			{
				// Blogpost created. Maybe show response.
				m_highlightRemoved=false;
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
	
	// show a box to update a blog post.
	this.a_updateBlogPostShowForm = function(blogID)
	{
		//var path=dirToRoot+"php/ajax_createUpdateBlogpostForm.php";
		var blogItem=db_getBlogPostByID(blogID);
		if(blogItem==null)
		{
			log("Cannot update blog post. Blog item with id "+blogID+" not found.", LOG_ERROR);
			return;
		}
		
		var msg="";
		msg=msg+'<center><form id="blogpostupdateform" action="../php/ajax_updateblogpost.php" method="POST">';
		msg=msg+'<table border="0" style="width:100%;" >';
		msg=msg+'<tr><td class="black">'+m_langDB['word_title']+':&nbsp;</td>';
		msg=msg+'<td><input type="text" id="update_blogtitle" name="update_blogtitle" value="'+blogItem['TITLE']+'"/></td></tr>';
		msg=msg+'<tr><td valign="top" class="black">'+m_langDB['word_text']+':&nbsp;</td>';

		//replace \n else it will make it <br /> (I don't know why)
		//$text=SQL::sqlToText($blogrow->text);
		//$text=str_replace("\r\n","&#10;",$text);
		//$text=str_replace("\n","&#10;",$text);

		msg=msg+'<td><textarea id="update_blogtext" name="update_blogtext" rows="5" cols="60">'+blogItem['TEXT']+'</textarea></td></tr>';
		msg=msg+'</table></form></center>';

		msg=msg+'<script>';
		msg=msg+'var form=document.getElementById("blogpostupdateform");';
		msg=msg+'form.onsubmit = function(event) {';
		msg=msg+'  event.preventDefault();';
		msg=msg+'  ComicCMS.a_updateBlogpost('+blogItem['ID']+');';
		msg=msg+'};';
		msg=msg+'</script>';

		// show a confirm box with the blog entry data.
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

	// show a window with the blog posts and update stuff for a given post.
	m_actualAdminBlogTitleShowID=-1;
	this.a_showAdminBlogTitles=function(id)
	{
		$('.admin_blogtitles').each(function() {$(this).hide();});
		if(m_actualAdminBlogTitleShowID!=id)
		{	
			$("#admin_blogtitles_"+id).show();
			m_actualAdminBlogTitleShowID=id;
		}else{
			m_actualAdminBlogTitleShowID=-1;
		}
	}
	
	// remove the highlight if something was clicked.
	// this is only used in the admin panel and will
	// be called on any click in the page.
	var m_highlightRemoved =false;	// just once per page load.
	this.a_removeHighlight=function()
	{
		// safe processing power.
		if(m_highlightRemoved==true)
			return;
		
		$('tr').each(function() {$(this).removeClass('highlightitem');});
		$('td').each(function() {$(this).removeClass('highlightitem');});
		m_highlightRemoved=true;
	}
}

ComicCMS.instance =new ComicCMS;
ComicCMS.initialize = function(contentDivId,imagedbname = "", blogdbname = "", langdbname="") {ComicCMS.instance.initialize(contentDivId, imagedbname, blogdbname,langdbname);}

ComicCMS.buildAndShowArchives = function() {ComicCMS.instance.buildAndShowArchives();}

// return the language associated with the given term.
ComicCMS.getLang = function(name) {return ComicCMS.instance.getLang(name);};
ComicCMS.loadLanguage = function(filename, func=null) {ComicCMS.instance.loadLanguage(filename, func);};

// get the next or the previous page.
ComicCMS.nextPage = function() {ComicCMS.instance.nextPage();}
ComicCMS.prevPage = function() {ComicCMS.instance.prevPage();}

// move the page with pageorder a one page up (admin)
ComicCMS.a_movepageup = function(pageorder) {ComicCMS.instance.a_movepage(pageorder, "up");};
// move the page with pageorder a page down (admin)
ComicCMS.a_movepagedown = function(pageorder) {ComicCMS.instance.a_movepage(pageorder, "down");};

// create a comic page.
ComicCMS.a_window_createPage = function() {ComicCMS.instance.a_window_createPage();};
// Update the title of a page.
ComicCMS.a_updatePageTitle = function(pageID) {ComicCMS.instance.a_updatePageTitle(pageID);}
// page upload
ComicCMS.a_pageupload = function() {ComicCMS.instance.a_pageupload();};

// show a box to update a page title.
ComicCMS.a_updatePageTitleForm = function(pageID) {ComicCMS.instance.a_updatePageTitleForm(pageID)}
// show the blog titles and the image for the given comic page on the admin window.
ComicCMS.a_showAdminBlogTitles = function(id) {ComicCMS.instance.a_showAdminBlogTitles(id);}

// create a window to create a new blogpost.
ComicCMS.a_window_createblogpost = function(id) {ComicCMS.instance.a_window_createblogpost(id);}
// send the form to create a blog post.
ComicCMS.a_createBlogpost = function(id) {ComicCMS.instance.a_createBlogpost(id);};
// show the form to update a blog post.
ComicCMS.a_updateBlogPostShowForm = function(blogID) {ComicCMS.instance.a_updateBlogPostShowForm(blogID);}

// call this on a click on body on the admin panel.
ComicCMS.a_removeHighlight = function() {ComicCMS.instance.a_removeHighlight();};

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

// show or hide the date in the archives.
ComicCMS.showArchiveDate=function(id, show=true)
{
	if(show)
		$('#dateof_'+id).css('display', 'block');
	else
		$('#dateof_'+id).css('display', 'none');
}

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
				m_highlightRemoved=false;
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
*/

/*
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
