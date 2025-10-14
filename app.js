let appData = null;
const app = document.getElementById('app');

const subjectIcons = [
  "🟧","💻","🖥️","🗄️","📖","➗","🌐","🇬🇧","🏛️","🧮"
];

const ACCESS_COOKIE = 'bfsicode';
const LOGIN_CODE = 'BFSI2025';

// Escape Funktion
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Login Funktionen
function showLogin() {
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('loginCodeInput').value = '';
  document.getElementById('loginError').textContent = '';
}
function hideLogin() { document.getElementById('loginOverlay').style.display = 'none'; }
function verifyCode() {
  const input = document.getElementById('loginCodeInput').value.trim();
  /*
  if (input === LOGIN_CODE) {
    document.cookie = ACCESS_COOKIE + "=1; max-age=86400; path=/";
    hideLogin();
    showSubjects();
  } else {
    document.getElementById('loginError').textContent = "Falscher Code!";
  }
  */
 document.cookie = ACCESS_COOKIE + "=1; max-age=86400; path=/";
  hideLogin();
  showSubjects();
}
function checkAccess() {
  return document.cookie.includes(ACCESS_COOKIE + "=1");
}
verifyCode();
//document.getElementById('loginBtn').onclick = verifyCode;
document.getElementById('loginCodeInput').onkeydown = e => { if (e.key === 'Enter') verifyCode(); };

// Index laden und App initialisieren
fetch('data/index.json').then(r => r.json()).then(data => {
  appData = data;
  if (!checkAccess()) showLogin();
  else showSubjects();
}).catch(() => {
  app.innerHTML = "<div style='padding:2em; text-align:center; color:#faa;'>Fehler beim Laden der Daten.</div>";
});

function isQuestionValid(q) {
  if (!q) return false;
  if (!Array.isArray(q.options)) return false;
  if (q.options.length === 0) return false;
  return true;
}

// Start-Fächerseite
function showSubjects() {
  app.innerHTML = `
    <div class="section-title">BFSI</div>
    <div class="subjects-section-title">Fächer auswählen</div>
    <div class="cards-container">${
      appData.subjects.map((sub, i) => `
        <div class="better-glow-card" onclick="showSubject(${i})">
          <span class="card-emoji">${subjectIcons[i] || '📚'}</span>
          <span class="card-label">${sub.name}</span>
          <span class="card-miniinfo" id="info-${i}">Lade...</span>
        </div>`
      ).join('')
    }</div>`;

  appData.subjects.forEach(async (sub, i) => {
    let qCount = 0, mCount = 0, zCount = 0;
    try {
      let r = await fetch(`data/${sub.folders.quiz}/index.json`);
      let idx = r.ok ? await r.json() : [];
      qCount = Array.isArray(idx) ? idx.length : 0;
    } catch {}
    try {
      let r = await fetch(`data/${sub.folders.material}/index.json`);
      let idx = r.ok ? await r.json() : [];
      mCount = Array.isArray(idx) ? idx.length : 0;
    } catch {}
    try {
      let r = await fetch(`data/${sub.folders.zusammenfassungen}/index.json`);
      let idx = r.ok ? await r.json() : [];
      zCount = Array.isArray(idx) ? idx.length : 0;
    } catch {}
    document.getElementById(`info-${i}`).textContent = `${qCount} Quiz | ${mCount} Material | ${zCount} ZF`;
  });
}

