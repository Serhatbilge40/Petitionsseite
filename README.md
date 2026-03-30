# Petitionen – Unterschriften sammeln

Eine Web-App zum rechtssicheren Sammeln digitaler Unterschriften für Petitionen, mit Supabase als Backend.

## Funktionen

- **Petitionen erstellen** – Titel, Beschreibung, Ziel festlegen
- **Teilbare Links** – Jede Petition hat einen eindeutigen Link zum Teilen
- **Online unterschreiben** – DSGVO-konforme Datenerfassung mit Einwilligung
- **Dashboard** – Alle Petitionen und Fortschritt auf einen Blick
- **Datenschutz** – Datenschutzerklärung, Impressum, IP-Hashing, Einwilligungs-Checkbox

## Setup-Anleitung

### 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Erstelle ein neues Projekt
3. Gehe zu **SQL Editor** und führe den Inhalt von `supabase-schema.sql` aus
4. Gehe zu **Settings → API** und kopiere:
   - Die **Project URL** (z.B. `https://abc123.supabase.co`)
   - Den **anon public** Key

### 2. Konfiguration

Öffne `config.js` und trage deine Supabase-Zugangsdaten ein:

```javascript
const SUPABASE_URL = 'https://DEIN-PROJEKT.supabase.co';
const SUPABASE_ANON_KEY = 'dein-anon-key-hier';
```

### 3. Rechtliche Seiten anpassen

Bearbeite diese Dateien mit deinen echten Angaben:
- `datenschutz.html` – Ersetze die Platzhalter `[...]` mit deinen Daten
- `impressum.html` – Ersetze die Platzhalter `[...]` mit deinen Daten

### 4. Webseite hosten

Die App besteht aus statischen HTML-Dateien. Du kannst sie hosten auf:

- **Netlify** – Ordner per Drag & Drop hochladen auf [app.netlify.com](https://app.netlify.com)
- **Vercel** – `vercel` CLI verwenden
- **GitHub Pages** – Repository erstellen und Pages aktivieren
- **Eigener Webserver** – Dateien einfach in den Webroot kopieren

## Dateistruktur

```
├── index.html          # Startseite mit Petitionsübersicht
├── create.html         # Formular zum Erstellen neuer Petitionen
├── sign.html           # Petitionsseite zum Unterschreiben (per ?slug=...)
├── dashboard.html      # Übersichts-Dashboard aller Petitionen
├── datenschutz.html    # DSGVO-Datenschutzerklärung
├── impressum.html      # Impressum (§ 5 TMG)
├── style.css           # Gesamtes Styling
├── config.js           # Supabase-Konfiguration (URL + Key)
├── app.js              # Gesamte App-Logik
└── supabase-schema.sql # Datenbank-Schema für Supabase
```

## Nutzung

1. **Petition erstellen:** Klicke auf "Petition starten", fülle das Formular aus
2. **Link teilen:** Nach dem Erstellen erhältst du einen Link – teile ihn per Messenger, E-Mail oder Social Media
3. **Unterschriften sammeln:** Unterstützer öffnen den Link und unterschreiben
4. **Fortschritt verfolgen:** Im Dashboard siehst du alle Petitionen und den Fortschritt

## Rechtliche Hinweise

- Die App erfasst eine **DSGVO-Einwilligung** vor jeder Unterschrift
- **E-Mail-Adressen** werden nicht öffentlich angezeigt
- **IP-Adressen** werden nur als SHA-256-Hash gespeichert
- **Doppelte Unterschriften** werden per E-Mail-Unique-Constraint verhindert
- Du musst **Datenschutzerklärung und Impressum** mit deinen echten Daten ausfüllen

> **Hinweis:** Diese App ist ein Werkzeug zur digitalen Unterschriftensammlung. Für rechtlich bindende Petitionen (z.B. Bürgerbegehren) gelten zusätzliche Anforderungen, die je nach Bundesland variieren. Informiere dich bei deiner Gemeinde.
