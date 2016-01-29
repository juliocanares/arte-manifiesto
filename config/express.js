/**
 * Load dependencies
 * ====================================================
 */
var express = require('express');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var flash = require('connect-flash');
var swig = require('swig');
var compression = require('compression');
var moment = require('moment');
var minify = require('html-minifier').minify;

module.exports = function (app, passport) {
  /**
   * View engine setup
   * ====================================================
   */
  app.engine('html', function (pathName, locals, cb) {
    function cb_(err, result) {
      var html;
      if (!err) {
        html = minify(result, {
          minifyJS: true,
          minifyCSS: true,
          removeComments: true,
          collapseWhitespace: true
        });
      }
      return cb(err, html);
    }
    return swig.renderFile(pathName, locals, cb_);
  });

  app.set('views', global.cf.views);
  app.set('view engine', 'html');
  app.set('view cache', false);

  swig.setDefaults({cache: false});
  swig.setFilter('addFilter', function (url, filter) {
    return url.replace('upload/', 'upload/' + filter + '/');
  });

  swig.setFilter('formatDate', function (date) {
    return moment(date).fromNow();
  });

  /**
   * Setup express middlewares
   * ====================================================
   */
  app.use(compression());
  app.use(morgan('dev'));
  app.use(cookieParser('luelennuckyinleDfOfkugGEsErLQQDcS'));

  app.use(expressSession({
    secret: "2x4Zvgd93yMbP,4NQEj4[Qzjqqrq,;n#PynZMawWc",
    resave: false,
    saveUninitialized: false,
    name: 'am-session',
    cookie: {domain: '.' + global.cf.app.domain}
  }));

  app.use(flash());

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.static(global.cf.public));

  /**
   * Passport initialize
   * ====================================================
   */
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function (req, res, next) {
    req.viewer = req.user ? req.user.id : -1;
    res.locals = {
      user: req.user,
      env: process.env.NODE_ENV,
      successMessage: req.flash('successMessage'),
      errorMessage: req.flash('errorMessage')
    };

    if (!req.user) return next();

    var verbs = ['like-work', 'follow-user', 'review-work', 'request-work'];
    var query = {
      where: {
        UserId: {$not: [req.user.id]},
        OwnerId: req.user.id,
        verb: {$in: [verbs]},
        seen: false
      }
    };
    global.db.Action.count(query).then(function (total) {
      res.locals.numOfNotifications = total;
      next();
    });
  });

  app.use(global.md.check);
};
