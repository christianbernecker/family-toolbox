# Deployment

Dieses Dokument beschreibt den Deployment-Prozess für die Family Toolbox auf Netlify.

## 🎯 PRIMÄRES DEPLOYMENT-ZIEL

**ALLE DEPLOYS ERFOLGEN AUF: `https://family-toolbox.netlify.app`**

Dies ist unsere einzige und primäre Live-Umgebung. Alle Entwicklungsänderungen werden direkt hierhin deployed.

## Deployment-Workflow

Unser aktueller Workflow ist klar und einfach gehalten:

- **Live-Umgebung**: `https://family-toolbox.netlify.app` _(Haupt-URL auf Netlify – alle Deploys landen hier)_
- **Produktions-Domain (zukünftig geplant)**: `https://family-toolbox.de` _(wird erst aktiviert, wenn wir einen stabilen Release-Kandidaten haben)_

## Automatisches Deployment

**Jeder Push auf den `main`-Branch wird automatisch auf `https://family-toolbox.netlify.app` deployed.**

Dies ist über die GitHub-Integration in Netlify konfiguriert und benötigt keine manuellen Schritte.

## Manuelles Deployment

Falls manueller Deploy benötigt wird:

```bash
npm run deploy
```

Dieser Befehl ist im `package.json` definiert:

```json
"scripts": {
  "deploy": "netlify deploy --build --prod"
}
```

Das `--prod`-Flag sorgt dafür, dass der Deploy auf der Haupt-URL von Netlify (`https://family-toolbox.netlify.app`) veröffentlicht wird.

## ✅ Deployment-Checklist

Vor jedem Deploy sicherstellen:

1. **API Keys funktionieren**: https://family-toolbox.netlify.app/admin/api-keys
2. **Code-Qualität**: Alle TypeScript-Fehler behoben
3. **Tests bestanden**: Kritische Funktionen getestet
4. **Git Status sauber**: `git status` zeigt keine uncommitted changes

## Deployment-Status prüfen

Nach einem Deploy:

1. **Site besuchen**: https://family-toolbox.netlify.app
2. **Admin-Panel prüfen**: https://family-toolbox.netlify.app/admin
3. **API Keys testen**: https://family-toolbox.netlify.app/admin/api-keys  
4. **Email Agent prüfen**: https://family-toolbox.netlify.app/tools/email-agent

## Netlify-Konfiguration

Die Netlify-Konfiguration ist in `netlify.toml` definiert:

```toml
[build]
  command = "echo '>>> Building with Netlify context:' $CONTEXT && npm run build"
  publish = ".next"

[context.production]
  command = "echo '>>> Building with Netlify context:' $CONTEXT && npm run build"
  
  [context.production.environment]
    NEXTAUTH_URL = "https://family-toolbox.netlify.app"
```

## Troubleshooting

### Build-Fehler

Falls der Build fehlschlägt:

1. **Lokal testen**: `npm run build`
2. **Dependencies prüfen**: `npm install`
3. **TypeScript-Fehler beheben**: `npm run lint`

### Deployment-Fehler

Falls der Deploy fehlschlägt:

1. **Netlify Dashboard prüfen**: https://app.netlify.com
2. **Build-Logs ansehen**
3. **Umgebungsvariablen prüfen**

## 🚀 Schnell-Deploy

Für schnelle Änderungen:

```bash
git add .
git commit -m "Quick fix: [Beschreibung]"
git push origin main
# → Automatischer Deploy auf https://family-toolbox.netlify.app
```

## Legacy-Informationen

Die folgenden Befehle sind noch verfügbar, aber normalerweise nicht nötig:

```json
"scripts": {
  "deploy:stage": "CONTEXT=staging netlify deploy --build --alias=stage"
}
```

**Hinweis**: Diese Befehle sind Überbleibsel aus einer früheren Konfiguration. Alle Deploys sollten auf die Haupt-URL erfolgen. 