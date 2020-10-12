const itemsModel = require("../schemas/items");

let getParam = (params, property, defaultValue ) => {
    if(params[property]) {
        return params[property];
    }
    return defaultValue;
}

module.exports = {
    getParam
}