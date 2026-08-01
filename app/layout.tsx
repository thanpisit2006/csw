import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { BlockedUserGuard } from "@/components/auth/blocked-user-guard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export const metadata: Metadata = {
  title: "Schedule Wallpaper",
  description: "A schedule wallpaper that fits perfectly. Designed to stay out of the way.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased overflow-x-hidden safe-area-padding">
        <Providers>
          <BlockedUserGuard>{children}</BlockedUserGuard>
          <Toaster position="bottom-center" toastOptions={{ duration: 1800 }} />
        </Providers>
      </body>
    </html>
  );
}
