function readLines(input, func) {
  let remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

function splitLines(input, func) {
  let result = [];
  let index = input.indexOf('\n');
  let last  = 0;
  while (index > -1) {
    result.push(input.substring(last, index))
    last = index + 1;
    index = input.indexOf('\n', last);
  }
  result.push(input.substring(last));
  return result;  
}

exports.readLines = readLines;
exports.splitLines = splitLines;