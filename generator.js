'use strict';

var Promise = require('bluebird');

function createGenerator(types) {
  return function(locals){    
    return Promise.map(types, function(customType) {
      var items = locals[customType].toArray();
      return items.map(function(item, i){
        var layout = item.layout;
        var path = item.path;
        item.content = item._content;
            
        if (!layout || layout === 'false'){
          return {
            path: path,
            data: item.content
          };
        } else {
          var layouts = [customType, 'page', 'index'];
          if (layout !== customType) layouts.unshift(layout);
    
          return {
            path: path,
            layout: layouts,
            data: item
          };
        }
      });
    })
    .reduce(function(result, data){
      return data ? result.concat(data) : result;
    }, []);
  };
}

module.exports.create = createGenerator;