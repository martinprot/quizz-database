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
    this.model('Question').update(
        {questions: this._id}, 
        {$pull: {questions: this._id}}, 
        {multi: true},
        next
    );
});

quizzSchema.pre('save', function (next) {
	this.updated = Date.now();
	next();
});


// Model export
module.exports = mongoose.model('Quizz', quizzSchema);