var Bookmarks = [];
Bookmarks.Storage = "EncryptPass";
Bookmarks.Action = "waiting";

function CountChildArray(f, cb) { cb(f);if (f.children && f.children.length > 0) { return CountArray(f.children, cb)+1; }else{ return 1; } }
function CountArray(f, cb) { var c = 0;var i=0; for (i = 0; i < f.length; i++) {c=c+CountChildArray(f[i], cb);} return c; }
function Process(cb) { var array = []; chrome.bookmarks.getTree(function(bm) { CountArray(bm, function(b){ array.push(b); }); cb(array); }); }

Bookmarks.Reset = function() {
	chrome.browserAction.setIcon({path: "img/icon.png"});
	Bookmarks.Action = "waiting";
	chrome.browserAction.setTitle({ title: "SecureMark" });
}
Bookmarks.PurgeStorage = function() { localStorage.removeItem(Bookmarks.Storage); Bookmarks.Reset(); }
Bookmarks.GetStorage = function() {
	var stored = localStorage.getItem(Bookmarks.Storage);
	if(stored){chrome.browserAction.setIcon({path: "img/icon_ready.png"});}
	return stored;
}
Bookmarks.SetStorage = function(pass) {
	localStorage.setItem(Bookmarks.Storage, pass);
	chrome.browserAction.setIcon({path: "img/icon_ready.png"});
	chrome.browserAction.setTitle({ title: "Encrypt Now" });
}
Bookmarks.Encrypt = function(pass) {
	if(!pass || pass.length<=0){console.error('No Password Provided.');return false;}
	Process(function(b){ worker.postMessage({'cmd': 'encrypt', 'bookmarks': b, 'password': pass}); });
	chrome.browserAction.setBadgeBackgroundColor({ color: "#EF4937" });
	chrome.browserAction.setIcon({path: "img/icon_ready.png"});
	Bookmarks.Action = "encrypting";
}
Bookmarks.Decrypt = function (pass) {
	if(!pass || pass.length<=0){console.error('No Password Provided.');return false;}
	localStorage.setItem(Bookmarks.Storage, pass);
	Process(function(b){ worker.postMessage({'cmd': 'decrypt', 'bookmarks': b, 'password': pass}); });
	chrome.browserAction.setBadgeBackgroundColor({ color: "#498BF4" });
	chrome.browserAction.setIcon({path: "img/icon_decrypt.png"});
	Bookmarks.Action = "decrypting";
}
	
Bookmarks.onFinish = function(){}; Bookmarks.onStart = function(){}; Bookmarks.onUpdate = function(progress){};
var worker = new Worker('js/bookmark-worker.js');
worker.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.status) {
		case 'updated':
			if(data.id && data.updated){ chrome.bookmarks.update(String(data.id), data.updated); }
		break;
		case 'progress':
			Bookmarks.onUpdate(data.progress);
			chrome.browserAction.setBadgeText({ text: String(data.progress) });
			//if(data.progress>=100){Bookmarks.onFinish();}
		break;
		case 'finished':
			$('body').css('cursor', 'default');
			$('a').css('cursor', 'pointer');
			Bookmarks.onFinish();
			chrome.browserAction.setBadgeText({ text: "" });
			Bookmarks.Reset();
		break;
		case 'working':
			$('body').css('cursor', 'wait');
			$('a').css('cursor', 'wait');
			Bookmarks.onStart();
		break;
	};
}, false);



