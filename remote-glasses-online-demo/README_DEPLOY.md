# RemoteGlasses — Demo Online (Render/Glitch)

Questa cartella è pronta per il deploy **one-click** su piattaforme Node.js (Render, Glitch, Railway).  
Serve **sia** i file statici (PWA) **sia** il signaling WebSocket su `/ws` dallo **stesso dominio**.

## Deploy su Render.com
1. Crea un nuovo **Web Service** da repo (o fai deploy da ZIP importato in GitHub).
2. Seleziona **Build & Run** con Node.js 18+.
3. Render auto-rileverà `Procfile` con `web: node server.js` (altrimenti usa lo **Start Command**).
4. Dopo il deploy, visita l'URL pubblico (https). L'app calcola `wss://<host>/ws` automaticamente.

## Deploy su Glitch.com
1. Crea un progetto **Hello-Node** e sostituisci i file con quelli di questa cartella.
2. Apri la pagina live: l'app userà `wss://<host>/ws` per il signaling.

## Test locale
```bash
npm install
npm start
# Apri http://localhost:3000
```

## Note
- Per reti aziendali/NAT restrittivi, configura un **TURN** (non incluso in questa demo).
- Considera HTTPS/WSS obbligatorio in produzione (le piattaforme gestite lo forniscono di default).
