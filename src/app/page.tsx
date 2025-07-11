"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-700">
                <Wrench className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Family Toolbox
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              AI-gestützte Web-Toolbox für die Familie mit modularer Plugin-Architektur, 
              Multi-Agent-System und nahtloser Integration bestehender Tools.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-700">
                  Zum Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline">
                  Tools erkunden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Leistungsstarke Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Alles was Sie für Ihre digitale Familie brauchen
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Bauplan Checker
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                PDF-Bauplan-Validation gegen DIN-Normen mit RAG-System für präzise Compliance-Prüfung. 
                Integration des bestehenden Bauplan-Checker Codes mit erweiterten AI-Features.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Multi-Agent System
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Framework für Background-Agents mit Email-Monitoring, Content-Zusammenfassung 
                und intelligenten Benachrichtigungen für automatisierte Familienorganisation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
