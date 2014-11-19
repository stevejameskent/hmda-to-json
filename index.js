'use strict';

var HMDAFileProcessor = require('./hmda_file_processor');

function main() {

    var file_name = process.argv[2];


    if (!file_name) {
        process.stderr.write('Usage: node index.js [HMDA file]\n');
        return -1;
    }

    console.log('Processing..');
    HMDAFileProcessor.process(file_name, function(error, json) {
        if (error) {
            console.log(error);
        } else {
            console.log(json);
        }
        console.log('done');
    });

};

module.exports = main();