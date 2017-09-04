var models = []
function makeModel(buttonIdentifier, modelIdentifier){
	if(models[modelIdentifier]){return;}
	models[modelIdentifier] = true;
	var modBtn  = $(buttonIdentifier), modal = $(modelIdentifier), close = modal.find('.close'),
	modContent = modal.find('.modal-content');
	modBtn.on('click', function() {
		modal.css('display', 'block');
		modContent.removeClass('modal-animated-out').addClass('modal-animated-in');
	});
	$(document).on('click', function(e) {
		var target = $(e.target);
		if(target.is(modal) || target.is(close)) {modContent.removeClass('modal-animated-in').addClass('modal-animated-out').delay(300).queue(function(next) {modal.css('display', 'none');next();});}
	});
}

var StrengthScore = 0;
function passwordStrength(password) {
	var desc = new Array();
	desc[0] = "<i class='fa fa-thumbs-o-down' aria-hidden='true'></i> Useless";
	desc[1] = "<i class='fa fa-meh-o' aria-hidden='true'></i> Weak";
	desc[2] = "<i class='fa fa-thumbs-o-up' aria-hidden='true'></i> Better";
	desc[3] = "<i class='fa fa-star-half-o' aria-hidden='true'></i> Average";
	desc[4] = "<i class='fa fa-star' aria-hidden='true'></i> Good";
	desc[5] = "<i class='fa fa-shield' aria-hidden='true'></i> Strong";
	desc[6] = "<i class='fa fa-trophy' aria-hidden='true'></i> Epic";
	desc[7] = "<i class='fa fa-user-secret' aria-hidden='true'></i> Professional";
	desc[8] = "<i class='fa fa-rocket' aria-hidden='true'></i> Ludicrous";
	var score = 0;
	if (password.length > 6) score++;
	if ( ( password.match(/[a-z]/) ) && ( password.match(/[A-Z]/) ) ) score++;
	if (password.match(/\d+/)) score++;
	if ( password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) )	score++;
	if (password.length > 12) score++;
	if (password.length > 30) score++;
	if (password.length > 40) score++;
	if (password.length > 100) score++;
	StrengthScore = score;
	if (!password || password.length <= 0){$('#passwordStrength').html("Choose a password");}else{$('#passwordStrength').html(desc[score]);}
	document.getElementById("passwordStrength").className = "strength" + score;
}
function setDisabled(d) {$("#save-password").prop('disabled', d);}
function updateSaveButton() {
	if(StrengthScore<=0){setDisabled(true); return true;}
	if($('#password-confirm').val() != $('#password').val()){setDisabled(true); return true;}
	setDisabled(false); return false;
}
function reloadPage(){
	$('#password, #password-confirm, #decrypt-password').val('');
	passwordStrength($('#password').val()); updateSaveButton();
	if(Bookmarks.GetStorage()){
		$( "#encrypt-ready, .helper" ).show();
		$( "#choose-password" ).hide();
	}else{
		$( "#choose-password" ).show();
		$( "#encrypt-ready, .helper" ).hide();
	}
}
$(function() {
	$('.tip').tipr({'mode': 'above'});
	makeModel('#lost', '#lost_password');
	makeModel('#privacy', '#usage_agreement');
	reloadPage();
	$('#encrypt').click(function(){ Bookmarks.Encrypt(Bookmarks.GetStorage()); });
	$('#password-change').click(function(){ Bookmarks.PurgeStorage(); reloadPage(); });
	$('#password').keyup(function() { passwordStrength($('#password').val()); updateSaveButton(); });
	$('#password-confirm').keyup(function() {
		if($('#password-confirm').val() != $('#password').val()){$('#passwordStrength').html("Passwords don't match");}else{passwordStrength($('#password').val());}
		updateSaveButton();
	});
	$('#password-save').click(function(){
		if ($(this).is(':checked')) {
			$( "#save-password" ).html( "<i class='fa fa-arrow-circle-right' aria-hidden='true'></i> Continue" );
		} else {
			$( "#save-password" ).html( "<i class='fa fa-shield' aria-hidden='true'></i> Encrypt" );
		}
	});
	$('#save-password').click(function(){
		if(updateSaveButton()){return false;}
		var pass = $('#password').val();
		if (!pass || pass.length <=0){return false;}
		if ($("#password-save").is(':checked')) {
			Bookmarks.SetStorage(pass);
		}else{
			Bookmarks.Encrypt(pass);
		}
		reloadPage();
	});
	$('#decrypt').click(function(){
		var pass = $('#decrypt-password').val();
		if (!pass || pass.length <=0){return false;}
		Bookmarks.Decrypt(pass);
	});
});

Bookmarks.onStart = function(){
	if(progressJs){ progressJs().setOptions({overlayMode: true, theme: 'blueOverlayRadiusHalfOpacity'}).start(); }
};
Bookmarks.onFinish = function(){
	if(progressJs){ progressJs().end(); }
	$('.dp').html('');
	
	if(Bookmarks.Action=="decrypting"){
		if (!$("#password-remember").is(':checked')){Bookmarks.PurgeStorage();}
	}
	if(Bookmarks.Action=="encrypting"){Bookmarks.PurgeStorage();}
	reloadPage();
};
Bookmarks.onUpdate = function(progress){
	if (progressJs){ progressJs().set(progress); }
	$('.dp').html(progress+'%');
	console.log(progress);
};

chrome.runtime.onSuspend.addListener(function(){Bookmarks.PurgeStorage();});