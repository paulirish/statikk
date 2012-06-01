module.exports = function (grunt) {

	grunt.initConfig({
		//test: {
		//	file: ['test/**/*.js']
		//},
		lint: {
			all: ['lib/**/*.js', 'test/**/*.js']
		},
		jshint: {
			options: {
				white:  true,
				es5:    true,
				node:   true
			}
		}
	});

	// Default task
	grunt.registerTask('default', 'lint');

};
