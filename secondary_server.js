const http = require('http');
const fs = require('fs');
const request = require('request');

const PORT = 8080;

const download = function(uri, filename, callback) {
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
    });
  })
};

let count = 0;

function handleRequest(req, res) {
  const url = req.url.slice(1);
  const name = url.split("/").slice(-1).join("");
  console.log(url, name);
  download("http://" + url, name).then(()=>{
    console.log("asd")
    var img = fs.readFileSync(name);

    res.writeHead(200, {'Content-Type': 'image/jpeg' });
    res.end(img, 'binary');
  })
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log("Server listening on: http://localhost:" + PORT);
});

