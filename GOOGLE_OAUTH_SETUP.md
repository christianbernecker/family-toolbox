# Google OAuth Setup für Family Toolbox

## 🔧 **Problem**: "Page not found" beim Google Login

Das Problem liegt an der **Google OAuth Konfiguration**. Die App kann sich nicht bei Google authentifizieren.

## 📋 **Lösung: Google Console konfigurieren**

### 1. **Google Cloud Console öffnen**
- Gehe zu: https://console.cloud.google.com/
- Melde dich mit deinem Google-Konto an

### 2. **Projekt auswählen oder erstellen**
- Wähle ein bestehendes Projekt oder erstelle ein neues
- Projekt-Name: z.B. "Family Toolbox"

### 3. **APIs & Services aktivieren**
- Navigiere zu: **APIs & Services** → **Library**
- Suche nach "Google+ API" oder "Google Identity"
- Aktiviere die **Google+ API**

### 4. **OAuth Consent Screen konfigurieren**
- Gehe zu: **APIs & Services** → **OAuth consent screen**
- **User Type**: External (für private Apps)
- **App name**: Family Toolbox
- **User support email**: chr.bernecker@gmail.com
- **Developer contact email**: chr.bernecker@gmail.com
- **Authorized domains**: `netlify.app`

### 5. **Credentials erstellen**
- Gehe zu: **APIs & Services** → **Credentials**
- Klicke **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
- **Application type**: Web application
- **Name**: Family Toolbox Web Client

### 6. **🚨 WICHTIG: Authorized redirect URIs konfigurieren**
Füge genau diese URLs hinzu:
```
https://family-toolbox.netlify.app/api/auth/callback/google
https://stage--family-toolbox.netlify.app/api/auth/callback/google
```

### 7. **Client ID und Secret kopieren**
- Nach der Erstellung siehst du:
  - **Client ID**: `xyz123.apps.googleusercontent.com`
  - **Client Secret**: `ABC123-xyz`
- ⚠️ **Diese Werte benötigst du für Netlify!**

## 🌐 **Netlify Environment Variables konfigurieren**

### Netlify Dashboard öffnen:
1. Gehe zu: https://app.netlify.com/
2. Wähle dein **family-toolbox** Projekt
3. Gehe zu: **Site Settings** → **Environment Variables**

### Environment Variables hinzufügen:
```bash
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://family-toolbox.netlify.app
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### ⚠️ **Wichtige Werte:**
- **NEXTAUTH_SECRET**: Ein starkes, zufälliges Passwort (mindestens 32 Zeichen)
- **GOOGLE_CLIENT_ID**: Die Client ID aus Google Console
- **GOOGLE_CLIENT_SECRET**: Das Client Secret aus Google Console

## 🧪 **Nach der Konfiguration:**

1. **Deploy triggern**: Jede Änderung an Environment Variables erfordert einen neuen Deploy
2. **Testen**: https://family-toolbox.netlify.app
3. **Debug**: Falls Probleme auftreten, siehe Function Logs in Netlify

## 🔍 **Troubleshooting**

### "Page not found" beim Login:
- ✅ Redirect URIs in Google Console richtig konfiguriert?
- ✅ Environment Variables in Netlify gesetzt?
- ✅ Deploy nach Environment Variable Änderungen?

### "Access denied":
- ✅ OAuth Consent Screen konfiguriert?
- ✅ Email-Adresse autorisiert?

### "Invalid client":
- ✅ GOOGLE_CLIENT_ID korrekt kopiert?
- ✅ Domain in Google Console autorisiert?

## 📞 **Support**

Falls das Login immer noch nicht funktioniert:
1. Prüfe Netlify Function Logs
2. Prüfe Google Console Error Logs
3. Teste mit Chrome Developer Tools (Network Tab)

---

**🎯 Ziel**: Nach dieser Konfiguration sollte das Google Login funktionieren und autorisierte Benutzer zur Tool-Übersicht weiterleiten. 