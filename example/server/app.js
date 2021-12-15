import express from 'express';
const app = express();
import http from 'http';
import path from 'path';
import cors from 'cors';
import  playersync  from './../../server/main.js';

const PORT = process.env.PORT || 3030;

const server = http.createServer(app);

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 
}));

playersync(app);

app.use('/', express.static(path.normalize('dist')));
server.listen(PORT);

console.log('Listening on: ' + PORT);
