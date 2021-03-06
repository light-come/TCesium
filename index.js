var script = [
  ,
  //编辑器资源
  '<link rel=stylesheet href="/lib/plugins/codemirror-5.14.2/doc/docs.css">',
  '<link rel="stylesheet" href="/lib/plugins/codemirror-5.14.2/lib/codemirror.css">',
  '<link rel="stylesheet" href="/lib/plugins/codemirror-5.14.2/addon/hint/show-hint.css">',
  '<script src="/lib/plugins/codemirror-5.14.2/lib/codemirror.js"></script>',
  '<script src="/lib/plugins/codemirror-5.14.2/addon/hint/show-hint.js"></script>',
  '<script src="/lib/plugins/codemirror-5.14.2/addon/hint/javascript-hint.js"></script>',
  '<script src="/lib/plugins/codemirror-5.14.2/mode/javascript/javascript.js"></script>',
  '<script src="/lib/plugins/codemirror-5.14.2/mode/markdown/markdown.js"></script>',
];
script.forEach(element => {
  document.writeln(element);
});
const uri = "./example/";
const version = "1.0.0";
let array = [
  { name: "你好地球" },
  { name: "建筑模型" },
  { name: "球体自转" },
  { name: "添加底图" },
  { name: "加载GLTF或GLB模型" },
  { name: "登月动画" },
  { name: "模型销毁" },
  { name: "人物巡逻" },
  { name: "区域范围" },
  { name: "场景透明" },
  { name: "模型运动" },
  { name: "绘制" },
  { name: "测量" },
  { name: "内置控件" },
  { name: "天气模拟" },
  { name: "带你去爬山" },
  { name: "旋转控件" },
  { name: "人物漫游" },
];
for (let index = 0; index < array.length; index++) {
  array[index]["uri"] = uri + (index + 1) + "-" + version + "-" + encodeURI(array[index].name);
  array[index]["url"] = array[index]["uri"] + ".html";
}
console.log(array);
/**
 * 初始化编辑器
 */
function init_editor(value) {
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    mode: { name: "javascript", globalVars: true },
  });
  editor.setValue(value);
  return editor;
}
/**
 * Get请求
 * @param {*} url 请求地址
 * @param {*} event 回调方法
 * @param {*} textType 返回类型
 */
const Get = (url, event, textType) => {
  var request = new XMLHttpRequest();
  var method = "GET";
  var TextType = textType ?? "JSON";
  request.open(method, url);
  request.send(null);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && (request.status == 200 || request.status == 304)) {
      if (event) {
        let data = request.responseText;
        switch (TextType) {
          case "JSON":
            data = eval("(" + data + ")");
            break;
          default:
            break;
        }
        event(data);
      }
    }
  };
};

function init(e) {
  //编译器对象初始化
  Get(
    "index.js",
    function (data) {
      // document.getElementById("code").innerHTML = data;
      _editor = init_editor(data);
      if (e) e(); //最后一个get防止异步变量无法同步
    },
    "text"
  );
  array.forEach(element => {
    let dom = document.createElement("a");
    dom.setAttribute("href", "#" + element.url);
    dom.setAttribute("style", " margin: 10px; ");

    dom.innerHTML = element.name;
    let p = document.createElement("p");
    p.setAttribute("style", " display:inline; ");

    p.appendChild(dom);
    dom.onclick = function () {
      var by = document.getElementById("core_content");
      if (by) by.setAttribute("src", this.href.split("#")[1]);
      const href = this.href.split("#")[1];

      //修改编辑器框内容
      if (_editor) {
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if (element.url === href) {
            Get(
              array[index]["uri"] + ".js",
              function (data) {
                _editor.setValue(data);
              },
              "text"
            );
          }
        }
      }
    };
    // document.body.appendChild( p );
    document.getElementsByClassName("navigation")[0].appendChild(p);
  });
}
//保持链接
function Link(e) {
  function getQueryVariable() {
    var query = window.location.href;
    var vars = query.split("#");
    if (vars.length > 1) {
      return vars[1] == "" ? false : vars[1];
    }
    return false;
  }

  hashChangeFire();
  if (getQueryVariable()) {
    setTimeout(() => {
      console.log(decodeURI(getQueryVariable()));
    }, 1000);
  }
  if ("onhashchange" in window && (typeof document.documentMode === "undefined" || document.documentMode == 8)) {
    // 浏览器支持onhashchange事件
    window.onhashchange = hashChangeFire; // TODO，对应新的hash执行的操作函数
  } else {
    // 不支持则用定时器检测的办法
    setInterval(function () {
      var ischanged = isHashChanged(); // TODO，检测hash值或其中某一段是否更改的函数
      if (ischanged) {
        hashChangeFire(); // TODO，对应新的hash执行的操作函数
      }
    }, 150);
  }
  function hashChangeFire() {
    var _index = getQueryVariable();
    if (e) e(_index);
  }
}

window.onload = () => {
  //初始化全局变量
  window._editor = undefined;
  //初始化交互信息
  init(function () {
    //保持链接
    Link(function (uri) {
      if (uri) var by = document.getElementById("core_content");
      if (by) by.setAttribute("src", uri); //+'?'+new Date().getTime()
      //修改编辑器框内容
      if (_editor) {
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if (element.url === uri) {
            Get(
              array[index]["uri"] + ".js",
              function (data) {
                _editor.setValue(data);
              },
              "text"
            );
          }
        }
      }
    });
  });
};
