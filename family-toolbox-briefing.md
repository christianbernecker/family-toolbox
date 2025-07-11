# Family Toolbox - Comprehensive Technical Implementation Brief

## Executive Summary
Entwicklung einer hochmodernen, AI-gestützten Web-Toolbox für die Familie mit modularer Plugin-Architektur, Multi-Agent-System und nahtloser Integration bestehender Tools. Die Anwendung soll als zentrale Plattform für verschiedene Automatisierungs- und Analysetools dienen.

---

## 🏗️ TECHNISCHE ARCHITEKTUR

### Core Technology Stack
```typescript
// Package.json Dependencies (Hauptkomponenten)
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "next-auth": "^4.24.5",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.24",
    "@ai-sdk/anthropic": "^0.0.20",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",
    "lucide-react": "^0.344.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-progress": "^1.0.3",
    "framer-motion": "^10.16.16",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "pdf-parse": "^1.1.1",
    "pdf2pic": "^3.0.2",
    "node-cron": "^3.0.3",
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2",
    "react-dropzone": "^14.2.3",
    "react-json-view": "^1.21.3",
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0",
    "recharts": "^2.8.0",
    "react-virtual": "^2.10.4"
  }
}
```

### Project Structure (Complete)
```
family-toolbox/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── README.md
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── icons/
│   ├── images/
│   └── uploads/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   ├── signout/
│   │   │   │   └── page.tsx
│   │   │   └── error/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   ├── tools/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── [toolId]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── bauplan-checker/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── upload/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── results/
│   │   │   │   │   └── [reportId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── history/
│   │   │   │       └── page.tsx
│   │   │   ├── json-explorer/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── validator/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── diff/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── formatter/
│   │   │   │       └── page.tsx
│   │   │   └── multi-agent/
│   │   │       ├── page.tsx
│   │   │       ├── agents/
│   │   │       │   └── [agentId]/
│   │   │       │       └── page.tsx
│   │   │       ├── create/
│   │   │       │   └── page.tsx
│   │   │       └── logs/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── tools/
│   │       │   ├── route.ts
│   │       │   ├── [toolId]/
│   │       │   │   └── route.ts
│   │       │   ├── bauplan-checker/
│   │       │   │   ├── upload/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── analyze/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── reports/
│   │       │   │   │   └── route.ts
│   │       │   │   └── din-normes/
│   │       │   │       └── route.ts
│   │       │   ├── json-explorer/
│   │       │   │   ├── validate/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── format/
│   │       │   │   │   └── route.ts
│   │       │   │   └── diff/
│   │       │   │       └── route.ts
│   │       │   └── multi-agent/
│   │       │       ├── agents/
│   │       │       │   ├── route.ts
│   │       │       │   ├── [agentId]/
│   │       │       │   │   ├── route.ts
│   │       │       │   │   ├── start/
│   │       │       │   │   │   └── route.ts
│   │       │       │   │   ├── stop/
│   │       │       │   │   │   └── route.ts
│   │       │       │   │   └── logs/
│   │       │       │   │       └── route.ts
│   │       │       ├── schedules/
│   │       │       │   └── route.ts
│   │       │       └── notifications/
│   │       │           └── route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   ├── [userId]/
│   │       │   │   ├── route.ts
│   │       │   │   ├── tools/
│   │       │   │   │   └── route.ts
│   │       │   │   └── settings/
│   │       │   │       └── route.ts
│   │       │   └── me/
│   │       │       └── route.ts
│   │       ├── uploads/
│   │       │   ├── route.ts
│   │       │   └── [fileId]/
│   │       │       └── route.ts
│   │       ├── ai/
│   │       │   ├── chat/
│   │       │   │   └── route.ts
│   │       │   ├── analyze/
│   │       │   │   └── route.ts
│   │       │   └── embed/
│   │       │       └── route.ts
│   │       ├── webhook/
│   │       │   ├── supabase/
│   │       │   │   └── route.ts
│   │       │   └── agents/
│   │       │       └── route.ts
│   │       └── health/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── json-editor.tsx
│   │   │   ├── code-viewer.tsx
│   │   │   └── data-table.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── main-navigation.tsx
│   │   │   ├── user-menu.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── notification-center.tsx
│   │   ├── dashboard/
│   │   │   ├── overview-stats.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── tool-grid.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   └── system-status.tsx
│   │   ├── tools/
│   │   │   ├── tool-card.tsx
│   │   │   ├── tool-header.tsx
│   │   │   ├── tool-sidebar.tsx
│   │   │   ├── tool-settings.tsx
│   │   │   ├── tool-permissions.tsx
│   │   │   └── shared/
│   │   │       ├── file-processor.tsx
│   │   │       ├── ai-chat.tsx
│   │   │       ├── result-viewer.tsx
│   │   │       ├── progress-tracker.tsx
│   │   │       └── export-options.tsx
│   │   ├── bauplan-checker/
│   │   │   ├── pdf-upload.tsx
│   │   │   ├── din-norms-selector.tsx
│   │   │   ├── analysis-progress.tsx
│   │   │   ├── validation-results.tsx
│   │   │   ├── findings-list.tsx
│   │   │   ├── compliance-score.tsx
│   │   │   ├── report-generator.tsx
│   │   │   ├── comparison-viewer.tsx
│   │   │   └── history-browser.tsx
│   │   ├── json-explorer/
│   │   │   ├── json-input.tsx
│   │   │   ├── json-viewer.tsx
│   │   │   ├── json-formatter.tsx
│   │   │   ├── json-validator.tsx
│   │   │   ├── json-diff.tsx
│   │   │   ├── structure-tree.tsx
│   │   │   ├── search-filter.tsx
│   │   │   ├── export-json.tsx
│   │   │   └── vast-support.tsx
│   │   ├── multi-agent/
│   │   │   ├── agent-list.tsx
│   │   │   ├── agent-card.tsx
│   │   │   ├── agent-creator.tsx
│   │   │   ├── agent-editor.tsx
│   │   │   ├── agent-logs.tsx
│   │   │   ├── agent-status.tsx
│   │   │   ├── schedule-manager.tsx
│   │   │   ├── notification-settings.tsx
│   │   │   ├── data-collection.tsx
│   │   │   └── communication-hub.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── oauth-buttons.tsx
│   │   │   ├── user-profile.tsx
│   │   │   └── session-guard.tsx
│   │   └── shared/
│   │       ├── error-boundary.tsx
│   │       ├── loading-states.tsx
│   │       ├── empty-states.tsx
│   │       ├── confirmation-dialog.tsx
│   │       ├── search-input.tsx
│   │       ├── date-picker.tsx
│   │       ├── chart-components.tsx
│   │       └── keyboard-shortcuts.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── ai/
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── embeddings.ts
│   │   │   ├── chat.ts
│   │   │   └── rag.ts
│   │   ├── tools/
│   │   │   ├── registry.ts
│   │   │   ├── permissions.ts
│   │   │   ├── config.ts
│   │   │   └── integration/
│   │   │       ├── bauplan-checker/
│   │   │       │   ├── pdf-processor.ts
│   │   │       │   ├── din-norms.ts
│   │   │       │   ├── analyzer.ts
│   │   │       │   ├── report-generator.ts
│   │   │       │   └── validation-engine.ts
│   │   │       ├── json-explorer/
│   │   │       │   ├── validator.ts
│   │   │       │   ├── formatter.ts
│   │   │       │   ├── diff-engine.ts
│   │   │       │   ├── vast-parser.ts
│   │   │       │   └── structure-analyzer.ts
│   │   │       └── multi-agent/
│   │   │           ├── agent-manager.ts
│   │   │           ├── scheduler.ts
│   │   │           ├── communication.ts
│   │   │           ├── data-collector.ts
│   │   │           ├── notification-service.ts
│   │   │           └── agents/
│   │   │               ├── email-monitor.ts
│   │   │               ├── content-summarizer.ts
│   │   │               ├── file-watcher.ts
│   │   │               └── base-agent.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatting.ts
│   │   │   ├── validation.ts
│   │   │   ├── file-handling.ts
│   │   │   ├── encryption.ts
│   │   │   ├── rate-limiting.ts
│   │   │   ├── caching.ts
│   │   │   ├── pdf-utils.ts
│   │   │   ├── json-utils.ts
│   │   │   ├── date-utils.ts
│   │   │   └── api-helpers.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-tools.ts
│   │   │   ├── use-websocket.ts
│   │   │   ├── use-file-upload.ts
│   │   │   ├── use-agents.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── use-toast.ts
│   │   ├── stores/
│   │   │   ├── auth-store.ts
│   │   │   ├── tool-store.ts
│   │   │   ├── notification-store.ts
│   │   │   ├── agent-store.ts
│   │   │   └── ui-store.ts
│   │   ├── constants/
│   │   │   ├── tools.ts
│   │   │   ├── routes.ts
│   │   │   ├── permissions.ts
│   │   │   ├── file-types.ts
│   │   │   └── theme.ts
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── tools.ts
│   │       ├── api.ts
│   │       ├── database.ts
│   │       ├── agents.ts
│   │       ├── files.ts
│   │       └── ui.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── tools.css
│   └── workers/
│       ├── pdf-processor.ts
│       ├── vector-indexer.ts
│       ├── agent-runner.ts
│       └── notification-sender.ts
├── docs/
│   ├── api.md
│   ├── deployment.md
│   ├── development.md
│   └── tools/
│       ├── bauplan-checker.md
│       ├── json-explorer.md
│       └── multi-agent.md
└── scripts/
    ├── setup.sh
    ├── migrate.ts
    ├── seed.ts
    └── deploy.sh
```

---

## 🎨 UI/UX DESIGN SPECIFICATIONS

### Color Scheme (Red-based)
```css
/* tailwind.config.js custom colors */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary red gradient palette
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Secondary gradient
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Dark mode adaptations
        dark: {
          50: '#1a1a1a',
          100: '#2d2d2d',
          200: '#404040',
          300: '#525252',
          400: '#737373',
          500: '#a3a3a3',
          600: '#d4d4d4',
          700: '#e5e5e5',
          800: '#f5f5f5',
          900: '#fafafa',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'red-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        'red-gradient-dark': 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
      },
    },
  },
}
```

### Component Design Patterns
```tsx
// Standard Card Component with Red Theme
export function ToolCard({ tool, isActive }: ToolCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900",
      isActive && "ring-2 ring-primary-500 ring-offset-2"
    )}>
      {/* Red gradient header */}
      <div className="h-2 bg-red-gradient" />
      
      {/* Content area */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tool.category}
            </p>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {tool.description}
        </p>
        
        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Badge variant={tool.enabled ? "default" : "secondary"}>
            {tool.enabled ? "Active" : "Inactive"}
          </Badge>
          
          <Button 
            size="sm" 
            className="bg-red-gradient hover:opacity-90"
          >
            Open Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Layout Components
```tsx
// Main Dashboard Layout
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with red gradient */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-gradient">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Family Toolbox
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 🗄️ DATABASE SCHEMA (COMPLETE)

