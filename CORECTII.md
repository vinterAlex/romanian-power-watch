# Corecturi și reverificări — Power Watch

**Data:** 8 noiembrie 2026
**Ce este acest fișier:** lista lucrurilor care trebuie schimbate în `power-watch/data/*.json` și pe site-ul `romanian-power-watch.vercel.app`, pe baza verificării din `gathered_informations/`.

Regula: **nu ștergem o acuzație doar pentru că e incomodă; o ștergem sau o reformulăm dacă nu are sursă.** Fiecare rând are un verdict și o dovadă.

---

## 1. Repere care schimbă contextul întregului site

| Afirmație de pe site | Situația reală (nov. 2026) | Verdict | Dovadă |
|---|---|---|---|
| „Top 10 figuri cu puterea de a guverna” | Lista are 11 nume, iar unele nu mai au funcții (Iohannis, Ciucă, Dragnea, Ponta) | **DE REFORMULAT** editorial: „figuri care au deținut puterea sau o influențează” | `05_institutii_si_legi/REPERE_2026.md` |
| Ciolacu „fost premier și fost lider PSD” | Este **președinte al CJ Buzău** din 19 dec. 2025; PSD este condus de Grindeanu | **DE COMPLETAT** | Agerpres 8 dec. 2025; Bursa 18 dec. 2025; ProTV 2 nov. 2026 |
| Firea „la putere: europarlamentar” | Corect | **CONFIRMAT** | Digi24 18 iun. 2024 |
| Ciucă „fost președinte al Senatului” | Corect; a demisionat din Senat la 5 feb. 2025 | **CONFIRMAT** | Mediafax 5 feb. 2025 |
| Bolojan „fost premier nov. 2025 – mai 2026” | Corect; demis prin moțiune la 5 mai 2026, cu 281 de voturi | **CONFIRMAT** | Digi24/Mediafax 5 mai 2026 |
| „Guvernul Bolojan” (prezent) | Din 20 oct. 2026, premier este **Luca Niculescu** | **DE ACTUALIZAT** | presidency.ro/gov.ro |
| Nicușor Dan „președinte în funcție, ales în mai 2025” | Corect | **CONFIRMAT** | presidency.ro |
| Grindeanu „președinte PSD și președinte al Camerei Deputaților” | Corect | **CONFIRMAT** | ProTV 2 nov. 2026; Digi24 12 oct. 2026 |

---

## 2. Afirmații care trebuie marcate „neconfirmat” sau reformulate

| Unde | Afirmație | Problemă | Ce facem |
|---|---|---|---|
| `klaus-iohannis.json` | „România lăsată fără președinte legitim” după expirarea mandatului | Interpretare politică, nu fapt juridic; Constituția prevede interimat | Reformulare: „mandatul a expirat, iar Iohannis a rămas în funcție până la demisia din 10 feb. 2025, în baza interpretării constituționale” |
| `klaus-iohannis.json` | „Demisie forțată cu o zi înainte de votul de suspendare” | Cronologia exactă a votului trebuie confirmată din stenograma Parlamentului | Marchează `PRESĂ-1` și adaugă data votului |
| `ilie-bolojan.json` | „281 de voturi contra 4” | Presa confirmă 281 „pentru”; cifra 4 nu a fost găsită în sursele verificate | Elimină „4” sau marchează `NEVERIFICAT` |
| `ilie-bolojan.json` | „leul a atins 5,21/euro” | Nu a fost verificat cu BNR | Marchează `NEVERIFICAT` până la confirmarea din BNR |
| `nicusor-dan.json` | „trei nominalizări eșuate de premier” | Nu a fost verificat numărul exact | Marchează `PRESĂ-1` sau completează cu numele nominalizărilor |
| `sorin-grindeanu.json` | „petrecerea de botez PSD din noiembrie 2026” | Sursa RFI există, dar faptele trebuie citite integral | Marchează `PRESĂ-1` |
| `mihai-fifor.json` | „vicepremier” | Nu a fost confirmat în această rundă | Confirmă cu decret/Monitorul Oficial sau elimină |
| `sebastian-burduja.json` | „președinte PNL București” | Este autodescris; nu am găsit confirmare oficială | Marchează `DECLARAȚIE` |
| `victor-ponta.json` | „achitat definitiv în 2023” (Turceni-Rovinari) | De confirmat cu portal.just.ro | Marchează `DE VERIFICAT` |
| `liviu-dragnea.json` | „interdicție de intrare în SUA” | Confirmat de presă internațională în 2017 | `PRESĂ-2+` |

---

## 3. Afirmații care contrazic sursele verificate (candidate la ștergere)

| Afirmație | De ce | Dovadă |
|---|---|---|
| „Ciolacu este încă lider PSD” | Grindeanu este președintele PSD din 2026 | ProTV, 2 nov. 2026 |
| „Ciolacu este deputat” | A demisionat la 18 dec. 2025 | Bursa, 18 dec. 2025 |
| „Firea este senator” | A demisionat din Senat în iunie 2024, este europarlamentar | Digi24, 18 iun. 2024 |
| „Ciucă este senator” | A demisionat din Senat la 5 feb. 2025 | Mediafax, 5 feb. 2025 |
| „Bolojan este prim-ministru” | A fost demis la 5 mai 2026 | Digi24, 5 mai 2026 |
| „Iohannis este președinte” | A demisionat la 10 feb. 2025 | Digi24, 10 feb. 2025 |

---

## 4. Ce am confirmat și nu trebuie schimbat

- Dragnea: condamnare definitivă în dosarul angajărilor fictive de la DGASPC Teleorman (3 ani și 6 luni), eliberat în 2022.
- Ponta: teza de doctorat plagiată; titlul retras definitiv.
- Ciucă: teza de doctorat plagiată (PressOne).
- Firea: scandalul azilelor din Voluntari și ancheta privind tramvaiele.
- Burduja: contractul CIGA Energy Advisory (~28.000 €) pentru OUG 35/2025.
- Fifor: audiat ca **martor** la DNA Timișoara în dosarul Nădlac (13 dec. 2019).
- Ciolacu: prejudiciul de 4,83 mln lei constatat de Curtea de Conturi la Urbis Serv.
- Ciolacu: dosarul certificatului de revoluționar **clasat** de DNA la 17 martie 2023.

---

## 5. Ordinea de lucru pentru site

1. **Actualizează `statusLabel`** pentru Ciolacu (CJ Buzău), Firea (europarlamentar), Ciucă (fost senator), Grindeanu (președinte PSD + Camera), Fifor (deputat + comisie), Burduja (deputat + comisie).
2. **Adaugă `lastVerified`** și `verifiedFunction` în fiecare JSON.
3. **Reformulează** titlul „top 10 figuri cu puterea de a guverna” în „figuri care au deținut puterea sau o influențează”.
4. **Marchează** cifrele neverificate (5,21 lei/euro, 4 voturi contra, 3 nominalizări) cu `unverified: true`.
5. **Nu adăuga** acuzații noi fără sursă primară.

---

## 6. Jurnal

- **8 nov. 2026** — creat fișierul; verificate funcțiile actuale din presidency.ro, gov.ro, cdep.ro și presă. Nu s-au modificat încă fișierele JSON ale site-ului; urmează patch-ul.
