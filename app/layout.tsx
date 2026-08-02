import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { BlockedUserGuard } from "@/components/auth/blocked-user-guard";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://classbank.app";

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Class Bank | University Class Schedule",
    template: "%s | Class Bank",
  },
  description:
    "Class Bank allows university students to manage, design, and export custom high-resolution class schedule lock screen wallpapers and view official semester PDF schedules.",
  keywords: [
    "Class Bank",
    "Class Schedule",
    "University Schedule Wallpaper",
    "Student Schedule",
    "Lock Screen Wallpaper",
    "Timetable Generator",
    "Semester Schedule PDF",
  ],
  authors: [{ name: "Thanpisit Ritpetchnil" }],
  creator: "Thanpisit Ritpetchnil",
  publisher: "Class Bank",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Class Bank | University Class Schedule",
    description:
      "Design custom high-resolution class schedule lock screen wallpapers and access your official university class schedules cleanly.",
    siteName: "Class Bank",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Class Bank - University Class Schedule & Wallpaper Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Class Bank | University Class Schedule",
    description:
      "Design custom high-resolution class schedule lock screen wallpapers and access your official university class schedules cleanly.",
    images: ["/og-image.png"],
    creator: "@classbank",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Class Bank",
    alternateName: ["Class Bank App", "CSW Class Schedule"],
    url: siteUrl,
    description:
      "University class schedule management and custom lock screen wallpaper generator.",
    author: {
      "@type": "Person",
      name: "Thanpisit Ritpetchnil",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased overflow-x-hidden safe-area-padding">
        <Providers>
          <BlockedUserGuard>{children}</BlockedUserGuard>
          <Toaster position="bottom-center" toastOptions={{ duration: 1800 }} />
        </Providers>
      </body>
    </html>
  );
}
