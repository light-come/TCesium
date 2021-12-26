/*!
 * Taoist JavaScript Library v0.0.1
 * Date: 20211025
 */
( function( global, factory ) {
	"use strict";
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error("requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

  
    //球体自转 事件
    var multiplier = 200//球体旋转速度
    var previousTime//球体时间 与旋转速度相关 与日照相关
    //定义GIS对象
    var version = "0.0.1",
	// Define a local copy of Taoist
	Taoist = function(){
        // return Taoist.fn
        return new Taoist.fn.init()
	};
  Taoist.fn = Taoist.prototype = {
      Taoist: version,
      constructor: Taoist,
      create3D: function( Cesium ) {
          return Taoist.create3D(options,Cesium);
      },
      BaseLayer:function(viewer,options) {
          return Taoist.BaseLayer(viewer,options);
      },
      Open:function(gear,event) {
          return Taoist.Open(gear,event);
      },
      //遍历器
      each: function(fn) {
          var length = this.length;
          for(var i = 0; i < length; i++) {
              fn.call(this[i], i, this[i]);
          }
          return this;
      },
      size: function(){//原型方法
          return this.length;
      }
  };
  Object.defineProperties(Taoist, {
    viewer: {
        get: function() {
            return this._viewer
        },
        set: function(e) {
          this._viewer = e
        }
    }
  })

  
  Taoist.extend = Taoist.fn.extend = function(obj) {
      //obj是传递过来扩展到this上的对象
      var target = this;
      for (var name in obj){
          //name为对象属性
          //copy为属性值
          copy = obj[name];
          //防止循环调用
          if(target === copy) continue;
          //防止附加未定义值
          if(typeof copy === 'undefined') continue;
          //赋值
          target[name] = copy;
      }
      return target;
  };


  // 定义构造函数
  var init = Taoist.fn.init = function() {
      return this;
  }
  // 使用构造函数的原型扩张css和html方法
  init.prototype = Taoist.fn
  
  /**
   * 接收Iframe上层信息触发相应动作
   */
  Taoist.Open = function(gear,event){
      //触发器
      window.addEventListener('message', function (e) {
          // 我们能信任信息来源吗？
          // if (event.origin !== "http://example.com:8080")
          //     return;
          console.log('map',e.data)
          
          if(e.data, Object.getPrototypeOf(gear)[e.data.event] !== undefined){
              if(event){
                  //回调函数
                  event(e.data);
              }

              var eva = gear[e.data.event](e.data.value);
              if(eva != null){
                  if(eva.constructor === Object){
                      window.parent.postMessage(eva, '*');
                  }
                  console.log('回参',eva)
              }
          }
          
      }, false)
  }
  /**
   * 发送消息给Iframe上层
   * @param {String} message
   */
  Taoist.fn.Message = Taoist.ExternalMessage = async function(message){
      window.parent.postMessage(message, '*');
  }
  /**
   * 创建一个地球
   * @param {Object} Cesium
   * @param {Object} options
   * @returns viewer
   */
  Taoist.create3D = function (options, Cesium) {

      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGZiOTc1NS0zZmZlLTQ4MzUtODFlMS00ZDI2NWE5YTFkZjIiLCJpZCI6MTgwMDUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzMxMTcwODd9.WPytI-wsAoBmC7NLmz01l0GcYoh3bvTES7z1yZQgGMM';

      //初始化部分参数 如果没有就默认设为false;
      var args = ["geocoder", "homeButton", "sceneModePicker", "baseLayerPicker", "navigationHelpButton", "animation", "timeLine", "fullscreenButton", "vrButton", "infoBox", "selectionIndicator", "shadows"];
      for (var i = 0; i < args.length; i++) {
          if (!options[args[i]]) {
              options[args[i]] = false;
          }
      }
      options["shouldAnimate"] = true; //飞行漫游启动 viewer动画效果
      var container = options["id"];
      //创建viewer
      var viewer = new Cesium.Viewer(container, options);
      /**对Cesium的改造 *******************************************************************/
      //隐藏Cesium原有的一些控件，默认只剩一个球
      _hideCesiumElement();

      //设置鼠标的样式，在使用滚轮及右键对地球缩放或旋转时在鼠标位置添加一个图标
      _setMouseStyle(viewer, container);

      //解决限定相机进入地下
      viewer.camera.changed.addEventListener(function () {
          if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
              viewer.camera._suspendTerrainAdjustment = false;
              viewer.camera._adjustHeightForTerrain();
          }
      });

      viewer.scene.globe.depthTestAgainstTerrain = true;
      //开启hdr
      viewer.scene.highDynamicRange = true;

      viewer.scene.globe.enableLighting = true;

      
      // 分辨率调整函数
      if(Cesium.FeatureDetection.supportsImageRenderingPixelated()){//判断是否支持图像渲染像素化处理
          viewer.resolutionScale = window.devicePixelRatio;
      }
      //是否开启抗锯齿
      viewer.scene.fxaa = true;
      viewer.scene.postProcessStages.fxaa.enabled = true;
      var supportsImageRenderingPixelated = viewer.cesiumWidget._supportsImageRenderingPixelated;
      if (supportsImageRenderingPixelated) {
          var vtxf_dpr = window.devicePixelRatio;
          while (vtxf_dpr >= 2.0) { vtxf_dpr /= 2.0; }
          viewer.resolutionScale = vtxf_dpr;
      }

      viewer.scene.fog.enabled = true;//雾
      viewer.scene.globe.enableLighting = true;//照明

      //移除默认的bing影像图层
      viewer.imageryLayers.removeAll();
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());

      //是否关闭大气效果
      if (options.showGroundAtmosphere && options.showGroundAtmosphere == true) {
          viewer.scene.globe.showGroundAtmosphere = true;
      } else {
          viewer.scene.globe.showGroundAtmosphere = false;
      }

      /************************Debug模式 */
      //debug模式，显示实时帧率
      if (options.debug) {
          viewer.scene.debugShowFramesPerSecond = true;
      }

      viewer.config = options;

      /************************回调函数 */
      //加载成功后回调函数
      if (options.success) {
          options.success(viewer);
      }

      return viewer;
  };
  //底部隐藏
  function _hideCesiumElement() {
    const array = [
        'cesium-viewer-toolbar','cesium-viewer-animationContainer','cesium-viewer-timelineContainer','cesium-viewer-bottom'
    ]
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(document.getElementsByClassName(element).length >= 1){
            // HTMLElement Element
            let objs = document.getElementsByClassName(element)
            for (let index = 0; index < objs.length; index++) {
                (objs[index])
                .style.visibility="hidden"
            }
        }
    }
  }
  //设置鼠标的样式
  function _setMouseStyle(viewer, container) {
    //修改视图默认鼠标操作方式
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
    viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];
    // document.body.appendChild( renderer.domElement );

    let buff = document.createElement("div")
    let buff_1 = document.createElement("div")
    buff.setAttribute("class", "cesium-mousezoom")
    buff_1.setAttribute("class", "zoomimg")
    buff.appendChild(buff_1)
    document.getElementById(container).appendChild(buff);
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    function getMousezoomElement() {
        if(document.getElementsByClassName("cesium-mousezoom").length >= 1){
            // HTMLElement Element
            let objs = document.getElementsByClassName("cesium-mousezoom")
            for (let index = 0; index < objs.length; index++) {
                let Element = (objs[index])
                return Element
            }
        
        }
        return undefined
    }
    //按住鼠标右键
    handler.setInputAction(function (event) {
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        let element = getMousezoomElement()
        if(element){
            element.style.top= (event.position.y + 'px')
            element.style.left= (event.position.x + 'px')
            element.className = 'cesium-mousezoom cesium-mousezoom-visible';
        }
    
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    //抬起鼠标右键
    handler.setInputAction(function (event) {
        let element = getMousezoomElement()
        handler.setInputAction(function (evnet) {
            if(element){
                element.style.top= (evnet.endPosition.y + 'px')
                element.style.left= (evnet.endPosition.x + 'px')
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        element.className = 'cesium-mousezoom';
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);

    //按住鼠标中键
    handler.setInputAction(function (event) {
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        let element = getMousezoomElement()
        if(element){
            element.style.top= (event.position.y + 'px')
            element.style.left= (event.position.x + 'px')
            element.className = 'cesium-mousezoom cesium-mousezoom-visible';
        }
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    //抬起鼠标中键
    handler.setInputAction(function (event) {
        let element = getMousezoomElement()
        handler.setInputAction(function (evnet) {
            if(element){
                element.style.top= (evnet.endPosition.y + 'px')
                element.style.left= (evnet.endPosition.x + 'px')
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        element.className = 'cesium-mousezoom';
    }, Cesium.ScreenSpaceEventType.MIDDLE_UP);

    //滚轮滚动
    handler.setInputAction(function (evnet) {
        let element = getMousezoomElement()
        handler.setInputAction(function (evnet) {
            if(element){
                element.style.top= (evnet.endPosition.y + 'px')
                element.style.left= (evnet.endPosition.x + 'px')
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        element.className = 'cesium-mousezoom cesium-mousezoom-visible';
        setTimeout(function () {
            element.className = 'cesium-mousezoom';
        }, 200);
    }, Cesium.ScreenSpaceEventType.WHEEL);
  }

  /**
   * 添加地图底图图层
   * @param {Object} viewer
   * @param {Object} options
   */
  Taoist.BaseLayer = (viewer, options) =>  {
      var imageryProvider = createImageryProvider(options);
      var imageryOption = {
          show: true,
          alpha: this._opacity
      };
      if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin && options.rectangle.ymax) {
          var xmin = options.rectangle.xmin;
          var xmax = options.rectangle.xmax;
          var ymin = options.rectangle.ymin;
          var ymax = options.rectangle.ymax;
          var rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
          this.rectangle = rectangle;
          imageryOption.rectangle = rectangle;
      }
      if (options.brightness)
          imageryOption.brightness = options.brightness;
      if (options.minimumTerrainLevel)
          imageryOption.minimumTerrainLevel = options.minimumTerrainLevel;
      if (options.maximumTerrainLevel)
          imageryOption.maximumTerrainLevel = options.maximumTerrainLevel;
      var layer = new Cesium.ImageryLayer(imageryProvider, imageryOption);
      layer.config = options;

      viewer.imageryLayers.add(layer);
      return layer;
  }
  /**
   * 添加地图底图图层
   * @param {Object} config
   */
  //创建地图底图
  function createImageryProvider(config) {
      var options = {};
      for (var key in config) {
          var value = config[key];
          if (value == null) return;

          switch (key) {
              case 'crs':
                  if (value == '4326' || value.toUpperCase() == 'EPSG4326') {
                      options.tilingScheme = new Cesium.GeographicTilingScheme({
                          numberOfLevelZeroTilesX: config.numberOfLevelZeroTilesX || 2,
                          numberOfLevelZeroTilesY: config.numberOfLevelZeroTilesY || 1
                      });
                  } else {
                      options.tilingScheme = new Cesium.WebMercatorTilingScheme({
                          numberOfLevelZeroTilesX: config.numberOfLevelZeroTilesX || 2,
                          numberOfLevelZeroTilesY: config.numberOfLevelZeroTilesY || 1
                      });
                  }
                  break;
              case 'rectangle':
                  options.rectangle = Cesium.Rectangle.fromDegrees(value.xmin, value.ymin, value.xmax, value.ymax);
                  break;
              default:
                  options[key] = value;
                  break;
          }
      }

      if (options.proxy) {
          options.url = new Cesium.Resource({
              url: options.url,
              proxy: options.proxy
          });
      }
      var layer;
      switch (options.type) {
          case 'image':
              layer = new Cesium.SingleTileImageryProvider(options);
              break;
          case 'xyz':
          case 'tile':
              options.customTags = {
                  "z&1": function z1(imageryProvider, x, y, level) {
                      return level + 1;
                  }
              };
              layer = new Cesium.UrlTemplateImageryProvider(options);
              break;
          case 'wms':
              layer = new Cesium.WebMapServiceImageryProvider(options);
              break;
          case 'wmts':
              layer = new Cesium.WebMapTileServiceImageryProvider(options);
              break;
          case "arcgis":
          case "arcgis_tile":
          case "arcgis_dynamic":
              layer = new Cesium.ArcGisMapServerImageryProvider(options);
              break;
          case "arcgis_cache":
              if (!Cesium.UrlTemplateImageryProvider.padLeft0) {
                  Cesium.UrlTemplateImageryProvider.padLeft0 = function (numStr, n) {
                      numStr = String(numStr);
                      var len = numStr.length;
                      while (len < n) {
                          numStr = "0" + numStr;
                          len++;
                      }
                      return numStr;
                  };
              }
              options.customTags = {
                  //小写
                  arc_x: function arc_x(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(x.toString(16), 8);
                  },
                  arc_y: function arc_y(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(y.toString(16), 8);
                  },
                  arc_z: function arc_z(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(level.toString(), 2);
                  },
                  //大写
                  arc_X: function arc_X(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
                  },
                  arc_Y: function arc_Y(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
                  },
                  arc_Z: function arc_Z(imageryProvider, x, y, level) {
                      return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
                  }
              };
              layer = new Cesium.UrlTemplateImageryProvider(options);
              break;
          case "www_gaode":
              //高德
              var _url;
              switch (options.layer) {
                  case "vec":
                  default:
                      //style=7是立体的，style=8是灰色平面的
                      _url = 'http://' + (options.bigfont ? 'wprd' : 'webrd') + '0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
                      break;
                  case "img_d":
                      _url = 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
                      break;
                  case "img_z":
                      _url = 'http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8';
                      break;
                  case "time":
                      var time = new Date().getTime();
                      _url = 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + time;
                      break;
              }

              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: ['1', '2', '3', '4'],
                  maximumLevel: 18
              });
              break;
          case "www_google":
              //谷歌国内
              var _url;

              if (config.crs == '4326' || config.crs == 'wgs84') {
                  //wgs84   无偏移
                  switch (options.layer) {
                      default:
                      case "img_d":
                          _url = 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}';
                          break;
                  }
              } else {
                  //有偏移
                  switch (options.layer) {
                      case "vec":
                      default:
                          _url = 'http://mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile';
                          break;
                      case "img_d":
                          _url = 'http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali';
                          break;
                      case "img_z":
                          _url = 'http://mt{s}.google.cn/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil';
                          break;
                      case "ter":
                          _url = 'http://mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile';
                          break;
                  }
              }

              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: ['1', '2', '3'],
                  maximumLevel: 20
              });
              break;
          case "www_osm":
              //OSM开源地图
              var _url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: "abc",
                  maximumLevel: 18
              });
              break;
          case "www_geoq":
              //智图开源地图
              var _url = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';
              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: "abc",
                  maximumLevel: 18
              });
              break; 
          case "thematic_geoq":
              //智图水系开源地图
              var _url = 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}';
              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: "abc",
                  maximumLevel: 18
              }); 
          case "sl_geoq":
              //智图深蓝开源地图
              var _url = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: "abc",
                  maximumLevel: 18
              });
              break;
          case "local":
              //本地
              var _url = options.url + '/{z}/{y}/{x}.png';
              layer = new Cesium.UrlTemplateImageryProvider({
                  url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                  subdomains: "abc",
                  maximumLevel: 18
              });
              break;
          case "tdt":
              //天地图
              var _url
              // 添加mapbox自定义地图实例 mapbox://styles/1365508153/ckmy004lc1bsj17n94k80cfik
              switch (options.layer) {
                  case 'satellite':
                      break;
                  case 'navigation': 
                      _url = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      break;
                  case 'blue':
                      // _url = "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer?tk=d97070ed5b0f397ed2dd8317bcbb486d";
                      _url = "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
                      break;       
                  case 'terrain':
                      break;      
              }
          

              layer = new Cesium.UrlTemplateImageryProvider({
                  url: _url,
                  subdomains: "abc",
                  maximumLevel: 18
              });
              break;
          case "mapbox":
              //mapboxgl的底图
              var style;
              // 添加mapbox自定义地图实例 mapbox://styles/1365508153/ckmy004lc1bsj17n94k80cfik
              var config = {
                  url:'https://api.mapbox.com/styles/v1',
                  username:'1365508153',
                  styleId: style,
                  accessToken: 'pk.eyJ1IjoiMTM2NTUwODE1MyIsImEiOiJja214ejg5ZWMwZGhqMnJxa3F3MjVuaTJqIn0.ERt-vJ_qoD10EP5CvwsEzQ',
                  scaleFactor:true,
              }
              switch (options.layer) {
                  case 'satellite':
                      style =  'ckmy0yizu18bx17pdcfh81ikn';
                      break;
                  case 'navigation': 
                      style =  'ckmy0li0j1cd717la2xd0mamg';
                      break;
                  case 'blue':
                      style =  'ckmy004lc1bsj17n94k80cfik';
                      break;       
                  case 'terrain':
                      style =  'ckn9dnm5b2m9a17o0nijfqbl3';
                      default:
                      config.styleId = options.layer;
                      config.accessToken = options.accessToken
                      config.username = options.username
                      break;
              }
              config.styleId = style
              var layer=new Cesium.MapboxStyleImageryProvider(config);
              break;
      }
      layer.config = options;
      layer.brightness = options.brightness;
      return layer;
  }
  /**
   * 隐藏指定的底图图层
   * @param {Object} viewer
   * @param {Object} layer (图层名字或图层对象)
   */
  Taoist.BaseLayer.hide =  Taoist.hideBaseLayer =  (viewer, layer) => {
      if (layer instanceof Cesium.ImageryLayer) {
          layer.show = false;
      } else {
          for (var i = 0; i < viewer.imageryLayers.length; i++) {
              var name = viewer.imageryLayers.get(i).config.name;
              if (name == layer) {
                  viewer.imageryLayers.get(i).show = false;
              }
          }
      }
  }
  /**
   * 显示指定的底图图层
   * @param viewer
   * @param layer (图层名字或图层对象)
   */
  Taoist.BaseLayer.show =  Taoist.BaseLayer.showBaseLayer = (viewer, layer) => {
      if (layer instanceof Cesium.ImageryLayer) {
          layer.show = true;
      } else {
          for (var i = 0; i < viewer.imageryLayers.length; i++) {
              var name = viewer.imageryLayers.get(i).config.name;
              if (name == layer) {
                  viewer.imageryLayers.get(i).show = true;
              }
          }
      }
  }
  /**
   * 移除指定的底图图层
   * @param {Object} viewer
   * @param {Object} layer (图层名字或图层对象)
   */
  Taoist.BaseLayer.remove =  Taoist.removeBaseLayer = (viewer, layer) => {
      if (layer instanceof Cesium.ImageryLayer) {
          viewer.imageryLayers.remove(layer);
      } else {
          for (var i = 0; i < viewer.imageryLayers.length; i++) {
              var name = viewer.imageryLayers.get(i).config.name;
              if (name == layer) {
                  viewer.imageryLayers.remove(viewer.imageryLayers.get(i));
              }
          }
      }
  }


  /**
   * 批量添加czml模型
   * @param {Object} viewer
   * @param {Object} options (图层名字或图层对象)
   */
  Taoist.CZMLModels = function(viewer,options){
      var models = [];
      options.ts.forEach(element => {

          var czml = [
              {
                  id: "document",
                  name: "CZML Model",
                  version: "1.0",
              },
              {
                  id: element.id ,
                  name: "Cesium Air",
                  position: {
                      cartographicDegrees: [element.x , element.y, element.z],
                  },
                  model: {
                      gltf: element.url,
                      scale: element.scale,
                      //minimumPixelSize: 128,
                  },
              },
              ];
          
          var dataSourcePromise = viewer.dataSources.add(
              Cesium.CzmlDataSource.load(czml)
          );

          // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
          //     Cesium.Cartesian3.fromDegrees(element.x , element.y, element.z));
          // var model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
          //     id :element.id,
          //     url: element.url,
          //     modelMatrix: modelMatrix,
          //     scale: element.scale
          // }));
          models.push(dataSourcePromise)
      });
      return models;

  }

  /**
   * 添加Gltf
   * @param {Object} viewer
   * @param {Object} options (坐标参数，模型地址及，模型朝向)
   */
  Taoist.aGLTF = function (viewer,options) {
    var model
    if(options instanceof  Cesium.Model){//typeof 
       model = viewer.scene.primitives.add(options)
    }else
      model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
          url: options.url,
          modelMatrix:  Cesium.Transforms.headingPitchRollToFixedFrame(
              Cesium.Cartesian3.fromDegrees(options.position.x , options.position.y, options.position.z),
              new Cesium.HeadingPitchRoll(
                  Cesium.Math.toRadians(options.position.h??0), 
                  Cesium.Math.toRadians(options.position.p??0), 
                  Cesium.Math.toRadians(options.position.r??0)
              ),
              Cesium.Ellipsoid.WGS84,
              Cesium.Transforms.localFrameToFixedFrameGenerator(
                  "north",
                  "west"
              )
          ),
          scale: options.scale
      }));
   
    return model;
  }

    /**
   * 添加model
   * @param {Object} viewer
   * @param {Object} options (坐标参数，模型地址及，模型朝向)
   */
    Taoist.aMODEL = function (viewer,options) {
      var model = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(options.position.x , options.position.y, options.position.z),
        model: {
          uri: options.url,
          scale:  options.scale
        }
      });
      return model;
    }

  /**
   * 移除Gltf
   * @param {Object} viewer
   * @param {Object} options (模型名字或模型对象)
   */
  Taoist.dGltf = function (viewer,Gltf){
      if (layer instanceof Cesium.Cesium3DTileset) {
          if (viewer.scene.primitives.contains(Gltf)) {
              viewer.scene.primitives.remove(Gltf);
          }
          
      } else {
          for (var i = 0; i < viewer.scene.primitives.length; i++) {
              var name = viewer.scene.primitives.get(i).config.id;
              if (name == Gltf) {
                  viewer.scene.primitives.remove(viewer.scene.primitives.get(i));
              }
          }
      }
  }

  /**
   * 根据id查询scene模型,Entities模型
   * @param {Object} viewer
   * @param {Object} options (坐标参数，模型地址及，模型朝向)
   */
  Taoist.Query = function(viewer,options){
      if(!options)
      {
          return[viewer.scene.primitives,viewer.entities._entities._array]
      }
      for (var i = 0; i < viewer.scene.primitives.length; i++) {
          if (viewer.scene.primitives.get(i).id == options.id) {
              return viewer.scene.primitives.get(i);
          }
      }
      var entitys = viewer.entities._entities._array;
      for (var i = 0; i < entitys.length; i++) {
          if (entitys[i]._id === options.id) {
              return entitys[i];
          }
      }
      return null
  }

  /**
   * 根据自定义类型查询模型数组
   * @param  {Object} viewer
   * @param  {Object} options (坐标参数，模型地址及，模型朝向)
   */
  Taoist.Query_X = function(viewer,options){
      if(!options)
      {
          return[viewer.scene.primitives,viewer.entities._entities._array]
      }
      var entitys = viewer.entities._entities._array;
      var _arr = [];
      for (var i = 0; i < entitys.length; i++) {
          if(entitys[i][Object.keys(options)[0]] === options[Object.keys(options)[0]]){
                  _arr.push(entitys[i])
          }
          
      }

      for (var i = 0; i < viewer.scene.primitives.length; i++) {
          if(viewer.scene.primitives.get(i)[Object.keys(options)[0]] === options[Object.keys(options)[0]]){
              _arr.push(viewer.scene.primitives.get(i))
          }
          
      }
      return _arr;
  } 


  /**
   * 绕点
   * @param {Object} viewer
   */
  Taoist.Rotate = function(viewer) {
      function initAutoRotateParameters(options, viewer) {
          if (Taoist.Rotate.ExectionState) {
              Taoist.Rotate.ExectionState = false;
              viewer.clock.onTick.removeEventListener(Taoist.Rotate.Exection);
              return;
          } else Taoist.Rotate.ExectionState = true;
          var position = Cesium.Cartesian3.fromDegrees(options.x, options.y, options.z);

          // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
          var pitch = Cesium.Math.toRadians(options.pitch??-30);
          // 给定飞行一周所需时间，比如30s, 那么每秒转动度数
          var angle = 360 / 90;
          // 给定相机距离点多少距离飞行，这里取值为5000m
          var distance = viewer.camera.positionCartographic.height;
          // var startTime = Cesium.JulianDate.fromDate(options.time??new Date());
          // // var stopTime = Cesium.JulianDate.addSeconds(startTime, 10, new Cesium.JulianDate());

          // viewer.clock.startTime = startTime.clone();  // 开始时间
          // // viewer.clock.stopTime = stopTime.clone();     // 结速时间
          // viewer.clock.currentTime = startTime.clone(); // 当前时间
          // viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
          // viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
          // 相机的当前heading
          var initialHeading = viewer.camera.heading;
          Taoist.Rotate.Exection = function TimeExecution() {
              // 当前已经过去的时间，单位s
              var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
              var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
              viewer.scene.camera.setView({
                  destination: position, // 点的坐标
                  orientation: {
                      heading: heading,
                      pitch: pitch,
                  }
              });
              viewer.scene.camera.moveBackward(distance);

              if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
                  viewer.clock.onTick.removeEventListener(Taoist.Rotate.Exection);
              }
          };

          viewer.clock.onTick.addEventListener(Taoist.Rotate.Exection);
      }
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (movement) {
          if(viewer.scene.pickPosition(movement.position)){
              var cartographic = Cesium.Cartographic.fromCartesian(viewer.scene.pickPosition(movement.position));
              var lng = Cesium.Math.toDegrees(cartographic.longitude);
              var lat = Cesium.Math.toDegrees(cartographic.latitude);
              var height = cartographic.height;//模型高度
              //distance = viewer.camera.positionCartographic.height;
              var mapPosition = { x: lng, y: lat, z: height,distance:viewer.camera.positionCartographic.height ,camera:G.C.getCameraView(viewer)}
              console.log(mapPosition)
              initAutoRotateParameters(mapPosition, viewer);
          }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      return initAutoRotateParameters;
  }
  //球体事件
  function onTickCallback() {

      var viewer = Taoist.viewer

      var spinRate = 1;
      var currentTime = viewer.clock.currentTime.secondsOfDay;
      var delta = (currentTime - previousTime) / 1000;
      previousTime = currentTime;
      viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  }
  /**
   * 自转
   * @param {Object} viewer
   */
  Taoist.Turn = function(viewer) {
    this._viewer = viewer

      function setvisible(viewer,value,time) {
          previousTime = viewer.clock.currentTime.secondsOfDay;
          switch (value) {
              case 'play':
                  viewer.clock.multiplier = multiplier; //速度
                  viewer.clock.onTick.addEventListener(onTickCallback);
                  break;
              case 'stop':
                  viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
                  viewer.clock.multiplier = 1; //速度
                  viewer.clock.onTick.removeEventListener(onTickCallback);
                  break;
              case'delayed':
                  setvisible(viewer,"play");
                  setTimeout(() => {
                      setvisible(viewer,"stop");
                  }, time == null ? 6000 : time);

                  break;
          }
      }
      return setvisible;
  }
  //销毁自转效果
  Taoist.Turn.Release = function(viewer) {
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
      viewer.clock.multiplier = 1; //速度
      viewer.clock.onTick.removeEventListener(onTickCallback);
  }

  /**
  *坐标定位
  * @param viewer 地图对象
  * @param mapPosition 坐标对象要包含xyzhpr duration
  */
  Taoist.Go = function(viewer,mapPosition,e) {

    var duration = (mapPosition.duration == null ? 0 : mapPosition.duration)
    setTimeout(() => {
        try {
            if(viewer.clock.multiplier == 1 || mapPosition.force){
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(mapPosition.x, mapPosition.y, mapPosition.z), //经度、纬度、高度
                    orientation: {
                        heading: mapPosition.h??0, //绕垂直于地心的轴旋转
                        pitch: mapPosition.p??0, //绕纬度线旋转
                        roll: mapPosition.r??0//绕经度线旋转
                    },
                    duration: duration
                });
            }
        } catch (error) {
            console.error({e:error,message:"定位异常"})
        }
    }, 10);
    setTimeout(() => {
      if(e)
        e()
    }, duration + 100);
  }
  /**
  *高程地形
  * @param viewer 地图对象
  * @param uri 高程资源
  */
  Taoist._TP = function(viewer,uri) {
    var provider = new Cesium.CesiumTerrainProvider({
      url: uri??'http://121.40.42.254:8008/%E6%9D%AD%E5%B7%9E-%E9%AB%98%E7%A8%8B/data/',
      requestWaterMask: true, //开启法向量
      requestVertexNormals: true, //开启水面特效
    });
    viewer.terrainProvider = provider;
  }

  /**
   * 添加3D图层
   * @param viewer
   * @param options
   */
  Taoist.a3DTiles = function(viewer, options,Style) {
      var tileset;
      tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset(options));
      tileset.readyPromise.then(function () {
          var boundingSphere = tileset.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
          var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,options.heightOffset == null ? 0 : options.heightOffset);
          var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, options.height);
          var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

          if (options.flyTo) {
              var timer = setInterval(() => {
                  if(viewer.clock.multiplier == 1 || viewer == undefined){
                      viewer.flyTo(tileset, {
                          offset : {
                              heading : Cesium.Math.toRadians(0.0),
                              pitch : Cesium.Math.toRadians(-25),
                              range : 0
                          },
                          duration: options.duration == undefined ? 3 : options.duration
                      });
                      // viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
                      clearInterval(timer)
                  }
              }, 500);
              
              //console.log('自动定位', new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
          }

      }).otherwise(function (error) {
          console.log('add3DTiles', error);
      });
  
      var defaultStyle = new Cesium.Cesium3DTileStyle({
          color: Style.color
      });
      tileset.style = defaultStyle;
      tileset.show = Style.show;
      tileset.id = options.id;
      tileset.name = options.name;
      tileset.options = options;
      
      if(options.ca){
          //添加模型高低颜色差
          tileset.style = new Cesium.Cesium3DTileStyle({
              color: {
                  conditions: [
                      ['${floor} >= 300', 'rgba(45, 0, 75, 0.5)'],
                      ['${floor} >= 200', 'rgb(102, 71, 151)'],
                      ['${floor} >= 100', 'rgb(170, 162, 204)'],
                      ['${floor} >= 50', 'rgb(224, 226, 238)'],
                      ['${floor} >= 25', 'rgb(252, 230, 200)'],
                      ['${floor} >= 10', 'rgb(248, 176, 87)'],
                      ['${floor} >= 5', 'rgb(198, 106, 11)'],
                      ['true', 'rgb(127, 59, 8)']
                  ]
              }
          });
      }
      return tileset;

  }
  /**
  * 定位时戳到中午十二点
  * @param viewer
  */
  Taoist.sTime = function(viewer,time) {
    var _time = time??'2021-10-08T04:00:43.52Z';
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(_time));
  }

  /**
   * 漫游
   * @param {*} view 
   */
   Taoist.aFR = (viewer, options , timer) => {
    console.log(options)


      function getTimes(mm,timer) {
        mm = mm??10
        var timer;
        cameraTimer = timer ??'04:00:00';
          var hour = cameraTimer.split(':')[0];
          var min = cameraTimer.split(':')[1];
          var sec = cameraTimer.split(':')[2];
          var s = Number(hour*3600) + Number(min*60) + Number(sec) ;//加当前相机时间
          function formatTime(s) {
              var t;
              if(s > -1){
                  var hour = Math.floor(s/3600);
                  var min = Math.floor(s/60) % 60;
                  var sec = s % 60;
                  if(hour < 10) {
                      t = '0'+ hour + ":";
                  } else {
                      t = hour + ":";
                  }
      
                  if(min < 10){t += "0";}
                  t += min + ":";
                  if(sec < 10){t += "0";}
                  t += sec.toFixed(2);
              }
              return t;
          }
          var date = new Date()
        timer = date.getFullYear()+"-"+(date .getMonth()+1)+"-"+(date .getDate())+"T" +  formatTime(s + mm) + "+0000"
        return timer;
      }
      
      var start =  Cesium.JulianDate.fromDate(new Date(getTimes(options.positions[0].time,timer)));
      var stop = Cesium.JulianDate.addSeconds(start, options.stopTime ?? options.positions[options.positions.length-1].time, new Cesium.JulianDate());

      
      if(typeof options.positions[0].time == 'string'){
        start =  Cesium.JulianDate.fromDate(new Date(options.positions[0].time));
        var d1 = new Date(options.positions[0].time);
        var d2 = new Date(options.positions[options.positions.length-1].time);
        stop = Cesium.JulianDate.addSeconds(start, options.stopTime ?? (parseInt(d2 - d1) / 1000), new Cesium.JulianDate());
      }

      viewer.timeline.zoomTo(start, stop);
      //Set timeline to simulation bounds
      function computeCirclularFlight(position) {
          var _start;
          var _stop;
          var property = new Cesium.SampledPositionProperty();
          for (var i = 0, len = position.length; i < len; i++) {
              var item = position[i];
              var lng = Number(item.longitude ?? item.x);
              var lat = Number(item.dimension  ?? item.y);
              var hei = item.height ?? item.z;
              var time = item.time;

              var _position = null;
              if (lng && lat) _position = Cesium.Cartesian3.fromDegrees(lng, lat, hei);
          

              var juliaDate = null;
              if (time)
              {
                if(typeof time == 'string'){
                  juliaDate =  Cesium.JulianDate.fromDate(new Date(time));
                }else{
                  juliaDate = Cesium.JulianDate.fromIso8601((time,timer));
                }

              }
                 
              if (_position && juliaDate)
                  property.addSample(juliaDate, _position);

              if (i == 0)
              _start = juliaDate;
              else if (i == len - 1)
              _stop = juliaDate;
          }
          return {property:property,start:_start,stop:_stop}
      }
      function computeFlight(source,start) {
        // 取样位置 相当于一个集合
        let property = new Cesium.SampledPositionProperty();
        for (let i = 0; i < source.length; i++) {
          console.log(i+1)
            let time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate);
            let position = Cesium.Cartesian3.fromDegrees(source[i].longitude, source[i].dimension, source[i].height);
            // 添加位置，和时间对应
            property.addSample(time, position);
        }
        return {property};
      }

      var ccf =  computeCirclularFlight(options.positions);//computeFlight(options.positions,start)//



      //Make sure viewer is at the desired time.
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
      viewer.clock.multiplier = 1.0;

      //Actually create the entity
      var entity = viewer.entities.add({
        //Set the entity availability to the same interval as the simulation time.
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
          start: start,
          stop: stop
        })]),
        //Use our computed positions
        position : ccf.property,//Automatically compute orientation based on position movement.
        orientation : new Cesium.VelocityOrientationProperty(ccf.property),
        //Load the Cesium plane model to represent the entity
        model: {
            uri: options.url,
            scale: options.scale,
        },
        path : {
          resolution : 0.1,
          width: 26,
          material : new Cesium.PolylineGlowMaterialProperty({
              glowPower : 0.1,
              color : Cesium.Color.YELLOW
          }),
          width :3
        },
      });
      return entity;
  }

  /********************************************************************************************************* */
  if ( typeof noGlobal === "undefined" ) {
      window.Taoist = window.G = Taoist;
  }

  return Taoist;
});
Function.prototype.getName = function(){
  return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}