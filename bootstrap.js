/*global Carpenter, Router, PluginManager*/
console.timeEnd('Carpenter loading');
console.time('Carpenter execution');

Carpenter.init(function() {
    
    Carpenter.app = new Application({//Settings
        type: 'rewrite'
    }, {//Global classes
        ManipulableElement: 'Element',
        EventManager: 'Event'
    },
    new PluginManager(//Global plugins
        'component'
    ));
    
    Router.handle(Carpenter.app);//Launch !
}, true);

console.timeEnd('Carpenter execution');