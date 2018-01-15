
var vectorOperation = require("./vectorOperation.js");
var windowOperation = require("./windowOperation.js");
var statistics = require("./statistics.js");
var indicators = require("./indicators.js");

module.exports = {

/**
 * @description This is an internal function and is not supposed to be used directly. This function moves the window of size value along the values, applying the defined function on each chunk.
 * @param {object} objects list
 * @param {attrs} list of attributes to look for
 * @return {value} object attribute
 */
resolveParam: function (obj, attrs) {
    for (var i = 0; i < attrs.length; i++) {
      var field = attrs[i]
      if (obj[field] != undefined)
        return obj[field]
    }
    throw new Error( "No valid (" + attrs + ") found in obj");
  },
  
  
  isUndef: function (obj) {
    return typeof obj == "undefined";
  },
  
  reverseAppend: function (refList, addList, field) {
    if (this.isUndef(field))
      throw new Error ("Unable to append values, no field given")
    addList.forEach (function (add, i) {
      refList[refList.length-addList.length+i][field] = add[field] ? add[field] : add;
    })
    return refList;
  },
  
  flat: function (list, attr) {
    return list.map (function (i) {
      return isUndef(i[attr]) ? 0 : i[attr];
    });
  },
  
  fill: function (list, attr, defaultValue) {
    list.forEach(function(l) {
      if (isUndef(l[attr]))
        l[attr] = defaultValue;
    });
  }

}