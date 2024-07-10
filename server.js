const express = require('express');
const app = express();
const port = process.env.PORT || 443;

const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('https/key.pem'),
  cert: fs.readFileSync('https/cert.pem')
};
app.use((req,res,next) =>{
  req.time = new Date(Date.now()).toString();
  console.log('\x1b[33m',req.method,req.hostname, req.path, req.time, req.ip);
  next();
});

app.use(express.static('static'));

app.use((req, res, next) => { 
  switch(req.url) { 
      case '/index': 
          res.redirect('/index.html'); 
          return; 
      case '/ping': 
          res.redirect('ping.html'); 
          return; 
           
      /* PON LAS DEMAS */ 
   
       
      default: 
        next(); 
  } 
}); 
https.createServer(options, app)
  .listen(port, () => {
  console.log('\x1b[34m%s', `Listening on port ${port}`);
});