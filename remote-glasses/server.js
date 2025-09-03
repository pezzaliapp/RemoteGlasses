// server.js — Semplice WebSocket signaling (Node.js + ws)
// Avvio: `npm init -y && npm i ws && node server.js`
// In produzione usa HTTPS/WSS dietro reverse-proxy e gestisci auth/stanze.
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });
console.log('Signaling WS listening on ws://0.0.0.0:' + PORT);

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    let msg; try { msg = JSON.parse(data); } catch { return; }
    // Broadcast semplice (room gestita lato client con campo room)
    wss.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });
});
