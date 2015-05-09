'use strict';

var safeSave = function(models, onDone) {
  async.eachSeries(models, function(model, onModelSave) {
    model.save(function(err) {
      if (err) {
        onModelSave(err);
      } else {
        onModelSave();
      }
    });
  }, function(err) {
    return err ? onDone(err) : onDone();
  });

};

module.exports = safeSave;