'use strict';

var Messages = {
  AUTH_INVALID_USERNAME: 'Incorrect username',
  AUTH_NO_USER: 'User doesn\'t exist',
  AUTH_INVALID_PASSWORD: 'Incorrect password',

  INVALID_INPUT: 'Invalid input data',
  INVALID_ACTION: 'Invalid action',

  USER_SAVE_ERR: 'Internal error (saving user)',
  USER_TOO_WEAK: 'User don\'t have a rights for this action',
  USER_DELETED_SUCCESS: 'User has been removed',
  NO_USER: 'User doesn\'t exist',
  USER_NOT_AUTHENTICATED: 'User is not authenticated'
};

var HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_IMPLEMENTED: 501
};

var sendError = function(res, err, status) {
  console.log('Error: ', err);
  res.status(status || HttpStatus.BAD_REQUEST);
  res.send({
    ok: false,
    message: err instanceof Error ? err.message : err
  });
};

var sendSuccess = function(res, msg, status) {
  res.status(status || HttpStatus.OK);
  res.send({
    ok: true,
    message: msg || 'Success'
  });
};

var send = function(res, data, status) {
  res.status(status || HttpStatus.OK);
  res.send(data);
};

var created = function(res, data) {
  send(res, data, HttpStatus.CREATED);
};

var sendCreateSuccess = function(res, msg) {
  sendSuccess(res, msg || 'Resource has been created', HttpStatus.CREATED);
};

var sendDeleteSuccess = function(res, msg) {
  sendSuccess(res, msg || 'Resource has been deleted', HttpStatus.OK);
};

var sendUnauthorized = function(res, err) {
  sendError(res, err || 'Unauthorized', HttpStatus.UNAUTHORIZED);
};

var sendForbidden = function(res, err) {
  res.status();
  sendError(res, err, HttpStatus.FORBIDDEN);
};

var send404 = function(res, err) {
  sendError(res, err, HttpStatus.NOT_FOUND);
};

var sendNotImplemented = function(res) {
  sendError(res, 'This method is not implemented', HttpStatus.NOT_IMPLEMENTED);
};

var handler = function(res, onSuccess, onError) {
  var _this = this;
  return function(err) {
    if (err) {
      if (onError) {
        onError.call(_this, err);
      } else {
        sendError(res, err);
      }
    } else {
      if (onSuccess) {
        onSuccess.apply(_this, Array.prototype.slice.call(arguments, 1));
      } else {
        sendSuccess(res);
      }
    }
  };
};

var webHandler = function(res, onSuccess, onError) {
  return handler(res, onSuccess || function() {
    throw 'Invalid webHandler';
  }, onError || function(err) {
    throw err;
  });
};

module.exports = {
  HttpStatus: HttpStatus,
  Messages: Messages,
  send: send,
  created: created,
  error: sendError,
  success: sendSuccess,
  createSuccess: sendCreateSuccess,
  deleteSuccess: sendDeleteSuccess,
  unauthorized: sendUnauthorized,
  forbidden: sendForbidden,
  notImplemented: sendNotImplemented,
  send404: send404,
  notFound: send404,
  handler: handler,
  webHandler: webHandler
};
