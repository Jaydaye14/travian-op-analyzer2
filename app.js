'use strict';

// ============================================================
// DONNÉES DE TROUPES — vitesse base (cases/heure, sans serveur)
// ============================================================
const TROOPS = [
  // HUNS
  { civ:'hun',      name:'Soldat Hun',          type:'infantry', speed:9,  role:'off' },
  { civ:'hun',      name:'Guerrier Hun',         type:'infantry', speed:10, role:'off' },
  { civ:'hun',      name:'Marcheur',             type:'cavalry',  speed:18, role:'off' },
  { civ:'hun',      name:'Steppeur',             type:'cavalry',  speed:19, role:'off' },
  { civ:'hun',      name:'Khan',                 type:'cavalry',  speed:15, role:'hero' },
  { civ:'hun',      name:'Bélier Hun',           type:'siege',    speed:4,  role:'siege' },
  { civ:'hun',      name:'Catapulte Huns',       type:'siege',    speed:3,  role:'siege' },
  // GAULOIS
  { civ:'gaulois',  name:'Phalangiste',          type:'infantry', speed:7,  role:'def' },
  { civ:'gaulois',  name:'Épéiste',              type:'infantry', speed:6,  role:'def' },
  { civ:'gaulois',  name:'Éclaireur Gaul',       type:'cavalry',  speed:16, role:'scout' },
  { civ:'gaulois',  name:'Haeduen',              type:'cavalry',  speed:19, role:'off' },
  { civ:'gaulois',  name:'Druide équestre',      type:'cavalry',  speed:16, role:'def' },
  { civ:'gaulois',  name:'Bélier Gaul',          type:'siege',    speed:9,  role:'siege' },
  { civ:'gaulois',  name:'Catapulte Gaul',       type:'siege',    speed:4,  role:'siege' },
  // ROMAINS
  { civ:'romain',   name:'Légionnaire',          type:'infantry', speed:6,  role:'off' },
  { civ:'romain',   name:'Prétoriens',           type:'infantry', speed:5,  role:'def' },
  { civ:'romain',   name:'Impériens',            type:'infantry', speed:7,  role:'off' },
  { civ:'romain',   name:'Équites Légati',       type:'cavalry',  speed:16, role:'scout' },
  { civ:'romain',   name:'Équites Impératoris',  type:'cavalry',  speed:14, role:'off' },
  { civ:'romain',   name:'Équites Caesaris',     type:'cavalry',  speed:10, role:'off' },
  { civ:'romain',   name:'Bélier Romain',        type:'siege',    speed:9,  role:'siege' },
  { civ:'romain',   name:'Baliste',              type:'siege',    speed:3,  role:'siege' },
  // GERMAINS (Teutons)
  { civ:'germain',  name:'Massue',               type:'infantry', speed:6,  role:'off' },
  { civ:'germain',  name:'Spadassin',            type:'infantry', speed:7,  role:'off' },
  { civ:'germain',  name:'Frondeur',             type:'infantry', speed:8,  role:'def' },
  { civ:'germain',  name:'Paladin',              type:'cavalry',  speed:10, role:'def' },
  { civ:'germain',  name:'Cavalier Teuton',      type:'cavalry',  speed:9,  role:'off' },
  { civ:'germain',  name:'Bélier Teuton',        type:'siege',    speed:4,  role:'siege' },
  { civ:'germain',  name:'Catapulte Teuton',     type:'siege',    speed:3,  role:'siege' },
  // SPARTIATES
  { civ:'spartiate',name:'Hoplite',              type:'infantry', speed:7,  role:'def' },
  { civ:'spartiate',name:'Spartiate d\'élite',   type:'infantry', speed:6,  role:'off' },
  { civ:'spartiate',name:'Éclaireur Spart.',     type:'cavalry',  speed:16, role:'scout' },
  { civ:'spartiate',name:'Cavalier Spart.',      type:'cavalry',  speed:14, role:'off' },
  { civ:'spartiate',name:'Lectus',               type:'cavalry',  speed:10, role:'off' },
  { civ:'spartiate',name:'Bélier Spart.',        type:'siege',    speed:8,  role:'siege' },
  { civ:'spartiate',name:'Catapulte Spart.',     type:'siege',    speed:3,  role:'siege' },
  // ÉGYPTIENS
  { civ:'egyptien', name:'Porte-épée',           type:'infantry', speed:7,  role:'off' },
  { civ:'egyptien', name:'Archer',               type:'infantry', speed:9,  role:'off' },
  { civ:'egyptien', name:'Éclaireur Egypt.',     type:'cavalry',  speed:14, role:'scout' },
  { civ:'egyptien', name:'Cavalier Egypt.',      type:'cavalry',  speed:13, role:'off' },
  { civ:'egyptien', name:'Char de guerre',       type:'cavalry',  speed:10, role:'off' },
  { civ:'egyptien', name:'Bélier Egypt.',        type:'siege',    speed:5,  role:'siege' },
  { civ:'egyptien', name:'Catapulte Egypt.',     type:'siege',    speed:3,  role:'siege' },
];

