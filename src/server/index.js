'use strict';
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var githubStrategy = require('passport-github2').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');
var mongoDBstore = require('connect-mongodb-session')(session);
var path = require('path');
var passport = require('passport');
var user = require('./models/user');
var gitInfo = require('./config')
var api = {
  status: require('./api/status'),
  slots: require('./api/slots'),
  message: require('./api/message'),
  details: require('./api/details'),
  user: require('./models/user')
};

var app = express();
var config = {
  port: process.env.PORT || 3000
};
var store = new mongoDBstore(
  {
    uri: 'mongodb://localhost/haiku',
    collection: 'mySessions'
  }
)
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

if (process.env.NODE_ENV == 'production') {
passport.use(new githubStrategy({
    clientID: gitInfo.info.GITHUB_CLIENT_ID,
    clientSecret: gitInfo.info.GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:"+ config.port +"/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));
}
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: gitInfo.info.COOKIE_SECRET,
  saveUninitialized: true,
  resave: true,
  store: store
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost/haiku');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to Haiku database with Mongoose");
});

if (process.env.NODE_ENV == 'production') {
  app.all('/user/*', function(req, res, next) {
    if(req.isAuthenticated()) {
      next();
    }
    else {
      res.status(403).json({message: 'Authorization Required'});
    }
  });
  app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
  });

  app.get('/login', passport.authenticate('github'));
}

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  var query = { 'details.githubUser': username };

  user.findOne(query, function(err, result) {
    if (result === null) {
      console.log('didnt find you in the database')
      return;
    }
    done(err, username);
  });
});

app.get('/user/:id/status', api.status.getStatus);
app.put('/user/:id/status', api.status.updateStatus);
app.get('/user/:id/message', api.message.getMessage);
app.put('/user/:id/message', api.message.updateMessage);
app.get('/user/:id/slots', api.slots.getSlots);
app.get('/user/:id/details', api.details.getDetails);

app.listen(config.port, function () {
  console.log('Status app listening on port ' + config.port + '!');
});
