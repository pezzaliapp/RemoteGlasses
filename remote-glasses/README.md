# RemoteGlasses — Video assistenza remota con occhiali (WebRTC, PWA)

**RemoteGlasses** è una PWA open‑source (MIT) che permette a un operatore con **occhiali con fotocamera** (o smartphone fissato) di trasmettere **in tempo reale** verso un **viewer remoto** via **WebRTC**.

- 🎯 Latenza bassa (≈200–400 ms su rete stabile)
- 🔒 Privacy by design: nessun cloud obbligatorio, infrastruttura installabile **on‑premise** dal cliente
- 🧩 Codice semplice in **un’unica cartella**

## Architettura minima
- **Occhiali (glasses)** → aprono la PWA, attivano camera/mic, inviano *offer* WebRTC.
- **Viewer (viewer)** → riceve *offer* e risponde con *answer*.
- **Signaling** → piccolo server WebSocket (`server.js`) che scambia offer/answer/ice.
- **STUN/TURN** → STUN pubblico per test; per produzione aggiungere **TURN (coturn)**.

## Avvio rapido (demo locale)
1) Avvia il signaling:
```bash
npm init -y
npm i ws
node server.js
```
2) Servi i file statici (esempio):
```bash
python -m http.server 8000
```
3) Apri `http://localhost:8000/index.html` sugli **occhiali/telefono** e imposta:
- Ruolo = **Occhiali**
- Room ID = es. `officina-01`
- WS = `ws://<IP_DEL_TUO_PC>:8080`

4) Condividi il link generato con il **viewer** e aprilo su un secondo dispositivo.

## TURN (produzione)
Installa **coturn** su un VPS o server del cliente e aggiungi in `app.js`:
```js
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'turn:DOMINIO_O_IP:3478', username: 'user', credential: 'pass' }
]
```
Usa **HTTPS/WSS** in produzione e autentica l’accesso alle *room* con token.

## Limitazioni dell’MVP
- Signaling broadcast (non multi‑tenant robusto).
- Un viewer per room (estendibile con SFU come mediasoup/Jitsi).
- Nessuna registrazione integrata (aggiungibile con MediaRecorder lato viewer).

## Roadmap consigliata
- Token per room + scadenze, log audit.
- Reconnect e adattamento bitrate.
- Annotazioni/laser pointer lato viewer.
- App Android “container” (WebView) per occhiali RealWear/Vuzix.

---
Licenza: MIT • © RemoteGlasses
