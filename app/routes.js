// app/routes.js ===================================================================


// select the model in database
// var Nerd = require('./models/nerd');

module.exports = function(app) {
    // server routes ===========================================================
    // Authentication routes

	// GET routes
	app.get('/api/quizz/all', function(req, res) {
		console.log(req.query.name);
		res.end();
	});
	
	app.get('/api/quizz/:quizz_id', function(req, res) {
		console.log(req.params.quizz_id);
		res.end("\nvoilà");
	});

    // POST routes
	app.post('/api/quizz/all', function(req, res) {
		res.end();
	});
	
	// PUT routes
	
    // DELETE routes
	

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {
		res.sendfile('./public/views/index.html'); // load our public/index.html file
    });

};

