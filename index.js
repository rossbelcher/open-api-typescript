var fs = require('fs');
const { genPaths } = require('./connectors');
const { genDefinitions } = require('./definitions');
var readFileSync = fs.readFileSync;

exports.genTypescript = function(originPath, savePath, callback) {
  var openApiData = JSON.parse(readFileSync(originPath, 'utf8'));
  genPaths(openApiData.paths, savePath);
  genDefinitions(openApiData.components.schemas, savePath);
  callback();
}
