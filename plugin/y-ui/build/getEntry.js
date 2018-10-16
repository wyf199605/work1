var path = require('path');
var glob = require('glob');

module.exports = function(componentsPath, globPath) {
  var entries = [],
    basename, tmp, pathname;
  if (typeof (globPath) != "object") {
    globPath = [globPath]
  }
  globPath.forEach((itemPath) => {
   
    glob.sync(itemPath).forEach(function (entry) {
      let reg = new RegExp(componentsPath+"/(.*?)/");
      let moduleName = reg.exec(entry);
      if(moduleName && !~entries.indexOf(moduleName[1])) {
          entries.push(moduleName[1]);
      }
    });
  });
  return entries;
}