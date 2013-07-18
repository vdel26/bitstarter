var express = require('express'),
    fs = require('fs');

var app = express.createServer();

app.use(express.logger())
app.use(express.static('public'));

app.get('/', function(request, response) {
  var text = fs.readFileSync('index2.html').toString('utf8');
  response.send(text);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
