;define(function(require, exports){
    var slice = exports.slice = [].slice,
    rSpace = exports.rSpace = /^\s*$/,
    toS = exports.toS = ({}).toString,
    noop = exports.noop = function(){},
    empty = exports.empty = function(obj){
        if (obj === null) return true;
        if (typeof obj === 'undefined') return true;
        return false;
    },
    arrEach = exports.arrEach = function(arr, func){
        for (var i=0, len = arr.length; i<len; ++i){
            if (func.call(arr[i], i, arr[i]) === false) return;
        }
    },
    objEach = exports.objEach = function(obj, func){
        for (var k in obj){
            if (func.call(obj[k], k, obj[k]) === false) return;
        }
    },
    // 回调函数定义为 function(key/index, value)
    // return false;终止循环
    each = exports.each = function(obj, func){
        if (typeof obj.length === 'number'){
            arrEach(obj, func);
        }else{
            objEach(obj, func);
        }
    },
    indexOf = exports.indexOf = [].indexOf || function(val){
        for (var i=0, len=this.length; i<len; ++i){
            if (this[i] === val) return i;
        }
        return -1;
    },
    arrRemove = exports.arrRemove = function(arr, val){
        var idx = indexOf.call(arr, val);
        if (idx >= 0) arr.splice(idx, 1);
        return arr;
    },
    // 把各个参数里的key/value都混合到第一个参数里，后面的会覆盖前面的，同时返回混合的结果
    extend = exports.extend = function(tar){
        var args = arguments;
        if (args.length == 0) return {};
        if (args.length == 1) return args[0];
        var tar = args[0];
        for (var i=1, len = args.length; i<len; ++i){
            objEach(args[i], function(k, val){
                if (val !== undefined){
                    tar[k] = val;
                }
            });
        }
        return tar;
    },
    class2type = (function(){
        // from jQuery
        var arr = {};
        arrEach("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
            arr["[object " + name + "]"] = name.toLowerCase();
        });
        return arr;
    })(),
    type = exports.type = function(obj){
        // from jQuery
        return obj == null ?
            String(obj) :
            class2type[toS.call(obj)] || "object";
    },
    isA = exports.isA = function(obj){
        // from jQuery
        return type(obj) === "array";
    },
    isF = exports.isF = function(obj){
        // from jQuery
        return type(obj) === "function";
    },
    isO = exports.isO = function(obj){
        // from jQuery
        return type(obj) === 'object';
    },
    // 克隆数组或者对象
    clone = exports.clone = function(obj){
        if (isA(obj)) return slice.call(obj, 0);
        if (isO(obj)) return extend({}, obj);
        return obj;
    },
    // 以func为蓝本建立一个delegate函数，其this和实参将不随上下文而变化
    delegate = exports.delegate = function(func, thisObj, args){
        return function(){
            return func.apply(thisObj, args);
        };
    },
    // 精确到毫秒的时间戳
    timestampMS = exports.timestampMS = function(){
        return (new Date()).getTime();
    },
    // 精确到秒的时间戳
    timestamp = exports.timestamp = function(){
        return Math.floor(timestampMS() / 1000);
    };
});
