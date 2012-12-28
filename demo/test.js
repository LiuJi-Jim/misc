define(function(require){
    var Jas = require('jas');
    var flow = new Jas();
    function write(str){
        var p = document.createElement('p');
        p.innerHTML = str;
        document.body.appendChild(p);
    }
    flow.when(['a', 'b'], function(){
        write(3);
    });
    flow.when('#', function(){
        setTimeout(function(){
            write(1);
            flow.now('a');
        }, 1000);
    });
    flow.when('#', function(){
        setTimeout(function(){
            write(2);
            flow.now('b');
        }, 2000);
    });
    flow.now('#');

    //debugger;
});