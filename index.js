var fs = require('fs');
var pipeline = require('stream-combiner');
var through = require('through');

var transforms = [];

function transform(file) {
  if (transforms.length === 0) {
    return through();
  }

  var streams = transforms.map(function(transform) {
    return transform(file);
  });

  return pipeline.apply(null, streams);
}

function _hook(module, filename) {
  var src = fs.readFileSync(filename);
  var stream = transform(filename);

  var buf = '';
  function write(data) {
    buf += data;
  }

  function end() {
    module.exports = eval(buf);
  }

  stream.pipe(through(write, end));

  stream.write(src);
  stream.end()
}

function install(transform) {
  if (transforms.length === 0) {
    require.extensions['.js'] = _hook;
  }

  transforms.push(transform);
}

module.exports = {
  install: install
};