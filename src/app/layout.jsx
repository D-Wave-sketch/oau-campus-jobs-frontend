import { Sora, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "OAU Campus Jobs",
  description: "Connecting Obafemi Awolowo University students with campus employers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
