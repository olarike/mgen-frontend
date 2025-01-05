// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import WalletContextProvider from "./(providers)/WalletContextProvider";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Navigation from "./components/Navigation";

// Default wallet adapter UI styles
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MGEN Meme Competition",
  description: "An app to submit and vote for memes, powered by MGEN tokens",
  keywords: ["meme", "competition", "MGEN", "tokens", "Solana"],
  authors: [{ name: "MGEN Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletContextProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <div className="container mx-auto px-4 py-6">
                {children}
              </div>
              <footer className="border-t">
                <div className="container mx-auto px-4 py-6">
                  <p className="text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} MGEN Meme Competition. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}