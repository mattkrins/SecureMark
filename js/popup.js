$(function() {
	Bookmarks.onStart = function(progress){
		if(progressJs){ progressJs().setOptions({overlayMode: true, theme: 'blueOverlayRadiusWithPercentBar'}).start().autoIncrease(5, 100); }
	};
	Bookmarks.onUpdate = function(progress){
		if (progressJs && progress&&progress>2){ progressJs().set(progress); }
	};
	Bookmarks.onFinish = function(progress){
		if(progressJs){ progressJs().end(); }
		Bookmarks.PurgeStorage();
		window.close();
	};
	var pass = Bookmarks.GetStorage();
	if(pass){
		Bookmarks.Encrypt(pass);
	}else{
		chrome.runtime.openOptionsPage(function(){ if(chrome.runtime.lastError){window.open("options.html", '_blank').focus();} });
		window.close();
	}
});
chrome.runtime.onSuspend.addListener(function(){Bookmarks.PurgeStorage();});