// Fachansicht mit neuen fetch-Checks
window.showSubject = function (idx) {
  const subject = appData.subjects[idx];
  let tab = 'quiz';
  render();

  function render(tabSel) {
    tab = tabSel || tab;
    app.innerHTML = `
      <div class="section-title">${subject.name}</div>
      <div class="tabs-row">
        <button class="tab-btn${tab === 'quiz' ? ' active' : ''}" onclick="tabSwitch('quiz')">Quiz</button>
        <button class="tab-btn${tab === 'train' ? ' active' : ''}" onclick="tabSwitch('train')">Quiz Einzelfragen</button>
        <button class="tab-btn${tab === 'material' ? ' active' : ''}" onclick="tabSwitch('material')">Lernmaterial</button>
        <button class="tab-btn${tab === 'summary' ? ' active' : ''}" onclick="tabSwitch('summary')">ZF</button>
      </div>
      <div id="subjectMain"></div>
      <div style="margin-top:2em;text-align:center">
        <button class="tab-btn" onclick="showSubjects()">Zurück</button>
      </div>`;
    renderTab();
  }
  window.tabSwitch = function (newTab) { render(newTab); }

  async function renderTab() {
    const container = document.getElementById('subjectMain');
    if (tab === 'quiz' || tab === 'train') {
      let idxJson = [];
      try {
        const r = await fetch(`data/${subject.folders.quiz}/index.json`);
        idxJson = r.ok ? await r.json() : [];
      } catch { idxJson = []; }
      if(idxJson.length === 0) {
        container.innerHTML = "<div style='text-align:center;color:#999;'>Keine Quiz-Themen verfügbar.</div>"; return;
      }
      container.innerHTML = `<div class="cards-container">${
        idxJson.map((q) =>
          `<div class="better-glow-card" style="padding:18px 8px 10px 8px;max-width:320px;" onclick="${tab==='quiz'?`showQuizFile('data/${subject.folders.quiz}/${q.filename}','${escapeHTML(subject.name)}')`:`showTrainFile('data/${subject.folders.quiz}/${q.filename}','${escapeHTML(subject.name)}')`}">
            <span class="card-label">${escapeHTML(q.name)}${tab==='train'?' (Einzelfragen)':''}</span>
            <div class="card-date">${escapeHTML(q.date)}</div>
          </div>`
        ).join('')
      }</div>`;
    } else if (tab === 'material') {
      let idxJson = [];
      try {
        const r = await fetch(`data/${subject.folders.material}/index.json`);
        idxJson = r.ok ? await r.json() : [];
      } catch { idxJson = []; }
      if(idxJson.length === 0) {
        container.innerHTML = "<div style='text-align:center;color:#999;'>Kein Lernmaterial verfügbar.</div>"; return;
      }
      container.innerHTML = `<div class="cards-material">${
        idxJson.map(mat =>
          `<div class="material-card">
            <span class="material-title">${escapeHTML(mat.title)}</span>
            <span class="material-date">${escapeHTML(mat.date)}</span>
            <button class="download-btn" onclick="window.open('data/${subject.folders.material}/${mat.filename}','_blank')">Download</button>
          </div>`
        ).join('')
      }</div>`;
    } else if (tab === 'summary') {
      let idxJson = [];
      try {
        const r = await fetch(`data/${subject.folders.zusammenfassungen}/index.json`);
        idxJson = r.ok ? await r.json() : [];
      } catch { idxJson = []; }
      if(idxJson.length === 0) {
        container.innerHTML = "<div style='text-align:center;color:#999;'>Keine Zusammenfassungen verfügbar.</div>"; return;
      }
      container.innerHTML = `<div class="cards-container">${
        idxJson.map((s) =>
          `<div class="better-glow-card" style="padding:18px 8px 10px 8px;max-width:320px;" onclick="showSummaryFile('data/${subject.folders.zusammenfassungen}/${s.filename}')">
            <span class="card-label">${escapeHTML(s.title)}</span>
            <div class="card-date">${escapeHTML(s.date)}</div>
          </div>`
        ).join('')
      }</div>`;
    }
  }
}

