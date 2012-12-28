;define(function(require){
    var core     = require('core'),
        Events   = require('events'),
        Deferred = require('deferred'),
        browser  = require('browser'),
        JSON     = require('json');

    /*
        Whisper
        用于Tunnel传递消息的东西
    */
    var _uid = 0,
        Whisper = {
            notify: 0, ask: 1, answer: 2, abort: 3,
            create: function(type, data){
                return {
                    uid: _uid++,
                    type: type,
                    data: data
                };
            },
            from: function(uid, type, data){
                return {
                    uid: uid,
                    type: type,
                    data:data
                };
            },
            parse: function(str){
                if (str === '') return null;
                return JSON.parse(str);
            }
        };

    /*
        Tunnel
        两个不同域的iframe之间互相通信
    */
    var self, other, Tunnel = core.extend({}, Events),
        sendMessage = core.noop,
        sends = {}, // 发出的ask请求暂存
        receives = {}, // 收到的ask的promise
        provides = {}; // 能提供的回调列表
        
    function init(a, b){
        self = a, other = b;
    }
    
    // handler返回一个Deferred/Promise
    Tunnel.provide = function(name, handler){
        provides[name] = handler;
    };
    
    // 收到消息
    function onMessage(whisp){
        var uid = whisp.uid, type = whisp.type, data = whisp.data;
        switch (type){
            case Whisper.notify:
            // 收到普通message
                Tunnel.fire('message', data);
                break;
            case Whisper.ask:
            // 收到回调请求
                var name = data.name, params = data.params, handler = provides[name];
                // 查找这个请求的name是否已经provide
                if (!handler){
                    throw '`' + name + '` is not provided';
                }
                var promise = handler(params, function(result){
                    setTimeout(function(){
                        // handler完成时，把result answer给对应的uid
                        if (uid in receives){
                            delete receives[uid]; // 从收到请求列表里删除
                            Tunnel.answer(uid, result);
                        }
                    }, 0);
                });
                receives[uid] = promise;
                break;
            case Whisper.answer:
            // 收到回调应答
                var promise = sends[uid];
                if (promise){
                    // 还在等待回应列表中，说明没被abort
                    delete sends[uid]; // 从等待回应列表里删除
                    // 根据结果执行回调，resolve或者reject
                    promise[data.method](data);
                }
                break;
            case Whisper.abort:
            // 收到abort请求
                var promise = receives[uid];
                if (promise){
                    // 还在收到请求列表中，说明尚未完成
                    delete receives[uid]; // 从收到请求列表里删除
                    promise.reject(); // 将异步调用取消
                }
                break;
        }
    }
    
    // 发送回调请求
    function doAsk(name, params){
        var whisp = Whisper.create(Whisper.ask, {
            name: name, params: params
        });
        
        // 保存promise
        var promise = sends[whisp.uid] = new Deferred(); // 其实我什么都不想干
        
        return extend(promise, {
            whisper: whisp,
            abort: function(){
                if (whisp.uid in sends){
                    // 请求失败
                    // 如果promise还在sends里，说明没完成
                    promise.reject({
                        status: 'abort', data: null
                    });
                    delete sends[whisp.uid];
                    Tunnel.abort(whisp.uid); // 向other发送abort请求
                }
            }
        });
    }
    
    Tunnel.notify = function(data){
        var whisp = Whisper.create(Whisper.notify, data);
        sendMessage(whisp);
    };
    // 返回的是一个带abort功能的promise
    Tunnel.ask = function(name, params){
        var promise = doAsk(name, params);
        if (promise !== false) sendMessage(promise.whisper);
        return promise;
    };
    Tunnel.answer = function(uid, params){
        var whisp = Whisper.from(uid, Whisper.answer, params);
        sendMessage(whisp);
    };
    Tunnel.abort = function(uid){
        var whisp = Whisper.from(uid, Whisper.abort);
        sendMessage(whisp);
    };
    if (window.postMessage){
        Tunnel.listen = function(a, b){
            init(a, b);
            browser.bindEvent(self, 'message', function(e){
                if (Tunnel.checkOrigin && e.origin !== Tunnel.checkOrigin) return;
                onMessage(JSON.parse(e.data));
            });
        };
        sendMessage = function(whisper){
            other.postMessage(JSON.stringify(whisper), '*');
        };
    }else{
        /*
            不支持postMessage的时候，用window.name做跳板
            self.name可以读也可以写，用来被other写，然后自己读，收消息
            other.name能写不能读，用来自己写，等other读，发消息
        */
        var message_queue = Deferred.now, delay = 25;
        Tunnel.listen = function(a, b){
            init(a, b);
            var last = self.name;
            Tunnel.interval = setInterval(function(){
                var name = self.name;
                if (name === last) return;
                last = name;
                var whisp = Whisper.parse(name);
                if (whisp && !empty(whisp.uid)){
                    onMessage(whisp);
                }
            }, delay);
        };
        sendMessage = function(whisper){
            message_queue = message_queue.then(function(){
                other.name = JSON.stringify(whisper);
            }).delay(delay * 2); // 让消息以最小delay * 2的间隔发出，防止对方来不及听到就被覆盖
        };
    }

    return Tunnel;
});