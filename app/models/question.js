// app/models/question.js

// get module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var answerSchema = require('./answer').schema;

// Schema definition
var questionSchema = new Schema({
	qid			: Schema.ObjectId,
	text		: String,
	detail		: String,
	date 		: 	{ 
		type 	: Date,
		default : Date.now 
	},
	choices		: [ answerSchema ],
	answer		: answerScema,
	predefinedDifficulty	: Number,
	mesuredDifficulty		: Number,
	// ??? 		: Number
});

// Model export
module.exports = mongoose.model('Question', questionSchema);