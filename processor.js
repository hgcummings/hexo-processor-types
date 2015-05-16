'use strict';

var common = require('./common');
var Promise = require('bluebird');
var yfm = require('hexo-front-matter');
var pathFn = require('path');
var fs = require('hexo-fs');
var util = require('hexo-util');
var slugize = util.slugize;
var Pattern = util.Pattern;
var Permalink = util.Permalink;

var permalink;

var preservedKeys = {
  title: true,
  year: true,
  month: true,
  day: true,
  i_month: true,
  i_day: true
};

function startsWith(str, prefix){
  return str.substring(0, prefix.length) === prefix;
}

exports.process = function(file){
  return processPost.call(this, file);
};

exports.pattern = function(path){
  if (common.isTmpFile(path)) return false;

  if (startsWith(path, '_types')){
    var relativePath = path.substr(path.indexOf('/') + 1);
    
    return {
      path: relativePath,
      customType: relativePath.substr(0, relativePath.indexOf('/'))
    };
  }
  
  return false;
};

function processPost(file){
  /* jshint validthis: true */
  var Model = this.model(file.params.customType, this.model('Post').schema);
  var path = file.params.path;
  var doc = Model.findOne({source: file.path});
  var config = this.config;
  var timezone = config.timezone;

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
    var info = parseFilename(config.new_post_name, path);
    var keys = Object.keys(info);
    var key;

    data.source = file.path;
    data.raw = content;
    data.slug = info.title;
    data.published = true;

    for (var i = 0, len = keys.length; i < len; i++){
      key = keys[i];
      if (!preservedKeys[key]) data[key] = info[key];
    }

    if (data.date){
      data.date = common.toDate(data.date);
    } else if (info && info.year && (info.month || info.i_month) && (info.day || info.i_day)){
      data.date = new Date(
        info.year,
        parseInt(info.month || info.i_month, 10) - 1,
        parseInt(info.day || info.i_day, 10)
      );
    }

    if (data.date){
      if (timezone) data.date = common.timezone(data.date, timezone);
    } else {
      data.date = stats.ctime;
    }

    if (data.link && !data.title){
      data.title = data.link.replace(/^https?:\/\/|\/$/g, '');
    }

    if (data.permalink){
      data.slug = data.permalink;
      delete data.permalink;
    }

    if (doc){
      return doc.replace(data);
    } else {
      return Model.insert(data);
    }
  });
}

function parseFilename(config, path){
  config = config.substring(0, config.length - pathFn.extname(config).length);
  path = path.substring(0, path.length - pathFn.extname(path).length);

  if (!permalink || permalink.rule !== config){
    permalink = new Permalink(config, {
      segments: {
        year: /(\d{4})/,
        month: /(\d{2})/,
        day: /(\d{2})/,
        i_month: /(\d{1,2})/,
        i_day: /(\d{1,2})/
      }
    });
  }

  var data = permalink.parse(path);

  if (data){
    return data;
  } else {
    return {
      title: slugize(path)
    };
  }
}