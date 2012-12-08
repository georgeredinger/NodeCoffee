module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-coffee');
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
		},
		coffee: {
			dev: {
				src: 'coffee/**/*.coffee',
				dest: 'public/js/'
			}
		},
		watch: {
			files: '<config:coffee.dev.src>',
			tasks: 'coffee:dev'
		},
		jshint: {
			options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
			coffee: {
				compile: {
					files: {
						'lib/*.js': ['src/*.coffee']
					}
				},
				flatten: {
					options: {
						flatten: true
					},
					files: {
						'lib/*.js': ['src/*.coffee'] 
					}
				}
			},
			globals: {
        exports: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');

};


