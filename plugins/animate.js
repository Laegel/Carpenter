/*
settings = {
	duration: number,
	delay: number,
	loop: number|'infinite'
}
*/
Carpenter.registerPlugin('animate', [], function(/*String*/animation, /*Object*/settings) {
	if(settings) {
		var vendors = ['', '-webkit-', '-moz-', '-ms-', '-o-'], thus = this;
		vendors.forEach(function(prefix) {
			if(settings.loop)
				thus.setStyle(prefix + 'animation-iteration-count', settings.loop);
			if(settings.delay)
				thus.setStyle(prefix + 'animation-delay', settings.delay + 's');
			if(settings.duration)
				thus.setStyle(prefix + 'animation-duration', settings.duration + 's');
		});
	}
	log('hi')
	this.addClass(animation).addClass('animated');
	return this;
});

Carpenter.registerPlugin('animateEnd', [], function(/*Function*/callback) {
	var thus = this, effects = [
		'bounce', 'flash', 'pulse' ,'rubberBand', 'shake',
    	'swing', 'tada', 'wobble', 'jello',
    	'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight',
    	'bounceInUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft',
    	'bounceOutRight', 'bounceOutUp', 'fadeIn', 'fadeInDown',
    	'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight',
    	'fadeInRightBig', 'fadeInUp', 'fadeInUpBig', 'fadeOut',
    	'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig',
    	'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig',
    	'flipInX', 'flipInY', 'flipOutX', 'flipOutY', 'lightSpeedIn',
    	'lightSpeedOut', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight',
    	'rotateInUpLeft', 'rotateInUpRight', 'rotateOut', 'rotateOutDownLeft',
    	'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'hinge',
    	'rollIn', 'rollOut', 'zoomIn', 'zoomInDown',
    	'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOut',
    	'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp',
    	'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp',
    	'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp'
	];
	function animationEnds() {
		effects.forEach(function(effect) {
			if(thus.hasClass(effect))
				thus.removeClass(effect);
		});
		thus.removeClass('animated');
		thus.getTag().removeEventListener('animationend', animationEnds, true);
		thus[callback] = callback;
		thus[callback]();
	}
	var Event = Carpenter.use('EventManager');
	this.getTag().addEventListener('animationend', animationEnds, true);//TODO voir pour laisser en addEventListener ou passer par tie()
	//this.tie(new Event(['webkitAnimationEnd', 'mozAnimationEnd', 'MSAnimationEnd', 'oanimationend', 'animationend'], animationEnds, true));

	return this;
});