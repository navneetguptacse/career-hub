import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12171F" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Career Hub — Job Application Tracker",
  description:
    "Track, organize, and automate job applications with Kanban boards, Telegram bot ingestion, and real-time career analytics.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Career Hub",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [
      {
        url: "/icons/icon_x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

const themeScript = `(function() {
  try {
    var stored = localStorage.getItem('careerhub_theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${robotoMono.variable} dark`}
    >
      <body className="min-h-screen font-sans antialiased selection:bg-[#3178C6] selection:text-white transition-colors duration-150">
        <Script
          id="careerhub-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <SessionProvider>
          <ThemeProvider>
            {children}
            <PwaRegister />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
