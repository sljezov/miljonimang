# Miljonimäng

An interactive web app that checks whether a learner understands a programming assignment solution. It works like the "Who Wants to Be a Millionaire" game show: 15 multiple-choice questions, and one wrong answer ends the game.

**Project board (Kanban):** https://github.com/users/sljezov/projects/1

## Project description

The app reads solution files and question banks from `public/data/` and picks a fresh set of 15 questions each game. The solution code is visible in a side panel throughout the game. Questions are pre-generated with AI and stored as JSON, so no API key or server is needed.

Questions test **conceptual understanding**, not memorization: why a specific method was used, what happens in edge cases, how data flows between functions.

## Technologies used

- HTML5, CSS3, vanilla JavaScript (no framework)
- Browser `fetch()` API for loading JSON files
- GitHub Pages for static hosting

## Setup

**Requirements:** a modern web browser.

### Run locally

The app uses `fetch()`, so it needs an HTTP server (not `file://`):

```bash
# Python 3
python3 -m http.server 8080 --directory public
# Open: http://localhost:8080

# Node.js (npx)
npx serve public
# Open: http://localhost:3000
```

### GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings > Pages**
3. Source: `main` branch, folder `/public`
4. The app is available at `https://username.github.io/miljonimang/`

## Input folder structure

```
input/
  001/
    assignment.md   # Assignment description (required)
    index.html      # Solution files (any structure)
    script.js
    style.css
  002/
    assignment.md
    app.js
    ...
```

`input/` is the source folder. Running `npm run sync` finds all numeric subdirectories, reads `assignment.md` and all solution files recursively, and updates `public/data/`. Common generated folders such as `node_modules`, `.git`, `vendor`, `dist` and `build` are ignored.

Each `public/data/00N/data.json` contains:

- `assignment` - the assignment description text
- `solutionFiles` - file paths and contents
- `questions` - the pre-generated question bank

Syncing preserves any existing `questions` array. Binary files are skipped with a warning.

## Adding a new assignment

1. Create `input/00N/assignment.md` and add solution files to the same folder
2. Run `npm run sync`
3. Use the prompt in `prompts/question-generation.md` with the `assignment` and `solutionFiles` fields from `public/data/00N/data.json`
4. Paste the AI output into the `questions` array in that same file

The manifest is updated automatically. The assignment name is taken from the first `# Heading` line in `assignment.md`.

## AI question generation

Questions are generated with AI using a prompt that:

- Requests 45 questions (3 per level 1-15)
- Requires understanding checks, not memory (no filename questions)
- Adds a `hint` field to each question (used by the hint lifeline)
- Requires an `explanation` field (shown after answering)
- Enforces three difficulty tiers:
  - Levels 1-5: basic concepts and general purpose of the app
  - Levels 6-10: internal logic, data flow and validation
  - Levels 11-15: finding bugs, edge cases and alternative solutions

Full prompt: `prompts/question-generation.md`

## Game rules

- **15 questions** in increasing difficulty
- **Solution code** is visible beside each question, with tabs for switching files
- **4 answer options**, only 1 correct
- **Wrong answer** ends the game and drops the score to the last safe level
- **Safe levels:** Q5 (1 000 pts), Q10 (32 000 pts), Q15 (1 000 000 pts, the win)
- **Quitting** at any point keeps the current score
- **Lifelines** (each usable once):
  - **50:50** removes two wrong options
  - **Hint** shows a pre-generated conceptual clue
  - **Audience** shows a simulated vote skewed toward the correct answer on easier questions

## Known limitations

- Questions are pre-generated; adding them to `questions` is a manual copy-paste step
- Results are not saved between sessions
- A static browser app cannot read the folder structure directly, so `npm run sync` must be re-run after any changes to `input/`
- On screens narrower than 880 px the layout switches to a single column

## Future improvements

- Real-time AI question generation via API
- Save results to localStorage
- User accounts and leaderboard
- Game history
- Add assignments through the UI

## Demo

Main usage flow:

