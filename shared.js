Object.getPrototypeOf(Object.getPrototypeOf((function*(){})())).map = function *(callback, thisArg = null) {
    var index = 0;
    for (const currentValue of this) {
        yield callback.apply(thisArg, [currentValue, index++, this]);
    }
}

function getParameters(queryString) {
    const parameters = {};
    const parameterPattern = /(\w+)=(\w+)/g;
    while ((match = parameterPattern.exec(queryString)) !== null) {
        parameters[match[1]] = match[2];
    }
    return parameters;
}