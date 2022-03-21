var fs = require('fs');
const { getType } = require('./utils');
var writeFile = fs.writeFile;

exports.genDefinitions = function(definitions, savePath) {
    var definintionKeys = Object.keys(definitions);
    var output = '// This is generated code do not edit.\n\n';
  
    definintionKeys.forEach(key => {
      if (definitions[key].properties) {
        output += 'export interface ' + key + ' {\n';
        var propertyKeys = Object.keys(definitions[key].properties)
        propertyKeys.forEach(property => {
          output += '  ' + property + `${definitions[key].required && definitions[key].required.find(x => x == property) ? '' : '?'}: ` + getType(definitions[key].properties[property]) + ';\n';
        });
      } else if (definitions[key].enum) {
        output += 'export enum ' + key + ' {\n';
        var propertyKeys = Object.keys(definitions[key].enum)
        propertyKeys.forEach(property => {
          output += `'e${property}' = ${property},\n`;
        });
      }
      output += '}\n\n';
    });
  
    writeFile(savePath + '\\api-definitions.d.ts', output, () => { });
  }