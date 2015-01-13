// app/common-routes.js ===================================================================

module.exports = function(router, passport) {
    // server routes ===========================================================

	router.route("*")
	.get(function(req, res) {
		console.log("arrived on *")
        res.sendfile('./public/index.html'); // load our public/index.html file
	});
};