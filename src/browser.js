;define(function(require, exports){
    var core = require('core');
    
    var bindEvent = exports.bindEvent = (function(){
        if (document.addEventListener){
            return function(elem, type, func){
                elem.addEventListener(type, func, false);
            };
        }else if (document.attachEvent){
            return function(elem, type, func){
                elem.attachEvent('on'+type, func);
            };
        }else{
            return core.noop;
        }
    })();
});
