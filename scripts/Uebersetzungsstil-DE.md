# Übersetzungsstil Deutsch ("Stil C")

> Verbindlich für alle deutschen Übersetzungen der lizenzierten Plan-Inhalte
> (5 Minutos Com Jesus, Para el Camino). Mit Lasse abgestimmt am 2026-07-20
> anhand einer Beispielübersetzung von "O sim de Jesus" (2Kor 1,19).

## Zielton

Weder altertümlich (kein Luther-Deutsch, keine Wendungen wie "so lade ich dich ein",
"verwirft") noch beiläufig-alltäglich (keine lockere Plauderei, keine Umgangssprache
wie "A mí sí"). Dazwischen: klar, zeitgemäß, aber erkennbar eine Andacht — mit
theologischem Gewicht am Ende jedes Absatzes/Gedankens, nicht nur Alltagsbeobachtung.

## Konkrete Regeln

- **Anrede:** "du" zum Leser, direkt und persönlich, aber nicht kumpelhaft.
- **Satzbau:** klare, eher kurze Sätze. Keine barocken Schachtelsätze, aber auch
  keine abgehackte Umgangssprache.
- **Wortwahl:** heutiges Standarddeutsch. Keine archaischen Formen ("saget", "höret"),
  keine übertriebene Umgangssprache ("krass", "mega", Ausrufe wie "Wow").
- **Bibelzitate — VERBINDLICH, kein Übersetzer-Ermessen:** Wenn ein Eintrag ein
  Feld `quote_de_luther1912` + `reference_de` + `quote_bible_edition` trägt (von
  `scripts/resolve-bible-quotes.mjs` vorab aus der Lutherbibel 1912 aufgelöst),
  MUSS dieser Text wortwörtlich als `quote` übernommen werden — nicht selbst
  übersetzen, nicht umformulieren, nicht "verbessern". Das garantiert korrekte
  Verszählung und einen anerkannten deutschen Wortlaut statt einer Rückübersetzung.
  Nur wenn diese Felder fehlen/`null` sind (keine Zuordnung möglich, z. B. wegen
  Vers-Abweichungen zwischen Übersetzungstraditionen), das Zitat selbst aus dem
  Ausgangstext übersetzen und mit `"quote_source": "translated"` kennzeichnen
  (statt `"luther1912"`), `quote_bible_edition: null` setzen, damit später
  erkennbar bleibt, was verifiziert ist und was nicht.

  **Gilt sprachübergreifend, nicht nur für Deutsch** (Anweisung Lasse, 2026-07-21):
  Für jede Zielsprache muss eine gemeinfreie, etablierte Bibelübersetzung als feste
  Zitatquelle verwendet werden — nie eine freie Neuübersetzung des Agenten, wenn
  eine anerkannte Ausgabe existiert. `quote_bible_edition` gibt dabei IMMER an,
  welche Ausgabe konkret verwendet wurde (Überprüfbarkeit). Vorgesehen, sobald diese
  Sprachen dran sind (noch kein Vers-Index dafür gebaut — analog zu
  `scripts/parse-osis.mjs`/`verse-index.json` für Deutsch nachbauen):
  - **Deutsch:** Lutherbibel 1912 ✅ (bereits umgesetzt)
  - **Englisch:** King James Version (1769) — gemeinfrei, weit verfügbar
  - **Spanisch:** Reina-Valera 1909 — gemeinfrei (nicht RVR1960, die ist noch geschützt)
  - **Portugiesisch:** Almeida-Ausgabe vor 1900/gemeinfreie Fassung (genaue Ausgabe vor
    Umsetzung verifizieren; die "5 Minutos Com Jesus"-Originaltexte sind selbst schon
    Portugiesisch, aber Zitate darin sollten trotzdem gegen eine geprüfte gemeinfreie
    Bibelausgabe abgeglichen werden, nicht ungeprüft aus dem Fließtext übernommen)
  - **Norwegisch/Schwedisch/Dänisch/Niederländisch:** noch zu recherchieren, wenn diese
    Sprachen anstehen — gleiche Prüfpflicht wie oben (gemeinfrei, etabliert, dokumentiert).
- **Beibehalten, nicht übersetzen:** Datum, Referenz-Kürzel (Buch/Kapitel/Vers-Format
  kann an deutsche Konventionen angepasst werden, z. B. "2Kor 1,19" statt "2Co 1.19"),
  Autorennamen, `source`/`license`/`public_domain`-Felder.
- **Neu befüllen pro Eintrag:** `title`, `quote`, `body`, `prayer`, `reflectionQuestions`.
  `lang: "de"`, neue `id` mit `-de`-Suffix oder eigenem Sprachordner (siehe Ablagekonvention).

## Beispiel (Referenzmaßstab)

**Original (PT):** "Ao participar de uma cerimônia de casamento, aguardamos o momento
do 'sim' que os noivos dizem na presença da família e amigos. [...] Infelizmente,
muitos casais desistem do 'sim' e optam pelo 'não' [...] Convido-o a desfrutar do
'sim' de Jesus."

**Deutsch (Stil C):** "Jesu Ja. Bei einer Hochzeit warten alle auf diesen einen
Moment: das Ja, das sich die Brautleute vor Familie und Freunden geben. Man feiert
in der Hoffnung, dass dieser Bund ein Leben lang hält. Doch oft genug wird aus dem
Ja ein Nein, und Beziehungen zerbrechen. Vielleicht erkennst du dich in solchen
Erfahrungen wieder — Jesus lädt dich ein, sein Ja für dich zu entdecken: ein Ja,
das treu bleibt, auch wenn wir es nicht verdienen."

## Qualitätssicherung

- Theologische Treue geht vor Eleganz — im Zweifel wörtlicher übersetzen statt frei.
- Keine Inhalte hinzuerfinden oder umdeuten (gilt genauso wie für Originaltexte,
  siehe CLAUDE.md "Niemals Inhalte erfinden oder paraphrasieren").
- Stichprobenartige Prüfung durch Lasse vor Verwendung im Live-Content empfohlen.
