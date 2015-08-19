toBoolean = function(value) {
	if(typeof(value) === 'boolean')
		return value;
	if(typeof(value) === 'number')
		value = value.toString();
	var trueBooleans = [true, 'true', 1, '1', 'yes', 'on'];
	var falseBooleans = [false, 'false', 0, '0', 'no', 'off'];
	if(trueBooleans.indexOf(value.toLowerCase()) > -1)
		return true;
	else if(falseBooleans.indexOf(value.toLowerCase()) > -1)
		return false;
	else
		return false;
}