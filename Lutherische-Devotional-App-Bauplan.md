# Lutherische Devotional-App — Bauplan für Claude Code

> Arbeitsdokument. Erster solider Entwurf zum iterativen Ausbau, nicht finale Spezifikation.
> Status: Konzept geklärt, bereit für technische Umsetzung.
> Datum: 2026-06-25

---

## 1. Zielbild

- **Was:** Tägliche Heim-Andacht im Kleinformat (Mini-Offizium) mit Andachtstext, verankert im Kirchenjahr.
- **Tradition:** Lutherisch, bekenntnistreu (Bindung an das Konkordienbuch *quia*).
- **Vorbild UX:** YouVersion / Glorify — aber konfessionell verankert statt überkonfessionell-modern.
- **Zweck:** Zuerst persönlich. Falls Produkt, dann kostenlos und nicht-kommerziell.
- **Inhalte:** Im MVP ausschließlich gemeinfrei.
- **Plattform:** Web/PWA zuerst, native App später.
- **Sprache:** MVP nur Deutsch; Architektur von Anfang an mehrsprachig ausgelegt.

---

## 2. Leitprinzipien (gelten für alle Designentscheidungen)

1. **Bekenntnistreue** — Inhalte müssen mit Schrift und Konkordienbuch übereinstimmen. Im Zweifel weglassen.
2. **Gemeinfreiheit** — im MVP nur rechtefreie Texte. Jedes Inhaltselement trägt ein Quellen-/Lizenzfeld.
3. **Kirchenjahr als Rückgrat** — Inhalte werden nach liturgischem Tag organisiert, nicht nach Kalenderdatum.
4. **Erweiterbarkeit** — mehrsprachig und um moderne (lizenzierte/geprüfte) Inhalte erweiterbar, ohne Umbau.
5. **Offline-fähig** — PWA mit lokalem Inhalt; keine Serverpflicht im MVP.

---

## 3. Aufbau eines Andachtstages (Inhaltskonzept)

Mini-Offizium für zuhause. Bausteine in fester Reihenfolge (optionale mit *):

1. **Tageskennung** — liturgischer Tag, Woche, Kirchenjahreszeit, liturgische Farbe.
2. **Eröffnung / Votum** — z. B. „Im Namen des Vaters …" + Versikel.
3. **Psalm des Tages** — fortlaufender Psalter.
4. **Lesung** — Perikope der Woche bzw. Tageslesung.
5. **Andachtstext** — gemeinfreier Klassiker, thematisch an die Lesung gekoppelt.
6. **Lied / Choralstrophe*** — gemeinfrei (Luther, Gerhardt, Nicolai …).
7. **Gebet / Kollekte der Woche**.
8. **Katechismus-Baustein*** — wöchentlich rotierend (Luthers Kleiner Katechismus).
9. **Segen**.

Richtwert Lesezeit: 5–10 Minuten. Bausteine pro Tag konfigurierbar (Kurz-/Vollform).

---

## 4. Leseordnung — Zwei-Schichten-Modell

- **Stabile Schicht (Anker):** Historische Evangelienperikope (Eisenacher Ordnung) — fest pro Sonntag/Fest. Gemeinfrei, traditionell, reformations-/konkordienzeitlich. Hohe Feste wiederholen sich bewusst.
- **Rotierende Schicht (Abwechslung):** Andachtstext, Zweitlesung, Psalm und Lied rotieren über einen **2–3-Jahres-Zyklus**. So fühlt sich kein Jahr 1:1 identisch an, ohne ständigen Strukturwechsel.
- **Kirchenjahr-Berechnung:** Osterdatum per Computus (Gaußsche Osterformel) — alle beweglichen Feste und Trinitatis-Sonntage ableiten. Feste Feste (Weihnachten etc.) direkt aus dem Kalender.

---

## 5. Rechte-Leitlinie (verbindlich)

- **MVP = strikt gemeinfrei.** Keine modernen Übersetzungen oder Autoren ohne dokumentierte Lizenz.
- **Bibeltext:** Luther 1912 (gemeinfrei).
- **Andachtskorpus:** orthodox-lutherisch ca. 1520–1700.
- **Lieder:** nur gemeinfreie Choräle.
- **Provenance-Pflicht:** Jedes Inhaltselement speichert `source`, `author`, `year`, `license`, `public_domain: true`.
- **Lehr-Filter für spätere moderne Inhalte** (Aufnahmekriterium, falls erweitert):
  - *quia*-Bindung ans Konkordienbuch (nicht *quatenus*).
  - Schrift als Norm / Verbalinspiration.
  - Keine Relativierung von Rechtfertigung, Sakramenten, Gesetz/Evangelium.

---

## 6. Gemeinfreie Quellen (Korpus-Beschaffung)

> Exakte Einzel-URLs beim Einsammeln verifizieren und in `provenance` festhalten.

- **Bibel (Luther 1912):** Zefania-XML / CrossWire-SWORD-Modul (`GerLut1912`), zeno.org, Wikisource. Maschinenlesbar bevorzugen.
- **Andachtsklassiker:**
  - Johann Arndt — *Vom wahren Christentum* (1605–10)
  - Johann Gerhard — *Meditationes Sacrae* (1606), *Schola Pietatis*
  - Johann Habermann — *Christliches Gebetbüchlein* (1567)
  - Christian Scriver — *Seelenschatz*
  - Martin Moller, Philipp Nicolai — *Freudenspiegel des ewigen Lebens*
  - Fundorte: Deutsches Textarchiv (deutschestextarchiv.de), archive.org, Google Books, Projekt Gutenberg-DE, zeno.org.
