# Family Toolbox - Fachliche Anforderungen (Basierend auf Diskussion)

## 1. PROJEKTÜBERSICHT

### 1.1 Grundkonzept
**Ziel:** Eine Art Toolbox für die Familie zur internen Verwendung für verschiedenste Aufgaben
**Zugang:** Browser-verfügbar, eigene Domain
**Budget:** Ca. 5€ pro Monat für Hosting
**Domain:** Präferenz .de, aber offen für andere

### 1.2 Benutzer & Zugriffsmodell
- **Anzahl:** 2-3 User
- **Rollen:** Alle Benutzer sind Admins (keine unterschiedlichen Rollen)
- **Tool-Zugang:** Tools können pro User aktiviert/deaktiviert werden
- **Authentication:** Google und/oder Apple Login gewünscht

---

## 2. KERNFUNKTIONEN & TOOLS

### 2.1 BAUPLAN-CHECKER

#### Basis-Anforderung
Integration des bestehenden Codes aus `/Users/christianbernecker/bauplan-checker` bzw. `https://github.com/christianbernecker/bauplan-checker`

#### Funktionale Anforderungen
- **Input:** PDF-Upload (Baupläne mit vielen Grafiken)
- **Verarbeitung:** 
  - Prüfung mit Hilfe der ChatGPT API
  - RAG-System gegen hinterlegte DIN-Normen-Vorlagen
  - Berücksichtigung der hochgeladenen grafischen Elemente
- **Output:** Validierungsreport mit Prüfergebnissen

#### Technische Integration
- Bestehenden Code sinnvoll in die neue Architektur integrieren
- Nicht neu entwickeln, sondern vorhandene Lösung adaptieren

### 2.2 JSON EXPLORER

#### Basis-Anforderung
**NICHT Teil der Toolbox**, aber visuell als Vorlage nutzen

#### Design-Referenz
- Screenshots als UI/UX-Vorlage für das Design der gesamten Toolbox
- **Farbschema-Anpassung:** Rote Farbverläufe statt der blauen aus den Screenshots
- Layout und Struktur als Inspiration für die Tool-Darstellung

#### Hinweis
Dieses Tool soll explizit NICHT implementiert werden, dient nur als Design-Referenz

### 2.3 MULTI-AGENT SYSTEM

#### Grundkonzept
Framework für verschiedene Background-Agents mit flexibler Erweiterbarkeit

#### Beispiel-Implementation: Email-Monitor + Summarizer
**Agent 1: Email-Überwachung**
- Überwachen der Mail-Eingänge
- Filterung relevanter Inhalte

**Agent 2: Content-Zusammenfassung**
- Zusammenfassung der wichtigsten Inhalte 
- Darstellung der Ergebnisse im UI

#### Systemanforderungen
- **Hintergrund-Ausführung:** Agents laufen automatisch im Hintergrund
- **Benachrichtigungen:** System soll Benachrichtigungen versenden können
- **Datensammlung:** Agents sollen Daten sammeln und speichern können
- **Erweiterbarkeit:** Weitere Agent-Typen sollen einfach hinzufügbar sein

#### Architektur-Flexibilität
- System soll so gestaltet sein, dass verschiedene Multi-Agent-Ideen umsetzbar sind
- Nicht auf das Email-Beispiel beschränkt

---

## 3. TECHNISCHE RAHMENBEDINGUNGEN

### 3.1 Plattform-Anforderungen
- **Browser-basiert:** Vollständig web-basierte Lösung
- **Responsive:** Funktioniert auf verschiedenen Geräten
- **Performance:** Auch bei größeren Dateien (PDFs) performant

### 3.2 Hosting & Infrastructure
- **Budget-Limit:** Circa 5€ monatlich
- **DSGVO:** Deutsche Server nicht zwingend notwendig
- **Domain:** .de bevorzugt, aber flexibel
- **Hosting-Präferenz:** Vernünftiger Preis-Leistungs-Anbieter

### 3.3 Integration & APIs
- **AI-Integration:** OpenAI und Claude API-Keys sind vorhanden
- **Authentication:** OAuth-Integration für Google und Apple
- **Bestehender Code:** Bauplan-Checker Code muss integriert werden

---

## 4. UI/UX ANFORDERUNGEN

### 4.1 Design-Vorgaben
- **Basis-Design:** Screenshots des JSON Explorers als Vorlage
- **Farbschema:** Rote Farbverläufe statt der blauen aus den Referenz-Screenshots
- **Layout:** Ähnliche Struktur wie in den bereitgestellten Screenshots
- **Professionalität:** Sauberes, professionelles Erscheinungsbild

### 4.2 Benutzerführung
- **Tool-Auswahl:** Zentrale Übersicht aller verfügbaren Tools
- **Navigation:** Einfache Navigation zwischen den verschiedenen Tools
- **Status-Anzeige:** Sichtbarkeit welche Tools für den User aktiviert sind

---

## 5. SYSTEM-ARCHITEKTUR ANFORDERUNGEN

### 5.1 Modularität
- **Plugin-System:** Tools sollen modular hinzufügbar sein
- **Erweiterbarkeit:** Neue Tools sollen leicht integrierbar sein
- **Tool-Management:** Einfache Aktivierung/Deaktivierung von Tools

### 5.2 Flexibilität
- **Agent-Framework:** Unterstützung verschiedener Agent-Typen
- **Konfigurierbarkeit:** Tools sollen konfigurierbar sein
- **Skalierbarkeit:** System soll mit zusätzlichen Tools wachsen können

---

## 6. NICHT-FUNKTIONALE ANFORDERUNGEN

### 6.1 Performance
- **Upload-Handling:** Große PDF-Dateien effizient verarbeiten
- **Response-Zeit:** Akzeptable Antwortzeiten für AI-Operationen
- **Caching:** Wiederverwendung von Ergebnissen wo sinnvoll

### 6.2 Sicherheit
- **Authentication:** Sichere OAuth-Integration
- **Dateisicherheit:** Sichere Handhabung von Upload-Dateien
- **API-Security:** Schutz der AI-API-Keys

### 6.3 Wartbarkeit
- **Code-Qualität:** Sauberer, erweiterbarer Code
- **Dokumentation:** Ausreichende Dokumentation für Erweiterungen
- **Updates:** Einfache Update-Möglichkeiten

---

## 7. AUSSCHLUSSKRITERIEN

### Was NICHT implementiert werden soll:
- **JSON Explorer als Tool:** Nur Design-Referenz, nicht als funktionales Tool
- **Komplexe Rechteverwaltung:** Alle User sind gleichberechtigt
- **Mobile App:** Browser-Version ist ausreichend
- **Komplexe Workflows:** Fokus auf einzelne, in sich geschlossene Tools

### Budgetbeschränkungen:
- **Hosting-Kosten:** Maximum 5€/Monat
- **Premium-Services:** Keine teuren externen APIs außer den vorhandenen AI-APIs
- **Complex Infrastructure:** Einfache, kostengünstige Lösungen bevorzugt