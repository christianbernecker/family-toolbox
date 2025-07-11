"use client";

import { Button } from "@/components/ui/button";
import { FileCheck, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  const tools = [
    {
      id: "bauplan-checker",
      name: "Bauplan Checker",
      description: "PDF-Bauplan-Validation gegen DIN-Normen mit RAG-System für präzise Compliance-Prüfung",
      icon: FileCheck,
      href: "/tools/bauplan-checker",
      color: "bg-blue-500",
      features: [
        "PDF-Upload und -Verarbeitung",
        "DIN-Normen Compliance-Prüfung",
        "RAG-basierte Analyse",
        "Detaillierte Validierungsberichte"
      ]
    },
    {
      id: "multi-agent",
      name: "Multi-Agent System",
      description: "Framework für Background-Agents mit Email-Monitoring und intelligenten Benachrichtigungen",
      icon: Bot,
      href: "/tools/multi-agent",
      color: "bg-purple-500",
      features: [
        "Email-Monitoring Agents",
        "Content-Zusammenfassung",
        "Automatische Benachrichtigungen",
        "Erweiterbare Agent-Architektur"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Tools
            </h1>
            <Link href="/dashboard">
              <Button variant="outline">Zurück zum Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verfügbare Tools
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Wählen Sie ein Tool aus, um loszulegen
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="h-2 bg-gradient-to-r from-red-500 to-red-700" />
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${tool.color}`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tool.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {tool.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Features:
                  </h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href={tool.href}>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-red-700">
                    Tool öffnen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 