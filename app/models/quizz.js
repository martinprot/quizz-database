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
	locale		: String,
	apps		: [String]
});

// middlewares =================
quizzSchema.pre('remove', function(next) {
	// Cascade
    var QuestionModel = this.model('Question');
	QuestionModel.remove({quizz: this._id}).exec();
   	next();
});

quizzSchema.pre('save', function (next) {
	this.updated = Date.now();
	next();
});


// Model export
module.exports = mongoose.model('Quizz', quizzSchema);