# Lutherische Devotional-App

Tägliche lutherische Heim-Andacht (Mini-Offizium), verankert im Kirchenjahr.
Bekenntnistreu (*quia*), nur gemeinfreie Inhalte, offline-fähig als PWA.

Siehe `CLAUDE.md` (Projektregeln) und `Lutherische-Devotional-App-Bauplan.md` (Konzept).

## Projektstruktur

```
src/church-year/index.ts        Kirchenjahr-Engine (Computus + liturgischer Tag)
src/church-year/index.test.ts   Unit-Tests für die Engine
content/schema/                 JSON-Schema für einen liturgischen Tag
content/de/                     Inhaltsdateien pro liturgischem Tag (Deutsch)
scripts/validate.mjs            Validiert alle content/de/*.json gegen Pflichtfelder
scripts/Korpus-Quellen.md       Fundorte gemeinfreier Quellen
```

## Befehle

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build (TypeScript + Vite)
npm test             # Unit-Tests (Vitest)
npm run validate     # Inhaltsdateien prüfen (Provenance + Pflichtfelder)
```

## Engine nutzen

```ts
import { liturgicalDay } from './src/church-year'
const today = liturgicalDay(new Date())
// { name, season, color, week, isFeastDay, governingSunday, date }
```

## Nächste Schritte (Bauplan Phase 3–7)

1. **Content-Pipeline:** Lutherbibel 1912 (OSIS-XML) → JSON-Perikopen unter `content/de/bible/`.
2. **Korpus befüllen:** Advent–Epiphanias als erstes Segment (TODO-Felder in den JSON-Dateien).
3. **Frontend (PWA):** Tagesansicht-Komponente, liturgische Farbe als Thema, Navigation.
4. **i18n-Gerüst:** `react-i18next` einbinden (nur `de` befüllt, Struktur für Erweiterung).
5. **Deploy:** GitHub Pages / Netlify, CI mit `npm test && npm run validate`.
