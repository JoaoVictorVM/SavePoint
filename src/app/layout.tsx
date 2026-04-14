import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SavePoint",
  description: "Organize sua jornada gamer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1F1E2C",
              color: "#F6F5FC",
              border: "1px solid #292735",
              borderRadius: "16px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              style: {
                borderLeft: "4px solid #2FE0AE",
              },
            },
            error: {
              style: {
                borderLeft: "4px solid #FF453A",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
