/* global require, module */

var path = require('path');

module.exports = function(grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-module-dependence');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var pkg = grunt.file.readJSON('package.json');

    var banner = '/*!\n' +
        ' * ====================================================\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository.url %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' * ====================================================\n' +
        ' */\n\n';

    var expose = '\nuse(\'expose\');\n';

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: pkg,

        clean: {
            last: 'release'
        },

        // resolve dependence
        dependence: {
            options: {
                base: 'src',
                entrance: 'expose'
            },
            merge: {
                files: [{
                    src: 'src/**/*.js',
                    dest: 'release/kityminder.core.js'
                }]
            }
        },

        // concat
        concat: {
            closure: {
                options: {
                    banner: banner + '(function () {\n',
                    footer: expose + '})();'
                },
                files: {
                    'release/kityminder.core.js': ['release/kityminder.core.js']
                }
            }
        },

        uglify: {
            options: {
                banner: banner
            },
            minimize: {
                files: {
                    'release/kityminder.core.min.js': 'release/kityminder.core.js'
                }
            }
        },

        watch: {
            less: {
                files: ['ui/theme/**/*.less'],
                tasks: ['less:compile', 'autoprefixer']
            }
        },

    });


    // Build task(s).
    grunt.registerTask('default', ['clean', 'dependence', 'concat', 'uglify']);

};