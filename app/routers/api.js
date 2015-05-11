'use strict';

var setupRoutes = require('./setup');
var adminController = require('../controllers/api/admin');
var userController = require('../controllers/api/user');
var accountsController = require('../controllers/api/accounts');
var statusController = require('../controllers/api/status');

module.exports = {
  route: '/api',
  router: setupRoutes({
    'get /status': [statusController, 'status'],

    '/users/:userId': {
      'get': [userController, 'details'],
      'put': [userController, 'update'],
      'delete': [userController, 'remove']
    },
    'post /users/:userId/categories': [userController, 'updateCategories'],
    'post /users/:userId/email-confirmation': [userController, 'emailConfirmation'],
    'post /users/resend-email-confirmation': [userController, 'resendEmailConfirmation'],
    'get /users/:userId/accounts': [userController, 'accounts'],
    'post /users/reset-password': [userController, 'resetPassword'],
    'post /login': [userController, 'login'],
    'post /register': [userController, 'register'],

    'post /users/:userId/accounts': [accountsController, 'create'],
    '/users/:userId/accounts/:accountId': {
      'get': [accountsController, 'details'],
      'put': [accountsController, 'update'],
      'delete': [accountsController, 'remove']
    },
    'post /users/:userId/accounts/:accountId/correction': [accountsController, 'addCorrection'],
    '/users/:userId/accounts/:accountId/transactions': {
      'get': [accountsController, 'transactions'],
      'post': [accountsController, 'createTransaction']
    },
    '/users/:userId/accounts/:accountId/transaction/:transactionId': {
      'get': [accountsController, 'getTransaction'],
      'delete': [accountsController, 'removeTransaction']
    },

    // Admin

    // 'get /admin/set-deleted-false/:model': [adminController, 'setDeletedFalse'],
    'get /admin/users': [adminController, 'allUsers'],
    '/admin/users/:userId': {
      'get': [adminController, 'user'],
      'delete': [adminController, 'deleteUser']
    },
    'get /admin/accounts': [adminController, 'allAccounts'],
    '/admin/accounts/:accountId': {
      'get': [adminController, 'account'],
      'delete': [adminController, 'deleteAccount']
    },
    'get /admin/accounts/:accountId/details': [adminController, 'accountDetails'],
    'get /admin/transactions': [adminController, 'allTransactions'],
    '/admin/transactions/:transactionId': {
      'get': [adminController, 'transaction'],
      'delete': [adminController, 'deleteTransaction']
    },
    'get /admin/transactions/:transactionId/details': [adminController, 'transactionDetails'],
  })
};
