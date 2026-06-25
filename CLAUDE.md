# CLAUDE.md — Lutherische Devotional-App

Verbindliche Projektregeln für Claude Code. Diese Datei hat Vorrang vor Default-Verhalten.

## Projektkontext

Tägliche lutherische Heim-Andacht (Mini-Offizium) als PWA, verankert im Kirchenjahr.
Zuerst persönlich, später ggf. kostenlos öffentlich. Nicht-kommerziell.
MVP nur Deutsch; Architektur mehrsprachig auslegen. Web/PWA zuerst, native später.

## Leitprinzipien (gelten für jede Entscheidung)

1. **Bekenntnistreue** — Inhalte müssen mit Schrift und Konkordienbuch (*quia*) übereinstimmen. Im Zweifel weglassen, nicht raten.
2. **Gemeinfreiheit** — im MVP ausschließlich rechtefreie Texte. Jedes Inhaltselement trägt Provenance.
3. **Kirchenjahr als Rückgrat** — Inhalt wird nach liturgischem Tag geschlüsselt, nicht nach Kalenderdatum.
4. **Erweiterbarkeit** — mehrsprachig und um spätere (lizenzierte, geprüfte) Inhalte erweiterbar, ohne Umbau.
5. **Offline-fähig** — lokaler Inhalt, keine Serverpflicht im MVP.

## Rechte-Leitlinie (hart)

- **NUR gemeinfreie Inhalte.** Keine modernen Übersetzungen oder Autoren ohne dokumentierte Lizenz.
- **Bibeltext:** Luther 1912.
- **Andachtskorpus:** orthodox-lutherisch ca. 1520–1700 (Arndt, Gerhard, Habermann, Scriver, Moller, Nicolai, Luther).
- **Lieder:** nur gemeinfreie Choräle. Achtung bei Bach: Komposition frei, aber moderne Ausgaben/Aufnahmen nicht.
- **Provenance-Pflicht:** jedes Element speichert `source`, `author`, `year`, `license`, `public_domain: true`.
- **Niemals** Inhalte erfinden oder paraphrasieren und als Quelle ausgeben. Originaltext + Fundstelle.

## Lehr-Filter (für spätere, nicht-gemeinfreie Inhalte)

Aufnahme nur, wenn alle Kriterien erfüllt:
- *quia*-Bindung ans Konkordienbuch (nicht *quatenus*).
- Schrift als Norm / Verbalinspiration.
- Keine Relativierung von Rechtfertigung, Sakramenten, Gesetz/Evangelium.
- Rechte geklärt und dokumentiert.

## Tech-Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- `vite-plugin-pwa` + Service Worker (Offline)
- i18n von Anfang an (nur `de` befüllt)
- Statisches Hosting (Netlify / Vercel / GitHub Pages)
- Inhalt als statische JSON-Dateien unter `/content/<lang>/<liturgical-day-id>.json`

## Datenmodell-Regel

Schlüssel ist der liturgische Tag (z. B. `advent-2`), nicht das Datum.
Stabile Schicht: historische Evangelienperikope (fix). Rotierende Schicht: Andacht/Zweitlesung/Psalm/Lied über 2–3-Jahres-Zyklus (`cycle_year`).

## Arbeitsweise

- Vor größeren Änderungen Plan nennen, getroffene Annahmen benennen.
- Kirchenjahr-Logik (Computus) mit Unit-Tests absichern.
- Inhaltsdateien gegen JSON-Schema validieren (CI-tauglich).
- Sprache neutral halten; keine sprachgebundenen Strings hartkodieren.

## MVP-Definition (fertig wenn)

Nutzer öffnet App → sieht korrekten liturgischen Tag mit allen Bausteinen → funktioniert offline → alle Inhalte tragen Provenance. Inhaltsumfang: ein vollständiges Kirchenjahr-Segment (Advent–Epiphanias) als Nachweis.