1. Open the app. The task list loads from `public/data/manifest.json` and displays all available assignments.
2. Click an assignment. The assignment description (rendered from `assignment.md`) and a list of solution files appear in a detail view.
3. Click "Start game". The app picks 15 questions (one per level) from the pre-generated bank of 45, preferring questions not shown in the previous game.
4. Answer each question by selecting one of the four options and confirming. The solution code is visible in a side panel throughout.
5. A correct answer advances to the next question and updates the prize ladder. A wrong answer ends the game and the score drops to the last safe level (Q5: 1 000 pts, Q10: 32 000 pts). Quitting at any point keeps the current score.
6. After the game ends or the player quits, a result screen shows the final score and a full review of all questions with correct answers and explanations.

## Development process

The app was built in incremental iterations tracked via git commits. The order was chosen to keep something runnable at each step: scaffolding and data first so the sync pipeline could be verified before any UI existed, then views from outer to inner (list before detail, detail before game), and lifelines last because they depend on a working game engine.

1. Project scaffolding (package.json, .gitignore)
2. Example assignments added to `input/`
3. Sync script for reading input files
4. HTML templates for all views
5. CSS layout and styling
6. Task list and detail views
7. Core game engine (questions, answers, scoring)
8. Three lifelines (50:50, hint, audience)
9. AI prompt documentation
10. AI-generated question banks added to `public/data/`
11. Random question selection and full result screen
12. README

Questions were generated using the prompt in `prompts/question-generation.md`, copied into Claude, and the JSON output was added to each `data.json` file.

## Requirements: done vs. not done

**Done**
- Multiple assignments in `input/`, each in a numbered subfolder
- Assignment list with names taken from the first heading in `assignment.md`
- Reads `assignment.md` and all solution files for each assignment
- 15 questions per game, 4 options each, one correct answer
- Wrong answer ends game, score falls to last safe level
- Quit at any time, keeping current score
- Questions are different each game (pickFifteen rotates through the bank of 45)
- Three lifelines: 50:50, hint, audience vote
- Explanation shown after each answer in the result review
- AI prompt documented in `prompts/question-generation.md`
- Markdown rendered in the assignment description panel

**Not done**
- Real-time AI question generation via API. A static GitHub Pages app has no backend, so an API key cannot be stored securely; it would be visible in the page source. Pre-generating questions and storing them as JSON achieves the same quality without exposing credentials, without per-game latency, and without ongoing API costs. The assignment explicitly lists this as a valid approach.
- Saving results between sessions (no localStorage persistence)
- User accounts or leaderboard

## Definition of Done

A feature is considered done when:
- It works in a modern browser without console errors
- The full game flow works end-to-end with the feature in place
- Edge cases are handled (empty question bank, missing files, etc.)
- The change is committed with a descriptive message

## Testing

Manual testing was done against the acceptance criteria of each user story:

| Scenario | Expected | Result |
|---|---|---|
| Select assignment, start game, answer 15 correctly | Win screen, 1 000 000 pts | Pass |
| Answer incorrectly on Q3 | Game ends, score drops to 0 (no safe level reached) | Pass |
| Answer incorrectly on Q7 | Game ends, score drops to 1 000 (Q5 safe level) | Pass |
| Use 50:50 | Two wrong options removed, cannot reuse lifeline | Pass |
| Use 50:50 after selecting an option that gets removed | Selection is cleared and must be chosen again | Pass |
| Use hint | Hint text shown, cannot reuse lifeline | Pass |
| Use audience vote | Simulated poll shown, skewed toward correct answer | Pass |
| Quit before answering the current question | Result keeps the score from the last correct answer | Pass |
| Quit after confirming a correct answer | Result includes the newly earned prize | Pass |
| Confirm a wrong answer | Quit is disabled, so the safe-level result cannot be bypassed | Pass |
| Play again | Different question selected per level where possible | Pass |
| Add new folder to `input/`, run `npm run sync` | New assignment appears in list | Pass |

## Retrospective

**What went well**
- Static-first approach (no backend, no API key needed) makes the app trivial to host on GitHub Pages
- Pre-generating questions with AI keeps the app fast and the question quality high
- The sync script cleanly separates source files (`input/`) from served files (`public/data/`)

**What was challenging**
- Keeping AI-generated questions at the right difficulty; some level 11-15 questions needed manual adjustment
- Designing the audience vote so it feels realistic without always being correct

**What to improve next**
- Add real-time AI question generation via API so teachers do not need a manual copy-paste step
- Save results to `localStorage` for a game history view
- Mobile layout below 880 px needs a dedicated design pass
