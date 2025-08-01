import type { Metadata } from "next";
import { Inter as Geist, JetBrains_Mono as Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationContainer } from "@/components/NotificationContainer";
import MonitoringInitializer from "@/components/MonitoringInitializer";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Home Network Dashboard",
  description: "A unified web interface for managing OpenWrt routers and IoT devices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ErrorBoundary>
            <MonitoringInitializer />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <ResponsiveNavigation />
              <div className="lg:pl-72">
                {children}
              </div>
              <NotificationContainer />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
