function getType(property) {
    var returnType;
    if (property.type) {
        switch (property.type) {
            case 'string':
                return 'string';
            case 'integer':
                return 'number';
            case 'number':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'object':
                returnType = 'object';
                if (property.items) {
                    if (property.items.$ref) {
                        var splitRef = property.items.$ref.split('/');
                        returnType += splitRef[splitRef.length - 1] + '[]';
                    }
                }
                return returnType;
            case 'array':
                returnType = '';
                if (property.items) {
                    if (property.items.$ref) {
                        var splitRef = property.items.$ref.split('/');
                        returnType += splitRef[splitRef.length - 1] + '[]';
                    } else {
                        returnType = getType(property.items) + '[]';
                    }
                } else {
                    returnType = '[]';
                }
                return returnType;
            default:
                return 'any';
        }
    } else {
        if (property.$ref) {
            var splitRef = property.$ref.split('/');
            return splitRef[splitRef.length - 1];
        } else {
            return 'any';
        }
    }
}

exports.getType = getType;

exports.uncapitalize = function (s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toLowerCase() + s.slice(1)
}

exports.capitalize = function (s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}