- **Katechismus:** Luthers Kleiner Katechismus (gemeinfrei).
- **Lieder/Choräle:** Luther, Paul Gerhardt, Philipp Nicolai u. a. — Wikisource, hymnary.org. Bach-Choralsätze (BWV) sind als Komposition gemeinfrei (siehe Anhang).
- **Perikopen/Kirchenjahr:** Historische Eisenacher Ordnung — Referenzliste zusammenstellen und gegen Quellen prüfen.

---

## 7. Datenmodell

**Prinzip:** Inhalt wird nach **liturgischem Tag** geschlüsselt (jährlich wiederverwendbar), nicht nach Kalenderdatum. Statische JSON-Dateien im Repo — kein Backend, versionierbar, offline.

Beispiel (ein liturgischer Tag):

```json
{
  "id": "advent-2",
  "name": "2. Sonntag im Advent",
  "season": "advent",
  "color": "violet",
  "rank": "sonntag",
  "readings": {
    "gospel": { "ref": "Lukas 21,25-33", "stable": true },
    "epistle": { "ref": "Römer 15,4-13", "cycle_year": 1 },
    "psalm":   { "ref": "Psalm 80", "cycle_year": 1 }
  },
  "devotion": {
    "text": "…",
    "author": "Johann Arndt",
    "source": "Vom wahren Christentum, II. Buch",
    "year": 1610,
    "cycle_year": 1,
    "license": "public-domain",
    "public_domain": true
  },
  "hymn": {
    "title": "Wie soll ich dich empfangen",
    "author": "Paul Gerhardt",
    "stanzas": ["…"],
    "source": "…",
    "public_domain": true
  },
  "collect": { "text": "…", "source": "…" },
  "catechism_segment": { "part": "Das erste Gebot", "text": "…" },
  "lang": "de"
}
```

**Mehrsprachigkeit:** Pro Sprache eine Datei (`/content/de/advent-2.json`, `/content/en/…`).

**Empfohlener Stack:**
- React + Vite + TypeScript
- Tailwind CSS v4
- PWA-Plugin (`vite-plugin-pwa`) + Service Worker (Offline)
- i18n-Bibliothek von Anfang an
- Statisches Hosting: Netlify / Vercel / GitHub Pages (kostenlos)

---

## 8. MVP-Umfang (Scope-Disziplin)

- **Nur Deutsch.**
- **Engine vollständig** (Kirchenjahr, Tagesansicht, Offline).
- **Inhalt: ein vollständiges Kirchenjahr-Segment** als Nachweis (Empfehlung: Advent – Epiphanias).
- **MVP fertig, wenn:** Nutzer öffnet App, sieht korrekten liturgischen Tag mit allen Bausteinen, funktioniert offline, Inhalte tragen Provenance.

---

## 9. Claude-Code-Vorgehen (Schritt für Schritt)

- **Phase 0 — Setup:** Repo, Stack, `CLAUDE.md` mit Leitprinzipien und Rechte-Leitlinie. ✅
- **Phase 1 — Kirchenjahr-Engine:** Computus + Mapping Datum → liturgischer Tag. Mit Unit-Tests. ✅
- **Phase 2 — Datenmodell:** JSON-Schema definieren, Validierung, ein Beispieltag. ✅
- **Phase 3 — Content-Pipeline:** Skripte, die PD-Quellen einlesen und ins Schema überführen.
- **Phase 4 — Frontend (PWA):** Tagesansicht, Navigation durchs Kirchenjahr, Offline-Caching.
- **Phase 5 — i18n-Gerüst:** Sprachumschaltung (nur `de` befüllt), Struktur steht.
- **Phase 6 — Befüllung:** Erstes Kirchenjahr-Segment mit Inhalten füllen.
- **Phase 7 — Test & Deploy:** Datenvalidierung, theologische Sichtung der Texte, statisches Deployment.

---

## 10. Offene Punkte / spätere Entscheidungen

- Weitere Sprachen (en, pt, nordische, es, nl) — erst nach stabilem deutschem MVP.
- Moderne Inhalte (z. B. Jordan Cooper) — nur mit eingeholter Lizenz **und** bestandenem Lehr-Filter.
- Native App (iOS/Android) nach Tests.
- Audio (TTS-Vorlesefunktion, gemeinfreie Choral-Aufnahmen).
- Theologischen Prüfer/Begleiter gewinnen (sobald nicht-gemeinfreie oder eigene Texte einfließen).

---

## Anhang — Rechte- und Kostenrahmen

- **MVP-Lizenzkosten: 0 €** (strikt gemeinfrei).
- **Luther 1912:** gemeinfrei, frei nutzbar.
- **Lutherbibel 2017 (DBG/EKD):** App-Nutzung wird ausdrücklich kostenlos/verschenkt angeboten; die EKD ist Rechteinhaberin. Kommerzielle Verwendung = eigener Lizenzvertrag.
- **Liedtexte (VG Musikedition):** Im MVP durch gemeinfreie Lieder komplett vermeidbar.
- **Bach:** Kompositionen gemeinfrei (Tod 1750). Achtung: einzelne **moderne Notenausgaben** und **Aufnahmen** haben eigene Schutzrechte.
