;(function(){
var exports = typeof module !== 'undefined' ? module.exports : (window.geo = {});

var projection = false;
function project(lat, lng){
    lng = lng / Math.PI * 180 + 180;
    //lat = 55 * Math.PI / 180;
    //lat = Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)));
    lat = Math.log(Math.tan(Math.PI / 4 + lat / 2));
    lat = -lat / Math.PI * 180 + 90;

    if (lng < 0) lng += 360;
    if (lng > 360) lng -= 360;
    return [lng, lat];
}

function trans(x){
    return x / 180.0 * Math.PI;
}

exports.project = project;
exports.trans = trans;
})();