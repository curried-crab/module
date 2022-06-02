require(["./test/module01"], function (mod1) {
  console.log("module02 callback run")
  console.log("name:", mod1.name)
})