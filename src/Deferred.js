/*
    一个简单的（异步）延迟队列
    提供最简单的promise模型
    new Deferred(ok, ng)分别定义resolve/reject的时候的函数
        ok、ng都可选，且参数都可变长。默认什么也不做，直接传递。
    resolve(obj)正确触发，reject(err)错误触发
    var second = first.then(ok, ng)返回一个新的Deferred
        first的ok/ng的返回值会作为second的ok/ng的参数
        first被resolve/reject时，second的ok/ng会立即触发
        如果second的ok/ng返回值是Deferred，second会在其next
        否则second将会立即resolve/reject
*/
;define(function(require){
    var core     = require('core');
    
    var state_unresolved = 0,
        state_resolved = 1,
        state_rejected = -1,
        PASS = function(ret){
            return ret;
        };
    var Deferred = function(ok, ng){
        if (!core.isF(ok)) ok = PASS;
        if (!core.isF(ng)) ng = PASS;
        var me = this;
        me.ok = ok; me.ng = ng;
        me._nexts = [];
        me.state = state_unresolved;
    };
    Deferred.prototype = {
        _addOK: function(ok){
            add(this, this.oks, ok, this.args, state_resolved);
        },
        _addNG: function(ng){
            add(this, this.ngs, ng, this.errs, state_rejected);
        },
        _pushOrFire: function(waits){
            var me = this, promise = waits.promise, ok = waits.ok, ng = waits.ng;
            if (me.state == state_resolved){
                me._fireNextOK(promise, ok);
            }else if (me.state == state_rejected){
                me._fireNextNG(promise, ng);
            }else{
                me._nexts.push(waits);
            }
        },
        _fireNextOK: function(promise, ok){
            var me = this, ret = ok.call(promise, me.okResult); // 把当前ok的结果作为then的ok的参数传入
            if (ret instanceof Deferred){
                // then的ok返回结果是个Promise
                // 则需要在其resolve/reject后才能把promise给resolve/reject
                ret.then(function(obj){
                    promise.resolve(obj);
                }, function(err){
                    promise.reject(err);
                });
            }else{
                // 直接将then给resolve
                promise.resolve(ret);
            }
        },
        _fireNextNG: function(promise, ng){
            var me = this, ret = ng.call(promise, me.ngResult); // 把当前ng的结果作为then的ng的参数传入
            if (ret instanceof Deferred){
                // then的ng返回结果是个Promise
                // 则需要在其resolve/reject后才能把promise给resolve/reject
                ret.then(function(obj){
                    promise.resolve(obj);
                }, function(err){
                    promise.reject(err);
                });
            }else{
                // 直接将then给reject
                promise.reject(ret);
            }
        },
        then: function(ok, ng){
            var me = this, other = new Deferred();
            if (!core.isF(ok)) ok = PASS;
            if (!core.isF(ng)) ng = PASS;
            me._pushOrFire({
                promise: other,
                ok: ok, ng: ng
            }); // 在me的等候列表里加一个，亦或直接触发
            return other;
        },
        resolve: function(obj){
            var me = this, nexts = me._nexts;
            if (me.state != state_unresolved) return; // 已经resolve或者reject
            me.state = state_resolved;
            me.okResult = me.ok.call(me, obj); // 保存ok的结果
            while (nexts.length > 0){
                me._pushOrFire(nexts.shift());
            }
            return me;
        },
        reject: function(err){
            var me = this, nexts = me._nexts;
            if (me.state != state_unresolved) return; // 已经resolve或者reject
            me.state = state_rejected;
            me.ngResult = me.ng.call(me, err); // 保存ng的结果
            while (nexts.length > 0){
                me._pushOrFire(nexts.shift());
            }
            return me;
        },
        delay: function(ms){
            return this.then(function(res){
                var def = new Deferred();
                setTimeout(function(){
                    def.resolve(res);
                }, ms);
                return def;
            });
        }
    };
    Deferred.when = function(condition, ok, ng){
        return condition.then(ok, ng);
    };
    Deferred.now = new Deferred().resolve();

    return Deferred;
});