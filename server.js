// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser'); // parses the HTTP arguments (except multipart)
var methodOverride = require('method-override'); // override HTTP verbs to add PUT & DELETE

// configuration ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

// connect
//mongoose.connect(db.url);

// parameter parsing =======================================

// parse application/json
app.use(bodyParser.json())
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes
// ./app/routes returns a function, so require('./app/routes')(app) calls the function with app in parameter

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('App started on port ' + port);

// expose app           
exports = module.exports = app;             