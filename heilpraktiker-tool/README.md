# Krankheiten-Nachschlagewerk (Heilpraktiker)

Offline-Nachschlagewerk mit **306 Erkrankungen**, gegliedert nach:

1. Kurze Definition / Erklärung
2. Kategorie / Organsystem
3. Ursachen / Pathophysiologie
4. Symptome / Leitsymptome
5. Komplikationen
6. Differentialdiagnosen
7. Blutwerte / Labor / Diagnostik

Dazu für jede Erkrankung: **🚨 Notfall-Kennzeichnung** (immer Notfall / kann Notfall werden, mit Erste-Hilfe-Maßnahmen) und **⛔ Behandlungsverbot für Heilpraktiker** mit Rechtsgrundlage (§ 24 IfSG i. V. m. § 6, § 7, § 34, STI).

Weitere Bereiche: Notfall-Grundregeln und Leitsymptom-Tabelle, Übersicht aller Behandlungsverbote und Tätigkeitsverbote, Lernkarten (Quiz) und eine Laborwert-Tabelle.

## Benutzung – kein Internet, kein Server nötig

Die **eine Datei `Krankheiten-Nachschlagewerk.html`** enthält alles.

- **PC/Mac:** Datei herunterladen und doppelt anklicken, sie öffnet sich im Browser.
- **iPhone/iPad:** Datei per AirDrop, Mail oder Messenger schicken → in „Dateien“ sichern → antippen. In der Vorschau erscheint die **einfache Ansicht** (alle Erkrankungen zum Aufklappen, Sprungmarken zu Notfällen, Behandlungsverboten, Laborwerten). Für **Suche, Filter und Lernkarten**: Teilen-Symbol → „In Safari öffnen“ bzw. „Öffnen mit …“.
- **Android:** Datei aufs Gerät → in „Downloads“ antippen → mit **Chrome** öffnen (volle Funktion). Andere Viewer zeigen die einfache Ansicht.

Die Datei enthält den kompletten Inhalt zweimal: einmal fest als lesbares HTML (funktioniert auch dort, wo kein JavaScript läuft) und einmal als interaktive App.

Tipp: Einmal öffnen und im Browser als Lesezeichen/„Zum Home-Bildschirm“ speichern.

Funktionen: Volltextsuche (z. B. „Brustschmerz“, „Nackensteife“, „Lipase“), Filter nach Organsystem, Notfall, Behandlungsverbot, Merkliste (★), Schriftgröße A−/A+, Hell/Dunkel.

## Inhalte ändern

Die Daten liegen in `src/data/*.js` (eine Datei pro Organsystem), die Oberfläche in `src/app.html`, `src/shared.js` und `src/app.js`. Nach Änderungen neu bauen (Node.js nötig):

```
node build.js
```

## Hinweis

Lern- und Nachschlagehilfe zur Vorbereitung auf die Heilpraktikerprüfung. Sie ersetzt weder Lehrbuch noch ärztliche Diagnose noch den aktuellen Gesetzestext. Laborwerte sind Richtwerte (laborabhängig). Rechtliche Angaben (IfSG, Landesmeldeverordnungen) bei Bedarf am aktuellen Gesetzestext prüfen.
