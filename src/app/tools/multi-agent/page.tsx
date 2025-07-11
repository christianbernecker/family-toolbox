"use client";

import { Button } from "@/components/ui/button";
import { Bot, Mail, Bell, Cpu, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function MultiAgentPage() {
  const agentTypes = [
    {
      icon: Mail,
      name: "Email Monitor",
      description: "Überwacht E-Mail-Eingänge und filtert relevante Inhalte",
      status: "Geplant"
    },
    {
      icon: Cpu,
      name: "Content Summarizer", 
      description: "Erstellt automatische Zusammenfassungen wichtiger Inhalte",
      status: "Geplant"
    },
    {
      icon: Bell,
      name: "Notification Agent",
      description: "Versendet intelligente Benachrichtigungen an Familienmitglieder",
      status: "Geplant"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tools">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Multi-Agent System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button disabled variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agent erstellen
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500">
              <Bot className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Multi-Agent System
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Automatisierte Background-Agents für Email-Monitoring und Familienorganisation
          </p>
        </div>

        {/* Status */}
        <div className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  System Status
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Keine aktiven Agents
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-sm text-gray-500">Aktive Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Verfügbare Agent-Typen
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentTypes.map((agent, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <agent.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {agent.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Framework Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Framework Features
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Hintergrund-Ausführung
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Agents laufen automatisch im Hintergrund und führen geplante Aufgaben aus
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Intelligente Benachrichtigungen
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Automatische Benachrichtigungen basierend auf Agent-Ergebnissen
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Datensammlung
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Agents sammeln und speichern relevante Daten für die Familie
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Erweiterbare Architektur
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Einfache Hinzufügung neuer Agent-Typen je nach Familienbedarfs
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            In Entwicklung
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Das Multi-Agent Framework wird entwickelt mit Fokus auf Email-Monitoring
            und automatisierte Familienbenachrichtigungen.
          </p>
          <Button disabled className="bg-gray-300 dark:bg-gray-600">
            Noch nicht verfügbar
          </Button>
        </div>
      </main>
    </div>
  );
} 