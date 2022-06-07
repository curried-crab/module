// requirejs 实现原理
(function () {
  //将所有的依赖放在这里
  const moduleCache = {}
  const params = []

  function require(deps, callback) {
    console.log("deps", deps)
    let depCount = 0
    let isEmpty = false

    const modName = document.currentScript && document.currentScript.id || "REQUIRE_MAIN"
    console.log("modName", modName)

    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        depCount++;
        loadMod(deps[i], function (param) {
          params[i] = param;
          depCount--
          console.log("load depCount:", depCount)
          if (depCount === 0) {
            saveModule(modName, params, callback)
          }
        })
      }
    } else {
      isEmpty = true;
    }

    if (isEmpty) {
      setTimeout(() => {
        saveModule(modName, null, callback);
      }, 0)
    }
  }

  // 获取path url
  function getPathUrl(modName) {
    let url = modName
    if (url.indexOf(".js") === -1) {
      url = url + ".js"
    }
    return url
  }

  // 加载模块
  function loadMod(modName, callback) {
    const url = getPathUrl(modName)
    let fs, mod;

    // 查看是否有缓存
    if (moduleCache[modName]) {
      mod = moduleCache[modName]
      if (mod.status === "loaded") {
        setTimeout(callback(params), 0)
      } else {
        mod.onload.push(callback)
      }
    } else {
      // 插入script加载脚本
      mod = moduleCache[modName] = {
        modName,
        status: "loading",
        export: null,
        onload: [callback]
      }

      const script = document.createElement("script")
      script.id = modName
      script.type = 'text/javascript';
      script.charset = "utf-8"
      script.async = true
      script.src = url

      fs = document.getElementsByTagName("script")[0]
      fs.parentNode.insertBefore(script, fs)
    }
  }

  function saveModule(modName, params, callback) {
    let mod, fn;
    if (moduleCache[modName]) {
      mod = moduleCache[modName]
      mod.status = "loaded"

      mod.export = callback ? callback(params) : null;

      console.log("mod：", mod, "params:", params)

      while (fn = mod.onload.shift()) {
        fn(mod.export)
      }
    } else {
      console.log("run save:", callback)
      callback && callback.apply(window, params)
    }
  }

  window.require = require;
  window.define = require;

})(); 