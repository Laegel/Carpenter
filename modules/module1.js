/* global Carpenter */

Carpenter.app.module1 = new Module(function() {
    //var ClassWithCustomName = Carpenter.use('ClassName');//Use class in a module to scope it inside the module.
    var WebService = Carpenter.use('WebService'), AjaxSettings = Carpenter.use('RequestSettings'), Element = Carpenter.use('Element'),
        Event = Carpenter.use('EventManager'), Request = Carpenter.use('Request');


    
    var action1 = function() {
        console.log('Triggered !')
        
        
        var component = new Component({
            onInit: function() {
                
            }
        });
        component.create();
    };
    return {action1: action1};
}, new PluginManager('test', 'localOne'));
