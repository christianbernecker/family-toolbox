#!/bin/bash

# E-Mail Agent Tool Deployment Script
# Führt ein Staging-Deployment für das E-Mail Agent Tool durch

set -e

echo "🚀 Starting E-Mail Agent Tool Deployment..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    log_error "package.json nicht gefunden. Bitte führe das Script im Projekt-Root aus."
    exit 1
fi

# Prüfe Node.js Installation
if ! command -v node &> /dev/null; then
    log_error "Node.js ist nicht installiert."
    exit 1
fi

# Prüfe npm Installation
if ! command -v npm &> /dev/null; then
    log_error "npm ist nicht installiert."
    exit 1
fi

# Prüfe Netlify CLI
if ! command -v netlify &> /dev/null; then
    log_warning "Netlify CLI nicht gefunden. Installiere..."
    npm install -g netlify-cli
fi

log_info "Prüfe Projekt-Status..."

# Git Status prüfen
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Uncommitted Änderungen gefunden:"
    git status --short
    echo ""
    read -p "Möchtest du trotzdem fortfahren? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment abgebrochen."
        exit 0
    fi
fi

# Aktuelle Branch prüfen
CURRENT_BRANCH=$(git branch --show-current)
log_info "Aktueller Branch: $CURRENT_BRANCH"

# Dependencies installieren
log_info "Installiere Dependencies..."
npm install

# TypeScript prüfen
log_info "Prüfe TypeScript..."
npm run lint

# Build erstellen
log_info "Erstelle Production Build..."
npm run build

# Tests ausführen (falls vorhanden)
if [ -f "jest.config.js" ] || grep -q "test" package.json; then
    log_info "Führe Tests aus..."
    npm test
fi

# Staging Deployment
log_info "Starte Staging Deployment..."
npm run deploy:stage

log_success "Staging Deployment abgeschlossen!"
log_info "Staging URL: https://stage--family-toolbox.netlify.app/tools/email-agent"

# Production Deployment (automatisch)
log_info "Starte Production Deployment..."
npm run deploy:prod

log_success "Production Deployment abgeschlossen!"
log_info "Production URL: https://family-toolbox.netlify.app/tools/email-agent"

echo ""
log_success "🎉 E-Mail Agent Tool Deployment abgeschlossen!"
echo ""
log_info "Deployment URLs:"
echo "✅ Staging: https://stage--family-toolbox.netlify.app/tools/email-agent"
echo "✅ Production: https://family-toolbox.netlify.app/tools/email-agent"
echo ""
log_info "Nächste Schritte:"
echo "1. Prüfe beide Umgebungen auf Funktionalität"
echo "2. Teste die E-Mail-Agent-Funktionen"
echo "3. Konfiguriere E-Mail-Accounts in den Einstellungen"
echo "4. Führe den ersten E-Mail-Agent-Zyklus aus"
echo ""
log_info "Dokumentation: Siehe email_agents_briefing.md für Details" 