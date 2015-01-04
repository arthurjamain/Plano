var express       = require('express');
var https         = require('https');
var fs            = require('fs');
var mongoose      = require('mongoose');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var bcrypt        = require('bcrypt');

// Our user and session mongoose models
var User          = require('./models/User');

// Homemade static object with middlewares to handle the sessions
var SessionManager = require('./src/SessionManager');


// —————
// Utils
// —————

var checkMail = function (mail) { 
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(mail);
} 

// ——————
// Config
// ——————

var app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

// Validates & refreshes a current session
app.use(SessionManager.validateSession);


mongoose.connect('mongodb://localhost/plano');


// ——————
// Routes
// ——————

// Serves the only page of the app with or without authenticated content
app.get('/', function (req, res) {
  res.render('index', {
    loggedIn: !!req.session,
    user: req.session
  });
});

// Destroys the session
app.get('/logout', SessionManager.removeSession, function (req, res) {
  
  // Do some other stuff after logout
  res.end();
  
});

// Creates a session & returns it
app.get('/login', SessionManager.createSession, function (req, res) {
  
  // Do stuff after login
  res.status(200).json({
    status: 'success',
    data: req.session
  });

});

// Creates a user
app.post('/register', function (req, res) {
  
  console.log('Register !');
  
  var login = req.param('login');
  var password = req.param('password');

  
  if (!login || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing login or password'
    });
  }
  
  if (!checkMail(login)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid e-mail'
    });
  }
  
  // Hash the password using bcrypt for a bit of security. Store the hash only.
  var salt = bcrypt.genSaltSync(10);
  var hashed = bcrypt.hashSync(password, salt);
  
  var user = new User({
    login: login,
    password: hashed
  });
  
  user.save(function (err) {
    
    if (err) {
      
      console.error('Error saving new user : ', err);
      return res.status(500).json({
        status: 'error',
        message: 'User already exists',
        data: err
      });
      
    }
    
    console.log('New user saved !');
    return res.json({
      status: 'success',
      data: user
    });
    
  });
  
});

// Create the server & listen, HTTPS for security
https.createServer({
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.crt')
}, app).listen(443);

console.log('HTTPS Server listening on 443');