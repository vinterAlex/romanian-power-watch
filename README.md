# Power Watch — Romanian Corruption Monitor

A dynamic, data-driven watchdog site documenting the corruption and abuse-of-power records of the top 10 Romanian political figures with the power to rule — with real sources, quantified impact on the population, and a severity score.

Live goals: deployable to **Vercel** (static site, zero build step), fully **EN / RO** bilingual.

## Features

- 🔍 **Live search** across names, cases, impacts, dates
- 🎛 **Filters**: status (in power / former / convicted) and party (PSD / PNL)
- ↕️ **Sorting**: severity, money involved, number of documented cases, alphabetical
- 📊 **Aggregate stats bar**: total figures tracked, total documented cases, total public money referenced, how many are convicted, how many are in power
- 📂 **Dossier modal** per person: every documented case with date, description, quantified impact on the population, and source link
- 🇷🇴🇬🇧 **Full EN / RO toggle**, persisted in localStorage
- ☑ **Extensible data model** — add a new JSON file and it shows up automatically

## Structure

```
power-watch/
├── index.html          # Entry page (static shell)
├── style.css           # Dark watchdog theme
├── js/
│   └── app.js          # Rendering, filters, sorting, modal, i18n
├── data/
│   ├── files.json      # Manifest: list of person JSON files
│   ├── klaus-iohannis.json
│   ├── liviu-dragnea.json
│   ├── marcel-ciolacu.json
│   ├── nicolae-ciuca.json
│   ├── ilie-bolojan.json
│   ├── victor-ponta.json
│   ├── gabriela-firea.json
│   ├── sorin-grindeanu.json
│   ├── mihai-fifor.json
│   └── sebastian-burduja.json
└── README.md
```

## Person JSON schema

```jsonc
{
  "id": "slug",
  "name": "Full name",
  "party": "PSD | PNL | ...",
  "status": "in_power | former | convicted | under_investigation",
  "statusLabel": { "en": "...", "ro": "..." },
  "image": "https://upload.wikimedia.org/...",
  "severity": 9,                    // 1-10, editorial rating of the documented record
  "summary": { "en": "...", "ro": "..." },
  "cases": [
    {
      "title":  { "en": "...", "ro": "..." },
      "date":   "2017",
      "text":   { "en": "what happened", "ro": "..." },
      "impact": { "en": "quantified impact on the population", "ro": "..." },
      "caseStatus": { "en": "e.g. 'Active – in prosecution at DNA' | 'Final conviction' | 'Closed – statute of limitations'", "ro": "…", "open": true },
      "money":  20000000,           // EUR (0 if unknown)
      "source": { "label": { "en": "Reuters", "ro": "Reuters" }, "url": "https://..." }
    }
  ]
}
```

To extend the top-10 list later: create `data/<new-slug>.json`, then add the filename to `data/files.json`.

## Local debug

The page fetches JSON at runtime, so serve it (don't open via `file://`):

```powershell
cd power-watch
python -m http.server 8000
# open http://localhost:8000
```

## Deploy to Vercel

It's plain static files — deploy the `power-watch/` folder directly:

```powershell
cd power-watch
vercel --prod
```

No build commands needed. Any static framework setting works.

## Editorial caution

All data is attributed to real, checked sources (Reuters, AP, BBC, France 24, Politico, Euronews, RFE/RL, DW, Euractiv, G4Media, Recorder, PressOne, Digi24, HotNews, and others). The site presents allegations and court findings as documented — with the presumption of innocence stated in the footer. Severity scores are editorial ratings of the documented public record, not legal judgments.
