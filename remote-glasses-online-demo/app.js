/* RemoteGlasses — Demo Online (unico dominio: static + WS)
   - Calcolo automatico wsUrl: wss://<host>/ws
   - Funziona anche in http (sviluppo) con ws://<host>/ws
*/
let pc, ws, localStream;
const roleEl = document.getElementById('role');
const roomEl = document.getElementById('roomId');
const wsUrlEl = document.getElementById('wsUrl');
const startBtn = document.getElementById('startBtn');
const hangupBtn = document.getElementById('hangupBtn');
const statusEl = document.getElementById('status');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const shareLinkEl = document.getElementById('shareLink');

// Query params override
const u = new URL(location.href);
if (u.searchParams.get('role')) roleEl.value = u.searchParams.get('role');
if (u.searchParams.get('room')) roomEl.value = u.searchParams.get('room');
if (u.searchParams.get('ws')) wsUrlEl.value = u.searchParams.get('ws');

// Auto ws url (same origin)
function defaultWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return proto + '//' + location.host + '/ws';
}

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
window.installPWA = () => alert('Installa: usa “Aggiungi a Home” dal browser.');

function log(s){ console.log(s); statusEl.textContent = s; }

function makePeer(){
  pc = new RTCPeerConnection({
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302','stun:global.stun.twilio.com:3478'] }
      // Aggiungi TURN in produzione per affidabilità.
    ]
  });
  pc.onicecandidate = e => { if (e.candidate) send({type:'ice', candidate:e.candidate, room:roomEl.value}); };
  pc.ontrack = e => { remoteVideo.srcObject = e.streams[0]; remoteVideo.play().catch(()=>{}); };
}

function connectWS(){
  return new Promise((resolve, reject) => {
    const url = (wsUrlEl.value && wsUrlEl.value.trim()) || defaultWsUrl();
    wsUrlEl.value = url;
    const s = new WebSocket(url);
    s.onopen = () => { ws = s; resolve(); };
    s.onerror = (err) => reject(err);
    s.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data || '{}');
      if (msg.room !== roomEl.value) return;
      if (msg.type === 'offer' && roleEl.value === 'viewer') {
        await onViewerOffer(msg.sdp);
      } else if (msg.type === 'answer' && roleEl.value === 'glasses') {
        await pc.setRemoteDescription({ type:'answer', sdp: msg.sdp });
        log('Risposta ricevuta. Connessione in corso…');
      } else if (msg.type === 'ice') {
        try { await pc.addIceCandidate(msg.candidate); } catch {}
      }
    };
  });
}
function send(o){ if(ws && ws.readyState===1) ws.send(JSON.stringify(o)); }

async function start(){
  const role = roleEl.value;
  const room = roomEl.value || 'demo';
  const wsUrl = (wsUrlEl.value && wsUrlEl.value.trim()) || defaultWsUrl();

  // Link invito
  const share = new URL(location.href);
  share.searchParams.set('role','viewer');
  share.searchParams.set('room',room);
  share.searchParams.set('ws',wsUrl);
  shareLinkEl.value = share.toString();

  makePeer();
  await connectWS();

  if (role === 'glasses'){
    localStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' }, audio:true });
    localVideo.srcObject = localStream;
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send({ type:'offer', sdp: offer.sdp, room });
    log('Offerta inviata. In attesa del viewer…');
  } else {
    log('Viewer pronto. In attesa dell’offer…');
  }

  startBtn.disabled = true;
  hangupBtn.disabled = false;
}

async function onViewerOffer(sdp){
  await pc.setRemoteDescription({ type:'offer', sdp });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  send({ type:'answer', sdp: answer.sdp, room: roomEl.value });
  log('Risposta inviata. Collegato!');
}

function hangup(){
  if (ws){ try{ ws.close(); }catch{} ws=null; }
  if (pc){ pc.getSenders().forEach(s=>{ try{ s.track.stop(); }catch{} }); pc.close(); pc=null; }
  if (localVideo.srcObject){ localVideo.srcObject.getTracks().forEach(t=>t.stop()); localVideo.srcObject=null; }
  remoteVideo.srcObject = null;
  startBtn.disabled = false;
  hangupBtn.disabled = true;
  log('Chiuso.');
}

startBtn.addEventListener('click', ()=>start().catch(e=>{ console.error(e); log('Errore: '+e.message); }));
hangupBtn.addEventListener('click', hangup);