const SERVER_SPEED = 2;
const CIV_LABELS = {
  hun:'Huns', gaulois:'Gaulois', romain:'Romains',
  germain:'Germains', spartiate:'Spartiates', egyptien:'Égyptiens'
};

// ============================================================
// UTILITIES
// ============================================================
function chebyshev(x1,y1,x2,y2) {
  return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
}

function fmtDuration(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function fmtDatetime(dt) {
  return dt.toLocaleString('fr-FR', {
    weekday:'short', day:'2-digit', month:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  });
}

function fmtTime(dt) {
  return dt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

function fmtDate(dt) {
  return dt.toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'2-digit' });
}

function isRoundTime(dt) {
  const m = dt.getMinutes();
  const s = dt.getSeconds();
  // Consider "round" if seconds near 0 and minutes at 0, 15, 30, 45
  return s <= 5 && (m === 0 || m === 15 || m === 30 || m === 45);
}

function isSemiRound(dt) {
  const s = dt.getSeconds();
  return s <= 10 || s >= 50;
}

// ============================================================
// TABS
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'history') renderHistory();
    if (tab.dataset.tab === 'guide') renderSpeedRef();
  });
});

// ============================================================
// ACCORDION
// ============================================================
function toggleAcc(header) {
  header.classList.toggle('open');
  header.nextElementSibling.classList.toggle('open');
}

// Open both accordions by default after analysis
function openAccordions() {
  document.querySelectorAll('.accordion-header').forEach(h => {
    h.classList.add('open');
    h.nextElementSibling.classList.add('open');
  });
}

// ============================================================
// ANALYZE
// ============================================================
function analyze() {
  const dx = parseFloat(document.getElementById('dx').value);
  const dy = parseFloat(document.getElementById('dy').value);
  const ax = parseFloat(document.getElementById('ax').value);
  const ay = parseFloat(document.getElementById('ay').value);
  const arrDate = document.getElementById('arr-date').value;
  const arrTime = document.getElementById('arr-time').value;
  const civ = document.getElementById('civ').value;

  if (isNaN(dx) || isNaN(dy) || isNaN(ax) || isNaN(ay)) {
    alert('Entre les coordonnées des deux villages.');
    return;
  }
  if (!arrDate || !arrTime) {
    alert('Entre la date et l\'heure d\'arrivée.');
    return;
  }

  // Parse arrival
  const arrDt = new Date(arrDate + 'T' + (arrTime.length === 5 ? arrTime + ':00' : arrTime));
  if (isNaN(arrDt.getTime())) { alert('Date/heure invalide.'); return; }

  const dist = chebyshev(dx, dy, ax, ay);

  // Filter troops
  const troops = civ === 'all' ? TROOPS : TROOPS.filter(t => t.civ === civ);
  // For "attack" type, filter out scouts
  const attType = document.getElementById('att-type').value;
  const filteredTroops = attType === 'raid'
    ? troops
    : attType === 'siege'
      ? troops.filter(t => t.role === 'siege' || t.role === 'off')
      : troops.filter(t => t.role !== 'scout');

  // Build troop data
  const troopData = filteredTroops.map(t => {
    const effSpeed = t.speed * SERVER_SPEED;
    const travelMs = (dist / effSpeed) * 3600000;
    const sendDt = new Date(arrDt.getTime() - travelMs);
    return { ...t, effSpeed, travelMs, sendDt };
  }).sort((a,b) => a.travelMs - b.travelMs);

  // Stats
  const offTroops = troopData.filter(t => t.role === 'off' || t.role === 'infantry' || t.role === 'cavalry');
  const fastestMs = troopData.length ? troopData[0].travelMs : 0;
  const slowestMs = troopData.length ? troopData[troopData.length-1].travelMs : 0;

  document.getElementById('r-dist').textContent = dist;
  document.getElementById('r-travel-fast').textContent = fmtDuration(fastestMs);
  document.getElementById('r-travel-slow').textContent = fmtDuration(slowestMs);

  // Send time pills
  const sendContainer = document.getElementById('r-send-times');
  const uniqueSends = [];
  const seen = new Set();
  troopData.forEach(t => {
    const key = fmtTime(t.sendDt);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSends.push({ time: key, date: fmtDate(t.sendDt), troop: t.name });
    }
  });
  sendContainer.innerHTML = uniqueSends.map(s =>
    `<div class="send-time-pill" title="${s.troop}">${s.date}&nbsp;&nbsp;${s.time}</div>`
  ).join('');

  // Tournament analysis
  renderTournament(troopData, dist, arrDt);

  // Troop table
  renderTroopTable(troopData);

  document.getElementById('results').style.display = 'block';
  openAccordions();
  document.getElementById('results').scrollIntoView({ behavior:'smooth', block:'nearest' });

  // Store last analysis for history
  window._lastAnalysis = {
    dx, dy, ax, ay,
    defName: document.getElementById('def-name').value || `(${dx},${dy})`,
    attName: document.getElementById('att-name').value || `(${ax},${ay})`,
    civ, dist, arrDt: arrDt.toISOString(),
    date: new Date().toISOString()
  };
}

