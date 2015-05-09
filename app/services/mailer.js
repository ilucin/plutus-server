'use strict';

var openInBrowser = require('open');
var nodemailer = require('nodemailer');
var fs = require('fs');

var config = require('../../config/config');
var Html = require('../utils/html');

var transporter = nodemailer.createTransport();
var baseUrl = 'http://api.plutus.io:3000';

function createMail(to, subject, text, html) {
  return {
    from: 'Plutus <noreply@plutus.io>',
    to: to,
    subject: subject,
    text: text,
    html: html
  };
}

function sendMail(mail) {
  if (config.sendMails) {

    if (config.logMails) {
      var file = global.rootDirname + '/tmp/email_' + Date.now() + '_' + Math.random() + '.txt';
      console.log('Writing email to ' + file);
      fs.writeFile(file, _.values(mail).join(' \n\n'), function(err) {
        if (err) {
          console.log('err writing file', err);
        } else if (!!config.openMails) {
          openInBrowser('file://' + file);
        }
      });
    }

    transporter.sendMail(mail, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info);
      }
    });
  }
}

function getHeaderImg() {
  return Html.el('div', Html.el('div', '', {
    style: 'background-image: url(' + baseUrl + '/img/logo-plutus-header.png); height: 39px; width: 168px; margin: auto'
  }), {
    style: 'height: 40px; margin-top: 10px'
  });
}

function getFooter() {
  return Html.el('div', Html.el('a', 'Privacy Policy', {
    href: config.links.privacyPolicy,
    style: 'color: #888; font-size: 13px'
  }), {
    style: 'margin-top: 30px; padding: 10px 0; text-align: center; border-top: 1px solid #CCC'
  });
}

function sendHtmlMail(to, subject, htmlArray) {
  var html = new Html();

  html.add([getHeaderImg()]);
  html.add(htmlArray);
  html.add([getFooter()]);

  sendMail(createMail(to, subject, null, html.toString()));
}

function resetPasswordLink(user) {
  return Html.el('a', 'here', {
    href: baseUrl + '/reset-password?email=' + user.email + '&token=' + user.resetPasswordToken
  });
}

function confirmEmailLink(user) {
  return Html.el('a', 'here', {
    href: baseUrl + '/email-confirmation?id=' + user._id + '&token=' + user.emailConfirmationToken
  });
}

module.exports = {
  sendResetPasswordLink: function(user) {
    sendHtmlMail(user.email, 'Reset your Plutus account password', [
      ['h2', 'You have requested to reset your Plutus account password'],
      ['p', 'Click ' + resetPasswordLink(user) + ' to reset your password now.']
    ]);
  },

  sendEmailConfirmation: function(user) {
    sendHtmlMail(user.email, 'Welcome to Plutus', [
      ['h2', 'Hello ' + user.name + '.'],
      ['p', 'Before you start working on your accounts, please confirm your email ' + confirmEmailLink(user) + '.'],
      ['p', 'Have fun!']
    ]);
  },

  createMail: createMail
};
