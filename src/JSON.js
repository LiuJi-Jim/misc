;define(function(){
    var myJSON = JSON || {
        parse: function(str){
            return (new Function("return " + str))();
        },
        stringify: (function(){
            // from json2.js
            'use strict';
            function f(n) {
                return n < 10 ? '0' + n : n;
            }
            if (typeof Date.prototype.toJSON !== 'function') {
                Date.prototype.toJSON = function (key) {
                    return isFinite(this.valueOf())
                        ? this.getUTCFullYear()     + '-' +
                          f(this.getUTCMonth() + 1) + '-' +
                          f(this.getUTCDate())      + 'T' +
                          f(this.getUTCHours())     + ':' +
                          f(this.getUTCMinutes())   + ':' +
                          f(this.getUTCSeconds())   + 'Z'
                        : null;
                };
                String.prototype.toJSON  =
                Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
            }
            var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                meta = {
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"' : '\\"',
                    '\\': '\\\\'
                };
            function quote(string) {
                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string'
                        ? c
                        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }
            function str(key, holder) {
                var i, k, v, length, partial, value = holder[key];
                if (value && typeof value === 'object' &&
                        typeof value.toJSON === 'function') {
                    value = value.toJSON(key);
                }
                switch (typeof value) {
                case 'undefined':
                    return 'undefined';
                case 'string':
                    return quote(value);
                case 'number':
                    return isFinite(value) ? String(value) : 'null';
                case 'boolean':
                case 'null':
                    return String(value);
                case 'object':
                    if (!value) {
                        return 'null';
                    }
                    partial = [];
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }
                        v = partial.length === 0 ? '[]' : '[' + partial.join(',') + ']';
                        return v;
                    }
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + ':' + v);
                            }
                        }
                    }
                    v = partial.length === 0 ? '{}' : '{' + partial.join(',') + '}';
                    return v;
                }
            }
            return function(value){
                return str('', {'': value});
            };
        })()
    };

    return myJSON;
});
