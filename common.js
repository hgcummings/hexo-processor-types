'use strict';

var moment = require('moment-timezone');

var DURATION_MINUTE = 1000 * 60;

exports.isTmpFile = function isTmpFile(path){
  var last = path[path.length - 1];
  return last === '%' || last === '~';
};

exports.toDate = function(date){
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)){
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
};

exports.timezone = function(date, timezone){
  if (moment.isMoment(date)) date = date.toDate();

  var offset = date.getTimezoneOffset();
  var ms = date.getTime();
  var target = moment.tz.zone(timezone).offset(ms);
  var diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
};