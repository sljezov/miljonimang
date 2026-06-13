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
      startBtn.disabled = true;
      startBtn.textContent = 'Mängu käivitamine lisatakse järgmises arenduskorras...';
    });
  } catch (err) {
    titleEl.textContent = 'Viga teema laadimisel';
    filesEl.textContent = err.message;
    startBtn.disabled = true;
  }
}

showTaskList();
