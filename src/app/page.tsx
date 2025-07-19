"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Users, Lock } from "lucide-react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router, mounted]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-700 shadow-lg">
              <Wrench className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Family <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Toolbox</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            KI-gestützte Tools für den Familienalltag. Automatisierung, Organisation und intelligente Lösungen - 
            alles in einer sicheren Umgebung für Ihre Familie.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800">
                  Zum Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800">
                  Anmelden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/tools">
              <Button variant="outline" size="lg">
                Tools ansehen
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
              <Wrench className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Intelligente Tools</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              KI-gestützte Lösungen für alltägliche Herausforderungen - von Dokumentenanalyse bis Automatisierung.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
              <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Für Familien</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Speziell entwickelt für Familienbedürfnisse - sicher, benutzerfreundlich und effektiv.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Sicher & Privat</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Ihre Daten bleiben sicher - mit modernster Verschlüsselung und Datenschutz-Standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}
