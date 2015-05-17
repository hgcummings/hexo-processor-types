'use strict';

exports.isTmpFile = function isTmpFile(path){
  var last = path[path.length - 1];
  return last === '%' || last === '~';
};