self.importScripts('crypto-js.min.js');
self.importScripts('encryption.js');
self.progress = 0;

function valid(b) { if(!b){return false;} if(!b.id || b.id == 0 || b.id == "0"){return false;} if(b.parentId == "0" || b.parentId == 0){return false;} if(b.unmodifiable){return false;} return true; }
function updateBookmark(b, u){ 
	self.postMessage({status: 'updated', id : b.id, updated : u});
}
function updateProgress(k, v){
	var p = Math.round(k/(v-1)*100);
	if (p > self.progress){ 
		self.progress = p
		self.postMessage({status: 'progress', progress : self.progress});
	}
	if (k >= (v-1)){ self.postMessage({status: 'finished'}); }
}

//if (bookmark.dateAdded) {console.log(bookmark.dateAdded);}
self.addEventListener('message', function(e) {
	var data = e.data; switch (data.cmd) {
		case 'encrypt':
			if(!data.password){return;}
			self.postMessage({status: 'working'});
			self.progress = 0;
			var bookmarks = data.bookmarks;
			var size = bookmarks.length;
			var k=0; for (k = 0; k < size; k++) {
				updateProgress(k, size);
				var bookmark = bookmarks[k]; if (!valid(bookmark)) {continue;}
				var updated = {title:bookmark.title,url:bookmark.url};
				if (bookmark.title) {
					var title = Crypto.Encode(bookmark.title, data.password); 
					if(title.error){console.warn(title.error);}
					if(title.text){updated.title = title.text;}
				}
				if (bookmark.url) {
					var url = Crypto.Encode(bookmark.url, data.password);
					if(url.error){console.warn(url.error);}
					if(url.text){updated.url = 'http://'+url.text;}
				}
				updateBookmark(bookmark, updated);
			}
		break;
		case 'decrypt':
			if(!data.password){return;}
			self.postMessage({status: 'working'});
			self.progress = 0;
			var bookmarks = data.bookmarks;
			var size = bookmarks.length;
			var k=0; for (k = 0; k < size; k++) {
				updateProgress(k, size);
				var bookmark = bookmarks[k]; if (!valid(bookmark)) {continue;}
				var updated = {title:bookmark.title,url:bookmark.url};
				if (bookmark.title) {
					var title = Crypto.Decipher(bookmark.title, data.password);
					if(title.error){console.warn(title.error);}
					if(title.text){updated.title = title.text;}
				}
				if (bookmark.url) {
					var url = Crypto.Decipher(bookmark.url.replace(/(^\w+:|^)\/\//, '').replace(/\//g, ''), data.password);
					if(url.error){console.warn(url.error);}
					if(url.text){updated.url = url.text;}
				}
				updateBookmark(bookmark, updated);
			}
		break;
	};
}, false);