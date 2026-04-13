import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/elkonmix/Sidebar";
import { Header } from "@/components/elkonmix/Header";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <div className="print:hidden">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
              <div className="print:hidden">
                <Header />
              </div>
              <main className="flex-1 overflow-y-auto bg-muted/30 print:overflow-visible print:bg-white print:m-0 print:p-0">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
