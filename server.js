// server.js

// modules =================================================
var express			= require('express');
var app				= express();
var bodyParser		= require('body-parser'); // parses the HTTP arguments (except multipart)
var methodOverride	= require('method-override'); // override HTTP verbs to add PUT & DELETE
var multer			= require('multer'); // multipart form data (ie file upload)
var mongoose		= require('mongoose');
var passport 		= require('passport');
//var flash		    = require('connect-flash'); // require sessions

var morgan 			= require('morgan');

// =============================================================
// configuration ===============================================
// =============================================================
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

// connect DB
mongoose.connect(db.url);

// =============================================================
// Middlewares =================================================
// =============================================================

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
// Setup file upload for csv upload
app.use(multer());

// initialize passport
app.use(passport.initialize());
//app.use(flash()); // use connect-flash for flash messages stored in session

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// =============================================================
// API Routes ==================================================
// =============================================================
var apiRouter = express.Router();

apiRouter.use(function(req, res, next) {
	console.log("API router used");
    next();
});
require('./app/api-routes')(apiRouter, passport); // configure our API routes
app.use("/api", apiRouter);

// =============================================================
// Common Routes ===============================================
// =============================================================
var commonRouter = express.Router();
commonRouter.use(function(req, res, next) {
	console.log("Common router used");
    next();
});
require('./app/common-routes')(commonRouter, passport); // configure our common routes
app.use("/", commonRouter);

// =============================================================
// start the app ===============================================
// =============================================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('App started on port ' + port);

// expose app           
exports = module.exports = app;             