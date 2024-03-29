import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import socket from './socket'

dotenv.config();

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

socket(server);
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('서버 페이지')
})