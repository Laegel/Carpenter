String.prototype.addSlashes = function(string) {
    return (string + '')
            .replace(/[\\"']/g, '\\jnt&')
            .replace(/\u0000/g, '\\0');
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.matchAll = function(regexp) {
	var reg = new RegExp(regexp);
	var text = this;
	var result;
	var matches = [];
	while ((result = reg.exec(text)) !== null) {
		matches.push([result[0], result[1]]);
	    var LinkText = result[1];
	    var Match = result[0];
	    text = text.replace(Match, '');
	}
	return matches;
};

String.prototype.htmlentities = function() {
    return String(this).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
};

String.prototype.stripAccents = function(toReplace) {
    toReplace = toReplace.replace(/ /g, '_');
    var stripAccents = (function() {
        var in_chrs = 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
                out_chrs = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY',
                chars_rgx = new RegExp('[' + in_chrs + ']', 'g'),
                transl = {}, i,
                lookup = function(m) {
                    return transl[m] || m;
                };
        for(i = 0; i < in_chrs.length; i++)
            transl[ in_chrs[i] ] = out_chrs[i];

        return function(s) {
            return s.replace(chars_rgx, lookup);
        };
    })();
    return stripAccents(toReplace);
};


// Truncate a string to a given length
String.prototype.truncate = function(length) {
    var output;
    if (this.length > length) 
        output = this.substring(0, length);
    return output;
};

String.prototype.onlyLetters = function(str) {
    return this.toLowerCase().replace(/[^a-z]/g, '');
};

String.prototype.onlyAlphanum = function(str) {
    return this.toLowerCase().replace(/[^a-z,0-9,-]/g, '');
};

String.prototype.toCamelcase = function(){
    return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

String.prototype.toDash = function(){
    return this.replace(/([A-Z])/g, function($1){return '-'+$1.toLowerCase();});
};

String.prototype.toUnderscore = function(){
    return this.replace(/([A-Z])/g, function($1){return '_'+$1.toLowerCase();});
};

String.prototype.contains = function(string) {
    return this.indexOf(string) > -1;
};