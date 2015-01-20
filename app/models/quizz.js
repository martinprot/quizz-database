// app/models/quizz.js

// get modules
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var questionSchema = require('./question').schema;

// Schema definition
var quizzSchema = new Schema({
	name		: String,
	created		: 	{ 
		type 	: Date,
		default : Date.now
	},
	updated		: 	{ 
		type 	: Date,
		default : Date.now
	},
	questions 	: [ { type: Schema.ObjectId, ref: 'Question'} ],
	language	: String
});

// middlewares =================
quizzSchema.pre('remove', function(next) {
	// Nullify this quizz ref from question list
    var QuestionModel = this.model('Question');
	QuestionModel.update(
	    {quizzes: this._id},
	    {$pull: {quizzes: this._id}},
	    {multi: true},
	    function(err, numberAffected, rawResponse) {
	    	next();
	    }
	);
});

quizzSchema.pre('save', function (next) {
	this.updated = Date.now();
	next();
});


// Model export
module.exports = mongoose.model('Quizz', quizzSchema);