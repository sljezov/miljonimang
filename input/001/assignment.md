# JavaScripti kalkulaator

Loo veebikalkulaator, mis võimaldab kasutajal sisestada kaks arvu ja teha nendega põhilisi aritmeetilisi tehteid.

## Nõuded

- Kasutajal on kaks sisendit (`num1` ja `num2`) arvude sisestamiseks
- Neli operatsiooninuppu: liitmine (`+`), lahutamine (`-`), korrutamine (`*`), jagamine (`/`)
- Tulemus kuvatakse ekraanil
- Tühjenda-nupp lähtestab mõlemad sisendid ja tulemuse
- Vale sisendi korral (tühi väli, mitte-arv) kuvatakse selgitav veateade
- Nulliga jagamist ei lubata — kuvatakse veateade

## Nõutud failid

- `index.html` — rakenduse struktuur
- `style.css` — kujundus
- `script.js` — kogu loogika

## Hindamiskriteeriumid

- Kõik neli operatsiooni töötavad korrektselt
- Tühja sisendi korral kuvatakse veateade (mitte arvutataks `NaN`-iga)
- Nulliga jagamine käsitletakse eraldi veateatega
- Sündmuste delegeerimine: üks `addEventListener` `buttons` konteineril, mitte igal nupul eraldi
- `data-op` atribuuti kasutatakse operaatori edastamiseks
- `parseFloat()` kasutatakse sisendi teisendamiseks arvuks
- `isNaN()` kasutatakse vale sisendi tuvastamiseks
