# Family Toolbox

Eine hochmoderne, AI-gestützte Web-Toolbox für die Familie mit modularer Plugin-Architektur, Multi-Agent-System und nahtloser Integration bestehender Tools.

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

### Stage Deployment:
```bash
npm run deploy:stage
```

### Production Deployment:
```bash
npm run deploy:production
```

**URLs:**
- Stage: https://stage--family-toolbox.netlify.app
- Production: https://family-toolbox.netlify.app ✅ (Live-App)

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

## 🔒 Sicherheit

- Row Level Security (RLS) in Supabase
- OAuth 2.0 Authentication
- Verschlüsselte Datenspeicherung
- Rate Limiting für API Endpoints

## 📝 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request mit einer detaillierten Beschreibung Ihrer Änderungen.

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue auf GitHub.
