/* eslint comma-dangle: 0, indent: 0 */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config({ path: 'variables.env' });
const bodyParser = require('body-parser');

const passport = require('passport');
const session = require('express-session');
// const localStrategy = require('passport-local').Strategy;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// takes raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());

const User = require('./models/User');

passport.use(User.createStrategy());

const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
      User.findOrCreate({ username: profile.emails[0].value }, (err, user) =>
        done(err, user));
    }
  ));

// const GitHubStrategy = require('passport-github').Strategy;

// passport.use(new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_CALLBACK_URL
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       User.findOrCreate(
//         { username: profile.email || profile.login },
//         (err, user) => {
//           console.log(profile);
//           cb(err, user);
//         }
//       );
//     }
//   ));

const WindowsLiveStrategy = require('passport-windowslive').Strategy;

passport.use(new WindowsLiveStrategy(
    {
      clientID: process.env.WINDOWS_LIVE_CLIENT_ID,
      clientSecret: process.env.WINDOWS_LIVE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/microsoft/callback'
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate(
        { windowsliveId: profile.id, username: profile.emails[0].value },
        (err, user) => cb(err, user)
      );
      console.log('profile object is');
      console.log(profile);
    }
  ));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('error', { title: err.message });
});

module.exports = app;
