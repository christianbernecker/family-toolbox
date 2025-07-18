# E-Mail Agent Tool - Setup Checkliste

## ✅ Vorbereitung

- [ ] **Google-Account eingeloggt** auf https://family-toolbox.netlify.app/auth/signin
- [ ] **Admin-Berechtigung** erhalten
- [ ] **E-Mail Agent Tool aktiviert** in https://family-toolbox.netlify.app/admin/tools
- [ ] **Anthropic API Key** konfiguriert in Admin-Einstellungen

## 🔧 E-Mail-Account Setup

### Gmail Setup
- [ ] **2-Schritt-Verifizierung aktiviert** auf https://myaccount.google.com/security
- [ ] **App-Passwort erstellt** auf https://myaccount.google.com/apppasswords
- [ ] **App-Passwort kopiert** (16 Zeichen)
- [ ] **E-Mail Agent geöffnet** auf https://family-toolbox.netlify.app/tools/email-agent
- [ ] **"Einstellungen" Tab** geöffnet
- [ ] **Gmail-Account hinzugefügt**:
  - [ ] Name: "Mein Gmail"
  - [ ] E-Mail: deine-email@gmail.com
  - [ ] IMAP Server: imap.gmail.com
  - [ ] IMAP Port: 993
  - [ ] Benutzername: deine-email@gmail.com
  - [ ] Passwort: [App-Passwort]
- [ ] **"Account hinzufügen"** geklickt
- [ ] **Account erscheint** in der Liste

### Outlook/Hotmail Setup
- [ ] **E-Mail Agent geöffnet** auf https://family-toolbox.netlify.app/tools/email-agent
- [ ] **"Einstellungen" Tab** geöffnet
- [ ] **Outlook-Account hinzugefügt**:
  - [ ] Name: "Mein Outlook"
  - [ ] E-Mail: deine-email@outlook.com
  - [ ] IMAP Server: outlook.office365.com
  - [ ] IMAP Port: 993
  - [ ] Benutzername: deine-email@outlook.com
  - [ ] Passwort: [dein Passwort]
- [ ] **"Account hinzufügen"** geklickt
- [ ] **Account erscheint** in der Liste

## 🧪 Erste Tests

### Verbindungstest
- [ ] **"Dashboard" Tab** geöffnet
- [ ] **Agent-Status geprüft**:
  - [ ] Mail Manager: "Bereit"
  - [ ] Summary Generator: "Bereit"
  - [ ] Learning Optimizer: "Bereit"
- [ ] **"E-Mail-Agent-Zyklus starten"** geklickt
- [ ] **Verbindung erfolgreich** angezeigt
- [ ] **Keine Fehlermeldungen** im Log

### E-Mail-Abruf Test
- [ ] **"E-Mails" Tab** geöffnet
- [ ] **E-Mails werden angezeigt** (falls vorhanden)
- [ ] **Relevanz-Scores** sichtbar
- [ ] **Status-Informationen** korrekt

### Zusammenfassungen Test
- [ ] **"Zusammenfassungen" Tab** geöffnet
- [ ] **AI-Zusammenfassungen** erstellt (falls relevante E-Mails vorhanden)
- [ ] **Original-E-Mail-Text** sichtbar
- [ ] **Feedback-Buttons** verfügbar

## 📊 Monitoring Setup

### Dashboard-Überwachung
- [ ] **"Dashboard" Tab** regelmäßig prüfen
- [ ] **Letzter Lauf** Zeitstempel sichtbar
- [ ] **Verarbeitete E-Mails** Anzahl korrekt
- [ ] **Erstellte Zusammenfassungen** Anzahl korrekt
- [ ] **Durchschnittliche Relevanz** Score sichtbar

### Feedback-System
- [ ] **Zusammenfassungen bewertet** mit Feedback-Buttons
- [ ] **Positives Feedback** für gute Zusammenfassungen
- [ ] **Negatives Feedback** für schlechte Zusammenfassungen
- [ ] **Verbesserungsvorschläge** gegeben

## 🔍 Troubleshooting

### Verbindungsprobleme
- [ ] **IMAP-Server und Port** korrekt
- [ ] **App-Passwort** verwendet (bei Gmail)
- [ ] **Firewall-Einstellungen** geprüft
- [ ] **E-Mail-Client-Test** durchgeführt

### API-Probleme
- [ ] **Anthropic API Key** in Admin-Einstellungen
- [ ] **API-Keys getestet** in Admin-Interface
- [ ] **Logs geprüft** bei Fehlern

### Performance-Probleme
- [ ] **E-Mail-Anzahl** pro Zyklus begrenzt
- [ ] **Archivierung** alter E-Mails aktiviert
- [ ] **Relevanz-Filter** angepasst

## 🎯 Optimierung

### Automatische Zyklen
- [ ] **30-Minuten-Zyklen** funktionieren
- [ ] **Automatische E-Mail-Abrufe** laufen
- [ ] **Automatische Zusammenfassungen** werden erstellt
- [ ] **Feedback-Verarbeitung** funktioniert

### Prompt-Optimierung
- [ ] **Feedback analysiert** vom Learning Optimizer
- [ ] **Prompts angepasst** basierend auf Feedback
- [ ] **Zusammenfassungsqualität** verbessert
- [ ] **Relevanz-Bewertung** optimiert

## 📈 Erweiterte Features

### Mehrere Accounts
- [ ] **Weitere E-Mail-Accounts** hinzugefügt
- [ ] **Verschiedene Provider** getestet
- [ ] **Account-spezifische Einstellungen** konfiguriert

### Erweiterte Einstellungen
- [ ] **Minimale Relevanz** angepasst
- [ ] **Maximale E-Mails pro Zyklus** gesetzt
- [ ] **Archivierungseinstellungen** konfiguriert
- [ ] **Benachrichtigungen** aktiviert

---

## 🎉 Setup abgeschlossen!

Wenn alle Punkte abgehakt sind, ist dein E-Mail Agent Tool vollständig konfiguriert und einsatzbereit!

**Nächste Schritte:**
1. Regelmäßige Überwachung der automatischen Zyklen
2. Feedback geben für kontinuierliche Verbesserung
3. Weitere E-Mail-Accounts hinzufügen
4. Erweiterte Einstellungen anpassen

**Support:**
- Dokumentation: [docs/email-agent-setup-guide.md](docs/email-agent-setup-guide.md)
- Quick-Start: [docs/email-agent-quickstart.md](docs/email-agent-quickstart.md)
- Admin-Interface: https://family-toolbox.netlify.app/admin/tools 