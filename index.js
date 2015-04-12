// Requires
var express = require('express'),
    session = require('express-session'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    cookieParser = require('cookie-parser'),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
    Twitter = require('twitter'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    db = require('./models');

// Variables
var app = express();
var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

// Set
app.set('view engine','ejs');

// Use
app.use(express.static('public'));
// app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
  secret: 'im neither hero nor traiter im american - if they wont give us privacy then we must take it',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // Create or update user
    db.user.upsert({
      twitter_user_id:profile._json.id_str,
      screen_name:profile._json.screen_name,
      name:profile._json.name
    }).then(function(created) {
      var user = profile;
      user.token = token;
      user.tokenSecret = tokenSecret;
      return done(null, user);
    })
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// load routes
app.use('/', require('./controllers/main.js'));
app.use('/auth', require('./controllers/auth.js'));
app.use('/list', require('./controllers/list.js'));
app.use('/user', require('./controllers/user.js'));

var server = app.listen(3000)
console.log('Express server started on port %s', server.address().port);