### Supabase Schema Definition
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (enhanced)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  provider VARCHAR(50) NOT NULL, -- 'google', 'apple'
  provider_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_provider_id UNIQUE (provider, provider_id)
);

-- Tools registry
CREATE TABLE tools (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  config JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tool access and settings
CREATE TABLE user_tools (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) REFERENCES tools(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (user_id, tool_id)
);

-- File uploads
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) REFERENCES tools(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'processed', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bauplan Checker specific tables
CREATE TABLE din_norms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  norm_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  version VARCHAR(20),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX ON din_norms USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE bauplan_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
  analysis_results JSONB NOT NULL,
  compliance_score DECIMAL(5,2),
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  din_norms_checked JSONB DEFAULT '[]',
  processing_time_ms INTEGER,
  status VARCHAR(50) DEFAULT 'completed', -- 'processing', 'completed', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JSON Explorer tables
CREATE TABLE json_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  json_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_vast BOOLEAN DEFAULT false,
  validation_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-Agent System tables
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL, -- 'email-monitor', 'content-summarizer', etc.
  config JSONB NOT NULL DEFAULT '{}',
  schedule_config JSONB, -- cron expression and settings
  is_active BOOLEAN DEFAULT false,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results JSONB DEFAULT '{}',
  error_message TEXT,
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agent_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  data_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  type VARCHAR(100) NOT NULL, -- 'agent-result', 'system-alert', 'tool-update'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  delivery_method VARCHAR(50) DEFAULT 'internal', -- 'internal', 'email', 'push'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) REFERENCES tools(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_file_uploads_user_tool ON file_uploads(user_id, tool_id);
CREATE INDEX idx_file_uploads_status ON file_uploads(status);
CREATE INDEX idx_bauplan_reports_user_id ON bauplan_reports(user_id);
CREATE INDEX idx_json_sessions_user_id ON json_sessions(user_id);
CREATE INDEX idx_agents_user_active ON agents(user_id, is_active);
CREATE INDEX idx_agent_runs_agent_status ON agent_runs(agent_id, status);
CREATE INDEX idx_agent_data_agent_type ON agent_data(agent_id, data_type);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauplan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE json_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tools" ON user_tools
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON bauplan_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own JSON sessions" ON json_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agents" ON agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own agent runs" ON agent_runs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM agents WHERE id = agent_runs.agent_id
    )
  );

CREATE POLICY "Users can view own agent data" ON agent_data
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM agents WHERE id = agent_data.agent_id
    )
  );

CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Seed initial data
INSERT INTO tools (id, name, description, category, config) VALUES
('bauplan-checker', 'Bauplan Checker', 'PDF-Bauplan-Validation gegen DIN-Normen mit RAG', 'analysis', '{"max_file_size": 50000000, "supported_formats": ["pdf"]}'),
('json-explorer', 'JSON Explorer', 'JSON Validation, Formatting & Exploration mit VAST Support', 'development', '{"max_json_size": 10000000, "vast_support": true}'),
('multi-agent', 'Multi-Agent System', 'Framework für Background-Agents mit Benachrichtigungen', 'automation', '{"max_agents": 10, "schedule_limit": "0 */5 * * * *"}');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tools_updated_at BEFORE UPDATE ON user_tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_din_norms_updated_at BEFORE UPDATE ON din_norms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_json_sessions_updated_at BEFORE UPDATE ON json_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🛠️ BAUPLAN-CHECKER INTEGRATION (COMPLETE)

### PDF Processing Pipeline
```typescript
// lib/tools/integration/bauplan-checker/pdf-processor.ts
import PDFParse from 'pdf-parse';
import pdf2pic from 'pdf2pic';
import { createHash } from 'crypto';

export interface ProcessedPDF {
  id: string;
  text: string;
  pages: PDFPage[];
  metadata: PDFMetadata;
  checksum: string;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
  images: ExtractedImage[];
  dimensions: { width: number; height: number };
}

export interface ExtractedImage {
  id: string;
  base64: string;
  position: { x: number; y: number; width: number; height: number };
  description?: string;
}

export class PDFProcessor {
  private readonly supabase = createClient();

  async processPDF(fileBuffer: Buffer, originalFilename: string): Promise<ProcessedPDF> {
    try {
      // Parse PDF text content
      const pdfData = await PDFParse(fileBuffer);
      
      // Extract images from each page
      const convert = pdf2pic.fromBuffer(fileBuffer, {
        density: 300,
        saveFilename: "page",
        savePath: "/tmp",
        format: "png",
        width: 2480,
        height: 3508
      });

      const pages: PDFPage[] = [];
      
      for (let i = 1; i <= pdfData.numpages; i++) {
        // Convert page to image for visual analysis
        const pageImage = await convert(i, { responseType: "base64" });
        
        // Extract text for this specific page (if available per page)
        const pageText = this.extractPageText(pdfData.text, i);
        
        // Analyze images in the page
        const images = await this.analyzePageImages(pageImage.base64, i);
        
        pages.push({
          pageNumber: i,
          text: pageText,
          images,
          dimensions: { width: 2480, height: 3508 }
        });
      }

      const processedPDF: ProcessedPDF = {
        id: createHash('md5').update(fileBuffer).digest('hex'),
        text: pdfData.text,
        pages,
        metadata: {
          title: pdfData.info?.Title || originalFilename,
          author: pdfData.info?.Author || 'Unknown',
          creator: pdfData.info?.Creator || 'Unknown',
          producer: pdfData.info?.Producer || 'Unknown',
          creationDate: pdfData.info?.CreationDate,
          modificationDate: pdfData.info?.ModDate,
          pageCount: pdfData.numpages,
          fileSize: fileBuffer.length
        },
        checksum: createHash('sha256').update(fileBuffer).digest('hex')
      };

      // Store processed data
      await this.storePDFData(processedPDF);
      
      return processedPDF;
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  private extractPageText(fullText: string, pageNumber: number): string {
    // Implement page-specific text extraction logic
    // This is a simplified approach - you might need more sophisticated parsing
    const lines = fullText.split('\n');
    const wordsPerPage = Math.ceil(lines.length / pageNumber);
    const startIndex = (pageNumber - 1) * wordsPerPage;
    const endIndex = Math.min(startIndex + wordsPerPage, lines.length);
    
    return lines.slice(startIndex, endIndex).join('\n');
  }

  private async analyzePageImages(base64Image: string, pageNumber: number): Promise<ExtractedImage[]> {
    // Use OpenAI Vision API to analyze images
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this architectural drawing page. Identify and describe all technical elements, measurements, symbols, and architectural features visible in the image. Focus on elements that would be relevant for DIN compliance checking."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const description = response.choices[0]?.message?.content || '';
      
      return [{
        id: `page_${pageNumber}_image_1`,
        base64: base64Image,
        position: { x: 0, y: 0, width: 2480, height: 3508 },
        description
      }];
    } catch (error) {
      console.error('Image analysis error:', error);
      return [{
        id: `page_${pageNumber}_image_1`,
        base64: base64Image,
        position: { x: 0, y: 0, width: 2480, height: 3508 },
        description: 'Image analysis failed'
      }];
    }
  }

  private async storePDFData(processedPDF: ProcessedPDF): Promise<void> {
    const { error } = await this.supabase
      .from('processed_pdfs')
      .insert({
        id: processedPDF.id,
        data: processedPDF,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing PDF data:', error);
    }
  }
}
```

### DIN Norms RAG System
```typescript
// lib/tools/integration/bauplan-checker/din-norms.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export interface DINNorm {
  id: string;
  normNumber: string;
  title: string;
  description: string;
  content: string;
  category: string;
  version: string;
  tags: string[];
  embedding?: number[];
}

export interface RAGResult {
  relevantNorms: DINNorm[];
  similarity: number;
  chunks: string[];
}

export class DINNormsRAG {
  private readonly supabase = createClient();
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async initializeRAG(dinNormsData: DINNorm[]): Promise<void> {
    console.log('Initializing DIN Norms RAG system...');
    
    for (const norm of dinNormsData) {
      await this.embedAndStoreDINNorm(norm);
    }
    
    console.log(`Initialized RAG with ${dinNormsData.length} DIN norms`);
  }

  private async embedAndStoreDINNorm(norm: DINNorm): Promise<void> {
    try {
      // Create embedding for the norm content
      const embedding = await this.createEmbedding(
        `${norm.title}\n${norm.description}\n${norm.content}`
      );

      // Store in Supabase with vector
      const { error } = await this.supabase
        .from('din_norms')
        .upsert({
          norm_number: norm.normNumber,
          title: norm.title,
          description: norm.description,
          content: norm.content,
          embedding,
          version: norm.version,
          category: norm.category,
          tags: norm.tags
        });

      if (error) {
        console.error(`Error storing DIN norm ${norm.normNumber}:`, error);
      }
    } catch (error) {
      console.error(`Error processing DIN norm ${norm.normNumber}:`, error);
    }
  }

  async searchRelevantNorms(query: string, limit = 5): Promise<RAGResult> {
    try {
      // Create embedding for the query
      const queryEmbedding = await this.createEmbedding(query);
      
      // Search for similar norms using vector similarity
      const { data: similarNorms, error } = await this.supabase
        .rpc('search_din_norms', {
          query_embedding: queryEmbedding,
          similarity_threshold: 0.7,
          match_count: limit
        });

      if (error) {
        throw new Error(`RAG search error: ${error.message}`);
      }

      return {
        relevantNorms: similarNorms || [],
        similarity: similarNorms?.[0]?.similarity || 0,
        chunks: this.extractRelevantChunks(similarNorms || [], query)
      };
    } catch (error) {
      console.error('RAG search error:', error);
      throw error;
    }
  }

  private async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  private extractRelevantChunks(norms: DINNorm[], query: string): string[] {
    return norms.map(norm => {
      // Extract most relevant parts of the norm content
      const sentences = norm.content.split(/[.!?]+/);
      const queryWords = query.toLowerCase().split(/\s+/);
      
      const relevantSentences = sentences.filter(sentence => {
        const sentenceLower = sentence.toLowerCase();
        return queryWords.some(word => sentenceLower.includes(word));
      });

      return relevantSentences.slice(0, 3).join('. ') + '.';
    });
  }

  // SQL function for vector similarity search (to be added to Supabase)
  /*
  CREATE OR REPLACE FUNCTION search_din_norms(
    query_embedding vector(1536),
    similarity_threshold float,
    match_count int
  )
  RETURNS TABLE (
    id uuid,
    norm_number varchar,
    title varchar,
    description text,
    content text,
    category varchar,
    version varchar,
    tags jsonb,
    similarity float
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      din_norms.id,
      din_norms.norm_number,
      din_norms.title,
      din_norms.description,
      din_norms.content,
      din_norms.category,
      din_norms.version,
      din_norms.tags,
      1 - (din_norms.embedding <=> query_embedding) as similarity
    FROM din_norms
    WHERE 1 - (din_norms.embedding <=> query_embedding) > similarity_threshold
    ORDER BY din_norms.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
  */
}
```

