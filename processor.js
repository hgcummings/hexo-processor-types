'use strict';

var common = require('./common');
var Promise = require('bluebird');
var yfm = require('hexo-front-matter');
var slugize = require('hexo-util').slugize;
var Schema = require('warehouse').Schema;

var permalink;

exports.pattern = function(path){
  if (common.isTmpFile(path)) return false;

  if (path.indexOf('_types/') === 0){
    var relativePath = path.substr(path.indexOf('/') + 1);
    
    return {
      customType: relativePath.substr(0, relativePath.indexOf('/'))
    };
  }
  
  return false;
};

exports.process = function(file){
  var Model = this.model(file.params.customType, new Schema());
  var doc = Model.findOne({source: file.path});

  if (file.type === 'skip' && doc){
    return;
  }

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  return Promise.all([
    file.stat(),
    file.read()
  ]).spread(function(stats, content){
    var data = yfm(content);
    data.source = file.path;
    data.raw = content;

    if (data.permalink){
      data.slug = data.permalink;
      delete data.permalink;
    } else {
      data.slug = createSlug(file.path);
    }

    if (doc){
      return doc.replace(data);
    } else {
      return Model.insert(data);
    }
  });
}

function createSlug(path) {
  var parts = path.split('/');
  var filename = parts[parts.length - 1];
  var namePart = filename.substring(0, filename.lastIndexOf('.'));
  return slugize(namePart);
}