// Quiz aus Datei
window.showQuizFile = async function(jsonPath, subjectName) {
  try {
    const topic = await fetch(jsonPath).then(r => r.ok ? r.json() : Promise.reject('Not found'));
    if (!topic || !topic.questions || topic.questions.length === 0) {
      app.innerHTML = `<div class="section-title">Keine Quizfragen verfügbar</div>
      <div style="text-align:center; margin-top:2rem;">
        <button class="quiz-action-btn" onclick="showSubjects()">Zurück</button>
      </div>`;
      return;
    }
    let userAnswers = new Array(topic.questions.length).fill(null);
    let showResult = false;
    render();
    function render() { app.innerHTML = showResult ? renderResult() : renderQuiz(); }
    function renderQuiz() {
      let html = `<div class="section-title">${escapeHTML(subjectName)}</div>`;
      html += `<div class="quiz-question"><b>${escapeHTML(topic.name)}</b><br><span class="card-date">${escapeHTML(topic.date)}</span></div>`;
      topic.questions.forEach((q, i) => {
        if (!isQuestionValid(q)) return;
        html += `<div class="quiz-box"><div style="margin-bottom:7px;">Frage ${i + 1}: ${escapeHTML(q.question)}</div><div class="quiz-options">`;
        q.options.forEach((opt, oidx) => {
          let display = (typeof opt === "string" && opt.trim() !== '') ? escapeHTML(opt) : '[Antwort fehlt]';
          let isDisabled = (!opt || opt.trim() === '') ? 'disabled' : '';
          html += `<button class="quiz-opt-btn${userAnswers[i] === oidx ? ' selected' : ''}" onclick="select(${i},${oidx})" ${isDisabled}>${display}</button>`;
        });
        html += `</div></div>`;
      });
      html += `<div style="margin-top:1.1em" class="quiz-action-row"><button class="quiz-action-btn" onclick="submit()">Absenden</button><button class="quiz-action-btn secondary" onclick="showSubjects()">Zurück</button></div>`;
      return html;
    }
    function renderResult() {
      let score = 0;
      let html = `<div class="section-title">${escapeHTML(subjectName)}</div><div class="quiz-finish">Quiz abgeschlossen!</div><div class="quiz-score-details">`;
      topic.questions.forEach((q, i) => {
        if (!isQuestionValid(q)) return;
        const ua = userAnswers[i], cor = q.correct;
        if (ua === cor) score++;
        html += `<div class="quiz-box"><b>Frage ${i + 1}: ${escapeHTML(q.question)}</b><br>`;
        q.options.forEach((opt, j) => {
          let display = (typeof opt === "string" && opt.trim() !== '') ? escapeHTML(opt) : '[Antwort fehlt]';
          let sel = ua === j ? ' selected' : '';
          let corC = j === cor ? ' correct' : '';
          let inc = ua === j && ua !== cor ? ' incorrect' : '';
          html += `<span class="quiz-opt-btn${sel}${corC}${inc}" style="display:inline-block;min-width:80px;margin:2.5px 7px 2.5px 0;">${display}</span>`;
        });
        html += `</div>`;
      });
      html += `</div><div class="quiz-finish">Score: ${score} / ${topic.questions.length}</div>
      <div class="quiz-action-row"><button class="quiz-action-btn" onclick="showQuizFile('${jsonPath}','${escapeHTML(subjectName)}')">Wiederholen</button><button class="quiz-action-btn secondary" onclick="showSubjects()">Zurück</button></div>`;
      return html;
    }
    window.select = function(qIdx, oIdx) { userAnswers[qIdx] = oIdx; render(); }
    window.submit = function() { showResult = true; render(); }
  } catch {
    app.innerHTML = '<div style="text-align:center;color:#faa; padding:1rem;">Quiz konnte nicht geladen werden.</div>';
  }
};

