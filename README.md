# Family Toolbox

Willkommen zur Family Toolbox, einer privaten AI-gesteuerten Webanwendung.

## Tech Stack

- Next.js 14
- NextAuth.js v4
- Tailwind CSS
- Shadcn UI
- Netlify

## Deployment

Die Anwendung wird auf Netlify gehostet. Es gibt zwei Hauptumgebungen:

- **Stage**: `stage--family-toolbox.netlify.app`
- **Production**: `family-toolbox.netlify.app`

### Wichtige Konfigurationsdetails

Das korrekte Deployment auf Netlify, insbesondere für verschiedene Umgebungen (Kontexte), erfordert eine spezielle Konfiguration in der `netlify.toml` und in den Build-Skripten.

- **Build-Kontexte**: Der korrekte Build-Kontext (`staging` oder `production`) muss explizit übergeben werden, um sicherzustellen, dass die richtigen Umgebungsvariablen (z.B. `NEXTAUTH_URL`) geladen werden.
- **Stage-Deploy**: Erfolgt über `npm run deploy:stage`.
- **Produktions-Deploy**: Erfolgt über `npm run deploy:prod`.

Weitere Details sind in der `Deployment.md` dokumentiert.

## 🌐 **Live-App & Repository**

- **🚀 Live-App**: https://family-toolbox.netlify.app/ ✅
- **📁 GitHub**: https://github.com/christianbernecker/family-toolbox ✅
- **🔄 Auto-Deploy**: Aktiviert bei GitHub Push

## 🚀 Features

### 🔧 Bauplan Checker
- PDF-Bauplan-Validation gegen DIN-Normen
- RAG-System (Retrieval-Augmented Generation) für präzise Compliance-Prüfung
- Automatische Erkennung und Analyse von Bauplänen
- Detaillierte Compliance-Berichte mit Handlungsempfehlungen

### 🤖 Multi-Agent System
- Framework für Background-Agents
- E-Mail-Monitoring und Content-Zusammenfassung
- Intelligente Benachrichtigungen
- Zeitgesteuerte Automatisierung mit Cron-Jobs

#### 📧 E-Mail Agent Tool
- **Live-URL**: https://family-toolbox.netlify.app/tools/email-agent
- **Setup-Anleitung**: [docs/email-agent-setup-guide.md](docs/email-agent-setup-guide.md)
- **Quick-Start**: [docs/email-agent-quickstart.md](docs/email-agent-quickstart.md)
- **Features**: IMAP-E-Mail-Abruf, AI-Zusammenfassungen, Feedback-Optimierung

### 📊 JSON Explorer
- JSON Validation und Formatting
- VAST Support für komplexe Datenstrukturen
- Diff-Vergleich und Schema-Validation
- Monaco Editor Integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI
- **Backend**: Supabase, PostgreSQL
- **Authentication**: NextAuth.js mit Google/Apple OAuth
- **AI**: OpenAI GPT-4, Anthropic Claude, RAG mit Embeddings
- **Tools**: PDF Processing, BullMQ für Jobs, Redis

## 📋 Voraussetzungen

- Node.js 18+
- npm oder yarn
- PostgreSQL Datenbank (oder Supabase Account)
- Redis Server (für BullMQ)
- API Keys für:
  - OpenAI
  - Anthropic (optional)
  - Google OAuth
  - Apple OAuth (optional)

## 🚀 Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/family-toolbox.git
cd family-toolbox
```

2. Dependencies installieren:
```bash
npm install
```

3. Netlify CLI installieren (für Deployments):
```bash
npm install -g netlify-cli
```

4. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env.local
```

5. `.env.local` mit Ihren Werten ausfüllen:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379
```

6. Datenbank initialisieren:
```bash
npm run db:migrate
npm run db:seed
```

7. Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` verfügbar.

## 🚀 Deployment

### 🎯 Empfohlen: Dual Deployment (Staging + Production)
```bash
# Automatisches Deployment auf beide URLs
./scripts/deploy-both.sh
```

### Alternative: Einzelne Deployments

#### Stage Deployment:
```bash
npm run deploy:stage
```

#### Production Deployment:
```bash
npm run deploy:prod
```

#### Beide auf einmal:
```bash
npm run deploy:both
```

**URLs:**
- Stage: https://stage--family-toolbox.netlify.app
- Production: https://family-toolbox.netlify.app ✅ (Live-App)

### Tool-spezifische Deployments

#### E-Mail Agent Tool:
```bash
./scripts/deploy-email-agent.sh
```
Deployt automatisch beide URLs für das E-Mail Agent Tool.

## 📁 Projektstruktur

```
family-toolbox/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React Komponenten
│   ├── lib/              # Utilities und Business Logic
│   │   ├── auth/         # Authentication
│   │   ├── supabase/     # Supabase Client
│   │   ├── ai/           # AI Integration
│   │   ├── tools/        # Tool-spezifische Logic
│   │   └── utils/        # Hilfsfunktionen
│   ├── styles/           # Globale Styles
│   └── workers/          # Background Workers
├── public/               # Statische Assets
├── docs/                 # Dokumentation
└── scripts/              # Build und Deploy Scripts
```

## 🎨 Design System

Die Anwendung verwendet ein rot-basiertes Farbschema mit:
- Primary: Rot-Gradient (#ef4444 → #b91c1c)
- Secondary: Orange-Töne
- Dark Mode Unterstützung
- Moderne UI mit Animationen

## 📊 Logging System

Die Anwendung verfügt über ein umfassendes strukturiertes Logging-System:

### Supabase Logs Tabelle
```sql
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  level TEXT NOT NULL, -- 'DEBUG', 'INFO', 'WARN', 'ERROR'
  source TEXT NOT NULL, -- z.B. 'api/settings/api-keys'
  message TEXT NOT NULL,
  user_id TEXT,
  payload JSONB,
  session_id TEXT
);
```

### LogService Features
- ✅ **Zentrale Logging-Klasse** (`LogService`)
- ✅ **Strukturierte Logs** mit Level, Source, Message, Payload
- ✅ **User-Context** - automatische User-ID Zuordnung
- ✅ **Session-Tracking** für Request-Verfolgung
- ✅ **Frontend-Integration** über `/api/log` Route
- ✅ **Server-Side Logging** in allen API-Routen

### Erforderliche Umgebungsvariablen
- `SUPABASE_SERVICE_ROLE_KEY` - Admin-Zugriff für Log-Schreibung
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase-Projekt URL

### Verwendung
```typescript
const logger = LogService.getInstance();
await logger.info('source', 'message', { data: 'payload' }, userId);
```

## 🔒 Sicherheit

- Row Level Security (RLS) in Supabase
- OAuth 2.0 Authentication
- Verschlüsselte Datenspeicherung (AES)
- Rate Limiting für API Endpoints
- Umfassendes Audit-Logging

## 📝 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request mit einer detaillierten Beschreibung Ihrer Änderungen.

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue auf GitHub.
# Mon Jul 21 17:21:29 CEST 2025
# Force deploy Mon Jul 21 17:31:28 CEST 2025
