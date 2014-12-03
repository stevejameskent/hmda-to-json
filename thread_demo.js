var chomp = require('line-chomper').chomp;
var Worker = require('workerjs');
var FileStream = require('domnode-filestream');

var num_workers = 8;
var workers = [];
var num_finished = 0;

var _hmdaFileJson = {
    hmdaFile: {
        transmittalSheet: {},
        loanApplicationRegisters: []
    }
};

var handle_message = function(msg) {
	if (msg.data.result === 'done') {
		num_finished += 1;
		if (num_finished === num_workers) {
			for (var i = 0; i < num_workers; i++){
				workers[i].terminate();
			}
			console.log(_hmdaFileJson.hmdaFile);
		}
	} else if (msg.data.result === 'error') {

	} else {
		if (msg.data.result.transmittalSheet.activityYear !== null)
		{
			_hmdaFileJson.hmdaFile.transmittalSheet = msg.data.result.transmittalSheet;
		}
		_hmdaFileJson.hmdaFile.loanApplicationRegisters = _hmdaFileJson.hmdaFile.loanApplicationRegisters.concat(msg.data.result.loanApplicationRegisters);
	}
};

for (var i = 0; i < num_workers; i++) {
	workers[i] = new Worker('build/hmda_worker.js');
	workers[i].onmessage = handle_message;
}

var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function(e) {	
	var file = fileInput.files[0];
	var file_stream = new FileStream(file);
	var out_stream = new FileStream.FSStream();
	file_stream.pipe(out_stream);

	chomp(out_stream, {trim: false}, function(err, lines) {
		var error = null;
		var next = -1;

		var worker_lines = [];
		for (var i = 0; i < num_workers; i++){
			worker_lines.push([]);
		}

		for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {
			next += 1;
			if (next == num_workers) {
				next = 0;
			}

			var record;
			if (lineNumber === 0) {
				record = {};
				record.line_number = lineNumber;
				record.line = lines[lineNumber];
				record.type = 'transmittalSheet';
				worker_lines[next].push(record);
			} else {
			    record = {};
			    record.line_number = lineNumber;
			    record.line = lines[lineNumber];
			    record.type = 'loanApplicationRegister';
			    worker_lines[next].push(record);
			}
		}

		for (var i = 0; i < num_workers; i++) {
			workers[i].postMessage(worker_lines[i]);
			workers[i].postMessage('poison');
		}	
	});
});