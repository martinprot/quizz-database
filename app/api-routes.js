// app/api-routes.js ===================================================================

// select the model in database
var Quizz		= require('./models/quizz');
var Question	= require('./models/question');
var User		= require('./models/user');


// =============================================
// AUTHENTICATION ==============================
// =============================================

function checkSession(req, res, next) {
	if(req.isAuthenticated()) return next();
	else {
		res.status(401).json({error: "Session should be authenticated"});
	}
}

// =============================================
// QUESTION OPERATIONS =========================
// =============================================

function getQuestion(questionId, callback) {
	Question.findById(questionId, function(err, question) {
		if(err) callback(500, {error: err});
		else if (question == null) {
			callback(404, {error: "Question not found"});
		}
		else {
			callback(200, question);
		}
	});
}

function putQuestion(questionId, body, callback) {
	Question.findById(questionId, function(err, question) { 
		if(err) callback(500, {error: err});
		else {
			if(question) {
				if(body.text)		question.text	 = body.text;
				if(body.detail)		question.detail	 = body.detail;
				if(body.choices)	question.choices = body.choices.split(";");
				if(body.answer)		question.answer	 = body.answer;
				if(body.quizzes)	question.quizzes = body.quizzes.split(";");
				
				question.save(function(err) {
					if(err) callback(500, {error: err});
					else {
						callback(200, question);
					}
				});
			}
			else {
				callback(404, {error: "Question not found"});
			}
		 }
	});
}

function deleteQuestion(questionId, callback) {
	console.log("1");
	Question.findById(questionId, function(err, question) {
	console.log("2");
		if(err) callback(500, {error: err});
		else if (question == null) {
			callback(404, {error: "Question not found"});
		}
		else {
	console.log(question);
			question.remove(function(err){
	console.log("4");
				if(err) callback(500, {error: err});
				else {
					callback(200, {result: "removed"});
				}
			});
		}
	});
}

// =============================================
// API ROUTES ==================================
// =============================================

module.exports = function(router, passport) {
	var checkToken = passport.authenticate("token", { session: false });
	
    // server routes ===========================================================
    // Authentication routes
	// API/USER/
	router.route("/user")
	// list users
	.get(function(req, res) {
		User.find(function(err, users) {
			if(err) res.status(400).json({error: err});
			else {
				res.status(200).json(users);
			}
		});
	})
	// create user
	.post(passport.authenticate("local-signup"), function(req, res) {
		res.status(201).json(req.user);
	});
	
	// API/SESSION
	router.route("/session")
	// create session (ie: login)
	.post(passport.authenticate("local-login"), function(req, res) {
		res.status(200).json(req.user);
	})
	// delete session (ie: disconnect)
	.delete(function(req, res) {
		
	});
	
	// =============================================
	// API/QUIZZ/ ==================================
	// =============================================
	router.route("/quizz")
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
	.post(checkToken, function(req, res) {
		// check req.body
		if(req.body && req.body.name && req.body.language) {
			var quizz = new Quizz();
			quizz.name 		= req.body.name;
			quizz.language 	= req.body.language;
			
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

	// =============================================
	// API/QUIZZ/:ID ===============================
	// =============================================
	router.route('/quizz/:quizz_id')
	// get one quizz
	.get(function(req, res) {
		Quizz.findById(req.params.quizz_id)
			 .populate("questions")
			 .exec(function(err, quizz) {
			if(err) res.status(500).json({ error: err });
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
		if(req.body && (req.body.name || req.body.language || req.body.questions)) {		
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
					if(req.body.name) 		quizz.name = req.body.name;
					if(req.body.language) 	quizz.name = req.body.language;
					if(req.body.questions) 	quizz.questions = req.body.questions.split(";");
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
		}
		else {
			res.status(400).json({ error: "invalid parameters" });
		}		
	})
	// delete the given quizz
	.delete(checkToken, function(req, res) {
		Quizz.findById(req.params.quizz_id, function(err, quizz) {
			if(err) {
				res.status(500).json({
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
						res.status(500).json({error: err});
					} 
					else {
						res.status(200).json(quizz);
					}
				});
			}
		});
	});
	
	// =============================================
	// API/QUIZZ/:ID/QUESTION ======================
	// =============================================
	router.route('/quizz/:quizz_id/question')
	// get list of questions
	.get(function(req, res) {
		Quizz.findById(req.params.quizz_id)
			 .populate("questions")
			 .exec(function(err, quizz) {
			 if(err) res.status(500).json({ error: err.toString() });
			 else {
				if(quizz) {
					res.status(200).json(quizz.questions);
				}
				else {
					res.status(404).json({ error: "quizz not found" });
				}
			 }
		});
	})
	// creates a new question
	.post(checkToken, function(req, res) {
		if(req.body && req.body.text && req.body.detail && req.body.choices && req.body.answer) {
			Quizz.findById(req.params.quizz_id)
			 	 .populate("questions")
			 	 .exec(function(err, quizz) {
				 if(err) res.status(500).json({ error: err.toString() });
				 else {
					if(quizz) {
						var question = new Question();
						question.text	 = req.body.text;
						question.detail	 = req.body.detail;
						question.choices = req.body.choices.split(";");
						question.answer	 = req.body.answer;
						question.quizzes.push(req.params.quizz_id);
						
						question.save(function(err) {
							if(err) res.status(500).json({ error: err.toString() });
							else {
								quizz.questions.push(question._id);
								quizz.save(function(err) {
									if(err) res.status(500).json({ error: err.toString() });
									else {
										res.status(201).json(question);
									}
								});
							}
						});
					}
					else {
						res.status(404).json({ error: "quizz not found" });
					}
				 }
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters" });
		}
	});
	
	// =============================================
	// API/QUIZZ/:ID/QUESTION/:ID ==================
	// =============================================
	router.route('/quizz/:quizz_id/question/:question_id')
	// get a question
	.get(function(req, res) {
		getQuestion(req.params.question_id, function(code, result) {
			res.status(code).json(result);
		});
	})
	// edit a question
	.put(checkToken, function(req, res) {
		if(req.body) {
			putQuestion(req.params.question_id, req.body, function(code, result) {
				res.status(code).json(result);
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters" });
		}
	})
	// delete a question
	.delete(checkToken, function(req, res) {
		deleteQuestion(req.params.question_id, function(code, result) {
			res.status(code).json(result);
		});
	});
	
	// =============================================
	// API/QUESTION/ ===============================
	// =============================================
	// Questions without quizz association
	router.route("/question")
	// get all questions
	.get(function(req, res) {
		Question.find(function(err, questions) {
			if(err) {
				res.status(400).json({
					error: err
				});
			}
			else {
				res.json(questions);
			}
		});	
	})

	// =============================================
	// API/QUIZZ/:ID/QUESTION/:ID ==================
	// =============================================
	router.route('/question/:question_id')
	// get a question
	.get(function(req, res) {
		getQuestion(req.params.question_id, function(code, result) {
			res.status(code).json(result);
		});
	})
	// edit a question
	.put(checkToken, function(req, res) {
		if(req.body) {
			putQuestion(req.params.question_id, req.body, function(code, result) {
				res.status(code).json(result);
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters" });
		}
	})
	// delete a question
	.delete(checkToken, function(req, res) {
		deleteQuestion(req.params.question_id, function(code, result) {
			res.status(code).json(result);
		});
	});
	
	
	// To block all other requests
	router.route('*').all(function(req, res) {
		res.status(404).send("API not found");
	});
	
};
