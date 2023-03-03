import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);
const port = 9025;


app.use(express.static('public'));


server.listen(port, ()=>{
    console.log('Server Listening on port 9025');
});