var processor = require('./processor');
var fs = require('hexo-fs');

fs.readdir(hexo.base_dir + '/source/_types').then(function(files) {
  files.forEach(function(item) {
    hexo.locals.set(item, function(){
      return hexo.database.model(item);
    });
  });
});

hexo.extend.processor.register(processor.pattern, processor.process);