// app/api-routes.js ===================================================================

var fs 			= require('fs');
var csvParser	= require('csv-parser')

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

function postQuestion(body, quizzId, callback) {
	var question = new Question();
	if(body.text)		question.text	 = body.text;
	if(body.topic)		question.topic	 = body.topic;
	if(body.choices) {
		if(Array.isArray(body.choices))
			question.choices = body.choices;
		else
			question.choices = body.choices.split(";");
	}
	if(body.answer)		question.answer	 = body.answer;
	if(quizzId)  		question.quizz 	 = quizzId;
	
	question.save(function(err) {
		if(err) callback(500, {error: err});
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
				if(body.topic)		question.topic	 = body.topic;
				if(body.choices) {
					if(Array.isArray(body.choices))
						question.choices = body.choices;
					else
						question.choices = body.choices.split(";");
				}
				if(body.answer)		question.answer	 = body.answer;
				if(body.quizz)  	question.quizz 	 = body.quizz;
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
	Question.findById(questionId, function(err, question) {
		if(err) callback(500, {error: err});
		else if (question == null) {
			callback(404, {error: "Question not found"});
		}
		else {
			question.remove(function(err){
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
	var checkToken  = passport.authenticate("token", { session: false });
	var createUser  = passport.authenticate("local-signup");
	var connectUser = passport.authenticate("local-login");
	
    // server routes ===========================================================
    // Authentication routes
	// API/USER/
	router.route("/user")
	// list users
	.get(function(req, res) {
		User.find(function(err, users) {
			if(err) res.status(500).json({error: err});
			else {
				res.status(200).json(users);
			}
		});
	})
	// create user
	.post(createUser, function(req, res) {
		res.status(201).json(req.user);
	});
	
	// API/USER/:USER_ID
	router.route("/user/:user_id")
	// list users
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if(err) res.status(500).json({error: err});
			else {
				res.status(200).json(user);
			}
		});
	})
	// edit user
	.put(checkToken, function(req, res) {
		// if iam admin or editing myself
		if(req.user.isAdmin || req.user._id == req.params.user_id) {
			User.findById(req.params.user_id, function(err, user) {
				if(req.body) {
					if(err) res.status(500).json({ error: err });
					else if (user == null) res.status(404).json({ error: "requested element not found" });
					else {
						if(req.body.email) 		user.email = req.body.email;
						if(req.body.password) 	user.password = user.generateHash(req.body.password);
						if(req.user.isAdmin) { // Only admin access
							if(req.body.isAdmin) 	user.isAdmin = req.body.isAdmin;
						}
						user.save(function(err) {
							if(err) res.status(500).json({error: err});
							else 	res.status(200).json(user);
						});
					}
				}
				else res.status(400).json({ error: "Wrong parameters", body: req.body});
			});
		}
		else res.status(401).json({ error: "Access forbidden" });
	})
	.delete(checkToken, function(req, res) {
		// if iam admin or editing myself
		if(req.user.isAdmin || req.user._id == req.params.user_id) {
			User.findByIdAndRemove(req.params.user_id, function(err, user) {
					if(err) res.status(500).json({ error: err });
					else 	res.status(200).json({ result: "removed" });
			});
		}
		else res.status(401).json({ error: "Access forbidden" });
	});
	
	
	// API/SESSION
	router.route("/session")
	// retrieve the session, only if token is in headers
	.get(checkToken, function(req, res) {
		res.status(200).json(req.user)
	})
	// create session (ie: login)
	.post(connectUser, function(req, res) {
		res.status(200).json(req.user);
	})
	// delete session (ie: disconnect)
	.delete(checkToken, function(req, res) {
		req.user.token = "";
		req.user.save(function(err) {
			if(err) res.status(500).json({error: err});
			else 	res.status(200).json({result: "disconnected"});
		});
	});
	
	// =============================================
	// API/QUIZZ/ ==================================
	// =============================================
	router.route("/quizz")
	// get all quizz
	.get(function(req, res) {
		Quizz.find(function(err, quizzArray) {
			if(err) {
				res.status(500).json({ error: err });
			}
			else {
				res.json(quizzArray);
			}
		});
		
	})
	// add a quizz	
	.post(checkToken, function(req, res) {
		// check req.body
		if(req.body && req.body.name && req.body.locale) {
			var quizz = new Quizz();
			quizz.name 		= req.body.name;
			quizz.locale 	= req.body.locale;
			
			quizz.save(function(err) {
				if(err) {
					res.status(500).json({ error: err });
				}
				else {
					res.status(201).json({ result: quizz });
				}
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters", body: req.body });
		}
	});
	
	// =============================================
	// API/QUIZZ/:ID ===============================
	// =============================================
	router.route('/quizz/:quizz_id')
	// get one quizz
	.get(function(req, res) {
		Quizz.findById(req.params.quizz_id)
			 .populate("questions")  // TODO: populate according to update parameter
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
		if(req.body && (req.body.name || req.body.locale || req.body.questions)) {		
			Quizz.findById(req.params.quizz_id, function(err, quizz) {
				if(err) {
					res.status(500).json({ error: err });
				}
				else if (quizz == null) {
					res.status(404).json({
						error: "requested element not found"
					});
				}
				else {
					if(req.body.name) 		quizz.name = req.body.name;
					if(req.body.locale) 	quizz.locale = req.body.locale;
					if(req.body.questions) 	quizz.questions = req.body.questions.split(";");
					quizz.save(function(err) {
						if(err) {
							res.status(500).json({error: err});
						} 
						else {
							res.status(200).json(quizz);
						}
					});
				}
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters", body: req.body });
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
	router.route('/quizz/:quizz_id/csv')
	.post(checkToken, function(req, res) {
		if(req.files != null && req.files.csv.mimetype == "text/csv") {
			file = req.files.csv;
			// csv parser init
			var stream = csvParser({
				headers: ["id", "lang", "topic", "tag", "question", "correctAnswer", "answer2", "answer3", "answer4", "size", "author", "relector", "difficulty", "keep"],
				separator: ';',
				newline: '\n'
			});
			
			var notSavedQuestions = [];
			// get the csv file stream them parse it
			fs.createReadStream(file.path)
				.pipe(stream)
				.on('data', function(rawQuestion) {
					// each csv line, this is executed.
					if(rawQuestion.keep == "OUI" && rawQuestion.id.length > 0) {
						// First, find the question if exists
						Question.findOne({ 'customId': rawQuestion.id }, function (err, question) {
							if(question == null) question = new Question();
							// then overwrite its properties
							question.customId= rawQuestion.id;
							question.text	 = rawQuestion.question;
							question.topic	 = rawQuestion.topic;
							question.choices = [rawQuestion.correctAnswer, rawQuestion.answer2, rawQuestion.answer3, rawQuestion.answer4];
							question.answer	 = 0;
							question.quizz 	 = req.params.quizz_id;
							question.save();
						});
					}
					else {
						notSavedQuestions.push(rawQuestion);
					}
			})
				.on('end', function () {
					res.status(200).json({notSaved: notSavedQuestions});
				});
		}
		else {
			res.status(400).json( { error: "wrong parameters"});
		}
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
		if(req.body && req.body.text && req.body.choices && req.body.answer) {
			postQuestion(req.body, req.params.quizz_id, function(code, result) {
				res.status(code).json(result);
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters", body: req.body });
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
			res.status(400).json({ error: "invalid parameters"});
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
				res.status(500).json({ error: err });
			}
			else {
				res.json(questions);
			}
		});	
	})
	.post(checkToken, function(req, res) {
		if(req.body) {
			postQuestion(req.body, null, function(code, result) {
				res.status(code).json(result);
			});
		}
		else {
			res.status(400).json({ error: "invalid parameters", body: req.body });
		}
	})
	// Deletes more than one questions
	.delete(checkToken, function(req, res) {
		if(req.body.toRemove) {
			req.body.toRemove.forEach(function(id) {
				deleteQuestion(id, function() {
					
				});
			});
			res.status(200).json({});
		}
		else {
			res.status(400).json({ error: "invalid parameters", body: req.body });
		}
	});

	// =============================================
	// API/QUESTION/:ID ==================
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
			res.status(400).json({ error: "invalid parameters", body: req.body });
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
