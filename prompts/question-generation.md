# AI küsimuste genereerimise prompt

See fail dokumenteerib, kuidas genereeriti mängus kasutatavad küsimused.

## Kuidas küsimusi genereerida (uue ülesande lisamisel)

1. Koosta `input/00N/assignment.md` ja lahenduse failid
2. Käivita `npm run sync` -- see loob `public/data/00N/data.json` ja uuendab `manifest.json` automaatselt
3. Kopeeri allolev süsteemiprompt ja kasutajaprompt mõnda AI-chatti (Claude, ChatGPT vms)
4. Asenda muutujad ({{...}}) tegeliku sisuga
5. Kopeeri vastuse JSON `public/data/00N/data.json` faili `questions` massiivi

---

## Süsteemiprompt (system prompt)

```
Oled ekspert programmeerimisõpetaja, kes loob hindamisküsimusi, et kontrollida,
kas õpilane mõistab koodi lahendust kontseptuaalselt. Genereeri küsimused, mis
kontrollivad arusaamist ja loogikat — mitte mälu (failinimesid, täpset süntaksit).
```

---

## Kasutajaprompt (user prompt)

```
Ülesanne: {{ÜLESANDE_PEALKIRI}}

## Ülesande kirjeldus
{{ASSIGNMENT_MD_SISU}}

## Lahenduse kood
{{KÕIK_LAHENDUSE_FAILID_KOODIBLOKKIDena}}

Genereeri täpselt 45 JSON-objekti massiivina (3 küsimust igal tasemel 1–15).

Iga objekt peab järgima seda skeemi:
{
  "level": 1,
  "question": "küsimuse tekst",
  "options": ["variant A", "variant B", "variant C", "variant D"],
  "correctIndex": 0,
  "explanation": "Miks õige vastus on õige ja miks peamine vale variant on vale.",
  "hint": "Vihje, mis osutab õigele suunale, ilma vastust otseselt ütlemata."
}

Reeglid:
- level vahemik on 1–15: tasemed 1–5 on lihtsad, 6–10 keskmised, 11–15 rasked
- Ära muuda iga üksikut taset kunstlikult eelmisest keerulisemaks; järgi kolme raskusplokki
- Küsi arusaamist: miks kood töötab, kuidas andmed liiguvad ja kas lahendus vastab ülesande nõuetele
- Väldi küsimusi, mis kontrollivad lahendusega nõrgalt seotud üldteooriat
- Kirjuta küsimused programmeerimise algajale arusaadavas eesti keeles
- Selgita vajalik tehniline mõiste küsimuses või vastuse selgituses lihtsate sõnadega
- Ka rasked küsimused peavad põhinema konkreetsel lahenduskoodil, veaolukorral või lihtsal edasiarendusel
- Väldi SOLID-i, disainimustrite ja muu edasijõudnute teooria küsimist, kui seda lahenduses otseselt ei kasutata
- Igal küsimusel täpselt 4 varianti, ainult 1 on õige
- Valed variandid peavad olema usutavad, mitte naeruväärsed
- explanation peab mainima nii õiget vastust kui ka peamist eksimusvõimalust
- hint ei tohi öelda otseselt vastust — ainult kontseptuaalne suund
- Vasta ainult JSON-massiiviga, ilma markdown-koodiplokita ega selgitusteta
```

---

## Küsimuste raskusastmete juhend

**Tasemed 1–5 (lihtne):**
- Rakenduse eesmärk ja üldine kirjeldus
- HTML-elementide tüübid ja otstarve
- Funktsioonide põhiline eesmärk
- Lihtne terminoloogia
- Väldi keerulisi meetodeid, veakäitluse erijuhte ja arhitektuuriküsimusi

**Tasemed 6–10 (keskmine):**
- Miks kasutatakse konkreetset meetodit/funktsiooni
- Andmevoog funktsioonide vahel
- Valideerimise ja veakäitluse loogika
- DOM-manipulatsiooni põhimõtted
- Küsimus peab olema vastatav lahenduskoodi tähelepaneliku jälgimisega

**Tasemed 11–15 (raske):**
- Konkreetsed veaolukorrad ja piirjuhtumid
- Lahenduse nõrkade kohtade märkamine
- Lihtsad parandused ja edasiarendused
- Põhikasutusvoo testimine
- Andmete liikumise selgitamine mitme funktsiooni vahel

---

## Näidisküsimus (level 7, keskmine)

```json
{
  "level": 7,
  "question": "Miks on showError() eraldi funktsioon, mitte sama kood otse calculate() sees?",
  "options": [
    "JavaScript nõuab, et veateated oleksid eraldi funktsioonis",
    "DRY-põhimõte — sama loogika kasutatakse mitu korda ja ühes kohas muutmine kajastub kõikjal",
    "showError() töötab kiiremini kui funktsiooni sisse kirjutatud kood",
    "Brauser ei luba innerHTML kasutamist keerukate funktsioonide sees"
  ],
  "correctIndex": 1,
  "explanation": "DRY (Don't Repeat Yourself): veateate kuvamise loogika kasutatakse kahes kohas (tühja sisendi ja nulliga jagamise korral). Eraldi funktsioon tähendab, et muudatusi (nt veateate stiil) tehakse ainult ühes kohas, mitte kahes.",
  "hint": "Mitu korda on koodis vaja veateadet kuvada? Mis juhtuks, kui seda loogikat kahes kohas eraldi kirjutada ja ühes viga tekkib?"
}
```
