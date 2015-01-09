// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var BearerStrategy  = require('passport-http-bearer').Strategy;

// load up the user model
var User            = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {
	
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
	

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
	// Will never be called if username & password POST vars do not exist
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password as POST parameters, we will override with email & passwd
        usernameField : 'email',
        passwordField : 'passwd',
        passReqToCallback : false
    },
	function(email, password, done) {
		User.findOne({ email: email }, function(err, user) {
			if(err) return done(err);
			// is user found ?
			if(user) {
				return done(null, false); // user already exists. TODO: flash message
			}
			else {
				// Here, we can create user & grant user creation
				user = new User();
				
				user.email 		= email;
				user.password 	= user.generateHash(password);
				user.token		= user.generateToken();
				user.save(function(err) {
					if(err) return done(err);
					
					return done(null, user);
				});
			}
		});
    }));
	
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password as POST parameters, we will override with email & passwd
        usernameField : 'email',
        passwordField : 'passwd',
        passReqToCallback : false
    },
	function(email, password, done) {
		User.findOne({ email: email }, function(err, user) {
			if(err) return done(err);
			
			if(user) {
				if(user.validPassword(password)) {
					user.token		= user.generateToken();
					user.save();
					return done(null, user);
				}
			}
			return done(null, false); // TODO: flash message "wrong username or password"
		});
    }));
	
    // =========================================================================
    // TOKEN AUTHENTICATION ====================================================
    // =========================================================================
	passport.use(new BearerStrategy(
		// BearerStrategy uses "access_token" POST parameter for retieving token.
		// (RFC 6750) http://tools.ietf.org/html/rfc6750
		function(token, done) {
			console.log(token);
			User.findOne({ token: token }, function(err, user) {
				if(err) return done(err);
				if(user) {
					return done(null, user);
				}
				return done(null, false);
			});
		}
	));
};