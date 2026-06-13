const STORAGE_KEY = 'todoItems';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyMsg = document.getElementById('emptyMsg');

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const tasks = loadTasks();
  taskList.innerHTML = '';
  emptyMsg.hidden = tasks.length > 0;

  tasks.forEach(function(task, index) {
    const li = document.createElement('li');
    li.textContent = task;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Kustuta';
    deleteBtn.className = 'delete';
    deleteBtn.addEventListener('click', function() {
      deleteTask(index);
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = loadTasks();
  tasks.push(text);
  saveTasks(tasks);
  taskInput.value = '';
  renderTasks();
}

function deleteTask(index) {
  const tasks = loadTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') addTask();
});

renderTasks();