### Analysis Engine
```typescript
// lib/tools/integration/bauplan-checker/analyzer.ts
import { ProcessedPDF } from './pdf-processor';
import { DINNormsRAG, RAGResult } from './din-norms';
import OpenAI from 'openai';

export interface AnalysisResult {
  reportId: string;
  complianceScore: number;
  findings: Finding[];
  recommendations: Recommendation[];
  checkedNorms: string[];
  processingTimeMs: number;
  summary: string;
}

export interface Finding {
  id: string;
  type: 'compliance' | 'violation' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  normReference: string;
  description: string;
  location: {
    page?: number;
    section?: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  };
  evidence: string;
  recommendation?: string;
}

export interface Recommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  actionItems: string[];
  normReferences: string[];
}

export class BauplanAnalyzer {
  private readonly dinRAG: DINNormsRAG;
  private readonly openai: OpenAI;

  constructor() {
    this.dinRAG = new DINNormsRAG();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeBauplan(processedPDF: ProcessedPDF): Promise<AnalysisResult> {
    const startTime = Date.now();
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`Starting analysis for report ${reportId}`);

      // Step 1: Extract key elements from the bauplan
      const keyElements = await this.extractKeyElements(processedPDF);
      
      // Step 2: Search for relevant DIN norms
      const relevantNorms = await this.findRelevantNorms(keyElements);
      
      // Step 3: Perform detailed compliance analysis
      const findings = await this.performComplianceAnalysis(
        processedPDF, 
        keyElements, 
        relevantNorms
      );
      
      // Step 4: Calculate compliance score
      const complianceScore = this.calculateComplianceScore(findings);
      
      // Step 5: Generate recommendations
      const recommendations = await this.generateRecommendations(findings, relevantNorms);
      
      // Step 6: Create summary
      const summary = await this.generateSummary(findings, complianceScore, recommendations);

      const processingTimeMs = Date.now() - startTime;

      const result: AnalysisResult = {
        reportId,
        complianceScore,
        findings,
        recommendations,
        checkedNorms: relevantNorms.relevantNorms.map(norm => norm.normNumber),
        processingTimeMs,
        summary
      };

      console.log(`Analysis completed for report ${reportId} in ${processingTimeMs}ms`);
      return result;

    } catch (error) {
      console.error(`Analysis failed for report ${reportId}:`, error);
      throw new Error(`Bauplan analysis failed: ${error.message}`);
    }
  }

  private async extractKeyElements(pdf: ProcessedPDF): Promise<string[]> {
    const allText = pdf.text;
    const imageDescriptions = pdf.pages.flatMap(page => 
      page.images.map(img => img.description || '')
    );

    const prompt = `
    Analyze this architectural building plan and extract key technical elements that would be relevant for DIN compliance checking.

    Text content:
    ${allText.substring(0, 3000)}...

    Image descriptions:
    ${imageDescriptions.join('\n')}

    Please identify and list:
    1. Building dimensions and measurements
    2. Structural elements (walls, beams, foundations)
    3. Room specifications and requirements
    4. Fire safety elements
    5. Accessibility features
    6. Building materials mentioned
    7. Technical installations (electrical, plumbing, HVAC)
    8. Safety and emergency features
    9. Building codes or standards referenced
    10. Any specific technical requirements

    Return as a JSON array of key elements.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    try {
      const content = response.choices[0]?.message?.content || '';
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [content];
    } catch (error) {
      // Fallback: extract key elements using text analysis
      return this.fallbackKeyElementExtraction(allText);
    }
  }

  private fallbackKeyElementExtraction(text: string): string[] {
    const keywords = [
      'Brandschutz', 'Fluchtweg', 'Notausgang', 'Barrierefreiheit',
      'Tragwerk', 'Fundament', 'Stahlbeton', 'Dämmung',
      'Raumhöhe', 'Deckenhöhe', 'Wandstärke', 'Öffnung',
      'Fenster', 'Tür', 'Treppe', 'Aufzug',
      'Elektro', 'Sanitär', 'Heizung', 'Lüftung'
    ];

    const elements: string[] = [];
    const textLower = text.toLowerCase();

    keywords.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) {
        elements.push(keyword);
      }
    });

    // Extract measurements (numbers followed by measurement units)
    const measurementRegex = /\d+[.,]?\d*\s*(mm|cm|m|m²|m³)/gi;
    const measurements = text.match(measurementRegex) || [];
    elements.push(...measurements);

    return [...new Set(elements)]; // Remove duplicates
  }

  private async findRelevantNorms(keyElements: string[]): Promise<RAGResult> {
    const query = keyElements.join(' ');
    return await this.dinRAG.searchRelevantNorms(query, 10);
  }

  private async performComplianceAnalysis(
    pdf: ProcessedPDF,
    keyElements: string[],
    relevantNorms: RAGResult
  ): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const norm of relevantNorms.relevantNorms) {
      const finding = await this.checkNormCompliance(pdf, keyElements, norm);
      if (finding) {
        findings.push(finding);
      }
    }

    return findings;
  }

  private async checkNormCompliance(
    pdf: ProcessedPDF,
    keyElements: string[],
    norm: any
  ): Promise<Finding | null> {
    const prompt = `
    Check if this building plan complies with the following DIN norm:

    DIN Norm: ${norm.norm_number} - ${norm.title}
    Norm Description: ${norm.description}
    Relevant Content: ${norm.content.substring(0, 1000)}...

    Building Plan Elements: ${keyElements.join(', ')}
    Plan Text: ${pdf.text.substring(0, 2000)}...

    Analyze the compliance and respond with a JSON object containing:
    {
      "isCompliant": boolean,
      "severity": "low" | "medium" | "high" | "critical",
      "finding": "compliance" | "violation" | "warning" | "info",
      "description": "detailed description of compliance status",
      "evidence": "specific evidence from the plan",
      "recommendation": "specific recommendation if non-compliant"
    }

    If no relevant compliance check can be performed, return null.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content || '';
      const analysis = JSON.parse(content);

      if (!analysis || analysis.isCompliant === null) {
        return null;
      }

      return {
        id: `finding_${norm.norm_number}_${Date.now()}`,
        type: analysis.finding,
        severity: analysis.severity,
        normReference: norm.norm_number,
        description: analysis.description,
        location: { page: 1 }, // TODO: Improve location detection
        evidence: analysis.evidence,
        recommendation: analysis.recommendation
      };

    } catch (error) {
      console.error(`Error checking norm ${norm.norm_number}:`, error);
      return null;
    }
  }

  private calculateComplianceScore(findings: Finding[]): number {
    if (findings.length === 0) return 100;

    const weights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5
    };

    const violations = findings.filter(f => f.type === 'violation');
    const totalPenalty = violations.reduce((sum, finding) => {
      return sum + (weights[finding.severity] || 0);
    }, 0);

    const maxPossiblePenalty = findings.length * weights.critical;
    const score = Math.max(0, 100 - (totalPenalty / maxPossiblePenalty) * 100);

    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  private async generateRecommendations(
    findings: Finding[],
    relevantNorms: RAGResult
  ): Promise<Recommendation[]> {
    const violations = findings.filter(f => f.type === 'violation');
    if (violations.length === 0) return [];

    const prompt = `
    Based on these compliance violations, generate actionable recommendations:

    Violations:
    ${violations.map(v => `- ${v.normReference}: ${v.description}`).join('\n')}

    Generate a JSON array of recommendations with this structure:
    {
      "priority": "low" | "medium" | "high",
      "category": "string",
      "description": "string",
      "actionItems": ["string"],
      "normReferences": ["string"]
    }

    Focus on practical, actionable steps to address the violations.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';
      const recommendations = JSON.parse(content);

      return recommendations.map((rec: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        ...rec
      }));

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async generateSummary(
    findings: Finding[],
    complianceScore: number,
    recommendations: Recommendation[]
  ): Promise<string> {
    const prompt = `
    Generate a concise executive summary of this building plan compliance analysis:

    Compliance Score: ${complianceScore}%
    Total Findings: ${findings.length}
    Violations: ${findings.filter(f => f.type === 'violation').length}
    Warnings: ${findings.filter(f => f.type === 'warning').length}
    Recommendations: ${recommendations.length}

    Key Issues:
    ${findings.filter(f => f.severity === 'high' || f.severity === 'critical')
      .map(f => `- ${f.normReference}: ${f.description}`)
      .join('\n')}

    Write a professional summary in German that highlights the overall compliance status,
    major issues found, and key action items needed.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Zusammenfassung konnte nicht generiert werden.';

    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Zusammenfassung konnte nicht generiert werden.';
    }
  }
}
```

---

## 🤖 MULTI-AGENT SYSTEM (COMPLETE)

### Agent Framework
```typescript
// lib/tools/integration/multi-agent/base-agent.ts
export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected config: AgentConfig;
  protected isRunning: boolean = false;
  protected logger: AgentLogger;

  constructor(id: string, name: string, config: AgentConfig) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.logger = new AgentLogger(id);
  }

  abstract execute(): Promise<AgentResult>;
  
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error(`Agent ${this.name} is already running`);
    }

    this.isRunning = true;
    this.logger.info(`Starting agent ${this.name}`);

    try {
      const result = await this.execute();
      await this.handleResult(result);
      this.logger.info(`Agent ${this.name} completed successfully`);
    } catch (error) {
      this.logger.error(`Agent ${this.name} failed:`, error);
      await this.handleError(error);
    } finally {
      this.isRunning = false;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info(`Stopping agent ${this.name}`);
  }

  protected async handleResult(result: AgentResult): Promise<void> {
    // Store result in database
    await this.storeResult(result);
    
    // Send notifications if configured
    if (this.config.notifications?.enabled) {
      await this.sendNotification(result);
    }
  }

  protected async handleError(error: Error): Promise<void> {
    // Log error to database
    await this.storeError(error);
    
    // Send error notification
    if (this.config.notifications?.onError) {
      await this.sendErrorNotification(error);
    }
  }

  private async storeResult(result: AgentResult): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: this.id,
        status: 'completed',
        start_time: result.startTime,
        end_time: result.endTime,
        duration_ms: result.endTime.getTime() - result.startTime.getTime(),
        results: result.data,
        logs: this.logger.getLogs()
      });

    if (error) {
      console.error('Failed to store agent result:', error);
    }
  }

  private async storeError(error: Error): Promise<void> {
    const supabase = createClient();
    
    const { error: dbError } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: this.id,
        status: 'failed',
        start_time: new Date(),
        end_time: new Date(),
        error_message: error.message,
        logs: this.logger.getLogs()
      });

    if (dbError) {
      console.error('Failed to store agent error:', dbError);
    }
  }

  private async sendNotification(result: AgentResult): Promise<void> {
    const notificationService = new NotificationService();
    
    await notificationService.send({
      userId: this.config.userId,
      type: 'agent-result',
      title: `Agent ${this.name} completed`,
      message: `Agent has processed ${result.data.itemsProcessed || 0} items`,
      data: { agentId: this.id, runId: result.runId }
    });
  }

  private async sendErrorNotification(error: Error): Promise<void> {
    const notificationService = new NotificationService();
    
    await notificationService.send({
      userId: this.config.userId,
      type: 'agent-error',
      title: `Agent ${this.name} failed`,
      message: error.message,
      priority: 'high',
      data: { agentId: this.id, error: error.message }
    });
  }
}

export interface AgentConfig {
  userId: string;
  schedule?: string;
  maxRuntime?: number;
  retryCount?: number;
  notifications?: {
    enabled: boolean;
    onError: boolean;
    onSuccess: boolean;
    channels: ('email' | 'internal' | 'push')[];
  };
  dataRetention?: {
    maxRuns: number;
    maxAge: number; // days
  };
}

export interface AgentResult {
  runId: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

class AgentLogger {
  private logs: LogEntry[] = [];
  
  constructor(private agentId: string) {}

  info(message: string, data?: any): void {
    this.addLog('info', message, data);
  }

  error(message: string, error?: any): void {
    this.addLog('error', message, error);
  }

  debug(message: string, data?: any): void {
    this.addLog('debug', message, data);
  }

  private addLog(level: string, message: string, data?: any): void {
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      data,
      agentId: this.agentId
    });
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}

interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  data?: any;
  agentId: string;
}
```

### Email Monitor Agent
```typescript
// lib/tools/integration/multi-agent/agents/email-monitor.ts
import { BaseAgent, AgentConfig, AgentResult } from '../base-agent';
import { Gmail } from 'gmail-api-nodejs';
import { parse } from 'node-html-parser';

export interface EmailMonitorConfig extends AgentConfig {
  gmail: {
    credentials: GmailCredentials;
    query: string; // Gmail search query
    maxResults: number;
  };
  filters: {
    senders?: string[];
    subjects?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
  };
  processing: {
    extractLinks: boolean;
    extractAttachments: boolean;
    summarize: boolean;
  };
}

export class EmailMonitorAgent extends BaseAgent {
  private gmail: Gmail;
  private config: EmailMonitorConfig;

  constructor(id: string, config: EmailMonitorConfig) {
    super(id, 'Email Monitor', config);
    this.config = config;
    this.gmail = new Gmail(config.gmail.credentials);
  }

  async execute(): Promise<AgentResult> {
    const startTime = new Date();
    const runId = `email_monitor_${Date.now()}`;

    this.logger.info('Starting email monitoring', {
      query: this.config.gmail.query,
      maxResults: this.config.gmail.maxResults
    });

    try {
      // Fetch emails from Gmail
      const emails = await this.fetchEmails();
      this.logger.info(`Fetched ${emails.length} emails`);

      // Process emails
      const processedEmails = await this.processEmails(emails);
      
      // Generate summary if requested
      let summary = null;
      if (this.config.processing.summarize && processedEmails.length > 0) {
        summary = await this.generateEmailSummary(processedEmails);
      }

      const result: AgentResult = {
        runId,
        startTime,
        endTime: new Date(),
        success: true,
        data: {
          emailsFound: emails.length,
          emailsProcessed: processedEmails.length,
          emails: processedEmails,
          summary,
          query: this.config.gmail.query
        }
      };

      return result;

    } catch (error) {
      this.logger.error('Email monitoring failed', error);
      throw error;
    }
  }

  private async fetchEmails(): Promise<GmailMessage[]> {
    try {
      const response = await this.gmail.messages.list({
        userId: 'me',
        q: this.config.gmail.query,
        maxResults: this.config.gmail.maxResults
      });

      if (!response.data.messages) {
        return [];
      }

      // Fetch full message details
      const emails = await Promise.all(
        response.data.messages.map(async (message) => {
          const fullMessage = await this.gmail.messages.get({
            userId: 'me',
            id: message.id!
          });
          return fullMessage.data;
        })
      );

      return emails;
    } catch (error) {
      this.logger.error('Failed to fetch emails', error);
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  private async processEmails(emails: GmailMessage[]): Promise<ProcessedEmail[]> {
    const processedEmails: ProcessedEmail[] = [];

    for (const email of emails) {
      try {
        const processed = await this.processEmail(email);
        if (processed && this.passesFilters(processed)) {
          processedEmails.push(processed);
        }
      } catch (error) {
        this.logger.error(`Failed to process email ${email.id}`, error);
      }
    }

    return processedEmails;
  }

  private async processEmail(email: GmailMessage): Promise<ProcessedEmail | null> {
    if (!email.payload) return null;

    const headers = email.payload.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Extract email body
    const body = this.extractEmailBody(email.payload);
    
    // Extract links if requested
    let links: string[] = [];
    if (this.config.processing.extractLinks) {
      links = this.extractLinks(body);
    }

    // Extract attachments if requested
    let attachments: EmailAttachment[] = [];
    if (this.config.processing.extractAttachments) {
      attachments = this.extractAttachments(email.payload);
    }

    return {
      id: email.id!,
      threadId: email.threadId!,
      subject,
      from,
      date: new Date(date),
      body: body.substring(0, 1000), // Truncate for storage
      links,
      attachments,
      snippet: email.snippet || '',
      labelIds: email.labelIds || []
    };
  }

  private extractEmailBody(payload: any): string {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body?.data) {
            const content = Buffer.from(part.body.data, 'base64').toString();
            
            // If HTML, extract text content
            if (part.mimeType === 'text/html') {
              const root = parse(content);
              return root.text;
            }
            
            return content;
          }
        }
      }
    }

    return '';
  }

  private extractLinks(body: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = body.match(urlRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  private extractAttachments(payload: any): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    if (payload.parts) {
      payload.parts.forEach((part: any) => {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size || 0,
            attachmentId: part.body.attachmentId
          });
        }
      });
    }

    return attachments;
  }

  private passesFilters(email: ProcessedEmail): boolean {
    const filters = this.config.filters;

    // Check sender filter
    if (filters.senders && filters.senders.length > 0) {
      const matchesSender = filters.senders.some(sender => 
        email.from.toLowerCase().includes(sender.toLowerCase())
      );
      if (!matchesSender) return false;
    }

    // Check subject filter
    if (filters.subjects && filters.subjects.length > 0) {
      const matchesSubject = filters.subjects.some(subject => 
        email.subject.toLowerCase().includes(subject.toLowerCase())
      );
      if (!matchesSubject) return false;
    }

    // Check keyword filter
    if (filters.keywords && filters.keywords.length > 0) {
      const emailText = `${email.subject} ${email.body}`.toLowerCase();
      const matchesKeyword = filters.keywords.some(keyword => 
        emailText.includes(keyword.toLowerCase())
      );
      if (!matchesKeyword) return false;
    }

    // Check exclude keywords
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const emailText = `${email.subject} ${email.body}`.toLowerCase();
      const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
        emailText.includes(keyword.toLowerCase())
      );
      if (hasExcludedKeyword) return false;
    }

    return true;
  }

  private async generateEmailSummary(emails: ProcessedEmail[]): Promise<string> {
    if (emails.length === 0) return 'No emails to summarize.';

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const emailSummaries = emails.map(email => 
      `From: ${email.from}\nSubject: ${email.subject}\nSnippet: ${email.snippet}`
    ).join('\n\n');

    const prompt = `
    Summarize these ${emails.length} emails in German. Provide:
    1. Overview of main topics
    2. Important senders
    3. Action items if any
    4. Priority level assessment

    Emails:
    ${emailSummaries}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Zusammenfassung konnte nicht erstellt werden.';
    } catch (error) {
      this.logger.error('Failed to generate email summary', error);
      return 'Fehler beim Erstellen der Zusammenfassung.';
    }
  }
}

