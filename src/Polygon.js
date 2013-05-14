;(function(){
var INFINITY = 1e10;
var ESP = 1e-5;
var MAX_N = 1000;
var PI = Math.PI;
var abs = Math.abs, max = Math.max, min = Math.min;

// 计算叉乘 |P0P1| × |P0P2|
function Multiply(p1, p2, p0){
    return ( (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y) );
}
// 判断线段是否包含点point
function IsOnline(point, line){
    return((abs(Multiply(line.pt1, line.pt2, point)) < ESP) &&
           ((point.x - line.pt1.x) * (point.x - line.pt2.x) <= 0) &&
           ((point.y - line.pt1.y) * (point.y - line.pt2.y) <= 0) );
}
// 判断线段相交
function Intersect(L1, L2){
    return((max(L1.pt1.x, L1.pt2.x) >= min(L2.pt1.x, L2.pt2.x)) &&
           (max(L2.pt1.x, L2.pt2.x) >= min(L1.pt1.x, L1.pt2.x)) &&
           (max(L1.pt1.y, L1.pt2.y) >= min(L2.pt1.y, L2.pt2.y)) &&
           (max(L2.pt1.y, L2.pt2.y) >= min(L1.pt1.y, L1.pt2.y)) &&
           (Multiply(L2.pt1, L1.pt2, L1.pt1) * Multiply(L1.pt2, L2.pt2, L1.pt1) >= 0) &&
           (Multiply(L1.pt1, L2.pt2, L2.pt1) * Multiply(L2.pt2, L1.pt2, L2.pt1) >= 0)
          );
}

var Polygon = function(points){
    this.points = points.slice(0);
    var sumx = 0, sumy = 0;
    var left = INFINITY, bottom = 0,
        top = INFINITY, right = 0;
    for (var i=0, n=this.points.length; i<n; ++i){
        var p = this.points[i];
        if (p.x > right) right = p.x;
        if (p.x < left) left = p.x;
        if (p.y > bottom) bottom = p.y;
        if (p.y < top) top = p.y;
    }
    this.bounds = {
        top: top, right: right, bottom: bottom, left: left,
        width: right - left, height: bottom - top,
        centerX: (right + left) / 2.0,
        centerY: (top + bottom) / 2.0
    };
    for (var i=0, n=this.points.length; i<n; ++i){
        var p = this.points[i];
        p.theta = -Math.atan((p.y-this.bounds.bottom)/(p.x-this.bounds.left));
    }
    // 顶点逆时针排列
    // 这里的逆时针是笛卡尔坐标系下的逆时针，也就是左下角为原点
    // 而屏幕坐标系左手系，左上角为原点，+y方向向下
    this.points = this.points.sort(function(a, b){
        return (a.theta - b.theta);
    });
};
// 射线法判断点point与多边形的位置关系
Polygon.prototype.contains = function(point){
    // 使用bound rectangle加速
    if (point.x < this.bounds.left
        || point.x > this.bounds.right
        || point.y < this.bounds.top
        || point.y > this.bounds.bottom){
        return false;
    }
    var points = this.points;
        n = points.length,
        count = 0,
        line = {
            pt1: point, 
            pt2: { x: -INFINITY, y: point.y }
        };

    for( var i = 0; i < n; i++ ) {
        // 得到多边形的一条边
        var side = {
            pt1: points[i],
            pt2: points[(i + 1) % n]
        };

        if(IsOnline(point, side)) {
            return true; // 在多边形上
        }

        // 如果side平行x轴则不作考虑
        if( abs(side.pt1.y - side.pt2.y) < ESP ) {
            continue;
        }

        if(IsOnline(side.pt1, line)) {
            if(side.pt1.y > side.pt2.y) count++;
        }else if(IsOnline(side.pt2, line)) {
            if(side.pt2.y > side.pt1.y) count++;
        }else if(Intersect(line, side)) {
            count++;
        }
    }

    if (count % 2 == 1) {
        return true; // 在多边形内
    }else {
        return false; // 不在多边形内
    }
};

if (typeof window !== 'undefined') window.Polygon = Polygon;
if (typeof module !== 'undefined') module.exports = Polygon;
})();