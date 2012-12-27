// 自定义事件
;define(function(require){
    var core     = require('core');
    
    var Events = {
        on: function(name, callback){
            var me = this, events = name.split(/\s+/);
            if (typeof me.__events === 'undefined') me.__events = {};
            core.arrEach(events, function(i, event){
                var callbacks = me.__events[event] || (me.__events[event] = []);
                callbacks.push(callback);
            });
            return me;
        },
        off: function(name, callback){
            var me = this, events = name.split(/\s+/);
            if (typeof me.__events === 'undefined') me.__events = {};
            core.arrEach(events, function(i, event){
                var callbacks = me.__events[event] || (me.__events[event] = []);
                core.arrRemove(callbacks, callback);
            });
            return me;
        },
        once: function(name, callback){
            var me = this;
            return me.on(name, function(e){
                callback.call(me, e);
                me.off(name, arguments.callee);
            });
        },
        fire: function(name, data){
            var me = this, events = name.split(/\s+/);
            if (typeof me.__events === 'undefined') me.__events = {};
            core.arrEach(events, function(i, event){
                var callbacks = me.__events[event] || (me.__events[event] = []);
                core.arrEach(callbacks, function(j, callback){
                    callback.call(me, {
                        name: event,
                        data: data
                    });
                });
            });
            return me;
        }
    };

    return Events;
});