interface ProcessedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  links: string[];
  attachments: EmailAttachment[];
  snippet: string;
  labelIds: string[];
}

interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

type GmailMessage = any; // Gmail API message type
```

### Agent Manager
```typescript
// lib/tools/integration/multi-agent/agent-manager.ts
import { BaseAgent, AgentConfig } from './base-agent';
import { EmailMonitorAgent } from './agents/email-monitor';
import { ContentSummarizerAgent } from './agents/content-summarizer';
import { FileWatcherAgent } from './agents/file-watcher';
import cron from 'node-cron';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private readonly supabase = createClient();

  async initializeAgents(): Promise<void> {
    // Load all active agents from database
    const { data: agents, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to load agents:', error);
      return;
    }

    for (const agentData of agents || []) {
      await this.createAgent(agentData);
    }
  }

  async createAgent(agentData: any): Promise<BaseAgent> {
    const config: AgentConfig = {
      userId: agentData.user_id,
      schedule: agentData.schedule_config?.schedule,
      maxRuntime: agentData.config.maxRuntime || 300000, // 5 minutes default
      retryCount: agentData.config.retryCount || 3,
      notifications: agentData.config.notifications || {
        enabled: true,
        onError: true,
        onSuccess: false,
        channels: ['internal']
      },
      dataRetention: agentData.config.dataRetention || {
        maxRuns: 100,
        maxAge: 30
      }
    };

    let agent: BaseAgent;

    switch (agentData.type) {
      case 'email-monitor':
        agent = new EmailMonitorAgent(agentData.id, {
          ...config,
          gmail: agentData.config.gmail,
          filters: agentData.config.filters || {},
          processing: agentData.config.processing || {
            extractLinks: true,
            extractAttachments: false,
            summarize: true
          }
        });
        break;

      case 'content-summarizer':
        agent = new ContentSummarizerAgent(agentData.id, {
          ...config,
          sources: agentData.config.sources || [],
          summaryConfig: agentData.config.summaryConfig || {}
        });
        break;

      case 'file-watcher':
        agent = new FileWatcherAgent(agentData.id, {
          ...config,
          watchPaths: agentData.config.watchPaths || [],
          fileFilters: agentData.config.fileFilters || {}
        });
        break;

      default:
        throw new Error(`Unknown agent type: ${agentData.type}`);
    }

    this.agents.set(agentData.id, agent);

    // Schedule agent if it has a schedule
    if (config.schedule) {
      this.scheduleAgent(agentData.id, config.schedule);
    }

    return agent;
  }

  private scheduleAgent(agentId: string, schedule: string): void {
    if (this.scheduledTasks.has(agentId)) {
      this.scheduledTasks.get(agentId)!.destroy();
    }

    const task = cron.schedule(schedule, async () => {
      const agent = this.agents.get(agentId);
      if (agent) {
        try {
          await agent.start();
        } catch (error) {
          console.error(`Scheduled agent ${agentId} failed:`, error);
        }
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Berlin'
    });

    this.scheduledTasks.set(agentId, task);
  }

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    await agent.start();
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    await agent.stop();

    // Stop scheduled task if exists
    const task = this.scheduledTasks.get(agentId);
    if (task) {
      task.destroy();
      this.scheduledTasks.delete(agentId);
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.stopAgent(agentId);
    this.agents.delete(agentId);

    // Delete from database
    const { error } = await this.supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) {
      console.error(`Failed to delete agent ${agentId}:`, error);
    }
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Get recent runs from database
    const { data: runs, error } = await this.supabase
      .from('agent_runs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Failed to get agent runs for ${agentId}:`, error);
    }

    const recentRuns = runs || [];
    const lastRun = recentRuns[0];
    const successfulRuns = recentRuns.filter(run => run.status === 'completed').length;
    const failedRuns = recentRuns.filter(run => run.status === 'failed').length;

    return {
      agentId,
      isRunning: (agent as any).isRunning || false,
      isScheduled: this.scheduledTasks.has(agentId),
      lastRun: lastRun ? {
        timestamp: new Date(lastRun.created_at),
        status: lastRun.status,
        duration: lastRun.duration_ms,
        error: lastRun.error_message
      } : null,
      stats: {
        totalRuns: recentRuns.length,
        successfulRuns,
        failedRuns,
        averageDuration: recentRuns.length > 0 
          ? recentRuns.reduce((sum, run) => sum + (run.duration_ms || 0), 0) / recentRuns.length
          : 0
      }
    };
  }

  async getAllAgentStatuses(): Promise<AgentStatus[]> {
    const statuses: AgentStatus[] = [];
    
    for (const agentId of this.agents.keys()) {
      try {
        const status = await this.getAgentStatus(agentId);
        statuses.push(status);
      } catch (error) {
        console.error(`Failed to get status for agent ${agentId}:`, error);
      }
    }

    return statuses;
  }

  async cleanupOldData(): Promise<void> {
    // Clean up old agent runs based on retention policies
    for (const [agentId, agent] of this.agents) {
      const config = (agent as any).config;
      if (config.dataRetention) {
        await this.cleanupAgentData(agentId, config.dataRetention);
      }
    }
  }

  private async cleanupAgentData(agentId: string, retention: any): Promise<void> {
    const { maxRuns, maxAge } = retention;
    
    // Delete runs older than maxAge days
    if (maxAge) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      
      await this.supabase
        .from('agent_runs')
        .delete()
        .eq('agent_id', agentId)
        .lt('created_at', cutoffDate.toISOString());
    }

    // Keep only the most recent maxRuns runs
    if (maxRuns) {
      const { data: runs } = await this.supabase
        .from('agent_runs')
        .select('id')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .range(maxRuns, 1000); // Get runs beyond the limit

      if (runs && runs.length > 0) {
        const runIds = runs.map(run => run.id);
        await this.supabase
          .from('agent_runs')
          .delete()
          .in('id', runIds);
      }
    }
  }
}

