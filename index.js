var processor = require('./processor');
var fs = require('hexo-fs');

fs.readdir(hexo.base_dir + '/source/_types').then(function(files) {
  files.forEach(function(item) {
    hexo.locals.set(item, function(){
      var query = {};
    
      if (!hexo.config.future){
        query.date = {$lte: Date.now()};
      }
    
      return hexo.database.model(item).find(query);
    });
  });
});

hexo.extend.processor.register(processor.pattern, processor.process);