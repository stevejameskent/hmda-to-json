var file_spec = require('./hmda_file_spec.json');

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

self.onmessage = function(msg){
	if (msg.data === 'poison'){
		self.postMessage({result: 'done'});
	} else {
		var results = {
			transmittalSheet: {},
        	loanApplicationRegisters: []
		};

		for (var i = 0; i < msg.data.length; i++)
		{
			var line = msg.data[i].line;
			var type = msg.data[i].type;
			var record = _parseLine(type, line);
			if (type === 'transmittalSheet'){
				results.transmittalSheet = record;
			} else {
				results.loanApplicationRegisters.push(record);
			}
		}
		self.postMessage({
			result: results
		});
	}
};