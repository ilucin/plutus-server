'use strict';

module.exports = {
  clearDbModelData: function(DbModels, clb) {
    async.each(DbModels, function(DbModel, onEnd) {
      DbModel.remove(true, function() {
        onEnd();
      });
    }, function() {
      clb();
    });
  },

  assertModelObject: function(res, err) {
    if (!res.body._id) {
      console.log('Assert on model object failed: ', err, res);
      throw err || 'Assert on model object failed';
    }
  },

  saveModels: function(models, done) {
    async.eachSeries(models, function(model, onSave) {
      model.save(function(err) {
        if (err) {
          onSave(err);
        } else {
          onSave();
        }
      });
    }, function(err) {
      if (err) {
        throw err;
      } else {
        done();
      }
    });
  }
};