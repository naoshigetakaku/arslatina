// ── Navigation ────────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function makeTableWrap(caption, noteText, headCols, rows) {
  const wrap = el('div', 'table-wrap');
  const table = el('table');
  const cap = el('caption');
  cap.innerHTML = caption + (noteText ? `<span class="tense-note">${noteText}</span>` : '');
  table.appendChild(cap);

  const thead = el('thead');
  const headTr = el('tr');
  headCols.forEach(h => { const th = el('th'); th.textContent = h; headTr.appendChild(th); });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = el('tbody');
  rows.forEach(row => {
    const tr = el('tr');
    row.forEach((cell, i) => {
      const td = el('td');
      td.innerHTML = cell;
      if (i > 0) td.className = 'form-cell';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrong(pool, correct, count) {
  const others = pool.filter(x => x !== correct);
  return shuffle(others).slice(0, count);
}

// ── VERBS ─────────────────────────────────────────────────────────────────────
const verbConjSel  = document.getElementById('verb-conj-select');
const verbMoodSel  = document.getElementById('verb-mood-select');
const verbTenseSel = document.getElementById('verb-tense-select');
const verbEndTog   = document.getElementById('verb-endings-toggle');
const verbDisplay  = document.getElementById('verb-display');

function renderVerbs() {
  const key  = verbConjSel.value;
  const mood = verbMoodSel.value;
  const tenseKey = verbTenseSel.value;
  const endingsOnly = verbEndTog.checked;
  const vd = VERB_DATA[key];
  if (!vd) return;

  verbDisplay.innerHTML = '';

  // Header
  const hdr = el('div', 'verb-header');
  hdr.innerHTML = `<div class="lemma">${vd.lemma}</div><div class="meaning">${vd.meaning}</div>`;
  if (vd.note) hdr.innerHTML += `<div class="note">${vd.note}</div>`;
  verbDisplay.appendChild(hdr);

  if (mood === 'indicative' || mood === 'subjunctive') {
    const moodData = vd[mood];
    if (!moodData) {
      verbDisplay.appendChild(el('p', null, '<em>No ' + mood + ' forms for this verb.</em>'));
      return;
    }
    const keys = (tenseKey === 'all') ? Object.keys(moodData) : [tenseKey];
    keys.forEach(k => {
      const t = moodData[k];
      if (!t) return;
      const dataRows = PERSONS.map((p, i) => [
        p,
        endingsOnly ? `<span class="ending-cell">${t.endings[i]}</span>` : t.forms[i],
      ]);
      const note = t.note || '';
      verbDisplay.appendChild(makeTableWrap(t.name, note, ['Person', 'Form'], dataRows));
    });
  } else if (mood === 'imperative') {
    const imp = vd.imperative;
    if (!imp) {
      verbDisplay.appendChild(el('p', null, '<em>No imperative for this verb.</em>'));
      return;
    }
    const rows = [];
    if (imp.active) {
      rows.push(['2nd sg. (active)', imp.active.singular]);
      rows.push(['2nd pl. (active)', imp.active.plural]);
    }
    if (imp.passive) {
      rows.push(['2nd sg. (passive)', imp.passive.singular]);
      rows.push(['2nd pl. (passive)', imp.passive.plural]);
    }
    if (imp.active && imp.active.note) {
      verbDisplay.appendChild(el('p', 'decl-note', `Note: ${imp.active.note}`));
    }
    verbDisplay.appendChild(makeTableWrap('Imperative', '', ['Number', 'Form'], rows));
  } else if (mood === 'nonfinite') {
    const grid = el('div', 'nonfinite-grid');

    // Infinitives
    if (vd.infinitives && vd.infinitives.length) {
      const card = el('div', 'nonfinite-card');
      card.appendChild(el('h4', null, 'Infinitives'));
      const ul = el('ul');
      vd.infinitives.forEach(inf => {
        const li = el('li');
        li.innerHTML = `<span class="nf-label">${inf.label}</span><span class="nf-form">${inf.form}</span>`;
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    }

    // Participles
    if (vd.participles && vd.participles.length) {
      const card = el('div', 'nonfinite-card');
      card.appendChild(el('h4', null, 'Participles'));
      const ul = el('ul');
      vd.participles.forEach(p => {
        const li = el('li');
        li.innerHTML = `<span class="nf-label">${p.label}</span><span class="nf-form">${p.form}</span>`;
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    }

    // Gerund
    if (vd.gerund) {
      const card = el('div', 'nonfinite-card');
      card.appendChild(el('h4', null, 'Gerund (verbal noun)'));
      const ul = el('ul');
      const g = vd.gerund;
      [['Genitive', g.gen], ['Dative', g.dat], ['Accusative', g.acc], ['Ablative', g.abl]].forEach(([lbl, form]) => {
        const li = el('li');
        li.innerHTML = `<span class="nf-label">${lbl}</span><span class="nf-form">${form}</span>`;
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    }

    verbDisplay.appendChild(grid);
  }
}

verbConjSel.addEventListener('change', renderVerbs);
verbMoodSel.addEventListener('change', renderVerbs);
verbTenseSel.addEventListener('change', renderVerbs);
verbEndTog.addEventListener('change', renderVerbs);
renderVerbs();

// ── NOUNS ─────────────────────────────────────────────────────────────────────
const nounDeclSel = document.getElementById('noun-decl-select');
const nounEndTog  = document.getElementById('noun-endings-toggle');
const nounDisplay = document.getElementById('noun-display');

function renderNouns() {
  const key = nounDeclSel.value;
  const endingsOnly = nounEndTog.checked;
  const nd = NOUN_DATA[key];
  if (!nd) return;
  nounDisplay.innerHTML = '';

  const hdr = el('div', 'decl-header');
  hdr.innerHTML = `<div class="decl-name">${nd.name}</div>
    <div class="decl-meta">Gender: <strong>${nd.gender}</strong> &nbsp;|&nbsp; Stem: <strong>${nd.stem}</strong> &nbsp;|&nbsp; Example: <em>${nd.example}</em> — ${nd.meaning}</div>`;
  if (nd.notes) hdr.innerHTML += `<div class="decl-note">${nd.notes}</div>`;
  nounDisplay.appendChild(hdr);

  const src = endingsOnly ? nd.endings : { singular: nd.singular, plural: nd.plural };
  const rows = CASES.map(c => [
    c,
    `<span class="${endingsOnly ? 'ending-cell' : 'form-cell'}">${src.singular[c]}</span>`,
    `<span class="${endingsOnly ? 'ending-cell' : 'form-cell'}">${src.plural[c]}</span>`,
  ]);
  nounDisplay.appendChild(makeTableWrap(
    `${nd.example} — ${endingsOnly ? 'Endings' : 'Full forms'}`,
    '',
    ['Case', 'Singular', 'Plural'],
    rows
  ));
}

nounDeclSel.addEventListener('change', renderNouns);
nounEndTog.addEventListener('change', renderNouns);
renderNouns();

// ── ADJECTIVES ────────────────────────────────────────────────────────────────
const adjTypeSel  = document.getElementById('adj-type-select');
const adjEndTog   = document.getElementById('adj-endings-toggle');
const adjDisplay  = document.getElementById('adj-display');

function renderAdj() {
  const key = adjTypeSel.value;
  const endingsOnly = adjEndTog.checked;
  const ad = ADJ_DATA[key];
  if (!ad) return;
  adjDisplay.innerHTML = '';

  const hdr = el('div', 'decl-header');
  hdr.innerHTML = `<div class="decl-name">${ad.name}</div>
    <div class="decl-meta">Example: <em>${ad.example}</em> — ${ad.meaning}</div>`;
  if (ad.note) hdr.innerHTML += `<div class="decl-note">${ad.note}</div>`;
  adjDisplay.appendChild(hdr);

  const genders = ['masculine', 'feminine', 'neuter'];
  const genderLabels = { masculine: 'Masculine', feminine: 'Feminine', neuter: 'Neuter' };

  const wrap = el('div', 'table-wrap');
  const table = el('table');
  const cap = el('caption');
  cap.textContent = `${ad.example} — ${endingsOnly ? 'Endings' : 'Full forms'}`;
  table.appendChild(cap);

  const thead = el('thead');
  const headTr = el('tr');
  ['Case', 'Masc. sg.', 'Masc. pl.', 'Fem. sg.', 'Fem. pl.', 'Neut. sg.', 'Neut. pl.'].forEach(h => {
    headTr.appendChild(el('th', null, h));
  });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = el('tbody');
  CASES.forEach(c => {
    const tr = el('tr');
    const caseTd = el('td');
    caseTd.textContent = c;
    tr.appendChild(caseTd);
    genders.forEach(g => {
      if (!ad[g]) return;
      ['singular', 'plural'].forEach(n => {
        const td = el('td');
        td.className = endingsOnly ? 'ending-cell' : 'form-cell';
        td.textContent = ad[g][n][c] || '—';
        tr.appendChild(td);
      });
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  adjDisplay.appendChild(wrap);
}

adjTypeSel.addEventListener('change', renderAdj);
adjEndTog.addEventListener('change', renderAdj);
renderAdj();

// ── VOCABULARY ────────────────────────────────────────────────────────────────
const vocabCatSel = document.getElementById('vocab-cat-select');
const vocabSearch = document.getElementById('vocab-search');
const vocabDisplay = document.getElementById('vocab-display');

function renderVocab() {
  const cat = vocabCatSel.value;
  const q = vocabSearch.value.toLowerCase().trim();
  vocabDisplay.innerHTML = '';

  const filtered = VOCAB_DATA.filter(v => {
    const catMatch = (cat === 'all') || (v.category === cat);
    const searchMatch = !q || v.latin.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  if (!filtered.length) {
    vocabDisplay.appendChild(el('p', null, '<em>No entries found.</em>'));
    return;
  }

  filtered.forEach(v => {
    const card = el('div', 'vocab-card');
    const badge = v.conj || v.declension || '';
    card.innerHTML = `
      <div class="v-latin">${v.latin}</div>
      ${badge ? `<span class="v-badge">${badge}</span>` : ''}
      ${v.gender ? `<div class="v-meta">${v.gender}${v.category === 'nouns' ? '' : ''}</div>` : ''}
      <div class="v-meaning">${v.meaning}</div>`;
    vocabDisplay.appendChild(card);
  });
}

vocabCatSel.addEventListener('change', renderVocab);
vocabSearch.addEventListener('input', renderVocab);
renderVocab();

// ── SENTENCES ─────────────────────────────────────────────────────────────────
const sentCatSel  = document.getElementById('sent-cat-select');
const sentHideTog = document.getElementById('sent-hide-toggle');
const sentDisplay = document.getElementById('sentences-display');

function renderSentences() {
  const cat = sentCatSel.value;
  const hide = sentHideTog.checked;
  sentDisplay.innerHTML = '';

  const filtered = SENTENCE_DATA.filter(s => cat === 'all' || s.category === cat);
  filtered.forEach(s => {
    const card = el('div', 'sent-card');
    card.innerHTML = `
      <div class="s-latin">${s.latin}</div>
      <div class="s-translation ${hide ? 'hidden' : ''}">${s.translation}</div>
      ${s.source ? `<div class="s-source">— ${s.source}</div>` : ''}
      ${s.notes ? `<div class="s-note">${s.notes}</div>` : ''}`;
    sentDisplay.appendChild(card);
  });
}

sentCatSel.addEventListener('change', renderSentences);
sentHideTog.addEventListener('change', renderSentences);
renderSentences();

// ── QUIZ ──────────────────────────────────────────────────────────────────────
const quizTypeSel  = document.getElementById('quiz-type-select');
const quizCountSel = document.getElementById('quiz-count-select');
const quizStartBtn = document.getElementById('quiz-start-btn');
const quizSetup    = document.getElementById('quiz-setup');
const quizArena    = document.getElementById('quiz-arena');
const quizResults  = document.getElementById('quiz-results');
const quizProgress = document.getElementById('quiz-progress-bar');
const quizScoreLine= document.getElementById('quiz-score-line');
const quizPrompt   = document.getElementById('quiz-prompt');
const quizChoices  = document.getElementById('quiz-choices');
const quizFeedback = document.getElementById('quiz-feedback');
const quizNextBtn  = document.getElementById('quiz-next-btn');
const quizRestartBtn = document.getElementById('quiz-restart-btn');
const quizFinalScore = document.getElementById('quiz-final-score');
const quizReviewList = document.getElementById('quiz-review-list');
const quizAgainBtn = document.getElementById('quiz-again-btn');

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizReview = [];

// ── Question generators ───────────────────────────────────────────────────────

function genVocabL2E(count) {
  const pool = shuffle(VOCAB_DATA).slice(0, count);
  return pool.map(item => {
    const wrong = pickWrong(VOCAB_DATA.map(v => v.meaning), item.meaning, 3);
    const choices = shuffle([item.meaning, ...wrong]);
    return {
      prompt: `What is the meaning of: <em>${item.latin}</em>?`,
      correct: item.meaning,
      choices,
    };
  });
}

function genVocabE2L(count) {
  const pool = shuffle(VOCAB_DATA).slice(0, count);
  return pool.map(item => {
    const wrong = pickWrong(VOCAB_DATA.map(v => v.latin), item.latin, 3);
    const choices = shuffle([item.latin, ...wrong]);
    return {
      prompt: `Which Latin word means: <strong>${item.meaning}</strong>?`,
      correct: item.latin,
      choices,
    };
  });
}

function genNounFormQuiz(count) {
  const qs = [];
  const declKeys = Object.keys(NOUN_DATA);
  for (let i = 0; i < count; i++) {
    const dk = declKeys[Math.floor(Math.random() * declKeys.length)];
    const nd = NOUN_DATA[dk];
    const num = Math.random() < .5 ? 'singular' : 'plural';
    const c = CASES[Math.floor(Math.random() * CASES.length)];
    const form = nd[num][c];
    // all forms as wrong-answer pool
    const allForms = [];
    declKeys.forEach(k => {
      ['singular','plural'].forEach(n => CASES.forEach(cas => allForms.push(NOUN_DATA[k][n][cas])));
    });
    const wrong = pickWrong(allForms, form, 3);
    qs.push({
      prompt: `<em>${nd.example}</em> (${nd.meaning})<br>Give the <strong>${c} ${num}</strong>:`,
      correct: form,
      choices: shuffle([form, ...wrong]),
    });
  }
  return qs;
}

function genVerbFormQuiz(count) {
  const qs = [];
  const conjKeys = Object.keys(VERB_DATA);
  const moods = ['indicative', 'subjunctive'];
  for (let i = 0; i < count; i++) {
    const ck = conjKeys[Math.floor(Math.random() * conjKeys.length)];
    const vd = VERB_DATA[ck];
    const moodKey = moods[Math.floor(Math.random() * moods.length)];
    const moodData = vd[moodKey];
    if (!moodData) { i--; continue; }
    const tKeys = Object.keys(moodData);
    const tk = tKeys[Math.floor(Math.random() * tKeys.length)];
    const t = moodData[tk];
    const pi = Math.floor(Math.random() * 6);
    const form = t.forms[pi];
    if (!form || form === '-') { i--; continue; }
    const allForms = [];
    conjKeys.forEach(k => {
      moods.forEach(m => {
        if (VERB_DATA[k][m]) Object.values(VERB_DATA[k][m]).forEach(td => allForms.push(...td.forms));
      });
    });
    const wrong = pickWrong(allForms.filter(f => f && f !== '-'), form, 3);
    qs.push({
      prompt: `<em>${vd.lemma}</em> (${vd.meaning})<br><strong>${t.name}</strong>, ${PERSONS[pi]}:`,
      correct: form,
      choices: shuffle([form, ...wrong]),
    });
  }
  return qs;
}

function genProduceNounQuiz(count) {
  return genNounFormQuiz(count);
}

function genProduceVerbQuiz(count) {
  return genVerbFormQuiz(count);
}

function genSentenceQuiz(count) {
  const pool = shuffle(SENTENCE_DATA).slice(0, count);
  return pool.map(s => {
    const wrong = pickWrong(SENTENCE_DATA.map(x => x.translation), s.translation, 3);
    return {
      prompt: `Translate: <em>${s.latin}</em>`,
      correct: s.translation,
      choices: shuffle([s.translation, ...wrong]),
    };
  });
}

function buildQuestions(type, count) {
  switch (type) {
    case 'vocab-l2e':     return genVocabL2E(count);
    case 'vocab-e2l':     return genVocabE2L(count);
    case 'noun-form':     return genNounFormQuiz(count);
    case 'verb-form':     return genVerbFormQuiz(count);
    case 'produce-noun':  return genProduceNounQuiz(count);
    case 'produce-verb':  return genProduceVerbQuiz(count);
    case 'sentence':      return genSentenceQuiz(count);
    case 'mixed': {
      const generators = [genVocabL2E, genVocabE2L, genNounFormQuiz, genVerbFormQuiz, genSentenceQuiz];
      const perGen = Math.ceil(count / generators.length);
      let all = [];
      generators.forEach(g => { all = all.concat(g(perGen)); });
      return shuffle(all).slice(0, count);
    }
    default: return genVocabL2E(count);
  }
}

// ── Quiz UI ───────────────────────────────────────────────────────────────────

function startQuiz() {
  const type  = quizTypeSel.value;
  const count = parseInt(quizCountSel.value, 10);
  quizQuestions = buildQuestions(type, count);
  quizIndex = 0;
  quizScore = 0;
  quizReview = [];

  quizSetup.style.display = 'none';
  quizResults.style.display = 'none';
  quizArena.style.display = 'block';
  showQuestion();
}

function showQuestion() {
  const q = quizQuestions[quizIndex];
  const total = quizQuestions.length;

  quizProgress.style.width = `${(quizIndex / total) * 100}%`;
  quizScoreLine.textContent = `Question ${quizIndex + 1} / ${total} — Score: ${quizScore}`;
  quizPrompt.innerHTML = q.prompt;
  quizFeedback.textContent = '';
  quizFeedback.className = '';
  quizNextBtn.style.display = 'none';
  quizRestartBtn.style.display = 'none';

  quizChoices.innerHTML = '';
  q.choices.forEach(ch => {
    const btn = el('button', 'choice-btn');
    btn.innerHTML = ch;
    btn.addEventListener('click', () => handleAnswer(btn, ch, q));
    quizChoices.appendChild(btn);
  });
}

function handleAnswer(btn, chosen, q) {
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  const correct = chosen === q.correct;

  if (correct) {
    btn.classList.add('correct');
    quizScore++;
    quizFeedback.textContent = 'Correct!';
    quizFeedback.className = 'correct-fb';
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (b.innerHTML === q.correct) b.classList.add('correct');
    });
    quizFeedback.innerHTML = `Incorrect. The answer is: <strong>${q.correct}</strong>`;
    quizFeedback.className = 'wrong-fb';
  }

  quizReview.push({ prompt: q.prompt, correct: q.correct, given: chosen, ok: correct });

  const isLast = quizIndex === quizQuestions.length - 1;
  quizNextBtn.textContent = isLast ? 'See Results' : 'Next';
  quizNextBtn.style.display = 'inline-block';
  quizRestartBtn.style.display = 'inline-block';
}

quizNextBtn.addEventListener('click', () => {
  quizIndex++;
  if (quizIndex >= quizQuestions.length) {
    showResults();
  } else {
    showQuestion();
  }
});

quizRestartBtn.addEventListener('click', () => {
  quizArena.style.display = 'none';
  quizSetup.style.display = 'flex';
});

function showResults() {
  quizArena.style.display = 'none';
  quizResults.style.display = 'block';
  const pct = Math.round((quizScore / quizQuestions.length) * 100);
  quizFinalScore.textContent = `${quizScore} / ${quizQuestions.length} correct (${pct}%)`;
  quizReviewList.innerHTML = '';
  quizReview.forEach(r => {
    const div = el('div', `review-item ${r.ok ? 'correct-item' : 'wrong-item'}`);
    div.innerHTML = `<span class="ri-icon">${r.ok ? '✓' : '✗'}</span>
      <span class="ri-text"><em>${r.prompt.replace(/<[^>]+>/g, ' ').trim()}</em>
        ${r.ok ? '' : `— Your answer: <strong>${r.given}</strong> | Correct: <strong>${r.correct}</strong>`}
      </span>`;
    quizReviewList.appendChild(div);
  });
}

quizStartBtn.addEventListener('click', startQuiz);
quizAgainBtn.addEventListener('click', () => {
  quizResults.style.display = 'none';
  quizSetup.style.display = 'flex';
});
