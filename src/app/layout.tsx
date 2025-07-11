import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Toolbox",
  description: "AI-gestützte Web-Toolbox für die Familie mit modularer Plugin-Architektur, Multi-Agent-System und nahtloser Integration bestehender Tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
