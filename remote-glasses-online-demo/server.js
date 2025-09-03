// server.js — RemoteGlasses Online Demo
// Serve i file statici e un endpoint WebSocket /ws per il signaling.
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers minimi
app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','no-referrer');
  next();
});

// Static
app.use(express.static(__dirname, { extensions: ['html'] }));

// Health
app.get('/healthz', (_,res)=>res.status(200).send('ok'));

const server = http.createServer(app);

// WebSocket signaling su /ws
const wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    let msg; try { msg = JSON.parse(data); } catch { return; }
    // broadcast semplice (le room sono filtrate dal client via campo room)
    wss.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });
  socket.on('error', ()=>{});
});

server.listen(PORT, () => {
  console.log('RemoteGlasses demo on http://0.0.0.0:' + PORT);
});
