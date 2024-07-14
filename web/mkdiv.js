"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draw =
  exports.wrapList =
  exports.wrapDiv =
  exports.logdiv =
  exports.mkdiv =
    void 0;
function mkdiv(type, attr, children) {
  if (attr === void 0) {
    attr = {};
  }
  if (children === void 0) {
    children = "";
  }
  var div = document.createElement(type);
  for (var key in attr) {
    if (key.match(/on(.*)/)) {
      div.addEventListener(key.match(/on(.*)/)[1], attr[key]);
    } else {
      div.setAttribute(key, attr[key]);
    }
  }
  var charray = !Array.isArray(children) ? [children] : children;
  charray.forEach(function (c) {
    typeof c == "string" ? (div.innerHTML += c) : div.append(c);
  });
  return div;
}
exports.mkdiv = mkdiv;
function logdiv() {
  var logs = [];
  var errPanel = mkdiv("div");
  var infoPanel = mkdiv("pre", {
    style:
      "width:30em;min-height:299px;scroll-width:0;max-height:299px;overflow-y:scroll",
  });
  var stderr = function (str) {
    return (errPanel.innerHTML = str);
  };
  var stdout = function (log) {
    logs.push((performance.now() / 1e3).toFixed(3) + ": " + log);
    if (logs.length > 100) logs.shift();
    infoPanel.innerHTML = logs.join("\n");
    infoPanel.scrollTop = infoPanel.scrollHeight;
  };
  return {
    stderr: stderr,
    stdout: stdout,
    infoPanel: infoPanel,
    errPanel: errPanel,
  };
}
exports.logdiv = logdiv;
function wrapDiv(div, tag, attrs) {
  if (attrs === void 0) {
    attrs = {};
  }
  return mkdiv(tag, attrs, [div]);
}
exports.wrapDiv = wrapDiv;
function wrapList(divs) {
  return mkdiv("div", {}, divs);
}
exports.wrapList = wrapList;
function alignedForm(title, fields) {
  "<form>\n  <fieldset>\n    <legend>Simple form</legend>\n    <div class=\"input-group fluid\">\n      <label for=\"username\">Username</label>\n      <input type=\"email\" value=\"\" id=\"username\" placeholder=\"username\">\n    </div>\n    <div class=\"input-group fluid\">\n      <label for=\"pwd\">Password</label>\n      <input type=\"password\" value=\"\" id=\"pwd\" placeholder=\"password\">\n    </div>\n    <div class=\"input-group vertical\">\n      <label for=\"nmbr\">Number</label>\n      <input type=\"number\" id=\"nmbr\" value=\"5\">\n    </div>\n  </fieldset>\n</form>";
}
// @ts-ignore
var draw = function (getData, length, canvas) {
  var slider = mkdiv(
    "input",
    { type: "range", value: 1, max: 10, min: -10, step: 0.2 },
    []
  );
  var zoomScale = 1,
    zoomXscale = 1;
  var height =
    parseInt(canvas.getAttribute("height")) ||
    canvas.parentElement.clientHeight;
  var width =
    parseInt(canvas.getAttribute("width")) || canvas.parentElement.clientWidth;
  var canvasCtx = canvas.getContext("2d");
  canvas.setAttribute("width", width + "");
  canvas.setAttribute("height", height + "");
  canvasCtx.fillStyle = "rbga(0,2,2,0.1)";
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = "white";
  var dataArray = new Float32Array(length);
  var convertY = function (y) {
    return (y * height * zoomScale) / 2 + height / 2;
  };
  canvas.parentElement.append(slider);
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, convertY(0));
  var t = 0;
  canvasCtx.lineWidth = 1;
  var x = 0;
  var timer;
  function draw(once) {
    if (once === void 0) {
      once = false;
    }
    var dataArrayOrDone = getData();
    if (dataArrayOrDone === null) {
      return;
    } else {
      dataArray = dataArrayOrDone;
    }
    var bufferLength = dataArray.length;
    canvasCtx.beginPath();
    var sum = 0;
    canvasCtx.moveTo(0, height / 2);
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.fillStyle = "rbga(10,10,10, ".concat(1 * 100, ")");
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.strokeStyle = "white";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    var x = 0,
      iwidth = (width / bufferLength) * zoomXscale; //strokeText(`r m s : ${sum / bufferLength}`, 10, 20, 100)
    for (var i = 0; i < bufferLength; i++) {
      canvasCtx.lineTo(x, convertY(dataArray[i]));
      x += iwidth;
    }
    canvasCtx.stroke();
    if (once) return;
    timer = requestAnimationFrame(function () {
      return draw(false);
    });
  }
  canvas.onkeydown = function (e) {
    if (e.code == "+") zoomScale += 0.5;
  };
  function zoom(e) {
    zoomXscale = Math.pow(2, parseInt(e.target.value));
    draw(true);
  }
  slider.removeEventListener("input", zoom);
  slider.addEventListener("input", zoom);
  draw(true);
  return {
    canvas: canvas,
    stop: function () {
      clearTimeout(timer);
    },
    start: function () {
      draw();
    },
    drawOnce: function () {
      draw(true);
    },
  };
};
exports.draw = draw;
