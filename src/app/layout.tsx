import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/elkonmix/Sidebar";
import { Header } from "@/components/elkonmix/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elkonmix-90 | SCADA System",
  description: "Interactive 3D Visualization & SCADA System for the Elkonmix-90 concrete mixing plant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-muted/30">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
