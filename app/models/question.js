// app/models/question.js

// get module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var quizzSchema = require('./quizz').schema;

// Schema definition
var questionSchema = new Schema({
	text		: String,
	detail		: String,
	date 		: 	{ 
		type 	: Date,
		default : Date.now 
	},
	choices		: [ String ],
	answer		: Number,
	predefinedDifficulty	: { 
		type 	: Number,
		default : 1 // 100% right answers 
	},
	mesuredDifficulty		: { 
		type 	: Number,
		default : 1 
	},
	quizzes		: [ { type: Schema.ObjectId, ref: 'Quizz' } ]
	// ??? 		: Number
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
	
	// TODO: nullify. This does not work:
	
    // this.model('Quizz').update(
    //     {quizzes: this._id},
    //     {pull: {quizzes: this._id}},
    //     {multi: true},
    //     next
    // );
});


// Model export
module.exports = mongoose.model('Question', questionSchema);