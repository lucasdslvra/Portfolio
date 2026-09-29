import "../global.css";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
	metadataBase: new URL("https://ldasilveira.fr"),
	title: {
		default: "Lucas Da Silveira - Portfolio | Étudiant en informatique",
		template: "%s | Lucas Da Silveira",
	},
	description:
		"Moi c'est Lucas Da Silveira, étudiant en informatique passionné de développement. Je crée des projets qui me passionnent, venez les découvrir !",
	applicationName: "Lucas Da Silveira",
	authors: [{ name: "Lucas Da Silveira", url: "https://ldasilveira.fr" }],
	creator: "Lucas Da Silveira",
	publisher: "Lucas Da Silveira",
	keywords: [
		"Lucas Da Silveira",
		"Lucas Da Silveira portfolio",
		"Lucas Da Silveira développeur",
		"ldasilveira",
		"lucasdslvra",
		"développeur web",
		"étudiant en informatique",
		"Next.js",
		"React",
		"TypeScript",
		"JavaScript",
		"Java",
		"PHP",
		"SQL",
		"Symfony",
		"HTML",
		"CSS",
		"Tailwind CSS",
		"Python",
		"PostgreSQL",
		"MongoDB",
		"Node.js"
	],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Lucas Da Silveira - Portfolio",
		description:
			"Moi c'est Lucas, étudiant en informatique passionné de développement. Découvrez mes projets, mon parcours et comment me contacter.",
		url: "https://ldasilveira.fr",
		siteName: "Lucas Da Silveira",
		images: [
			{
				url: "/og.png",
				width: 1920,
				height: 1080,
				alt: "Lucas Da Silveira _ Portfolio",
			},
		],
		locale: "fr_FR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Lucas Da Silveira - Portfolio",
		description:
			"Moi c'est Lucas, étudiant en informatique passionné de développement. Venez découvrir mes projets !",
		images: ["/og.png"],
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
	verification: {
		// Remplace par le code fourni par Google Search Console (balise HTML).
		google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
		<html lang="fr" className={[inter.variable, calSans.variable].join(" ")}>
			<head>
				<Analytics />
			</head>
			<body
				className={`bg-black ${
					process.env.NODE_ENV === "development" ? "debug-screens" : undefined
				}`}
			>
				{children}
				<SpeedInsights />
			</body>
		</html>
	);
}
