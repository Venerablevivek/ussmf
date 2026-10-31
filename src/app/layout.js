import { JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { appUrl } from "@/server/env";
import IconSprite from "@/components/ui/IconSprite";
import { ToastProvider } from "@/components/ui/Toast";
import MotionProvider from "@/components/motion/MotionProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description =
  "The United States Sports Medicine Federation protects air-sports athletes with evidence-based medical review, injury prevention, rehabilitation and an official Medical Fitness Certificate.";

export const metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "U.S.S.M.F. Air Sports Medicine", template: "%s · U.S.S.M.F." },
  description,
  applicationName: "U.S.S.M.F.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "U.S.S.M.F.",
    title: "U.S.S.M.F. — Fit to Fly. Certified by Science.",
    description:
      "Apply for the U.S.S.M.F. Air Sports Medical Fitness Certificate, track your review and verify certificates online.",
  },
  twitter: {
    card: "summary",
    title: "U.S.S.M.F. — Fit to Fly. Certified by Science.",
    description:
      "Apply for the U.S.S.M.F. Air Sports Medical Fitness Certificate, track your review and verify certificates online.",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F9FF",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <IconSprite />
        <MotionProvider>
          <ToastProvider>
            <AuthProvider>
              <a href="#main" className="skip-link">
                Skip to content
              </a>
              <Header />
              <main id="main">{children}</main>
              <Footer />
            </AuthProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
