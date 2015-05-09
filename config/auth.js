'use strict';

var requireTree = require('require-tree');
var passport = require('passport');
var authStrategy = requireTree('../app/strategies/auth/');

passport.use('local', authStrategy.local);
passport.use('token', authStrategy.token);
