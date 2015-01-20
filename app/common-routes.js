// app/common-routes.js ===================================================================

module.exports = function(router, passport) {

	router.route("*")
	.get(function(req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
	});
};