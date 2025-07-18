# E-Mail Agent Tool - Setup & Test Anleitung

Diese Anleitung zeigt dir, wie du das E-Mail Agent Tool konfigurierst und Test-Runs durchführst.

## 🚀 Live-URLs

- **Production**: https://family-toolbox.netlify.app/tools/email-agent
- **Staging**: https://stage--family-toolbox.netlify.app/tools/email-agent

## 📋 Voraussetzungen

### 1. Authentifizierung
- Du musst mit deinem Google-Account eingeloggt sein
- Navigiere zu: https://family-toolbox.netlify.app/auth/signin

### 2. Admin-Berechtigung
- Das E-Mail Agent Tool muss im Admin-Interface aktiviert sein
- Gehe zu: https://family-toolbox.netlify.app/admin/tools
- Aktiviere "E-Mail Agent" falls noch nicht geschehen

## 🔧 E-Mail-Postfächer konfigurieren

### Schritt 1: E-Mail Agent Tool öffnen
1. Gehe zu: https://family-toolbox.netlify.app/tools/email-agent
2. Du siehst das Dashboard mit 4 Tabs: **Dashboard**, **Zusammenfassungen**, **E-Mails**, **Einstellungen**

### Schritt 2: E-Mail-Account hinzufügen
1. Klicke auf den **"Einstellungen"** Tab
2. Klicke auf den **"Account hinzufügen"** Button (roter Button oben rechts)
3. Ein Formular erscheint mit allen notwendigen Feldern
4. Fülle die Felder aus:

#### Für Gmail:
```
Name: Mein Gmail Account
E-Mail: deine-email@gmail.com
IMAP Server: imap.gmail.com
IMAP Port: 993
Benutzername: deine-email@gmail.com
Passwort: [App-Passwort von Google]
```

#### Für Outlook/Hotmail:
```
Name: Mein Outlook Account
E-Mail: deine-email@outlook.com
IMAP Server: outlook.office365.com
IMAP Port: 993
Benutzername: deine-email@outlook.com
Passwort: [dein Passwort]
```

#### Für andere Provider:
- **ProtonMail**: `imap.protonmail.ch:993`
- **Yahoo**: `imap.mail.yahoo.com:993`
- **GMX**: `imap.gmx.net:993`

### Schritt 3: App-Passwort für Gmail erstellen
Falls du Gmail verwendest, musst du ein App-Passwort erstellen:

1. Gehe zu: https://myaccount.google.com/security
2. Aktiviere **"2-Schritt-Verifizierung"** falls noch nicht geschehen
3. Gehe zu **"App-Passwörter"**
4. Wähle **"Mail"** als App aus
5. Kopiere das generierte Passwort (16 Zeichen)
6. Verwende dieses Passwort im E-Mail Agent Tool

### Schritt 4: Account speichern
1. Klicke auf **"Account hinzufügen"** im Formular
2. Der Account erscheint in der Liste der konfigurierten Accounts
3. Du kannst mehrere Accounts hinzufügen, indem du den "Account hinzufügen" Button erneut klickst

## 🧪 Test-Runs durchführen

### Schritt 1: Dashboard überprüfen
1. Gehe zum **"Dashboard"** Tab
2. Prüfe den Status der Agenten:
   - **Mail Manager**: Sollte "Bereit" anzeigen
   - **Summary Generator**: Sollte "Bereit" anzeigen
   - **Learning Optimizer**: Sollte "Bereit" anzeigen

### Schritt 2: Manuellen Test-Run starten
1. Im Dashboard findest du den Bereich **"Manuelle Tests"**
2. Klicke auf **"E-Mail-Agent-Zyklus starten"**
3. Das System führt folgende Schritte aus:
   - **Mail Manager**: Verbindet sich mit deinen E-Mail-Accounts
   - **E-Mails abrufen**: Lädt neue E-Mails herunter
   - **Relevanz prüfen**: Bewertet E-Mails auf Relevanz
   - **Zusammenfassungen erstellen**: Erstellt AI-basierte Zusammenfassungen
   - **Feedback verarbeiten**: Optimiert Prompts basierend auf Feedback

