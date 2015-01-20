// app/models/user.js

// get modules
var mongoose = require('mongoose');	// database
var bcrypt   = require('bcrypt-nodejs'); // encrypt password
var jwt = require('jwt-simple'); // token manager
var jwtSecret = "thisIsTheSecretOfTheToken";

var Schema   = mongoose.Schema;

// Schema definition
var userSchema = new Schema({
	email		: String,
	password	: String,
	creationDate: 	{ 
		type 	: Date,
		default : Date.now
	},
	isAdmin		:   {
		type	: Boolean,
		default : false
	},
	token		: String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Generating a token according to username and time.
userSchema.methods.generateToken = function(password) {
	var tokenString = this.email + Date.now().toString();
    return jwt.encode(tokenString, jwtSecret);
};


// Model export
module.exports = mongoose.model('User', userSchema);