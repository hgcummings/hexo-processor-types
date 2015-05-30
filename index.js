var processor = require('./processor');
var generator = require('./generator');
var fs = require('hexo-fs');

var types = [];
fs.readdir(hexo.base_dir + '/source/_types').then(function(files) {
  files.forEach(function(item) {
    hexo.locals.set(item, function(){
      return hexo.database.model(item);
    });
  });
  return files;
}).then(function(types) {
  hexo.extend.generator.register(generator.create(types));
});

hexo.extend.processor.register(processor.pattern, processor.process);