### Schritt 3: Ergebnisse überprüfen
Nach dem Test-Run kannst du die Ergebnisse in verschiedenen Tabs einsehen:

#### E-Mails Tab:
- Liste aller abgerufenen E-Mails
- Relevanz-Score für jede E-Mail
- Status (neu, verarbeitet, archiviert)

#### Zusammenfassungen Tab:
- AI-generierte Zusammenfassungen
- Original-E-Mail-Text
- Feedback-Möglichkeit für jede Zusammenfassung

## 📊 Monitoring & Feedback

### E-Mail-Agent-Status überwachen
Im Dashboard siehst du:
- **Letzter Lauf**: Zeitstempel des letzten Test-Runs
- **Verarbeitete E-Mails**: Anzahl der E-Mails im aktuellen Zyklus
- **Erstellte Zusammenfassungen**: Anzahl der generierten Zusammenfassungen
- **Durchschnittliche Relevanz**: Durchschnittlicher Relevanz-Score

### Feedback geben
1. Gehe zum **"Zusammenfassungen"** Tab
2. Bei jeder Zusammenfassung findest du Feedback-Buttons:
   - 👍 **Gut**: Zusammenfassung ist hilfreich
   - 👎 **Schlecht**: Zusammenfassung ist nicht hilfreich
   - 🔄 **Anders**: Zusammenfassung sollte anders sein
3. Das Feedback wird vom **Learning Optimizer** verarbeitet
4. Zukünftige Zusammenfassungen werden basierend auf deinem Feedback optimiert

## 🔍 Troubleshooting

### Problem: "Verbindung fehlgeschlagen"
**Lösung:**
1. Prüfe IMAP-Server und Port
2. Stelle sicher, dass App-Passwort korrekt ist (bei Gmail)
3. Prüfe Firewall-Einstellungen
4. Teste Verbindung mit einem E-Mail-Client

### Problem: "Keine E-Mails gefunden"
**Lösung:**
1. Prüfe, ob E-Mails im Postfach vorhanden sind
2. Stelle sicher, dass der Account korrekt konfiguriert ist
3. Warte auf den nächsten automatischen Zyklus

### Problem: "Zusammenfassungen werden nicht erstellt"
**Lösung:**
1. Prüfe API-Keys in den Admin-Einstellungen
2. Stelle sicher, dass Anthropic API Key konfiguriert ist
3. Prüfe die Logs im Admin-Interface

## ⚙️ Erweiterte Einstellungen

### Automatische Zyklen konfigurieren
Das System führt automatisch alle 30 Minuten einen E-Mail-Agent-Zyklus durch:
- E-Mails werden abgerufen
- Relevanz wird bewertet
- Zusammenfassungen werden erstellt
- Feedback wird verarbeitet

### E-Mail-Filter anpassen
Du kannst die Relevanz-Kriterien anpassen:
- **Minimale Relevanz**: E-Mails unter diesem Score werden ignoriert
- **Maximale E-Mails pro Zyklus**: Begrenzt die Anzahl verarbeiteter E-Mails
- **Archivierung**: Automatische Archivierung alter E-Mails

## 📈 Nächste Schritte

Nach der erfolgreichen Konfiguration:

1. **Ersten Test-Run durchführen**
2. **Feedback zu Zusammenfassungen geben**
3. **E-Mail-Accounts optimieren** (weitere Accounts hinzufügen)
4. **Automatische Zyklen überwachen**
5. **Prompts basierend auf Feedback anpassen**

## 🆘 Support

Bei Problemen:
1. Prüfe die Logs im Admin-Interface
2. Teste die API-Keys in den Admin-Einstellungen
3. Überprüfe die Supabase-Verbindung
4. Kontaktiere den Administrator

---

**Viel Erfolg beim Testen des E-Mail Agent Tools! 🚀** 