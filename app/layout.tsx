import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Lucas Da Silveira | Portfolio",
    template: "%s | ldasilveira.fr",
  },
  description: "Étudiant en informatique",
  openGraph: {
    title: "Lucas Da Silveira | Portfolio",
    description:
      "Étudiant en informatique",
    url: "https://ldasilveira.fr",
    siteName: "ldasilveira.fr",
    images: [
      {
        url: "https://portfolio-vert-nine-zszkg9biux.vercel.app/og.png",  
        width: 1920,
        height: 1080,
      },
    ],
    locale: "fr-FR",
    type: "website",
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
    shortcut: "/favicon.png",
  },
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
        <Analytics />
      </head>
      <body
        className={`bg-black ${process.env.NODE_ENV === "development" ? "debug-screens" : undefined
          }`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
