# Statistik-Helfer

Konsolen-Skripte für Auszählungen über den Datenbestand. Sie sind reine
Auswertungswerkzeuge – sie werden **nicht** vom Eleventy-Build eingebunden und
schreiben nichts in `src/` oder `docs/`.

| Skript | Zweck |
| --- | --- |
| `count-images.js` | Auszählung auf der Konsole, ein Durchlauf |
| `report.js` | Markdown-Report: Gesamtbestand und bereinigter Bestand im Vergleich |

## `count-images.js` – Abbildungen zählen

Zählt die digitalisierten Abbildungen im Archiv, gruppiert nach Rubrik
(Gemälde, Zeichnungen, Grafiken), und weist aus, wie viele davon downloadbar
sind.

```sh
node helper/stats/count-images.js
# oder
npm run stats:images
```

### Optionen

| Option | Wirkung |
| --- | --- |
| `--data=<pfad>` | Datenordner (Default: `cranach-data`) |
| `--lang=<de\|en>` | Sprachvariante der Exporte (Default: `de`) |
| `--exclusions=<datei>` | Ausschlussliste (Default: `helper/stats/excluded-ids.json`) |
| `--exclude=<a,b>` | Nur diese Gruppen der Ausschlussliste anwenden |
| `--no-exclude` | Ausschlussliste komplett ignorieren |
| `--include-unpublished` | Unveröffentlichte Werke mitzählen |
| `--include-virtual` | Virtuelle Grafiken zu den Grafiken hinzunehmen |
| `--no-follow-reprints` | Ausschluss **nicht** auf die realen Abzüge virtueller Grafiken ausweiten |
| `--no-by-type` | Aufschlüsselung nach Bildtyp weglassen |
| `--json` | Ergebnis als JSON ausgeben (für Weiterverarbeitung) |
| `--list-groups` | Gruppen der Ausschlussliste anzeigen |
| `--help` | Hilfe |

### Ausschlussliste

`excluded-ids.json` hält Cranach-IDs (`metadata.id`, z. B. `DE_BStGS_1383`),
deren Werke bei der Auszählung übersprungen werden – inklusive **aller** ihrer
Abbildungen.

```json
{
  "groups": {
    "katalog-xy": {
      "label": "Katalog XY",
      "comment": "Ausstellung 2027, Abbildungen separat lizenziert",
      "active": true,
      "ids": ["DE_BStGS_1383", "CH_SORW_1925-1b"]
    }
  }
}
```

* Gruppen mit `"active": false` bleiben dokumentiert, wirken aber nicht.
* `--exclude=katalog-xy` wendet gezielt eine Auswahl an und übergeht `active`.
* IDs, die im ausgewerteten Bestand nicht vorkommen, werden am Ende unter
  „Nicht im ausgewerteten Bestand“ ausgewiesen – so fallen Tippfehler und
  veraltete Einträge auf.

#### Virtuelle Grafiken ziehen ihre realen Abzüge mit

Eine virtuelle Grafik ist ein konzeptioneller Container; die eigentlichen
Abbildungen hängen an den realen Abzügen. Steht eine virtuelle Grafik auf der
Ausschlussliste, werden deshalb auch alle realen Abzüge übersprungen, die über
`references.reprints[]` (`kind: "REPRINT_OF"`) auf sie verweisen – und zwar
unabhängig davon, ob die virtuellen Grafiken selbst mitgezählt werden.

Die Beziehung steht im Datenbestand in beiden Richtungen und ist konsistent
gepflegt: Für die KKL-Liste liefern beide Wege (`references_reprints` in
`kkl/works.json` und `references.reprints` in `cda-graphics-v2.real.*`)
identisch 757 Abzüge. Ausgewertet wird die Angabe am realen Abzug, die
Katalogdatei wird dafür nicht gebraucht.

`--no-follow-reprints` schaltet das ab und schließt nur die wörtlich gelisteten
IDs aus.

