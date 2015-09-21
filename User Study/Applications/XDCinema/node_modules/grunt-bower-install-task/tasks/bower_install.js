module.exports = function(grunt){
  grunt.registerTask('bower_install',function(){
    var bower = require('bower');
    var renderer = new (require('bower/lib/renderers/StandardRenderer'))('install',{color:true,cwd:process.cwd()});
    var done = this.async();
    bower.commands.install()
      .on('log',function(log){
        renderer.log(log);
      })
      .on('prompt',function(prompts,callback){
        renderer.prompt(prompts).then(function(answer){
          callback(answer);
        });
      })
      .on('error',function(err){
        renderer.error(err);
        done(false);
      })
      .on('end',function(data){
        renderer.end(data);
        done();
      });
  });
};