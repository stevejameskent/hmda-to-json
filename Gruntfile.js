'use strict';

module.exports = function (grunt) {
    
    grunt.initConfig({
        jshint: {
            files: [
                '**/*.js',
                '!build/**/*',
                '!node_modules/**/*',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        browserify: {
            dev: {
                options: {
                    alias: ['./hmda_file_processor.js:hmda_file_processor'],
                    browserifyOptions: {
                        debug: true,
                    }
                },
                src: ['hmda_file_processor.js'],
                dest: 'build/bundle.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
}
