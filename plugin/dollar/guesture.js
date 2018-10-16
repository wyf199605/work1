var initGestrue = function (id, callbacks) {
    var initCallback = {
        "callback"              : null,
        "triangle"              : null,
        "x"                     : null,
        "rectangle"             : null,
        "circle"                : null,
        "check"                 : null,
        "caret"                 : null,
        "zig-zag"               : null,
        "arrow"                 : null,
        "left square bracket"   : null,
        "right square bracket"  : null,
        "v"                     : null,
        "delete"                : null,
        "left curly brace"      : null,
        "right curly brace"     : null,
        "star"                  : null,
        "pigtail"               : null
    }

    var gestureCallback = mui.extend({}, initCallback, callbacks);
    var _isDown, _points, _r, _g, _rc;

    initGestrueCanvas(id);

    var canvasDOM = document.getElementById(id);

    canvasDOM.addEventListener('touchstart', function (event) {
        mouseDownEvent(event.touches[0].clientX, event.touches[0].clientY, event);
    });

    canvasDOM.addEventListener('touchmove', function (event) {
        mouseMoveEvent(event.touches[0].clientX, event.touches[0].clientY)
    });

    canvasDOM.addEventListener('touchend', function (event) {
        mouseUpEvent(event);
    });

    function initGestrueCanvas(id) {
        //window.addEventListener("resize", resizeCanvas, false);
        _points = new Array();
        _r = new DollarRecognizer();

        var canvas = document.getElementById(id);
        // canvas.width = window.innerWidth;
        //  canvas.height = window.innerHeight;
        _g = canvas.getContext('2d');
       // _g.fillStyle = "rgb(0,0,225)";
       // _g.strokeStyle = "rgb(0,0,225)";
        _g.fillStyle = "rgba( 0, 0, 0, 0)";
        _g.strokeStyle = "rgba(0, 0, 0, 0)";
        _g.lineWidth = 3;
        _g.font = "16px Gentilis";
        _rc = getCanvasRect(canvas); // canvas rect on page
     //     _g.fillStyle = "rgb(255,255,136)";
        _g.fillStyle = "rgba(0, 0, 0, 0)";
        _g.fillRect(0, 0, _rc.width, canvas.offsetHeight);
        _isDown = false;
    }

    function getCanvasRect(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var w = canvas.width;
        var h = canvas.height;

        var cx = canvas.offsetLeft;
        var cy = canvas.offsetTop;
        while (canvas.offsetParent != null) {
            canvas = canvas.offsetParent;
            cx += canvas.offsetLeft;
            cy += canvas.offsetTop;
        }
        return {x: cx, y: cy, width: w, height: h};
    }

    function getScrollY() {
        var scrollY = 0;
        if (typeof(document.body.parentElement) != 'undefined') {
            scrollY = document.body.parentElement.scrollTop; // IE
        }
        else if (typeof(window.pageYOffset) != 'undefined') {
            scrollY = window.pageYOffset; // FF
        }
        return scrollY;
    }

    function mouseDownEvent(x, y, e) {
        //   console.log(x+":"+y);
        e.preventDefault && e.preventDefault();
        e.returnValue=false;
        e.stopPropagation && e.stopPropagation();
        document.onselectstart = function () {
            return false;
        }; // disable drag-select
        document.onmousedown = function () {
            return false;
        }; // disable drag-select
        _isDown = true;
        x -= _rc.x;
        y -= _rc.y - getScrollY();
        if (_points.length > 0)
            _g.clearRect(0, 0, _rc.width, _rc.height);
        _points.length = 1; // clear
        _points[0] = new Point(x, y);
        //drawText("Recording unistroke...");
    //    drawText("手势录制中...");
        _g.fillRect(x - 4, y - 3, 9, 9);
    }

    function mouseMoveEvent(x, y) {
        if (_isDown) {
            x -= _rc.x;
            y -= _rc.y - getScrollY();
            _points[_points.length] = new Point(x, y); // append
            drawConnectedPoint(_points.length - 2, _points.length - 1);
        }
    }
    function mouseUpEvent(e) {
        e.preventDefault && e.preventDefault();
        e.returnValue=true;
        e.stopPropagation && e.stopPropagation();
        document.onselectstart = function () {
            return true;
        }; // enable drag-select
        document.onmousedown = function () {
            return true;
        }; // enable drag-select

        if (_points.length > 0)
            _g.clearRect(0, 0, _rc.width, _rc.height);

        if (_isDown) {
            _isDown = false;

            if (_points.length >= 10) {
                //var result = _r.Recognize(_points, document.getElementById('useProtractor').checked);
                var result = _r.Recognize(_points, true);
                //  drawText("Result: " + result.Name + " (" + round(result.Score, 2) + ").");
                //    drawText("匹配结果: " + result.Name + " (" + round(result.Score, 2) + ").");
    //            console.log("匹配结果: " + result.Name + " (" + round(result.Score, 2) + ").");
            //    mui.toast();
                if(typeof gestureCallback[result.Name] === 'function'){
                    gestureCallback[result.Name]();
                    gestureCallback.callback();
                };
            }
            else // fewer than 10 points were inputted
            {
                //drawText("Too few points made. Please try again.");
                //   drawText("Too few points made. Please try again.");
                //    drawText("手势太短,请重试.");
            }
        }
    }
    function drawText(str) {
        _g.fillRect(0, 0, _rc.width, 20);
        _g.fillStyle = "rgba(0, 0, 0, 0)";
        _g.fillText(str, 5, 14);
    }
    function drawConnectedPoint(from, to) {
        _g.lineWidth = 5;
        _g.beginPath();
        _g.moveTo(_points[from].X, _points[from].Y);
        _g.lineTo(_points[to].X, _points[to].Y);
        _g.closePath();
        _g.strokeStyle = "#555";
        _g.stroke();
    }
    function round(n, d) // round 'n' to 'd' decimals
    {
        d = Math.pow(10, d);
        return Math.round(n * d) / d
    }

};