export interface AgentStatus {
  agentId: string;
  isRunning: boolean;
  isScheduled: boolean;
  lastRun: {
    timestamp: Date;
    status: string;
    duration: number;
    error?: string;
  } | null;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
  };
}
```

---

## 🧩 JSON EXPLORER (COMPLETE)

### JSON Processing Engine
```typescript
// lib/tools/integration/json-explorer/validator.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  schema?: any;
  suggestions?: string[];
}

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
  expectedType?: string;
  severity: 'error' | 'warning' | 'info';
}

export class JSONValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false 
    });
    addFormats(this.ajv);
  }

  validateJSON(jsonString: string): ValidationResult {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        isValid: true,
        errors: [],
        suggestions: this.generateSuggestions(parsed)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: `Invalid JSON: ${error.message}`,
          severity: 'error'
        }],
        suggestions: this.generateParsingErrorSuggestions(error.message)
      };
    }
  }

  validateAgainstSchema(jsonData: any, schema: any): ValidationResult {
    const validate = this.ajv.compile(schema);
    const isValid = validate(jsonData);

    if (isValid) {
      return {
        isValid: true,
        errors: [],
        schema,
        suggestions: []
      };
    }

    const errors: ValidationError[] = (validate.errors || []).map(error => ({
      path: error.instancePath || error.dataPath || 'root',
      message: error.message || 'Validation error',
      value: error.data,
      expectedType: error.schema?.type,
      severity: 'error'
    }));

    return {
      isValid: false,
      errors,
      schema,
      suggestions: this.generateSchemaErrorSuggestions(errors)
    };
  }

  validateVAST(jsonData: any): ValidationResult {
    const vastSchema = this.getVASTSchema();
    return this.validateAgainstSchema(jsonData, vastSchema);
  }

  private generateSuggestions(data: any): string[] {
    const suggestions: string[] = [];

    // Check for common VAST patterns
    if (this.looksLikeVAST(data)) {
      suggestions.push('This appears to be a VAST document. Use VAST validation for better analysis.');
    }

    // Check for common JSON patterns
    if (Array.isArray(data)) {
      suggestions.push(`Array contains ${data.length} items`);
      if (data.length > 0 && typeof data[0] === 'object') {
        suggestions.push('Consider validating against a schema for array item structure');
      }
    }

    // Check for potential issues
    const issues = this.findPotentialIssues(data);
    suggestions.push(...issues);

    return suggestions;
  }

  private generateParsingErrorSuggestions(errorMessage: string): string[] {
    const suggestions: string[] = [];

    if (errorMessage.includes('Unexpected token')) {
      suggestions.push('Check for missing or extra commas, brackets, or quotes');
      suggestions.push('Ensure all strings are properly quoted');
    }

    if (errorMessage.includes('Unexpected end')) {
      suggestions.push('Check for missing closing brackets or braces');
      suggestions.push('Ensure the JSON is complete');
    }

    if (errorMessage.includes('position')) {
      suggestions.push('Use a JSON formatter to identify the exact location of the error');
    }

    return suggestions;
  }

  private generateSchemaErrorSuggestions(errors: ValidationError[]): string[] {
    const suggestions: string[] = [];

    const typeErrors = errors.filter(e => e.message?.includes('type'));
    if (typeErrors.length > 0) {
      suggestions.push('Check data types - ensure strings, numbers, and booleans match the schema');
    }

    const requiredErrors = errors.filter(e => e.message?.includes('required'));
    if (requiredErrors.length > 0) {
      suggestions.push('Add missing required properties to your JSON');
    }

    const formatErrors = errors.filter(e => e.message?.includes('format'));
    if (formatErrors.length > 0) {
      suggestions.push('Check string formats (email, date, URL, etc.)');
    }

    return suggestions;
  }

  private looksLikeVAST(data: any): boolean {
    if (typeof data !== 'object' || !data) return false;
    
    // Check for VAST-specific properties
    const vastIndicators = ['VAST', 'Ad', 'Wrapper', 'InLine', 'Creatives', 'MediaFiles'];
    return vastIndicators.some(indicator => 
      data.hasOwnProperty(indicator) || JSON.stringify(data).includes(indicator)
    );
  }

  private findPotentialIssues(data: any, path = ''): string[] {
    const issues: string[] = [];

    if (typeof data === 'object' && data !== null) {
      // Check for very deep nesting
      const depth = this.getObjectDepth(data);
      if (depth > 10) {
        issues.push(`Deep nesting detected (${depth} levels) - consider flattening structure`);
      }

      // Check for large arrays
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 1000) {
          issues.push(`Large array "${key}" with ${value.length} items - consider pagination`);
        }
      });

      // Check for potential null/undefined issues
      const nullValues = Object.entries(data).filter(([k, v]) => v === null).length;
      if (nullValues > 0) {
        issues.push(`${nullValues} null values found - verify if intentional`);
      }
    }

    return issues;
  }

  private getObjectDepth(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 0;
    
    let maxDepth = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        maxDepth = Math.max(maxDepth, this.getObjectDepth(value) + 1);
      }
    }
    return maxDepth;
  }

  private getVASTSchema(): any {
    // Simplified VAST 4.0 schema - in production, load from file
    return {
      type: 'object',
      properties: {
        VAST: {
          type: 'object',
          properties: {
            version: { type: 'string' },
            Ad: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  InLine: { type: 'object' },
                  Wrapper: { type: 'object' }
                }
              }
            }
          },
          required: ['version', 'Ad']
        }
      },
      required: ['VAST']
    };
  }
}

// lib/tools/integration/json-explorer/formatter.ts
export interface FormattingOptions {
  indent: number;
  sortKeys: boolean;
  removeComments: boolean;
  minify: boolean;
  preserveArrays: boolean;
}

export class JSONFormatter {
  format(jsonString: string, options: FormattingOptions): string {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (options.minify) {
        return JSON.stringify(parsed);
      }

      if (options.sortKeys) {
        this.sortObjectKeys(parsed);
      }

      return JSON.stringify(parsed, null, options.indent);
    } catch (error) {
      throw new Error(`Cannot format invalid JSON: ${error.message}`);
    }
  }

  minify(jsonString: string): string {
    return this.format(jsonString, { 
      indent: 0, 
      sortKeys: false, 
      removeComments: false, 
      minify: true,
      preserveArrays: true 
    });
  }

  beautify(jsonString: string, indent = 2): string {
    return this.format(jsonString, { 
      indent, 
      sortKeys: false, 
      removeComments: false, 
      minify: false,
      preserveArrays: true 
    });
  }

  private sortObjectKeys(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.sortObjectKeys(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj).sort();
      const sortedObj = {};
      keys.forEach(key => {
        sortedObj[key] = obj[key];
        this.sortObjectKeys(obj[key]);
      });
      
      // Replace object properties
      Object.keys(obj).forEach(key => delete obj[key]);
      Object.assign(obj, sortedObj);
    }
  }
}

// lib/tools/integration/json-explorer/diff-engine.ts
export interface DiffResult {
  hasChanges: boolean;
  added: DiffItem[];
  removed: DiffItem[];
  modified: DiffItem[];
  unchanged: DiffItem[];
  summary: DiffSummary;
}

export interface DiffItem {
  path: string;
  oldValue?: any;
  newValue?: any;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  valueType: string;
}

export interface DiffSummary {
  totalChanges: number;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  affectedPaths: string[];
}

