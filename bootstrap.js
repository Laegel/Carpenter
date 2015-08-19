Carpenter.init(function() {
    var pluginList = new PluginManager('globalOne', 'animate');

    Carpenter.app = new Application({
        type: 'rewrite'
    }, pluginList);
    
    Router.handle(Carpenter.app);
}, true);
console.timeEnd('Carpenter');