// Einzelfragen-Lernen
window.showTrainFile = async function(jsonPath, subjectName) {
  try {
    const topic = await fetch(jsonPath).then(r => r.ok ? r.json() : Promise.reject('Not found'));
    if (!topic || !topic.questions || topic.questions.length === 0) {
      app.innerHTML = `<div class="section-title">Keine Quizfragen verfügbar</div>
      <div style="text-align:center; margin-top:2rem;">
        <button class="quiz-action-btn" onclick="showSubjects()">Zurück</button>
      </div>`;
      return;
    }
    let order = Array.from({ length: topic.questions.length }).map((_, i) => i);
    shuffle(order);
    let curr = 0, right = 0, state = { answer: null, end: false };
    renderQ();
    function renderQ() {
      if (state.end) {
        app.innerHTML = `
        <div class="section-title">${escapeHTML(subjectName)} - Einzelfrage</div>
        <div class="quiz-finish">Quiz abgeschlossen!</div>
        <div class="quiz-score-details">Richtig gelöst: ${right} / ${topic.questions.length}</div>
        <div class="quiz-action-row">
          <button class="quiz-action-btn" onclick="window.showTrainFile('${jsonPath}','${escapeHTML(subjectName)}')">Wiederholen</button>
          <button class="quiz-action-btn secondary" onclick="showSubjects()">Zurück</button>
        </div>`; return;
      }
      let qIdx = order[curr], q = topic.questions[qIdx];
      if (!isQuestionValid(q)) {
        app.innerHTML = `<div style="text-align:center;color:#faa;margin-top:20px;">Ungültige Frage Daten</div>`; return;
      }
      app.innerHTML = `
      <div class="section-title">${escapeHTML(subjectName)} - Einzelfrage</div>
      <div class="quiz-box">
        <div style="margin-bottom:7px;">Frage ${curr + 1}: ${escapeHTML(q.question)}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => {
              let display = (typeof opt === "string" && opt.trim() !== '') ? escapeHTML(opt) : '[Antwort fehlt]';
              let isDisabled = (!opt || opt.trim() === '') ? 'disabled' : '';
              let sel = state.answer === i ? (i === q.correct ? ' correct' : ' incorrect') : '';
              return `<button class="quiz-opt-btn${sel}" onclick="answer(${i})" ${isDisabled}>${display}</button>`;
          }).join('')}
        </div>
      </div>
      <div style="text-align:center; font-size:1.08em; margin:1em 0 0.7em 0;">Richtig gelöst: ${right} / ${topic.questions.length}</div>
      <div class="quiz-action-row">
        <button class="quiz-action-btn" onclick="window.showTrainFile('${jsonPath}','${escapeHTML(subjectName)}')">Wiederholen</button>
        <button class="quiz-action-btn secondary" onclick="showSubjects()">Zurück</button>
      </div>`;
    }
    window.answer = function(i) {
      if (state.answer !== null) return;
      let qIdx = order[curr];
      let q = topic.questions[qIdx];
      state.answer = i;
      if (i === q.correct) right++;
      setTimeout(() => {
        curr++;
        if (curr >= order.length) { state.end = true; }
        state.answer = null;
        renderQ();
      }, 1200);
      renderQ();
    };
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; --i) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  } catch {
    app.innerHTML = '<div style="text-align:center;color:#faa; padding:1rem;">Quiz konnte nicht geladen werden.</div>';
  }
}

// Zusammenfassung anzeigen: neue Datei/Ordner-Logik
window.showSummaryFile = async function(jsonPath) {
  try {
    const summary = await fetch(jsonPath).then(r => r.ok ? r.json() : Promise.reject('Not found'));
    app.innerHTML = `
      <div class="section-title">${escapeHTML(summary.title)}</div>
      <div class="quiz-box">
        <div style="margin-bottom: 1em;"><small>${escapeHTML(summary.date)}</small></div>
        <p style="line-height: 1.6; margin-bottom: 1.5em;">${escapeHTML(summary.summaryText)}</p>
        ${summary.glossar && summary.glossar.length > 0 ? `
          <h4 style="color: #41d6bc; margin-bottom: 1em;">Glossar</h4>
          <div class="glossar-container">
            ${summary.glossar.map(item => `
              <div class="glossar-item">
                <strong style="color: #16c8ee;">${escapeHTML(item.term)}:</strong> 
                ${escapeHTML(item.definition)}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="quiz-action-row">
        <button class="quiz-action-btn secondary" onclick="showSubjects()">Zurück</button>
      </div>
    `;
  } catch {
    app.innerHTML = '<div style="text-align:center;color:#faa; padding:1rem;">Zusammenfassung konnte nicht geladen werden</div>';
  }
}
