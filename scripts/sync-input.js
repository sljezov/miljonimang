const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'input');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'vendor',
  'dist',
  'build',
  '__pycache__',
]);

function readTaskDirectories() {
  return fs.readdirSync(INPUT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function readFilesRecursively(directory, baseDirectory = directory) {
  const files = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

  for (const entry of entries) {
    if (entry.name === 'assignment.md') continue;
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...readFilesRecursively(absolutePath, baseDirectory));
      continue;
    }

    if (!entry.isFile()) continue;

    const content = fs.readFileSync(absolutePath);
    if (content.includes(0)) {
      console.warn(`Jäeti vahele binaarfail: ${path.relative(ROOT, absolutePath)}`);
      continue;
    }

    files.push({
      path: path.relative(baseDirectory, absolutePath).split(path.sep).join('/'),
      content: content.toString('utf8'),
    });
  }

  return files;
}

function extractTitle(assignment, fallback) {
  const heading = assignment.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

function readExistingData(filePath) {
  if (!fs.existsSync(filePath)) return {};

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Vigane JSON failis ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function syncTask(taskId) {
  const taskDirectory = path.join(INPUT_DIR, taskId);
  const assignmentPath = path.join(taskDirectory, 'assignment.md');

  if (!fs.existsSync(assignmentPath)) {
    throw new Error(`Puudub kohustuslik fail: input/${taskId}/assignment.md`);
  }

  const assignment = fs.readFileSync(assignmentPath, 'utf8').trim();
  const solutionFiles = readFilesRecursively(taskDirectory);
  const outputDirectory = path.join(DATA_DIR, taskId);
  const outputPath = path.join(outputDirectory, 'data.json');
  const existing = readExistingData(outputPath);

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({
    assignment,
    solutionFiles,
    questions: Array.isArray(existing.questions) ? existing.questions : [],
  }, null, 2) + '\n');

  console.log(`${taskId}: ${solutionFiles.length} lahendusfaili, ${existing.questions?.length || 0} küsimust`);

  return {
    id: taskId,
    name: extractTitle(assignment, taskId),
  };
}

function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    throw new Error('input/ kausta ei leitud');
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const taskIds = readTaskDirectories();
  const assignments = taskIds.map(syncTask);

  fs.writeFileSync(
    path.join(DATA_DIR, 'manifest.json'),
    JSON.stringify({ assignments }, null, 2) + '\n',
  );

  console.log(`Valmis: ${assignments.length} ülesannet sünkroonitud.`);
}

try {
  main();
} catch (error) {
  console.error(`Sünkroonimine ebaõnnestus: ${error.message}`);
  process.exitCode = 1;
}
