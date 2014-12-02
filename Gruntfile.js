/* global require, module */

var path = require('path');

module.exports = function(grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-module-dependence');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

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

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        dependence: {
            options: {
                base: 'src',
                entrance: 'kityminder'
            },
            merge: {
                files: [{
                    src: 'src/**/*.js',
                    dest: 'release/kityminder.all.js'
                }]
            }
        }

    });


    // Build task(s).
    grunt.registerTask('default', ['dependence']);

};