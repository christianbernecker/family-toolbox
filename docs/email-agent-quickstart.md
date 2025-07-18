# E-Mail Agent Tool - Quick Start Guide

## 🚀 Schnellstart in 5 Schritten

### 1. Tool aktivieren
- Gehe zu: https://family-toolbox.netlify.app/admin/tools
- Aktiviere "E-Mail Agent"

### 2. E-Mail Agent öffnen
- Gehe zu: https://family-toolbox.netlify.app/tools/email-agent
- Klicke auf "Einstellungen" Tab
- Klicke auf "Account hinzufügen" Button

### 3. Gmail Account hinzufügen
```
Name: Mein Gmail
E-Mail: deine-email@gmail.com
IMAP Server: imap.gmail.com
IMAP Port: 993
Benutzername: deine-email@gmail.com
Passwort: [App-Passwort von Google]
```

### 4. App-Passwort erstellen (für Gmail)
1. https://myaccount.google.com/security
2. 2-Schritt-Verifizierung aktivieren
3. App-Passwort → Mail → 16-Zeichen-Passwort kopieren

### 5. Test-Run starten
- Gehe zum "Dashboard" Tab
- Klicke "E-Mail-Agent-Zyklus starten"
- Prüfe Ergebnisse in "E-Mails" und "Zusammenfassungen" Tabs

## 📧 Gmail App-Passwort Setup

**Wichtig für Gmail-Nutzer:**

1. **2-Schritt-Verifizierung aktivieren**
   - Gehe zu: https://myaccount.google.com/security
   - Aktiviere "2-Schritt-Verifizierung"

2. **App-Passwort erstellen**
   - Gehe zu: https://myaccount.google.com/apppasswords
   - Wähle "Mail" als App
   - Kopiere das 16-Zeichen-Passwort

3. **Im E-Mail Agent verwenden**
   - Verwende das App-Passwort statt deines normalen Passworts
   - Das normale Passwort funktioniert NICHT mit IMAP

## 🔧 Andere E-Mail-Provider

### Outlook/Hotmail
```
IMAP Server: outlook.office365.com
IMAP Port: 993
```

### Yahoo
```
IMAP Server: imap.mail.yahoo.com
IMAP Port: 993
```

### ProtonMail
```
IMAP Server: imap.protonmail.ch
IMAP Port: 993
```

## 🧪 Erste Tests

### Test 1: Verbindung prüfen
- Account hinzufügen
- Dashboard → "E-Mail-Agent-Zyklus starten"
- Prüfe ob "Verbindung erfolgreich" angezeigt wird

### Test 2: E-Mails abrufen
- Nach erfolgreicher Verbindung
- Prüfe "E-Mails" Tab
- Sollte deine E-Mails anzeigen

### Test 3: Zusammenfassungen
- Prüfe "Zusammenfassungen" Tab
- AI sollte Zusammenfassungen für relevante E-Mails erstellen

## 🆘 Häufige Probleme

### "Verbindung fehlgeschlagen"
- ✅ App-Passwort verwenden (bei Gmail)
- ✅ IMAP-Server und Port prüfen
- ✅ Firewall-Einstellungen prüfen

### "Keine E-Mails gefunden"
- ✅ Postfach hat E-Mails
- ✅ Account korrekt konfiguriert
- ✅ Warte auf nächsten Zyklus

### "Zusammenfassungen werden nicht erstellt"
- ✅ Anthropic API Key in Admin-Einstellungen
- ✅ API-Keys testen in Admin-Interface

## 📊 Dashboard-Übersicht

- **Mail Manager**: Verbindet sich mit E-Mail-Accounts
- **Summary Generator**: Erstellt AI-Zusammenfassungen
- **Learning Optimizer**: Verarbeitet Feedback
- **Letzter Lauf**: Zeitstempel des letzten Zyklus
- **Verarbeitete E-Mails**: Anzahl im aktuellen Zyklus

## 🎯 Nächste Schritte

1. **Feedback geben** bei Zusammenfassungen
2. **Weitere E-Mail-Accounts** hinzufügen
3. **Automatische Zyklen** überwachen
4. **Prompts optimieren** basierend auf Feedback

---

**Viel Erfolg! 🚀** 