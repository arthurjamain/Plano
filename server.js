var express = require('express');
var https = require('https');
var fs = require('fs');
var cookieParser = require('cookie-parser');



// Express config

var app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static('public'));



// Routes

app.get('/', function (req, res) {
  res.render('index');
  
  console.log(req.cookies);
  
});

app.get('/login', function (req, res) {
  console.log('Login !');
  
  res.cookie('a', 'b', { maxAge: 9000 });
  res.end();
});

app.post('/register', function (req, res) {
  console.log('Register !');
});

// Go

https.createServer({
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.crt')
}, app).listen(443);

console.log('HTTPS Server listening on 443');