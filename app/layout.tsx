import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { PushNotificationsSetup } from "@/components/push-notifications-setup";
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
  title: {
    default: "CleanMate — Laundry & Dry-Cleaning Platform",
    template: "%s · CleanMate",
  },
  description:
    "CleanMate connects laundry businesses with customers—pickup, processing, payments, and delivery in one professional platform.",
  applicationName: "CleanMate",
  appleWebApp: {
    capable: true,
    title: "CleanMate",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#635bff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a3a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <FirebaseAnalytics />
        <PushNotificationsSetup />
        {children}
      </body>
    </html>
  );
}
