const PRIZES = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000,
];
const SAFE_LEVELS = [5, 10, 15];

const app = document.getElementById('app');

const state = {
  questions: [],
  questionBank: [],
  solutionFiles: [],
  taskTitle: '',
  taskId: null,
  index: 0,
  selected: null,
  locked: false,
  lifelines: { fifty: true, hint: true, audience: true },
  removed: [],
  answers: [],
};

function renderTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function renderMarkdown(md) {
  var lines = md.split('\n');
  var out = [];
  var inCode = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^```/.test(line)) {
      inCode = !inCode;
      out.push(inCode ? '<pre><code>' : '</code></pre>');
      continue;
    }
    if (inCode) { out.push(escapeHtml(line)); continue; }
    if (/^### (.+)/.test(line)) out.push('<h3>' + escapeHtml(RegExp.$1) + '</h3>');
    else if (/^## (.+)/.test(line)) out.push('<h2>' + escapeHtml(RegExp.$1) + '</h2>');
    else if (/^# (.+)/.test(line)) out.push('<h1>' + escapeHtml(RegExp.$1) + '</h1>');
    else if (/^- (.+)/.test(line)) out.push('<li>' + escapeHtml(RegExp.$1).replace(/`([^`]+)`/g, '<code>$1</code>') + '</li>');
    else if (line.trim() === '') out.push('');
    else out.push('<p>' + escapeHtml(line).replace(/`([^`]+)`/g, '<code>$1</code>') + '</p>');
  }
  return out.join('\n').replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, function(m) { return '<ul>' + m + '</ul>'; });
}

function shuffle(arr) {
  var out = arr.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}

async function showTaskList() {
  app.innerHTML = '';
  app.appendChild(renderTemplate('taskListTemplate'));
  var list = document.getElementById('taskList');
  var emptyState = document.getElementById('taskListEmpty');

  try {
    var res = await fetch('data/manifest.json');
    if (!res.ok) throw new Error('manifest.json ei leitud (' + res.status + ')');
    var data = await res.json();
    var assignments = data.assignments || [];

    if (!assignments.length) {
      emptyState.classList.remove('hidden');
      return;
    }

    assignments.forEach(function(task) {
      var li = document.createElement('li');
      li.innerHTML =
        '<span class="task-id">' + escapeHtml(task.id) + '</span>' +
        '<span class="task-title">' + escapeHtml(task.name) + '</span>' +
        '<span class="muted">▸</span>';
      li.addEventListener('click', function() { showTaskDetail(task.id, task.name); });
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = '<li class="muted">Viga: ' + escapeHtml(err.message) + '</li>';
  }
}

async function showTaskDetail(taskId, taskName) {
  app.innerHTML = '';
  app.appendChild(renderTemplate('taskDetailTemplate'));
  document.querySelector('[data-action="back"]').addEventListener('click', showTaskList);

  var titleEl = document.getElementById('taskTitle');
  var filesEl = document.getElementById('solutionFileSummary');
  var startBtn = document.getElementById('startGameBtn');

  titleEl.textContent = taskName || taskId;

  try {
    var res = await fetch('data/' + taskId + '/data.json');
    if (!res.ok) throw new Error('data.json ei leitud (' + res.status + ')');
    var data = await res.json();
    var solutionFiles = data.solutionFiles || [];

    filesEl.textContent = solutionFiles.length
      ? 'Lahendus sisaldab faile: ' + solutionFiles.map(function(file) { return file.path; }).join(', ')
      : 'Lahendusfaile ei leitud.';
    state.questionBank = data.questions || [];
    state.solutionFiles = solutionFiles;
    state.taskId = taskId;
    state.taskTitle = taskName || taskId;

    startBtn.addEventListener('click', function() {
      var questions = state.questionBank.slice(0, 15);
      if (!questions.length) {
        startBtn.disabled = true;
        startBtn.textContent = 'Küsimustepank puudub';
        return;
      }
      startGame(questions);
    });
  } catch (err) {
    titleEl.textContent = 'Viga teema laadimisel';
    filesEl.textContent = err.message;
    startBtn.disabled = true;
  }
}

function renderCodePanel() {
  var tabs = document.getElementById('codeTabs');
  var code = document.getElementById('solutionCode');
  tabs.innerHTML = '';

  if (!state.solutionFiles.length) {
    code.textContent = 'Lahendusfaile ei leitud.';
    return;
  }

  function showFile(selectedIndex) {
    code.textContent = state.solutionFiles[selectedIndex].content;
    tabs.querySelectorAll('button').forEach(function(button, index) {
      var active = index === selectedIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  state.solutionFiles.forEach(function(file, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = file.path;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', function() { showFile(index); });
    tabs.appendChild(button);
  });

  showFile(0);
}

function startGame(questions) {
  state.questions = questions;
  state.index = 0;
  state.selected = null;
  state.locked = false;
  state.lifelines = { fifty: true, hint: true, audience: true };
  state.removed = [];
  state.answers = [];

  app.innerHTML = '';
  app.appendChild(renderTemplate('gameTemplate'));

  document.getElementById('quitBtn').addEventListener('click', function() {
    if (confirm('Lahkuda mängust? Tulemuseks jääb seni teenitud punktisumma.')) {
      finishGame({ reason: 'quit' });
    }
  });
  document.getElementById('confirmBtn').addEventListener('click', confirmAnswer);
  document.querySelectorAll('[data-lifeline]').forEach(function(btn) {
    btn.addEventListener('click', function() { useLifeline(btn.dataset.lifeline); });
  });

  renderCodePanel();
  renderLadder();
  renderQuestion();
  syncLifelineButtons();
}

function renderLadder() {
  var ladder = document.getElementById('ladder');
  ladder.innerHTML = '';
  for (var i = PRIZES.length - 1; i >= 0; i--) {
    var li = document.createElement('li');
    var level = i + 1;
    li.dataset.level = level;
    if (SAFE_LEVELS.includes(level)) li.classList.add('safe');
    if (level === state.index + 1) li.classList.add('current');
    if (level <= state.index) li.classList.add('passed');
    li.innerHTML = '<span>' + level + '.</span><span>' + PRIZES[i].toLocaleString('et-EE') + ' p</span>';
    ladder.appendChild(li);
  }
}

function renderQuestion() {
  var q = state.questions[state.index];
  document.getElementById('qIndex').textContent = state.index + 1;
  document.getElementById('qPrize').textContent = PRIZES[state.index].toLocaleString('et-EE') + ' punkti';

  var nextSafe = SAFE_LEVELS.find(function(s) { return state.index + 1 <= s; });
  document.getElementById('qSafe').textContent = nextSafe
    ? 'Järgmine turvatase: ' + nextSafe + '. küsimus'
    : 'Lõpufiniš!';

  document.getElementById('questionText').textContent = q.question;

  var optsList = document.getElementById('optionsList');
  optsList.innerHTML = '';
  state.selected = null;
  state.locked = false;
  state.removed = [];

  var confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Kinnita vastus';
  confirmBtn.onclick = null;
  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('lifelineOutput').classList.add('hidden');

  q.options.forEach(function(opt, idx) {
    var li = document.createElement('li');
    li.dataset.idx = idx;
    li.innerHTML = '<span class="marker">' + 'ABCD'[idx] + '</span><span>' + escapeHtml(opt) + '</span>';
    li.addEventListener('click', function() { selectOption(idx); });
    optsList.appendChild(li);
  });

  renderLadder();
  syncLifelineButtons();
}

function selectOption(idx) {
  if (state.locked) return;
  if (state.removed.includes(idx)) return;
  state.selected = idx;
  document.querySelectorAll('#optionsList li').forEach(function(li) {
    li.classList.toggle('selected', Number(li.dataset.idx) === idx);
  });
  document.getElementById('confirmBtn').disabled = false;
}

function confirmAnswer() {
  if (state.selected === null || state.locked) return;
  state.locked = true;

  var q = state.questions[state.index];
  var correct = state.selected === q.correctIndex;

  document.querySelectorAll('#optionsList li').forEach(function(li) {
    var idx = Number(li.dataset.idx);
    li.classList.add('locked');
    if (idx === q.correctIndex) li.classList.add('correct');
    if (idx === state.selected && !correct) li.classList.add('wrong');
  });

  state.answers.push({
    question: q.question,
    chosen: q.options[state.selected],
    correct: q.options[q.correctIndex],
    isCorrect: correct,
    explanation: q.explanation,
  });

  var feedback = document.getElementById('feedback');
  feedback.classList.remove('hidden');
  feedback.classList.toggle('correct', correct);
  feedback.classList.toggle('wrong', !correct);
  feedback.innerHTML = '<strong>' + (correct ? '✓ Õige!' : '✗ Vale!') + '</strong> ' + escapeHtml(q.explanation || '');

  var confirmBtn = document.getElementById('confirmBtn');
  var isLastCorrect = correct && state.index === PRIZES.length - 1;

  if (!correct) {
    confirmBtn.textContent = 'Vaata tulemust';
  } else if (isLastCorrect) {
    confirmBtn.textContent = 'Vaata võitu 🏆';
  } else {
    confirmBtn.textContent = 'Edasi →';
  }
  confirmBtn.disabled = false;
  confirmBtn.onclick = function() {
    if (!correct) { finishGame({ reason: 'wrong' }); return; }
    if (isLastCorrect) { finishGame({ reason: 'won' }); return; }
    state.index += 1;
    renderQuestion();
  };
}

function useLifeline(name) {
  if (!state.lifelines[name] || state.locked) return;
  var q = state.questions[state.index];

  if (name === 'fifty') {
    var wrongIdxs = shuffle([0, 1, 2, 3].filter(function(i) { return i !== q.correctIndex; }));
    state.removed = wrongIdxs.slice(0, 2);
    document.querySelectorAll('#optionsList li').forEach(function(li) {
      if (state.removed.includes(Number(li.dataset.idx))) li.classList.add('disabled');
    });
    state.lifelines.fifty = false;

  } else if (name === 'hint') {
    var out = document.getElementById('lifelineOutput');
    out.classList.remove('hidden');
    out.innerHTML = '<strong>Vihje:</strong> ' + escapeHtml(q.hint || 'Vihjet pole saadaval.');
    state.lifelines.hint = false;

  } else if (name === 'audience') {
    var dist = audienceVote(q, state.index);
    var out2 = document.getElementById('lifelineOutput');
    out2.classList.remove('hidden');
    out2.innerHTML = '<strong>Publik hääletas:</strong>' + audienceBars(dist);
    state.lifelines.audience = false;
  }

  syncLifelineButtons();
}

function syncLifelineButtons() {
  document.querySelectorAll('[data-lifeline]').forEach(function(btn) {
    btn.classList.toggle('used', !state.lifelines[btn.dataset.lifeline]);
  });
}

function audienceVote(q, level) {
  var correctConfidence = Math.max(0.35, 0.85 - level * 0.03);
  var dist = [0, 0, 0, 0];
  dist[q.correctIndex] = Math.round(correctConfidence * 100);
  var remaining = 100 - dist[q.correctIndex];
  var others = shuffle([0, 1, 2, 3].filter(function(i) { return i !== q.correctIndex; }));
  others.forEach(function(i, k) {
    if (k === others.length - 1) {
      dist[i] = remaining;
    } else {
      var portion = Math.round(remaining * (0.3 + Math.random() * 0.4));
      dist[i] = portion;
      remaining -= portion;
    }
  });
  return dist;
}

function audienceBars(dist) {
  return '<div class="audience-bars">' + dist.map(function(v, i) {
    return '<div><span>' + 'ABCD'[i] + '</span><span class="bar"><span style="width:' + v + '%"></span></span><span>' + v + '%</span></div>';
  }).join('') + '</div>';
}

function finishGame(opts) {
  var reason = opts.reason;
  var earned;
  if (reason === 'won') {
    earned = PRIZES[PRIZES.length - 1];
  } else if (reason === 'quit') {
    earned = state.index === 0 ? 0 : PRIZES[state.index - 1];
  } else {
    var lastSafe = SAFE_LEVELS.filter(function(s) { return s <= state.index; }).pop();
    earned = lastSafe ? PRIZES[lastSafe - 1] : 0;
  }

  app.innerHTML = '';
  app.appendChild(renderTemplate('resultTemplate'));

  var heading = document.getElementById('resultHeading');
  heading.textContent = reason === 'won'
    ? '🏆 Miljon punkti!'
    : reason === 'quit'
    ? 'Lahkusid mängust'
    : '✗ Vale vastus — mäng lõppes';
  document.getElementById('resultMessage').textContent = reason === 'won'
    ? 'Vastasid kõigile 15 küsimusele õigesti!'
    : '';
  document.getElementById('resultPrize').textContent = earned.toLocaleString('et-EE');

  document.getElementById('playAgainBtn').addEventListener('click', function() {
    startGame(state.questionBank.slice(0, 15));
  });
  document.getElementById('backToListBtn').addEventListener('click', showTaskList);
}

showTaskList();
