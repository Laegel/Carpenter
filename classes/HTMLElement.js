HTMLElement.prototype.rootPath = function() {
    var sameTag = Array.prototype.slice.call(document.getElementsByTagName(this.tagName)), i, match, siblingsSameTag = [];
        for(i = 0; i < sameTag.length; ++i) {
        if(sameTag[i].parentNode === this.parentNode)
            siblingsSameTag.push(sameTag[i]);
    }
    for(i = 0; i < sameTag.length; ++i) {
        if(siblingsSameTag[i] === this) {
            match = i + 1;
            break;
        }
    }
    var targetString = this.tagName !== 'HTML' && this.tagName !== 'BODY' ? ':nth-child(' + match + ')' : targetString = '';
    return this.parentNode.tagName !== undefined ? this.parentNode.rootPath() + ' > ' + this.tagName.toLowerCase() + targetString : this.tagName.toLowerCase() + targetString;
};