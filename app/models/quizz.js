// app/models/quizz.js

// get mongoose module
var mongoose = require('mongoose');

// define our nerd model
module.exports = mongoose.model('Quizz', {
    name : {type : String, default: ''}
});