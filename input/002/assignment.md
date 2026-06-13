# To-do nimekiri localStorage-ga

## Ülesande kirjeldus

Loo dünaamiline ülesannete nimekiri (to-do list), kus kasutaja saab lisada ja kustutada ülesandeid. Andmed peavad säilima ka pärast lehe uuesti laadimist, kasutades brauseri `localStorage`-i.

## Nõuded

- Kasutaja saab tekstivälja ja nupu abil lisada uusi ülesandeid
- Iga ülesande kõrval on kustutamisnupp
- Tühi ülesanne ei tohi lisanduda nimekirja
- Andmed salvestatakse `localStorage`-i ja kõik ülesanded taastatakse lehe uuesti laadimisel
- Lehe laadimisel loetakse olemasolevad ülesanded `localStorage`-ist ja kuvatakse need

## Nõutud failid

- `index.html` — rakenduse struktuur
- `style.css` — kujundus
- `app.js` — kõik loogika

## Hindamiskriteeriumid

- Ülesande lisamine toimib ja tühja sisestust ei lisata
- Kustutamine eemaldab ülesande nii DOM-ist kui `localStorage`-st
- Andmed säilivad lehe uuesti laadimisel
- Ülesanded salvestatakse JSON-massiivina (`JSON.stringify` / `JSON.parse`)
- Kood on struktureeritud: eraldi funktsioonid lisamiseks, kustutamiseks ja kuvamiseks
