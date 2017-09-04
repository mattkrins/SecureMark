var Crypto = [];
Crypto.Preface = "_encryptbook";
Crypto.CheckSum = "_ebcheck";
Crypto.Empty = "_ebempty";
Crypto.Encode = function(plainText, password){
	if ((plainText.length >= this.Preface.length) && (plainText.indexOf(this.Preface) != -1)){return {error:"Already Encrypted."};}
	if (plainText==""){plainText=this.Empty;}
	var b64 = CryptoJS.AES.encrypt(plainText+(this.CheckSum), password).toString();
	var e64 = CryptoJS.enc.Base64.parse(b64);
	var eHex = e64.toString(CryptoJS.enc.Hex);
	return {error:false,text:(eHex+(this.Preface))};
}
Crypto.Decipher = function(cipherText, password){
	if (cipherText.length<this.Preface.length){return {error:"Not Encrypted."};}
	if (cipherText.indexOf(this.Preface) == -1){return {error:"Not Encrypted."};}
	var cipher = cipherText.slice(0, -this.Preface.length);
	var reb64 = CryptoJS.enc.Hex.parse(cipher);
	var bytes = reb64.toString(CryptoJS.enc.Base64);
	var decrypt = CryptoJS.AES.decrypt(bytes, password);
	try { var plain = decrypt.toString(CryptoJS.enc.Utf8); }catch (ex) { return {error:"Decryption Error."}; }
	var check = plain.slice(-this.CheckSum.length);
	if (check!=this.CheckSum){return {error:"CheckSum Failed."};}
	var checked = plain.slice(0, -this.CheckSum.length);
	if (checked==this.Empty){checked="";}
	return {error:false,text:checked};
}