export class JSONDiffEngine {
  compare(json1: string, json2: string): DiffResult {
    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      
      return this.compareObjects(obj1, obj2);
    } catch (error) {
      throw new Error(`Cannot compare invalid JSON: ${error.message}`);
    }
  }

  private compareObjects(obj1: any, obj2: any, basePath = ''): DiffResult {
    const result: DiffResult = {
      hasChanges: false,
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
      summary: {
        totalChanges: 0,
        addedCount: 0,
        removedCount: 0,
        modifiedCount: 0,
        affectedPaths: []
      }
    };

    // Get all unique keys from both objects
    const allKeys = new Set([
      ...this.getAllKeys(obj1),
      ...this.getAllKeys(obj2)
    ]);

    for (const key of allKeys) {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      const exists1 = this.hasKey(obj1, key);
      const exists2 = this.hasKey(obj2, key);

      if (!exists1 && exists2) {
        // Added
        result.added.push({
          path: currentPath,
          newValue: this.getValue(obj2, key),
          type: 'added',
          valueType: typeof this.getValue(obj2, key)
        });
        result.hasChanges = true;
        result.summary.addedCount++;
        result.summary.affectedPaths.push(currentPath);
      } else if (exists1 && !exists2) {
        // Removed
        result.removed.push({
          path: currentPath,
          oldValue: this.getValue(obj1, key),
          type: 'removed',
          valueType: typeof this.getValue(obj1, key)
        });
        result.hasChanges = true;
        result.summary.removedCount++;
        result.summary.affectedPaths.push(currentPath);
      } else if (exists1 && exists2) {
        const val1 = this.getValue(obj1, key);
        const val2 = this.getValue(obj2, key);

        if (this.isObject(val1) && this.isObject(val2)) {
          // Recursively compare objects
          const nestedResult = this.compareObjects(val1, val2, currentPath);
          result.added.push(...nestedResult.added);
          result.removed.push(...nestedResult.removed);
          result.modified.push(...nestedResult.modified);
          result.unchanged.push(...nestedResult.unchanged);
          
          if (nestedResult.hasChanges) {
            result.hasChanges = true;
            result.summary.addedCount += nestedResult.summary.addedCount;
            result.summary.removedCount += nestedResult.summary.removedCount;
            result.summary.modifiedCount += nestedResult.summary.modifiedCount;
            result.summary.affectedPaths.push(...nestedResult.summary.affectedPaths);
          }
        } else if (!this.deepEqual(val1, val2)) {
          // Modified
          result.modified.push({
            path: currentPath,
            oldValue: val1,
            newValue: val2,
            type: 'modified',
            valueType: typeof val2
          });
          result.hasChanges = true;
          result.summary.modifiedCount++;
          result.summary.affectedPaths.push(currentPath);
        } else {
          // Unchanged
          result.unchanged.push({
            path: currentPath,
            oldValue: val1,
            newValue: val2,
            type: 'unchanged',
            valueType: typeof val1
          });
        }
      }
    }

    result.summary.totalChanges = result.summary.addedCount + 
                                   result.summary.removedCount + 
                                   result.summary.modifiedCount;

    return result;
  }

  private getAllKeys(obj: any): string[] {
    if (Array.isArray(obj)) {
      return obj.map((_, index) => index.toString());
    } else if (this.isObject(obj)) {
      return Object.keys(obj);
    }
    return [];
  }

  private hasKey(obj: any, key: string): boolean {
    if (Array.isArray(obj)) {
      const index = parseInt(key);
      return index >= 0 && index < obj.length;
    } else if (this.isObject(obj)) {
      return obj.hasOwnProperty(key);
    }
    return false;
  }

  private getValue(obj: any, key: string): any {
    if (Array.isArray(obj)) {
      return obj[parseInt(key)];
    } else if (this.isObject(obj)) {
      return obj[key];
    }
    return undefined;
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}

// lib/tools/integration/json-explorer/structure-analyzer.ts
export interface StructureAnalysis {
  overview: StructureOverview;
  schema: GeneratedSchema;
  statistics: StructureStatistics;
  recommendations: string[];
}

export interface StructureOverview {
  totalKeys: number;
  maxDepth: number;
  dataTypes: { [type: string]: number };
  arrayInfo: ArrayInfo[];
  objectInfo: ObjectInfo[];
}

export interface GeneratedSchema {
  type: string;
  properties?: { [key: string]: any };
  items?: any;
  required?: string[];
}

export interface StructureStatistics {
  totalNodes: number;
  leafNodes: number;
  nullValues: number;
  emptyArrays: number;
  emptyObjects: number;
  duplicateKeys: string[];
}

export interface ArrayInfo {
  path: string;
  length: number;
  itemTypes: string[];
  isHomogeneous: boolean;
}

export interface ObjectInfo {
  path: string;
  keyCount: number;
  optionalKeys: string[];
  requiredKeys: string[];
}

export class StructureAnalyzer {
  analyze(jsonString: string): StructureAnalysis {
    try {
      const data = JSON.parse(jsonString);
      
      const overview = this.analyzeOverview(data);
      const schema = this.generateSchema(data);
      const statistics = this.calculateStatistics(data);
      const recommendations = this.generateRecommendations(overview, statistics);

      return {
        overview,
        schema,
        statistics,
        recommendations
      };
    } catch (error) {
      throw new Error(`Cannot analyze invalid JSON: ${error.message}`);
    }
  }

  private analyzeOverview(data: any): StructureOverview {
    const dataTypes: { [type: string]: number } = {};
    const arrayInfo: ArrayInfo[] = [];
    const objectInfo: ObjectInfo[] = [];

    this.traverseData(data, '', (value, path) => {
      const type = Array.isArray(value) ? 'array' : typeof value;
      dataTypes[type] = (dataTypes[type] || 0) + 1;

      if (Array.isArray(value)) {
        const itemTypes = [...new Set(value.map(item => 
          Array.isArray(item) ? 'array' : typeof item
        ))];
        
        arrayInfo.push({
          path,
          length: value.length,
          itemTypes,
          isHomogeneous: itemTypes.length <= 1
        });
      } else if (typeof value === 'object' && value !== null) {
        const keys = Object.keys(value);
        objectInfo.push({
          path,
          keyCount: keys.length,
          optionalKeys: [], // Will be calculated with schema analysis
          requiredKeys: keys
        });
      }
    });

    return {
      totalKeys: Object.keys(dataTypes).length,
      maxDepth: this.getMaxDepth(data),
      dataTypes,
      arrayInfo,
      objectInfo
    };
  }

  private generateSchema(data: any): GeneratedSchema {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? this.generateSchema(data[0]) : { type: 'any' }
      };
    } else if (typeof data === 'object' && data !== null) {
      const properties: { [key: string]: any } = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.generateSchema(value);
        if (value !== null && value !== undefined) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      };
    } else {
      return {
        type: data === null ? 'null' : typeof data
      };
    }
  }

  private calculateStatistics(data: any): StructureStatistics {
    let totalNodes = 0;
    let leafNodes = 0;
    let nullValues = 0;
    let emptyArrays = 0;
    let emptyObjects = 0;
    const allKeys: string[] = [];

    this.traverseData(data, '', (value, path) => {
      totalNodes++;
      
      if (value === null) {
        nullValues++;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          emptyArrays++;
          leafNodes++;
        }
      } else if (typeof value === 'object' && value !== null) {
        const keys = Object.keys(value);
        allKeys.push(...keys);
        
        if (keys.length === 0) {
          emptyObjects++;
          leafNodes++;
        }
      } else {
        leafNodes++;
      }
    });

    // Find duplicate keys
    const keyCount: { [key: string]: number } = {};
    allKeys.forEach(key => {
      keyCount[key] = (keyCount[key] || 0) + 1;
    });
    
    const duplicateKeys = Object.keys(keyCount).filter(key => keyCount[key] > 1);

    return {
      totalNodes,
      leafNodes,
      nullValues,
      emptyArrays,
      emptyObjects,
      duplicateKeys
    };
  }

  private generateRecommendations(
    overview: StructureOverview, 
    statistics: StructureStatistics
  ): string[] {
    const recommendations: string[] = [];

    // Depth recommendations
    if (overview.maxDepth > 8) {
      recommendations.push(`Consider flattening deeply nested structure (${overview.maxDepth} levels)`);
    }

    // Array recommendations
    const largeArrays = overview.arrayInfo.filter(arr => arr.length > 1000);
    if (largeArrays.length > 0) {
      recommendations.push(`Consider pagination for large arrays: ${largeArrays.map(a => a.path).join(', ')}`);
    }

    const heterogeneousArrays = overview.arrayInfo.filter(arr => !arr.isHomogeneous);
    if (heterogeneousArrays.length > 0) {
      recommendations.push(`Mixed-type arrays found - consider normalizing: ${heterogeneousArrays.map(a => a.path).join(', ')}`);
    }

    // Data quality recommendations
    if (statistics.nullValues > statistics.totalNodes * 0.2) {
      recommendations.push(`High number of null values (${statistics.nullValues}) - review data completeness`);
    }

    if (statistics.emptyObjects > 0) {
      recommendations.push(`${statistics.emptyObjects} empty objects found - consider removing or providing default values`);
    }

    if (statistics.duplicateKeys.length > 0) {
      recommendations.push(`Duplicate key names across objects: ${statistics.duplicateKeys.join(', ')} - consider consistent naming`);
    }

    return recommendations;
  }

  private traverseData(
    data: any, 
    path: string, 
    callback: (value: any, path: string) => void
  ): void {
    callback(data, path);

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        this.traverseData(item, `${path}[${index}]`, callback);
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        this.traverseData(value, newPath, callback);
      });
    }
  }

  private getMaxDepth(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 0;
    
    let maxDepth = 0;
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        maxDepth = Math.max(maxDepth, this.getMaxDepth(item) + 1);
      }
    } else {
      for (const value of Object.values(obj)) {
        maxDepth = Math.max(maxDepth, this.getMaxDepth(value) + 1);
      }
    }
    
    return maxDepth;
  }
}

---

## 🔐 AUTHENTICATION & SECURITY

### NextAuth.js Configuration
```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly'
        }
      }
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Store OAuth tokens for API access
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.provider = token.provider as string;
        session.userId = token.userId as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === 'google' || account?.provider === 'apple') {
        // Check if user is allowed (family members only)
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
        
        if (allowedEmails.length > 0 && !allowedEmails.includes(user.email!)) {
          console.log(`Unauthorized sign-in attempt: ${user.email}`);
          return false;
        }

        // Update user profile in Supabase
        await supabase
          .from('users')
          .upsert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account.provider,
            provider_id: account.providerAccountId,
            last_login: new Date().toISOString()
          }, {
            onConflict: 'email'
          });

        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
      
      if (isNewUser) {
        // Initialize default tools for new user
        await supabase
          .from('user_tools')
          .insert([
            { user_id: user.id, tool_id: 'json-explorer', enabled: true },
            { user_id: user.id, tool_id: 'bauplan-checker', enabled: true },
            { user_id: user.id, tool_id: 'multi-agent', enabled: true }
          ]);
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email}`);
    },
  },
};

// Middleware for protecting API routes
export function withAuth(handler: any) {
  return async (req: any, res: any) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user;
    req.userId = session.userId;
    
    return handler(req, res);
  };
}

// Permission checking
export async function checkToolPermission(userId: string, toolId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_tools')
    .select('enabled')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.enabled;
}
```

### Rate Limiting & Security
```typescript
// lib/utils/rate-limiting.ts
import { createClient } from '@supabase/supabase-js';

interface RateLimit {
  id: string;
  requests: number;
  resetTime: Date;
}

export class RateLimiter {
  private limits: Map<string, RateLimit> = new Map();
  
