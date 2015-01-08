// app/models/language.js

// get mongoose module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Schema definition
var languageSchema = new Schema({
	code		: String
});

// Model export
module.exports = mongoose.model('Language', languageSchema);