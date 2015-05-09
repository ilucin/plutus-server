'use strict';

var mongoose = require('mongoose');
var createError = require('./error');

function createModel(name, dbCollectionName, schema, methods) {

  var Model = mongoose.model(dbCollectionName, schema);

  _.extend(Model.prototype, _.defaults(methods, {
    populateString: '',
    selectString: '',
    limit: 100,

    initialize: function() {},

    saveAndPopulate: function(res, handler, clb) {
      var _this = this;
      this.save(handler(res, function() {
        Model.findById(_this._id).select(_this.selectString).populate(_this.populateString).exec(handler(res, clb));
      }));
    },

    touch: function(clb) {
      this.updatedAt = Date.now();
      this.save(clb);
    }
  }));

  Model.new = function(data) {
    var modelInstance = new Model(data);
    modelInstance.initialize.apply(modelInstance, arguments);
    return modelInstance;
  };

  Model.findUpdatedAt = function(updatedAt) {
    var q = Model.find();
    if (updatedAt) {
      q.where('updatedAt').gt(updatedAt);
    }
    return q;
  };

  Model.paginateResults = function(req, q, sortBy, clb) {
    var limit = Math.max(parseInt(req.param('limit'), 10) || Model.prototype.limit, 3);
    var page = Math.max(parseInt(req.param('page'), 10) || 1, 1);

    var opts = opts || {};
    if (sortBy) {
      opts.sortBy = sortBy;
    }

    Model.paginate(q, page, limit, function(err, pageCount, paginatedResults, itemCount) {
      if (err) {
        clb(err, []);
      } else {
        var res = {
          totalCount: itemCount,
          results: paginatedResults,
          count: paginatedResults.length,
          page: page,
          pageCount: pageCount,
          limit: limit
        };

        return err ? clb(err, []) : clb(null, res);
      }
    }, opts);
  };

  Model.filterFromTo = function(q, from, to) {
    if (from) {
      q.where('createdAt').gte(from);
    }
    if (to) {
      q.where('createdAt').lte(to);
    }
    return q;
  };

  Model.search = function(req, params, query) {
    var q = req.param('q');
    if (q) {
      var qRegExp = new RegExp(q, 'i');
      query.or(params.map(function(p) {
        var orObj = {};
        orObj[p] = qRegExp;
        return orObj;
      }));
    }
    return query;
  };

  Model.paginateQuery = function(req, q) {
    var limit = parseInt(req.param('limit'), 10) || Model.prototype.limit;
    var page = parseInt(req.param('page'), 10) || 0;
    return q.skip(page * limit).limit(limit);
  };

  Model.Error = createError(name + 'ModelError');

  if (schema.getError) {
    Model.getError = schema.getError;
  }

  return Model;
}

module.exports = createModel;
