var fs = require('fs');
var writeFile = fs.writeFile;
const { capitalize, getType, uncapitalize } = require("./utils");

var FetchClass = `class FetchJSON {
    static fetch(url: string, method: string = 'GET', data: any = {}): Promise<any> {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open(method, url, true);
        // xhr.withCredentials = true;
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.send(postData);
  
        function destroy() {
          xhr.onload = null;
          xhr.onerror = null;
          xhr = null;
        }
  
        xhr.onload = () => {
          if (xhr.status === 401) {
            resolve({
              error: 'no auth',
            })
          } else if (xhr.status === 204) {
            resolve(undefined);
          } else if (xhr.status === 400) {
            try {
              const data: any = xhr?.response !== null && xhr?.response !== undefined ? JSON.parse(xhr.response) : null;
              resolve(data);
            } catch {
              reject(undefined);
            }
          } else {
            try {
              const data: any = xhr?.response !== null && xhr?.response !== undefined ? JSON.parse(xhr.response) : null;
              resolve(data);
            } catch {
              reject(undefined);
            }
          }
          destroy();
        };
  
        xhr.onerror = (error: any) => {
          reject(error);
          destroy();
        };
      });
    }
  }
  `

exports.genPaths = function(paths, savePath) {
    var pathKeys = Object.keys(paths);
    var output = '// This is generated code do not edit.\n\n' + FetchClass;
    output += "\n\n";
  
    var definitionsUsed = [];
    var classes = [];
    var classMethods = [];
  
    pathKeys.forEach(key => {
      var className = key.split('/')[2];
      if (classes.indexOf(className) === -1) {
        classes.push(className);
      }
  
      var responseTypes = Object.keys(paths[key]);
      responseTypes.forEach(responseType => {
        var paramList = [];
        var response;
        if (paths[key][responseType].requestBody) {
          var param = paths[key][responseType].requestBody.content['application/json']
          if (param.schema) {
            var path = param.schema.$ref ? param.schema.$ref : param.schema.items ? param.schema.items.$ref : null;
            if (path) {
              var definitionsRefSplit = path.split('/');
              if (definitionsUsed.indexOf(definitionsRefSplit[definitionsRefSplit.length - 1]) == -1) {
                definitionsUsed.push(definitionsRefSplit[definitionsRefSplit.length - 1]);
              }
              param.type = definitionsRefSplit[definitionsRefSplit.length - 1];
              if (param.schema && param.schema.type === 'array') param.type += '[]';
              param.schema = '';
            }
          }
          param.name = 'requestBody';
          param.in = 'body';
          if (param.type) paramList.push(param);
        }
        var okResponse = paths[key][responseType].responses['200'];
        if (okResponse.content && okResponse.content['application/json'].schema) {
          if (okResponse.content['application/json'].schema.$ref) {
            var split = okResponse.content['application/json'].schema.$ref.split('/');
            response = split[split.length - 1];
            if (definitionsUsed.indexOf(split[split.length - 1]) == -1) {
              definitionsUsed.push(split[split.length - 1]);
            }
          } else if (okResponse.content['application/json'].schema.type) {
            if (okResponse.content['application/json'].schema.type === 'array') {
              if (okResponse.content['application/json'].schema.items.$ref) {
                var split = okResponse.content['application/json'].schema.items.$ref.split('/');
                response = split[split.length - 1] + '[]';
                if (definitionsUsed.indexOf(split[split.length - 1]) == -1) {
                  definitionsUsed.push(split[split.length - 1]);
                }
              } else {
                response = okResponse.content['application/json'].schema.items.type;
              }
            } else {
              response = okResponse.content['application/json'].schema.type;
            }
          } else {
            response = undefined;
          }
        } else {
          response = undefined;
        }
  
        var keySplit = key.split('/');
        var methodName = capitalize(keySplit[keySplit.length - 1]);
  
        var comment = paths[key][responseType].summary;
        if (comment) {
          comment += '\n\n';
          comment += '  ' + paths[key][responseType].description;
        } else if (paths[key][responseType].description) {
          comment = '  ' + paths[key][responseType].description;
        }
  
        classMethods.push({
          className,
          paramList,
          response,
          path: key,
          methodName,
          responseType,
          comment
        });
      });
    });
  
    if (definitionsUsed.length > 0) {
      output += 'import {\n';
      definitionsUsed.forEach(def => {
        output += '  ' + def + ',\n';
      });
      output += "} from './api-definitions';\n";
    }
  
    classes.forEach(className => {
      if (className) {
        var methods = classMethods.filter(x => x.className === className);
        output += '\nclass ' + capitalize(className) + ' {\n';
        methods.forEach(method => {
          if (method.comment && method.comment != '') output += `\n  /**
      ${method.comment}
    */`;
          output += '\n  async ' + method.methodName + '__' + method.responseType.toUpperCase() + '(';
          var isQueryString = !!method.paramList.find(x => x.in === 'query');
          if (isQueryString) {
            method.path = method.path + '?'
          }
          method.paramList.forEach((param, index) => {
            output += param.name + (param.required ? '' : '?') + ': ' + (param.schema === '' ? param.type : getType({ type: param.type })) + (index === (method.paramList.length - 1) ? '' : ', ');
            if (param.in === 'path') {
              method.path = method.path.replace('{' + param.name + '}', '${' + param.name + '}');
            } else if (param.in === 'query') {
              method.path += param.name + '=${' + param.name + '}&';
            }
          });
          if (isQueryString) {
            method.path = method.path.substring(0, method.path.length - 1);
          }
          output += '): Promise<' + (method.response ? method.response : 'undefined') + ' | null> {\n';
          output += '    let data = null;\n';
          output += "    await FetchJSON.fetch(`" + method.path + "`, '" + method.responseType.toUpperCase() + "'";
          var postData = method.paramList.find(x => x.in === 'body');
          if (postData) {
            output += ', ' + postData.name;
          }
          output += ").then(response => data = response)\n";
          output += '    return data;\n';
          output += '  }';
          output += '\n\n';
        });
        output += '}\n';
      }
    });
  
    output += '\nexport class ApiService {\n';
    output += '  constructor(){}\n';
    classes.forEach(className => {
      if (className) {
        output += `\n  private static ${capitalize(className)}Api: ${capitalize(className)} = null;\n`;
        output += `  static get ${uncapitalize(className)}(): ${capitalize(className)} {\n`;
        output += `    if (!this.${capitalize(className)}Api) this.${capitalize(className)}Api = new ${capitalize(className)}();\n`;
        output += `    return this.${capitalize(className)}Api;\n`;
        output += `  }\n`;
      }
    });
    output += '}\n';
  
    writeFile(savePath + '\\api-connectors.ts', output, () => { });
  }