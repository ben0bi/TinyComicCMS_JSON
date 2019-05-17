# TinyComicCMS_JSON

"Fork" of TinyComicCMS on github.com/ben0bi

Hopefully the most tiny webcomic CMS and Frontend. 

NOW it's gonna be tiny.

All the php files will vanish except for the ajax ones,
which will reside as functions in ONE file now.

No SQL needed anymore.

Partial rewrite: Updating all the stuff with JS instead of PHP.
After that, there will be a complete rewrite which is even smaller.

The frontend runs completely on JavaScript now.
This one is running properly again.
(The "test data" is my own data. I did not add the images, though ;) )

The admin backend needs PHP for security reasons.
I am on it right now. It is partial running.

JSON Version. No Database is used here. PHP is only used to upload files and
save the JSON-"Database".

Easy PC handling: Use left and right arrow keys to get previous or next post.  
-> Title beneath the mouse when over image.

Support for Tablets and Smartphones:  
-> Swipe to the left or right on the image to load the next or previous post.  
-> Title in top-left of image when touching.  

Blog function:  
-> Each post can have several "blog" entries.  
This blog is actually only for the creator, there is no commenting function right now.

Where is the administration login link?    
-> There is no administration link (right now) for security reasons.    
-> Just go to page/_admin/sudo.php or just page/_admin/ (--> index.html)    
		The index.html redirects to sudo.php.    
		You can use another index.html for even more security, so a hacker will find "nothing" there.    
