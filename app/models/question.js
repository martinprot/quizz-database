// app/models/question.js

// get module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Schema definition
var questionSchema = new Schema({
	customId	: { 
		type 	: String,
		index 	: true
	},
	text		: String,
	topic		: String,
	updated		: 	{ 
		type 	: Date,
		default : Date.now 
	},
	updatedDifficulty : 	{ 
		type 	: Date,
		default : Date.now 
	},
	choices		: [ String ],
	answer		: Number,
	difficulty	: { 
		type 	: Number,
		default : 1 // 100% right answers 
	},
	quizz		: { type: Schema.ObjectId, ref: 'Quizz' },
	flag : 	{ 
		type 	: Boolean,
		default : false 
	}
});

// methods ======================
// return question list randomly
questionSchema.methods.randomAnswers = function() {
    var answers = this.choices;
	answers.push(answer);
	// TODO: mix values
	return answers;
};

questionSchema.methods.isRightAnswer = function(answer) {
	return this.answer == answer;
};

// middlewares =================
questionSchema.pre('remove', function(next) {
	// Nullify this question ref from quizz list
	var QuizzModel = this.model('Quizz');
	QuizzModel.update(
	    {questions: this._id},
	    {$pull: {questions: this._id}},
	    {multi: true},
	    function(err, numberAffected, rawResponse) {
	    	next();
	    }
	);
});

questionSchema.post('save', function(next) {
	if(this.quizz) {
		// Check if this question already saved, if not, add it
		var QuizzModel = this.model('Quizz');
		QuizzModel.update(
		    { _id: this.quizz },
		    { $addToSet: { questions: this._id } },
		    { multi: true },
		    function(err, numberAffected, rawResponse) {
		    }
		);
	}
});


// Model export
module.exports = mongoose.model('Question', questionSchema);