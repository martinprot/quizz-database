// server.js

// modules =================================================
var express			= require('express');
var app				= express();
var bodyParser		= require('body-parser'); // parses the HTTP arguments (except multipart)
var methodOverride	= require('method-override'); // override HTTP verbs to add PUT & DELETE
var mongoose		= require('mongoose');
var passport 		= require('passport');

var morgan 			= require('morgan');

// configuration ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

// connect
mongoose.connect(db.url);

// Middlewares =============================================

// Configure passport signup & singin
require('./config/passport')(passport); // pass passport for configuration

// log every request to the console
app.use(morgan("dev"));
// parse application/json
app.use(bodyParser.json())
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// initialize passport
app.use(passport.initialize());


// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
var router = express.Router();

// HERE, MAKE SOME CHECKS, FOR AUTHENTIFICATION FOR EXAMPLE. OR ACTIVATE LOGGING
router.use(function(req, res, next) {
    next();
});

require('./app/api-routes')(router, passport); // configure our routes

app.use("/api", router);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('App started on port ' + port);

// expose app           
exports = module.exports = app;             