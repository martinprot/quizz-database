// app/models/quizz.js

// get modules
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
// languageSchema = require('./language').schema;
// var questionSchema = require('./question').schema;

// Schema definition
var quizzSchema = new Schema({
	qzid		: Schema.ObjectId,
	name		: String,
	date 		: 	{ 
		type 	: Date,
		default : Date.now
	},
	// questions 	: [ questionSchema ],
	// language	: languageSchema
});

// Model export
module.exports = mongoose.model('Quizz', quizzSchema);