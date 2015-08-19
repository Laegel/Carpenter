(function($, Translator) {
	Skin = function Skin(code, skinData) {
		this.variableRegex = /\{#([\w \|]*)\#\}/;
		this.translateRegex = /\{=([\w \|,]*)\=\}/;
		this.code = code;
		this.extractData(skinData);
	}

	Skin.prototype.scanChildren = function(code, skinData) {
		if(skinData)
			this.extractData(skinData);
        var variables = this.data.variableBlocks;
        var loops = this.data.loopBlocks;
		code = this.checkCondition(code, variables);
        code = this.checkLoop(code, loops, skinData);
        return this.executeVariableBlocks(this.executeTranslateBlocks(code, variables), variables);
	}

	/*
	 * Gets code, parses with jQuery, checks and returns code
	 */
	Skin.prototype.checkCondition = function(code, variables) {
		var checkCondition = $(code);
		if(checkCondition.hasAttr('skif')) {
            var skif = checkCondition.attr('skif');
            if(variables[skif]) {
                if($.toBoolean(variables[skif])) {
                	checkCondition.removeAttr('skif');
                	return checkCondition.outerHTML();
                } else 
                	return '';
            } else
                return '';
        }
        return code;
	}

	/*
	 * Gets code, parses with jQuery, checks and returns code
	 */
	Skin.prototype.checkLoop = function(code, loops, skinData) {
		var checkLoop = $(code);
		var newNodeHTML = '';
        var children = checkLoop.contents();
        var $this = this;
        if(checkLoop.hasAttr('skloop')) {
            var skloop = checkLoop.attr('skloop');
            if(loops[skloop]) {
                checkLoop.removeAttr('skloop');
                for(var i = 0; i < loops[skloop].length; ++i) {
                    if(typeof(loops[skloop]) === 'array' || typeof(loops[skloop]) === 'object')
                        newNodeHTML += $this.scanChildren(checkLoop.outerHTML(), loops[skloop][i]);
                }
            } else
                return '';
        } else {
        	$.each(children, function(key, child) {
                if(child.nodeType === 1)
                    newNodeHTML += $this.scanChildren($(child).outerHTML(), skinData);
                else if(child.nodeType === 3)
                    newNodeHTML += child.textContent;
        	});
        }
        if(newNodeHTML !== '')
            code = newNodeHTML;
        checkLoop.html(code);
        return checkLoop.outerHTML();
	}

	Skin.prototype.extractData = function(skinData) {
        var $this = this;
		this.data = {
			'loopBlocks':{},
			'variableBlocks':{}
		};
        $.each(skinData, function(key, value) {
            switch (typeof(value)) {
                case 'object':
                case 'array':
                    $this.data.loopBlocks[key] = value;
                    break;
                default:
                    $this.data.variableBlocks[key] = value;
                    break;
            }
        });
	}

	Skin.prototype.executeVariableBlocks = function(code, variableBlocks) {
        if (variableBlocks) {
        	var matchVariable = code.matchAll(this.variableRegex);
            if (matchVariable) {
                for (var variables = 0; variables < matchVariable.length; ++variables) {
                    var explodeVar = matchVariable[variables][1].split('|');
                    var property = explodeVar[0].replace(' ', '');
                    if (variableBlocks[property]) {
                        if(explodeVar[1]) {
                            var explodeFunc = explodeVar[1].split(' ');
                            for(var i = 0; i < explodeFunc.length; ++i) {
                                var $func = this[explodeFunc[i]];
                                if(explodeFunc[i] && typeof $func === 'function')
                                    variableBlocks[property] = $func(variableBlocks[property]);   
                            }
                        }
                        return code.replace(matchVariable[variables][0], variableBlocks[property]);
                    } else
                        return code.replace(matchVariable[variables][0], '');
                }
            }
        }
        return code;
    }

    Skin.prototype.executeTranslateBlocks = function(code, variableBlocks) {
        if(variableBlocks) {
			var matchTranslate = code.matchAll(this.translateRegex);
			if(matchTranslate) {
				for(var translates = 0; translates < matchTranslate.length; ++translates) {
	                var explodeTranslate = matchTranslate[translates][1].replace(/ /g,'').split('|');
	                if(explodeTranslate[1]) {
	                    var arguments = explodeTranslate[1].split(',');
	                    var variables = [];
	                    for(var i = 0; i < arguments.length; ++i) 
	                    	variables[i] = variableBlocks[arguments[i]] ? variableBlocks[arguments[i]] : '"' + arguments[i] + '"';                        
	                    return code.replace(matchTranslate[0][translates], Translator._(explodeTranslate[0], variables));
	                } else
	                    return code.replace(matchTranslate[0][translates], Translator._(explodeTranslate[0]));
	            }	
			}
        }
        return code;
    }

    Skin.prototype.render = function() {
        var domNode = $('<div id="skinTemporaryDiv">' + this.code + '</div>')
        var children = domNode.contents();
        var $this = this;
        var outHTML = '';
        $.each(children, function(key, child) {
            outHTML += $this.scanChildren($(child).outerHTML());
        });

    	return outHTML;
	}

	/*
	 * Skin functions & aliases
	 */
	Skin.prototype.e = Skin.prototype.escape = function(string) {
		return string.htmlentities();
	}

	Skin.prototype.df = Skin.prototype.date = function(date) {
		var date = new Date(date);
		return date.format('dd/mm/yyyy')
	}

	Skin.prototype.l = Skin.prototype.link = function(string) {

	}
	return Skin;
}($, Translator));