"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Users, Lock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to tools page
  useEffect(() => {
    if (session) {
      router.push('/tools');
    }
  }, [session, router]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-red-500 to-red-700 shadow-2xl shadow-red-500/25">
                  <Wrench className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Family
              </span>{" "}
              <span className="text-gray-900 dark:text-white">Toolbox</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Ihre private AI-gestützte Toolsammlung für die Familie.
              <br />
              <span className="text-lg text-gray-500 dark:text-gray-400">
                Intelligent, sicher und nur für Sie.
              </span>
            </p>

            {/* Login Card */}
            <div className="mx-auto max-w-md">
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-gray-900/5 dark:border-gray-700 dark:bg-gray-800/80 dark:shadow-black/20">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Familien-Zugang
                </h3>
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Melden Sie sich mit Ihrem Google-Konto an
                </p>
                
                <Link href="/auth/signin">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200"
                  >
                    <span className="mr-2">🔐</span>
                    Anmelden
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Nur für autorisierte Familienmitglieder • Sichere Anmeldung mit Google
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Was Sie erwartet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Leistungsstarke Tools für Ihre Familie
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Wrench className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Bauplan Checker
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                PDF-Bauplan-Validation gegen DIN-Normen mit AI-gestützter Compliance-Prüfung.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Multi-Agent System
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Intelligente Background-Agents für automatisierte Familienorganisation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
