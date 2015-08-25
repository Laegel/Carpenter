/* global Carpenter, PluginManager */

Carpenter.app.controller1 = new Controller(function() {
    //var ClassWithCustomName = Carpenter.use('ClassName');//Use class here to scope it inside controller1.
    
    
    var action1 = function() {
        //var ClassWithCustomName = Carpenter.use('ClassName');//Use class here to scope it inside action1.
        log('Triggered !')
        var test = new Element('.testUnique');
        log(test)
        /*test.animate('bounce', {
            duration: 1
        }).animate('fadeOut', {
            duration: 2
        }).animate('fadeIn');*/
        
    };
    return {action1: action1};
}, new PluginManager('event', 'animate'));//Plugins that will be used inside the controller
