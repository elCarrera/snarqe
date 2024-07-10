// Old server with plain node, no express
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

app.use('/static', express.static('static'));

https.createServer(options, (req, res) => {
  // Lee el archivo estático
  fs.readFile('index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error al cargar el archivo estático');
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(443);
