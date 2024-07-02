# Cranach 11ty

## Autodeployments
Bislang ist nur ein [automatisches Deployment für den internen Bereich](https://github.com/lucascranach/cranach-artefacts/actions) eingerichtet. Dieses wird gestartet, wenn ein Commit auf den [Branch intern](https://github.com/lucascranach/cranach-artefacts/tree/intern) gemacht wird. Das Deployment geht dann in den [internen Bereich](http://lucascranach.org/intern/).

## Umgebungsvariablen

```env
CACHE_FOLDER=.cache
API_ENDPOINT=https://lucascranach.org/data-proxy/json-data.php
API_KEY=****************
METADATA_API_ENDPOINT=https://lucascranach.org/metadata/metadataForm.html
METADATA_API_KEY=****************
```

## Lokale Entwicklungsumgebung starten

Mithilfe des Befehls `npm run dev` lässt sich eine lokale Version der Cranach Artefacts starten. Da die generierung der Seiten eine Menge Arbeitsspeicher benötigt, muss ggf. die maximal erlaubte Speichergröße angepasst werden. Unter Linux und Mac lässt sich das mit dem Befehl `export NODE_OPTIONS=--max-old-space-size=<size in MB>` (z.B. 4096) erzielen. Diese Änderung ist temporär und bezieht sich nur auf die jeweilige Terminal-Session. Wird die Session beendet, muss das höhere Speicherlimit erneut gesetzt werden.

## Ordnerstruktur

### `/docs`
kompilierter Code


### `/src` hier wird entwickelt

```
_components         Layout- oder Funktionsschnipsel
_data               Zusätzliche Daten oder Hilffunktionen
_layouts            Templates
assets              SCSS, Skripts, Fonts, etc … alles was kein Content ist
compiled-assets     Kompilierte Dateien, z.B. CSS
```

### Weitere Dateien
```
.eleventy.js        Config von 11ty
.eleventyignore     Welche Folder/ Files soll 11ty ignorieren?
.eslintrc.json      
.gitignore          
.stylelintrc.json   
```

## Funktionen

| Befehl    | Funktion |
| -------- | ------- |
| npm run dev  | startet die lokale Entwicklungsumgebung    |
| npm run build | erzeugt einen Build für die [Prod Umgebung](https://lucascranach.org/de/search/)     |
| npm run internal    | erzeugt einen Build für die [Preview Umgebung](https://lucascranach.org/de/intern/search/)    |


## Libs 

- [Sortable Table](https://github.com/tofsjonas/sortable)