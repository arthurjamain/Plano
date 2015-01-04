/*
 * Most of the work is done here. Three middlewares ensure the creation / update / delete of the session.
 */
var User          = require('../models/User');
var Session       = require('../models/Session');
var bcrypt        = require('bcrypt');

var generateToken = function (cb) {
  require('crypto').randomBytes(20, function(ex, buf) {
    var token = buf.toString('hex');
    if (typeof cb === 'function') { cb(token); }
  });
}

var sessionDuration = 1000 * 60 * 60 * 24 * 2 ; // 2 days
//var sessionDuration = 1000 * 5; // 5 sec

var SessionManager = {
  
  // update the session.
  validateSession: function (req, res, next) {
    
    // If there is a token in the cookies (httpOnly), read it
    // and expand it into a user if it's still valid
    if (req.cookies.sid) {
      
      console.log('Session token found ! Checking validity...');

      // Find the matching session object in database
      Session.findOne({ token: req.cookies.sid }, function (err, session) {
        if (err) {
          console.error('Error retrieving session : ', err);
          res.clearCookie('sid');
          return next();
        }
        if (!session) {
          console.log('No session found');
          res.clearCookie('sid');
          return next();
        }

        console.log('Session found !', session);
        var until = new Date(session.validUntil);
        
        // Check if its date is still valid (httponly cookie with proper expiration date
        // should ensure this never happens but eh ...)
        if (until > new Date()) {
          console.log('Session is valid !'); 

          // Find the user associated with the session
          User.findOne({ _id: session.user }, function (err, user) {

            // If there is no matching user, erase the session (to ensure no further damage, this is a broken case)
            if (err || !user) {
              console.log('Could not expand user, clear up session');
              session.remove();
              res.clearCookie('sid');
              return next();
            }

            console.log('User found ! Refreshing the token');

            // Reset the duration of the session
            session.validUntil = Date.now() + sessionDuration;
            res.cookie('sid', session.token, { maxAge: sessionDuration, httpOnly: true });
            req.session = user;

            session.save(function (err) {

              console.log('Everything is ok, carry on');
              next();

            });
          });

        } else {
          console.log('Invalid session, clear it up');
          session.remove();
          res.clearCookie('sid');
          return next();
        }

      });

    } else {
      console.log('No session token, not logged in');
      next();
    }

  },
  
  // Simply clear the cookie and delete the session object from DB
  removeSession: function (req, res, next) {
    req.session = null;
    var token = req.cookies.sid;
    res.clearCookie('sid');
    
    Session.remove({ token: token }, function () {

      next();

    });

  },
  
  // Create a new session object using login / password
  createSession: function (req, res, next) {
    var login = req.param('login');
    var password = req.param('password');

    console.log('Login : ' + login, 'Password : ' + password);

    // Find a user matching the login
    User.findOne({ 'login': login }, '_id login password', function (err, user) {

      if (err) {

        console.error(err);

        return res.status(500).json({
          status: 'error',
          data: 'Error while accessing DB'
        });
      }

      if (!user) {

        console.log('No user found');

        return res.status(400).json({
          status: 'error',
          message: 'Login doesn\'t exist'
        });
      }

      // Compare his password using bcrypt
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({
          status: 'error',
          message: 'Incorrect password'
        });
      }

      console.log('Found user !', user);
      
      // Generate a new, random session token
      generateToken(function (token) {

        console.log('Session token : ' + token);

        // If the token happens (highly improbable) to already exist,
        // Both the existing and requested sessions are destroyed.
        // Sad colateral damage.
        // Also destroys existing sessions on other browsers.
        Session.remove({ user: user._id }, function () {

          var session = new Session({
            user: user._id,
            token: token,
            createdAt: Date.now(),
            validUntil: Date.now() + sessionDuration
          });

          session.save(function (err) {

            if (err) {
              return res.status(500).json({
                status: 'error',
                data: 'Error creating session'
              });
            }

            res.cookie('sid', token, { maxAge: sessionDuration, httpOnly: true });
            req.session = user;
            next();

          });

        });
      });
    }); 
  }
};

module.exports = SessionManager;