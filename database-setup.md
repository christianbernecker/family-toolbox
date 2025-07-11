# Database Setup - Supabase für Family Toolbox

## 🚀 **Schritt-für-Schritt Anleitung**

### **1. Supabase-Projekt erstellen**

1. Gehe zu [supabase.com](https://supabase.com) und melde dich an
2. Klicke auf "New Project"
3. Wähle deine Organisation aus
4. Projektname: `family-toolbox`
5. Database Password: Sichere Passwort generieren
6. Region: `Frankfurt (eu-central-1)` (näher zu Deutschland)
7. Klicke auf "Create new project"

### **2. Projekt-URLs und API-Keys abrufen**

Nach der Projekterstellung findest du unter **Settings → API**:

- **Project URL**: `https://[projekt-id].supabase.co`
- **Anon (public) Key**: `eyJ...` (für Client-Side Requests)
- **Service Role Key**: `eyJ...` (für Server-Side Requests - **GEHEIM!**)

### **3. Environment-Variablen konfigurieren**

Erstelle eine `.env.local` Datei (falls noch nicht vorhanden):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[deine-projekt-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[dein-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJ[dein-service-role-key]

# NextAuth Configuration (bereits vorhanden)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-replace-in-production

# Google OAuth (konfiguriere diese später)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **4. Database Schema ausführen**

#### **4.1 Über Supabase Dashboard (Empfohlen)**

1. Gehe zu deinem Supabase-Projekt Dashboard
2. Klicke auf **SQL Editor** in der Seitenleiste
3. Erstelle eine neue Query
4. Kopiere den Inhalt von `supabase/schema.sql` und führe ihn aus
5. Wiederhole mit `supabase/rls-policies.sql`

#### **4.2 Über Supabase CLI (Alternativ)**

```bash
# Supabase CLI installieren
npm install -g supabase

# Mit deinem Projekt verbinden
supabase link --project-ref [deine-projekt-id]

# Schema migrations ausführen
supabase db push
```

### **5. Test-Daten einfügen (Optional)**

Für die Entwicklung kannst du Test-Daten einfügen:

1. Öffne den **SQL Editor** in Supabase
2. Kopiere den Inhalt von `supabase/test-data.sql`
3. Führe das Script aus

### **6. Storage Buckets erstellen**

Für File-Uploads benötigst du Storage Buckets:

1. Gehe zu **Storage** in der Supabase Seitenleiste
2. Klicke auf "Create a new bucket"
3. Name: `bauplan-uploads`
4. Public: **Nein** (Private bucket)
5. Klicke auf "Create bucket"

### **7. Storage Policies konfigurieren**

Im **SQL Editor** ausführen:

```sql
-- Bauplan-Uploads Bucket Policy
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bauplan-uploads', 'bauplan-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies für sichere Uploads
CREATE POLICY "Users can upload their own bauplans" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own bauplans" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own bauplans" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### **8. NextAuth.js mit Supabase konfigurieren**

Die Auth-Konfiguration in `src/lib/auth/config.ts` ist bereits für Supabase vorbereitet.

### **9. Verbindung testen**

Starte den Development Server und teste die Verbindung:

```bash
npm run dev
```

Die App sollte jetzt ohne Supabase-Fehler starten.

## 📋 **Tabellen-Übersicht**

### **Core Tables**
- `users` - Benutzer-Daten (NextAuth)
- `accounts` - OAuth-Accounts (NextAuth)
- `sessions` - Login-Sessions (NextAuth)
- `verification_tokens` - Email-Verifikation (NextAuth)

### **Family Toolbox Tables**
- `user_tool_settings` - Tool-Aktivierungen pro User
- `bauplan_analyses` - Bauplan-Checker Ergebnisse
- `agent_configurations` - Multi-Agent System Konfigurationen
- `agent_results` - Agent-Ausführungsergebnisse
- `file_uploads` - Allgemeine Datei-Uploads
- `audit_logs` - System-Audit für Compliance

## 🔐 **Sicherheit**

### **Row Level Security (RLS)**
- Alle User-Daten sind durch RLS geschützt
- User können nur ihre eigenen Daten sehen/bearbeiten
- Service Role hat Admin-Zugriff für Background-Jobs

### **API-Keys Sicherheit**
- **Anon Key**: Safe für Client-Side Code
- **Service Role Key**: NUR für Server-Side Code, NIEMALS im Client!

### **Storage Security**
- Private Buckets - kein öffentlicher Zugriff
- User können nur eigene Uploads sehen
- Pfad-basierte Isolation: `/user-id/filename`

## 🛠️ **Troubleshooting**

### **Häufige Probleme:**

#### **"Missing Supabase environment variables"**
- Prüfe `.env.local` Datei
- Stelle sicher dass alle Keys korrekt kopiert sind
- Restart des Development Servers

#### **"Invalid JWT"**
- Service Role Key falsch kopiert
- Anon Key statt Service Role Key verwendet

#### **"Table does not exist"**
- Schema noch nicht ausgeführt
- Falsche Datenbank-Verbindung

#### **"Row Level Security violated"**
- RLS Policies noch nicht konfiguriert
- User nicht authentifiziert

### **Debug Commands:**

```bash
# Supabase Status prüfen
npx supabase status

# Lokale Datenbank zurücksetzen
npx supabase db reset

# Migrations anzeigen
npx supabase migration list
```

## 📊 **Monitoring**

### **Supabase Dashboard Überwachung:**
- **Logs**: Fehler und Warnungen überwachen
- **API**: Request-Volumen und Performance
- **Auth**: Login-Aktivitäten
- **Storage**: Speicherverbrauch

### **Production Monitoring:**
- Setze Alert-Regeln für API-Limits
- Überwache Database-Performance
- Beobachte Storage-Kosten

## 💰 **Kosten-Management**

### **Supabase Pricing:**
- **Free Tier**: 500MB DB, 1GB Storage, 2GB Transfer
- **Pro Tier**: $25/Monat für größere Projekte
- **Familie Toolbox Schätzung**: Free Tier ausreichend für 2-3 User

### **Optimierungen:**
- Regelmäßige Cleanup von alten Agent-Results
- Komprimierung von File-Uploads
- Effiziente Queries mit Limits

Mit diesem Setup ist die Database-Infrastruktur für die Family Toolbox vollständig einsatzbereit! 🚀 