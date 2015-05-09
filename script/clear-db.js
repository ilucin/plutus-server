'use strict';
console.log('Clearing the database');

var models = rootRequireTree('app/models');

async.each(_.values(models), function(DbModel, onEnd) {
  DbModel.remove(true, function() {
    onEnd();
  });
}, function() {
  process.exit(0);
});