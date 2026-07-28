# Lizenzierte Quellen (nicht gemeinfrei)

> Zweite Content-Schiene gemäß `CLAUDE.md` → "Lehr-Filter (für spätere, nicht-gemeinfreie Inhalte)".
> Diese Texte sind urheberrechtlich geschützt und laufen **nicht** unter `public_domain: true`.
> Jeder Eintrag trägt trotzdem volle Provenance (`source`, `author`, `license`).

## 5 Minutos Com Jesus (CPTLN Paraguay)

- **Original:** *5 Minutos Com Jesus*, Devocionario der Hora Luterana Brasil (portugiesisch).
- **Verwendete Fassung:** spanische Übersetzung, veröffentlicht von CPTLN Paraguay (Cristo Para Todas Las Naciones Paraguay, Fernando de la Mora) im WhatsApp-Gruppenchat der Cong. Cristo Rey (Pastor Alceu Figur), täglich Mo–Sa.
- **Rechteinhaber (Übersetzung):** CPTLN Paraguay, Kontakt mision.cptln@gmail.com, WhatsApp +595 984 139 606, https://cptln.org.py
- **Status:** Nutzungserlaubnis für Ora eingeholt ✅ (Stand 2026-07-19/20).
- **Offen:** ob die Erlaubnis auch Übersetzungen in weitere Sprachen (DE/EN/PT/NO/SV/DA/NL) abdeckt — vor Veröffentlichung explizit klären. Rechte am portugiesischen Original selbst (Hora Luterana Brasil) nicht separat verifiziert.
- **Struktur pro Eintrag:** Titel, Datum, Bibelstelle mit Zitat ("Lectura"), Andachtstext, Gebet ("Oremos"), Autor.
- **Import:** `scripts/import-cptln-chat.mjs` → `scripts/source/cptln-import/5-minutos-con-jesus.es.json` (247 Einträge, 2025-09-18 bis 2026-07-18, nicht in Git).

## Para el Camino / Alimento Diario

- **Herkunft:** spanischsprachiges Andachtsprogramm, u. a. mit Rev. Dr. Leopoldo Sánchez M. (Concordia Seminary St. Louis, Center for Hispanic Studies), Diaconisa Noemí Guerra ("Sentido Latino") u. a. — LCMS-nah.
- **Rechteinhaber:** **Lutheran Hour Ministries (LHM)**, 660 Mason Ridge Center, St. Louis, MO 63141. Website-Fußzeile zeigt zusätzlich "© Copyright Cristo Para Todas Las Naciones" — dieselbe Ministry-Familie wie CPTLN Paraguay, aber international/zentral verwaltet.
- **Kontakt:** camino@lhm.org, Tel. +1-800-972-5442 (Español) / +1-800-876-9880 (English), www.lhm.org
- **Status:** Nutzungserlaubnis **ausstehend**. Wird vorerst trotzdem importiert, weil Ora noch nicht veröffentlicht ist (Entscheidung Lasse, 2026-07-19/20). Empfehlung: zentral bei LHM anfragen (deckt vermutlich auch Hora Luterana Brasil und mehrsprachige Nutzung ab, statt einzeln zu verhandeln).
- **Launch-Blocker:** vor jeder öffentlichen Veröffentlichung Erlaubnis einholen oder Inhalt wieder entfernen.
- **Struktur pro Eintrag:** Titel, Bibelzitat (oft im Fließtext, nicht immer als eigener Block), Andachtstext, Gebet, teils Reflexionsfragen ("Para reflexionar"), teils Autor/Rolle.
- **Import (kanonisch):** `scripts/import-alimento-diario.mjs` → `scripts/source/cptln-import/para-el-camino.es.full.json` — 300 Einträge, volles Jahresfenster 2025-07-21–2026-07-20, direkt von der offiziellen Quelle (RSS-Archiv `paraelcamino.com/alimentodiario`, 476 Seiten insgesamt verfügbar, nur 1 Jahr gezogen). Ersetzt den älteren, kleineren Import aus dem WhatsApp-Chat (`para-el-camino.es.json`, 22 Einträge, inhaltsgleich für überlappende Daten — verifiziert am 14.12.2025-Eintrag).

## 5 Minutos Com Jesus (Original, direkt von Hora Luterana Brasil)

- **Quelle:** `horaluterana.org.br/mensagens-de-audio/5-minutos-com-jesus/` — offizielles Archiv, 117+ Seiten, portugiesisches Original.
- **Rechteinhaber:** Hora Luterana Brasil, eigene Fußzeile "© Hora Luterana" — separat von CPTLN Paraguay und von LHM international zu behandeln, auch wenn vermutlich dieselbe Ministry-Familie.
- **Status:** Nutzungserlaubnis **ausstehend**, noch nicht angefragt.
- **Launch-Blocker:** vor jeder öffentlichen Veröffentlichung Erlaubnis einholen oder Inhalt wieder entfernen.
- **Import (Ergänzung zur ES-Fassung):** `scripts/import-hora-luterana.mjs` → `scripts/source/cptln-import/5-minutos-con-jesus.pt.json` — 330 Einträge, Jahresfenster 2025-07-20–2026-07-20, `lang: "pt"`. Ergänzt (ersetzt nicht) die spanische CPTLN-Fassung (`5-minutos-con-jesus.es.json`, 247 Einträge aus dem WhatsApp-Chat) — beide sind Sprachvarianten desselben `planId`.
- **Hinweis:** zwei HTML-Vorlagen im Archiv im Umlauf (neuere mit `<strong>Referência:</strong>`/`<strong>Versículo:</strong>`, ältere mit `<b>Texto:</b>` + unbeschriftetem `<em>`-Zitat); Parser deckt beide ab, ~7 % der Einträge bleiben ohne erkannte Bibelstelle (Body/Titel aber immer vollständig).

## Datenmodell-Hinweis

Beide Quellen sind **kalendertäglich fortlaufend** (ein Eintrag pro Kalendertag wie ein Jahresandachtsbuch), nicht nach liturgischem Tag geordnet. Geplant als eigener Content-Typ "Plan/Reihe" (siehe Projekt-Notizen), nicht als `DayContent.devotion`.

## Rechtlicher Hinweis

- Kein Bruch der harten Gemeinfreiheits-Regel für den Kern-Korpus — diese Quellen laufen als dokumentierte Ausnahme über den Lehr-Filter.
- `public_domain: false`, `license: "permission-granted"` bzw. `"permission-pending"` je Eintrag.
- Bei Zweifeln über Rechte-Umfang: Quelle vorerst nicht in eine öffentliche Version übernehmen (siehe CLAUDE.md, "im Zweifel weglassen").
