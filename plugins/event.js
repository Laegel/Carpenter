/*global Carpenter*/

Carpenter.activeEvents = {};
Carpenter.Events = {
    native: [
        'abort', 'activate', 'blur', 'change', 'click', 'copy', 'cut', 'dblclick',
        'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
        'error', 'finish', 'focus', 'focusin', 'focusout', 'hashchange', 'help', 'hover',
        'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove',
        'mouseout', 'mouseover', 'mouseup', 'offline', 'online', 'paste', 'resize', 'scroll',
        'select', 'submit', 'touchcancel', 'touchend', 'touchenter', 'touchleave', 'touchmove', 'touchstart'
    ],
    custom: {
        contentmodified: {
            check: function() {
                return true;
            },
            init: function(callback) {
                Carpenter(this.element).on('DOMSubtreeModified', {event: this, callback: callback}, this.innerCallback);
            },
            remove: function() {
                Carpenter(this.element).off('DOMSubtreeModified', {event: this}, this.innerCallback);
            },
            innerCallback: function(event) {
                var Carpenterthis = event.data.event;
                var element = Carpenter(Carpenterthis.element);
                element[event.data.callback] = event.data.callback;
                element[event.data.callback](event);
            }
        },
        clickout: {//TODO
            check: function() {
                return true;
            },
            init: function(settings) {
                var innerCallback = this.innerCallback;
                document.addEventListener('click', (function(settings) {
                    return function(e) {
                        innerCallback(e, settings);
                    };
                })(settings), true);
            },
            remove: function() {
                document.removeEventListener('click', this.innerCallback, true);
            },
            innerCallback: function(event, settings) {

                var element = settings.element, elementOffset = element.offset();
                if((event.pageX < elementOffset.left || event.pageX > elementOffset.left + element.outerWidth()) ||
                        (event.pageY < elementOffset.top || event.pageY > elementOffset.top + element.outerHeight())) {
                    element[settings.callback] = settings.callback;
                    element[settings.callback](event);
                }
            }
        },
        enter: {
            check: function(event) {
                return event.keyCode === 13 && event.type === 'keypress';
            }
        },
        escape: {
            check: function(event) {
                return event.keyCode === 27 && event.type === 'keypress';
            }
        },
        hovering: {
            check: function(event) {
                return true;
            }
        },
        lclick: {
            check: function(event) {
                return event.which === 1 && event.type === 'mouseup';
            }
        },
        mclick: {
            check: function(event) {
                return event.which === 2 && event.type === 'mouseup';
            }
        },
        rclick: {
            check: function(event) {
                return event.which === 3 && event.type === 'mouseup';
            }
        },
        swipe: {
        }
    }
};
this.addTiedEvent = function(event) {//TODO
    if(!protected.tiedEvents[protected.pointer]) {
        protected.tiedEvents[protected.pointer] = [event];
    } else
        protected.tiedEvents[protected.pointer].push(event);
    return this;
};


Carpenter.registerPlugin('tie', [], function(/*EventManager*/eventObject, /*[Object]*/data, /*[Boolean]*/triggerOnce) {
    var selector = this.selector === '' ? this.selector = this.getFromRoot() : this.selector,
            splittedEvents = eventObject.list, countEvents = splittedEvents.length, i;

    for(i = 0; i < countEvents; ++i) {
        this.addTiedEvent({
            type: splittedEvents[i],
            handler: eventObject.callback,
            initialized: false
        });
    }

    var activeEvents = this.tiedEvents[this.getPointer()];
    if(0 === activeEvents.length - countEvents) {
        function triggerCallback(event, element, callback) {
            for(i = 0; i < element.length; ++i)
                if(element.getTag(i).contains(event.target)) {
                    element.setPointer(i);
                    break;
                }
            element[callback] = callback;
            element[callback](event, data);
            if(triggerOnce)
                element.untie(eventObject);
        }
        var eventTrick = ['blur', 'change', 'click', 'dblclick', 'error', 'focus', 'focusin', 'focusout',
            'hover', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave',
            'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit'],
                customEvents = Carpenter.Events.custom, nativeEvents = Carpenter.Events.native, i, j, k,
                thus = this;
        eventTrick.forEach(function(eventName) {
            thus.getTag().addEventListener(
                    eventName,
                    function(event) {
                        for(j = 0; j < activeEvents.length; ++j) {
                            if(customEvents[activeEvents[j].type] && !activeEvents[j].initialized) {

                                if(typeof customEvents[activeEvents[j].type].init === 'function' && typeof customEvents[activeEvents[j].type].innerCallback !== 'function')
                                    customEvents[activeEvents[j].type].init({callback: activeEvents[j].handler, element: thus, event: event});
                                else if(typeof customEvents[activeEvents[j].type].init === 'function' && typeof customEvents[activeEvents[j].type].innerCallback === 'function')
                                    customEvents[activeEvents[j].type].init({callback: activeEvents[j].handler, element: thus, event: event});
                                activeEvents[j].initialized = true;
                            }
                            if(customEvents[activeEvents[j].type] && customEvents[activeEvents[j].type].check(event) && !customEvents[activeEvents[j].type].innerCallback) {

                                triggerCallback(event, thus, activeEvents[j].handler);
                                return;
                            }
                        }
                        if(nativeEvents.contains(event.type)) {
                            for(k = 0; k < activeEvents.length; ++k) {
                                if(activeEvents[k].type === event.type) {
                                    triggerCallback(event, thus, activeEvents[k].handler);
                                    return;
                                }
                            }
                        }

                    }, //callback
                    false
                    );//addEventListener

        });
    }
    //if(activeEvents[selector].indexOf('clickout') === -1)//Simple trick to init all events except clickout
    this.getTag().dispatchEvent(new Event('blur'));
    return this;
});


/*
 * 
 * if(protected.tiedEvents[protected.pointer]) {
 protected.tiedEvents[protected.pointer].forEach(function(element, key, value) {
 if(event === element) {
 delete protected.tiedEvents[protected.pointer][key];
 return this;
 }
 });
 }
 */

Carpenter.registerPlugin('untie', [], function(/*Event*/event) {
    var selector = this.selector === '' ? this.selector = this.getFromRoot() : this.selector,
            splittedEvents = event.list, countEvents = splittedEvents.length, i, exists, index,
            eventTrick = ['blur', 'change', 'click', 'dblclick', 'error', 'focus', 'focusin', 'focusout',
                'hover', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave',
                'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit'];

    if(!event) {//If no arguments are passed, it will remove all events bound to the element
        this.forEach(function() {
            var thus = this;
            eventTrick.forEach(function(eventName) {
                thus.tags[thus.pointer].addEventListener(eventName);
            });
        });
        delete Carpenter.activeEvents[selector];
    } else {
        var splittedEvents = event.list,
                countEvents = splittedEvents.length,
                customEvents = Carpenter.Events.custom, nativeEvents = Carpenter.Events.native, activeEvents = Carpenter.activeEvents[this.selector];
        if(activeEvents) { //If events data are set
            for(i = 0; i < countEvents; ++i) {
                for(index in activeEvents) {
                    if(splittedEvents[i] === activeEvents[index].type && '' + activeEvents[index].handler === '' + event.callback) {
                        activeEvents.splice(index, 1);
                        if(customEvents[splittedEvents[i]] && customEvents[splittedEvents[i]].remove === 'function')
                            customEvents[splittedEvents[i]].remove();
                    } else if(!event.callback)
                        activeEvents = {};
                }
            }
        }
    }
    return this;
});