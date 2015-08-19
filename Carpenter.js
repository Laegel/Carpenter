var Carpenter = {
    cleanArray: function(array) {//TODO
        var newArray = {};
        Carpenter.each(array, function(key, val) {
            if(typeof val === 'object')
                val = cleanArray(val);
            if(val)
                newArray[key] = val;
        });
        return newArray;
    },
    getCookie: function(/*String*/index) {
        var name = index + '=', ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; ++i) {
            var c = ca[i].trim();
            if(c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return '';
    },
    getKey: function() {
        return Carpenter.application.token.substr(0, 8);
    },
    getType: function(/*Object*/object) {
        return Object.prototype.toString.call(object).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
    },
    isEmpty: function(/*Object*/object) {
        if(undefined === object)
            return true;
        return Object.getOwnPropertyNames(object).length === 0;
    },
    isElement: function(/*Object*/object) {
        return object instanceof(Carpenter.Framework.Interact.Element.Element);
    },
    isSet: function(/*Misc*/primitive) {
        return undefined !== primitive;
    },
    init: function(/*Function*/callback, /*[Boolean]*/isDev) {
        Application = Carpenter.use('Application'), Router = Carpenter.use('Router'), PluginManager = Carpenter.use('PluginManager');
        var classes = isDev ? ['Array', 'Date', 'Number', 'Object', 'String'] : ['classes'];
        classes.forEach(function(className) {
            Carpenter.loadScript('classes/' + className + '.js');
        });
        callback();
        var dependencies = Carpenter.Dependencies;
        dependencies.forEach(function(path) {
            Carpenter.loadScript('libs/' + path + '.js');//TODO allow CSS dependencies and set style tag
        });
        delete Application;
        delete Router;
    },
    loadScript: function(/*String*/source) {
        var script = document.createElement('script');
        script.onerror = function() {
            throw new Error('Script could not be loaded at "' + this.src + '"');
        };
        var xhrObj = new XMLHttpRequest();
        xhrObj.open('GET', source, false);
        xhrObj.send('');

        script.type = 'text/javascript';
        script.text = xhrObj.responseText;
        document.getElementsByTagName('body')[0].appendChild(script);
    },
    makeSelector: function(/*HTMLElement*/node) {
        var sameTag = Array.prototype.slice.call(document.getElementsByTagName(node.tagName)), i, match, siblingsSameTag = [];
        for(i = 0; i < sameTag.length; ++i) {
            if(sameTag[i].parentNode === node.parentNode)
                siblingsSameTag.push(sameTag[i]);
        }
        for(i = 0; i < sameTag.length; ++i) {
            if(siblingsSameTag[i] === node) {
                match = i + 1;
                break;
            }
        }
        var targetString = node.tagName !== 'HTML' && node.tagName !== 'BODY' ? ':nth-child(' + match + ')' : targetString = '';
        return node.parentNode.tagName !== undefined ? this.makeSelector(node.parentNode) + ' > ' + node.tagName.toLowerCase() + targetString : node.tagName.toLowerCase() + targetString;
    },
    parseHtml: function(/*String*/html) {
        var temp = document.implementation.createHTMLDocument();
        temp.body.innerHTML = html;
        return temp.body.children;
    },
    registerEvent: function(/*String*/name, /*Function*/check, /*Object*/callbacks) {
        Carpenter.Events.custom[name] = {
            check: callbacks.check, //Required
            init: callbacks.init, finish: callbacks.finish, innerCallback: callbacks.innerCallback
        };
    },
    registerDependency: function(/*String*/path) {
        Carpenter.Dependencies.push(path);
    },
    registerPlugin: function(/*String*/name, /*Array*/dependencies, /*Function*/pluginBody) {
        Carpenter.Framework.Interact.Element.PrototypeElement[name] = pluginBody;
        if(0 < dependencies.length) {
            var i;
            for(i = 0; i < dependencies.length; ++i)
                this.registerDependency(dependencies[i]);
        }
    },
    registerRoute: function() {

    },
    size: function(/*Object*/object) {
        var size = 0, key;
        for(key in object)
            if(object.hasOwnProperty(key))
                ++size;
        return size;
    },
    toBoolean: function(/*Misc*/value) {
        if(typeof (value) === 'boolean')
            return value;
        if(typeof (value) === 'number')
            value = value.toString();
        var trueBooleans = ['true', 1, '1', 'yes', 'on'],
                falseBooleans = ['false', 0, '0', 'no', 'off'];
        if(trueBooleans.indexOf(value.toLowerCase()) > -1)
            return true;
        else if(falseBooleans.indexOf(value.toLowerCase()) > -1)
            return false;
        else
            return false;
    },
    use: function(/*String*/className) {
        var namespace = Carpenter.activeClasses[className].namespace,
                subNamespace = Carpenter.activeClasses[className].subNamespace,
                abstract = 'Abstract' + subNamespace,
                proto = 'Prototype' + subNamespace;
        if(!Carpenter.isEmpty(Carpenter.Framework[namespace][subNamespace][className].prototype)) {
            var abstractClass = Carpenter.Framework[namespace][subNamespace][abstract];
            if(abstractClass) {
                for(var protoName in Carpenter.Framework[namespace][subNamespace][proto]) {
                    abstractClass.prototype[protoName] = Carpenter.Framework[namespace][subNamespace][proto][protoName]
                }
                for(var subClass in Carpenter.Framework[namespace][subNamespace]) {
                    if(-1 === subClass.indexOf('Abstract') && -1 === subClass.indexOf('Prototype')) {
                        Carpenter.Framework[namespace][subNamespace][subClass].prototype = Object.create(abstractClass.prototype);
                    }
                }
            }
        }
        return Carpenter.Framework[namespace][subNamespace][className];
    },
    activeEvents: {},
    Events: {
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
            clickout: {
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
    },
    Dependencies: [],
    activeClasses: {
        Application: {namespace: 'Structure', subNamespace: 'Application'},
        Component: {namespace: 'Structure', subNamespace: 'Component'},
        Encryption: {namespace: 'Security', subNamespace: 'Encryption'},
        EventManager: {namespace: 'Interact', subNamespace: 'Event'},
        Element: {namespace: 'Interact', subNamespace: 'Element'},
        Module: {namespace: 'Structure', subNamespace: 'Module'},
        PluginManager: {namespace: 'Interact', subNamespace: 'Plugin'},
        Poller: {namespace: 'Http', subNamespace: 'Request'},
        Request: {namespace: 'Http', subNamespace: 'Request'},
        RequestSettings: {namespace: 'Http', subNamespace: 'RequestSettings'},
        Router: {namespace: 'Structure', subNamespace: 'Router'},
        Simple: {namespace: 'Http', subNamespace: 'Request'},
        Skin: {namespace: 'Template', subNamespace: 'Skin'},
        Validation: {namespace: 'Security', subNamespace: 'Validation'},
        WebService: {namespace: 'Http', subNamespace: 'Request'}
    },
    Framework: {
        Interact: {//Namespace Interact
            Element: {
                AbstractElement: function(/*String*/selector, /*[Boolean]*/makeNew) {
                    //Protected
                    var protected = {pointer: 0, selector: selector, tags: [], tiedEvents: []};//remettre selector & tags
                    if(makeNew) {/*UTILISER SKIN OU AUTRE MOTEUR DE TEMPLATE*/ //TODO
                        protected.tags = [document.createElement(selector)];
                    } else {
                        protected.tags = Carpenter.Framework.Interact.Element.getTags(selector);
                        //this.tags = protected.tags;
                    }

                    this.setPointer = function(/*Integer*/index) {
                        protected.pointer = index;
                        return this;
                    };

                    this.getTags = function() {
                        return protected.tags;
                    };

                    this.getPointer = function() {
                        return protected.pointer;
                    };

                    this.getSelector = function() {
                        return protected.selector;
                    };

                    this.addTiedEvent = function(event) {//TODO
                        if(!protected.tiedEvents[protected.pointer]) {
                            protected.tiedEvents[protected.pointer] = [event];
                        } else
                            protected.tiedEvents[protected.pointer].push(event);
                        return this;
                    };

                    this.removeTiedEvent = function(event) {
                        if(protected.tiedEvents[protected.pointer]) {
                            protected.tiedEvents[protected.pointer].forEach(function(element, key, value) {
                                if(event === element) {
                                    delete protected.tiedEvents[protected.pointer][i];
                                    return this;
                                }
                            });
                        }
                        return this;
                    };

                    this.getTiedEvents = function() {
                        return protected.tiedEvents[protected.pointer] ? protected.tiedEvents[protected.pointer] : [];
                    };
                    //this.selector = selector;
                    this.length = protected.tags.length;
                },
                PrototypeElement: {
                    addClass: function(/*String*/className) {
                        this.getTag().classList.add(className);
                        return this;
                    },
                    append: function(/*Element*/element) {
                        if(Carpenter.isElement(element)) {
                            this.getTag().innerHTML += element.getOuterHtml();
                            element.refresh();
                        } else
                            throw new Error('Argument is not an instance of Element.');
                        return this;
                    },
                    children: function() {
                        return new Carpenter.Framework.Interact.Element.Element(Carpenter.makeSelector(this.getTag()) + ' > *');
                    },
                    contains: function(/*Element*/element) {
                        if(Carpenter.isElement(element)) {
                            return this.getTag() !== element.tags[element.pointer] && this.getTag().contains(element.tags[element.pointer]);
                        } else
                            throw new Error('Argument is not an instance of Element.');
                        return false;
                    },
                    forEach: function(/*Function*/callback) {
                        var i, length = this.length, thus = this;
                        this.getTags().forEach(function(tag, key, value) {
                            thus.setPointer(key);
                            callback.apply(thus);
                        });
                        return this;
                    },
                    getAttributes: function(/*[String|Array]*/conditionName, /*[String|Array]*/conditionValue, /*[Boolean]*/exclude) {
                        var attributes = {}, i, tag = this.getTag();
                        if(!exclude) {//Get only matching attributes
                            for(i = 0; i < tag.attributes.length; ++i) {
                                if(tag.attributes[i].specified) {
                                    if(!conditionName && !conditionValue) {//Without condition, any attribute is returned
                                        attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(conditionName && !conditionValue) {//Only name matches
                                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1)//If is object and in object
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(tag.attributes[i].name === conditionName)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(!conditionName && conditionValue) {//Only value matches
                                        if(typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].name) > -1)//If is object and in object
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(tag.attributes[i].value === conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(conditionName && conditionValue) {//Both matches
                                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1 || typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) > -1)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1 || tag.attributes[i].value === conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(tag.attributes[i].name === conditionName || typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) > -1)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(tag.attributes[i].name === conditionName || tag.attributes[i].value === conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    }
                                }
                            }
                        } else {//Get all attributes but those matching with lists
                            for(i = 0; i < tag.attributes.length; ++i) {
                                if(tag.attributes[i].specified) {
                                    if(!conditionName && !conditionValue) {//Without condition, any attribute is returned
                                        attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(conditionName && !conditionValue) {//Only name matches
                                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1)//If is object and in object
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(!conditionName && conditionValue) {//Only value matches
                                        if(typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)//If is object and in object
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    } else if(conditionName && conditionValue) {//Both matches
                                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1 && typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1 && typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName && typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName && typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                                    }
                                }
                            }
                        }
                        return attributes;
                    },
                    getHtml: function() {
                        return this.getTag().innerHTML;
                    },
                    getOuterHtml: function() {
                        var tag = this.getTag();
                        return (!this.length) ? '' : (tag.outerHTML || (
                                function(element) {
                                    var div = document.createElement('div');
                                    div.appendChild(element.cloneNode(true));
                                    var contents = div.innerHTML;
                                    div = null;
                                    return contents;
                                })(tag));
                    },
                    getStyle: function(/*String*/ruleName) {
                        return getComputedStyle(this.getTag())[ruleName];
                    },
                    getTag: function(/*[Integer]*/index) {
                        var tags = this.getTags();
                        return tags[(Carpenter.isSet(index) ? index : this.getPointer())];
                    },
                    getText: function() {
                        return this.getTag().textContent;
                    },
                    hasAttribute: function(/*String*/name) {
                        var attribute = this.getTag().getAttribute(name);
                        return attribute !== undefined && attribute !== false;
                    },
                    hasClass: function(/*String*/name) {
                        return (' ' + this.getTag().className + ' ').indexOf(' ' + name + ' ') > -1;
                    },
                    indexOf: function(/*Element*/element) {
                        if(Carpenter.isElement(element)) {
                            var i;
                            for(i = 0; i < this.length; ++i) {
                                if(currentTag === element.tags[i])
                                    return i;
                            }
                        } else
                            throw new Error('Argument is not an instance of Element.');
                        return -1;
                    },
                    next: function() {
                        this.pointer = this.pointer + 1 >= this.length ? 0 : this.pointer + 1;
                        return this;
                    },
                    offset: function() {
                        var temp = this.getTag().getBoundingClientRect();
                        return {
                            top: temp.top + document.body.scrollTop,
                            left: temp.left + document.body.scrollLeft
                        };
                    },
                    outerHeight: function(/*[Boolean]*/margin) {
                        var height, tag = this.getTag();
                        if(margin) {
                            height = tag.offsetHeight, style = getComputedStyle(tag);
                            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                        } else
                            height = tag.offsetHeight;
                        return height;
                    },
                    outerWidth: function(/*[Boolean]*/margin) {
                        var width, tag = this.getTag();
                        if(margin) {
                            width = tag.offsetWidth, style = getComputedStyle(tag);
                            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
                        } else
                            width = tag.offsetWidth;
                        return width;
                    },
                    parent: function() {
                        return new Carpenter.Framework.Interact.Element.Element(Carpenter.makeSelector(this.getTag().parentNode));
                    },
                    position: function() {
                        var tag = this.getTag();
                        return {
                            top: tag.offsetTop,
                            left: tag.offsetLeft
                        };
                    },
                    prepend: function(/*Element*/element) {
                        if(Carpenter.isElement(element)) {
                            var tag = this.getTag();
                            tag.innerHTML = element.getOuterHtml() + tag.innerHTML;
                            element.refresh();
                        } else
                            throw new Error('Argument is not an instance of Element.');
                        return this;
                    },
                    previous: function() {
                        var pointer = this.getPointer();
                        this.setPointer(pointer - 1 < 0 ? this.length - 1 : pointer - 1);
                        return this;
                    },
                    refresh: function() {
                        Carpenter.Framework.Interact.Element.AbstractElement.call(this, this.getSelector());
                        return this;
                    },
                    remove: function() {
                        var tag = this.getTag();
                        tag.parentNode.removeChild(tag);
                        this.refresh();
                    },
                    removeClass: function(/*String*/className) {
                        this.getTag().classList.remove(className);
                        return this;
                    },
                    setAttributes: function(/*String*/name, /*String*/value) {
                        this.getTag().setAttribute(name, value);
                        return this;
                    },
                    setHtml: function(/*String*/string) {
                        this.getTag().innerHTML = string || '';
                        return this;
                    },
                    setStyle: function(/*String*/rule, /*String*/value) {
                        var property = rule.toCamelcase();
                        this.getTag().style[property] = value;
                        return this;
                    },
                    setStyles: function(/*Object*/rules) {
                        var rule, property;
                        for(rule in rules) {
                            property = rule.toCamelcase();
                            this.getTag().style[property] = rules[rule];
                        }
                        return this;
                    },
                    setText: function(/*String*/string) {
                        this.getTag().textContent = string || '';
                        return this;
                    },
                    siblings: function() {
                        var element = this.getTag();
                        return Array.prototype.filter.call(element.parentNode.children, function(child) {
                            return child !== element;
                        });
                    },
                    /*
                     Améliorations à prévoir : tie et untie sur n éléments
                     Si un event avec un sélecteur concerne deux éléments et que l'un d'eux se voit "untie", l'event existe toujours
                     Si un event n'a plus d'éléments, il doit être supprimé
                     */
                    tie: function(/*EventManager*/eventObject, /*[Object]*/data, /*[Boolean]*/triggerOnce) {
                        var selector = this.selector === '' ? this.selector = this.getFromRoot() : this.selector,
                                splittedEvents = eventObject.list, countEvents = splittedEvents.length, i, exists, index;

                        if(!Carpenter.activeEvents[selector]) //If events data are set
                            Carpenter.activeEvents[selector] = [];

                        for(i = 0; i < countEvents; ++i) {

                            exists = false;
                            if(Carpenter.activeEvents[selector].length > 0) {
                                for(index in Carpenter.activeEvents[selector]) {
                                    if(splittedEvents[i] === Carpenter.activeEvents[selector][index].type && '' + Carpenter.activeEvents[selector][index].handler === '' + callback) {
                                        exists = true;
                                        break;
                                    }
                                }
                            }
                            if(!exists)
                                Carpenter.activeEvents[selector].push({
                                    type: splittedEvents[i],
                                    handler: eventObject.callback,
                                    initialized: false
                                });
                        }
                        if(Carpenter.activeEvents[selector].length - countEvents === 0 && !exists) {
                            function triggerCallback(event, element, callback) {
                                for(i = 0; i < element.length; ++i)
                                    if(element.tags[i].contains(event.target)) {
                                        element.pointer = i;
                                        break;
                                    }
                                element[callback] = callback;
                                element[callback](event, data);
                                if(triggerOnce)
                                    element.untie(eventObject)
                            }
                            var eventTrick = ['blur', 'change', 'click', 'dblclick', 'error', 'focus', 'focusin', 'focusout',
                                'hover', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave',
                                'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit'],
                                    customEvents = Carpenter.Events.custom, nativeEvents = Carpenter.Events.native, i, j, k;
                            this.forEach(function() {
                                var thus = this, activeEvents = Carpenter.activeEvents[thus.selector];

                                eventTrick.forEach(function(eventName) {
                                    thus.tags[thus.pointer].addEventListener(
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
                            });
                        }
                        if(Carpenter.activeEvents[selector].indexOf('clickout') === -1)//Simple trick to init all events except clickout
                            this.forEach(function() {
                                this.tags[this.pointer].dispatchEvent(new Event('blur'));
                            });
                        return this;
                    },
                    to: function(/*Integer*/index) {//setPointer alias
                        this.setPointer(index);
                        return this;
                    },
                    toggleClass: function(/*String*/className) {
                        this.getTag().classList.toggle(className);
                        return this;
                    },
                    untie: function(/*Event*/event) {
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
                    }
                },
                Element: function(/*String*/selector, /*[Boolean]*/makeNew) {
                    Carpenter.Framework.Interact.Element.AbstractElement.apply(this, arguments);
                },
                getTags: function(selector) {
                    function getById(selector) {
                        var element = document.getElementById(selector.replace('#', ''));
                        return null !== element ? [element] : null;
                    }
                    function getByClass(selector) {
                        var element = document.getElementsByClassName(selector.replace('.', ''));
                        return !Carpenter.isEmpty(element) ? Array.prototype.slice.call(element) : null;
                    }
                    function getByTag(selector) {
                        var element = document.getElementsByTagName(selector);
                        return !Carpenter.isEmpty(element) ? Array.prototype.slice.call(element) : null;
                    }
                    function getOther(selector) {
                        return Array.prototype.slice.call(document.querySelectorAll(selector));
                    }
                    return getById(selector) || getByClass(selector) || getByTag(selector) || getOther(selector);
                }
            },
            Event: {//Namespace Interact\Event
                AbstractEvent: function(/*Array*/eventNames, /*Function*/callback) {//Class Interact\Event\AbstractEvent
                    this.list = eventNames;
                    this.callback = callback;
                },
                PrototypeEvent: {//Prototypes for Interact\Event\AbstractEvent
                    isNative: function(/*String*/eventName) {
                        return Carpenter.Events.native.indexOf(eventName) > -1;
                    },
                    eventExists: function(/*String*/eventName) {
                        return Carpenter.Events.custom.indexOf(eventName) > -1;
                    }
                },
                EventManager: function(/*Array*/eventNames, /*Function*/callback) {
                    Carpenter.Framework.Interact.Event.AbstractEvent.apply(this, arguments);
                }
            },
            Plugin: {
                AbstractPlugin: function() {
                    this.list = Array.prototype.slice.call(arguments);
                    ;
                },
                PrototypePlugin: {
                    load: function() {
                        var script, i;
                        this.list.forEach(function(source) {
                            if(!Carpenter.Framework.Interact.Element.PrototypeElement[source]) {
                                Carpenter.loadScript('plugins/' + source + '.js');
                            }
                        });

                        /*for(i = 0; i < this.list.length; ++i) {
                         script = document.createElement('script');
                         script.async = false;
                         script.onerror = function() {
                         throw('Script could not be loaded at "' + this.src + '"');
                         };
                         script.type = 'text/javascript';
                         script.src = 'plugins/' + this.list[i] + '.js';
                         document.getElementsByTagName('body')[0].appendChild(script);
                         }*/
                    }
                },
                PluginManager: function() {
                    Carpenter.Framework.Interact.Plugin.AbstractPlugin.apply(this, arguments);
                }
            }
        },
        Http: {//Namespace Http
            RequestSettings: {
                RequestSettings: {
                    create: function(/*Object*/params) {
                        var url = params.url || '', method = params.method || 'GET',
                                onSuccess = params.onSuccess || null, onFailure = params.onFailure || null,
                                onTimeout = params.onTimeout || null, data = params.data || '';
                        return {url: url, method: method, onSuccess: onSuccess, onFailure: onFailure, onTimeout: onTimeout, data: data};
                    }
                }
            },
            Request: {//Namespace Http\Request //TODO
                AbstractRequest: function(/*Settings*/params) {//Class Http\Request\AbstractRequest
                    //Protected
                    var protected = {request: new XMLHttpRequest(), settings: params};
                    
                    //this.request = new XMLHttpRequest();
                    //this.settings = params;
                    
                    protected.request.open(protected.settings.method, protected.settings.url, true);
                    
                    this.getRequest = function() {
                        return protected.request;
                    };
                    
                    this.getSettings = function() {
                        return protected.settings;
                    };
                },
                PrototypeRequest: {//Prototypes for Http\Request\AbstractRequest
                    abort: function() {
                        this.getRequest().abort();
                        return this;
                    },
                    send: function() {
                        var request = this.getRequest(), settings = this.getSettings();
                        if(settings.onSuccess)
                            request.onload = settings.onSuccess;
                        if(settings.onFailure)
                            request.onerror = settings.onFailure;
                        if(settings.onTimeout)
                            request.ontimeout = settings.onTimeout;
                        request.send(settings.data);
                        return this;
                    }
                },
                JSON: function(/*Settings*/params, /*[Object]*/paramsOverride) {//Class Http\Request\JSON
                    //Retourne du JSON
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                },
                Poller: function(/*Settings*/params, /*[Object]*/paramsOverride) {//Class Http\Request\Poller
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                    this.getRequest().timeout = params.timeout || 20000;
                },
                Request: function(/*Settings*/params, /*[Object]*/paramsOverride) {//Class Http\Request\Request
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                },
                WebService: function(/*Settings*/params, /*[Object]*/paramsOverride) {//Class Http\Request\WebService
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);

                    //paramsOverride viendra surcharger params
                    var request = this.getRequest();
                    if('withCredentials' in request) {
                        request.open(this.settings.method, this.settings.url, true);
                    } else if(typeof XDomainRequest !== undefined) {
                        request = new XDomainRequest();
                        request.open(this.settings.method, this.settings.url);
                    } else
                        throw new Error('CORS not supported.');

                    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    request.setRequestHeader('Content-length', this.settings.data.length);
                    request.setRequestHeader('Connection', 'close');

                },
                treatAnswer: function(/*String*/dataType, /*Misc*/answer) {
                    var dataReturned;
                    switch(dataType) {
                        case 'text':
                            break;
                        case 'json':
                            dataReturned = eval('(' + answer.responseText + ')');
                            break;
                    }
                }
            }
        },
        Security: {
            Encryption: {
            },
            Sanitizer: {
            },
            Validation: {
            }
        },
        Structure: {
            Application: {
                AbstractApplication: function(/*Object*/settings, /*PluginManager*/globalPlugins) {
                    var protected = {settings: settings, plugins: globalPlugins};
                    this.getSettings = function() {
                        return protected.settings;
                    };
                    
                    this.getPlugins = function() {
                        return protected.plugins;
                    };
                },
                PrototypeApplication: {
                },
                Application: function(/*Object*/settings, /*PluginManager*/globalPlugins) {
                    Carpenter.Framework.Structure.Application.AbstractApplication.apply(this, arguments);
                }
            },
            Component: {
                AbstractComponent: function() {
                    /*
                     * Les éléments créés via Component possèdent une "référence" 
                     * 
                     */
                }, 
                PrototypeComponent: {
                    create: function() {
                        
                    }
                },
                Component: function() {
                    
                }
            },
            Module: {
                AbstractModule: function(/*Function*/body, /*[PluginManager]*/localPlugins) {
                    this.pluginManager = localPlugins;
                    this.body = body;
                },
                PrototypeModule: {
                    onInit: function() {
                        this.state = 'initialized';
                    },
                    onFinish: function() {
                        this.state = 'finished';
                    }
                },
                Module: function(/*Function*/body, /*[PluginManager]*/localPlugins, /*[Function]*/onInitOver, /*[Function]*/onFinishOver) {
                    Carpenter.Framework.Structure.Module.AbstractModule.apply(this, arguments);

                    if('function' === typeof (onInitOver))
                        this.onInit = onInitOver;
                    if('function' === typeof (onFinishOver))
                        this.onFinish = onFinishOver;
                }
            },
            Router: {
                Router: {
                    handle: function(/*Application*/application) {//Static method
                        var routes = [//TODO : replace by "getRoutes"
                            {
                                pattern: '/login',
                                route: {
                                    action: 'login'
                                }
                            },
                            {
                                pattern: '/logout',
                                route: {
                                    action: 'logout'
                                }
                            }
                        ];
                        function call(module, action, params) {
                            module.onInit();
                            if(module.pluginManager)
                                module.pluginManager.load();
                            module.body()[action].apply(module, params);
                            module.onFinish();
                        }

                        function load(application, module, onLoad) {
                            var script = document.createElement('script');
                            script.onload = onLoad;
                            script.onerror = function() {
                                throw new Error('Module "' + module + '" could not be loaded');
                            };
                            script.type = 'text/javascript';
                            script.src = 'modules/' + module + '.js';
                            document.getElementsByTagName('body')[0].appendChild(script);
                        }

                        function matchRoutes(splittedPath) {
                            var defaultRoute = {
                                module: 'Main',
                                action: 'main',
                                params: []
                            }, i;
                            /*for(i = 0; i < this.routes.length; ++i) {
                             if(this.routes[i].pattern === '/' + splittedPath[1] ||
                             this.routes[i].pattern === '/' + splittedPath[1] + '/' + splittedPath[2] ||
                             this.routes[i].pattern === '/' + splittedPath[1] + '/' + splittedPath[2] + '/' + splittedPath[3])
                             return Carpenter.extend(defaultRoute, this.routes[i].route);
                             else
                             return defaultRoute;
                             }*/
                            return {module: 'module1', action: 'action1'};
                        }

                        function parseRewrite() {

                            var domains = url.hostname.split('.'), domain = {
                                sub: domains[0],
                                sld: domains[1],
                                tld: domains[2]
                            };

                        }

                        var url = document.createElement('a'), request = [];
                        url.href = document.location;
                        switch(application.getSettings().type) {
                            case 'rewrite':
                                request = url.pathname.split('/');
                                break;
                            case 'hash':
                                request = url.hash.replace('#', '').split('/');
                                break;
                            case 'default':
                            default:
                                //TODO : récupérer les combinaisons key=value pour définir quel est le module et quelle l'action depuis l'URL
                                request = url.search.match(/\??&?([\w]*)=([^&#]*)/g);
                                break;
                        }

                        var splitPathname = matchRoutes(request), applicationPlugins = application.getPlugins();
                        
                        if(applicationPlugins)
                            applicationPlugins.load();

                        Module = Carpenter.use('Module');
                        load(application, splitPathname.module, function() {
                            call(application[splitPathname.module], splitPathname.action, splitPathname.params);
                            delete Module;
                            delete PluginManager;
                        });
                    }
                }
            }
        },
        Template: {
            Skin: {//TODO
                SkeletonParser: {
                    attributesAsString: function() {
                        var aliases = Object.keys(Carpenter.Framework.Template.Skin.private.attributeAlias), countAliases = aliases.length, string = '', i;
                        for(i = 0; i < countAliases; ++i)
                            string += '\\' + aliases[i];
                        return string;
                    },
                    
                    getAttributeAlias: function(attribute) {
                        return Carpenter.Framework.Template.Skin.private.attributeAlias[attribute] ? Carpenter.Framework.Template.Skin.private.attributeAlias[attribute] : attribute;
                    },
                    
                    parseLines: function(/*Array*/inputs) {
                        var i, structure;
                        for (i = 0; i < inputs.length; ++i) { //Parcours des lignes
                            structure[i] = new Carpenter.Framework.Template.Skin.SkinElement(inputs[i]);
                            for(j = structure.length; j > 0; --j)
                                if (structure[j].level < structure[i].level) {
                                    structure[i].parent = j;


                                    if(!structure[i].toParse)
                                        structure[i].tag = 'PLAINTEXT';
                                    if('PLAINTEXT' === structure[i].tag)
                                        structure[i].toParse = false;
                                    break;
                                }
                        }
                        return structure;
                    },

                    parseTag: function(input) {
                        return input.split(' ')[0].toLowerCase();
                    },

                    parseAttributes: function(input) {
                        var attributes = input.match(Carpenter.Framework.Template.Skin.private.PARSE_ATTR), 
                            shortHandAttributes = input.match(Carpenter.Framework.Template.Skin.private.PARSE_ATTR_SHORT), i;
                        log(attributes)
                        for (i = 0; i < attributes[1].length; ++i)
                            attributes[1][i] = Carpenter.Framework.Template.Skin.SkeletonParser.getAttributeAlias(attributes[1][i]);
                    },

                    parseContent: function(content) {
                        var inputs = content.replace(/\r\n/, /\n/).split(/\n/);
                        Carpenter.Framework.Template.Skin.SkeletonParser.parseLines(inputs);
                    }
                },
                SkinElement: function(input) {
                    //Parser la ligne (tag et attributs) et retourner un selecteur unique (tag[skin-id="X"]) et lui rattacher ses attributs
                    this.tag = Carpenter.Framework.Template.Skin.SkeletonParser.parseTag(input);
                    this.attributes = Carpenter.Framework.Template.Skin.SkeletonParser.parseAttributes(input);
                    
                    this.element = new Carpenter.Framework.Interact.Element.Element(this.tag, true);
                    this.attributes.forEach(function() {
                        this.element.setAttributes();//TODO
                    });
                },
                SkinTranslator: function() {
                    
                },
                private: {
                            PARSE_ATTR: /([\w]*|[\.\#\?\:\§\%])\(([\w\-;{|}=>\.^ ]*?)\)/g,
                            PARSE_ATTR_SHORT: /([\.\#\?\:\§\%])([\w\-;{|}=>.]+)/g,
                            attributeAlias: {
                                '.': 'class', '#': 'id',
                                '?': 'skif', '%': 'skloop', '§': 'sksample',
                                ':': 'skelse'
                            }
                        },
                parse: function() {
                    
                }
            }
        },
        Translator: {
        }
    }
};