  constructor(
    private readonly maxRequests: number = 100,
    private readonly windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const now = new Date();
    const limit = this.limits.get(identifier);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      const newResetTime = new Date(now.getTime() + this.windowMs);
      this.limits.set(identifier, {
        id: identifier,
        requests: 1,
        resetTime: newResetTime
      });
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newResetTime
      };
    }

    if (limit.requests >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: limit.resetTime
      };
    }

    limit.requests++;
    this.limits.set(identifier, limit);

    return {
      allowed: true,
      remaining: this.maxRequests - limit.requests,
      resetTime: limit.resetTime
    };
  }

  // Middleware for API routes
  static middleware(limiter: RateLimiter) {
    return async (req: any, res: any, next: Function) => {
      const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const result = await limiter.checkLimit(identifier);

      res.setHeader('X-RateLimit-Limit', limiter.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
        });
      }

      next();
    };
  }
}

// AI API Rate Limiter (separate limits for expensive operations)
export class AIRateLimiter extends RateLimiter {
  constructor() {
    super(50, 60 * 60 * 1000); // 50 requests per hour for AI operations
  }
}

// lib/utils/validation.ts
import { z } from 'zod';

export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf', 'application/json', 'text/plain']),
  size: z.number().max(50 * 1024 * 1024), // 50MB max
});

export const agentConfigSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['email-monitor', 'content-summarizer', 'file-watcher']),
  schedule: z.string().optional(),
  config: z.record(z.any()),
  notifications: z.object({
    enabled: z.boolean(),
    onError: z.boolean(),
    onSuccess: z.boolean(),
    channels: z.array(z.enum(['email', 'internal', 'push']))
  }).optional()
});

export const jsonAnalysisSchema = z.object({
  json: z.string().min(1),
  options: z.object({
    validate: z.boolean().default(true),
    format: z.boolean().default(false),
    analyze: z.boolean().default(false),
    vastMode: z.boolean().default(false)
  }).optional()
});

// Input sanitization
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// CSRF Protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // Simple CSRF validation - in production, use more robust implementation
  return token === sessionToken && token.length > 10;
}
```

---

## 📡 API ROUTES (COMPLETE)

### Tool Management API
```typescript
// app/api/tools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Get user's tools with settings
    const { data: userTools, error } = await supabase
      .from('user_tools')
      .select(`
        tool_id,
        enabled,
        settings,
        usage_count,
        last_used,
        tools (
          id,
          name,
          description,
          category,
          config,
          is_active
        )
      `)
      .eq('user_id', session.userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const tools = userTools?.map(ut => ({
      id: ut.tools.id,
      name: ut.tools.name,
      description: ut.tools.description,
      category: ut.tools.category,
      config: ut.tools.config,
      isActive: ut.tools.is_active,
      userSettings: {
        enabled: ut.enabled,
        settings: ut.settings,
        usageCount: ut.usage_count,
        lastUsed: ut.last_used
      }
    })) || [];

    return NextResponse.json({ tools });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toolId, enabled, settings } = await request.json();
    
    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Update user tool settings
    const { error } = await supabase
      .from('user_tools')
      .upsert({
        user_id: session.userId,
        tool_id: toolId,
        enabled: enabled ?? true,
        settings: settings || {},
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/tools/bauplan-checker/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkToolPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PDFProcessor } from '@/lib/tools/integration/bauplan-checker/pdf-processor';
import { RateLimiter } from '@/lib/utils/rate-limiting';

const rateLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = await rateLimiter.checkLimit(session.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' }, 
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Check tool permission
    const hasPermission = await checkToolPermission(session.userId, 'bauplan-checker');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Tool access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Process the PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const processor = new PDFProcessor();
    
    const processedPDF = await processor.processPDF(buffer, file.name);
    
    // Store file record
    const supabase = createClient();
    const { data: fileRecord, error: fileError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: session.userId,
        tool_id: 'bauplan-checker',
        filename: `${Date.now()}_${file.name}`,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        storage_path: `bauplan-checker/${session.userId}/${processedPDF.id}`,
        metadata: {
          checksum: processedPDF.checksum,
          pageCount: processedPDF.metadata.pageCount
        },
        status: 'processed'
      })
      .select()
      .single();

    if (fileError) {
      console.error('File storage error:', fileError);
      return NextResponse.json({ error: 'File storage failed' }, { status: 500 });
    }

    return NextResponse.json({
      fileId: fileRecord.id,
      processedPDF: {
        id: processedPDF.id,
        pageCount: processedPDF.metadata.pageCount,
        title: processedPDF.metadata.title
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// app/api/tools/bauplan-checker/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkToolPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BauplanAnalyzer } from '@/lib/tools/integration/bauplan-checker/analyzer';
import { AIRateLimiter } from '@/lib/utils/rate-limiting';

const aiRateLimiter = new AIRateLimiter(); // Stricter limits for AI operations

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check AI rate limit
    const rateLimit = await aiRateLimiter.checkLimit(session.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded' }, 
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    // Check tool permission
    const hasPermission = await checkToolPermission(session.userId, 'bauplan-checker');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Tool access denied' }, { status: 403 });
    }

    const { fileId, selectedNorms } = await request.json();
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get file and processed PDF data
    const { data: fileRecord, error: fileError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', session.userId)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get processed PDF data from storage/cache
    const { data: processedData, error: dataError } = await supabase
      .from('processed_pdfs')
      .select('data')
      .eq('id', fileRecord.metadata.checksum)
      .single();

    if (dataError || !processedData) {
      return NextResponse.json({ error: 'Processed PDF data not found' }, { status: 404 });
    }

    // Perform analysis
    const analyzer = new BauplanAnalyzer();
    const analysisResult = await analyzer.analyzeBauplan(processedData.data);

    // Store analysis results
    const { data: reportRecord, error: reportError } = await supabase
      .from('bauplan_reports')
      .insert({
        user_id: session.userId,
        file_id: fileId,
        analysis_results: analysisResult,
        compliance_score: analysisResult.complianceScore,
        findings: analysisResult.findings,
        recommendations: analysisResult.recommendations,
        din_norms_checked: analysisResult.checkedNorms,
        processing_time_ms: analysisResult.processingTimeMs,
        status: 'completed'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Report storage error:', reportError);
      return NextResponse.json({ error: 'Failed to store report' }, { status: 500 });
    }

    // Update file usage stats
    await supabase
      .from('user_tools')
      .update({
        usage_count: supabase.raw('usage_count + 1'),
        last_used: new Date().toISOString()
      })
      .eq('user_id', session.userId)
      .eq('tool_id', 'bauplan-checker');

    return NextResponse.json({
      reportId: reportRecord.id,
      analysisResult
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

// app/api/tools/json-explorer/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkToolPermission } from '@/lib/auth';
import { JSONValidator } from '@/lib/tools/integration/json-explorer/validator';
import { RateLimiter } from '@/lib/utils/rate-limiting';
import { jsonAnalysisSchema } from '@/lib/utils/validation';

const rateLimiter = new RateLimiter(100, 60 * 1000); // 100 validations per minute

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = await rateLimiter.checkLimit(session.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' }, 
        { status: 429 }
      );
    }

    // Check tool permission
    const hasPermission = await checkToolPermission(session.userId, 'json-explorer');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Tool access denied' }, { status: 403 });
    }

    // Validate input
    const body = await request.json();
    const { json, options } = jsonAnalysisSchema.parse(body);

    // Validate JSON
    const validator = new JSONValidator();
    let result;

    if (options?.vastMode) {
      const parsed = JSON.parse(json);
      result = validator.validateVAST(parsed);
    } else {
      result = validator.validateJSON(json);
    }

    return NextResponse.json({ validationResult: result });

  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

// app/api/tools/multi-agent/agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkToolPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AgentManager } from '@/lib/tools/integration/multi-agent/agent-manager';
import { agentConfigSchema } from '@/lib/utils/validation';

const agentManager = new AgentManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkToolPermission(session.userId, 'multi-agent');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Tool access denied' }, { status: 403 });
    }

    const supabase = createClient();
    
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get status for each agent
    const agentsWithStatus = await Promise.all(
      (agents || []).map(async (agent) => {
        try {
          const status = await agentManager.getAgentStatus(agent.id);
          return { ...agent, status };
        } catch (error) {
          return { ...agent, status: null };
        }
      })
    );

    return NextResponse.json({ agents: agentsWithStatus });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkToolPermission(session.userId, 'multi-agent');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Tool access denied' }, { status: 403 });
    }

    // Validate input
    const body = await request.json();
    const agentConfig = agentConfigSchema.parse(body);

    const supabase = createClient();
    
    // Create agent in database
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        user_id: session.userId,
        name: agentConfig.name,
        type: agentConfig.type,
        config: agentConfig.config,
        schedule_config: agentConfig.schedule ? { schedule: agentConfig.schedule } : null,
        is_active: false // Start inactive
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
    }

    // Initialize agent in manager
    try {
      await agentManager.createAgent(agent);
    } catch (error) {
      console.error('Agent initialization error:', error);
      // Clean up database record
      await supabase.from('agents').delete().eq('id', agent.id);
      return NextResponse.json({ error: 'Failed to initialize agent' }, { status: 500 });
    }

    return NextResponse.json({ agent });

  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid agent configuration' }, { status: 400 });
    }
    
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Environment Configuration
```bash
# .env.local (Development)
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_ID=your-apple-id
APPLE_SECRET=your-apple-secret

# AI APIs
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Rate Limiting
REDIS_URL=redis://localhost:6379

# Security
ALLOWED_EMAILS=email1@domain.com,email2@domain.com,email3@domain.com

# File Storage
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/tmp/uploads

# .env.production (Production - Vercel Environment Variables)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXTAUTH_URL=https://your-domain.de
NEXTAUTH_SECRET=your-strong-production-secret
# ... other production values
```

### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    },
    "app/api/tools/bauplan-checker/analyze/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/agent-maintenance",
      "schedule": "*/15 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdf2pic']
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'pdf2pic': 'commonjs pdf2pic',
        'sharp': 'commonjs sharp'
      });
    }
    
    // Handle PDF.js worker
    config.resolve.alias.canvas = false;
    
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Supabase Configuration
```sql
-- Enable necessary extensions and configure database
-- Run this after setting up your Supabase project

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create custom functions for better performance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_agent_runs()
RETURNS void AS $
BEGIN
    DELETE FROM agent_runs 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');
    
    DELETE FROM file_uploads 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status = 'processed';
END;
$ language 'plpgsql';

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_uploads', (SELECT COUNT(*) FROM file_uploads WHERE user_id = user_uuid),
        'total_reports', (SELECT COUNT(*) FROM bauplan_reports WHERE user_id = user_uuid),
        'active_agents', (SELECT COUNT(*) FROM agents WHERE user_id = user_uuid AND is_active = true),
        'last_activity', (SELECT MAX(last_used) FROM user_tools WHERE user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$ language 'plpgsql';

-- Indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_uploads_user_created 
ON file_uploads(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bauplan_reports_user_created 
ON bauplan_reports(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_user_active_created 
ON agents(user_id, is_active, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_runs_agent_created 
ON agent_runs(agent_id, created_at DESC);

-- Set up automated cleanup
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_agent_runs();');
```

