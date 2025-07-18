# Deployment

Dieses Dokument beschreibt den Deployment-Prozess für die Family Toolbox auf Netlify.

## Deployment-Workflow

Unser aktueller Workflow ist klar und einfach gehalten. Wir verwenden die Haupt-URL von Netlify als unsere primäre Staging-Umgebung.

- **Staging-Umgebung**: `https://family-toolbox.netlify.app`  _(Haupt-URL auf Netlify – alle Deploys mit `npm run deploy:stage` oder Push auf `main` landen hier)_\n- **Produktions-Umgebung (geplant)**: `https://family-toolbox.de`  _(wird erst aktiviert, wenn wir einen stabilen Release-Kandidaten haben; bis dahin bleibt diese Domain unkonfiguriert)_

### Staging-Deployment

Jeder Push auf den `main`-Branch oder ein manueller Deploy mit `npm run deploy` aktualisiert die Staging-Umgebung. Der Befehl ist im `package.json` hinterlegt:

```json
"scripts": {
  "deploy": "netlify deploy --build --prod"
}
```

Das `--prod`-Flag sorgt dafür, dass der Deploy auf der Haupt-URL von Netlify veröffentlicht wird, die wir als unsere Staging-Umgebung definiert haben.

### Produktions-Deployment (Zukunft)

Ein Skript `deploy:prod` ist als Platzhalter vorhanden. Wenn die Produktions-Domain eingerichtet ist, wird dieses Skript konfiguriert, um auf die Live-Domain zu deployen.

## Wichtige Erkenntnisse

- **Netlify Build Kontexte**: Manuelle Deploys über die Netlify CLI verwenden standardmäßig den `production`-Kontext, selbst wenn ein `--alias` wie `stage` gesetzt wird. Dies führt dazu, dass falsche Umgebungsvariablen geladen werden.
- **Die Lösung**: Der Build-Kontext muss explizit über die Umgebungsvariable `CONTEXT` gesetzt werden.

## Stage-Deployment

Für ein Stage-Deployment muss der `CONTEXT` auf `staging` gesetzt werden.

```bash
CONTEXT=staging netlify deploy --build --alias=stage
```

Dies ist im `package.json` als Skript `deploy:stage` hinterlegt:

```json
"scripts": {
  "deploy:stage": "CONTEXT=staging netlify deploy --build --alias=stage"
}
```

Dadurch werden die korrekten Einstellungen und Umgebungsvariablen aus dem `[context.staging]`-Block in der `netlify.toml` geladen.

## Produktions-Deployment

Ein Produktions-Deployment wird mit dem `--prod`-Flag durchgeführt und verwendet automatisch den `production`-Kontext.

```bash
netlify deploy --prod
```

Dies ist im `package.json` als Skript `deploy:prod` hinterlegt.

## ⚠️ WICHTIG: Konfiguration vor jedem Deploy prüfen

### 1. Next.js Konfiguration prüfen
Stelle sicher, dass `next.config.js` im **CommonJS-Format** vorliegt:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; // ❌ NICHT: export default nextConfig
```

### 2. Build-Test vor Deploy
```bash
npm run build
```
**Muss ohne Fehler durchlaufen!** Eventuelle Warnungen sind ok.

## 🚀 Deploy-Prozess (Empfohlene Reihenfolge)

### ⚠️ Automatischer GitHub Deploy funktioniert derzeit nicht
**Verwende IMMER manuelle Netlify Deploys!**

### 🎯 Empfohlen: Dual Deployment (Staging + Production)
```bash
# Automatisches Deployment auf beide URLs
./scripts/deploy-both.sh
```

**URLs:**
- Staging: https://stage--family-toolbox.netlify.app
- Production: https://family-toolbox.netlify.app

### Alternative: Einzelne Deployments

#### 1. Stage Deploy
```bash
npm run deploy:stage
```
**URL:** https://stage--family-toolbox.netlify.app

#### 2. Production Deploy
```bash
npm run deploy:prod
```
**URL:** https://family-toolbox.netlify.app

#### 3. Beide auf einmal
```bash
npm run deploy:both
```

### Tool-spezifische Deployments

#### E-Mail Agent Tool
```bash
./scripts/deploy-email-agent.sh
```
Deployt automatisch beide URLs für das E-Mail Agent Tool.

## 🔧 Troubleshooting

### Problem: "module is not defined in ES module scope"
**Lösung:** next.config.js zu CommonJS-Format ändern (siehe oben)

### Problem: Build-Fehler
**Lösung:** 
1. `npm run build` lokal ausführen
2. Fehler beheben
3. Erneut testen

### Problem: Automatischer Deploy funktioniert nicht
**Lösung:** 
- Verwende **immer** manuelle Netlify Deploys
- GitHub Push triggert NICHT automatisch einen Deploy
- Manuelle Deploys sind zuverlässiger

## 🌐 Production Deployment

### Production Deploy Checkliste:
- [ ] `npm run build` erfolgreich
- [ ] Stage Deploy getestet
- [ ] Alle User-Anforderungen erfüllt
- [ ] Keine kritischen Bugs
- [ ] Authentifizierung funktioniert
- [ ] Admin-Interface getestet

### Production Deploy Befehl:
```bash
npm run deploy:production
```

### Nach Production Deploy:
- URL testen: https://family-toolbox.netlify.app
- Login-Funktionalität prüfen
- Tool-Aktivierung testen
- Mobile Ansicht prüfen

## 📝 Deploy Scripts (package.json)

Diese Scripts sind bereits konfiguriert:

```json
{
  "scripts": {
    "deploy:stage": "CONTEXT=staging netlify deploy --build --alias=stage",
    "deploy:prod": "netlify deploy --build --prod",
    "deploy:both": "npm run deploy:stage && npm run deploy:prod",
    "deploy:review": "npm run build"
  }
}
```

## ⚙️ Netlify Konfiguration

Die `netlify.toml` ist bereits konfiguriert:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NEXT_PUBLIC_STAGE = "production"

[context.branch-deploy.environment]
  NEXT_PUBLIC_STAGE = "staging"

[context.deploy-preview.environment]
  NEXT_PUBLIC_STAGE = "preview"
```

