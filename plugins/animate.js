/*global Carpenter*/
/*
 settings = {
 duration: number,
 delay: number,
 loop: number|'infinite'
 }
 */
Carpenter.Effects = [
    'bounce', 'flash', 'pulse', 'rubberBand', 'shake',
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

//Système de "queue" : animate crée un nouvel élément dans la pile des effets à effectuer
Carpenter.registerPlugin('animate', ['animate/animate.css'], function(/*String*/effect, /*Object*/settings) {
    var duration = 1, loop = 1, delay = 0, index = this.getPointer(), tag = this.getTag(),
        vendors = ['', '-webkit-', '-moz-', '-ms-', '-o-'], thus = this;

    if(!Carpenter.isSet(this.activeAnimation))
        this.activeAnimation = [];
    if(!Carpenter.isSet(this.activeAnimation[index]))
        this.activeAnimation[index] = [];

    if(settings) {
        if(settings.loop)
            loop = settings.loop;
        if(settings.delay)
            delay = settings.delay;
        if(settings.duration)
            duration = settings.duration;
    }
    this.activeAnimation[index].push({
        effect: effect, duration: duration, loop: loop,
        delay: delay
    });

    if(1 === this.activeAnimation[index].length) {

        thus.addClass('animated');
        function recursEffect(current) {
            vendors.forEach(function(prefix) {
                thus.setStyle(prefix + 'animation-iteration-count', current.loop);
                thus.setStyle(prefix + 'animation-delay', current.delay + 's');
                thus.setStyle(prefix + 'animation-duration', current.duration + 's');
            });
            thus.addClass(current.effect);
            setTimeout(function(current) {
                var next = thus.activeAnimation[index][1];
                log(current)
                thus.removeClass(current.effect);

                if(Carpenter.isSet(next))
                    recursEffect(next);
                else
                    thus.removeClass('animated');
                thus.activeAnimation[index].shift();
            },
                    current.duration * 1000,
                    current);
        }

        recursEffect(this.activeAnimation[index][0]);

        if(0 === this.activeAnimation[index].length)
            delete this.activeAnimation[index];


    }
    return this;
});

//TODO -> Clear timeout de "animate"
//"Stop" va retirer/annuler le premier effet de la pile d'effet. Si aucune valeur n'est passée, il supprime tout.
Carpenter.registerPlugin('stop', [], function(/*[Integer]*/toStop) {
    var thus = this, index = this.getPointer(), i = 0, removed;
    if(!Carpenter.isSet(toStop)) {
        delete this.activeAnimation[index];
        Carpenter.Effects.forEach(function(effect) {
            if(thus.hasClass(effect))
                thus.removeClass(effect);
        });
    } else {
        while(i < toStop) {
            removed = this.activeAnimation[index].shift();
            log(this.activeAnimation)
            Carpenter.Effects.forEach(function(effect) {
                if(thus.hasClass(removed.effect))
                    thus.removeClass(effect);
            });
            ++i;
        }
        if(0 === this.activeAnimation[index].length)
            delete this.activeAnimation[index];
    }

    if(1 === this.activeAnimation.length && undefined === this.activeAnimation[0])
        delete this.activeAnimation;
    return this;
});
