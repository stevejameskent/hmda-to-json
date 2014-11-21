'use strict';

var chomp = require('line-chomper').chomp;
var file_spec = require('./hmda_file_spec.json');

var _hmdaFileJson = {
    hmdaFile: {
        transmittalSheet: {},
        loanApplicationRegisters: []
    }
};

function _parseLine(type, line) {
    var record = {};
    var line_spec = file_spec[type];
    for(var field in line_spec) {
        if (line_spec.hasOwnProperty(field) && line.length >= line_spec[field].end) {
            record[field] = line.slice(line_spec[field].start-1, line_spec[field].end);
        } else {
            return false;
        }
    }
    return record;
}

var HMDAFileProcessor = function() {
    return {
        process: function(file, next) {
            chomp(file, function(err, lines) {
                var error = null;
                for (var lineNumber=0; lineNumber < lines.length; lineNumber++) {
                    var record;
                    if (lineNumber === 0) {
                        record = _parseLine('transmittalSheet', lines[lineNumber]);
                        if (! record) {
                            error = 'Error in transmittal sheet data at line 1';
                            break;
                        }
                        _hmdaFileJson.hmdaFile.transmittalSheet = record;
                    } else {
                        record = _parseLine('loanApplicationRegister', lines[lineNumber]);
                        if (! record) {
                            error = 'Error in load application register at line' + lineNumber+1;
                            break;
                        }
                        _hmdaFileJson.hmdaFile.loanApplicationRegisters.push(record);
                    }
                }
                next(error, _hmdaFileJson);
            });
        }
    };
};

module.exports = new HMDAFileProcessor();
