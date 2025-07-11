# Deployment Anweisungen

## 🚀 Stage Deployment

Das Stage Deployment wird automatisch nach jedem Entwicklungsschritt durchgeführt.

### Manueller Stage Deploy:
```bash
npm run deploy:stage
```

### Stage Deploy Prozess:
1. Code-Änderungen werden geprüft
2. Tests werden ausgeführt
3. Build wird erstellt
4. Deployment auf Netlify Stage-Umgebung

### Stage URL:
- https://stage--family-toolbox.netlify.app

## 🌐 Production Deployment

Production Deployments werden **nur nach expliziter Aufforderung** durchgeführt.

### Production Deploy:
```bash
npm run deploy:production
```

### Production Deploy Checkliste:
- [ ] Alle Features wurden auf Stage getestet
- [ ] Keine kritischen Bugs vorhanden
- [ ] Datenbank-Migrationen vorbereitet
- [ ] Umgebungsvariablen aktualisiert
- [ ] Backup erstellt

### Production URL:
- https://family-toolbox.netlify.app (aktuelle Live-App)

## 📝 Deploy Scripts

Füge diese Scripts zur `package.json` hinzu:

```json
{
  "scripts": {
    "deploy:stage": "netlify deploy --build --alias=stage",
    "deploy:production": "netlify deploy --build --prod",
    "deploy:review": "npm run build && npm run test"
  }
}
```

## 🔍 Review vor Deploy

Vor jedem Stage Deploy wird automatisch ein Review durchgeführt:
1. Code-Qualität prüfen
2. User-Anforderungen checken
3. Tests ausführen
4. Build erstellen

## ⚙️ Netlify Konfiguration

Erstelle eine `netlify.toml`:

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

## 🔐 Umgebungsvariablen

Stelle sicher, dass alle Umgebungsvariablen in Netlify konfiguriert sind:
- Für Stage: Verwende Test-API-Keys
- Für Production: Verwende Production-API-Keys

## 📊 Monitoring

Nach dem Deployment:
- Überprüfe Logs in Netlify Dashboard
- Monitore Performance Metriken
- Teste kritische User Flows 