Umgekehrt gilt das nicht: Ein ausgeschlossener realer Abzug zieht seinen
Container nicht mit, weil darin weitere Abzüge stecken können.

Die realen Grafiken selbst tragen **keine** Katalogzugehörigkeit – das Feld
`catalogWorkReferences` ist bei ihnen leer. Der Weg über die reprint-Beziehung
ist deshalb der einzig belastbare. (Die Zeichenkette „KKL“ kommt zwar in 785
realen Grafiken vor, aber nur in Freitext-Anmerkungen wie `[KKL 2022]` – als
Zugehörigkeitskriterium taugt sie nicht.)

### Was genau gezählt wird

* **Abbildung** = ein Eintrag in `images.<bildtyp>.images[]`, über alle Bildtypen
  hinweg (Gesamtaufnahme, Rückseite, Detail, IRR, Röntgen, UV, Durchlicht,
  Mikroskop, Analyse, Restaurierung, RKD, KOE, Sonstige).
* Automatisch erzeugte **Overview-Derivate** (IDs auf `_Overview`) sind keine
  eigenständigen Abbildungen und werden herausgerechnet. Ihre Zahl steht unter
  „Hinweise“.
* **Unveröffentlichte Werke** (`metadata.isPublished === false`) sind per Default
  ausgenommen; `--include-unpublished` nimmt sie hinzu.
* **Grafiken** meint per Default nur den realen Bestand
  (`cda-graphics-v2.real.*`). Die virtuellen Grafiken
  (`cda-graphics-v2.virtual.*`, IDs mit `LC_`-Präfix) kommen nur mit
  `--include-virtual` dazu und werden dann als eigene Zeile ausgewiesen.
* **Downloadbar** heißt: das `download`-Flag der Abbildung im Datenbestand ist
  gesetzt. Das Frontend prüft zusätzlich zur Laufzeit über die Metadaten-API
  (`API_METADATA_EXIF_ENDPOINT`), ob ein Download tatsächlich ausgeliefert wird –
  die Zahl hier ist also der Stand laut Datenbestand, nicht das Live-Ergebnis.
* **Ausgeschlossene Werke** fallen komplett weg, inklusive aller ihrer
  Abbildungen – siehe Ausschlussliste oben.
* Archivalien und Literaturreferenzen zählen nicht mit.

### Datenstand

Gelesen wird der lokale Ordner `cranach-data`. Der ausgegebene Stand entspricht
dem Änderungsdatum der Dateien – für frische Zahlen also vorher die Exporte
aktualisieren.

## `report.js` – Markdown-Report schreiben

Läuft zweimal über denselben Datenstand – einmal ohne jeden Ausschluss, einmal
mit der aktiven Ausschlussliste – und schreibt beides samt Gegenüberstellung in
eine Markdown-Datei. Die Datendateien werden dabei nur **einmal** gelesen.

```sh
npm run stats:report
# oder mit eigenem Ziel
node helper/stats/report.js --out=/pfad/zum/report.md
```

Default-Ziel ist `helper/stats/reports/abbildungen.md`. Mit `--stdout` geht der
Report auf die Konsole statt in eine Datei. Alle übrigen Optionen entsprechen
`count-images.js` – bis auf `--no-exclude` und `--json`, die hier keinen Sinn
ergeben (der Report enthält beide Durchläufe ohnehin).

Der Report besteht aus drei Teilen:

1. **Gesamtbestand** – alle Werke, ohne Ausschluss
2. **Bereinigter Bestand** – mit angewandter Ausschlussliste, inklusive Bericht,
   was genau ausgeschlossen wurde
3. **Gegenüberstellung** – beide Zahlen nebeneinander mit Differenz

### Speicherbedarf

`cda-paintings-v2.de.json` ist über 100 MB groß. Reicht der Standard-Heap von
Node nicht, startet sich das Skript einmalig selbst mit
`--max-old-space-size=8192` neu; ein manueller Eingriff ist nicht nötig.
