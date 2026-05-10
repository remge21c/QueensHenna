import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/layout/Sidebar";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";
import InstallPrompt from "@/components/layout/InstallPrompt";
import "./globals.css";
import { Public_Sans, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-headline" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-numeric", weight: ["400", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "퀸즈헤나 고객관리 시스템",
  description: "퀸즈헤나 염색 전문점 고객 및 예약 관리 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "퀸즈헤나",
  },
  icons: {
    apple: [
      { url: "/icons/icon512_rounded.png", sizes: "512x512", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased", "font-sans", publicSans.variable, montserrat.variable)}
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-full flex flex-row bg-background text-foreground font-sans m-0 p-0 overflow-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold focus:shadow-lg"
        >
          본문 바로가기
        </a>
        <Sidebar />
        <BottomNav />
        <main id="main-content" className="flex-1 h-screen overflow-y-auto pt-14 md:pt-0 pb-16 md:pb-0">
          <div className="max-w-[1200px] mx-auto px-4 py-4 md:px-8 md:py-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <InstallPrompt />
      </body>
    </html>
  );
}
