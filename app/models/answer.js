// app/models/answer.js

// get mongoose module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Schema definition
var answerSchema = new Schema({
	text		: String,
});

// Model export
module.exports = mongoose.model('Answer', answerSchema);