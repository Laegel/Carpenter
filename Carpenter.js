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
    count: 0,
    fetchDependencies: function(/*String*/path) {
        var i = 0, xhrObj, newFile, promises = [], sources = Carpenter.Dependencies;
        while(i < sources.length) {
            promises[i] = new Promise(function(resolve, reject) {
                xhrObj = new XMLHttpRequest();
                xhrObj.onload = function() {
                    if(200 === this.status) {
                        resolve({
                            extension: this.extension,
                            content: this.responseText
                        });
                    } else {
                        reject(this.statusText);
                    }
                };
                xhrObj.extension = sources[i].split('.').pop();
                xhrObj.open('GET', path + '/' + sources[i], true);
                xhrObj.send();
            });
            ++i;
        }
        Promise.all(promises).then(function(files) {
            files.forEach(function(file) {
                switch(file.extension) {
                    case 'css':
                        newFile = document.createElement('style');
                        newFile.type = 'text/css';
                        newFile.textContent = file.content;
                        break;
                    case 'js':
                        newFile = document.createElement('script');
                        newFile.type = 'text/js';
                        newFile.text = file.content;
                        break;
                    default:
                        //log(files)
                        break;
                }
                document.head.appendChild(newFile);
            });

        }).catch(function(status) {
            throw new Error(status);
        });


    },
    getCookie: function(/*String*/index) {
        var name = index + '=', ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; ++i) {
            var c = ca[i].trim();
            if(0 === c.indexOf(name))
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
        return object instanceof(Carpenter.Framework.Interact.Element.AbstractElement);
    },
    isSet: function(/*mixed*/primitive) {
        return undefined !== primitive;
    },
    init: function(/*Function*/callback, /*[Boolean]*/isDev) {
        Application = Carpenter.use('Application'), Router = Carpenter.use('Router'), PluginManager = Carpenter.use('PluginManager');
        var classes = isDev ? ['Array', 'Date', 'HTMLElement', 'Number', 'String'] : ['classes'];
        classes.forEach(function(className) {
            Carpenter.require('classes/' + className + '.js');
        });
        callback();
        delete Application;
        delete Router;
        delete PluginManager;
    },
    merge: function(/*Object*/to, /*Object*/from) {
        var out = {}, property;
        for (property in to)
            out[property] = to[property]; 
        for (property in from)
            out[property] = from[property]; 
        return out;
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
    require: function(/*String*/source) {
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
                proto = 'Prototype' + subNamespace, protoName, subClass;
        if(!Carpenter.isEmpty(Carpenter.Framework[namespace][subNamespace][className].prototype)) {
            var abstractClass = Carpenter.Framework[namespace][subNamespace][abstract];
            if(abstractClass) {
                for(protoName in Carpenter.Framework[namespace][subNamespace][proto]) {
                    abstractClass.prototype[protoName] = Carpenter.Framework[namespace][subNamespace][proto][protoName];
                }
                for(subClass in Carpenter.Framework[namespace][subNamespace]) {
                    if(-1 === subClass.indexOf('Abstract') && -1 === subClass.indexOf('Prototype')) {
                        Carpenter.Framework[namespace][subNamespace][subClass].prototype = Object.create(abstractClass.prototype);
                    }
                }
            }
        }
        return Carpenter.Framework[namespace][subNamespace][className];
    },
    Dependencies: [],
    activeClasses: {
        Application: {namespace: 'Structure', subNamespace: 'Application'},
        Component: {namespace: 'Structure', subNamespace: 'Component'},
        Encryption: {namespace: 'Security', subNamespace: 'Encryption'},
        EventManager: {namespace: 'Interact', subNamespace: 'Event'},
        ManipulableElement: {namespace: 'Interact', subNamespace: 'Element'},
        Controller: {namespace: 'Structure', subNamespace: 'Controller'},
        PluginManager: {namespace: 'Interact', subNamespace: 'Plugin'},
        Poller: {namespace: 'Http', subNamespace: 'Request'},
        Request: {namespace: 'Http', subNamespace: 'Request'},
        RequestSettings: {namespace: 'Http', subNamespace: 'RequestSettings'},
        Router: {namespace: 'Structure', subNamespace: 'Router'},
        Simple: {namespace: 'Http', subNamespace: 'Request'},
        Skin: {namespace: 'Template', subNamespace: 'Skin'},
        Validation: {namespace: 'Security', subNamespace: 'Validation'},
        VirtualElement: {namespace: 'Interact', subNamespace: 'Element'},
        WebService: {namespace: 'Http', subNamespace: 'Request'}
    },
    Framework: {
        //Namespace Data
        Data: {/*TODO*/
            //Namespace Data\Format
            Format: {
                //Dates, monnaies, traductions, etc
            },
            //Namespace Data\Model
            Model: {
                //Abstract class Data\Model\AbstractModel
                AbstractModel: function() {

                },
                //Data\Model\AbstractModel methods
                PrototypeModel: {
                },
                //Class Data\Model\Model
                Model: function() {

                }
            }
        },
        //Namespace Interact
        Interact: {
            //Namespace Interact\Element
            Element: {
                //Abstract class Interact\Element\AbstractElement
                AbstractElement: function(/*String*/selector) {
                    var protected = {//Protected
                        pointer: 0,
                        selector: selector,
                        tags: Carpenter.Framework.Interact.Element.getTags(selector),
                        tiedEvents: []
                    };

                    this.setPointer = function(/*Integer*/index) {
                        protected.pointer = index;
                        return this;
                    };

                    this.getTags = function() {
                        if(0 === protected.tags.length)
                            throw new Error('No matching tags with "' + protected.selector + '".');
                        return protected.tags;
                    };

                    this.getPointer = function() {
                        return protected.pointer;
                    };

                    this.getSelector = function() {
                        return protected.selector;
                    };
                    
                    this.length = protected.tags.length;
                },
                //Interact\Element\AbstractElement methods
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
                    children: function(/*[String]*/selector) {
                        if(!Carpenter.isSet(selector))
                            selector = '*';
                        return new Carpenter.Framework.Interact.Element.Element(this.getTag().rootPath() + ' > ' + selector);
                    },
                    contains: function(/*Element*/element) {
                        if(Carpenter.isElement(element)) {
                            return this.getTag() !== element.tags[element.pointer] && this.getTag().contains(element.tags[element.pointer]);
                        } else
                            throw new Error('Argument is not an instance of Element.');
                        return false;
                    },
                    forEach: function(/*Function*/callback) {
                        var thus = this, pointer = this.getPointer();
                        this.getTags().forEach(function(tag, key, value) {
                            thus.setPointer(key);
                            callback.apply(thus);
                        });
                        return this.setPointer(pointer);
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
                        return tag.outerHTML || (
                                function(element) {
                                    var div = document.createElement('div');
                                    div.appendChild(element.cloneNode(true));
                                    var contents = div.innerHTML;
                                    div = null;
                                    return contents;
                                })(tag);
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
                    getValue: function() {
                        return this.getTag().value;
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
                            var i, currentTag = this.getTag();
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
                        return new Carpenter.Framework.Interact.Element.Element(this.getTag().parentNode.rootPath());
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
                    removeAttribute: function(/*String*/attributeName) {
                        var tag = this.getTag();
                        tag.removeAttribute(attributeName);
                        return this;
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
                    setValue: function(/*String*/string) {
                        this.getTag().value = string || '';
                        return this;
                    },
                    siblings: function() {
                        var element = this.getTag();
                        return Array.prototype.filter.call(element.parentNode.children, function(child) {
                            return child !== element;
                        });
                    },
                    to: function(/*Integer*/index) {//setPointer alias
                        this.setPointer(index);
                        return this;
                    },
                    toggleClass: function(/*String*/className) {
                        this.getTag().classList.toggle(className);
                        return this;
                    }
                },
                //Class Interact\Element\ManipulableElement
                ManipulableElement: function(/*String*/selector) {
                    Carpenter.Framework.Interact.Element.AbstractElement.apply(this, arguments);
                },
                //Class Interact\Element\VirtualElement
                VirtualElement: function(/*String*/tag, /*[Object]*/attributes) {
                    this.prototype = Carpenter.Framework.Interact.Element.AbstractElement.prototype;

                    var node = document.createElement(tag), attribute, reserved = {text: 'textContent', html: 'innerHTML', style: 'style', attributes: 'attributes'};
                    for(attribute in attributes) {
                        if(attribute in reserved)
                            node[reserved[attribute]] = attributes[attribute];
                        else
                            node.setAttribute(attribute, attributes[attribute]);
                    }
                    node.setAttribute('cpt-id', ++Carpenter.count);
                    var protected = {tags: [node], pointer: 0, selector: tag + '[cpt-id="' + Carpenter.count + '"]'};

                    this.getTags = function() {
                        return protected.tags;
                    };

                    this.getPointer = function() {
                        return protected.pointer;
                    };

                    this.getSelector = function() {
                        return protected.selector;
                    };

                    this.refresh = function() {
                        return false;
                    };
                },
                //Static method getTags
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
            //Namespace Interact\Event
            Event: {
                //Abstract class Interact\Event\AbstractEvent
                AbstractEvent: function(/*Array*/eventNames, /*Function*/callback) {
                    this.list = eventNames;
                    this.callback = callback;
                },
                //Interact\Event\AbstractEvent methods
                PrototypeEvent: {//Prototypes for Interact\Event\AbstractEvent
                    isNative: function(/*String*/eventName) {
                        return Carpenter.Events.native.indexOf(eventName) > -1;
                    },
                    eventExists: function(/*String*/eventName) {
                        return Carpenter.Events.custom.indexOf(eventName) > -1;
                    }
                },
                //Class Interact\Event\EventManager
                EventManager: function(/*Array*/eventNames, /*Function*/callback) {
                    Carpenter.Framework.Interact.Event.AbstractEvent.apply(this, arguments);
                }
            },
            //Namespace Interact\Plugin
            Plugin: {
                //Abstract class Interact\Plugin\AbstractPlugin
                AbstractPlugin: function(/*List of strings*/) {
                    this.list = Array.prototype.slice.call(arguments);
                },
                //Interact\Plugin\AbstractPlugin methods
                PrototypePlugin: {
                    load: function(/*String*/path) {
                        var script, i;
                        this.list.forEach(function(source) {
                            if(!Carpenter.Framework.Interact.Element.PrototypeElement[source]) {
                                Carpenter.require(path + '/' + source + '.js');//Combine loaders (global plugins + dependencies)
                            }
                        });
                    }
                },
                //Class Interact\Plugin\PluginManager
                PluginManager: function(/*List of strings*/) {
                    Carpenter.Framework.Interact.Plugin.AbstractPlugin.apply(this, arguments);
                }
            }
        },
        //Namespace Http
        Http: {
            //Namespace Http\RequestSettings
            RequestSettings: {
                create: function(/*Object*/params) {
                    var url = params.url || '', method = params.method || 'GET',
                        onSuccess = params.onSuccess || null, onFailure = params.onFailure || null,
                        onTimeout = params.onTimeout || null, data = params.data || '';
                    return {
                        url: url, method: method, onSuccess: onSuccess, 
                        onFailure: onFailure, onTimeout: onTimeout, data: data
                    };
                 }
            },
            //Namespace Http\Request 
            Request: {
                //Abstract class Http\Request\AbstractRequest
                AbstractRequest: function(/*Settings*/params) {
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
                //Http\Request\AbstractRequest methods
                PrototypeRequest: {
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
                //Class Http\Request\JSON
                JSON: function(/*Settings*/params, /*[Object]*/paramsOverride) {
                    //Retourne du JSON
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                },
                //Class Http\Request\Poller
                Poller: function(/*Settings*/params, /*[Object]*/paramsOverride) {
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                    this.getRequest().timeout = params.timeout || 20000;
                },
                //Class Http\Request\Request
                Request: function(/*Settings*/params, /*[Object]*/paramsOverride) {//Class Http\Request\Request
                    Carpenter.Framework.Http.Request.AbstractRequest.call(this, params);
                },
                //Class Http\Request\WebService
                WebService: function(/*Settings*/params, /*[Object]*/paramsOverride) {
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
                treatAnswer: function(/*String*/dataType, /*mixed*/answer) {
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
        //Namespace Security
        Security: {
            //Namespace Security\Encryption
            Encryption: {
            },
            //Namespace Security\Sanitizer
            Sanitizer: {
            },
            //Namespace Security\Validation
            Validation: {
            }
        },
        //Namespace Structure
        Structure: {
            //Namespace Structure\Application
            Application: {
                //Abstract class Structure\Application\AbstractApplication
                AbstractApplication: function(/*Object*/settings, /*[Object]*/globalClasses, /*[PluginManager]*/globalPlugins) {
                    var defaultDirs = {
                            controllers: 'controllers', dependencies: 'dependencies',
                            models: 'models', plugins: 'plugins', views: 'views'
                    };
                    settings.dirs = !settings.dirs ? defaultDirs : Carpenter.merge(defaultDirs, settings.dirs);
                    var protected = {settings: settings, classes: globalClasses, plugins: globalPlugins};
                    this.getSettings = function() {
                        return protected.settings;
                    };

                    this.getPlugins = function() {
                        return protected.plugins;
                    };
                    
                    this.getClasses = function() {
                       return protected.classes; 
                    };
                },
                //Structure\Application\AbstractApplication methods
                PrototypeApplication: {
                },
                //Class Structure\Application\Application
                Application: function(/*Object*/settings, /*[Object]*/globalClasses, /*[PluginManager]*/globalPlugins) {
                    Carpenter.Framework.Structure.Application.AbstractApplication.apply(this, arguments);
                }
            },
            //Namespace Structure\Controller
            Controller: {
                //Abstract class Structure\Controller\AbstractController
                AbstractController: function(/*Function*/body, /*[PluginManager]*/localPlugins) {
                    this.pluginManager = localPlugins;
                    this.body = body;
                },
                //Structure\Controller\AbstractController methods
                PrototypeController: {
                    onInit: function() {
                        this.state = 'initialized';
                    },
                    onFinish: function() {
                        this.state = 'finished';
                    }
                },
                //Class Structure\Controller\Controller
                Controller: function(/*Function*/body, /*[PluginManager]*/localPlugins, /*[Function]*/onInitOver, /*[Function]*/onFinishOver) {
                    Carpenter.Framework.Structure.Controller.AbstractController.apply(this, arguments);

                    if('function' === typeof (onInitOver))
                        this.onInit = onInitOver;
                    if('function' === typeof (onFinishOver))
                        this.onFinish = onFinishOver;
                }
            },
            //Namespace Structure\Router
            Router: {
                //Static class Structure\Router\Router
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
                        ], settings = application.getSettings(), url = document.createElement('a'), request = [];
                        url.href = document.location;
                        
                        function call(controller, action, params) {
                            controller.onInit();
                            controller.body()[action].apply(controller, params);
                            controller.onFinish();
                        }

                        function load(/*Controller*/controller, /*String*/path) {
                            var xhrObj = new XMLHttpRequest();
                            xhrObj.open('GET', path + '/' + controller + '.js', false);
                            try {
                                xhrObj.send('');
                            } catch(exception) {
                                throw new Error('Controller "' + controller + '" not found in "controllers" dir.');
                            }
                            return xhrObj.responseText;
                        }

                        function matchRoutes(splittedPath) {
                            var defaultRoute = {
                                controller: 'Main',
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
                            return {controller: 'controller1', action: 'action1'};
                        }

                        function parseRewrite() {
                            var domains = url.hostname.split('.'), domain = {
                                sub: domains[0],
                                sld: domains[1],
                                tld: domains[2]
                            };
                        }

                        switch(settings.type) {
                            case 'rewrite':
                                request = url.pathname.split('/');
                                break;
                            case 'hash':
                                request = url.hash.replace('#', '').split('/');
                                break;
                            case 'default':
                            default:
                                //TODO : récupérer les combinaisons key=value pour définir quel est le controller et quelle l'action depuis l'URL
                                request = url.search.match(/\??&?([\w]*)=([^&#]*)/g);
                                break;
                        }

                        var splitPathname = matchRoutes(request), applicationPlugins = application.getPlugins();

                        if(applicationPlugins)
                            applicationPlugins.load(settings.dirs.plugins);//Combine loader
                        Carpenter.fetchDependencies(settings.dirs.dependencies);//Combine loader
                        var Controller = Carpenter.use('Controller'), PluginManager = Carpenter.use('PluginManager'),
                            globalClass, classes = application.getClasses();
                        
                        for(globalClass in classes)//Load after plugins and dependencies are done
                            window[classes[globalClass]] = Carpenter.use(globalClass);
                        
                            
                        eval(load(splitPathname.controller, settings.dirs.controllers));
                        if(application[splitPathname.controller].pluginManager)
                            application[splitPathname.controller].pluginManager.load(settings.dirs.plugins);
                        call(application[splitPathname.controller], splitPathname.action, splitPathname.params);
                    }
                }
            }
        }
    }
};