// ============================================================
// TOURNAMENT
// ============================================================
function renderTournament(troopData, dist, arrDt) {
  // Only offensive/meaningful troops
  const offTroops = troopData.filter(t => t.role === 'off' || t.role === 'siege').slice(0,12);
  if (!offTroops.length) {
    document.getElementById('tournament-result').innerHTML = '<p class="hint">Pas de troupes offensives sélectionnées.</p>';
    return;
  }

  let rows = '';
  offTroops.forEach(t => {
    const effBase = t.speed * SERVER_SPEED;
    // Test PDT levels 0 to 10
    for (let lv = 0; lv <= 10; lv++) {
      const mult = Math.pow(1.2, lv);
      const effSpeed = effBase * mult;
      const travelMs = (dist / effSpeed) * 3600000;
      const sendDt = new Date(arrDt.getTime() - travelMs);

      const round = isRoundTime(sendDt);
      const semi = isSemiRound(sendDt);
      let badgeClass, matchClass;

      if (round) {
        badgeClass = 'badge-gold';
        matchClass = 'highlight';
      } else if (semi) {
        badgeClass = 'badge-amber';
        matchClass = 'highlight-amber';
      } else {
        badgeClass = 'badge-gray';
        matchClass = '';
      }

      if (round || semi || lv === 0) {
        rows += `<tr class="${matchClass}">
          <td>${t.name}</td>
          <td>${CIV_LABELS[t.civ] || t.civ}</td>
          <td>${effBase.toFixed(0)} c/h</td>
          <td><span class="badge ${badgeClass}">Niv. ${lv}</span></td>
          <td>×${mult.toFixed(2)}</td>
          <td style="font-family:monospace;font-size:13px">${fmtTime(sendDt)}</td>
          <td style="font-size:12px;color:var(--text2)">${fmtDate(sendDt)}</td>
        </tr>`;
        break;
      }
    }
  });

  document.getElementById('tournament-result').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Troupe</th><th>Civ</th><th>V. ×2</th><th>PDT estimée</th><th>Mult.</th><th>Heure envoi</th><th>Date</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ============================================================
// TROOP TABLE
// ============================================================
function renderTroopTable(troopData) {
  let rows = '';
  troopData.forEach(t => {
    const roleColor = t.role === 'siege' ? 'var(--red2)' : t.role === 'scout' ? 'var(--text2)' : 'var(--text)';
    rows += `<tr>
      <td>${t.name}</td>
      <td style="color:var(--gold)">${CIV_LABELS[t.civ] || t.civ}</td>
      <td style="color:${roleColor}">${t.role}</td>
      <td>${t.speed} → ${t.effSpeed} c/h</td>
      <td style="font-family:monospace">${fmtDuration(t.travelMs)}</td>
      <td style="font-family:monospace;font-size:13px">${fmtTime(t.sendDt)}</td>
      <td style="font-size:12px;color:var(--text2)">${fmtDate(t.sendDt)}</td>
    </tr>`;
  });

  document.getElementById('troop-table').innerHTML = `
    <table>
      <thead><tr>
        <th>Troupe</th><th>Civ</th><th>Rôle</th><th>Vitesse</th><th>Trajet</th><th>Envoi</th><th>Date</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ============================================================
// SPEED REFERENCE TABLE (Guide tab)
// ============================================================
function renderSpeedRef() {
  const grouped = {};
  TROOPS.forEach(t => {
    if (!grouped[t.civ]) grouped[t.civ] = [];
    grouped[t.civ].push(t);
  });

  let html = '<thead><tr><th>Civilisation</th><th>Troupe</th><th>Type</th><th>Base</th><th>×2 serveur</th></tr></thead><tbody>';
  Object.keys(grouped).forEach(civ => {
    grouped[civ].forEach((t, i) => {
      html += `<tr>
        <td style="color:var(--gold)">${i===0 ? CIV_LABELS[civ] : ''}</td>
        <td>${t.name}</td>
        <td style="color:var(--text2)">${t.type}</td>
        <td>${t.speed}</td>
        <td style="font-weight:600">${t.speed * SERVER_SPEED}</td>
      </tr>`;
    });
  });
  html += '</tbody>';
  document.getElementById('speed-ref-table').innerHTML = html;
}

// ============================================================
// HISTORY
// ============================================================
function saveToHistory() {
  if (!window._lastAnalysis) return;
  const history = getHistory();
  history.unshift({ ...window._lastAnalysis, id: Date.now() });
  // keep max 50
  if (history.length > 50) history.pop();
  localStorage.setItem('op_history', JSON.stringify(history));
  alert('Opération sauvegardée !');
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('op_history') || '[]');
  } catch { return []; }
}

function renderHistory() {
  const history = getHistory();
  const container = document.getElementById('history-list');
  if (!history.length) {
    container.innerHTML = '<div class="empty-state">Aucune opération sauvegardée.<br>Analyse une op et clique sur "Sauvegarder".</div>';
    return;
  }

  container.innerHTML = history.map(op => `
    <div class="history-item" onclick="loadHistory(${op.id})">
      <div>
        <div class="hi-title">🎯 ${op.defName} ← ${op.attName}</div>
        <div class="hi-meta">
          Dist. ${op.dist} cases · ${CIV_LABELS[op.civ] || op.civ} ·
          Arrivée ${new Date(op.arrDt).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:var(--text3)">${new Date(op.date).toLocaleDateString('fr-FR')}</span>
        <span class="hi-delete" onclick="event.stopPropagation();deleteHistory(${op.id})">×</span>
      </div>
    </div>
  `).join('');
}

function loadHistory(id) {
  const history = getHistory();
  const op = history.find(h => h.id === id);
  if (!op) return;

  document.getElementById('dx').value = op.dx;
  document.getElementById('dy').value = op.dy;
  document.getElementById('ax').value = op.ax;
  document.getElementById('ay').value = op.ay;
  document.getElementById('def-name').value = op.defName;
  document.getElementById('att-name').value = op.attName;
  document.getElementById('civ').value = op.civ;
  const dt = new Date(op.arrDt);
  document.getElementById('arr-date').value = dt.toISOString().split('T')[0];
  document.getElementById('arr-time').value = dt.toTimeString().slice(0,8);

  // Switch to analyze tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="analyze"]').classList.add('active');
  document.getElementById('tab-analyze').classList.add('active');

  analyze();
}

function deleteHistory(id) {
  const history = getHistory().filter(h => h.id !== id);
  localStorage.setItem('op_history', JSON.stringify(history));
  renderHistory();
}

// ============================================================
// DEFAULTS
// ============================================================
(function init() {
  const now = new Date();
  // Default arrival: now + 1 hour
  const future = new Date(now.getTime() + 3600000);
  document.getElementById('arr-date').value = future.toISOString().split('T')[0];
  document.getElementById('arr-time').value = future.toTimeString().slice(0,8);
})();

// ============================================================
// PWA INSTALL
// ============================================================
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBanner.style.display = 'none';
});

// ============================================================
// SERVICE WORKER
// ============================================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