### Docker Configuration (for local development)
```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Install additional dependencies for PDF processing
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Deployment Scripts
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Run database migrations if any
echo "🗄️ Running database migrations..."
npm run db:migrate

# Deploy to Vercel
echo "☁️ Deploying to Vercel..."
vercel --prod

# Run post-deployment checks
echo "🔍 Running health checks..."
npm run health-check

echo "✅ Deployment completed successfully!"
```

```bash
#!/bin/bash
# scripts/setup.sh

set -e

echo "🛠️ Setting up Family Toolbox..."

# Check Node.js version
node_version=$(node -v)
echo "Node.js version: $node_version"

if [[ ! "$node_version" =~ ^v18\. ]]; then
    echo "❌ Node.js 18 is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment template
if [ ! -f .env.local ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️ Please update .env.local with your configuration"
fi

# Generate NextAuth secret if not exists
if ! grep -q "NEXTAUTH_SECRET=" .env.local; then
    echo "🔐 Generating NextAuth secret..."
    secret=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$secret" >> .env.local
fi

# Set up Supabase (if CLI is installed)
if command -v supabase &> /dev/null; then
    echo "🗄️ Setting up Supabase..."
    supabase db reset
    supabase db migrate up
else
    echo "⚠️ Supabase CLI not found. Please set up database manually."
fi

echo "✅ Setup completed!"
echo "📚 Read the documentation for next steps"
echo "🚀 Run 'npm run dev' to start development"
```

---

## 📋 DEVELOPMENT WORKFLOW

### Package.json Scripts
```json
{
  "name": "family-toolbox",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "db:migrate": "supabase db migrate up",
    "db:reset": "supabase db reset",
    "db:seed": "tsx scripts/seed.ts",
    "db:generate-types": "supabase gen types typescript --local > src/types/database.ts",
    "setup": "bash scripts/setup.sh",
    "deploy": "bash scripts/deploy.sh",
    "health-check": "curl -f http://localhost:3000/health || exit 1",
    "clean": "rm -rf .next node_modules",
    "analyze": "ANALYZE=true npm run build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Git Hooks & CI/CD
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type check
      run: npm run type-check
      
    - name: Lint
      run: npm run lint
      
    - name: Run tests
      run: npm run test:coverage
      
    - name: Build application
      run: npm run build
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Testing Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapping: {
    '^@/(.*)
      : '<rootDir>/src/$1'
  }
}

module.exports = createJestConfig(customJestConfig)
```

```typescript
// __tests__/tools/bauplan-checker.test.ts
import { BauplanAnalyzer } from '@/lib/tools/integration/bauplan-checker/analyzer';
import { ProcessedPDF } from '@/lib/tools/integration/bauplan-checker/pdf-processor';

// Mock external dependencies
jest.mock('openai');
jest.mock('@/lib/supabase/client');

describe('BauplanAnalyzer', () => {
  let analyzer: BauplanAnalyzer;
  let mockPDF: ProcessedPDF;

  beforeEach(() => {
    analyzer = new BauplanAnalyzer();
    mockPDF = {
      id: 'test-pdf-id',
      text: 'Test building plan content with Brandschutz requirements',
      pages: [
        {
          pageNumber: 1,
          text: 'Page 1 content',
          images: [],
          dimensions: { width: 2480, height: 3508 }
        }
      ],
      metadata: {
        title: 'Test Building Plan',
        author: 'Test Author',
        creator: 'Test Creator',
        producer: 'Test Producer',
        pageCount: 1,
        fileSize: 1024
      },
      checksum: 'test-checksum'
    };
  });

  describe('analyzeBauplan', () => {
    it('should analyze a PDF and return results', async () => {
      const result = await analyzer.analyzeBauplan(mockPDF);
      
      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('complianceScore');
      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('recommendations');
      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(100);
    });

    it('should handle PDF analysis errors gracefully', async () => {
      const invalidPDF = { ...mockPDF, text: '' };
      
      await expect(analyzer.analyzeBauplan(invalidPDF))
        .rejects.toThrow('Bauplan analysis failed');
    });
  });
});
```

---

## 📚 DOCUMENTATION & MAINTENANCE

### API Documentation
```typescript
// docs/api.md Generator
/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Get user's tools
 *     tags: [Tools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tools:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tool'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tool:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         isActive:
 *           type: boolean
 *         userSettings:
 *           type: object
 */
```

### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async trackAPICall(endpoint: string, duration: number, success: boolean): Promise<void> {
    const supabase = createClient();
    
    await supabase
      .from('api_metrics')
      .insert({
        endpoint,
        duration_ms: duration,
        success,
        timestamp: new Date().toISOString()
      });
  }

  async trackToolUsage(toolId: string, userId: string, action: string): Promise<void> {
    const supabase = createClient();
    
    await supabase
      .from('tool_usage_metrics')
      .insert({
        tool_id: toolId,
        user_id: userId,
        action,
        timestamp: new Date().toISOString()
      });
  }

  async getMetrics(timeRange: string = '24h'): Promise<any> {
    const supabase = createClient();
    
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - (timeRange === '24h' ? 24 : 168));
    
    const { data: apiMetrics } = await supabase
      .from('api_metrics')
      .select('*')
      .gte('timestamp', cutoff.toISOString());
    
    const { data: toolMetrics } = await supabase
      .from('tool_usage_metrics')
      .select('*')
      .gte('timestamp', cutoff.toISOString());
    
    return {
      apiMetrics: this.aggregateAPIMetrics(apiMetrics || []),
      toolMetrics: this.aggregateToolMetrics(toolMetrics || [])
    };
  }

  private aggregateAPIMetrics(metrics: any[]): any {
    const byEndpoint = metrics.reduce((acc, metric) => {
      if (!acc[metric.endpoint]) {
        acc[metric.endpoint] = {
          totalCalls: 0,
          averageDuration: 0,
          successRate: 0,
          durations: []
        };
      }
      
      acc[metric.endpoint].totalCalls++;
      acc[metric.endpoint].durations.push(metric.duration_ms);
      
      return acc;
    }, {});

    // Calculate averages and success rates
    Object.keys(byEndpoint).forEach(endpoint => {
      const data = byEndpoint[endpoint];
      data.averageDuration = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      data.successRate = metrics.filter(m => m.endpoint === endpoint && m.success).length / data.totalCalls;
    });

    return byEndpoint;
  }

  private aggregateToolMetrics(metrics: any[]): any {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.tool_id]) {
        acc[metric.tool_id] = {
          totalUsage: 0,
          uniqueUsers: new Set(),
          actions: {}
        };
      }
      
      acc[metric.tool_id].totalUsage++;
      acc[metric.tool_id].uniqueUsers.add(metric.user_id);
      
      if (!acc[metric.tool_id].actions[metric.action]) {
        acc[metric.tool_id].actions[metric.action] = 0;
      }
      acc[metric.tool_id].actions[metric.action]++;
      
      return acc;
    }, {});
  }
}
```

### Error Handling & Logging
```typescript
// lib/utils/error-handling.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  AI_API_ERROR = 'AI_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class Logger {
  private static instance: Logger;
  private supabase = createClient();
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  async error(message: string, error?: Error, context?: any): Promise<void> {
    console.error(`[ERROR] ${message}`, error, context);
    
    await this.supabase
      .from('error_logs')
      .insert({
        level: 'error',
        message,
        error_details: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        context,
        timestamp: new Date().toISOString()
      });
  }

  async warn(message: string, context?: any): Promise<void> {
    console.warn(`[WARN] ${message}`, context);
    
    await this.supabase
      .from('error_logs')
      .insert({
        level: 'warn',
        message,
        context,
        timestamp: new Date().toISOString()
      });
  }

  async info(message: string, context?: any): Promise<void> {
    console.info(`[INFO] ${message}`, context);
    
    if (process.env.NODE_ENV === 'production') {
      await this.supabase
        .from('error_logs')
        .insert({
          level: 'info',
          message,
          context,
          timestamp: new Date().toISOString()
        });
    }
  }
}

// Global error handler
export function handleGlobalError(error: Error, context?: any): void {
  const logger = Logger.getInstance();
  
  if (error instanceof AppError) {
    if (error.isOperational) {
      logger.warn(error.message, { code: error.code, context });
    } else {
      logger.error(error.message, error, { code: error.code, context });
    }
  } else {
    logger.error('Unexpected error occurred', error, context);
  }
}
```

---

## 🎯 FINAL IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Supabase database setup and schema deployment
- [ ] Basic authentication with Google/Apple OAuth
- [ ] UI component library setup (shadcn/ui)
- [ ] Basic dashboard layout with navigation
- [ ] Tool framework and registry system

### Phase 2: Core Tools (Week 2-3)
- [ ] JSON Explorer tool implementation
  - [ ] JSON validation and formatting
  - [ ] VAST support and structure analysis
  - [ ] Diff comparison functionality
- [ ] File upload system with validation
- [ ] PDF processing pipeline for Bauplan Checker
- [ ] DIN Norms RAG system setup

### Phase 3: Advanced Features (Week 4-5)
- [ ] Bauplan Checker complete implementation
- [ ] Multi-Agent system framework
- [ ] Email Monitor agent implementation
- [ ] Agent scheduling and management
- [ ] Notification system (internal + email)

### Phase 4: Polish & Deployment (Week 6)
- [ ] Error handling and logging
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing suite implementation
- [ ] Production deployment to Vercel
- [ ] Domain configuration and SSL

### Post-Launch
- [ ] Monitoring and analytics setup
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Regular maintenance and updates

---

## 💡 FUTURE ENHANCEMENTS

### Additional Tools Ideas
1. **Document Converter**: Convert between PDF, Word, Excel formats
2. **Image Analyzer**: AI-powered image analysis and OCR
3. **Code Reviewer**: Automated code quality analysis
4. **Data Visualizer**: Create charts from CSV/JSON data
5. **Task Automation**: IFTTT-like automation workflows
6. **Financial Tracker**: Family expense tracking with AI categorization
7. **Travel Planner**: AI-assisted trip planning and optimization
8. **Recipe Manager**: Smart recipe organization with nutritional analysis

### Technical Improvements
1. **Real-time Collaboration**: Multiple users working on same documents
2. **Advanced Caching**: Redis-based caching for better performance
3. **Background Processing**: Queue system for heavy computations
4. **Mobile App**: React Native companion app
5. **API Versioning**: Support for external API access
6. **Plugin System**: Third-party plugin support
7. **Advanced Analytics**: Detailed usage analytics and insights
8. **Backup & Sync**: Automatic data backup and synchronization

This comprehensive briefing provides Cursor AI with everything needed to implement a professional, scalable Family Toolbox application. The detailed specifications cover all aspects from architecture to deployment, ensuring a smooth development process.
      