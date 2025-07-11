import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/providers";

export const metadata: Metadata = {
  title: "Family Toolbox",
  description: "AI-powered toolbox for family automation and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
