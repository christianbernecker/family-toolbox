# 🔄 Development Workflow - Family Toolbox

## 📋 **Überblick**

Unsere Entwicklungspipeline basiert auf GitHub als zentralem Repository und Netlify für automatisches Deployment.

## 🔗 **System-URLs**

- **🚀 Live-App**: https://family-toolbox.netlify.app/
- **📁 GitHub**: https://github.com/christianbernecker/family-toolbox
- **🔧 Netlify**: https://app.netlify.com/sites/family-toolbox
- **🗄️ Supabase**: https://supabase.com/dashboard

---

## 🔄 **Standard-Entwicklungsprozess**

### **1. Lokale Entwicklung**
```bash
# Repository klonen (einmalig)
git clone https://github.com/christianbernecker/family-toolbox.git
cd family-toolbox

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### **2. Änderungen machen**
```bash
# Feature entwickeln
# Code ändern...

# Build-Test (vor Commit)
npm run build

# Änderungen committen
git add .
git commit -m "feat: Beschreibung der Änderung"
```

### **3. Zu GitHub pushen**
```bash
# Push zu GitHub (triggert automatisches Deployment)
git push origin main
```

### **4. Automatisches Deployment**
- ✅ **GitHub Push** → Triggert Netlify Build
- ✅ **Netlify Build** → `npm run build`
- ✅ **Deployment** → Live auf https://family-toolbox.netlify.app/
- ✅ **Notification** → Deployment-Status in Netlify Dashboard

---

## 🛠️ **Commit-Konventionen**

### **Commit-Message Format**
```
<type>: <description>

[optional body]
```

### **Commit-Types**
- `feat:` Neue Features
- `fix:` Bug-Fixes
- `docs:` Dokumentation
- `refactor:` Code-Refactoring
- `test:` Tests
- `chore:` Wartungsaufgaben

### **Beispiele**
```bash
git commit -m "feat: Bauplan-Checker PDF-Upload implementiert"
git commit -m "fix: Supabase-Verbindung bei größeren Dateien"
git commit -m "docs: Deployment-Anweisungen aktualisiert"
```

---

## 🚀 **Deployment-Strategien**

### **Automatisches Deployment**
- **Trigger**: Jeder Push zu `main` Branch
- **Build**: `npm run build`
- **Deploy**: Automatisch zu Production
- **Rollback**: Über Netlify Dashboard möglich

### **Manuelles Deployment**
```bash
# Nur bei Bedarf (falls automatisch nicht funktioniert)
npm run deploy:production
```

### **Stage-Deployment**
```bash
# Für Tests vor Production
npm run deploy:stage
```

---

## 🔍 **Qualitätssicherung**

### **Pre-Commit Checks**
```bash
# Vor jedem Commit ausführen
npm run build          # Build-Test
npm run lint           # Code-Qualität
# npm run test         # Tests (wenn verfügbar)
```

### **Code-Review Prozess**
1. **Build-Test** lokal erfolgreich
2. **User-Anforderungen** geprüft
3. **Dokumentation** aktualisiert
4. **Commit** mit aussagekräftiger Message
5. **Push** zu GitHub
6. **Deployment** überwachen

---

## 📊 **Monitoring & Debugging**

### **Deployment-Status prüfen**
- **Netlify**: https://app.netlify.com/sites/family-toolbox/deploys
- **GitHub**: https://github.com/christianbernecker/family-toolbox/actions
- **Live-App**: https://family-toolbox.netlify.app/

### **Logs überwachen**
```bash
# Netlify Function Logs
netlify logs

# Supabase Logs
# → Supabase Dashboard → Logs

# Browser DevTools
# → F12 → Console
```

### **Häufige Probleme**
1. **Build-Fehler**: `npm run build` lokal testen
2. **Environment-Vars**: Netlify Dashboard prüfen
3. **Supabase-Verbindung**: API-Keys validieren

---

## 🎯 **Best Practices**

### **Entwicklung**
- ✅ **Kleine Commits** mit klaren Messages
- ✅ **Build-Test** vor jedem Push
- ✅ **Environment-Variablen** nie committen
- ✅ **Dokumentation** aktuell halten

### **Deployment**
- ✅ **Auto-Deploy** für schnelle Iteration
- ✅ **Rollback-Plan** bei Problemen
- ✅ **Monitoring** nach Deployment
- ✅ **User-Testing** nach Features

### **Sicherheit**
- ✅ **API-Keys** nur in Environment Variables
- ✅ **Sensitive Daten** in .gitignore
- ✅ **Supabase RLS** für Datenschutz
- ✅ **HTTPS** für alle Endpoints

---

## 🔧 **Nützliche Commands**

### **Git-Workflows**
```bash
# Status prüfen
git status

# Änderungen anzeigen
git diff

# Commit-Historie
git log --oneline

# Remote-Status
git remote -v
```

### **Deployment-Commands**
```bash
# Build-Test
npm run build

# Lokaler Dev-Server
npm run dev

# Production-Deploy
npm run deploy:production

# Stage-Deploy
npm run deploy:stage
```

### **Debugging**
```bash
# Netlify CLI
npm install -g netlify-cli
netlify login
netlify status

# Supabase CLI (optional)
npm install -g supabase
supabase login
```

---

## 🎉 **Workflow-Zusammenfassung**

### **Daily Development Flow**
1. `git pull origin main` - Aktuellste Version holen
2. `npm run dev` - Entwicklungsserver starten
3. **Code ändern** - Features entwickeln
4. `npm run build` - Build-Test
5. `git add . && git commit -m "feat: ..."` - Committen
6. `git push origin main` - Push zu GitHub
7. **Deployment überwachen** - Netlify Dashboard
8. **Live-App testen** - https://family-toolbox.netlify.app/

### **🚀 Automatisierung**
- **GitHub Push** → **Netlify Build** → **Live Deployment**
- **Kein manueller Deployment-Schritt nötig**
- **Kontinuierliche Integration aktiviert**

---

**Happy Coding! 🚀✨** 