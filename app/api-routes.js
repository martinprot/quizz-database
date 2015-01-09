// app/api-routes.js ===================================================================

// select the model in database
var Quizz = require('./models/quizz');

function checkSession(req, res, next) {
	if(req.isAuthenticated()) return next();
	else {
		res.status(401).json({error: "Session should be authenticated"});
	}
}

module.exports = function(router, passport) {
	var checkToken = passport.authenticate("token", { session: false });
	
    // server routes ===========================================================
    // Authentication routes
	// API/USER/
	router.route("/user/")
	// create user
	.post(passport.authenticate("local-signup"), function(req, res) {
		res.status(201).json(req.user);
	});
	
	// API/SESSION
	router.route("/session/")
	// create session (ie: login)
	.post(passport.authenticate("local-login"), function(req, res) {
		res.status(200).json(req.user);
	})
	// delete session (ie: disconnect)
	.delete(function(req, res) {
		
	});
	

	// API/QUIZZ/ __________________________________
	router.route("/quizz/")
	// get all quizz
	.get(function(req, res) {
		Quizz.find(function(err, quizzArray) {
			if(err) {
				res.status(400).json({
					error: err
				});
			}
			else {
				res.json(quizzArray);
			}
		});
		
	})
	// add a quizz	
	.post(passport.authenticate("bearer", { session: false }), function(req, res) {
		// check req.body
		if(req.body) {
			var quizz = new Quizz();
			quizz.name = req.body.name;
			
			quizz.save(function(err) {
				if(err) {
					res.status(400).json({ error: err });
				} 
				else {
					res.status(201).json({ result: quizz });
				}
			});
		}
		else {
			res.status(400).json({
				error: "invalid parameters"
			});
		}
	});

    // API/QUIZZ/:ID ______________________________
	router.route('/quizz/:quizz_id')
	// get one quizz
	.get(function(req, res) {
		Quizz.findById(req.params.quizz_id, function(err, quizz) {
			if(err) {
				res.status(400).json({ error: err });
			}
			else if (quizz == null) {
				res.status(404).json({ error: "requested element not found" });
			}
			else {
				res.status(200).json(quizz);
			}
		});
	})
	// edit a given quizz
	.put(checkToken, function(req, res) {
		Quizz.findById(req.params.quizz_id, function(err, quizz) {
			if(err) {
				res.status(400).json({
					error: err
				});
			}
			else if (quizz == null) {
				res.status(404).json({
					error: "requested element not found"
				});
			}
			else {
				if(req.body.name) quizz.name = req.body.name;
				quizz.date = Date.now;
				quizz.save(function(err) {
					if(err) {
						res.status(400).json({error: err});
					} 
					else {
						res.status(200).json(quizz);
					}
				});
			}
		});
	})
	// delete the given quizz
	.delete(checkToken, function(req, res) {
		Quizz.findById(req.params.quizz_id, function(err, quizz) {
			if(err) {
				res.status(400).json({
					error: err
				});
			}
			else if (quizz == null) {
				res.status(404).json({
					error: "requested element not found"
				});
			}
			else {
				quizz.remove(function(err){
					if(err) {
						res.status(400).json({error: err});
					} 
					else {
						res.status(200).json(quizz);
					}
				});
			}
		});
	});
	
};

