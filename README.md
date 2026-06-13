# Miljonimäng

Interaktiivne veebirakendus, mis kontrollib, kas kasutaja mõistab programmeerimisülesande lahendust. Töötab miljonimängu põhimõttel: 15 valikvastustega küsimust, mille ebaõige vastamine lõpetab mängu.

**Project board (Kanban):** https://github.com/users/sljezov/projects/1

## Projekti kirjeldus

Rakendus loeb `public/data/` kaustast lahendusfailid ja küsimustepangad ning koostab igal mängimisel uue 15 küsimusega komplekti. Õppijale ei kuvata lähteülesande teksti: HTML-, CSS- ja JavaScripti lahendusfailid on kogu mängu vältel küsimuste kõrval nähtavad. Küsimused on eelgenereeritud AI abil ja salvestatud JSON-failidena, seega pole API võtit ega serverit vaja.

Küsimused kontrollivad **kontseptuaalset arusaamist**, mitte päheõppimist: miks kasutati konkreetset meetodit, mis juhtub äärjuhtudel, kuidas andmed liiguvad funktsioonide vahel.

## Kasutatud tehnoloogiad

- HTML5, CSS3, vanilla JavaScript (ilma raamistikuta)
- Brauseri `fetch()` API JSON-failide lugemiseks
- GitHub Pages staatiline hostimine

## Käivitamise juhend

**Eeldused:** kaasaegne veebibrauser.

### Lokaalselt

Kuna rakendus kasutab `fetch()`, on vaja HTTP-serverit (mitte `file://`):

```bash
# Python 3
python3 -m http.server 8080 --directory public
# Ava: http://localhost:8080

# Node.js (npx)
npx serve public
# Ava: http://localhost:3000
```

### GitHub Pages

1. Lae repositoorium GitHubi üles
2. Mine repositooriumi **Settings → Pages**
3. Source: `main` haru, kaust `/public`
4. Rakendus on kättesaadav aadressil `https://kasutajanimi.github.io/miljonimang/`

## Input-kausta struktuur

```
input/
  001/
    assignment.md   # Ülesande kirjeldus (kohustuslik)
    index.html      # Lahenduse failid (vabalt valitud kujul)
    script.js
    style.css
  002/
    assignment.md
    app.js
    ...
```

`input/` on projekti lähtekaust. Käsk `npm run sync` otsib sealt kõik numbrilised alamkaustad, loeb `assignment.md` faili ja lahendusfailid rekursiivselt ning uuendab brauserile sobivaid `public/data/` faile. Levinud genereeritud kaustu, näiteks `node_modules`, `.git`, `vendor`, `dist` ja `build`, ei loeta.

Iga `public/data/00N/data.json` sisaldab:

- `assignment` — lähteülesande tekst;
- `solutionFiles` — lahendusfailide teed ja sisu;
- `questions` — eelgenereeritud küsimustepank.

Sünkroonimine säilitab olemasoleva `questions` massiivi. Binaarfailid jäetakse vahele ja sellest antakse käsureal teada.

## Uue ülesande lisamine

1. Loo `input/00N/assignment.md` ja lisa samasse kausta lahendusfailid
2. Käivita `npm run sync`
3. Kasuta `prompts/question-generation.md` prompti koos loodud `public/data/00N/data.json` faili `assignment` ja `solutionFiles` väljadega
4. Lisa AI vastusest saadud küsimused sama faili `questions` massiivi

Manifesti ei pea käsitsi muutma. Ülesande nimi võetakse `assignment.md` esimesest `# Pealkiri` reast.

## AI küsimuste genereerimise loogika

Küsimused on genereeritud AI abil, kasutades prompti, mis:

- Palub genereerida 45 küsimust (3 igal tasemel 1–15)
- Nõuab arusaamise kontrollimist, mitte mälu (ei küsi failinimesid)
- Määrab igale küsimusele `hint` välja (vihje õlekõrre jaoks)
- Nõuab `explanation` välja (kuvatakse pärast vastamist)
- Tagab igal tasemel erineva raskusastme:
  - Tasemed 1–5: põhimõisted ja rakenduse üldine eesmärk
  - Tasemed 6–10: sisemine loogika, andmevoog ja valideerimine
  - Tasemed 11–15: vigade leidmine, piirjuhtumid ja alternatiivsed lahendused

Täielik prompt: `prompts/question-generation.md`

## Mängu reeglid

- **15 küsimust** järjest kasvava raskusastmega
- **Lahenduse kood** on küsimuste kõrval nähtav ja failide vahel saab liikuda
- **4 vastusevarianti**, ainult 1 on õige
- **Vale vastus** lõpetab mängu — tulemus langeb viimasele turvatasemele
- **Turvatasemed:** Q5 (1 000 p) ja Q10 (32 000 p) — tagasipöördumise punktid
- **Lahkumine** mis tahes hetkel säilitab hetke punktid
- **Õlekõrred** (igaüht saab kasutada üks kord):
  - **50:50** — eemaldab kaks valet vastust
  - **Vihje** — kuvab eelgenereeritud kontseptuaalse vihje
  - **Küsi publikult** — simuleeritud hääletusel kaldub tulemuse suunas (kergemad küsimused → suurem tõenäosus)

## Teadaolevad piirangud

- Küsimused on eelgenereeritud — nende AI abil loomine ja `questions` massiivi lisamine on käsitsi samm
- Tulemusi ei salvestata — iga mäng algab nullist
- Staatiline brauserirakendus ei saa serveri kaustastruktuuri otse lugeda, mistõttu tuleb pärast `input/` muutmist käivitada `npm run sync`
- Mobiilil võib punktiredel olla kitsas (alla 880 piksli laiune paigutus muutub üheveeruliseks)

## Edasiarenduse võimalused

- Tulemuste salvestamine localStorage-sse
- Kasutajate süsteem ja edetabel
- Automaatne küsimuste genereerimine (API võtmega)
- Mänguajalugu
- Ülesannete lisamine veebiliidesest

## Development process

The app was built in incremental iterations tracked via git commits:

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
| Select assignment → start game → answer 15 correctly | Win screen, 1 000 000 pts | Pass |
| Answer incorrectly on Q3 | Game ends, score drops to 0 (no safe level reached) | Pass |
| Answer incorrectly on Q7 | Game ends, score drops to 1 000 (Q5 safe level) | Pass |
| Use 50:50 | Two wrong options removed, cannot reuse lifeline | Pass |
| Use hint | Hint text shown, cannot reuse lifeline | Pass |
| Use audience vote | Simulated poll shown, skewed toward correct answer | Pass |
| Quit mid-game | Result shows score at current level | Pass |
| Play again | Different question selected per level where possible | Pass |
| Add new folder to `input/`, run `npm run sync` | New assignment appears in list | Pass |

## Retrospective

**What went well**
- Static-first approach (no backend, no API key needed) makes the app trivial to host on GitHub Pages
- Pre-generating questions with AI keeps the app fast and the question quality high
- The sync script cleanly separates source files (`input/`) from served files (`public/data/`)

**What was challenging**
- Keeping AI-generated questions at the right difficulty — some level 11–15 questions needed manual adjustment
- Designing the audience vote so it feels realistic without always being correct

**What to improve next**
- Add real-time AI question generation via API so teachers don't need a manual copy-paste step
- Save results to `localStorage` for a game history view
- Mobile layout below 880 px needs a dedicated design pass
