import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";
import { Public_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-headline" });

export const metadata: Metadata = {
  title: "퀸즈헤나 고객관리 시스템",
  description: "퀸즈헤나 염색 전문점 고객 및 예약 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased", "font-sans", publicSans.variable)}
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-full flex flex-row bg-background text-foreground font-sans m-0 p-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