## 🔍 Review-Prozess

### Vor Stage Deploy:
1. **Code-Qualität prüfen**: Alle Änderungen committed?
2. **User-Anforderungen**: Alle Anforderungen umgesetzt?
3. **Build-Test**: `npm run build` erfolgreich?
4. **Konfiguration**: next.config.js korrekt?

### Nach Stage Deploy:
1. **Funktionalität**: Alle Features testen
2. **Design**: Responsive Design prüfen
3. **Performance**: Ladezeiten acceptable?
4. **Benutzerfreundlichkeit**: UX wie erwartet?

## 🔐 Umgebungsvariablen

Alle Umgebungsvariablen sind in Netlify Dashboard konfiguriert:

### Supabase (Datenbank)
- `NEXT_PUBLIC_SUPABASE_URL` - Projekt-URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Öffentlicher Client-Key
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **Admin-Key für Logging-System** (kritisch!)

### NextAuth (Authentication)
- `NEXTAUTH_SECRET` - JWT-Verschlüsselung
- `NEXTAUTH_URL` - App-URL (kontext-abhängig)
- `GOOGLE_CLIENT_ID` - OAuth Credential
- `GOOGLE_CLIENT_SECRET` - OAuth Secret

### Verschlüsselung & Sicherheit
- `ENCRYPTION_KEY` - AES-Schlüssel für API-Key-Verschlüsselung

### API Keys (KI-Services)
- `OPENAI_API_KEY` - OpenAI GPT/Claude (optional)
- `ANTHROPIC_API_KEY` - Claude API (optional)

### ⚠️ Kritische Konfiguration für Logging:
Der `SUPABASE_SERVICE_ROLE_KEY` wird vom LogService benötigt, um in die `logs`-Tabelle zu schreiben. Ohne diesen Key funktioniert das Logging-System nicht!

## 📊 Monitoring & Logs

### Anwendungs-Logging (Supabase)
Die App verfügt über ein umfassendes strukturiertes Logging-System:
- **Database Table**: `logs` (automatisch befüllt)
- **Frontend-Logs**: Über `/api/log` Route
- **Server-Logs**: Automatisch in allen API-Routen
- **User-Context**: Logs werden User-spezifisch gespeichert
- **Session-Tracking**: Request-Verfolgung über Session-ID

### Logs einsehen:
```sql
-- In Supabase SQL Editor:
SELECT created_at, level, source, message, user_id, payload 
FROM logs 
ORDER BY created_at DESC 
LIMIT 50;
```

### Nach erfolgreichem Deploy:
- **Netlify Dashboard**: Build-Logs prüfen
- **Live-Test**: Homepage aufrufen
- **Authentication**: Google Login testen  
- **Admin-Interface**: Tool-Aktivierung testen
- **Logging-Test**: API-Key Seite laden → Logs-Tabelle prüfen

### Build-Logs einsehen:
- Netlify Dashboard → Deploys → Build-Log
- Fehler-Logs für Debugging verwenden
- Supabase → SQL Editor → `logs` Tabelle für Runtime-Logs

## 🎯 Schnell-Deploy (Zusammenfassung)

```bash
# 1. Build testen
npm run build

# 2. Stage Deploy
npm run deploy:stage

# 3. Stage testen (https://stage--family-toolbox.netlify.app)

# 4. Production Deploy
npm run deploy:production

# 5. Live testen (https://family-toolbox.netlify.app)
```

## 📋 Deploy-Checkliste

### Vor jedem Deploy:
- [ ] next.config.js ist CommonJS-Format
- [ ] `npm run build` erfolgreich
- [ ] Alle Änderungen committed
- [ ] README.md gelesen (falls Updates)

### Nach Stage Deploy:
- [ ] Homepage lädt korrekt
- [ ] Login funktioniert
- [ ] Tools werden angezeigt
- [ ] Admin-Interface funktioniert
- [ ] API-Keys korrekt angezeigt ("SET" vs "Nicht festgelegt")
- [ ] Logging-System funktioniert (Logs in Supabase)
- [ ] Responsive Design ok

### Nach Production Deploy:
- [ ] Live-URL funktioniert
- [ ] Alle Features getestet
- [ ] Performance acceptable
- [ ] Benutzer informiert (falls nötig)

**⚠️ Wichtig: Immer Stage → Production Deploy Reihenfolge einhalten!** 